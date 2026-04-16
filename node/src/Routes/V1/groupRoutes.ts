import { Router } from "express";
import {
	getGroupById,
	createGroup,
	removeGroup,
	leaveGroup,
} from "../../services/groupService.js";
import { authenticate } from "../../middleware/authenticate.js";
import { attachFreshToken } from "../../middleware/attachFreshToken.js";
import { validate } from "../../middleware/validate.js";
import { idParamSchema } from "../../schemas/common.js";
import { createGroupSchema, deleteGroupSchema, leaveGroupSchema } from "../../schemas/groupSchemas.js";

const router = Router();

// All group routes require authentication
router.use(authenticate);

// Get group by ID
router.get("/:id", validate({ params: idParamSchema }), async (req, res) => {
	const id = Number(req.params.id);
	const data = await getGroupById(id);
	res.status(200).json({
		message: "Data received successfully",
		data,
	});
});

// Create new group
router.post("/", attachFreshToken, validate({ body: createGroupSchema }), async (req, res) => {
	const newGroup = await createGroup(req.body, req.user!.userId);
	res.locals.reissueToken = true;
	res.locals.newRole = null;

	res.status(201).json({
		message: "New Group created",
		group: newGroup,
	});
});

// Delete group (creator only)
router.delete("/", attachFreshToken, validate({ body: deleteGroupSchema }), async (req, res) => {
	const deletedData = await removeGroup(req.body.id, req.user!.userId, req.user!.role);
	res.locals.reissueToken = true;
	res.locals.newRole = null;

	res.status(200).json({
		message: "Group deleted",
		group: deletedData,
	});
});

// Leave group (members only, not creator)
router.post("/leave", attachFreshToken, validate({ body: leaveGroupSchema }), async (req, res) => {
	const membership = await leaveGroup(req.body.id, req.user!.userId, req.user!.role);
	res.status(200).json({
		message: "Successfully left the group",
		membership,
	});
});

export default router;
