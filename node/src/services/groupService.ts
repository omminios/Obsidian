import {
	getAllGroups,
	findByID,
	newGroup,
	deleteGroup
} from "../repository/groupRepository";
import { TablesInsert } from "../config/types.js";

export const getGroups = async () => {
	try {
		const groups = await getAllGroups();
		return groups;
	} catch (e) {
		console.error(e);
	}
};

export const getGroupID = async (ID: number) => {
	try {
		const group = await findByID(ID);
		return group;
	} catch (e) {
		console.error(e);
	}
};

export const createGroup = async (
	groupData: TablesInsert<"groups">
) => {
	const group = await newGroup(groupData);
	return group;
};

export const removeGroup = async (ID: number) => {
	try {
		const group = await deleteGroup(ID);
		return group;
	} catch (e) {
		console.error(e);
	}
};
