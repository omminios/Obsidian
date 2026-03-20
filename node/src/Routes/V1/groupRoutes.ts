import { Router } from "express";
import {
	getGroups,
	getGroupById,
	createGroup,
	removeGroup,
	leaveGroup,
} from "../../services/groupService.js";
import { validateId } from "../../utils/validation.js";
import { authenticate } from "../../middleware/authenticate.js";

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
	const id = validateId(req.params.id, "id");

	const data = await getGroupById(id);
	res.status(200).json({
		message: "Data received successfully",
		data,
	});
});

// Create new group
router.post("/", authenticate, async (req, res) => {
	const newGroup = await createGroup(req.body, req.user!.userId);
	res.status(201).json({
		message: "New Group created",
		group: newGroup,
	});
});

// Delete group (creator only)
router.delete("/:id", authenticate, async (req, res) => {
	const id = validateId(req.params.id, "id");
	const deletedData = await removeGroup(id, req.user!.userId);
	res.status(200).json({
		message: "Group deleted",
		group: deletedData,
	});
});

// Leave group (members only, not creator)
router.post("/:id/leave", authenticate, async (req, res) => {
	const groupId = validateId(req.params.id, "id");
	const membership = await leaveGroup(groupId, req.user!.userId);
	res.status(200).json({
		message: "Successfully left the group",
		membership,
	});
});

export default router;
