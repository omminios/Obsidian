import AppError from "./appError.js";

class AuthorizationError extends AppError {
	constructor(message = "You do not have permission to perform this action", details?: Record<string, unknown>) {
		super(message, 403, "AUTHORIZATION_ERROR", true, details);
	}
}

export default AuthorizationError;
