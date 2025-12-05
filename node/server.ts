import express from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the node/ directory
dotenv.config({ path: join(__dirname, ".env") });

/**Connection string for Supabase */
const connectionString = process.env.supabase;
if (!connectionString) {
	throw new Error("supabase environment variable is not defined");
}

const pool = new Pool({ connectionString });

try {
	const client = await pool.connect();
	console.log("✅ Connected to Supabase!");
	client.release();
} catch (e) {
	console.error("❌ Database connection failed:", e);
}

/**Start for node backend */
const app = express();
const port = 3000;
try {
	app.get("/", (req, res) => {
		res.send("Hello world!");
	});
} catch (e) {
	console.log(e);
}

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
