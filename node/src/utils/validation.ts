import { ValidationError } from "../errors/index.js";

export function validateId(value: string, fieldName: string): number {
	const id = Number(value);
	if (isNaN(id)) {
		throw new ValidationError(`Invalid ${fieldName}`, {
			field: fieldName,
			received: value,
		});
	}
	return id;
}

export function validatePagination(query: {
	limit?: number;
	offset?: number;
}): { limit: number; offset: number } {
	const limit = Number(query.limit) || 15;
	const offset = Number(query.offset) || 0;

	if (limit < 1 || limit > 100) {
		throw new ValidationError("Limit must be between 1 and 100", {
			field: "limit",
			received: query.limit,
		});
	}

	if (offset < 0) {
		throw new ValidationError("Offset must be non-negative", {
			field: "offset",
			received: query.offset,
		});
	}

	return { limit, offset };
}
