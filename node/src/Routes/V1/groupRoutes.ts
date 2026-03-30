import { Router } from "express";
import {
	getGroupById,
	createGroup,
	removeGroup,
	leaveGroup,
} from "../../services/groupService.js";
import { validateId } from "../../utils/validation.js";
import { authenticate } from "../../middleware/authenticate.js";
import { attachFreshToken } from "../../middleware/attachFreshToken.js";

const router = Router();

// All group routes require authentication
router.use(authenticate);

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
router.post("/", attachFreshToken, async (req, res) => {
	const newGroup = await createGroup(req.body, req.user!.userId);
	res.locals.reissueToken = true;
	res.locals.newRole = null;

	res.status(201).json({
		message: "New Group created",
		group: newGroup,
	});
});

// Delete group (creator only)
router.delete("/:id", attachFreshToken, async (req, res) => {
	const id = validateId(req.params.id, "id");
	const deletedData = await removeGroup(id, req.user!.userId);
	res.locals.reissueToken = true;
	res.locals.newRole = null;

	res.status(200).json({
		message: "Group deleted",
		group: deletedData,
	});
});

// Leave group (members only, not creator)
router.post("/:id/leave", attachFreshToken, async (req, res) => {
	const groupId = validateId(req.params.id, "id");
	const membership = await leaveGroup(groupId, req.user!.userId);
	res.status(200).json({
		message: "Successfully left the group",
		membership,
	});
});

export default router;
