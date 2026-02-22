import { hashPassword } from "../utils/hashing";
import { TablesInsert } from "../config/types";
import { newUser } from "../repository/userRepository";

export const registerUser = async (newUserdata: TablesInsert<"users">) => {
	newUserdata.password_hash = await hashPassword(newUserdata.password_hash);
	const userData = await newUser(newUserdata);
	return userData;
};
