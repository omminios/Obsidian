import { useEffect, useMemo, useRef, useState } from "react";
import { buildTransactions, fmt, RANGES, type AccountDisplay, type RangeKey, type Slice, type Transaction, type View, type ViewKey } from "./data";
import { BarChart, DualLineChart, PieChart } from "./charts";
import { api, ApiError, type TxPageFilter } from "../../lib/api";

type ChartKind = "line" | "pie" | "bar";

type Accent = "pos" | "neg" | "warn" | null;

function KPI({
	label,
	value,
	sub,
	accent,
}: {
	label: string;
	value: string;
	sub: string;
	accent?: Accent;
}) {
	return (
		<div className={`kpi ${accent || ""}`}>
			<div className="kpi-l">{label}</div>
			<div className="kpi-v mono">{value}</div>
			<div className="kpi-sub">{sub}</div>
		</div>
	);
}

function Insight({
	tone,
	title,
	body,
}: {
	tone: "pos" | "neg" | "warn" | "info";
	title: string;
	body: string;
}) {
	return (
		<li className={`insight insight-${tone}`}>
			<span className="insight-dot" />
			<div>
				<div className="insight-t">{title}</div>
				<div className="insight-b">{body}</div>
			</div>
		</li>
	);
}

function SegIconLine() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M2 11l3-4 3 2 6-6" />
		</svg>
	);
}

function SegIconPie() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M8 2v6l5 3.2" />
			<circle cx="8" cy="8" r="6" />
		</svg>
	);
}

function SegIconBar() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="2" y="9" width="3" height="5" rx="0.5" />
			<rect x="6.5" y="5" width="3" height="9" rx="0.5" />
			<rect x="11" y="7" width="3" height="7" rx="0.5" />
		</svg>
	);
}

function txTagClass(cat: string): string {
	const ch = (cat[0] || "X").toUpperCase().charCodeAt(0);
	return `tx-${(ch % 6) + 1}`;
}

export function DashboardTab({
	v,
	slice,
	range,
	setRange,
	view,
	onViewAllTransactions,
}: {
	v: View;
	slice: Slice;
	range: RangeKey;
	setRange: (r: RangeKey) => void;
	view: ViewKey;
	onViewAllTransactions: () => void;
}) {
	const [chart, setChart] = useState<ChartKind>("line");
	const savingsRate = slice.inc > 0 ? (slice.savings / slice.inc) * 100 : 0;
	const monthsLen = slice.months.length || 1;
	const totalCategorySpend = v.categories.reduce((a, b) => a + b.v, 0) || 1;

	return (
		<div className="db-content">
			<div className="kpi-strip" key={view + range}>
				<KPI
					label="Net cash flow"
					value={fmt(slice.savings, { signed: true })}
					sub={`${RANGES[range].label.toLowerCase()} · ${savingsRate.toFixed(0)}% of income`}
					accent={slice.savings >= 0 ? "pos" : "neg"}
				/>
				<KPI
					label="Income"
					value={fmt(slice.inc)}
					sub={`Across ${monthsLen} mo · ${fmt(Math.round(slice.inc / monthsLen))} avg`}
				/>
				<KPI
					label="Spending"
					value={fmt(slice.spend)}
					sub={`${fmt(Math.round(slice.spend / monthsLen))} avg / mo`}
				/>
				<KPI
					label="Savings rate"
					value={`${savingsRate.toFixed(1)}%`}
					sub={savingsRate >= 20 ? "On pace · keep it up" : "Below 20% target"}
					accent={savingsRate >= 20 ? "pos" : "warn"}
				/>
			</div>

			<section className="panel chart-panel">
				<div className="panel-head">
					<div>
						<h2 className="panel-h">Activity</h2>
						<p className="panel-sub">
							{chart === "line" ? "Income vs spending over time." : null}
							{chart === "pie" ? "Where your money went, by category." : null}
							{chart === "bar"
								? "Net cash flow each month — green saved, red overspent."
								: null}
						</p>
					</div>
					<div className="panel-controls">
						<div className="seg seg-chart" role="tablist" aria-label="Chart type">
							<button
								role="tab"
								aria-selected={chart === "line"}
								className={`seg-btn ${chart === "line" ? "active" : ""}`}
								onClick={() => setChart("line")}
							>
								<SegIconLine /> <span>Lines</span>
							</button>
							<button
								role="tab"
								aria-selected={chart === "pie"}
								className={`seg-btn ${chart === "pie" ? "active" : ""}`}
								onClick={() => setChart("pie")}
							>
								<SegIconPie /> <span>Pie</span>
							</button>
							<button
								role="tab"
								aria-selected={chart === "bar"}
								className={`seg-btn ${chart === "bar" ? "active" : ""}`}
								onClick={() => setChart("bar")}
							>
								<SegIconBar /> <span>Bars</span>
							</button>
						</div>
						<div className="seg seg-range" role="tablist" aria-label="Timeframe">
							{(Object.keys(RANGES) as RangeKey[]).map((r) => (
								<button
									key={r}
									role="tab"
									aria-selected={range === r}
									className={`seg-btn seg-btn-sm ${range === r ? "active" : ""}`}
									onClick={() => setRange(r)}
								>
									{r}
								</button>
							))}
						</div>
					</div>
				</div>

				<div className="chart-stage" key={chart + view + range}>
					{chart === "line" ? <DualLineChart months={slice.months} /> : null}
					{chart === "pie" ? <PieChart categories={v.categories} /> : null}
					{chart === "bar" ? <BarChart months={slice.months} /> : null}
				</div>
			</section>

			<div className="db-row-2">
				<section className="panel">
					<div className="panel-head">
						<div>
							<h2 className="panel-h">Recent transactions</h2>
							<p className="panel-sub">
								{view === "group" ? "All household members" : v.name}
							</p>
						</div>
						<button className="link-btn" onClick={onViewAllTransactions}>
							View all →
						</button>
					</div>
					<ul className="tx-list">
						{v.tx.slice(0, 15).map((t, i) => (
							<TxRow key={i} t={t} />
						))}
					</ul>
				</section>

				<section className="panel">
					<div className="panel-head">
						<div>
							<h2 className="panel-h">Insights</h2>
							<p className="panel-sub">Auto-generated for {v.name}</p>
						</div>
					</div>
					<ul className="insight-list">
						<Insight
							tone="pos"
							title="Spending dropped 12% this month"
							body={`You spent ${fmt(Math.floor(slice.spend / monthsLen))} on average — below your 6-month baseline.`}
						/>
						<Insight
							tone="info"
							title={`Top category: ${v.categories[0]?.name ?? "—"}`}
							body={`${fmt(v.categories[0]?.v ?? 0)} this month, ${(((v.categories[0]?.v ?? 0) / totalCategorySpend) * 100).toFixed(0)}% of all spending.`}
						/>
						<Insight
							tone={savingsRate >= 20 ? "pos" : "warn"}
							title={savingsRate >= 20 ? "Savings rate on track" : "Savings rate below target"}
							body={`Currently ${savingsRate.toFixed(1)}%. Most households aim for 20% or more.`}
						/>
						<Insight
							tone="info"
							title="3 subscriptions due this week"
							body="Apple, Spotify, and NYT auto-renew between Apr 30 and May 3."
						/>
					</ul>
				</section>
			</div>
		</div>
	);
}

