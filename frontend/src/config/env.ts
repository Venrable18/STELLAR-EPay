/**
 * Environment Configuration
 * 
 * Loads and validates environment variables for the frontend.
 * Provides type-safe access to configuration across the app.
 */

interface EnvConfig {
  sorobanRpcUrl: string;
  poolContractId: string;
  verifierContractId: string;
  tokenId: string;
  networkPassphrase: string;
  apiBaseUrl: string;
  debug: boolean;
  env: "development" | "staging" | "production";
}

function getEnvVariable(key: string, defaultValue?: string): string {
  const value = import.meta.env[`VITE_${key}`];
  if (!value && !defaultValue) {
    console.warn(`Environment variable VITE_${key} is not set`);
  }
  return value || defaultValue || "";
}

export const config: EnvConfig = {
  sorobanRpcUrl: getEnvVariable(
    "SOROBAN_RPC_URL",
    "https://soroban-testnet.stellar.org"
  ),
  poolContractId: getEnvVariable("POOL_CONTRACT_ID"),
  verifierContractId: getEnvVariable("VERIFIER_CONTRACT_ID"),
  tokenId: getEnvVariable("TOKEN_ID"),
  networkPassphrase: getEnvVariable(
    "NETWORK_PASSPHRASE",
    "Test SDF Network ; September 2015"
  ),
  apiBaseUrl: getEnvVariable("API_BASE_URL", "http://localhost:3000"),
  debug: getEnvVariable("DEBUG", "false") === "true",
  env: (getEnvVariable("ENV", "development") as "development" | "staging" | "production"),
};

/**
 * Validate that all required contract IDs are configured
 */
export function validateConfig(): boolean {
  const required = ["poolContractId", "verifierContractId", "tokenId"];
  const missing = required.filter(
    (key) => !config[key as keyof EnvConfig]
  );

  if (missing.length > 0) {
    console.warn(
      "Missing required environment variables:",
      missing.map((k) => `VITE_${k.toUpperCase()}`).join(", ")
    );
    return false;
  }

  return true;
}

/**
 * Log configuration (redact sensitive values in production)
 */
export function logConfig(): void {
  if (config.debug) {
    console.log("STELLAR-EPay Configuration:", {
      ...config,
      poolContractId: config.poolContractId ? "***" : "(not set)",
      verifierContractId: config.verifierContractId ? "***" : "(not set)",
      tokenId: config.tokenId ? "***" : "(not set)",
    });
  }
}

export default config;
