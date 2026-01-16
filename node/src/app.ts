import express, { Request, Response, NextFunction } from "express";
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
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error(err.stack);

	res.status(err.status || 500).json({
		success: false,
		message: err.message || 'Internal Server Error',
	});
});

export default app;
