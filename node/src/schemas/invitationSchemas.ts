import { z } from "zod";

export const createInvitationSchema = z.object({
	invitee_email: z.email(),
});

export const acceptInvitationSchema = z.object({
	token: z.string().min(1),
});

export const declineInvitationSchema = z.object({
	token: z.string().min(1),
});
