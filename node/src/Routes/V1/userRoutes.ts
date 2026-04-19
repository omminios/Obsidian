import { Router } from "express";
import { removeUser } from "../../services/userServices.js";
import { getMostRecentTransactions } from "../../services/userServices.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeMember } from "../../middleware/authorizeMember.js";
import { validate } from "../../middleware/validate.js";
import { idParamSchema, paginationQuerySchema } from "../../schemas/common.js";
import { deleteUserSchema } from "../../schemas/userSchemas.js";

const router = Router();

// All user routes require authentication + group membership
router.use(authenticate, authorizeMember);

// Delete user (own account)
router.delete("/", validate({ body: deleteUserSchema }), async (req, res) => {
	const deletedData = await removeUser(req.body.id);
	res.status(200).json({
		message: "User Deleted",
		user: deletedData,
	});
});

// Get user transactions with account details
// Supports pagination via query params: ?limit=15&offset=0
router.get("/:id/transactions", validate({ params: idParamSchema, query: paginationQuerySchema }), async (req, res) => {
	const id = Number(req.params.id);
	const { limit, offset } = req.query as unknown as { limit: number; offset: number };

	const data = await getMostRecentTransactions(id, limit, offset);
	res.status(200).json({
		message: "User transactions with account data received successfully",
		data,
		pagination: { limit, offset },
	});
});

export default router;
