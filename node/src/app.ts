import express, { Request, Response, NextFunction } from "express";
import AppError from "./errors/appError.js";
import v1Routes from "./Routes/V1/index.js";

const app = express();

// ============================================
// Middleware
// ============================================
app.use(express.json());

// ============================================
// Routes
// ============================================
app.get("/health", (_req, res) => {
	res.status(200).json({
		status: "OK",
		timestamp: new Date().toISOString(),
	});
});

app.get("/", (_req, res) => {
	res.send("Hello world!");
});

// API v1 routes
app.use("/api/v1", v1Routes);

// ============================================
// Error Handling
// ============================================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	// If it's an operational AppError, send structured response
	if (err instanceof AppError) {
		return res.status(err.statusCode).json({
			status: "error",
			errorCode: err.errorCode,
			message: err.message,
			details: err.details,
			timestamp: err.timestamp,
		});
	}
	next();
	// Unknown/unexpected error - don't leak details
	console.error(err.stack);
	return res.status(500).json({
		status: "error",
		errorCode: "INTERNAL_ERROR",
		message: "An unexpected error occurred",
	});
});

export default app;
