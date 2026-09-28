import "server-only";
import crypto from "crypto";

/**
 * AES-256-GCM at rest for GoogleBusinessCredential.encryptedPayload. A
 * separate key from POS_CREDENTIAL_ENCRYPTION_KEY so a leak of one integration's
 * key never exposes the other's tokens. Nothing outside src/lib/google/** ever
 * sees a decrypted payload.
 */
function getKey(): Buffer {
  const raw = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY is not set.");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes (base64-encoded).");
  }
  return key;
}

export function encryptTokens(payload: Record<string, unknown>): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

export function decryptTokens(encoded: string): Record<string, unknown> {
  const raw = Buffer.from(encoded, "base64");
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8"));
}

/** Signs the OAuth `state` param so the callback can trust the businessId round-tripped through Google. */
export function signState(payload: Record<string, unknown>): string {
  const data = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", getKey()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyState<T>(state: string): T {
  const [data, sig] = state.split(".");
  if (!data || !sig) throw new Error("Malformed OAuth state.");
  const expected = crypto.createHmac("sha256", getKey()).update(data).digest("base64url");
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    throw new Error("Invalid OAuth state signature.");
  }
  return JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as T;
}