function TxRow({ t }: { t: Transaction }) {
	return (
		<li className="tx-li">
			<span className={`tx-tag ${txTagClass(t.cat)}`}>{t.cat[0]}</span>
			<div className="tx-li-meta">
				<div className="tx-li-name">{t.name}</div>
				<div className="tx-li-sub">
					<span>{t.cat}</span>
					<span className="dot-sep">·</span>
					<span>{t.acct}</span>
					<span className="dot-sep">·</span>
					<span>{t.d}</span>
				</div>
			</div>
			<div className={`tx-li-amt mono ${t.positive ? "pos" : ""}`}>
				{fmt(t.amt, { signed: true, cents: true })}
			</div>
		</li>
	);
}

export function TabTransactions({ view }: { v: View; view: ViewKey }) {
	const [filter, setFilter] = useState<TxPageFilter>("all");
	const [page, setPage] = useState(1);
	const [txs, setTxs] = useState<Transaction[]>([]);
	const [total, setTotal] = useState(0);
	const [pages, setPages] = useState(1);
	const [loading, setLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const prevViewRef = useRef(view);

	useEffect(() => {
		let cancelled = false;
		const isViewChange = prevViewRef.current !== view;
		prevViewRef.current = view;
		const effectivePage = isViewChange ? 1 : page;
		if (isViewChange) setPage(1);

		setLoading(true);
		setFetchError(null);
		api
			.getTransactionPage(view, effectivePage, filter)
			.then((data) => {
				if (cancelled) return;
				setTxs(buildTransactions(data.transactions, data.showOwner));
				setTotal(data.total);
				setPages(data.pages);
			})
			.catch((err) => {
				if (cancelled) return;
				console.error("[TabTransactions] fetch failed", err);
				setFetchError(err instanceof Error ? err.message : String(err));
			})
			.finally(() => { if (!cancelled) setLoading(false); });

		return () => { cancelled = true; };
	}, [view, page, filter]);

	const handleFilter = (f: TxPageFilter) => {
		setFilter(f);
		setPage(1);
	};

	const totalIn = useMemo(() => txs.filter((t) => t.positive).reduce((s, t) => s + t.amt, 0), [txs]);
	const totalOut = useMemo(() => txs.filter((t) => !t.positive).reduce((s, t) => s + Math.abs(t.amt), 0), [txs]);

	return (
		<div className="db-content" key={view}>
			<div className="kpi-strip">
				<KPI
					label="Money in"
					value={fmt(totalIn, { cents: true })}
					sub={`${txs.filter((t) => t.positive).length} on this page`}
					accent="pos"
				/>
				<KPI
					label="Money out"
					value={fmt(totalOut, { cents: true })}
					sub={`${txs.filter((t) => !t.positive).length} on this page`}
					accent="neg"
				/>
				<KPI
					label="Net"
					value={fmt(totalIn - totalOut, { signed: true, cents: true })}
					sub="This page"
				/>
				<KPI
					label="Total"
					value={total.toLocaleString()}
					sub={filter === "all" ? "transactions" : `${filter} transactions`}
				/>
			</div>

			<section className="panel">
				<div className="panel-head">
					<div>
						<h2 className="panel-h">All transactions</h2>
						<p className="panel-sub">
							Page {page} of {pages} · {total.toLocaleString()} total
						</p>
					</div>
					<div className="panel-controls">
						<div className="seg">
							<button
								className={`seg-btn ${filter === "all" ? "active" : ""}`}
								onClick={() => handleFilter("all")}
							>
								All
							</button>
							<button
								className={`seg-btn ${filter === "income" ? "active" : ""}`}
								onClick={() => handleFilter("income")}
							>
								Income
							</button>
							<button
								className={`seg-btn ${filter === "spend" ? "active" : ""}`}
								onClick={() => handleFilter("spend")}
							>
								Spending
							</button>
						</div>
					</div>
				</div>

				{loading ? (
					<div className="tx-loading">Loading…</div>
				) : fetchError ? (
					<div className="tx-loading" style={{ color: "oklch(0.55 0.18 25)" }}>
						Failed to load: {fetchError}
					</div>
				) : (
					<ul className="tx-list">
						{txs.map((t, i) => (
							<TxRow key={i} t={t} />
						))}
						{txs.length === 0 ? (
							<li className="tx-empty">No transactions found.</li>
						) : null}
					</ul>
				)}

				{pages > 1 ? (
					<div className="tx-pagination">
						<button
							className="btn btn-sm btn-ghost"
							onClick={() => setPage((p) => p - 1)}
							disabled={page <= 1 || loading}
						>
							← Prev
						</button>
						<span className="tx-page-label">
							{page} / {pages}
						</span>
						<button
							className="btn btn-sm btn-ghost"
							onClick={() => setPage((p) => p + 1)}
							disabled={page >= pages || loading}
						>
							Next →
						</button>
					</div>
				) : null}
			</section>
		</div>
	);
}


function formatSyncTime(iso: string | null): string {
	if (!iso) return "Never synced";
	return (
		"Last synced at " +
		new Date(iso).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		})
	);
}

