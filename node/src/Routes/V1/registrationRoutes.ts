import { Router } from "express";
import { registerUser } from "../../services/registrationService";

const router = Router();

router.post("/auth/register", async (req, res) => {
	const newUser = await registerUser(req.body);
	res.status(201).json({
		message: "New User created",
		user: newUser,
	});
});
export default router;
