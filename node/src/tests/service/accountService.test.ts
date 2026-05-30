import { describe, it, expect, beforeEach } from "vitest";
import {
	truncateAll,
	seedUser,
	seedAccount,
	seedAccountMember,
	seedTransaction,
	seedAccountTransaction,
	seedGroup,
} from "../helpers/dbHelper.js";
import { shareAccountWithGroup } from "../../repository/accountRepository.js";
import { getAccountTransactions } from "../../services/accountService.js";
import { NotFoundError, AuthorizationError } from "../../errors/index.js";

// Exercises the GET /api/v1/accounts/:id/transactions endpoint at the service
// layer — the authorization gate (member OR group-visible) and the paginated
// query both live here. Uses direct seeds (no Plaid sandbox) so it runs fast.
describe("accountService.getAccountTransactions", () => {
	beforeEach(async () => {
		await truncateAll();
	});

	// Seed one transaction and link it to an account, returning the txn row.
	async function linkTxn(
		accountId: number,
		userId: number,
		overrides: Record<string, unknown> = {}
	) {
		const txn = await seedTransaction(userId, overrides);
		await seedAccountTransaction(
			accountId,
			txn.id,
			Number(overrides.amount ?? 50) >= 0 ? "credit" : "debit"
		);
		return txn;
	}

	// Owner (member) + account + group, with N transactions linked. Returns ids.
	async function seedOwnedAccount(txnCount = 0) {
		const user = await seedUser();
		const group = await seedGroup(user.id);
		const account = await seedAccount(user.id);
		await seedAccountMember(account.id, user.id, "owner");
		for (let i = 0; i < txnCount; i++) {
			await linkTxn(account.id, user.id, {
				amount: -10 - i,
				transaction_date: `2026-01-${String(i + 1).padStart(2, "0")}`,
			});
		}
		return { user, group, account };
	}

	// =========================================================================
	// Member access
	// =========================================================================

	it("returns an account's transactions for an account member", async () => {
		const { user, account } = await seedOwnedAccount();
		await linkTxn(account.id, user.id, {
			amount: -25,
			transaction_date: "2026-02-01",
			merchant_name: "Coffee Shop",
		});

		const result = await getAccountTransactions(
			user.id,
			null,
			account.id,
			1,
			"all"
		);

		expect(result.total).toBe(1);
		expect(result.pages).toBe(1);
		expect(result.page).toBe(1);
		expect(result.transactions).toHaveLength(1);
		expect(result.transactions[0].merchant_name).toBe("Coffee Shop");
	});

	it("orders transactions newest-first", async () => {
		const { user, account } = await seedOwnedAccount();
		await linkTxn(account.id, user.id, { transaction_date: "2026-01-10", merchant_name: "Old" });
		await linkTxn(account.id, user.id, { transaction_date: "2026-03-20", merchant_name: "New" });
		await linkTxn(account.id, user.id, { transaction_date: "2026-02-15", merchant_name: "Mid" });

		const result = await getAccountTransactions(user.id, null, account.id, 1, "all");

		expect(result.transactions.map((t) => t.merchant_name)).toEqual([
			"New",
			"Mid",
			"Old",
		]);
	});

	it("scopes results to the requested account only", async () => {
		const { user, account } = await seedOwnedAccount();
		await linkTxn(account.id, user.id, { merchant_name: "Mine" });

		// A second account (also owned by the same user) with its own transactions.
		const other = await seedAccount(user.id, { account_name: "Other Acct" });
		await seedAccountMember(other.id, user.id, "owner");
		await linkTxn(other.id, user.id, { merchant_name: "NotMine A" });
		await linkTxn(other.id, user.id, { merchant_name: "NotMine B" });

		const result = await getAccountTransactions(user.id, null, account.id, 1, "all");

		expect(result.total).toBe(1);
		expect(result.transactions).toHaveLength(1);
		expect(result.transactions[0].merchant_name).toBe("Mine");
	});

	// =========================================================================
	// Group-visibility access (non-member)
	// =========================================================================

	it("grants access to a non-member when the account is shared with their group", async () => {
		const { user, group, account } = await seedOwnedAccount();
		await linkTxn(account.id, user.id, { merchant_name: "Shared txn" });
		await shareAccountWithGroup(account.id, group.id);

		// A different user who is NOT an account member but whose active group is
		// the one the account is shared into.
		const viewer = await seedUser({ email: "viewer@example.com", username: "viewer" });

		const result = await getAccountTransactions(
			viewer.id,
			group.id,
			account.id,
			1,
			"all"
		);

		expect(result.total).toBe(1);
		expect(result.transactions[0].merchant_name).toBe("Shared txn");
	});

	// =========================================================================
	// Authorization failures
	// =========================================================================

	it("throws AuthorizationError when caller is neither a member nor group-visible", async () => {
		const { account } = await seedOwnedAccount();

		// A stranger in their own group; the account is not shared with it.
		const stranger = await seedUser({ email: "stranger@example.com", username: "stranger" });
		const strangerGroup = await seedGroup(stranger.id);

		await expect(
			getAccountTransactions(stranger.id, strangerGroup.id, account.id, 1, "all")
		).rejects.toThrow(AuthorizationError);
	});

	it("throws NotFoundError for a non-existent account", async () => {
		const user = await seedUser();
		await expect(
			getAccountTransactions(user.id, null, 99999, 1, "all")
		).rejects.toThrow(NotFoundError);
	});

	// =========================================================================
	// Amount filter
	// =========================================================================

	it("filters by income (amount > 0) and spend (amount < 0)", async () => {
		const { user, account } = await seedOwnedAccount();
		await linkTxn(account.id, user.id, { amount: 1200, merchant_name: "Paycheck" });
		await linkTxn(account.id, user.id, { amount: -40, merchant_name: "Groceries" });
		await linkTxn(account.id, user.id, { amount: -15, merchant_name: "Lunch" });

		const all = await getAccountTransactions(user.id, null, account.id, 1, "all");
		expect(all.total).toBe(3);

		const income = await getAccountTransactions(user.id, null, account.id, 1, "income");
		expect(income.total).toBe(1);
		expect(income.transactions[0].merchant_name).toBe("Paycheck");

		const spend = await getAccountTransactions(user.id, null, account.id, 1, "spend");
		expect(spend.total).toBe(2);
		expect(spend.transactions.every((t) => Number(t.amount) < 0)).toBe(true);
	});

	// =========================================================================
	// Pagination
	// =========================================================================

	it("paginates with a page size of 25", async () => {
		// 26 transactions → 2 pages (25 + 1).
		const { user, account } = await seedOwnedAccount(26);

		const page1 = await getAccountTransactions(user.id, null, account.id, 1, "all");
		expect(page1.total).toBe(26);
		expect(page1.pages).toBe(2);
		expect(page1.transactions).toHaveLength(25);

		const page2 = await getAccountTransactions(user.id, null, account.id, 2, "all");
		expect(page2.page).toBe(2);
		expect(page2.transactions).toHaveLength(1);
	});
});
