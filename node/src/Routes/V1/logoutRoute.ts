import { Router, Request, Response, NextFunction } from "express";
import { logoutUser } from "../../services/auth/logoutService.js";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
	try {
		const refreshToken = req.cookies?.refreshToken;

		if (refreshToken) {
			await logoutUser(refreshToken);
		}

		res.clearCookie("access_token");
		res.clearCookie("refreshToken");

		res.status(200).json({ message: "Logged out successfully" });
	} catch (err) {
		next(err);
	}
});

export default router;
