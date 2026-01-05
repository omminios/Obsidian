import { getAlltransactions } from "../repository/transactionRepository";

export const transactionformat = async (_req, res, next) => {
	try {
		console.log("connecting business logic");
		const transactions = await getAlltransactions();
		console.log(transactions.id);
		console.log(transactions.user_id);
		next();
		return transactions;
	} catch (e) {
		console.error(e);
	}
};
