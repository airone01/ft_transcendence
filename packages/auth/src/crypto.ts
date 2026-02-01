import { createHash, randomBytes } from "node:crypto";
import { hash, verify } from "node-argon2";

export async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}

// need hash to be deterministic, hence can't use argon2
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateRandomString(size = 32) {
  return randomBytes(size).toString("base64");
}

export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  return await verify({ hash, password });
}
