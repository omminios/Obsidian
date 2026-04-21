import { Router } from "express";
import userRoutes from "./userRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
import groupRoutes from "./groupRoutes.js";
import accountRoutes from "./accountRoutes.js";
import adminRoutes from "./adminRoutes.js";
import registerRoutes from "./registrationRoutes.js";
import loginRoutes from "./loginRoute.js";
import logoutRoutes from "./logoutRoute.js";
import passwordResetRoutes from "./passwordResetRoutes.js";
import invitationRoutes from "./invitationRoutes.js";

const router = Router();

// Public routes
router.use("/register", registerRoutes);
router.use("/login", loginRoutes);
router.use("/logout", logoutRoutes);
router.use("/password-reset", passwordResetRoutes);

// Authenticated routes
router.use("/users", userRoutes);
router.use("/transactions", transactionRoutes);
router.use("/groups", groupRoutes);
router.use("/accounts", accountRoutes);
router.use("/invitations", invitationRoutes);

// Admin routes
router.use("/admin", adminRoutes);

export default router;
