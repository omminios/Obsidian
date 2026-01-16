import { Router } from "express";
import {
	getTransactions,
	getTransactionID,
	createTransaction,
	removeTransaction,
} from "../../services/transactionService.js";

const router = Router();

// Get all transactions
router.get("/", async (_req, res) => {
	try {
		const data = await getTransactions();
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

// Get transaction by ID
router.get("/:id", async (req, res) => {
	try {
		const payload = req.params.id;
		const ID = Number(payload);

		if (isNaN(ID)) {
			return res.status(400).json({
				error: "Invalid transaction ID. Must be a valid number.",
			});
		}

		const data = await getTransactionID(ID);
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

// Create new transaction
router.post("/", async (req, res) => {
	try {
		const request_body = req.body;
		const newTransaction = await createTransaction(request_body);
		res.status(201).json({
			message: "New Transaction created",
			transaction: newTransaction,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			error: "Creation failed",
		});
	}
});

// Delete transaction
router.delete("/:id", async (req, res) => {
	try {
		const request_id = req.params.id;
		const ID = Number(request_id);

		if (isNaN(ID)) {
			return res.status(400).json({
				error: "Invalid transaction ID. Must be a valid number.",
			});
		}

		const deletedData = await removeTransaction(ID);
		res.status(200).json({
			message: "Transaction deleted",
			transaction: deletedData,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			error: "Deletion failed",
		});
	}
});

export default router;
