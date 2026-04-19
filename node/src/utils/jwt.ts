import jwt from "jsonwebtoken";

if (!process.env.JWT_ACCESS_SECRET) {
	throw new Error("JWT_ACCESS_SECRET environment variable is not defined");
}
if (!process.env.JWT_REFRESH_SECRET) {
	throw new Error("JWT_REFRESH_SECRET environment variable is not defined");
}

const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET;

export interface AccessTokenPayload {
	userId: number;
	groupId: number | null;
	role: string | null;
}

export function signAccessToken(payload: AccessTokenPayload): string {
	return jwt.sign(payload, JWT_ACCESS_SECRET, {
		expiresIn: "15m",
		algorithm: "HS256",
	});
}

export function signRefreshToken(payload: { userId: number }): string {
	return jwt.sign(payload, JWT_REFRESH_SECRET, {
		expiresIn: "7d",
		algorithm: "HS256",
	});
}

export function verifyAccessToken(token: string): AccessTokenPayload {
	return jwt.verify(token, JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { userId: number } {
	return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: number };
}
