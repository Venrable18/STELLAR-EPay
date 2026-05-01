# Smart Contracts - Function Reference

This document defines all functions for the two core smart contracts: `pool_contract` and `groth16_verifier`.

## Overview

```
pool_contract (15 functions)
├── Core Operations (4)
├── State Queries (7)
└── Internal Helpers (4)

groth16_verifier (5 functions)
├── Verification (3)
└── Configuration & Info (2)
```

---

## pool_contract

### Core Operations

#### 1. `init(token_id, verifier_id, tree_depth)`
**Purpose:** Initialize the pool with asset, verifier contract, and tree configuration.

**Parameters:**
- `token_id: Address` — SEP-41 token contract to accept as deposits
- `verifier_id: Address` — Groth16 verifier contract address
- `tree_depth: u32` — Merkle tree depth (e.g., 20 for 2^20 leaves)

**Returns:** None (or success indicator)

**Requires:**
- Must be called exactly once during deployment
- Caller must have admin/deployer privileges
- Token and verifier must be valid contract addresses

**Side Effects:**
- Initializes storage: `token_id`, `verifier_id`, `tree_depth`
- Sets `current_root` to initial tree root
- Initializes `spent_nullifiers` set (empty)
- Sets `pool_balance` to 0
- Sets `next_leaf_index` to 0

---

#### 2. `deposit(recipient_pubkey, amount, salt, commitment)`
**Purpose:** Accept public asset into pool and add commitment to Merkle tree.

**Parameters:**
- `recipient_pubkey: Vec<u8>` — Privacy public key of recipient (from SDK)
- `amount: u128` — Amount of tokens to deposit (in smallest units)
- `salt: Vec<u8>` — Random salt for commitment (from SDK)
- `commitment: Vec<u8>` — Poseidon hash of (amount, recipient_pubkey, salt)

**Returns:** `DepositResult { leaf_index: u64, new_root: Vec<u8> }`

**Requires:**
- Pool must be initialized
- `amount > 0`
- Caller must have authorized the pool to transfer `amount` of token
- Commitment must have valid length (Poseidon output size)

**Side Effects:**
- Transfers `amount` from caller to pool contract
- Inserts `commitment` into Merkle tree
- Updates `current_root`
- Increments `next_leaf_index`
- Increases `pool_balance` by `amount`

**Emits:** `DepositEvent { depositor, amount, leaf_index, commitment }`

---

#### 3. `transfer(proof, root, input_nullifier, output_commitment)`
**Purpose:** Verify transfer proof and update pool state for private transfer.

**Parameters:**
- `proof: Vec<u8>` — Groth16 proof (serialized)
- `root: Vec<u8>` — Merkle root that input note was proved against
- `input_nullifier: Vec<u8>` — Nullifier of input note being spent
- `output_commitment: Vec<u8>` — Commitment of output note

**Returns:** `TransferResult { success: bool }`

**Requires:**
- Root must exist in history (not stale)
- `input_nullifier` must not be in `spent_nullifiers` (prevent double-spend)
- Proof must be valid from `groth16_verifier.verify_transfer()`

**Side Effects:**
- Calls `groth16_verifier.verify_transfer(proof, [root, input_nullifier, output_commitment])`
- If verification passes:
  - Adds `input_nullifier` to `spent_nullifiers`
  - Inserts `output_commitment` into Merkle tree
  - Updates `current_root`
  - Increments `next_leaf_index`

**Emits:** `TransferEvent { input_nullifier, output_commitment, new_root }`

**Fails If:**
- Proof is invalid
- Nullifier already spent (replay protection)
- Root is not in valid history

---

#### 4. `withdraw(proof, root, nullifier, amount, recipient_address)`
**Purpose:** Verify withdrawal proof and release public asset to recipient.

