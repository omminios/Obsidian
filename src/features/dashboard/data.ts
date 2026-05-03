export type Month = { m: string; inc: number; spend: number };

export type Category = { name: string; v: number; c: string };

export type Transaction = {
	d: string;
	name: string;
	cat: string;
	amt: number;
	acct: string;
	positive?: boolean;
	who?: string;
};

export type View = {
	name: string;
	role: string;
	avatar: string;
	color: string;
	months: Month[];
	categories: Category[];
	tx: Transaction[];
};

export type ViewKey = "me" | "group" | "jordan" | "riley";

export const VIEWS: Record<ViewKey, View> = {
	me: {
		name: "Morgan Park",
		role: "You",
		avatar: "M",
		color: "tx-1",
		months: [
			{ m: "May", inc: 8210, spend: 4820 },
			{ m: "Jun", inc: 8210, spend: 5120 },
			{ m: "Jul", inc: 8210, spend: 4980 },
			{ m: "Aug", inc: 8410, spend: 5240 },
			{ m: "Sep", inc: 8410, spend: 4710 },
			{ m: "Oct", inc: 8410, spend: 4980 },
			{ m: "Nov", inc: 8410, spend: 5840 },
			{ m: "Dec", inc: 9210, spend: 6420 },
			{ m: "Jan", inc: 8410, spend: 5180 },
			{ m: "Feb", inc: 8410, spend: 4720 },
			{ m: "Mar", inc: 8940, spend: 5060 },
			{ m: "Apr", inc: 8940, spend: 3284 },
		],
		categories: [
			{ name: "Housing", v: 1840, c: "cat-1" },
			{ name: "Groceries", v: 482, c: "cat-2" },
			{ name: "Transport", v: 286, c: "cat-3" },
			{ name: "Subscriptions", v: 148, c: "cat-4" },
			{ name: "Dining", v: 214, c: "cat-5" },
			{ name: "Other", v: 314, c: "cat-6" },
		],
		tx: [
			{ d: "Apr 28", name: "Whole Foods Market", cat: "Groceries", amt: -84.2, acct: "Chase ••4421" },
			{ d: "Apr 27", name: "Apple", cat: "Subscriptions", amt: -9.99, acct: "Amex ••8810" },
			{ d: "Apr 26", name: "Acme Corp · Payroll", cat: "Income", amt: 4210.0, acct: "Chase ••4421", positive: true },
			{ d: "Apr 25", name: "Shell", cat: "Transport", amt: -48.1, acct: "Amex ••8810" },
			{ d: "Apr 25", name: "Spotify", cat: "Subscriptions", amt: -16.99, acct: "Amex ••8810" },
			{ d: "Apr 24", name: "Trader Joe’s", cat: "Groceries", amt: -52.84, acct: "Chase ••4421" },
		],
	},
	group: {
		name: "The Park Avenue Household",
		role: "Group",
		avatar: "P",
		color: "tx-3",
		months: [
			{ m: "May", inc: 14820, spend: 8420 },
			{ m: "Jun", inc: 14820, spend: 8980 },
			{ m: "Jul", inc: 14820, spend: 8210 },
			{ m: "Aug", inc: 15240, spend: 9120 },
			{ m: "Sep", inc: 15240, spend: 8540 },
			{ m: "Oct", inc: 15240, spend: 9210 },
			{ m: "Nov", inc: 15240, spend: 10240 },
			{ m: "Dec", inc: 16640, spend: 11820 },
			{ m: "Jan", inc: 15240, spend: 9420 },
			{ m: "Feb", inc: 15240, spend: 8780 },
			{ m: "Mar", inc: 16140, spend: 9120 },
			{ m: "Apr", inc: 16140, spend: 6890 },
		],
		categories: [
			{ name: "Housing", v: 3200, c: "cat-1" },
			{ name: "Groceries", v: 920, c: "cat-2" },
			{ name: "Transport", v: 540, c: "cat-3" },
			{ name: "Subscriptions", v: 246, c: "cat-4" },
			{ name: "Dining", v: 610, c: "cat-5" },
			{ name: "Childcare", v: 1100, c: "cat-6" },
			{ name: "Other", v: 274, c: "cat-7" },
		],
		tx: [
			{ d: "Apr 28", name: "Whole Foods Market", cat: "Groceries", amt: -84.2, acct: "Morgan · Chase ••4421", who: "M" },
			{ d: "Apr 28", name: "PG&E", cat: "Housing", amt: -184.4, acct: "Jordan · Chase ••2210", who: "J" },
			{ d: "Apr 27", name: "Apple", cat: "Subscriptions", amt: -9.99, acct: "Morgan · Amex ••8810", who: "M" },
			{ d: "Apr 27", name: "Acme · Payroll", cat: "Income", amt: 4210.0, acct: "Morgan · Chase ••4421", who: "M", positive: true },
			{ d: "Apr 26", name: "Stripe · Payroll", cat: "Income", amt: 5120.0, acct: "Jordan · Chase ••2210", who: "J", positive: true },
			{ d: "Apr 25", name: "Shell", cat: "Transport", amt: -48.1, acct: "Morgan · Amex ••8810", who: "M" },
			{ d: "Apr 24", name: "Bright Horizons", cat: "Childcare", amt: -420.0, acct: "Jordan · Chase ••2210", who: "J" },
		],
	},
	jordan: {
		name: "Jordan Park",
		role: "Spouse",
		avatar: "J",
		color: "tx-2",
		months: [
			{ m: "May", inc: 6610, spend: 3600 },
			{ m: "Jun", inc: 6610, spend: 3860 },
			{ m: "Jul", inc: 6610, spend: 3230 },
			{ m: "Aug", inc: 6830, spend: 3880 },
			{ m: "Sep", inc: 6830, spend: 3830 },
			{ m: "Oct", inc: 6830, spend: 4230 },
			{ m: "Nov", inc: 6830, spend: 4400 },
			{ m: "Dec", inc: 7430, spend: 5400 },
			{ m: "Jan", inc: 6830, spend: 4240 },
			{ m: "Feb", inc: 6830, spend: 4060 },
			{ m: "Mar", inc: 7200, spend: 4060 },
			{ m: "Apr", inc: 7200, spend: 3606 },
		],
		categories: [
			{ name: "Housing", v: 1360, c: "cat-1" },
			{ name: "Childcare", v: 1100, c: "cat-6" },
			{ name: "Groceries", v: 438, c: "cat-2" },
			{ name: "Transport", v: 254, c: "cat-3" },
			{ name: "Dining", v: 396, c: "cat-5" },
			{ name: "Subscriptions", v: 58, c: "cat-4" },
		],
		tx: [
			{ d: "Apr 28", name: "PG&E", cat: "Housing", amt: -184.4, acct: "Chase ••2210" },
			{ d: "Apr 26", name: "Stripe · Payroll", cat: "Income", amt: 5120.0, acct: "Chase ••2210", positive: true },
			{ d: "Apr 24", name: "Bright Horizons", cat: "Childcare", amt: -420.0, acct: "Chase ••2210" },
			{ d: "Apr 23", name: "Uber", cat: "Transport", amt: -22.4, acct: "Amex ••5544" },
			{ d: "Apr 22", name: "Tartine Bakery", cat: "Dining", amt: -38.9, acct: "Amex ••5544" },
		],
	},
	riley: {
		name: "Riley Park",
		role: "Viewer",
		avatar: "R",
		color: "tx-4",
		months: [
			{ m: "May", inc: 0, spend: 380 },
			{ m: "Jun", inc: 0, spend: 410 },
			{ m: "Jul", inc: 0, spend: 320 },
			{ m: "Aug", inc: 0, spend: 510 },
			{ m: "Sep", inc: 0, spend: 380 },
			{ m: "Oct", inc: 0, spend: 470 },
			{ m: "Nov", inc: 0, spend: 540 },
			{ m: "Dec", inc: 0, spend: 720 },
			{ m: "Jan", inc: 0, spend: 410 },
			{ m: "Feb", inc: 0, spend: 360 },
			{ m: "Mar", inc: 0, spend: 410 },
			{ m: "Apr", inc: 0, spend: 290 },
		],
		categories: [
			{ name: "Allowance", v: 120, c: "cat-3" },
			{ name: "Dining", v: 84, c: "cat-5" },
			{ name: "Subscriptions", v: 14, c: "cat-4" },
			{ name: "Other", v: 72, c: "cat-6" },
		],
		tx: [
			{ d: "Apr 28", name: "Chipotle", cat: "Dining", amt: -14.2, acct: "Visa ••1102" },
			{ d: "Apr 26", name: "Spotify", cat: "Subscriptions", amt: -5.99, acct: "Visa ••1102" },
			{ d: "Apr 24", name: "Allowance", cat: "Allowance", amt: 120.0, acct: "Visa ••1102", positive: true },
		],
	},
};

