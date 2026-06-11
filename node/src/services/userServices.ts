import {
	getAllUsers,
	newUser,
	findById,
	updateUserName,
	deleteProfile,
} from "../repository/userRepository.js";
import {
	findActiveMembership,
	listActiveMemberIds,
	deleteGroup,
} from "../repository/groupRepository.js";
import { getTransactionsWithAccounts } from "../repository/transactionRepository.js";
import { TablesInsert } from "../config/types.js";
import { ConflictError, NotFoundError } from "../errors/index.js";

export const getUsers = async () => {
	const users = await getAllUsers();
	return users;
};

export const getUserById = async (id: number) => {
	const user = await findById(id);
	if (!user) {
		throw new NotFoundError("User", String(id));
	}
	return user;
};

// Id will automatically be created, as well as the initial creation date and updated date.
// this funciton is for basic CRUD use Register User for actual user creation
export const createUser = async (newUserdata: TablesInsert<"users">) => {
	const userData = await newUser(newUserdata);
	return userData;
};

// Update the caller's own display name. The route restricts this to the
// authenticated user's own id, so any logged-in user can rename themselves.
export const updateProfile = async (
	userId: number,
	firstName: string,
	lastName: string
) => {
	const updated = await updateUserName(userId, firstName, lastName);
	if (!updated) {
		throw new NotFoundError("User", String(userId));
	}
	return updated;
};

// Delete the caller's own account. Deleting a user cascades their accounts,
// transactions, plaid_items, refresh tokens, and memberships, but the `groups`
// table has no user FK — so a creator's personal group would survive as an
// orphan. We therefore guard and clean up:
//   - A household creator with other active members must remove everyone first;
//     otherwise deleting them would strand the remaining members in a group
//     whose owner no longer exists.
//   - Once they are the sole member (or a non-shared solo user), the delete
//     proceeds and their now-empty personal group is removed too.
// Non-creator members are unaffected by the guard — deleting their account just
// departs them from the shared household (whose group belongs to someone else).
export const removeUser = async (id: number) => {
	const membership = await findActiveMembership(id);
	const isCreator = membership?.role === "creator";

	if (isCreator) {
		const memberIds = await listActiveMemberIds(membership!.group_id);
		if (memberIds.length > 1) {
			throw new ConflictError(
				"Remove all other members from your household before deleting your account."
			);
		}
	}

	const deletedUser = await deleteProfile(id);
	if (!deletedUser) {
		throw new NotFoundError("User", String(id));
	}

	// Only the user's own personal group is theirs to delete — the guard above
	// guarantees a creator here is the sole member.
	if (isCreator) {
		await deleteGroup(membership!.group_id);
	}

	return deletedUser;
};

export const getMostRecentTransactions = async (
	userId: number,
	limit = 15,
	offset = 0
) => {
	const transactions = await getTransactionsWithAccounts(
		userId,
		limit,
		offset
	);
	return transactions;
};
