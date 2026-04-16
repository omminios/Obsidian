import { z } from "zod";

export const createAccountSchema = z.object({
	account_name: z.string().min(1).max(255),
	account_type: z.enum(["checking", "savings", "credit", "investment"]).nullish(),
	institution_name: z.string().max(255).nullish(),
	last_four: z.string().length(4).nullish(),
	plaid_account_id: z.string().max(255).nullish(),
	plaid_item_id: z.string().max(255).nullish(),
	balance_current: z.number().nullish(),
	balance_available: z.number().nullish(),
	currency_code: z.string().max(3).nullish(),
	is_active: z.boolean().nullish(),
});

export const deleteAccountSchema = z.object({
	account_id: z.number().int().positive(),
});
