import {
	getAllGroups,
	findByID,
	newGroup,
	deleteGroup,
	getMembership,
	removeMember,
	deleteGroupMemberships,
	deleteGroupVisibility,
	deleteGroupInvitations,
} from "../repository/groupRepository.js";
import { TablesInsert } from "../config/types.js";
import { NotFoundError, AuthorizationError, ConflictError } from "../errors/index.js";

export const getGroups = async () => {
	const groups = await getAllGroups();
	return groups;
};

export const getGroupID = async (id: number) => {
	const group = await findByID(id);
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
	const group = await findByID(groupId);
	if (!group) {
		throw new NotFoundError("Group", String(groupId));
	}

	// Check if user is creator
	const membership = await getMembership(groupId, requestingUserId);
	if (!membership || membership.role !== "creator") {
		throw new AuthorizationError("Only the group creator can delete this group");
	}

	// Delete related data first (cascade)
	await deleteGroupMemberships(groupId);
	await deleteGroupVisibility(groupId);
	await deleteGroupInvitations(groupId);

	// Then delete the group
	const deletedGroup = await deleteGroup(groupId);
	return deletedGroup;
};

// Members can leave (except creator)
export const leaveGroup = async (groupId: number, userId: number) => {
	const group = await findByID(groupId);
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
