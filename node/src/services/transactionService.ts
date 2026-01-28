import {
	getAlltransactions,
	findByID,
	newTransaction,
	deleteTransaction,
} from "../repository/transactionRepository.js";
import { TablesInsert } from "../config/types.js";
import { NotFoundError } from "../errors/index.js";

export const getTransactions = async () => {
	const transactions = await getAlltransactions();
	return transactions;
};

export const getTransactionID = async (id: number) => {
	const transaction = await findByID(id);
	if (!transaction) {
		throw new NotFoundError("Transaction", String(id));
	}
	return transaction;
};

export const createTransaction = async (
	transactionData: TablesInsert<"transactions">
) => {
	const transaction = await newTransaction(transactionData);
	return transaction;
};

export const removeTransaction = async (id: number) => {
	const transaction = await deleteTransaction(id);
	if (!transaction) {
		throw new NotFoundError("Transaction", String(id));
	}
	return transaction;
};
