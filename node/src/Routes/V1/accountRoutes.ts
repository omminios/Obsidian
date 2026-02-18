import { Router } from "express";
import {
	getAccounts,
	getAccountById,
	createAccount,
	removeAccount,
} from "../../services/accountService.js";
import { validateId } from "../../utils/validation.js";

const router = Router();

// Get all accounts
router.get("/", async (_req, res) => {
	const data = await getAccounts();
	res.status(200).json({
		message: "Data received successfully",
		data,
	});
});

// Get account by ID
router.get("/:id", async (req, res) => {
	const id = validateId(req.params.id, "id");
	const data = await getAccountById(id);
	res.status(200).json({
		message: "Data received successfully",
		data,
	});
});

// Create new account
router.post("/", async (req, res) => {
	const newAccount = await createAccount(req.body);
	res.status(201).json({
		message: "New Account created",
		account: newAccount,
	});
});

// Delete account
router.delete("/:id/:account_id", async (req, res) => {
	const id = validateId(req.params.id, "id");
	const accountId = validateId(req.params.account_id, "account_id");

	const deletedData = await removeAccount(id, accountId);
	res.status(200).json({
		message: "Account deleted",
		account: deletedData,
	});
});

export default router;
