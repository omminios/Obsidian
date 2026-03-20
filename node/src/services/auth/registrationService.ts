import { hashPassword } from "../../utils/hashing.js";
import { TablesInsert } from "../../config/types.js";
import { newUser } from "../../repository/userRepository.js";
import { signAccessToken } from "../../utils/jwt.js";
import { issueRefreshToken } from "./refreshService.js";

export const registerUser = async (newUserdata: TablesInsert<"users">) => {
	newUserdata.password_hash = await hashPassword(newUserdata.password_hash);
	const userData = await newUser(newUserdata);

	const accessToken = signAccessToken({
		userId: userData.id,
		groupId: null,
		role: null,
	});

	const refreshToken = await issueRefreshToken(userData.id);

	return { accessToken, refreshToken };
};
