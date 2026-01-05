import { pool } from "../config/database.js";

export const getAlltransactions = async () => {
	try {
		const res = await pool.query("SELECT * FROM transactions");
		console.log(res.rows[0]);
		return res.rows[0];
	} catch (e) {
		console.error(e);
	}
};
