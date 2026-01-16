import {
	getAlltransactions,
	findByID,
	newTransaction,
	deleteTransaction,
} from "../repository/transactionRepository";
import { TablesInsert } from "../config/types.js";

export const getTransactions = async () => {
	try {
		const transactions = await getAlltransactions();
		return transactions;
	} catch (e) {
		console.error(e);
	}
};

export const getTransactionID = async (ID: number) => {
	try {
		const transaction = await findByID(ID);
		return transaction;
	} catch (e) {
		console.error(e);
	}
};

export const createTransaction = async (
	transactionData: TablesInsert<"transactions">
) => {
	const transaction = await newTransaction(transactionData);
	return transaction;
};

export const removeTransaction = async (ID: number) => {
	try {
		const transaction = await deleteTransaction(ID);
		return transaction;
	} catch (e) {
		console.error(e);
	}
};
