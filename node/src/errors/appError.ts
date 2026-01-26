class AppError extends Error {
	statusCode: number;
	errorCode: string;
	operational: boolean;
	details?: Record<string, unknown>;
	timestamp: Date;

	constructor(
		message: string,
		statusCode: number,
		errorCode: string,
		operational = true,
		details?: Record<string, unknown>
	) {
		super(message);
		this.statusCode = statusCode;
		this.errorCode = errorCode;
		this.operational = operational;
		this.details = details;
		this.timestamp = new Date();

		Object.setPrototypeOf(this, new.target.prototype);
		this.name = this.constructor.name;
	}
}

export default AppError;
