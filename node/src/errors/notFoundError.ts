import AppError from "./appError.js";

class NotFoundError extends AppError {
	constructor(resource: string, identifier?: string) {
		const message = identifier
			? `${resource} with id '${identifier}' not found`
			: `${resource} not found`;
		super(message, 404, "NOT_FOUND", true, { resource, identifier });
	}
}

export default NotFoundError;
