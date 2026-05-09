import { z } from "zod";

export const deleteGroupSchema = z.object({
	id: z.number().int().positive(),
});

export const leaveGroupSchema = z.object({
	id: z.number().int().positive(),
});

export const kickMemberSchema = z.object({
	user_id: z.number().int().positive(),
});
