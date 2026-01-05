import { getAllusers, newUser } from "../repository/userRepository";
import { findByID } from "../repository/userRepository";
import { TablesInsert } from "../config/types";

export const getUsers = async () => {
	try {
		console.log("retreiving data from repository");
		const users = await getAllusers();
		console.log(users);
		return users;
	} catch (e) {
		console.error(e);
	}
};

export const getUserID = async (ID: number) => {
	try {
		const users = await findByID(ID);
		return users;
	} catch (e) {
		console.error(e);
	}
};

//Id will automatically be created, as well as the initial creation date and updated date.
// need to add a function to hash the password in between inserting a new row of data.
export const createUser = async (newUserdata: TablesInsert<"users">) => {
	const userData = await newUser(newUserdata);
	return userData;
};
