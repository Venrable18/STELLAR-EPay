#![no_std]

use soroban_sdk::{contract, contractimpl, symbol_short, Address, Bytes, Env, Symbol, Vec, Map, IntoVal, FromVal};

// Storage keys
const KEY_TOKEN_ID: Symbol = symbol_short!("token");
const KEY_VERIFIER_ID: Symbol = symbol_short!("verif");
const KEY_TREE_DEPTH: Symbol = symbol_short!("depth");
const KEY_CURRENT_ROOT: Symbol = symbol_short!("root");
const KEY_NEXT_LEAF_INDEX: Symbol = symbol_short!("next");
const KEY_POOL_BALANCE: Symbol = symbol_short!("bal");
const KEY_TREE_NODES: Symbol = symbol_short!("nodes");
const KEY_SPENT_NULLIFIERS: Symbol = symbol_short!("null");

/// Deposit result returned from deposit function.
pub struct DepositResult {
    pub leaf_index: u64,
    pub new_root: Bytes,
}

/// Soroban pool contract for private payments.
#[contract]
pub struct PoolContract;

#[contractimpl]
impl PoolContract {
    /// Initialize the pool with token, verifier, and tree configuration.
    pub fn init(env: Env, token_id: Address, verifier_id: Address, tree_depth: u32) {
        // Check if already initialized
        if env.storage().persistent().has(&KEY_TOKEN_ID) {
            panic!("Pool already initialized");
        }

        // Validate inputs
        if tree_depth == 0 || tree_depth > 32 {
            panic!("Invalid tree depth");
        }

        // Store configuration
        env.storage().persistent().set(&KEY_TOKEN_ID, &token_id);
        env.storage().persistent().set(&KEY_VERIFIER_ID, &verifier_id);
        env.storage().persistent().set(&KEY_TREE_DEPTH, &tree_depth);

        // Initialize pool state
        let initial_root = Bytes::new(&env);
        env.storage().persistent().set(&KEY_CURRENT_ROOT, &initial_root);
        env.storage().persistent().set(&KEY_NEXT_LEAF_INDEX, &0u64);
        env.storage().persistent().set(&KEY_POOL_BALANCE, &0u128);

        // Initialize empty tree nodes storage
        let empty_nodes: Map<u64, Bytes> = Map::new(&env);
        env.storage().persistent().set(&KEY_TREE_NODES, &empty_nodes);

        // Initialize empty spent nullifiers storage
        let empty_nullifiers: Vec<Bytes> = Vec::new(&env);
        env.storage().persistent().set(&KEY_SPENT_NULLIFIERS, &empty_nullifiers);
    }

    /// Deposit public asset into pool and add commitment to Merkle tree.
    pub fn deposit(env: Env, amount: u128, commitment: Bytes) -> DepositResult {
        // Verify pool is initialized
        if !env.storage().persistent().has(&KEY_TOKEN_ID) {
            panic!("Pool not initialized");
        }

        // Validate inputs
        if amount == 0 {
            panic!("Deposit amount must be greater than zero");
        }

        if commitment.len() != 32 {
            panic!("Invalid commitment length");
        }

        // Get caller
        let caller = env.invoker();

        // Get token contract
        let token_id: Address = env.storage().persistent().get(&KEY_TOKEN_ID).unwrap();

        // Transfer tokens from caller to pool
        let token_client = soroban_sdk::token::Client::new(&env, &token_id);
        token_client.transfer_from(&caller, &env.current_contract_address(), &amount);

        // Insert commitment into tree
        let mut tree_nodes: Map<u64, Bytes> = env.storage().persistent().get(&KEY_TREE_NODES).unwrap();
        let mut next_index: u64 = env.storage().persistent().get(&KEY_NEXT_LEAF_INDEX).unwrap();

        tree_nodes.set(next_index, commitment.clone());
        env.storage().persistent().set(&KEY_TREE_NODES, &tree_nodes);

        // Update pool balance
        let mut pool_balance: u128 = env.storage().persistent().get(&KEY_POOL_BALANCE).unwrap();
        pool_balance = pool_balance.checked_add(amount).unwrap();
        env.storage().persistent().set(&KEY_POOL_BALANCE, &pool_balance);

        // For v1, use commitment as new root (full tree recompute in v1.1)
        let new_root = commitment.clone();
        env.storage().persistent().set(&KEY_CURRENT_ROOT, &new_root);

        // Increment leaf index
        next_index = next_index.checked_add(1).unwrap();
        env.storage().persistent().set(&KEY_NEXT_LEAF_INDEX, &next_index);

        DepositResult {
            leaf_index: next_index - 1,
            new_root,
        }
    }

