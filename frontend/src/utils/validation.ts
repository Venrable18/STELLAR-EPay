/**
 * Form Validation Helpers
 * Reusable validation functions for STELLAR-EPay frontend forms
 */

/**
 * Validates that amount is a positive number
 */
export function validateAmount(amount: string): { valid: boolean; error?: string } {
  if (!amount || amount.trim() === "") {
    return { valid: false, error: "Amount is required" };
  }

  const parsed = parseFloat(amount);
  if (isNaN(parsed)) {
    return { valid: false, error: "Amount must be a valid number" };
  }

  if (parsed <= 0) {
    return { valid: false, error: "Amount must be greater than 0" };
  }

  if (parsed > 999999999) {
    return { valid: false, error: "Amount is too large" };
  }

  return { valid: true };
}

/**
 * Validates that amount does not exceed maximum
 */
export function validateAmountWithMax(
  amount: string,
  max: string
): { valid: boolean; error?: string } {
  const amountCheck = validateAmount(amount);
  if (!amountCheck.valid) {
    return amountCheck;
  }

  const maxNum = parseFloat(max);
  const amountNum = parseFloat(amount);

  if (amountNum > maxNum) {
    return { valid: false, error: `Amount cannot exceed ${max}` };
  }

  return { valid: true };
}

/**
 * Validates Stellar account address (base32 format, starts with G, 56 characters)
 */
export function validateStellarAddress(address: string): { valid: boolean; error?: string } {
  if (!address || address.trim() === "") {
    return { valid: false, error: "Stellar address is required" };
  }

  const trimmed = address.trim();

  if (!trimmed.startsWith("G")) {
    return { valid: false, error: "Stellar address must start with 'G'" };
  }

  if (trimmed.length !== 56) {
    return { valid: false, error: "Stellar address must be 56 characters long" };
  }

  // Check if all characters are valid base32
  const base32Regex = /^G[A-Z2-7]{55}$/;
  if (!base32Regex.test(trimmed)) {
    return { valid: false, error: "Invalid Stellar address format" };
  }

  return { valid: true };
}

/**
 * Validates privacy public key (hex string, at least 32 chars)
 */
export function validatePrivacyPublicKey(key: string): { valid: boolean; error?: string } {
  if (!key || key.trim() === "") {
    return { valid: false, error: "Privacy public key is required" };
  }

  const trimmed = key.trim();

  if (trimmed.length < 32) {
    return { valid: false, error: "Privacy public key must be at least 32 characters" };
  }

  if (trimmed.length > 256) {
    return { valid: false, error: "Privacy public key is too long" };
  }

  return { valid: true };
}

/**
 * Validates commitment hash (hex string, 64 or 66 chars with 0x prefix)
 */
export function validateCommitment(commitment: string): { valid: boolean; error?: string } {
  if (!commitment || commitment.trim() === "") {
    return { valid: false, error: "Commitment is required" };
  }

  const trimmed = commitment.trim();
  const hexRegex = /^(0x)?[0-9a-fA-F]+$/;

  if (!hexRegex.test(trimmed)) {
    return { valid: false, error: "Commitment must be a valid hex string" };
  }

  const cleanHex = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  if (cleanHex.length !== 64) {
    return { valid: false, error: "Commitment must be 64 hex characters (256 bits)" };
  }

  return { valid: true };
}

/**
 * Validates proof (hex string, minimum length)
 */
export function validateProof(proof: string): { valid: boolean; error?: string } {
  if (!proof || proof.trim() === "") {
    return { valid: false, error: "Proof is required" };
  }

  const trimmed = proof.trim();
  const hexRegex = /^(0x)?[0-9a-fA-F]+$/;

  if (!hexRegex.test(trimmed)) {
    return { valid: false, error: "Proof must be a valid hex string" };
  }

  const cleanHex = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  if (cleanHex.length < 64) {
    return { valid: false, error: "Proof format invalid" };
  }

  return { valid: true };
}

/**
 * Validates that a selection has been made
 */
export function validateSelection(
  value: string | null | undefined,
  fieldName: string
): { valid: boolean; error?: string } {
  if (!value) {
    return { valid: false, error: `Please select a ${fieldName}` };
  }

  return { valid: true };
}

/**
 * Combines multiple validation results into one
 */
export function combineValidations(
  results: Array<{ valid: boolean; error?: string }>
): { valid: boolean; error?: string } {
  for (const result of results) {
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}

/**
 * Type definitions for form state
 */
export interface FormState {
  [key: string]: string | null;
}

/**
 * Type definitions for form errors
 */
export interface FormErrors {
  [key: string]: string | null;
}

/**
 * Validates all fields in a form at once
 */
export function validateForm(
  formData: FormState,
  validators: Record<string, (value: string) => { valid: boolean; error?: string }>
): FormErrors {
  const errors: FormErrors = {};

  for (const [field, validator] of Object.entries(validators)) {
    const value = formData[field];
    if (value === null || value === undefined) {
      errors[field] = "Field is required";
    } else {
      const result = validator(value);
      errors[field] = result.error || null;
    }
  }

  return errors;
}

/**
 * Checks if there are any validation errors
 */
export function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some((error) => error !== null);
}
