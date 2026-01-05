import { pool } from "../config/database.js";

export const getAllAccounts = async () => {
	try {
		const res = await pool.query("SELECT * FROM accounts");
		console.log(res.rows[0]);
		return res.rows[0];
	} catch (e) {
		console.error(e);
	}
};
