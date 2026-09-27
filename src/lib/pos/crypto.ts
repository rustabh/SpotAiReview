import "server-only";
import crypto from "crypto";

/**
 * AES-256-GCM at rest for POSCredential.encryptedPayload. The key never
 * leaves the server process; nothing in src/lib/pos/** returns a decrypted
 * payload to a caller outside this directory — dashboard/action code only
 * ever sees POSIntegration's status fields, never a credential.
 */
function getKey(): Buffer {
  const raw = process.env.POS_CREDENTIAL_ENCRYPTION_KEY;
  if (!raw) throw new Error("POS_CREDENTIAL_ENCRYPTION_KEY is not set.");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("POS_CREDENTIAL_ENCRYPTION_KEY must decode to exactly 32 bytes (base64-encoded).");
  }
  return key;
}

export function encryptCredential(payload: Record<string, unknown>): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

export function decryptCredential(encoded: string): Record<string, unknown> {
  const raw = Buffer.from(encoded, "base64");
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8"));
}
