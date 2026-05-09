import { z } from "zod";

export const exchangePublicTokenSchema = z.object({
	public_token: z.string().min(1),
});
