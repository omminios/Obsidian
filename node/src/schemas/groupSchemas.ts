import { z } from "zod";

export const createGroupSchema = z.object({
	name: z.string().min(1).max(50),
	max_users: z.number().int().min(1).nullish(),
});

export const deleteGroupSchema = z.object({
	id: z.number().int().positive(),
});

export const leaveGroupSchema = z.object({
	id: z.number().int().positive(),
});
