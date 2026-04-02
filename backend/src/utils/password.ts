import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string | undefined | null
): Promise<boolean> {
  if (typeof plain !== "string" || !hash) {
    return false;
  }
  return bcrypt.compare(plain, hash);
}

export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, SALT_ROUNDS);
}

export async function verifyTokenHash(
  token: string,
  hash: string | undefined | null
): Promise<boolean> {
  if (typeof token !== "string" || !hash) {
    return false;
  }
  return bcrypt.compare(token, hash);
}
