import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const ADMIN_CONNECTION =
	"postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const TEST_DB = "obsidian_test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function setup() {
	// Connect to default postgres database to create the test database
	const adminClient = new Client({ connectionString: ADMIN_CONNECTION });
	await adminClient.connect();

	// Drop and recreate test database for a clean slate each run
	// Terminate existing connections first
	await adminClient.query(`
		SELECT pg_terminate_backend(pg_stat_activity.pid)
		FROM pg_stat_activity
		WHERE pg_stat_activity.datname = '${TEST_DB}'
		AND pid <> pg_backend_pid()
	`);
	await adminClient.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
	await adminClient.query(`CREATE DATABASE ${TEST_DB}`);
	await adminClient.end();

	// Connect to the test database and run migrations
	const testClient = new Client({
		connectionString: `postgresql://postgres:postgres@127.0.0.1:54322/${TEST_DB}`,
	});
	await testClient.connect();

	const migrationsDir = path.resolve(__dirname, "../../../supabase/migrations");
	const migrationFiles = fs
		.readdirSync(migrationsDir)
		.filter((f) => f.endsWith(".sql"))
		.sort();

	for (const file of migrationFiles) {
		const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
		await testClient.query(sql);
	}

	await testClient.end();

	console.log(
		`Test database "${TEST_DB}" created with ${migrationFiles.length} migrations applied.`
	);
}

export async function teardown() {
	const adminClient = new Client({ connectionString: ADMIN_CONNECTION });
	await adminClient.connect();

	// Terminate any remaining connections to the test database
	await adminClient.query(`
		SELECT pg_terminate_backend(pg_stat_activity.pid)
		FROM pg_stat_activity
		WHERE pg_stat_activity.datname = '${TEST_DB}'
		AND pid <> pg_backend_pid()
	`);
	await adminClient.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
	await adminClient.end();

	console.log(`Test database "${TEST_DB}" dropped.`);
}
