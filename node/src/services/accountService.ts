import {
	getAllAccounts,
	findById,
	newAccount,
	deactivateAccount,
} from "../repository/accountRepository.js";
import { TablesInsert } from "../config/types.js";

import { NotFoundError } from "../errors/index.js";

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
export const removeAccount = async (id: number) => {
	const account = await deactivateAccount(id);
	if (!account) {
		throw new NotFoundError("Account", String(id));
	}
	return account;
};
