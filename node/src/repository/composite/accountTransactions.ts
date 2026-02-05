import { DatabaseError } from "../../errors/index.js";
import { pool } from "../../config/database.js";
import { Tables } from "../../config/types.js";

type Transaction = Tables<"transactions">;
type Account = Tables<"accounts">;

type TransactionWithAccount = Transaction &
	Pick<Account, "account_name" | "institution_name">;

export const getAccountTransactions = async (
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
