import jwt from "jsonwebtoken";

export interface AccessTokenPayload {
	userId: number;
	groupId: number | null;
	role: string | null;
}

export function signAccessToken(payload: AccessTokenPayload): string {
	return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
		expiresIn: "15m",
		algorithm: "HS256",
	});
}

export function signRefreshToken(payload: { userId: number }): string {
	return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
		expiresIn: "7d",
		algorithm: "HS256",
	});
}

export function verifyAccessToken(token: string): AccessTokenPayload {
	return jwt.verify(
		token,
		process.env.JWT_ACCESS_SECRET!
	) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { userId: number } {
	return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: number };
}
