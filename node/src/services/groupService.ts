import {
	getAllGroups,
	findById,
	newGroup,
	deleteGroup,
	getMembership,
	removeMember,
} from "../repository/groupRepository.js";
import { TablesInsert } from "../config/types.js";
import {
	NotFoundError,
	AuthorizationError,
	ConflictError,
} from "../errors/index.js";

// Get all groups in database
export const getGroups = async () => {
	const groups = await getAllGroups();
	return groups;
};

// get group by ID
export const getGroupById = async (id: number) => {
	const group = await findById(id);
	if (!group) {
		throw new NotFoundError("Group", String(id));
	}
	return group;
};

// make a new group with 2 or more people
export const createGroup = async (groupData: TablesInsert<"groups">, userId: number) => {
	const group = await newGroup(groupData, userId);
	return group;
};

// Only creator or admin can delete - removes all related data
export const removeGroup = async (
	groupId: number,
	requestingUserId: number,
	requestingRole: string | null
) => {
	const group = await findById(groupId);
	if (!group) {
		throw new NotFoundError("Group", String(groupId));
	}

	const membership = await getMembership(groupId, requestingUserId);
	if (!membership && requestingRole !== "admin") {
		throw new AuthorizationError(
			"Only the group creator can delete this group"
		);
	}

	if (membership && membership.role !== "creator" && requestingRole !== "admin") {
		throw new AuthorizationError(
			"Only the group creator can delete this group"
		);
	}

	const deletedGroup = await deleteGroup(groupId);
	return deletedGroup;
};

// Members can leave (except creator). Admins can remove any member.
export const leaveGroup = async (
	groupId: number,
	userId: number,
	requestingRole: string | null
) => {
	const group = await findById(groupId);
	if (!group) {
		throw new NotFoundError("Group", String(groupId));
	}

	const membership = await getMembership(groupId, userId);
	if (!membership) {
		throw new NotFoundError("Membership");
	}

	if (membership.role === "creator" && requestingRole !== "admin") {
		throw new ConflictError(
			"Creator cannot leave group. Transfer ownership or delete the group."
		);
	}

	const removedMembership = await removeMember(groupId, userId);
	return removedMembership;
};
