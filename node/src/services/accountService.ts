import {
	getAllAccounts,
	findById,
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

export const getAccountById = async (id: number) => {
	const account = await findById(id);
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

export const getMostRecentTransactions = async (
	userId: number,
	limit = 15,
	offset = 0
) => {
	const transactions = await getAccountTransactions(userId, limit, offset);
	return transactions;
};