    /// Verify transfer proof and update pool state for private transfer.
    pub fn transfer(env: Env, proof: Bytes, root: Bytes, input_nullifier: Bytes, output_commitment: Bytes) -> bool {
        // Verify pool is initialized
        if !env.storage().persistent().has(&KEY_TOKEN_ID) {
            panic!("Pool not initialized");
        }

        // Check nullifier is not already spent
        let spent_nullifiers: Vec<Bytes> = env.storage().persistent().get(&KEY_SPENT_NULLIFIERS).unwrap();
        for nullifier in &spent_nullifiers {
            if nullifier == &input_nullifier {
                panic!("Nullifier already spent");
            }
        }

        // Get verifier contract
        let verifier_id: Address = env.storage().persistent().get(&KEY_VERIFIER_ID).unwrap();
        
        // Call verifier contract to verify transfer proof
        let mut public_inputs: Vec<Bytes> = Vec::new(&env);
        public_inputs.push_back(root.clone());
        public_inputs.push_back(input_nullifier.clone());
        public_inputs.push_back(output_commitment.clone());

        let is_valid: bool = env.invoke_contract(
            &verifier_id,
            &symbol_short!("verify_transfer"),
            Vec::from_array(&env, [proof.into_val(&env), public_inputs.into_val(&env)]),
        );

        if !is_valid {
            panic!("Invalid transfer proof");
        }

        // Add nullifier to spent set
        let mut spent_nullifiers: Vec<Bytes> = env.storage().persistent().get(&KEY_SPENT_NULLIFIERS).unwrap();
        spent_nullifiers.push_back(input_nullifier);
        env.storage().persistent().set(&KEY_SPENT_NULLIFIERS, &spent_nullifiers);

        // Insert output commitment into tree
        let mut tree_nodes: Map<u64, Bytes> = env.storage().persistent().get(&KEY_TREE_NODES).unwrap();
        let mut next_index: u64 = env.storage().persistent().get(&KEY_NEXT_LEAF_INDEX).unwrap();

        tree_nodes.set(next_index, output_commitment.clone());
        env.storage().persistent().set(&KEY_TREE_NODES, &tree_nodes);

        // Update root (for v1, use output commitment as new root)
        env.storage().persistent().set(&KEY_CURRENT_ROOT, &output_commitment);

        // Increment leaf index
        next_index = next_index.checked_add(1).unwrap();
        env.storage().persistent().set(&KEY_NEXT_LEAF_INDEX, &next_index);

        true
    }

