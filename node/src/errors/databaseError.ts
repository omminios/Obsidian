import AppError from "./appError.js";

class DatabaseError extends AppError {
	constructor(message = "A database error occurred", details?: Record<string, unknown>) {
		super(message, 500, "DATABASE_ERROR", false, details);
	}
}

export default DatabaseError;
