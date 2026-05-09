// Roll-up mapping from Plaid's (type, subtype) to our 5-bucket account_type.
// Plaid's full taxonomy (30+ subtypes) is stored verbatim in
// accounts.plaid_type / plaid_subtype; this is purely the dashboard rollup.
// Returns null only when the type is genuinely unknown ('other' / unmapped) so
// the caller can warn and skip.

export type AccountType =
	| "checking"
	| "savings"
	| "credit"
	| "investment"
	| "loan";

export function mapSubtype(
	type: string | null | undefined,
	subtype: string | null | undefined
): AccountType | null {
	switch (type) {
		case "depository":
			if (subtype === "checking") return "checking";
			return "savings";
		case "credit":
			return "credit";
		case "investment":
		case "brokerage":
			return "investment";
		case "loan":
			return "loan";
		case "other":
		default:
			return null;
	}
}
