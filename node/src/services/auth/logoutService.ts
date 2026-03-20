import { hashToken } from "../../utils/hashing.js";
import { revokeRefreshToken } from "../../repository/refreshTokenRepository.js";

export const logoutUser = async (refreshToken: string): Promise<void> => {
	const tokenHash = hashToken(refreshToken);
	await revokeRefreshToken(tokenHash);
};