    /// Verify withdrawal proof and release public asset to recipient.
    pub fn withdraw(env: Env, proof: Bytes, root: Bytes, nullifier: Bytes, amount: u128, recipient_address: Address) -> bool {
        // Verify pool is initialized
        if !env.storage().persistent().has(&KEY_TOKEN_ID) {
            panic!("Pool not initialized");
        }

        // Check nullifier is not already spent
        let spent_nullifiers: Vec<Bytes> = env.storage().persistent().get(&KEY_SPENT_NULLIFIERS).unwrap();
        for null in &spent_nullifiers {
            if null == &nullifier {
                panic!("Nullifier already spent");
            }
        }

        // Check pool has sufficient balance
        let pool_balance: u128 = env.storage().persistent().get(&KEY_POOL_BALANCE).unwrap();
        if pool_balance < amount {
            panic!("Insufficient pool balance");
        }

        // Get verifier contract
        let verifier_id: Address = env.storage().persistent().get(&KEY_VERIFIER_ID).unwrap();
        
        // Call verifier contract to verify withdraw proof
        let mut public_inputs: Vec<Bytes> = Vec::new(&env);
        public_inputs.push_back(root);
        public_inputs.push_back(nullifier.clone());
        public_inputs.push_back(Bytes::from_array(&env, &amount.to_le_bytes()));

        let is_valid: bool = env.invoke_contract(
            &verifier_id,
            &symbol_short!("verify_withdraw"),
            Vec::from_array(&env, [proof.into_val(&env), public_inputs.into_val(&env)]),
        );

        if !is_valid {
            panic!("Invalid withdrawal proof");
        }

        // Add nullifier to spent set
        let mut spent_nullifiers: Vec<Bytes> = env.storage().persistent().get(&KEY_SPENT_NULLIFIERS).unwrap();
        spent_nullifiers.push_back(nullifier);
        env.storage().persistent().set(&KEY_SPENT_NULLIFIERS, &spent_nullifiers);

        // Transfer tokens from pool to recipient
        let token_id: Address = env.storage().persistent().get(&KEY_TOKEN_ID).unwrap();
        let token_client = soroban_sdk::token::Client::new(&env, &token_id);
        token_client.transfer(&recipient_address, &amount);

        // Update pool balance
        let new_balance = pool_balance.checked_sub(amount).unwrap();
        env.storage().persistent().set(&KEY_POOL_BALANCE, &new_balance);

        true
    }

    /// Return current Merkle tree root.
    pub fn get_root(env: Env) -> Bytes {
        if !env.storage().persistent().has(&KEY_TOKEN_ID) {
            panic!("Pool not initialized");
        }

        env.storage().persistent().get(&KEY_CURRENT_ROOT).unwrap()
    }

    /// Check if nullifier has been spent (prevent double-spending).
    pub fn is_nullifier_spent(env: Env, nullifier: Bytes) -> bool {
        if !env.storage().persistent().has(&KEY_TOKEN_ID) {
            panic!("Pool not initialized");
        }

        let spent_nullifiers: Vec<Bytes> = env.storage().persistent().get(&KEY_SPENT_NULLIFIERS).unwrap();
        for null in &spent_nullifiers {
            if null == &nullifier {
                return true;
            }
        }
        false
    }

    /// Return configured SEP-41 token contract address.
    pub fn get_token_id(env: Env) -> Address {
        if !env.storage().persistent().has(&KEY_TOKEN_ID) {
            panic!("Pool not initialized");
        }

        env.storage().persistent().get(&KEY_TOKEN_ID).unwrap()
    }

    /// Return verifier contract address.
    pub fn get_verifier_id(env: Env) -> Address {
        if !env.storage().persistent().has(&KEY_TOKEN_ID) {
            panic!("Pool not initialized");
        }

        env.storage().persistent().get(&KEY_VERIFIER_ID).unwrap()
    }

    /// Return Merkle tree depth parameter.
    pub fn get_tree_depth(env: Env) -> u32 {
        if !env.storage().persistent().has(&KEY_TOKEN_ID) {
            panic!("Pool not initialized");
        }

        env.storage().persistent().get(&KEY_TREE_DEPTH).unwrap()
    }

