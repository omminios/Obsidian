import { Router } from "express";
import {
	getAccountById,
	getAccountTransactions,
	createAccount,
	updateAccount,
	deleteAccount,
	removeAccount,
	shareAccount,
	unshareAccount,
} from "../../services/accountService.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeMember } from "../../middleware/authorizeMember.js";
import { validate } from "../../middleware/validate.js";
import { idParamSchema } from "../../schemas/common.js";
import {
	createAccountSchema,
	updateAccountSchema,
	deleteAccountSchema,
	accountTxQuerySchema,
} from "../../schemas/accountSchemas.js";

const router = Router();

// All account routes require authentication + group membership
router.use(authenticate, authorizeMember);

// Get account by ID
router.get("/:id", validate({ params: idParamSchema }), async (req, res) => {
	const data = await getAccountById(req.user!.userId, Number(req.params.id));
	res.status(200).json({
		message: "Data received successfully",
		data,
	});
});

// Get an account's transactions (paginated). Access mirrors the dashboard: the
// caller must be a member of the account or it must be shared with their group.
router.get(
	"/:id/transactions",
	validate({ params: idParamSchema, query: accountTxQuerySchema }),
	async (req, res) => {
		const { page, filter } =
			req.query as unknown as typeof accountTxQuerySchema._output;
		const result = await getAccountTransactions(
			req.user!.userId,
			req.user!.groupId,
			Number(req.params.id),
			page,
			filter
		);
		res.status(200).json(result);
	}
);

// Create new account
router.post("/", validate({ body: createAccountSchema }), async (req, res) => {
	const newAccount = await createAccount(
		{
			...req.body,
			user_id: req.user!.userId,
		},
		req.user!.groupId
	);
	res.status(201).json({
		message: "New Account created",
		account: newAccount,
	});
});

// Update an account (manual accounts only — enforced in the service)
router.patch(
	"/:id",
	validate({ params: idParamSchema, body: updateAccountSchema }),
	async (req, res) => {
		const updated = await updateAccount(
			req.user!.userId,
			Number(req.params.id),
			req.body
		);
		res.status(200).json({
			message: "Account updated",
			account: updated,
		});
	}
);

// Deactivate (soft delete) account — keeps history, just hides it
router.delete(
	"/",
	validate({ body: deleteAccountSchema }),
	async (req, res) => {
		const deletedData = await removeAccount(
			req.user!.userId,
			req.body.account_id
		);
		res.status(200).json({
			message: "Account deactivated",
			account: deletedData,
		});
	}
);

// Remove an account from the dashboard (soft delete — keeps transaction history;
// for Plaid accounts it also stops future syncing). Works for manual and Plaid
// accounts; owner/joint only, enforced in the service.
router.delete(
	"/:id",
	validate({ params: idParamSchema }),
	async (req, res) => {
		const deleted = await deleteAccount(
			req.user!.userId,
			Number(req.params.id)
		);
		res.status(200).json({
			message: "Account removed",
			account: deleted,
		});
	}
);

// Share an account with the caller's current group
router.post(
	"/:id/share",
	validate({ params: idParamSchema }),
	async (req, res) => {
		const accountId = Number(req.params.id);
		await shareAccount(req.user!.userId, accountId, req.user!.groupId!);
		res.status(200).json({
			message: "Account shared with group",
			account_id: accountId,
			group_id: req.user!.groupId,
		});
	}
);

// Unshare an account from the caller's current group
router.delete(
	"/:id/share",
	validate({ params: idParamSchema }),
	async (req, res) => {
		const accountId = Number(req.params.id);
		await unshareAccount(req.user!.userId, accountId, req.user!.groupId!);
		res.status(200).json({
			message: "Account unshared from group",
			account_id: accountId,
			group_id: req.user!.groupId,
		});
	}
);

export default router;
