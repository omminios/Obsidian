import { z } from "zod";

// URL param :id — arrives as a string, coerce to number
export const idParamSchema = z.object({
	id: z.coerce.number().int().positive(),
});

// Pagination query params with defaults
export const paginationQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(15),
	offset: z.coerce.number().int().min(0).default(0),
});