**Parameters:**
- `proof: Vec<u8>` — Groth16 proof (serialized)
- `root: Vec<u8>` — Merkle root that note was proved against
- `nullifier: Vec<u8>` — Nullifier of note being withdrawn
- `amount: u128` — Amount to withdraw (in smallest units)
- `recipient_address: Address` — Stellar account receiving the withdrawal

**Returns:** `WithdrawResult { success: bool, amount_released: u128 }`

**Requires:**
- Root must exist in history
- `nullifier` must not be in `spent_nullifiers`
- Proof must be valid from `groth16_verifier.verify_withdraw()`
- `pool_balance >= amount` (sufficient liquidity)
- `recipient_address` must be a valid Stellar account

**Side Effects:**
- Calls `groth16_verifier.verify_withdraw(proof, [root, nullifier, amount, recipient_address])`
- If verification passes:
  - Adds `nullifier` to `spent_nullifiers`
  - Transfers `amount` from pool to `recipient_address`
  - Decreases `pool_balance` by `amount`

**Emits:** `WithdrawEvent { recipient_address, amount, nullifier }`

**Fails If:**
- Proof is invalid
- Nullifier already spent
- Root is stale
- Pool has insufficient balance

---

### State Queries

#### 5. `get_root()`
**Purpose:** Return current Merkle tree root.

**Parameters:** None

**Returns:** `Vec<u8>` — Current Merkle root

**Side Effects:** None (read-only)

---

#### 6. `is_nullifier_spent(nullifier: Vec<u8>)`
**Purpose:** Check if nullifier has been used to prevent double-spending.

**Parameters:**
- `nullifier: Vec<u8>` — Nullifier to check

**Returns:** `bool` — `true` if nullifier is in `spent_nullifiers`, `false` otherwise

**Side Effects:** None (read-only)

---

#### 7. `get_commitment_by_index(index: u64)`
**Purpose:** Retrieve commitment at specific tree index.

**Parameters:**
- `index: u64` — Leaf index in Merkle tree

**Returns:** `Option<Vec<u8>>` — Commitment at index, or None if index is out of bounds

**Side Effects:** None (read-only)

---

#### 8. `get_pool_balance()`
**Purpose:** Return total assets held in pool.

**Parameters:** None

**Returns:** `u128` — Total pool balance in smallest units of configured token

**Side Effects:** None (read-only)

---

#### 9. `get_token_id()`
**Purpose:** Return configured SEP-41 token contract address.

**Parameters:** None

**Returns:** `Address` — Token contract address

**Side Effects:** None (read-only)

---

#### 10. `get_verifier_id()`
**Purpose:** Return verifier contract address.

**Parameters:** None

**Returns:** `Address` — Verifier contract address

**Side Effects:** None (read-only)

---

#### 11. `get_tree_depth()`
**Purpose:** Return Merkle tree depth parameter.

**Parameters:** None

**Returns:** `u32` — Tree depth (e.g., 20 means 2^20 max leaves)

**Side Effects:** None (read-only)

---

### Internal Helpers

#### 12. `insert_commitment(commitment: Vec<u8>)`
**Purpose:** Add commitment to Merkle tree and compute new root (internal utility).

**Parameters:**
- `commitment: Vec<u8>` — Leaf value to insert

**Returns:** `(u64, Vec<u8>)` — Tuple of (leaf_index, new_root)

**Requires:**
- Merkle tree must not be full (next_leaf_index < 2^tree_depth)

**Side Effects:**
- Updates tree nodes storage
- Computes and stores new root
- Increments `next_leaf_index`

**Note:** This is an internal function; external callers use `deposit()` or `transfer()`.

---

#### 13. `add_nullifier(nullifier: Vec<u8>)`
**Purpose:** Mark nullifier as spent (internal utility).

**Parameters:**
- `nullifier: Vec<u8>` — Nullifier to add to spent set

**Returns:** None

**Side Effects:**
- Inserts nullifier into `spent_nullifiers` storage

**Note:** Called by `transfer()` and `withdraw()`.

---

