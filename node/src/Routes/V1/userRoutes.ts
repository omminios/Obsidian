import { Router } from "express";
import {
	getUserById,
	getUsers,
	createUser,
	removeUser,
} from "../../services/userServices.js";
import { getMostRecentTransactions } from "../../services/accountService.js";
import { ValidationError } from "../../errors/index.js";

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
	const id = Number(req.params.id);

	if (isNaN(id)) {
		throw new ValidationError("Invalid user ID", { field: "id", received: req.params.id });
	}

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
	const id = Number(req.params.id);

	if (isNaN(id)) {
		throw new ValidationError("Invalid user ID", { field: "id", received: req.params.id });
	}

	const deletedData = await removeUser(id);
	res.status(200).json({
		message: "User Deleted",
		user: deletedData,
	});
});

// Get user transactions with account details
// Supports pagination via query params: ?limit=15&offset=0
router.get("/:id/transactions", async (req, res) => {
	const id = Number(req.params.id);
	const limit = Number(req.query.limit) || 15;
	const offset = Number(req.query.offset) || 0;

	if (isNaN(id)) {
		throw new ValidationError("Invalid user ID", { field: "id", received: req.params.id });
	}

	if (limit < 1 || limit > 100) {
		throw new ValidationError("Limit must be between 1 and 100", {
			field: "limit",
			received: req.query.limit,
		});
	}

	if (offset < 0) {
		throw new ValidationError("Offset must be non-negative", {
			field: "offset",
			received: req.query.offset,
		});
	}

	const data = await getMostRecentTransactions(id, limit, offset);
	res.status(200).json({
		message: "User transactions with account data received successfully",
		data,
		pagination: { limit, offset },
	});
});

export default router;
