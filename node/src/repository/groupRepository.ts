import { pool } from "../config/database.js";
import { Tables, TablesInsert } from "../config/types.js";

type Group = Tables<"groups">;

export const getAllGroups = async (): Promise<Group[]> => {
	try {
		const res = await pool.query("SELECT * FROM groups");
		return res.rows;
	} catch (e) {
		console.error(e);
		return [];
	}
};

export const findByID = async (
	groupId: number
): Promise<Group | undefined> => {
	const res = await pool.query(
		"SELECT * FROM groups WHERE id = $1",
		[groupId]
	);
	return res.rows[0];
};

export const newGroup = async (
	groupData: TablesInsert<"groups">
): Promise<Group | undefined> => {
	try {
		const res = await pool.query(
			`INSERT INTO groups (name, max_users)
			VALUES($1, $2)
			RETURNING *`,
			[
				groupData.name,
				groupData.max_users
			]
		);
		return res.rows[0];
	} catch (e) {
		console.error(e);
	}
};

export const deleteGroup = async (
	groupId: number
): Promise<Group | undefined> => {
	try {
		const result = await pool.query(
			`DELETE FROM groups
			WHERE id = $1
			RETURNING *`,
			[groupId]
		);
		return result.rows[0];
	} catch (e) {
		console.error(e);
	}
};
