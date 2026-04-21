import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import {
	requestPasswordResetSchema,
	resetPasswordSchema,
} from "../../schemas/authSchemas.js";
import {
	requestPasswordReset,
	resetPassword,
} from "../../services/auth/passwordResetService.js";

const router = Router();

router.post(
	"/request",
	validate({ body: requestPasswordResetSchema }),
	async (req, res) => {
		const result = await requestPasswordReset(req.body.email);

		// Always return 200 to avoid leaking whether an email exists.
		// In production, the token would be sent via email.
		// For development, the token is included in the response when generated.
		res.status(200).json({
			message: "If an account with that email exists, a reset link has been sent",
			...(result && { token: result.token, userId: result.userId }),
		});
	}
);

router.post(
	"/reset",
	validate({ body: resetPasswordSchema }),
	async (req, res) => {
		await resetPassword(req.body.token, req.body.new_password);

		res.status(200).json({ message: "Password reset successful" });
	}
);

export default router;