#### 14. `validate_proof_inputs(proof_type: ProofType, public_inputs: Vec<Vec<u8>>)`
**Purpose:** Validate proof input structure before verification.

**Parameters:**
- `proof_type: ProofType` — One of `Deposit`, `Transfer`, `Withdraw`
- `public_inputs: Vec<Vec<u8>>` — Public inputs from proof

**Returns:** `bool` — `true` if valid, `false` otherwise

**Validates:**
- Correct number of inputs for proof type
- Input lengths match expected sizes
- No obviously invalid values

**Note:** This prevents malformed proofs from reaching the verifier.

---

#### 15. `version()`
**Purpose:** Return contract version string.

**Parameters:** None

**Returns:** `String` — Version string (e.g., "1.0.0")

**Side Effects:** None (read-only)

---

## groth16_verifier

### Verification

#### 1. `verify_deposit(proof: Vec<u8>, public_inputs: Vec<Vec<u8>>)`
**Purpose:** Verify deposit proof (commitment correctly formed).

**Parameters:**
- `proof: Vec<u8>` — Groth16 proof (serialized BN254 points)
- `public_inputs: Vec<Vec<u8>>` — Public inputs: `[commitment]`

**Returns:** `bool` — `true` if proof is valid, `false` otherwise

**Public Inputs Expected:**
- `public_inputs[0]` = `commitment` (Poseidon hash output)

**Verifies:**
- `commitment = Poseidon(amount, owner_pubkey, salt)`
- (Proof structure is sound for BN254 / Groth16)

**Side Effects:** None (read-only verification)

---

#### 2. `verify_transfer(proof: Vec<u8>, public_inputs: Vec<Vec<u8>>)`
**Purpose:** Verify transfer proof (ownership + state transitions).

**Parameters:**
- `proof: Vec<u8>` — Groth16 proof (serialized BN254 points)
- `public_inputs: Vec<Vec<u8>>` — Public inputs: `[root, input_nullifier, output_commitment]`

**Returns:** `bool` — `true` if proof is valid, `false` otherwise

**Public Inputs Expected:**
- `public_inputs[0]` = `root` (Merkle root at time of proof generation)
- `public_inputs[1]` = `input_nullifier` (derived from input note)
- `public_inputs[2]` = `output_commitment` (new note commitment)

**Verifies:**
- Input note exists under the provided root (Merkle path is valid)
- Prover owns the input note (owner_secret matches)
- Nullifier is correctly derived
- Output note is correctly formed
- Transfer constraints are satisfied (amounts match, no inflation)

**Side Effects:** None (read-only verification)

---

#### 3. `verify_withdraw(proof: Vec<u8>, public_inputs: Vec<Vec<u8>>)`
**Purpose:** Verify withdrawal proof (note ownership + amount).

**Parameters:**
- `proof: Vec<u8>` — Groth16 proof (serialized BN254 points)
- `public_inputs: Vec<Vec<u8>>` — Public inputs: `[root, nullifier, amount, recipient_address]`

**Returns:** `bool` — `true` if proof is valid, `false` otherwise

**Public Inputs Expected:**
- `public_inputs[0]` = `root` (Merkle root at time of proof generation)
- `public_inputs[1]` = `nullifier` (derived from note)
- `public_inputs[2]` = `amount` (withdrawal amount in smallest units)
- `public_inputs[3]` = `recipient_address` (Stellar account receiving funds)

**Verifies:**
- Note exists under the provided root (Merkle path is valid)
- Prover owns the note (owner_secret matches)
- Nullifier is correctly derived
- Withdrawal amount matches the note amount
- Recipient address is correctly included in proof

**Side Effects:** None (read-only verification)

---

### Configuration & Info

#### 4. `get_verification_key()`
**Purpose:** Return embedded verification key (or key ID for lookup).

**Parameters:** None

**Returns:** `Vec<u8>` or `Vec<VerificationKeyComponent>` — Embedded Groth16 verification key

