import { verifyPassword } from "../../utils/hashing.js";
import { findByEmail } from "../../repository/userRepository.js";
import { signAccessToken } from "../../utils/jwt.js";
import { AuthenticationError } from "../../errors/index.js";
import { issueRefreshToken } from "./refreshService.js";
import { findActiveMembership } from "../../repository/groupRepository.js";

interface loginCredentials {
	email: string;
	password: string;
}

export const loginUser = async (payload: loginCredentials) => {
	const userData = await findByEmail(payload.email);
	if (!userData) {
		throw new AuthenticationError("Invalid credentials");
	}

	const validPassword = await verifyPassword(userData.password_hash, payload.password);
	if (!validPassword) {
		throw new AuthenticationError("Invalid credentials");
	}

	const membership = await findActiveMembership(userData.id);

	const accessToken = signAccessToken({
		userId: userData.id,
		groupId: membership?.group_id ?? null,
		role: membership?.role ?? null,
	});

	const refreshToken = await issueRefreshToken(userData.id);

	return { accessToken, refreshToken };
};
