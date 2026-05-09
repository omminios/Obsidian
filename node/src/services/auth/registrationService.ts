import { hashPassword } from "../../utils/hashing.js";
import { TablesInsert } from "../../config/types.js";
import { newUser } from "../../repository/userRepository.js";
import { createPersonalGroupForUser } from "../../repository/groupRepository.js";
import { signAccessToken } from "../../utils/jwt.js";
import { issueRefreshToken } from "./refreshService.js";

export const registerUser = async (newUserdata: TablesInsert<"users">) => {
	newUserdata.password_hash = await hashPassword(newUserdata.password_hash);
	const userData = await newUser(newUserdata);

	const group = await createPersonalGroupForUser(userData.id);

	const accessToken = signAccessToken({
		userId: userData.id,
		groupId: group.id,
		role: "creator",
	});

	const refreshToken = await issueRefreshToken(userData.id);

	return { accessToken, refreshToken };
};
