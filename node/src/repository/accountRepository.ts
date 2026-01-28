import { pool } from "../config/database.js";
import { Tables, TablesInsert } from "../config/types.js";
import { DatabaseError, ConflictError } from "../errors/index.js";
import { isPostgresError } from "../utils/utils.js";

type Account = Tables<"accounts">;
type Transaction = Tables<"transactions">;

export const getAllAccounts = async (): Promise<Account[]> => {
	try {
		const res = await pool.query(
			"SELECT * FROM accounts WHERE is_active = true"
		);
		return res.rows;
	} catch (e) {
		throw new DatabaseError("Failed to fetch accounts", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const findByID = async (
	accountId: number
): Promise<Account | undefined> => {
	try {
		const res = await pool.query("SELECT * FROM accounts WHERE id = $1", [
			accountId,
		]);
		return res.rows[0];
	} catch (e) {
		throw new DatabaseError("Failed to fetch account", {
			accountId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const newAccount = async (
	accountData: TablesInsert<"accounts">
): Promise<Account> => {
	try {
		const res = await pool.query(
			`INSERT INTO accounts (user_id, account_name, account_type, balance_current, balance_available, currency_code, institution_name, last_four, plaid_account_id, plaid_item_id, is_active)
			VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
			RETURNING *`,
			[
				accountData.user_id,
				accountData.account_name,
				accountData.account_type,
				accountData.balance_current,
				accountData.balance_available,
				accountData.currency_code,
				accountData.institution_name,
				accountData.last_four,
				accountData.plaid_account_id,
				accountData.plaid_item_id,
				accountData.is_active ?? true,
			]
		);
		return res.rows[0];
	} catch (e) {
		if (isPostgresError(e)) {
			if (e.code === "23503") {
				throw new ConflictError("Referenced user does not exist", {
					constraint: e.constraint,
					detail: e.details,
				});
			}
		}
		throw new DatabaseError("Failed to create account", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

// Soft delete - preserves transaction history
export const deactivateAccount = async (
	accountId: number
): Promise<Account | undefined> => {
	try {
		const result = await pool.query(
			`UPDATE accounts
			SET is_active = false, updated_at = NOW()
			WHERE id = $1
			RETURNING *`,
			[accountId]
		);
		return result.rows[0];
	} catch (e) {
		throw new DatabaseError("Failed to deactivate account", {
			accountId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const hasAccountAccess = async (
	accountId: number,
	userId: number
): Promise<boolean> => {
	try {
		const res = await pool.query(
			`SELECT 1 FROM account_members
              WHERE account_id = $1
              AND user_id = $2
              AND ownership_type IN ('owner', 'joint', 'authorized_user')`,
			[accountId, userId]
		);
		return res.rows.length > 0;
	} catch (e) {
		throw new DatabaseError("Failed to check account access", {
			accountId,
			userId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

// Get all accounts a user can access (owned + shared)
export const getAccessibleAccounts = async (
	userId: number
): Promise<Account[]> => {
	try {
		const res = await pool.query(
			`SELECT a.* FROM accounts a
              JOIN account_members am ON a.id = am.account_id
              WHERE am.user_id = $1
              AND am.ownership_type IN ('owner', 'joint', 'authorized_user')
              AND a.is_active = true`,
			[userId]
		);
		return res.rows;
	} catch (e) {
		throw new DatabaseError("Failed to fetch accessible accounts", {
			userId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

// Get transactions for accounts user has access to
export const getAccessibleTransactions = async (
	userId: number
): Promise<Transaction[]> => {
	try {
		const res = await pool.query(
			`SELECT t.* FROM transactions t
              JOIN account_transactions at ON t.id = at.transaction_id
              JOIN account_members am ON at.account_id = am.account_id
              WHERE am.user_id = $1
              AND am.ownership_type IN ('owner', 'joint', 'authorized_user')
              ORDER BY t.transaction_date DESC`,
			[userId]
		);
		return res.rows;
	} catch (e) {
		throw new DatabaseError("Failed to fetch accessible transactions", {
			userId,
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};
