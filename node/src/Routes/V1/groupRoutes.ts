import { Router } from "express";
import {
	getGroups,
	getGroupID,
	createGroup,
	removeGroup,
} from "../../services/groupService.js";

const router = Router();

// Get all groups
router.get("/", async (_req, res) => {
	try {
		const data = await getGroups();
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

// Get group by ID
router.get("/:id", async (req, res) => {
	try {
		const payload = req.params.id;
		const ID = Number(payload);

		if (isNaN(ID)) {
			return res.status(400).json({
				error: "Invalid group ID. Must be a valid number.",
			});
		}

		const data = await getGroupID(ID);
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

// Create new group
router.post("/", async (req, res) => {
	try {
		const request_body = req.body;
		const newGroup = await createGroup(request_body);
		res.status(201).json({
			message: "New Group created",
			group: newGroup,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			error: "Creation failed",
		});
	}
});

// Delete group
router.delete("/:id", async (req, res) => {
	try {
		const request_id = req.params.id;
		const ID = Number(request_id);

		if (isNaN(ID)) {
			return res.status(400).json({
				error: "Invalid group ID. Must be a valid number.",
			});
		}

		const deletedData = await removeGroup(ID);
		res.status(200).json({
			message: "Group deleted",
			group: deletedData,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			error: "Deletion failed",
		});
	}
});

export default router;
