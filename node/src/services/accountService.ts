import { getAllAccounts } from "../repository/accountRepository";

export const accountformat = async (_req, res, next) => {
	try {
		console.log("connecting business logic");
		const accounts = await getAllAccounts();
		console.log(accounts.id);
		console.log(accounts.user_id);
		next();
		return accounts;
	} catch (e) {
		console.error(e);
	}
};
