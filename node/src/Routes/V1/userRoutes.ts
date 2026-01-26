import { Router } from "express";
import {
	getUserID,
	getUsers,
	createUser,
	removeUser,
} from "../../services/userServices.js";
import { getMostRecentTransactions } from "../../services/accountService.js";

const router = Router();

// Get all users
router.get("/", async (_req, res) => {
	try {
		const data = await getUsers();
		res.status(200).json({
			message: "Data received successfully",
			data: data,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			error: "Request failed.",
		});
	}
});

// Get user by ID
router.get("/:id", async (req, res) => {
	const payload = req.params.id;
	const ID = Number(payload);
	const data = await getUserID(ID);
	res.status(200).json({
		message: "Data received successfully",
		data: data,
	});
});

// Create new user
router.post("/", async (req, res) => {
	try {
		const request_body = req.body;
		console.log(request_body);
		const newUser = await createUser(request_body);
		res.status(201).json({
			message: "New User created",
			user: newUser,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			error: "Creation failed",
		});
	}
});

// Delete user
router.delete("/:id", async (req, res) => {
	try {
		const request_id = req.params.id;
		const ID = Number(request_id);

		if (isNaN(ID)) {
			return res.status(400).json({
				error: "Invalid user ID. Must be a valid number.",
			});
		}

		const deletedData = await removeUser(ID);
		res.status(200).json({
			Message: "User Deleted",
			User: deletedData,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			error: "Deletion failed",
		});
	}
});

// Get user transactions with account details
router.get("/:id/transactions", async (req, res) => {
	try {
		const payload = req.params.id;
		const ID = Number(payload);

		if (isNaN(ID)) {
			return res.status(400).json({
				error: "Invalid user ID. Must be a valid number.",
			});
		}

		const data = await getMostRecentTransactions(ID);
		res.status(200).json({
			message:
				"User transactions with account data received successfully",
			data: data,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			error: "Request failed.",
		});
	}
});

export default router;
