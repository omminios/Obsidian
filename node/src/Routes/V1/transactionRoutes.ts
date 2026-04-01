import { Router } from "express";
import {
	getTransactionById,
	createTransaction,
	removeTransaction,
} from "../../services/transactionService.js";
import { validateId } from "../../utils/validation.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

// Get transaction by ID
router.get("/:id", async (req, res) => {
	const id = validateId(req.params.id, "id");

	const data = await getTransactionById(id);
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
router.delete("/", async (req, res) => {
	const id = validateId(req.body.id, "id");

	const deletedData = await removeTransaction(id);
	res.status(200).json({
		message: "Transaction deleted",
		transaction: deletedData,
	});
});

export default router;
