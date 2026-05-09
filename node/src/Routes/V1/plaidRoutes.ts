import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeMember } from "../../middleware/authorizeMember.js";
import { validate } from "../../middleware/validate.js";
import { createLinkToken } from "../../services/plaid/linkTokenService.js";
import { exchangePublicToken } from "../../services/plaid/itemService.js";
import { exchangePublicTokenSchema } from "../../schemas/plaidSchemas.js";

const router = Router();

router.use(authenticate, authorizeMember);

router.post("/link-token", async (req, res) => {
	const { link_token, expiration } = await createLinkToken(req.user!.userId);
	res.status(200).json({ link_token, expiration });
});

router.post(
	"/exchange-token",
	validate({ body: exchangePublicTokenSchema }),
	async (req, res) => {
		const result = await exchangePublicToken(
			req.user!.userId,
			req.user!.groupId!,
			req.body.public_token
		);
		res.status(201).json({
			message: "Bank connected",
			institution_name: result.institutionName,
			accounts: result.accounts,
			transaction_count: result.transactionCount,
		});
	}
);

export default router;
