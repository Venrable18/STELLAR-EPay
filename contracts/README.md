# Soroban contracts

MVP contracts:

- `pool_contract` — pool state, commitments, nullifiers, user entrypoints
- `groth16_verifier` — proof verification only

Build for Soroban:

```bash
cargo build --release --target wasm32-unknown-unknown
```