export type RangeKey = "1M" | "3M" | "6M" | "1Y";

export const RANGES: Record<RangeKey, { months: number; label: string }> = {
	"1M": { months: 1, label: "Last month" },
	"3M": { months: 3, label: "Last 3 months" },
	"6M": { months: 6, label: "Last 6 months" },
	"1Y": { months: 12, label: "Last 12 months" },
};

export type Slice = {
	months: Month[];
	inc: number;
	spend: number;
	savings: number;
};

export function sliceMonths(view: View, range: RangeKey): Slice {
	const months = view.months.slice(-RANGES[range].months);
	const inc = months.reduce((a, b) => a + b.inc, 0);
	const spend = months.reduce((a, b) => a + b.spend, 0);
	return { months, inc, spend, savings: inc - spend };
}

export function fmt(n: number, opts: { signed?: boolean; cents?: boolean } = {}): string {
	const { signed = false, cents = false } = opts;
	const abs = Math.abs(n);
	const s = abs.toLocaleString("en-US", {
		minimumFractionDigits: cents ? 2 : 0,
		maximumFractionDigits: cents ? 2 : 0,
	});
	if (signed) return (n >= 0 ? "+" : "−") + "$" + s;
	return (n < 0 ? "−" : "") + "$" + s;
}

export type GroupView = {
	k: ViewKey;
	name: string;
	sub: string;
	ava: string;
	col: string;
	role: string;
};

export const GROUP_VIEWS: GroupView[] = [
	{ k: "group", name: "Household", sub: "Everyone", ava: "P", col: "ava-3", role: "Group" },
	{ k: "me", name: "Morgan Park", sub: "You · leader", ava: "M", col: "ava-1", role: "Leader" },
	{ k: "jordan", name: "Jordan Park", sub: "Member", ava: "J", col: "ava-2", role: "Member" },
	{ k: "riley", name: "Riley Park", sub: "Viewer", ava: "R", col: "ava-4", role: "Viewer" },
];
