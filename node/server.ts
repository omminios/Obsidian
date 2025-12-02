import express from "express";
import postgres from "postgres";
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
const sql = postgres(connectionString);
console.log("connectionString");
export default sql;

/**Start for node backend */
const app = express();
const port = 3000;

app.get("/", (req, res) => {
	res.send("Hello world!");
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
