import { describe, expect, it } from "vitest";
import { StellarEncryptedPay } from "./index.js";

describe("StellarEncryptedPay (scaffold)", () => {
  it("constructs", () => {
    const sep = new StellarEncryptedPay({
      network: "testnet",
      rpcUrl: "https://soroban-testnet.stellar.org",
      networkPassphrase: "Test SDF Network ; September 2015",
      poolContractId: "CPOOL",
      verifierContractId: "CVER",
    });

    expect(sep.version()).toContain("scaffold");
  });
});
