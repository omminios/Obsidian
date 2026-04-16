import { z } from "zod";

export const createTransactionSchema = z.object({
	transaction_date: z.iso.date(),
	amount: z.number().nullish(),
	description: z.string().nullish(),
	category: z.string().max(50).nullish(),
	merchant_name: z.string().max(255).nullish(),
	plaid_id: z.string().max(255).nullish(),
	entry_method: z.string().optional(),
});

export const deleteTransactionSchema = z.object({
	id: z.number().int().positive(),
});
