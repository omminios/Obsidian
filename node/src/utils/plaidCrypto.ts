import crypto from "crypto";

if (!process.env.PLAID_ENCRYPTION_KEY) {
	throw new Error("PLAID_ENCRYPTION_KEY environment variable is not defined");
}

const KEY = Buffer.from(process.env.PLAID_ENCRYPTION_KEY, "hex");

if (KEY.length !== 32) {
	throw new Error(
		"PLAID_ENCRYPTION_KEY must decode to exactly 32 bytes (64 hex characters)"
	);
}

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

export interface EncryptedToken {
	ciphertext: string;
	iv: string;
	tag: string;
}

export function encryptToken(plaintext: string): EncryptedToken {
	const iv = crypto.randomBytes(IV_BYTES);
	const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
	const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
	const tag = cipher.getAuthTag();
	return {
		ciphertext: ct.toString("base64"),
		iv: iv.toString("base64"),
		tag: tag.toString("base64"),
	};
}

export function decryptToken(parts: EncryptedToken): string {
	const decipher = crypto.createDecipheriv(
		ALGORITHM,
		KEY,
		Buffer.from(parts.iv, "base64")
	);
	decipher.setAuthTag(Buffer.from(parts.tag, "base64"));
	const pt = Buffer.concat([
		decipher.update(Buffer.from(parts.ciphertext, "base64")),
		decipher.final(),
	]);
	return pt.toString("utf8");
}
