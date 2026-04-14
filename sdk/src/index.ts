/**
 * TypeScript SDK scaffold for Stellar-EncryptedPay.
 *
 * Implement `deposit`, private `transfer`, and `withdraw` flows here.
 */

export type StellarEncryptedPayConfig = {
  network: "local" | "testnet" | "mainnet";
  rpcUrl: string;
  networkPassphrase: string;
  poolContractId: string;
  verifierContractId: string;
};

export class StellarEncryptedPay {
  constructor(public readonly config: StellarEncryptedPayConfig) {}

  version(): string {
    return "0.0.0-scaffold";
  }
}
