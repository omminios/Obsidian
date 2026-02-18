import { Router } from "express";
import {
	getUserById,
	getUsers,
	createUser,
	removeUser,
} from "../../services/userServices.js";
import { getMostRecentTransactions } from "../../services/userServices.js";
import { validateId, validatePagination } from "../../utils/validation.js";

const router = Router();

// Get all users
router.get("/", async (_req, res) => {
	const data = await getUsers();
	res.status(200).json({
		message: "Data received successfully",
		data,
	});
});

// Get user by ID
router.get("/:id", async (req, res) => {
	const id = validateId(req.params.id, "id");

	const data = await getUserById(id);
	res.status(200).json({
		message: "Data received successfully",
		data,
	});
});

// Create new user
router.post("/", async (req, res) => {
	const newUser = await createUser(req.body);
	res.status(201).json({
		message: "New User created",
		user: newUser,
	});
});

// Delete user
router.delete("/:id", async (req, res) => {
	const id = validateId(req.params.id, "id");

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
