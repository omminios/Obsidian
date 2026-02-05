import { Router } from "express";
import {
	getGroups,
	getGroupById,
	createGroup,
	removeGroup,
	leaveGroup,
} from "../../services/groupService.js";
import { ValidationError } from "../../errors/index.js";

const router = Router();

// Get all groups
router.get("/", async (_req, res) => {
	const data = await getGroups();
	res.status(200).json({
		message: "Data received successfully",
		data,
	});
});

// Get group by ID
router.get("/:id", async (req, res) => {
	const id = Number(req.params.id);

	if (isNaN(id)) {
		throw new ValidationError("Invalid group ID", { field: "id", received: req.params.id });
	}

	const data = await getGroupById(id);
	res.status(200).json({
		message: "Data received successfully",
		data,
	});
});

// Create new group
router.post("/", async (req, res) => {
	const newGroup = await createGroup(req.body);
	res.status(201).json({
		message: "New Group created",
		group: newGroup,
	});
});

// Delete group (creator only)
router.delete("/:id", async (req, res) => {
	const id = Number(req.params.id);
	// TODO: Get userId from auth middleware (req.user.id)
	const userId = Number(req.body.userId);

	if (isNaN(id)) {
		throw new ValidationError("Invalid group ID", { field: "id", received: req.params.id });
	}

	if (isNaN(userId)) {
		throw new ValidationError("User ID required", { field: "userId" });
	}

	const deletedData = await removeGroup(id, userId);
	res.status(200).json({
		message: "Group deleted",
		group: deletedData,
	});
});

// Leave group (members only, not creator)
router.post("/:id/leave", async (req, res) => {
	const groupId = Number(req.params.id);
	// TODO: Get userId from auth middleware (req.user.id)
	const userId = Number(req.body.userId);

	if (isNaN(groupId)) {
		throw new ValidationError("Invalid group ID", { field: "id", received: req.params.id });
	}

	if (isNaN(userId)) {
		throw new ValidationError("User ID required", { field: "userId" });
	}

	const membership = await leaveGroup(groupId, userId);
	res.status(200).json({
		message: "Successfully left the group",
		membership,
	});
});

export default router;
