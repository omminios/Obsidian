import { pool } from "../config/database.js";
import { PoolClient } from "pg";
import { DatabaseError } from "../errors/index.js";

/**
 * Execute a callback within a database transaction.
 * Automatically handles BEGIN, COMMIT, and ROLLBACK.
 */
export async function withTransaction<T>(
	callback: (client: PoolClient) => Promise<T>
): Promise<T> {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const result = await callback(client);
		await client.query("COMMIT");
		return result;
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
}

/**
 * Group-related cascade delete queries that run within a transaction.
 */
export async function deleteGroupCascade(
	client: PoolClient,
	groupId: number
): Promise<void> {
	try {
		await client.query("DELETE FROM group_memberships WHERE group_id = $1", [
			groupId,
		]);
		await client.query("DELETE FROM account_group_visibility WHERE group_id = $1", [
			groupId,
		]);
		await client.query("DELETE FROM invitations WHERE group_id = $1", [
			groupId,
		]);
		await client.query("DELETE FROM groups WHERE id = $1", [groupId]);
	} catch (e) {
		throw new DatabaseError("Failed to delete group and related data", {
			groupId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
}
