import { pool } from "../config/database.js";
import { Tables } from "../config/types.js";
import { DatabaseError } from "../errors/index.js";

type RefreshToken = Tables<"refresh_tokens">;

export const storeRefreshToken = async (
	userId: number,
	tokenHash: string,
	expiresAt: Date
): Promise<void> => {
	try {
		await pool.query(
			`INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
			VALUES ($1, $2, $3)`,
			[userId, tokenHash, expiresAt]
		);
	} catch (e) {
		throw new DatabaseError("Failed to store refresh token", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const findRefreshToken = async (
	tokenHash: string
): Promise<RefreshToken | undefined> => {
	try {
		const res = await pool.query(
			`SELECT * FROM refresh_tokens
			WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
			[tokenHash]
		);
		return res.rows[0];
	} catch (e) {
		throw new DatabaseError("Failed to find refresh token", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const revokeRefreshToken = async (tokenHash: string): Promise<void> => {
	try {
		await pool.query(
			`UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`,
			[tokenHash]
		);
	} catch (e) {
		throw new DatabaseError("Failed to revoke refresh token", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const revokeAllUserRefreshTokens = async (userId: number): Promise<void> => {
	try {
		await pool.query(
			`UPDATE refresh_tokens SET revoked_at = NOW()
			WHERE user_id = $1 AND revoked_at IS NULL`,
			[userId]
		);
	} catch (e) {
		throw new DatabaseError("Failed to revoke user refresh tokens", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};
