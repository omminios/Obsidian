import crypto from "crypto";
import { hashToken } from "../../utils/hashing.js";
import { hashPassword } from "../../utils/hashing.js";
import { findByEmail, updatePassword } from "../../repository/userRepository.js";
import {
	storeResetToken,
	findValidResetToken,
	markTokenUsed,
	purgeExpiredResetTokens,
} from "../../repository/passwordResetRepository.js";
import { AuthenticationError } from "../../errors/index.js";

const RESET_TOKEN_EXPIRES_HOURS = 1;

export const requestPasswordReset = async (
	email: string
): Promise<{ token: string; userId: number } | null> => {
	const user = await findByEmail(email);
	if (!user) {
		return null;
	}

	const rawToken = crypto.randomBytes(32).toString("hex");
	const tokenHash = hashToken(rawToken);

	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRES_HOURS);

	await storeResetToken(user.id, tokenHash, expiresAt);

	return { token: rawToken, userId: user.id };
};

export const resetPassword = async (
	token: string,
	newPassword: string
): Promise<void> => {
	const tokenHash = hashToken(token);
	const stored = await findValidResetToken(tokenHash);

	if (!stored) {
		throw new AuthenticationError("Invalid or expired reset token");
	}

	const hashedPassword = await hashPassword(newPassword);
	await updatePassword(stored.user_id, hashedPassword);
	await markTokenUsed(stored.id);
};

export { purgeExpiredResetTokens };
