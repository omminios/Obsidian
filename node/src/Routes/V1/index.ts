import { Router } from "express";
import userRoutes from "./userRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
import groupRoutes from "./groupRoutes.js";
import accountRoutes from "./accountRoutes.js";
import adminRoutes from "./adminRoutes.js";
import registerRoutes from "./registrationRoutes.js";
import loginRoutes from "./loginRoute.js";
import logoutRoutes from "./logoutRoute.js";

const router = Router();

// Public routes
router.use("/register", registerRoutes);
router.use("/login", loginRoutes);
router.use("/logout", logoutRoutes);

// Authenticated routes
router.use("/users", userRoutes);
router.use("/transactions", transactionRoutes);
router.use("/groups", groupRoutes);
router.use("/accounts", accountRoutes);

// Admin routes
router.use("/admin", adminRoutes);

export default router;

//Note need to import Zod for schema validation later.
