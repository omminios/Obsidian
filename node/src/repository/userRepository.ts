import {
	DatabaseError,
	ConflictError,
	ValidationError,
} from "../errors/index.js";
import { pool } from "../config/database.js";
import { Tables, TablesInsert } from "../config/types.js";
import { isPostgresError } from "../utils/utils.js";

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
		throw new DatabaseError("Failed to fetch user", {
			userId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const getAllusers = async (): Promise<userSensitive[]> => {
	try {
		const res = await pool.query(
			"SELECT id, email, username, first_name, last_name, created_at, updated_at FROM users"
		);
		return res.rows;
	} catch (e) {
		throw new DatabaseError("Failed to fetch users", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const newUser = async (
	userData: TablesInsert<"users">
): Promise<userSensitive> => {
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
		if (isPostgresError(e)) {
			if (e.code === "23505") {
				throw new ConflictError("Email or username already exists", {
					constraint: e.constraint,
					detail: e.details,
				});
			}
			if (e.code === "23502") {
				throw new ValidationError("Required field is missing", {
					column: e.column,
				});
			}
		}
		throw new DatabaseError("Failed to create user", {
			cause: e instanceof Error ? e.message : String(e),
		});
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
		throw new DatabaseError("Deletion of user failed", {
			deleteUser,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};
