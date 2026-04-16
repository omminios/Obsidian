import { Router } from "express";
import {
	getAccountById,
	createAccount,
	removeAccount,
} from "../../services/accountService.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { idParamSchema } from "../../schemas/common.js";
import { createAccountSchema, deleteAccountSchema } from "../../schemas/accountSchemas.js";

const router = Router();

// All account routes require authentication
router.use(authenticate);

// Get account by ID
router.get("/:id", validate({ params: idParamSchema }), async (req, res) => {
	const id = Number(req.params.id);
	const data = await getAccountById(id);
	res.status(200).json({
		message: "Data received successfully",
		data,
	});
});

// Create new account
router.post("/", validate({ body: createAccountSchema }), async (req, res) => {
	const newAccount = await createAccount({ ...req.body, user_id: req.user!.userId });
	res.status(201).json({
		message: "New Account created",
		account: newAccount,
	});
});

// Delete account
router.delete("/", validate({ body: deleteAccountSchema }), async (req, res) => {
	const deletedData = await removeAccount(req.user!.userId, req.body.account_id);
	res.status(200).json({
		message: "Account deleted",
		account: deletedData,
	});
});

export default router;
