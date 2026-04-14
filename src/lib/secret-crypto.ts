import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ENCRYPTION_ALGO = "aes-256-gcm";
const IV_BYTES = 12;
const VERSION = "v1";

let cachedMasterKey: Buffer | null = null;

function resolveMasterKey() {
  if (cachedMasterKey) {
    return cachedMasterKey;
  }

  const source = process.env.APP_SECRETS_KEY;

  if (!source) {
    throw new Error("APP_SECRETS_KEY is not configured.");
  }

  const base64Key = Buffer.from(source, "base64");

  if (base64Key.length === 32) {
    cachedMasterKey = base64Key;
    return cachedMasterKey;
  }

  const rawKey = Buffer.from(source, "utf8");

  if (rawKey.length === 32) {
    cachedMasterKey = rawKey;
    return cachedMasterKey;
  }

  throw new Error("APP_SECRETS_KEY must decode to exactly 32 bytes.");
}

export function encryptSecret(value: string) {
  const key = resolveMasterKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ENCRYPTION_ALGO, key, iv);

  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

export function decryptSecret(payload: string) {
  const key = resolveMasterKey();
  const parts = payload.split(".");

  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error("Encrypted secret payload is invalid.");
  }

  const iv = Buffer.from(parts[1], "base64");
  const authTag = Buffer.from(parts[2], "base64");
  const encrypted = Buffer.from(parts[3], "base64");

  const decipher = createDecipheriv(ENCRYPTION_ALGO, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
