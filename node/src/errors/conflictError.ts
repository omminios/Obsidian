import AppError from "./appError.js";

class ConflictError extends AppError {
	constructor(message: string, details?: Record<string, unknown>) {
		super(message, 409, "CONFLICT_ERROR", true, details);
	}
}

export default ConflictError;
