import { randomBytes } from "node:crypto";
import { hash, verify } from "node-argon2";

export async function hashPassword(password: string): Promise<string> {
  return await hash(password);
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
