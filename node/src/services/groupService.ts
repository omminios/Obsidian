import { getAllGroups } from "../repository/groupRepository";

export const groupformat = async (_req, res, next) => {
	try {
		console.log("connecting business logic");
		const groups = await getAllGroups();
		console.log(groups.id);
		console.log(groups.name);
		next();
		return groups;
	} catch (e) {
		console.error(e);
	}
};