export function TabAccounts({ v, view, accounts }: { v: View; view: ViewKey; accounts: AccountDisplay[] }) {
	const accts = accounts;
	const total = accts.reduce((a, b) => a + b.bal, 0);
	const cash = accts
		.filter((a) => a.t.startsWith("Checking") || a.t.startsWith("Savings"))
		.reduce((s, a) => s + a.bal, 0);
	const inv = accts
		.filter((a) => a.t.startsWith("Invest") || a.t.startsWith("Retire"))
		.reduce((s, a) => s + a.bal, 0);
	const debt = accts.filter((a) => a.bal < 0).reduce((s, a) => s + a.bal, 0);

	const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
	const [isSyncing, setIsSyncing] = useState(false);

	useEffect(() => {
		api.getSyncStatus()
			.then((d) => {
				setLastSyncedAt(d.last_synced_at);
				setIsSyncing(d.is_syncing);
			})
			.catch(() => {});
	}, []);

	const handleSync = async () => {
		setIsSyncing(true);
		try {
			const result = await api.triggerSync();
			setLastSyncedAt(result.last_synced_at);
		} catch (e) {
			if (!(e instanceof ApiError && e.status === 409)) throw e;
		} finally {
			setIsSyncing(false);
		}
	};

	return (
		<div className="db-content" key={view}>
			<div className="kpi-strip">
				<KPI
					label="Net worth"
					value={fmt(total)}
					sub={`${accts.length} accounts`}
					accent="pos"
				/>
				<KPI label="Cash" value={fmt(cash)} sub="Liquid assets" />
				<KPI label="Investments" value={fmt(inv)} sub="Brokerage + retirement" />
				<KPI
					label="Liabilities"
					value={fmt(debt)}
					sub="Credit cards"
					accent={debt < 0 ? "neg" : null}
				/>
			</div>
			<section className="panel">
				<div className="panel-head">
					<div>
						<h2 className="panel-h">Connected accounts</h2>
						<p className="panel-sub">
							{v.name} · read-only · {formatSyncTime(lastSyncedAt)}
						</p>
					</div>
					<div className="panel-controls">
						<button
							className="btn btn-sm"
							onClick={handleSync}
							disabled={isSyncing}
						>
							{isSyncing ? "Syncing…" : "Sync now"}
						</button>
						<button className="btn btn-sm btn-brand">+ Add account</button>
					</div>
				</div>
				<ul className="acct-list">
					{accts.map((a, i) => (
						<li key={i} className="acct-li">
							<span className="acct-mark" style={{ background: `var(--${a.tone})` }}>
								{a.n[0]}
							</span>
							<div className="acct-meta">
								<div className="acct-name">{a.n}</div>
								<div className="acct-sub">
									{a.t} · {a.mask}
								</div>
							</div>
							<div className={`acct-bal mono ${a.bal < 0 ? "neg" : ""}`}>
								{fmt(a.bal, { cents: true })}
							</div>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}
