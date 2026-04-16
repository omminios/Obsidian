import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

export const registerSchema = z.object({
	email: z.email(),
	password_hash: z.string().min(8).max(255),
	username: z.string().min(1).max(30),
	first_name: z.string().min(1).max(50),
	last_name: z.string().min(1).max(50),
});
