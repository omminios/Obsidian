import { defineConfig } from "vitest/config";

// Set test database connection before any modules load.
// This must happen here (not in setupFiles) because Vitest imports
// test modules before running setupFiles, and database.ts creates
// the pool at import time.
process.env.supabase =
	"postgresql://postgres:postgres@127.0.0.1:54322/obsidian_test";
process.env.NODE_ENV = "test";

export default defineConfig({
	test: {
		globalSetup: "./node/src/tests/globalSetup.ts",
		testTimeout: 15000,
		// Run test files sequentially — all projects share one database,
		// so parallel TRUNCATE/INSERT operations would deadlock.
		fileParallelism: false,
		projects: [
			{
				test: {
					name: "users",
					include: [
						"node/src/tests/repository/userRepository.test.ts",
					],
				},
			},
			{
				test: {
					name: "accounts",
					include: [
						"node/src/tests/repository/accountRepository.test.ts",
					],
				},
			},
			{
				test: {
					name: "groups",
					include: [
						"node/src/tests/repository/groupRepository.test.ts",
					],
				},
			},
			{
				test: {
					name: "transactions",
					include: [
						"node/src/tests/repository/transactionRepository.test.ts",
					],
				},
			},
			{
				test: {
					name: "refreshTokens",
					include: [
						"node/src/tests/repository/refreshTokenRepository.test.ts",
					],
				},
			},
		],
	},
});
