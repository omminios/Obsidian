import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Wordmark } from "../components/Wordmark";
import { IconBolt, IconChart, IconShield } from "../components/icons";
import { useRouter } from "../lib/router";
import { api } from "../lib/api";
import {
	GROUP_VIEWS,
	sliceMonths,
	VIEWS,
	type RangeKey,
	type ViewKey,
} from "../features/dashboard/data";
import {
	DashboardTab,
	TabAccounts,
	TabTransactions,
} from "../features/dashboard/tabs";
import { InviteModal, SettingsModal } from "../features/dashboard/modals";

type TabKey = "dashboard" | "transactions" | "accounts";

type TabDef = { k: TabKey; l: string; icon: ReactNode };

const TABS: TabDef[] = [
	{ k: "dashboard", l: "Dashboard", icon: <IconChart size={16} /> },
	{ k: "transactions", l: "Transactions", icon: <IconBolt size={16} /> },
	{ k: "accounts", l: "Accounts", icon: <IconShield size={16} /> },
];

type ModalKind = "invite" | "settings" | null;

export function Dashboard() {
	const { navigate } = useRouter();
	const [tab, setTab] = useState<TabKey>("dashboard");
	const [view, setView] = useState<ViewKey>("me");
	const [range, setRange] = useState<RangeKey>("6M");
	const [modal, setModal] = useState<ModalKind>(null);

	const v = VIEWS[view];
	const slice = useMemo(() => sliceMonths(v, range), [v, range]);

	const handleLogout = async () => {
		try {
			await api.logout();
		} catch {
			// ignore — clear cookie best-effort, then route home
		}
		navigate("/");
	};

	const handleChangePassword = () => {
		setModal(null);
		navigate("/forgot-password");
	};

	return (
		<div className="dboard">
			<DBSidebar
				tab={tab}
				setTab={setTab}
				view={view}
				setView={setView}
				onInvite={() => setModal("invite")}
				onSettings={() => setModal("settings")}
				onLogout={handleLogout}
			/>

			<main className="dboard-main">
				<DBTopBar tab={tab} view={view} />

				{tab === "dashboard" ? (
					<DashboardTab
						v={v}
						slice={slice}
						range={range}
						setRange={setRange}
						view={view}
						onViewAllTransactions={() => setTab("transactions")}
					/>
				) : null}
				{tab === "transactions" ? <TabTransactions v={v} view={view} /> : null}
				{tab === "accounts" ? <TabAccounts v={v} view={view} /> : null}
			</main>

			{modal === "invite" ? <InviteModal onClose={() => setModal(null)} /> : null}
			{modal === "settings" ? (
				<SettingsModal
					onClose={() => setModal(null)}
					onLogout={() => {
						setModal(null);
						void handleLogout();
					}}
					onChangePassword={handleChangePassword}
				/>
			) : null}
		</div>
	);
}

