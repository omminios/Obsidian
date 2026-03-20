import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { hashToken } from "../../utils/hashing.js";
import {
	storeRefreshToken,
	findRefreshToken,
	revokeRefreshToken,
} from "../../repository/refreshTokenRepository.js";
import { findActiveMembership } from "../../repository/groupRepository.js";
import { AuthenticationError } from "../../errors/index.js";

const REFRESH_TOKEN_EXPIRES_DAYS = 7;

export const issueRefreshToken = async (userId: number): Promise<string> => {
	const refreshToken = signRefreshToken({ userId });
	const tokenHash = hashToken(refreshToken);
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
	await storeRefreshToken(userId, tokenHash, expiresAt);
	return refreshToken;
};

export const refreshTokens = async (
	incomingToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
	let payload: { userId: number };
	try {
		payload = verifyRefreshToken(incomingToken);
	} catch {
		throw new AuthenticationError("Invalid or expired refresh token");
	}

	const tokenHash = hashToken(incomingToken);
	const stored = await findRefreshToken(tokenHash);
	if (!stored) {
		throw new AuthenticationError("Refresh token not recognised or already revoked");
	}

	// Rotate: revoke old, issue new
	await revokeRefreshToken(tokenHash);

	const membership = await findActiveMembership(payload.userId);

	const accessToken = signAccessToken({
		userId: payload.userId,
		groupId: membership?.group_id ?? null,
		role: membership?.role ?? null,
	});

	const newRefreshToken = await issueRefreshToken(payload.userId);

	return { accessToken, refreshToken: newRefreshToken };
};
