import { describe, it, expect, beforeEach } from "vitest";
import {
	truncateAll,
	seedUser,
	seedAccount,
	seedAccountMember,
	seedTransaction,
	seedAccountTransaction,
} from "../helpers/dbHelper.js";
import {
	getAllAccounts,
	findById,
	newAccount,
	deactivateAccount,
	getAccessibleAccounts,
	getAccountMembership,
	getAccessibleTransactions,
} from "../../repository/accountRepository.js";
import { ConflictError } from "../../errors/index.js";

describe("accountRepository", () => {
	beforeEach(async () => {
		await truncateAll();
	});

	// ============================================
	// getAllAccounts
	// ============================================

	describe("getAllAccounts", () => {
		it("should return empty array when no accounts exist", async () => {
			const accounts = await getAllAccounts();
			expect(accounts).toEqual([]);
		});

		it("should only return active accounts", async () => {
			const user = await seedUser();
			await seedAccount(user.id);
			await seedAccount(user.id, {
				account_name: "Inactive",
				is_active: false,
			});

			const accounts = await getAllAccounts();
			expect(accounts).toHaveLength(1);
			expect(accounts[0].account_name).toBe("Test Checking");
		});
	});

	// ============================================
	// findById
	// ============================================

	describe("findById", () => {
		it("should return the account by id", async () => {
			const user = await seedUser();
			const seeded = await seedAccount(user.id);

			const found = await findById(seeded.id);
			expect(found).toBeDefined();
			expect(found!.id).toBe(seeded.id);
			expect(found!.account_name).toBe("Test Checking");
		});

		it("should return undefined for non-existent id", async () => {
			const found = await findById(99999);
			expect(found).toBeUndefined();
		});
	});

	// ============================================
	// newAccount
	// ============================================

	describe("newAccount", () => {
		it("should create an account and return it", async () => {
			const user = await seedUser();

			const account = await newAccount({
				user_id: user.id,
				account_name: "My Savings",
				account_type: "savings",
				balance_current: 5000,
				balance_available: 5000,
				currency_code: "USD",
				institution_name: "Big Bank",
				last_four: "9876",
				plaid_account_id: "plaid_123",
				plaid_item_id: "item_456",
				is_active: true,
			});

			expect(account).toBeDefined();
			expect(account.account_name).toBe("My Savings");
			expect(account.account_type).toBe("savings");
			expect(Number(account.balance_current)).toBe(5000);
			expect(account.user_id).toBe(user.id);
		});

		it("should throw ConflictError for non-existent user_id", async () => {
			await expect(
				newAccount({
					user_id: 99999,
					account_name: "Ghost Account",
					account_type: "checking",
					balance_current: 0,
					balance_available: 0,
					currency_code: "USD",
					institution_name: "Bank",
					last_four: "0000",
					plaid_account_id: null,
					plaid_item_id: null,
					is_active: true,
				})
			).rejects.toThrow(ConflictError);
		});

		it("should default is_active to true", async () => {
			const user = await seedUser();

			const account = await newAccount({
				user_id: user.id,
				account_name: "Default Active",
				account_type: "checking",
				balance_current: 100,
				balance_available: 100,
				currency_code: "USD",
				institution_name: "Bank",
				last_four: "1111",
				plaid_account_id: null,
				plaid_item_id: null,
			});

			expect(account.is_active).toBe(true);
		});
	});

	// ============================================
	// deactivateAccount
	// ============================================

	describe("deactivateAccount", () => {
		it("should soft delete by setting is_active to false", async () => {
			const user = await seedUser();
			const account = await seedAccount(user.id);

			const deactivated = await deactivateAccount(account.id);
			expect(deactivated).toBeDefined();
			expect(deactivated!.is_active).toBe(false);

			// Should no longer appear in getAllAccounts
			const all = await getAllAccounts();
			expect(all).toHaveLength(0);
		});

		it("should return undefined for non-existent account", async () => {
			const result = await deactivateAccount(99999);
			expect(result).toBeUndefined();
		});
	});

	// ============================================
	// getAccessibleAccounts
	// ============================================

	describe("getAccessibleAccounts", () => {
		it("should return accounts where user is owner", async () => {
			const user = await seedUser();
			const account = await seedAccount(user.id);
			await seedAccountMember(account.id, user.id, "owner");

			const accessible = await getAccessibleAccounts(user.id);
			expect(accessible).toHaveLength(1);
			expect(accessible[0].id).toBe(account.id);
		});

		it("should return accounts where user is joint or authorized", async () => {
			const owner = await seedUser();
			const jointUser = await seedUser({
				email: "joint@example.com",
				username: "jointuser",
			});

			const account = await seedAccount(owner.id);
			await seedAccountMember(account.id, jointUser.id, "joint");

			const accessible = await getAccessibleAccounts(jointUser.id);
			expect(accessible).toHaveLength(1);
		});

		it("should not return inactive accounts", async () => {
			const user = await seedUser();
			const account = await seedAccount(user.id, { is_active: false });
			await seedAccountMember(account.id, user.id, "owner");

			const accessible = await getAccessibleAccounts(user.id);
			expect(accessible).toHaveLength(0);
		});

		it("should return empty array for user with no accounts", async () => {
			const user = await seedUser();
			const accessible = await getAccessibleAccounts(user.id);
			expect(accessible).toEqual([]);
		});
	});

	// ============================================
	// getAccountMembership
	// ============================================

	describe("getAccountMembership", () => {
		it("should return the membership record", async () => {
			const user = await seedUser();
			const account = await seedAccount(user.id);
			await seedAccountMember(account.id, user.id, "owner");

			const membership = await getAccountMembership(user.id, account.id);
			expect(membership).toBeDefined();
			expect(membership!.ownership_type).toBe("owner");
		});

		it("should return undefined when no membership exists", async () => {
			const user = await seedUser();
			const membership = await getAccountMembership(user.id, 99999);
			expect(membership).toBeUndefined();
		});
	});

	// ============================================
	// getAccessibleTransactions
	// ============================================

	describe("getAccessibleTransactions", () => {
		it("should return transactions for accounts user has access to", async () => {
			const user = await seedUser();
			const account = await seedAccount(user.id);
			await seedAccountMember(account.id, user.id, "owner");

			const txn = await seedTransaction(user.id);
			await seedAccountTransaction(account.id, txn.id, "debit");

			const transactions = await getAccessibleTransactions(user.id);
			expect(transactions).toHaveLength(1);
			expect(transactions[0].id).toBe(txn.id);
		});

		it("should return empty array when user has no accessible accounts", async () => {
			const user = await seedUser();
			const transactions = await getAccessibleTransactions(user.id);
			expect(transactions).toEqual([]);
		});

		it("should order by transaction_date descending", async () => {
			const user = await seedUser();
			const account = await seedAccount(user.id);
			await seedAccountMember(account.id, user.id, "owner");

			const older = await seedTransaction(user.id, {
				transaction_date: "2026-01-01",
				description: "older",
			});
			const newer = await seedTransaction(user.id, {
				transaction_date: "2026-06-01",
				description: "newer",
			});
			await seedAccountTransaction(account.id, older.id);
			await seedAccountTransaction(account.id, newer.id);

			const transactions = await getAccessibleTransactions(user.id);
			expect(transactions).toHaveLength(2);
			expect(transactions[0].description).toBe("newer");
			expect(transactions[1].description).toBe("older");
		});
	});
});
