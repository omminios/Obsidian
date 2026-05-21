import { verifyRefreshToken } from "../../utils/jwt.js";
import { hashToken } from "../../utils/hashing.js";
import {
	revokeRefreshToken,
	revokeAllUserRefreshTokens,
} from "../../repository/refreshTokenRepository.js";

export const logoutUser = async (refreshToken: string): Promise<void> => {
	try {
		const payload = verifyRefreshToken(refreshToken);
		await revokeAllUserRefreshTokens(payload.userId);
	} catch {
		// Token is expired or invalid — revoke just this one by hash so the
		// DB record is still marked as revoked even if the JWT can't be decoded.
		const tokenHash = hashToken(refreshToken);
		await revokeRefreshToken(tokenHash);
	}
};
