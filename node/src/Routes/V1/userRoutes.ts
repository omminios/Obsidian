import { Router } from "express";
import { removeUser } from "../../services/userServices.js";
import { getMostRecentTransactions } from "../../services/userServices.js";
import { validateId, validatePagination } from "../../utils/validation.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Delete user (own account)
router.delete("/", async (req, res) => {
	const id = validateId(req.body.id, "id");

	const deletedData = await removeUser(id);
	res.status(200).json({
		message: "User Deleted",
		user: deletedData,
	});
});

// Get user transactions with account details
// Supports pagination via query params: ?limit=15&offset=0
router.get("/:id/transactions", async (req, res) => {
	const id = validateId(req.params.id, "id");
	const { limit, offset } = validatePagination(req.query);

	const data = await getMostRecentTransactions(id, limit, offset);
	res.status(200).json({
		message: "User transactions with account data received successfully",
		data,
		pagination: { limit, offset },
	});
});

export default router;
