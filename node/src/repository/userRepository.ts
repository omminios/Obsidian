import { DatabaseError } from "../errors/index.js";
import { pool } from "../config/database.js";
import { Tables, TablesInsert } from "../config/types.js";

type User = Tables<"users">;

type userSensitive = Omit<User, "password_hash">;

type userSummary = Pick<User, "id" | "username" | "first_name" | "last_name">;

export const findByID = async (
	userId: number
): Promise<userSensitive | undefined> => {
	try {
		const res = await pool.query(
			"SELECT id, email, username, first_name, last_name, created_at, updated_at FROM users WHERE id = $1",
			[userId]
		);
		return res.rows[0];
	} catch (e) {
		console.error(e);
		throw new DatabaseError("Failed to fetch user", { userId });
	}
};

export const getAllusers = async (): Promise<userSensitive[]> => {
	try {
		const res = await pool.query(
			"SELECT id, email, username, first_name, last_name, created_at, updated_at FROM users"
		);
		return res.rows;
	} catch (e) {
		console.error(e);
		return [];
	}
};

export const newUser = async (
	userData: TablesInsert<"users">
): Promise<userSensitive | undefined> => {
	try {
		const res = await pool.query(
			`INSERT INTO users (email, username, password_hash, first_name, last_name) 
			VALUES($1, $2, $3, $4, $5)
			RETURNING id, email, username, first_name, last_name, created_at, updated_at`,
			[
				userData.email,
				userData.username,
				userData.password_hash,
				userData.first_name,
				userData.last_name,
			]
		);
		return res.rows[0];
	} catch (e) {
		console.error(e);
	}
};

export const deleteprofile = async (
	deleteUser: number
): Promise<userSummary | undefined> => {
	try {
		const res = await pool.query(
			"DELETE FROM USERS WHERE ID = $1 RETURNING id, username, first_name, last_name",
			[deleteUser]
		);
		return res.rows[0];
	} catch (e) {
		console.error(e);
	}
};
