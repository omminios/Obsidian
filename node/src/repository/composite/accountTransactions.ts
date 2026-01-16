import { pool } from "../../config/database.js";
import { Tables } from "../../config/types.js";

type transactions = Tables<"transactions">;
type account = Tables<"accounts">;

type TransactionWithAccount = transactions &
	Pick<account, "account_name" | "institution_name">;

export const getAccountTransactions = async (
	ID: number
): Promise<TransactionWithAccount[]> => {
	try {
		const res = await pool.query(
			`SELECT t.*, a.account_name, a.institution_name
        FROM transactions t
        JOIN account_transactions at ON t.id = at.transaction_id
        JOIN accounts a ON at.account_id = a.id
        WHERE t.user_id = $1
        ORDER BY t.transaction_date DESC
        LIMIT 15 OFFSET 0`,
			[ID]
		);
		return res.rows;
	} catch (e) {
		console.error(e);
		return [];
	}
};
