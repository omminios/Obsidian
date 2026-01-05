import express from "express";
import { getUserID, getUsers } from "./services/userServices";
import { transactionformat } from "./services/transactionService";
import { groupformat } from "./services/groupService";
import { accountformat } from "./services/accountService";
import { createUser } from "./services/userServices";

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

// Users
app.get("/users", async (_req, res) => {
	try {
		const data = await getUsers();
		res.status(200).json({
			message: "Data received successfully",
			data: data,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			error: "Request failed.",
		});
	}
});

app.get("/users/:id", async (req, res) => {
	try {
		const payload = req.params.id;
		const ID = Number(payload);
		const data = await getUserID(ID);
		res.status(200).json({
			message: "Data received successfully",
			data: data,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			error: "Request failed.",
		});
	}
});

app.post("/users", async (req, res) => {
	try {
		const request_body = req.body;
		console.log(request_body);
		const newUser = await createUser(request_body);
		res.status(200).json({
			message: "New User created",
			user: newUser,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			error: "Creation failed",
		});
	}
});

// Transactions
app.get("/transactions", transactionformat, (_req, res) => {
	console.log("transactions work");

	res.send("Transactions page");
});
// Groups
app.get("/groups", groupformat, (_req, res) => {
	console.log("groups work");

	res.send("Groups page");
});
// accounts
app.get("/accounts", accountformat, (_req, res) => {
	console.log("accounts work");

	res.send("Accounts page");
});

// ============================================
// Error Handling
// ============================================
app.use((_req, res) => {
	res.status(404).json({ error: "Route not found" });
});

// Export the app (don't start the server here!)
export default app;
