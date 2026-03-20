import { pool } from "../config/database.js";
import { Tables, TablesInsert } from "../config/types.js";
import { DatabaseError } from "../errors/index.js";

// ============================================
// Typing
// ============================================

type Group = Tables<"groups">;
type GroupMembership = Tables<"group_memberships">;

// ============================================
// Repository Functions
// ============================================

//Get all groups in the database
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

//Find group by ID
export const findById = async (groupId: number): Promise<Group | undefined> => {
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

// Create a new group and register the creator as a member in a single transaction
export const newGroup = async (
	groupData: TablesInsert<"groups">,
	userId: number
): Promise<Group> => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		const groupRes = await client.query(
			`INSERT INTO groups (name, max_users)
			VALUES($1, $2)
			RETURNING *`,
			[groupData.name, groupData.max_users]
		);
		const group: Group = groupRes.rows[0];

		await client.query(
			`INSERT INTO group_memberships (group_id, user_id, role)
			VALUES($1, $2, 'creator')`,
			[group.id, userId]
		);

		await client.query("COMMIT");
		return group;
	} catch (e) {
		await client.query("ROLLBACK");
		throw new DatabaseError("Failed to create group", {
			cause: e instanceof Error ? e.message : String(e),
		});
	} finally {
		client.release();
	}
};

// Get a user's membership in a group used for checking if creator
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

// Get a user's single active membership across all groups
export const findActiveMembership = async (
	userId: number
): Promise<GroupMembership | undefined> => {
	try {
		const res = await pool.query(
			`SELECT * FROM group_memberships
			WHERE user_id = $1 AND departed_at IS NULL`,
			[userId]
		);
		return res.rows[0];
	} catch (e) {
		throw new DatabaseError("Failed to fetch active membership", {
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

// Delete group part of a larger function in the services where it will check if you have membership of "creator" this is the atomic action
export const deleteGroup = async (
	groupId: number
): Promise<Group | undefined> => {
	try {
		const res = await pool.query(
			`DELETE FROM groups WHERE id = $1 RETURNING *`,
			[groupId]
		);
		return res.rows[0];
	} catch (e) {
		throw new DatabaseError("Failed to delete group", {
			groupId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};
