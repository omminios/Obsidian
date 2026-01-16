import { Router } from "express";
import {
	getAccounts,
	getAccountID,
	createAccount,
	removeAccount,
} from "../../services/accountService.js";

const router = Router();

// Get all accounts
router.get("/", async (_req, res) => {
	try {
		const data = await getAccounts();
		res.status(200).json({
			message: "Data received successfully",
			data: data,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			error: "Request failed.",
		});
	}
});

// Get account by ID
router.get("/:id", async (req, res) => {
	try {
		const payload = req.params.id;
		const ID = Number(payload);

		if (isNaN(ID)) {
			return res.status(400).json({
				error: "Invalid account ID. Must be a valid number.",
			});
		}

		const data = await getAccountID(ID);
		res.status(200).json({
			message: "Data received successfully",
			data: data,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			error: "Request failed.",
		});
	}
});

// Create new account
router.post("/", async (req, res) => {
	try {
		const request_body = req.body;
		const newAccount = await createAccount(request_body);
		res.status(201).json({
			message: "New Account created",
			account: newAccount,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			error: "Creation failed",
		});
	}
});

// Delete account
router.delete("/:id", async (req, res) => {
	try {
		const request_id = req.params.id;
		const ID = Number(request_id);

		if (isNaN(ID)) {
			return res.status(400).json({
				error: "Invalid account ID. Must be a valid number.",
			});
		}

		const deletedData = await removeAccount(ID);
		res.status(200).json({
			message: "Account deleted",
			account: deletedData,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			error: "Deletion failed",
		});
	}
});

export default router;
