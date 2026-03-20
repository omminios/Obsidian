import * as argon2 from "argon2";
import crypto from "crypto";

const passwordHash = {
	type: argon2.argon2id,
	memoryCost: 65536,
	timeCost: 2,
	parallelism: 4,
};

const tokenHashing = {
	algorithm: "sha256" as const,
};

export async function hashPassword(
	password: string,
	options = passwordHash
): Promise<string> {
	return argon2.hash(password, options);
}

export async function verifyPassword(
	storedHash: string,
	password: string
): Promise<boolean> {
	return argon2.verify(storedHash, password);
}

export function hashToken(token: string): string {
	return crypto.createHash(tokenHashing.algorithm).update(token).digest("hex");
}
