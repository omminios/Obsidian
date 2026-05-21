import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeMember } from "../../middleware/authorizeMember.js";
import { validate } from "../../middleware/validate.js";
import {
	getUserDashboardInfo,
	getGroupDashboardInfo,
	getGroupDashboardMembers,
	getMyDashboardAccounts,
	getGroupDashboardAccounts,
	getMyDashboardTransactions,
	getGroupDashboardTransactions,
	getUserDashboardMonthly,
	getGroupDashboardMonthly,
	getUserDashboardCategories,
	getGroupDashboardCategories,
	getMyTransactionsPaged,
	getGroupTransactionsPaged,
	getMemberTransactionsPaged,
} from "../../repository/dashboardRepository.js";

const router = Router();
router.use(authenticate, authorizeMember);

router.get("/summary", async (req, res) => {
	const { userId, groupId } = req.user!;

	const [user, myAccounts, myTxs, myMonthly, myCategories] =
		await Promise.all([
			getUserDashboardInfo(userId),
			getMyDashboardAccounts(userId),
			getMyDashboardTransactions(userId, 15),
			getUserDashboardMonthly(userId),
			getUserDashboardCategories(userId),
		]);

	let group = null;
	let members: Awaited<ReturnType<typeof getGroupDashboardMembers>> = [];
	let membersWithData: Array<
		(typeof members)[number] & {
			monthly: Awaited<ReturnType<typeof getUserDashboardMonthly>>;
			categories: Awaited<ReturnType<typeof getUserDashboardCategories>>;
		}
	> = [];
	let groupAccounts: Awaited<ReturnType<typeof getGroupDashboardAccounts>> =
		[];
	let groupTxs: Awaited<ReturnType<typeof getGroupDashboardTransactions>> =
		[];
	let groupMonthly: Awaited<ReturnType<typeof getGroupDashboardMonthly>> = [];
	let groupCategories: Awaited<
		ReturnType<typeof getGroupDashboardCategories>
	> = [];

	if (groupId) {
		const [groupInfo, rawMembers, gAccounts, gTxs, gMonthly, gCategories] =
			await Promise.all([
				getGroupDashboardInfo(groupId),
				getGroupDashboardMembers(groupId),
				getGroupDashboardAccounts(groupId),
				getGroupDashboardTransactions(groupId, 15),
				getGroupDashboardMonthly(groupId),
				getGroupDashboardCategories(groupId),
			]);

		group = groupInfo;
		members = rawMembers;
		groupAccounts = gAccounts;
		groupTxs = gTxs;
		groupMonthly = gMonthly;
		groupCategories = gCategories;

		membersWithData = await Promise.all(
			rawMembers.map(async (m) => {
				if (m.id === userId) {
					return {
						...m,
						monthly: myMonthly,
						categories: myCategories,
					};
				}
				const [monthly, categories] = await Promise.all([
					getUserDashboardMonthly(m.id),
					getUserDashboardCategories(m.id),
				]);
				return { ...m, monthly, categories };
			})
		);
	} else {
		membersWithData = [];
	}

	res.status(200).json({
		user,
		group,
		members: membersWithData,
		my_accounts: myAccounts,
		group_accounts: groupAccounts,
		my_transactions: myTxs,
		group_transactions: groupTxs,
		my_monthly: myMonthly,
		group_monthly: groupMonthly,
		my_categories: myCategories,
		group_categories: groupCategories,
	});
});

const TX_PAGE_LIMIT = 25;

const txQuerySchema = z.object({
	view: z.string().min(1),
	page: z.coerce.number().int().min(1).default(1),
	filter: z.enum(["all", "income", "spend"]).default("all"),
});

router.get(
	"/transactions",
	validate({ query: txQuerySchema }),
	async (req, res) => {
		const { userId, groupId } = req.user!;
		const { view, page, filter } = req.query as unknown as z.infer<
			typeof txQuerySchema
		>;

		if (view === "me") {
			const result = await getMyTransactionsPaged(
				userId,
				page,
				TX_PAGE_LIMIT,
				filter
			);
			res.status(200).json({
				transactions: result.transactions,
				total: result.total,
				page,
				pages: Math.max(1, Math.ceil(result.total / TX_PAGE_LIMIT)),
				showOwner: false,
			});
			return;
		}

		if (!groupId) {
			res.status(400).json({ message: "No active group" });
			return;
		}

		if (view === "group") {
			const result = await getGroupTransactionsPaged(
				groupId,
				page,
				TX_PAGE_LIMIT,
				filter
			);
			res.status(200).json({
				transactions: result.transactions,
				total: result.total,
				page,
				pages: Math.max(1, Math.ceil(result.total / TX_PAGE_LIMIT)),
				showOwner: true,
			});
			return;
		}

		const memberId = parseInt(view.replace("member-", ""), 10);
		if (isNaN(memberId)) {
			res.status(400).json({ message: "Invalid view" });
			return;
		}
		const result = await getMemberTransactionsPaged(
			groupId,
			memberId,
			page,
			TX_PAGE_LIMIT,
			filter
		);
		res.status(200).json({
			transactions: result.transactions,
			total: result.total,
			page,
			pages: Math.max(1, Math.ceil(result.total / TX_PAGE_LIMIT)),
			showOwner: false,
		});
	}
);

export default router;
