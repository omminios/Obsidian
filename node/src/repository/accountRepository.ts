import { pool } from "../config/database.js";
import { Tables, TablesInsert } from "../config/types.js";

type Account = Tables<"accounts">;

export const getAllAccounts = async (): Promise<Account[]> => {
	try {
		const res = await pool.query("SELECT * FROM accounts");
		return res.rows;
	} catch (e) {
		console.error(e);
		return [];
	}
};

export const findByID = async (
	accountId: number
): Promise<Account | undefined> => {
	const res = await pool.query(
		"SELECT * FROM accounts WHERE id = $1",
		[accountId]
	);
	return res.rows[0];
};

export const newAccount = async (
	accountData: TablesInsert<"accounts">
): Promise<Account | undefined> => {
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
				accountData.is_active
			]
		);
		return res.rows[0];
	} catch (e) {
		console.error(e);
	}
};

export const deleteAccount = async (
	accountId: number
): Promise<Account | undefined> => {
	try {
		const result = await pool.query(
			`DELETE FROM accounts
			WHERE id = $1
			RETURNING *`,
			[accountId]
		);
		return result.rows[0];
	} catch (e) {
		console.error(e);
	}
};
