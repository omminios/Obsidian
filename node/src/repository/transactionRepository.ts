import {
	ConflictError,
	DatabaseError,
	ValidationError,
} from "../errors/index.js";
import { pool } from "../config/database.js";
import { Tables, TablesInsert } from "../config/types.js";
import { isPostgresError } from "../utils/postgressError.js";

// ============================================
// Types
// ============================================

type Transaction = Tables<"transactions">;
type Account = Tables<"accounts">;
type TransactionWithAccount = Transaction &
	Pick<Account, "account_name" | "institution_name">;

// ============================================
// Repository Functions
// ============================================

// Get all transactions in the database.
export const getAllTransactions = async (): Promise<Transaction[]> => {
	try {
		const res = await pool.query("SELECT * FROM transactions");
		return res.rows;
	} catch (e) {
		throw new DatabaseError("Failed to fetch transactions", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

// Find by ID
export const findById = async (
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

// create a new new transaction
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

// Create a manually-entered transaction and link it to an account in one
// transaction. Mirrors the Plaid sync ingestion path (transactionsSyncService):
// it inserts the transactions row, then an account_transactions row so the
// transaction is visible on the dashboard (getTransactionsWithAccounts and the
// dashboard queries all JOIN through account_transactions — a transactions row
// with no link would never appear). entry_method is forced to 'manual', and
// transaction_type is derived from the stored amount sign (negative = debit /
// outflow, positive = credit / inflow), matching the sign convention in the
// transactions table (positive = inflow, negative = outflow). Manual entries use
// the natural personal-finance sign — no flip, unlike the Plaid path.
export const createManualTransaction = async (
	transactionData: TablesInsert<"transactions">,
	accountId: number
): Promise<Transaction> => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		const txRes = await client.query(
			`INSERT INTO transactions
				(user_id, transaction_date, amount, description, category, merchant_name, entry_method)
			VALUES ($1, $2, $3, $4, $5, $6, 'manual')
			RETURNING *`,
			[
				transactionData.user_id,
				transactionData.transaction_date,
				transactionData.amount,
				transactionData.description,
				transactionData.category,
				transactionData.merchant_name,
			]
		);
		const transaction: Transaction = txRes.rows[0];

		const transactionType = Number(transaction.amount) < 0 ? "debit" : "credit";
		await client.query(
			`INSERT INTO account_transactions (account_id, transaction_id, transaction_type)
			VALUES ($1, $2, $3)
			ON CONFLICT (account_id, transaction_id) DO NOTHING`,
			[accountId, transaction.id, transactionType]
		);

		await client.query("COMMIT");
		return transaction;
	} catch (e) {
		await client.query("ROLLBACK");
		if (isPostgresError(e)) {
			if (e.code === "23502") {
				throw new ValidationError("Required field is missing", {
					column: e.column,
				});
			}
			if (e.code === "23503") {
				throw new ConflictError("Referenced user or account does not exist", {
					constraint: e.constraint,
					detail: e.details,
				});
			}
		}
		throw new DatabaseError("Failed to create transaction", {
			cause: e instanceof Error ? e.message : String(e),
		});
	} finally {
		client.release();
	}
};

// Update a manually-entered transaction and keep its account link in sync, in one
// transaction. Guarded by `entry_method = 'manual'` in the WHERE clause so a Plaid
// transaction can never be edited here (returns undefined if the row isn't manual).
// Fields are COALESCEd, so only the values actually sent are changed. After the
// update, account_transactions.transaction_type is recomputed from the new amount
// sign (negative = debit / outflow, positive = credit / inflow), and the link is
// repointed when accountId moves the transaction to a different account.
export const updateManualTransaction = async (
	id: number,
	data: {
		transaction_date?: string | null;
		amount?: number | null;
		category?: string | null;
		merchant_name?: string | null;
		description?: string | null;
	},
	accountId?: number
): Promise<Transaction | undefined> => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		const res = await client.query(
			`UPDATE transactions
				SET transaction_date = COALESCE($2, transaction_date),
				    amount = COALESCE($3, amount),
				    category = COALESCE($4, category),
				    merchant_name = COALESCE($5, merchant_name),
				    description = COALESCE($6, description),
				    updated_at = NOW()
			WHERE id = $1 AND entry_method = 'manual'
			RETURNING *`,
			[
				id,
				data.transaction_date ?? null,
				data.amount ?? null,
				data.category ?? null,
				data.merchant_name ?? null,
				data.description ?? null,
			]
		);
		const transaction: Transaction | undefined = res.rows[0];
		if (!transaction) {
			await client.query("ROLLBACK");
			return undefined;
		}

		const transactionType = Number(transaction.amount) < 0 ? "debit" : "credit";
		if (accountId != null) {
			await client.query(
				`UPDATE account_transactions
					SET account_id = $1, transaction_type = $2
				WHERE transaction_id = $3`,
				[accountId, transactionType, id]
			);
		} else {
			await client.query(
				`UPDATE account_transactions
					SET transaction_type = $1
				WHERE transaction_id = $2`,
				[transactionType, id]
			);
		}

		await client.query("COMMIT");
		return transaction;
	} catch (e) {
		await client.query("ROLLBACK");
		if (isPostgresError(e)) {
			if (e.code === "23502") {
				throw new ValidationError("Required field is missing", {
					column: e.column,
				});
			}
			if (e.code === "23503") {
				throw new ConflictError("Referenced account does not exist", {
					constraint: e.constraint,
					detail: e.details,
				});
			}
		}
		throw new DatabaseError("Failed to update transaction", {
			transactionId: id,
			cause: e instanceof Error ? e.message : String(e),
		});
	} finally {
		client.release();
	}
};

// Delete Transactions
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

// Get account transactions based off user ID
export const getTransactionsWithAccounts = async (
	userId: number,
	limit = 15,
	offset = 0
): Promise<TransactionWithAccount[]> => {
	try {
		const res = await pool.query(
			`SELECT t.*, a.account_name, a.institution_name
			FROM transactions t
			JOIN account_transactions at ON t.id = at.transaction_id
			JOIN accounts a ON at.account_id = a.id
			WHERE t.user_id = $1
			ORDER BY t.transaction_date DESC
			LIMIT $2 OFFSET $3`,
			[userId, limit, offset]
		);
		return res.rows;
	} catch (e) {
		throw new DatabaseError("Failed to fetch account transactions", {
			userId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};
