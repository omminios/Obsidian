import { Router } from "express";
import {
	getAccountById,
	createAccount,
	removeAccount,
} from "../../services/accountService.js";
import { validateId } from "../../utils/validation.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

// All account routes require authentication
router.use(authenticate);

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
router.delete("/", async (req, res) => {
	const id = validateId(req.body.id, "id");
	const accountId = validateId(req.body.account_id, "account_id");

	const deletedData = await removeAccount(id, accountId);
	res.status(200).json({
		message: "Account deleted",
		account: deletedData,
	});
});

export default router;
