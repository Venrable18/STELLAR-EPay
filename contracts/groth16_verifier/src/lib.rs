#![no_std]

use soroban_sdk::{contract, contractimpl, Env};

/// On-chain Groth16 verifier scaffold.
///
/// Proof verification and embedded VK modules will live here.
#[contract]
pub struct Groth16Verifier;

#[contractimpl]
impl Groth16Verifier {
    pub fn version(_env: Env) -> u32 {
        1
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::Groth16VerifierClient;
    use soroban_sdk::Env;

    #[test]
    fn version_is_nonzero() {
        let env = Env::default();
        let contract_id = env.register_contract(None, Groth16Verifier);
        let client = Groth16VerifierClient::new(&env, &contract_id);
        assert_eq!(client.version(), 1);
    }
}
