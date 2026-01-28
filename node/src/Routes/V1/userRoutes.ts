import { Router } from "express";
import {
	getUserID,
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

	const data = await getUserID(id);
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
router.get("/:id/transactions", async (req, res) => {
	const id = Number(req.params.id);

	if (isNaN(id)) {
		throw new ValidationError("Invalid user ID", { field: "id", received: req.params.id });
	}

	const data = await getMostRecentTransactions(id);
	res.status(200).json({
		message: "User transactions with account data received successfully",
		data,
	});
});

export default router;
