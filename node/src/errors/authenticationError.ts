import AppError from "./appError.js";

class AuthenticationError extends AppError {
	constructor(message = "Authentication required", details?: Record<string, unknown>) {
		super(message, 401, "AUTHENTICATION_ERROR", true, details);
	}
}

export default AuthenticationError;
