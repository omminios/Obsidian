import { z } from "zod";

export const deleteUserSchema = z.object({
	id: z.number().int().positive(),
});

// Admin user creation — same shape as registration input
export const createUserSchema = z.object({
	email: z.email().max(255),
	password_hash: z.string().min(8).max(255),
	username: z.string().min(1).max(30),
	first_name: z.string().min(1).max(50),
	last_name: z.string().min(1).max(50),
});
