import { pool } from "../config/database.js";
import { Tables, TablesInsert } from "../config/types.js";
import { DatabaseError, ConflictError } from "../errors/index.js";
import { isPostgresError } from "../utils/utils.js";

type Group = Tables<"groups">;
type GroupMembership = Tables<"group_memberships">;

export const getAllGroups = async (): Promise<Group[]> => {
	try {
		const res = await pool.query("SELECT * FROM groups");
		return res.rows;
	} catch (e) {
		throw new DatabaseError("Failed to fetch groups", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const findByID = async (groupId: number): Promise<Group | undefined> => {
	try {
		const res = await pool.query("SELECT * FROM groups WHERE id = $1", [
			groupId,
		]);
		return res.rows[0];
	} catch (e) {
		throw new DatabaseError("Failed to fetch group", {
			groupId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const newGroup = async (
	groupData: TablesInsert<"groups">
): Promise<Group> => {
	try {
		const res = await pool.query(
			`INSERT INTO groups (name, max_users)
			VALUES($1, $2)
			RETURNING *`,
			[groupData.name, groupData.max_users]
		);
		return res.rows[0];
	} catch (e) {
		throw new DatabaseError("Failed to create group", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const deleteGroup = async (
	groupId: number
): Promise<Group | undefined> => {
	try {
		const result = await pool.query(
			`DELETE FROM groups WHERE id = $1 RETURNING *`,
			[groupId]
		);
		return result.rows[0];
	} catch (e) {
		if (isPostgresError(e) && e.code === "23503") {
			throw new ConflictError(
				"Cannot delete group with existing references",
				{
					constraint: e.constraint,
					detail: e.details,
				}
			);
		}
		throw new DatabaseError("Failed to delete group", {
			groupId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

// Get a user's membership in a group
export const getMembership = async (
	groupId: number,
	userId: number
): Promise<GroupMembership | undefined> => {
	try {
		const res = await pool.query(
			`SELECT * FROM group_memberships
			WHERE group_id = $1 AND user_id = $2 AND departed_at IS NULL`,
			[groupId, userId]
		);
		return res.rows[0];
	} catch (e) {
		throw new DatabaseError("Failed to fetch membership", {
			groupId,
			userId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

// Remove a member from a group (for leaving)
export const removeMember = async (
	groupId: number,
	userId: number
): Promise<GroupMembership | undefined> => {
	try {
		const res = await pool.query(
			`UPDATE group_memberships
			SET departed_at = NOW()
			WHERE group_id = $1 AND user_id = $2 AND departed_at IS NULL
			RETURNING *`,
			[groupId, userId]
		);
		return res.rows[0];
	} catch (e) {
		throw new DatabaseError("Failed to remove member from group", {
			groupId,
			userId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

// Delete all memberships for a group (for cascade delete)
export const deleteGroupMemberships = async (
	groupId: number
): Promise<void> => {
	try {
		await pool.query(`DELETE FROM group_memberships WHERE group_id = $1`, [
			groupId,
		]);
	} catch (e) {
		throw new DatabaseError("Failed to delete group memberships", {
			groupId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

// Delete all visibility settings for a group (for cascade delete)
export const deleteGroupVisibility = async (groupId: number): Promise<void> => {
	try {
		await pool.query(
			`DELETE FROM account_group_visibility WHERE group_id = $1`,
			[groupId]
		);
	} catch (e) {
		throw new DatabaseError("Failed to delete group visibility settings", {
			groupId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

// Delete all invitations for a group (for cascade delete)
export const deleteGroupInvitations = async (
	groupId: number
): Promise<void> => {
	try {
		await pool.query(`DELETE FROM invitations WHERE group_id = $1`, [
			groupId,
		]);
	} catch (e) {
		throw new DatabaseError("Failed to delete group invitations", {
			groupId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};
