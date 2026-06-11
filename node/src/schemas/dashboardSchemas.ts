import { z } from "zod";

// Query params for the paginated dashboard transaction list.
// `view` controls whose transactions are shown:
//   "me"          — the requesting user's own transactions
//   "group"       — all transactions shared with the group
//   "member-{id}" — a specific group member's transactions
export const dashboardTxQuerySchema = z.object({
	view: z.string().min(1),
	page: z.coerce.number().int().min(1).default(1),
	filter: z.enum(["all", "income", "spend"]).default("all"),
	// Optional category narrowing. Matches COALESCE(category, 'Other'), so the
	// value "Other" selects uncategorized transactions. Omitted = all categories.
	category: z.string().min(1).optional(),
	// Timeframe lower bound. "month" = current calendar month-to-date (the default,
	// so the list opens focused rather than as an all-time stream); "all" = no bound.
	range: z.enum(["month", "3m", "6m", "1y", "all"]).default("month"),
	// Optional free-text search over merchant_name/description. Composes with the
	// other filters; omitted = no text filter.
	search: z.string().trim().min(1).optional(),
});

// Query params for the distinct-category dropdown on the transaction list.
// Same `view` semantics as dashboardTxQuerySchema.
export const dashboardTxCategoriesQuerySchema = z.object({
	view: z.string().min(1),
});
