import {
	getAllTransactions,
	findById,
	newTransaction,
	createManualTransaction,
	updateManualTransaction,
	deleteTransaction,
} from "../repository/transactionRepository.js";
import { getAccountMembership } from "../repository/accountRepository.js";
import { TablesInsert } from "../config/types.js";
import { NotFoundError, AuthorizationError } from "../errors/index.js";

export const getTransactions = async () => {
	const transactions = await getAllTransactions();
	return transactions;
};

export const getTransactionById = async (userId: number, id: number) => {
	const transaction = await findById(id);
	if (!transaction) {
		throw new NotFoundError("Transaction", String(id));
	}
	if (transaction.user_id !== userId) {
		throw new AuthorizationError("No access to this transaction");
	}
	return transaction;
};

export const createTransaction = async (
	transactionData: TablesInsert<"transactions">,
	accountId?: number
) => {
	// No account given — fall back to the bare insert (no account link).
	if (accountId == null) {
		return newTransaction(transactionData);
	}

	// Manual entry attached to an account: only an owner or joint holder of the
	// account may record transactions against it (same rule that gates sharing).
	const membership = await getAccountMembership(
		transactionData.user_id,
		accountId
	);
	if (
		!membership ||
		(membership.ownership_type !== "owner" &&
			membership.ownership_type !== "joint")
	) {
		throw new AuthorizationError(
			"You don't have permission to add transactions to this account"
		);
	}

	return createManualTransaction(transactionData, accountId);
};

export const editTransaction = async (
	userId: number,
	id: number,
	data: {
		transaction_date?: string | null;
		amount?: number | null;
		category?: string | null;
		merchant_name?: string | null;
		description?: string | null;
	},
	accountId?: number
) => {
	const transaction = await findById(id);
	if (!transaction) {
		throw new NotFoundError("Transaction", String(id));
	}
	if (transaction.user_id !== userId) {
		throw new AuthorizationError("No access to this transaction");
	}
	// Only manual entries are editable — Plaid-synced transactions are owned by
	// the bank feed and would be overwritten on the next sync anyway.
	if (transaction.entry_method !== "manual") {
		throw new AuthorizationError(
			"Only manually-added transactions can be edited"
		);
	}

	// If moving the transaction to a different account, the user must own or
	// jointly hold that account (same rule as creating a manual transaction).
	if (accountId != null) {
		const membership = await getAccountMembership(userId, accountId);
		if (
			!membership ||
			(membership.ownership_type !== "owner" &&
				membership.ownership_type !== "joint")
		) {
			throw new AuthorizationError(
				"You don't have permission to use this account"
			);
		}
	}

	const updated = await updateManualTransaction(id, data, accountId);
	if (!updated) {
		throw new NotFoundError("Transaction", String(id));
	}
	return updated;
};

export const removeTransaction = async (userId: number, id: number) => {
	const transaction = await findById(id);
	if (!transaction) {
		throw new NotFoundError("Transaction", String(id));
	}
	if (transaction.user_id !== userId) {
		throw new AuthorizationError("No access to this transaction");
	}
	return deleteTransaction(id);
};
