import {
	getAllAccounts,
	findByID,
	newAccount,
	deleteAccount,
} from "../repository/accountRepository";
import { TablesInsert } from "../config/types.js";
import { getAccountTransactions } from "../repository/composite/accountTransactions";

export const getAccounts = async () => {
	try {
		const accounts = await getAllAccounts();
		return accounts;
	} catch (e) {
		console.error(e);
	}
};

export const getAccountID = async (ID: number) => {
	try {
		const account = await findByID(ID);
		return account;
	} catch (e) {
		console.error(e);
	}
};

export const createAccount = async (accountData: TablesInsert<"accounts">) => {
	const account = await newAccount(accountData);
	return account;
};

export const removeAccount = async (ID: number) => {
	try {
		const account = await deleteAccount(ID);
		return account;
	} catch (e) {
		console.error(e);
	}
};

export const getMostRecentTransactions = async (ID: number) => {
	try {
		const account = await getAccountTransactions(ID);
		console.log(account);
		return account;
	} catch (e) {
		console.error(e);
	}
};