    /// Add commitment to Merkle tree and compute new root (internal utility).
    pub fn insert_commitment(env: Env, commitment: Bytes) -> (u64, Bytes) {
        if !env.storage().persistent().has(&KEY_TOKEN_ID) {
            panic!("Pool not initialized");
        }

        if commitment.len() != 32 {
            panic!("Invalid commitment length");
        }

        let tree_depth: u32 = env.storage().persistent().get(&KEY_TREE_DEPTH).unwrap();
        let mut next_index: u64 = env.storage().persistent().get(&KEY_NEXT_LEAF_INDEX).unwrap();

        // Check tree is not full
        let max_leaves = 1u64 << tree_depth;
        if next_index >= max_leaves {
            panic!("Merkle tree is full");
        }

        // Insert commitment into tree
        let mut tree_nodes: Map<u64, Bytes> = env.storage().persistent().get(&KEY_TREE_NODES).unwrap();
        tree_nodes.set(next_index, commitment.clone());
        env.storage().persistent().set(&KEY_TREE_NODES, &tree_nodes);

        // Update current root to new commitment (simplified for v1)
        let new_root = commitment.clone();
        env.storage().persistent().set(&KEY_CURRENT_ROOT, &new_root);

        // Increment leaf index
        let leaf_index = next_index;
        next_index = next_index.checked_add(1).unwrap();
        env.storage().persistent().set(&KEY_NEXT_LEAF_INDEX, &next_index);

        (leaf_index, new_root)
    }

    /// Mark nullifier as spent (internal utility).
    pub fn add_nullifier(env: Env, nullifier: Bytes) {
        if !env.storage().persistent().has(&KEY_TOKEN_ID) {
            panic!("Pool not initialized");
        }

        let mut spent_nullifiers: Vec<Bytes> = env.storage().persistent().get(&KEY_SPENT_NULLIFIERS).unwrap();
        spent_nullifiers.push_back(nullifier);
        env.storage().persistent().set(&KEY_SPENT_NULLIFIERS, &spent_nullifiers);
    }

    /// Retrieve commitment at specific tree index.
    pub fn get_commitment_by_index(env: Env, index: u64) -> Option<Bytes> {
        if !env.storage().persistent().has(&KEY_TOKEN_ID) {
            panic!("Pool not initialized");
        }

        let tree_nodes: Map<u64, Bytes> = env.storage().persistent().get(&KEY_TREE_NODES).unwrap();
        tree_nodes.get(index)
    }

    /// Return total assets held in pool.
    pub fn get_pool_balance(env: Env) -> u128 {
        if !env.storage().persistent().has(&KEY_TOKEN_ID) {
            panic!("Pool not initialized");
        }

        env.storage().persistent().get(&KEY_POOL_BALANCE).unwrap()
    }

    /// Validate proof input structure before verification.
    pub fn validate_proof_inputs(env: Env, proof_type: u32, public_inputs: Vec<Bytes>) -> bool {
        // proof_type: 0 = Deposit, 1 = Transfer, 2 = Withdraw
        
        match proof_type {
            0 => {
                // Deposit proof requires 1 input: [commitment]
                if public_inputs.len() != 1 {
                    return false;
                }
                if public_inputs.get(0).unwrap().len() != 32 {
                    return false;
                }
                true
            }
            1 => {
                // Transfer proof requires 3 inputs: [root, input_nullifier, output_commitment]
                if public_inputs.len() != 3 {
                    return false;
                }
                if public_inputs.get(0).unwrap().len() != 32 {
                    return false;
                }
                if public_inputs.get(1).unwrap().len() != 32 {
                    return false;
                }
                if public_inputs.get(2).unwrap().len() != 32 {
                    return false;
                }
                true
            }
            2 => {
                // Withdraw proof requires 4 inputs: [root, nullifier, amount, recipient_address]
                if public_inputs.len() != 4 {
                    return false;
                }
                if public_inputs.get(0).unwrap().len() != 32 {
                    return false;
                }
                if public_inputs.get(1).unwrap().len() != 32 {
                    return false;
                }
                if public_inputs.get(2).unwrap().len() != 8 {
                    return false;
                }
                if public_inputs.get(3).unwrap().len() != 32 {
                    return false;
                }
                true
            }
            _ => false,
        }
    }

    /// Protocol / build identifier for smoke tests and deployments.
    pub fn version(_env: Env) -> u32 {
        1
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn version_is_nonzero() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PoolContract);
        let client = PoolContractClient::new(&env, &contract_id);
        assert_eq!(client.version(), 1);
    }
}
