import {
	getAllAccounts,
	findByID,
	newAccount,
	deactivateAccount,
} from "../repository/accountRepository.js";
import { TablesInsert } from "../config/types.js";
import { getAccountTransactions } from "../repository/composite/accountTransactions.js";
import { NotFoundError } from "../errors/index.js";

export const getAccounts = async () => {
	const accounts = await getAllAccounts();
	return accounts;
};

export const getAccountID = async (id: number) => {
	const account = await findByID(id);
	if (!account) {
		throw new NotFoundError("Account", String(id));
	}
	return account;
};

export const createAccount = async (accountData: TablesInsert<"accounts">) => {
	const account = await newAccount(accountData);
	return account;
};

export const removeAccount = async (id: number) => {
	const account = await deactivateAccount(id);
	if (!account) {
		throw new NotFoundError("Account", String(id));
	}
	return account;
};

export const getMostRecentTransactions = async (id: number) => {
	const transactions = await getAccountTransactions(id);
	return transactions;
};
