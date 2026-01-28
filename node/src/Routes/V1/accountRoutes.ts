import { Router } from "express";
import {
	getAccounts,
	getAccountID,
	createAccount,
	removeAccount,
} from "../../services/accountService.js";
import { ValidationError } from "../../errors/index.js";

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
	const id = Number(req.params.id);

	if (isNaN(id)) {
		throw new ValidationError("Invalid account ID", { field: "id", received: req.params.id });
	}

	const data = await getAccountID(id);
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
router.delete("/:id", async (req, res) => {
	const id = Number(req.params.id);

	if (isNaN(id)) {
		throw new ValidationError("Invalid account ID", { field: "id", received: req.params.id });
	}

	const deletedData = await removeAccount(id);
	res.status(200).json({
		message: "Account deleted",
		account: deletedData,
	});
});

export default router;
