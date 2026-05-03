import { useMemo, useRef, useState, type MouseEvent } from "react";
import type { Category, Month } from "./data";

export function DualLineChart({
	months,
	incColor = "var(--brand)",
	spendColor = "var(--ink-2)",
}: {
	months: Month[];
	incColor?: string;
	spendColor?: string;
}) {
	const W = 600;
	const H = 240;
	const P = { l: 40, r: 16, t: 18, b: 32 };
	const innerW = W - P.l - P.r;
	const innerH = H - P.t - P.b;

	const all = months.flatMap((m) => [m.inc, m.spend]);
	const max = Math.max(...all) * 1.1 || 1;
	const min = 0;

	const x = (i: number) =>
		P.l + (months.length === 1 ? innerW / 2 : (i / (months.length - 1)) * innerW);
	const y = (v: number) => P.t + innerH - ((v - min) / (max - min)) * innerH;

	const linePath = (key: "inc" | "spend") =>
		months
			.map((m, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(m[key]).toFixed(1)}`)
			.join(" ");

	const areaPath = (key: "inc" | "spend") =>
		`${linePath(key)} L${x(months.length - 1).toFixed(1)},${(P.t + innerH).toFixed(1)} L${x(0).toFixed(1)},${(P.t + innerH).toFixed(1)} Z`;

	const ticks = 4;
	const yTicks = Array.from({ length: ticks + 1 }, (_, i) => (max / ticks) * i);

	const [hover, setHover] = useState<number | null>(null);
	const svgRef = useRef<SVGSVGElement | null>(null);

	const onMove = (e: MouseEvent<SVGSVGElement>) => {
		if (!svgRef.current) return;
		const r = svgRef.current.getBoundingClientRect();
		const px = ((e.clientX - r.left) / r.width) * W;
		const i = Math.round(((px - P.l) / innerW) * (months.length - 1));
		if (i >= 0 && i < months.length) setHover(i);
	};

	return (
		<div className="chart-wrap">
			<svg
				ref={svgRef}
				viewBox={`0 0 ${W} ${H}`}
				className="chart-svg"
				onMouseMove={onMove}
				onMouseLeave={() => setHover(null)}
			>
				<defs>
					<linearGradient id="incFill" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0%" stopColor={incColor} stopOpacity="0.18" />
						<stop offset="100%" stopColor={incColor} stopOpacity="0" />
					</linearGradient>
				</defs>

				{yTicks.map((v, i) => (
					<g key={i}>
						<line
							x1={P.l}
							x2={W - P.r}
							y1={y(v)}
							y2={y(v)}
							stroke="var(--line-soft)"
							strokeWidth="1"
						/>
						<text
							x={P.l - 8}
							y={y(v) + 3.5}
							textAnchor="end"
							fontSize="10"
							fill="var(--ink-4)"
							fontFamily="Geist Mono, ui-monospace, monospace"
						>
							${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}k
						</text>
					</g>
				))}

				<path d={areaPath("inc")} fill="url(#incFill)" />
				<path
					d={linePath("inc")}
					fill="none"
					stroke={incColor}
					strokeWidth="2.2"
					strokeLinejoin="round"
					strokeLinecap="round"
				/>
				<path
					d={linePath("spend")}
					fill="none"
					stroke={spendColor}
					strokeWidth="2.2"
					strokeLinejoin="round"
					strokeLinecap="round"
					strokeDasharray="5 4"
				/>

				{months.map((m, i) => (
					<text
						key={i}
						x={x(i)}
						y={H - 10}
						textAnchor="middle"
						fontSize="10.5"
						fill="var(--ink-4)"
						fontFamily="Geist Mono, ui-monospace, monospace"
					>
						{months.length > 8 && i % 2 ? "" : m.m}
					</text>
				))}

				{hover !== null && (
					<g>
						<line
							x1={x(hover)}
							x2={x(hover)}
							y1={P.t}
							y2={P.t + innerH}
							stroke="var(--ink-3)"
							strokeWidth="1"
							strokeDasharray="3 3"
							opacity="0.5"
						/>
						<circle
							cx={x(hover)}
							cy={y(months[hover].inc)}
							r="4"
							fill="white"
							stroke={incColor}
							strokeWidth="2"
						/>
						<circle
							cx={x(hover)}
							cy={y(months[hover].spend)}
							r="4"
							fill="white"
							stroke={spendColor}
							strokeWidth="2"
						/>
						<g transform={`translate(${Math.min(W - 132, Math.max(P.l, x(hover) - 60))}, ${P.t - 8})`}>
							<rect width="120" height="44" rx="8" fill="var(--ink)" />
							<text
								x="10"
								y="16"
								fontSize="10.5"
								fill="rgba(255,255,255,0.7)"
								fontFamily="Geist Mono, ui-monospace, monospace"
							>
								{months[hover].m}
							</text>
							<text
								x="10"
								y="30"
								fontSize="11"
								fill="white"
								fontWeight="600"
								fontFamily="Geist Mono, ui-monospace, monospace"
							>
								+${months[hover].inc.toLocaleString()}
							</text>
							<text
								x="10"
								y="40"
								fontSize="10.5"
								fill="rgba(255,255,255,0.85)"
								fontFamily="Geist Mono, ui-monospace, monospace"
							>
								−${months[hover].spend.toLocaleString()}
							</text>
						</g>
					</g>
				)}
			</svg>

			<div className="chart-legend">
				<span className="legend-item">
					<span className="legend-dot" style={{ background: incColor }} /> Income
				</span>
				<span className="legend-item">
					<span className="legend-dot legend-dash" style={{ background: spendColor }} /> Spending
				</span>
			</div>
		</div>
	);
}

export function PieChart({ categories }: { categories: Category[] }) {
	const total = categories.reduce((a, b) => a + b.v, 0);
	const R = 90;
	const r = 56;
	const CX = 110;
	const CY = 110;

	const [hoverI, setHoverI] = useState<number | null>(null);

	const slices = useMemo(() => {
		let acc = 0;
		return categories.map((c, i) => {
			const start = acc / total;
			acc += c.v;
			const end = acc / total;
			const a0 = start * Math.PI * 2 - Math.PI / 2;
			const a1 = end * Math.PI * 2 - Math.PI / 2;
			const large = end - start > 0.5 ? 1 : 0;
			const x0 = CX + R * Math.cos(a0);
			const y0 = CY + R * Math.sin(a0);
			const x1 = CX + R * Math.cos(a1);
			const y1 = CY + R * Math.sin(a1);
			const xi0 = CX + r * Math.cos(a0);
			const yi0 = CY + r * Math.sin(a0);
			const xi1 = CX + r * Math.cos(a1);
			const yi1 = CY + r * Math.sin(a1);
			const d = [
				`M${x0.toFixed(2)},${y0.toFixed(2)}`,
				`A${R},${R} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`,
				`L${xi1.toFixed(2)},${yi1.toFixed(2)}`,
				`A${r},${r} 0 ${large} 0 ${xi0.toFixed(2)},${yi0.toFixed(2)}`,
				"Z",
			].join(" ");
			return { ...c, d, pct: (end - start) * 100, i };
		});
	}, [categories, total]);

	const center = hoverI !== null ? slices[hoverI] : null;

	return (
		<div className="pie-wrap">
			<svg viewBox="0 0 220 220" className="pie-svg" width="220" height="220">
				{slices.map((s) => (
					<path
						key={s.i}
						d={s.d}
						className={`pie-slice cat-${s.c.replace("cat-", "")}`}
						style={{
							fill: `var(--${s.c})`,
							opacity: hoverI === null || hoverI === s.i ? 1 : 0.35,
							transform: hoverI === s.i ? "scale(1.025)" : "scale(1)",
							transformOrigin: "110px 110px",
							transition:
								"opacity 160ms ease, transform 160ms cubic-bezier(0.22,0.8,0.2,1)",
						}}
						onMouseEnter={() => setHoverI(s.i)}
						onMouseLeave={() => setHoverI(null)}
					/>
				))}
				<text
					x="110"
					y="106"
					textAnchor="middle"
					fontSize="11"
					fill="var(--ink-4)"
					fontFamily="Geist Mono, ui-monospace, monospace"
					letterSpacing="0.05em"
				>
					{center ? center.name.toUpperCase() : "TOTAL"}
				</text>
				<text
					x="110"
					y="124"
					textAnchor="middle"
					fontSize="18"
					fill="var(--ink)"
					fontWeight="600"
					fontFamily="Geist Mono, ui-monospace, monospace"
				>
					{center ? "$" + center.v.toLocaleString() : "$" + total.toLocaleString()}
				</text>
				<text
					x="110"
					y="138"
					textAnchor="middle"
					fontSize="10"
					fill="var(--ink-3)"
					fontFamily="Geist Mono, ui-monospace, monospace"
				>
					{center ? center.pct.toFixed(1) + "%" : "this period"}
				</text>
			</svg>

			<ul className="pie-legend">
				{slices.map((s) => (
					<li
						key={s.i}
						className={hoverI !== null && hoverI !== s.i ? "dim" : ""}
						onMouseEnter={() => setHoverI(s.i)}
						onMouseLeave={() => setHoverI(null)}
					>
						<span className="legend-dot" style={{ background: `var(--${s.c})` }} />
						<span className="pie-legend-name">{s.name}</span>
						<span className="pie-legend-pct mono">{s.pct.toFixed(1)}%</span>
						<span className="pie-legend-v mono">${s.v.toLocaleString()}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

export function BarChart({ months }: { months: Month[] }) {
	const W = 600;
	const H = 240;
	const P = { l: 40, r: 16, t: 18, b: 32 };
	const innerW = W - P.l - P.r;
	const innerH = H - P.t - P.b;
	const nets = months.map((m) => m.inc - m.spend);
	const max = Math.max(...nets.map(Math.abs)) * 1.15 || 1;

	const bw = (innerW / months.length) * 0.62;
	const xCenter = (i: number) => P.l + (innerW / months.length) * (i + 0.5);
	const zeroY = P.t + innerH / 2;
	const y = (v: number) => zeroY - (v / max) * (innerH / 2);

	const [hover, setHover] = useState<number | null>(null);

	return (
		<div className="chart-wrap">
			<svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
				<line
					x1={P.l}
					x2={W - P.r}
					y1={zeroY}
					y2={zeroY}
					stroke="var(--line)"
					strokeWidth="1"
				/>

				{months.map((m, i) => {
					const v = nets[i];
					const yTop = v >= 0 ? y(v) : zeroY;
					const h = Math.abs(y(v) - zeroY);
					const isHover = hover === i;
					return (
						<g
							key={i}
							onMouseEnter={() => setHover(i)}
							onMouseLeave={() => setHover(null)}
							style={{ cursor: "pointer" }}
						>
							<rect
								x={xCenter(i) - bw / 2}
								y={yTop}
								width={bw}
								height={Math.max(2, h)}
								rx="3"
								fill={v >= 0 ? "var(--brand)" : "var(--danger, oklch(0.62 0.18 25))"}
								opacity={hover === null || isHover ? 1 : 0.55}
							/>
							<text
								x={xCenter(i)}
								y={H - 10}
								textAnchor="middle"
								fontSize="10.5"
								fill="var(--ink-4)"
								fontFamily="Geist Mono, ui-monospace, monospace"
							>
								{months.length > 8 && i % 2 ? "" : m.m}
							</text>
							{isHover && (
								<g
									transform={`translate(${Math.min(W - 110, Math.max(P.l, xCenter(i) - 50))}, ${Math.max(2, yTop - 36)})`}
								>
									<rect width="100" height="32" rx="6" fill="var(--ink)" />
									<text
										x="10"
										y="14"
										fontSize="10.5"
										fill="rgba(255,255,255,0.7)"
										fontFamily="Geist Mono, ui-monospace, monospace"
									>
										{m.m} net
									</text>
									<text
										x="10"
										y="26"
										fontSize="11"
										fill="white"
										fontWeight="600"
										fontFamily="Geist Mono, ui-monospace, monospace"
									>
										{v >= 0 ? "+" : "−"}${Math.abs(v).toLocaleString()}
									</text>
								</g>
							)}
						</g>
					);
				})}
			</svg>

			<div className="chart-legend">
				<span className="legend-item">
					<span className="legend-dot" style={{ background: "var(--brand)" }} /> Saved (net positive)
				</span>
				<span className="legend-item">
					<span className="legend-dot" style={{ background: "oklch(0.62 0.18 25)" }} /> Overspent
				</span>
			</div>
		</div>
	);
}
