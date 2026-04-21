import { pool } from "../config/database.js";
import { Tables } from "../config/types.js";
import { DatabaseError } from "../errors/index.js";

type PasswordResetToken = Tables<"password_reset_tokens">;

export const storeResetToken = async (
	userId: number,
	tokenHash: string,
	expiresAt: Date
): Promise<void> => {
	try {
		await pool.query(
			`INSERT INTO password_reset_tokens (user_id, token, expires_at)
			VALUES ($1, $2, $3)`,
			[userId, tokenHash, expiresAt]
		);
	} catch (e) {
		throw new DatabaseError("Failed to store password reset token", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const findValidResetToken = async (
	tokenHash: string
): Promise<PasswordResetToken | undefined> => {
	try {
		const res = await pool.query(
			`SELECT * FROM password_reset_tokens
			WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()`,
			[tokenHash]
		);
		return res.rows[0];
	} catch (e) {
		throw new DatabaseError("Failed to find password reset token", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const markTokenUsed = async (tokenId: number): Promise<void> => {
	try {
		await pool.query(
			`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`,
			[tokenId]
		);
	} catch (e) {
		throw new DatabaseError("Failed to mark reset token as used", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const purgeExpiredResetTokens = async (): Promise<number> => {
	try {
		const res = await pool.query(
			`DELETE FROM password_reset_tokens
			WHERE (expires_at < NOW() OR used_at IS NOT NULL)
			AND GREATEST(expires_at, COALESCE(used_at, expires_at)) < NOW() - INTERVAL '7 days'`
		);
		return res.rowCount ?? 0;
	} catch (e) {
		throw new DatabaseError("Failed to purge expired reset tokens", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};
