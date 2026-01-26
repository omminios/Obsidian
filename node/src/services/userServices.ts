import {
	getAllusers,
	newUser,
	findByID,
	deleteprofile,
} from "../repository/userRepository.js";
import { TablesInsert } from "../config/types.js";
import { NotFoundError } from "../errors/index.js";

export const getUsers = async () => {
	const users = await getAllusers();
	return users;
};

export const getUserID = async (ID: number) => {
	const user = await findByID(ID);
	if (!user) {
		throw new NotFoundError("User", String(ID));
	}
	return user;
};

// Id will automatically be created, as well as the initial creation date and updated date.
// TODO: add a function to hash the password before inserting.
export const createUser = async (newUserdata: TablesInsert<"users">) => {
	const userData = await newUser(newUserdata);
	return userData;
};

export const removeUser = async (id: number) => {
	const deletedUser = await deleteprofile(id);
	if (!deletedUser) {
		throw new NotFoundError("User", String(id));
	}
	return deletedUser;
};