**Note:** The VK must be generated from the circuit compilation and embedded at deployment time. This function allows the pool contract (or SDK) to retrieve it for off-chain verification if needed.

**Side Effects:** None (read-only)

---

#### 5. `version()`
**Purpose:** Return contract version string.

**Parameters:** None

**Returns:** `String` — Version string (e.g., "1.0.0")

**Side Effects:** None (read-only)

---

## Storage Schema

### pool_contract Storage

```
token_id: Address
verifier_id: Address
tree_depth: u32
current_root: Vec<u8>
next_leaf_index: u64
pool_balance: u128

tree_nodes: Map<u64, Vec<u8>>        // leaf_index → commitment
spent_nullifiers: Set<Vec<u8>>       // set of used nullifiers
root_history: Map<u64, Vec<u8>>      // block → root (for staleness checks)
```

### groth16_verifier Storage

```
verification_key: Vec<u8>            // Embedded Groth16 VK
verification_key_deposit: Vec<u8>    // Optional: per-circuit VKs
verification_key_transfer: Vec<u8>
verification_key_withdraw: Vec<u8>
```

---

## Events

### pool_contract Events

- `DepositEvent { depositor: Address, amount: u128, leaf_index: u64, commitment: Vec<u8> }`
- `TransferEvent { input_nullifier: Vec<u8>, output_commitment: Vec<u8>, new_root: Vec<u8> }`
- `WithdrawEvent { recipient_address: Address, amount: u128, nullifier: Vec<u8> }`

---

## Error Codes

### pool_contract Errors

- `NOT_INITIALIZED` — Pool has not been initialized yet
- `ALREADY_INITIALIZED` — Pool already initialized (init called twice)
- `INVALID_AMOUNT` — Deposit amount is zero or exceeds balance
- `PROOF_VERIFICATION_FAILED` — Groth16 proof verification returned false
- `NULLIFIER_ALREADY_SPENT` — Replay attack attempt (nullifier reused)
- `INVALID_ROOT` — Provided root is not in valid history
- `TREE_FULL` — Merkle tree has reached maximum capacity
- `INSUFFICIENT_POOL_BALANCE` — Pool cannot cover withdrawal amount
- `INVALID_INPUT_FORMAT` — Public inputs have wrong length or type

### groth16_verifier Errors

- `PROOF_INVALID` — BN254 pairing verification failed
- `INVALID_PUBLIC_INPUTS` — Public inputs have wrong format
- `INVALID_PROOF_FORMAT` — Proof cannot be parsed

---

## Implementation Notes

1. **Proof Serialization:** Proofs must be serialized in a standard format (e.g., little-endian BN254 points).

2. **Public Input Ordering:** Public input order is critical and must match circuit specification exactly.

3. **Root History:** Keep a bounded history of roots (e.g., last 256 blocks) to allow some staleness tolerance without allowing arbitrarily old proofs.

4. **Merkle Tree:** Use Poseidon hash for efficiency in Soroban. Tree nodes should be stored indexed by leaf position.

5. **Nullifier Set:** Use a Set or Map for O(1) spent lookup. Consider using a Bloom filter if space is a concern.

6. **Reentrancy:** Ensure no reentrancy issues during token transfers or cross-contract calls.

---

## Cross-Contract Calls

### pool_contract → groth16_verifier

- `groth16_verifier.verify_deposit(proof, [commitment])`
- `groth16_verifier.verify_transfer(proof, [root, input_nullifier, output_commitment])`
- `groth16_verifier.verify_withdraw(proof, [root, nullifier, amount, recipient_address])`

### pool_contract → SEP-41 Token

- `token.transfer_from(from: Address, to: Address, amount: u128)`
- `token.transfer(to: Address, amount: u128)`
- (Standard SEP-41 interface)

---

## References

- [ZK Circuits Specification](./ZK_CIRCUITS.md)
- [Protocol Privacy Model](./PROTOCOL.md)
- [SDK Integration](../sdk/README.md)
