import {
	getAllAccounts,
	findById,
	newAccount,
	deactivateAccount,
	getAccountMembership,
} from "../repository/accountRepository.js";
import { TablesInsert } from "../config/types.js";

import { NotFoundError, AuthorizationError } from "../errors/index.js";

// Get all accounts
export const getAccounts = async () => {
	const accounts = await getAllAccounts();
	return accounts;
};

// Get account by ID
export const getAccountById = async (id: number) => {
	const account = await findById(id);
	if (!account) {
		throw new NotFoundError("Account", String(id));
	}
	return account;
};

// Create a new account need to add plaid_account_id for unique account ID's
export const createAccount = async (accountData: TablesInsert<"accounts">) => {
	const account = await newAccount(accountData);
	return account;
};

// remove an account
export const removeAccount = async (user_id: number, account_id: number) => {
	const exists = await findById(account_id);
	if (!exists) {
		throw new NotFoundError("Account", String(account_id));
	}

	const membership = await getAccountMembership(user_id, account_id);
	if (!membership) {
		throw new AuthorizationError("No access to this account");
	}
	if (membership.ownership_type === "authorized_user") {
		throw new AuthorizationError(
			"Authorized users cannot modify this account"
		);
	}

	const account = await deactivateAccount(account_id);
	return account;
};
