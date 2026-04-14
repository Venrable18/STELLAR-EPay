#![no_std]

use soroban_sdk::{contract, contractimpl, Env};

/// Soroban pool contract scaffold.
///
/// v1 logic (`deposit`, private `transfer`, `withdraw`) will be implemented here.
#[contract]
pub struct PoolContract;

#[contractimpl]
impl PoolContract {
    /// Protocol / build identifier for smoke tests and deployments.
    pub fn version(_env: Env) -> u32 {
        1
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::PoolContractClient;
    use soroban_sdk::Env;

    #[test]
    fn version_is_nonzero() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PoolContract);
        let client = PoolContractClient::new(&env, &contract_id);
        assert_eq!(client.version(), 1);
    }
}
