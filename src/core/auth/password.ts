import argon2 from "argon2";

export function hashPassword(plainPassword: string) {
  return argon2.hash(plainPassword);
}

export function verifyPassword(hash: string, plainPassword: string) {
  return argon2.verify(hash, plainPassword);
}
