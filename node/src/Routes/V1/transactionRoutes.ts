import { Router } from "express";
import {
	getTransactions,
	getTransactionID,
	createTransaction,
	removeTransaction,
} from "../../services/transactionService.js";
import { ValidationError } from "../../errors/index.js";

const router = Router();

// Get all transactions
router.get("/", async (_req, res) => {
	const data = await getTransactions();
	res.status(200).json({
		message: "Data received successfully",
		data,
	});
});

// Get transaction by ID
router.get("/:id", async (req, res) => {
	const id = Number(req.params.id);

	if (isNaN(id)) {
		throw new ValidationError("Invalid transaction ID", { field: "id", received: req.params.id });
	}

	const data = await getTransactionID(id);
	res.status(200).json({
		message: "Data received successfully",
		data,
	});
});

// Create new transaction
router.post("/", async (req, res) => {
	const newTransaction = await createTransaction(req.body);
	res.status(201).json({
		message: "New Transaction created",
		transaction: newTransaction,
	});
});

// Delete transaction
router.delete("/:id", async (req, res) => {
	const id = Number(req.params.id);

	if (isNaN(id)) {
		throw new ValidationError("Invalid transaction ID", { field: "id", received: req.params.id });
	}

	const deletedData = await removeTransaction(id);
	res.status(200).json({
		message: "Transaction deleted",
		transaction: deletedData,
	});
});

export default router;
