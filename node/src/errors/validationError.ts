import AppError from "./appError.js";

class ValidationError extends AppError {
	constructor(message: string, details?: Record<string, unknown>) {
		super(message, 400, "VALIDATION_ERROR", true, details);
	}
}

export default ValidationError;