function DBSidebar({
	tab,
	setTab,
	view,
	setView,
	onInvite,
	onSettings,
	onLogout,
}: {
	tab: TabKey;
	setTab: (t: TabKey) => void;
	view: ViewKey;
	setView: (v: ViewKey) => void;
	onInvite: () => void;
	onSettings: () => void;
	onLogout: () => void;
}) {
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!menuOpen) return;
		const onDoc = (e: MouseEvent) => {
			if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
		};
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, [menuOpen]);

	return (
		<aside className="db-side">
			<div className="db-side-brand">
				<Wordmark size="sm" />
			</div>

			<nav className="db-side-nav">
				{TABS.map((t) => (
					<button
						key={t.k}
						className={`db-side-item ${tab === t.k ? "active" : ""}`}
						onClick={() => setTab(t.k)}
					>
						<span className="db-side-icon">{t.icon}</span>
						<span>{t.l}</span>
					</button>
				))}
			</nav>

			<div className="db-side-section">
				<div className="db-side-label-row">
					<span className="db-side-label">Viewing as</span>
					<button
						className="db-side-mini"
						onClick={onInvite}
						title="Invite member"
						aria-label="Invite member"
					>
						<svg
							width="13"
							height="13"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M12 5v14M5 12h14" />
						</svg>
					</button>
				</div>

				<div className="db-side-rows">
					{GROUP_VIEWS.map((g) => (
						<button
							key={g.k}
							className={`db-side-row db-side-row-btn ${view === g.k ? "active" : ""}`}
							onClick={() => setView(g.k)}
							aria-pressed={view === g.k}
						>
							<span className={`ava ${g.col}`}>{g.ava}</span>
							<div className="db-side-row-meta">
								<div className="db-side-row-name">{g.name.split(" ")[0]}</div>
								<div className="db-side-row-sub">{g.sub}</div>
							</div>
							{view === g.k ? (
								<span className="db-side-row-tick" aria-hidden>
									•
								</span>
							) : null}
						</button>
					))}
				</div>

				<button className="db-side-invite" onClick={onInvite}>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="9" cy="8" r="4" />
						<path d="M3 21v-1a6 6 0 0 1 12 0v1" />
						<path d="M19 8v6M22 11h-6" />
					</svg>
					<span>Invite member</span>
				</button>
			</div>

			<div className="db-side-foot" ref={menuRef}>
				{menuOpen ? (
					<div className="db-menu" role="menu">
						<button
							className="db-menu-item"
							onClick={() => {
								setMenuOpen(false);
								onSettings();
							}}
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.7"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<circle cx="12" cy="12" r="3" />
								<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
							</svg>
							Settings
						</button>
						<button
							className="db-menu-item"
							onClick={() => {
								setMenuOpen(false);
								onInvite();
							}}
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.7"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<circle cx="9" cy="8" r="4" />
								<path d="M3 21v-1a6 6 0 0 1 12 0v1" />
								<path d="M19 8v6M22 11h-6" />
							</svg>
							Invite member
						</button>
						<div className="db-menu-sep" />
						<button
							className="db-menu-item db-menu-danger"
							onClick={() => {
								setMenuOpen(false);
								onLogout();
							}}
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.7"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
								<path d="M16 17l5-5-5-5" />
								<path d="M21 12H9" />
							</svg>
							Log out
						</button>
					</div>
				) : null}
				<button
					className={`db-side-foot-btn ${menuOpen ? "open" : ""}`}
					onClick={() => setMenuOpen((o) => !o)}
					aria-haspopup="menu"
					aria-expanded={menuOpen}
				>
					<span className="ava ava-1">M</span>
					<div className="db-side-row-meta">
						<div className="db-side-row-name">Morgan Park</div>
						<div className="db-side-row-sub">morgan@household.com</div>
					</div>
					<span className="db-side-foot-caret" aria-hidden>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="12" cy="5" r="1.4" />
							<circle cx="12" cy="12" r="1.4" />
							<circle cx="12" cy="19" r="1.4" />
						</svg>
					</span>
				</button>
			</div>
		</aside>
	);
}

function DBTopBar({ tab, view }: { tab: TabKey; view: ViewKey }) {
	const tabLabel = TABS.find((t) => t.k === tab)?.l ?? "Dashboard";
	const cur = GROUP_VIEWS.find((g) => g.k === view) ?? GROUP_VIEWS[0];
	const today = new Date().toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	return (
		<header className="db-top">
			<div className="db-top-left">
				<h1 className="db-top-h1">{tabLabel}</h1>
				<span className="db-top-sub">Today · {today}</span>
			</div>

			<div className="db-top-right">
				<div className="db-top-viewing">
					<span className="db-top-viewing-l">Viewing</span>
					<span className={`ava ava-sm ${cur.col}`}>{cur.ava}</span>
					<span className="db-top-viewing-n">{cur.name}</span>
					<span className="db-top-viewing-r">{cur.role}</span>
				</div>

				<button className="db-top-iconbtn" title="Notifications" aria-label="Notifications">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.7"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
						<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
					</svg>
				</button>
			</div>
		</header>
	);
}
