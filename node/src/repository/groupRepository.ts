import { pool } from "../config/database.js";

export const getAllGroups = async () => {
	try {
		const res = await pool.query("SELECT * FROM groups");
		console.log(res.rows[0]);
		return res.rows[0];
	} catch (e) {
		console.error(e);
	}
};
