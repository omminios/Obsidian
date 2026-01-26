import AppError from "./appError.js";

class ExternalServiceError extends AppError {
	constructor(service: string, message?: string, details?: Record<string, unknown>) {
		const errorMessage = message
			? `${service}: ${message}`
			: `${service} is currently unavailable`;
		super(errorMessage, 502, "EXTERNAL_SERVICE_ERROR", false, { service, ...details });
	}
}

export default ExternalServiceError;
