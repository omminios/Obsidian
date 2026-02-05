import {
	getAllGroups,
	findById,
	newGroup,
	getMembership,
	removeMember,
} from "../repository/groupRepository.js";
import { TablesInsert } from "../config/types.js";
import { NotFoundError, AuthorizationError, ConflictError } from "../errors/index.js";
import { withTransaction, deleteGroupCascade } from "../utils/transaction.js";

export const getGroups = async () => {
	const groups = await getAllGroups();
	return groups;
};

export const getGroupById = async (id: number) => {
	const group = await findById(id);
	if (!group) {
		throw new NotFoundError("Group", String(id));
	}
	return group;
};

export const createGroup = async (groupData: TablesInsert<"groups">) => {
	const group = await newGroup(groupData);
	return group;
};

// Only creator can delete - removes all related data
export const removeGroup = async (groupId: number, requestingUserId: number) => {
	const group = await findById(groupId);
	if (!group) {
		throw new NotFoundError("Group", String(groupId));
	}

	// Check if user is creator
	const membership = await getMembership(groupId, requestingUserId);
	if (!membership || membership.role !== "creator") {
		throw new AuthorizationError("Only the group creator can delete this group");
	}

	// Delete group and all related data in a transaction
	await withTransaction(async (client) => {
		await deleteGroupCascade(client, groupId);
	});

	return group;
};

// Members can leave (except creator)
export const leaveGroup = async (groupId: number, userId: number) => {
	const group = await findById(groupId);
	if (!group) {
		throw new NotFoundError("Group", String(groupId));
	}

	const membership = await getMembership(groupId, userId);
	if (!membership) {
		throw new NotFoundError("Membership");
	}

	if (membership.role === "creator") {
		throw new ConflictError(
			"Creator cannot leave group. Transfer ownership or delete the group."
		);
	}

	const removedMembership = await removeMember(groupId, userId);
	return removedMembership;
};
