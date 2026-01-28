import { randomBytes } from "node:crypto";
import { hash } from "node-argon2";

export async function hashToken(token: string): Promise<string> {
  return await hash(token);
}

export function generateRandomString(size = 32) {
  return randomBytes(size).toString("base64");
}
