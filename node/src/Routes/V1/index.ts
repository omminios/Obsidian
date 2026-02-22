import { Router } from "express";
import userRoutes from "./userRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
import groupRoutes from "./groupRoutes.js";
import accountRoutes from "./accountRoutes.js";
import registerRoutes from "./registrationRoutes.js";

const router = Router();

// Mount all v1 routes
router.use("/users", userRoutes);
router.use("/transactions", transactionRoutes);
router.use("/groups", groupRoutes);
router.use("/accounts", accountRoutes);
router.use("/register", registerRoutes);

export default router;

//Note need to import Zod for schema validation later.
