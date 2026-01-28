import {
	ConflictError,
	DatabaseError,
	ValidationError,
} from "../errors/index.js";
import { pool } from "../config/database.js";
import { Tables, TablesInsert } from "../config/types.js";
import { isPostgresError } from "../utils/utils.js";

type Transaction = Tables<"transactions">;

export const getAlltransactions = async (): Promise<Transaction[]> => {
	try {
		const res = await pool.query("SELECT * FROM transactions");
		return res.rows;
	} catch (e) {
		throw new DatabaseError("Failed to fetch transactions", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const findByID = async (
	transactionId: number
): Promise<Transaction | undefined> => {
	try {
		const res = await pool.query(
			"SELECT * FROM transactions WHERE id = $1",
			[transactionId]
		);
		return res.rows[0];
	} catch (e) {
		throw new DatabaseError("Failed to fetch transaction", {
			transactionId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const newTransaction = async (
	transactionData: TablesInsert<"transactions">
): Promise<Transaction> => {
	try {
		const res = await pool.query(
			`INSERT INTO transactions (user_id, transaction_date, amount, description, category, merchant_name, plaid_id)
			VALUES($1, $2, $3, $4, $5, $6, $7)
			RETURNING *`,
			[
				transactionData.user_id,
				transactionData.transaction_date,
				transactionData.amount,
				transactionData.description,
				transactionData.category,
				transactionData.merchant_name,
				transactionData.plaid_id,
			]
		);
		return res.rows[0];
	} catch (e) {
		if (isPostgresError(e)) {
			if (e.code === "23502") {
				throw new ValidationError("Required field is missing", {
					column: e.column,
				});
			}
			if (e.code === "23503") {
				throw new ConflictError("Referenced user does not exist", {
					constraint: e.constraint,
					detail: e.details,
				});
			}
		}
		throw new DatabaseError("Failed to create transaction", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const deleteTransaction = async (
	transactionId: number
): Promise<Transaction | undefined> => {
	try {
		const result = await pool.query(
			`DELETE FROM transactions WHERE id = $1 RETURNING *`,
			[transactionId]
		);
		return result.rows[0];
	} catch (e) {
		throw new DatabaseError("Failed to delete transaction", {
			transactionId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};
