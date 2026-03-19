"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const C = {
  verified: "#30D158",
  risk: "#FF453A",
  warning: "#FFD60A",
  tech: "#64D2FF",
  carbon: "#34C759",
  bg: "#000000",
  surface: "#0A0A0A",
  surface2: "#141414",
  border: "#2C2C2E",
  text: "#F5F5F7",
  textMuted: "#8E8E93",
  textDim: "#636366",
};

/* ------------------------------------------------------------------ */
/*  Tier data                                                          */
/* ------------------------------------------------------------------ */

interface TierDef {
  id: number;
  label: string;
  subtitle: string;
  accent: string;
  metric: string;
  metricLabel: string;
}

const TIERS: TierDef[] = [
  { id: 1, label: "Intake", subtitle: "Edge AI — Compliance Gate", accent: C.tech, metric: "47", metricLabel: "Classifications Today" },
  { id: 2, label: "Logistics", subtitle: "Hub-and-Spoke — EDI Backbone", accent: C.tech, metric: "78%", metricLabel: "Fleet Utilization" },
  { id: 3, label: "Regulatory", subtitle: "Compliance Engine — RAG", accent: C.warning, metric: "98.7%", metricLabel: "O.Reg 347 Compliance" },
  { id: 4, label: "Financial", subtitle: "Decoupled Billing", accent: C.carbon, metric: "$12,840", metricLabel: "Revenue Today" },
  { id: 5, label: "Scientific", subtitle: "Hub Validation Sensors", accent: C.verified, metric: "94%", metricLabel: "TCLP Pass Rate" },
];

/* ------------------------------------------------------------------ */
/*  Small reusable pieces                                              */
/* ------------------------------------------------------------------ */

function PulseDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex rounded-full h-full w-full"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

function StatusDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full shrink-0"
      style={{ backgroundColor: color }}
    />
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: color + "18", color, border: `1px solid ${color}30` }}
    >
      {children}
    </span>
  );
}

function Gauge({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth={4} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={size * 0.24}
        fontWeight="800"
        fontFamily="monospace"
      >
        {pct}%
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Confidence distribution bar                                        */
/* ------------------------------------------------------------------ */

function ConfidenceBar() {
  const green = 82;
  const amber = 14;
  const red = 4;
  return (
    <div>
      <div className="flex text-[9px] font-mono mb-1" style={{ color: C.textMuted }}>
        <span style={{ width: `${green}%` }}>
          <span style={{ color: C.verified }}>{green}% &gt;85%</span>
        </span>
        <span style={{ width: `${amber}%` }}>
          <span style={{ color: C.warning }}>{amber}%</span>
        </span>
        <span style={{ width: `${red}%` }}>
          <span style={{ color: C.risk }}>{red}%</span>
        </span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden">
        <div style={{ width: `${green}%`, backgroundColor: C.verified }} />
        <div style={{ width: `${amber}%`, backgroundColor: C.warning }} />
        <div style={{ width: `${red}%`, backgroundColor: C.risk }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TCLP mini chart (last 50 loads)                                    */
/* ------------------------------------------------------------------ */

function TCLPChart({ pass, fail }: { pass: number; fail: number }) {
  const total = pass + fail;
  const blocks: boolean[] = [];
  for (let i = 0; i < total; i++) blocks.push(i < pass);
  return (
    <div className="flex flex-wrap gap-[2px]">
      {blocks.map((ok, i) => (
        <div
          key={i}
          className="w-[6px] h-[10px] rounded-[1px]"
          style={{ backgroundColor: ok ? C.verified + "90" : C.risk }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tier detail content                                                */
/* ------------------------------------------------------------------ */

function TierDetail({ id, classCount }: { id: number; classCount: number }) {
  switch (id) {
    case 1:
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: C.textMuted }}>Active Classifications</span>
            <span className="text-lg font-black font-mono" style={{ color: C.tech }}>{classCount}</span>
          </div>
          <ConfidenceBar />
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: C.textMuted }}>HITL Escalation Rate</span>
            <span className="text-sm font-bold font-mono" style={{ color: C.warning }}>3.2%</span>
          </div>
          <div className="flex items-center gap-2">
            <PulseDot color={C.verified} />
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.verified }}>LIVE</span>
            <span className="text-[10px]" style={{ color: C.textDim }}>Tensor G5 EdgeTPU active</span>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Gauge pct={78} color={C.tech} />
            <div className="flex-1">
              <div className="text-[10px] uppercase mb-1" style={{ color: C.textDim }}>Fleet Utilization</div>
              <div className="text-sm font-bold" style={{ color: C.text }}>78% Deployed</div>
            </div>
          </div>
          <div className="rounded-lg p-2.5" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
            <div className="text-[10px] uppercase mb-1" style={{ color: C.textDim }}>The Mothership (144-yd)</div>
            <div className="flex items-center gap-2">
              <PulseDot color={C.tech} />
              <span className="text-xs font-bold" style={{ color: C.tech }}>EN ROUTE &mdash; BioHub Hamilton</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: C.textMuted }}>FIFO Oldest Pile</span>
            <Badge color={C.verified}>72h 14m &mdash; FIFO SAFE</Badge>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {([["14-yd", "12"], ["20-yd", "8"], ["40-yd", "4"], ["MShip", "1"]] as const).map(([label, count]) => (
              <div key={label} className="rounded-lg py-1.5" style={{ backgroundColor: C.surface }}>
                <div className="text-[9px] uppercase" style={{ color: C.textDim }}>{label}</div>
                <div className="text-sm font-black font-mono" style={{ color: C.text }}>{count}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <StatusDot color={C.warning} />
            <span className="text-[11px]" style={{ color: C.warning }}>2 bins stagnant &gt;48h &mdash; Diversion Pass ($75/day)</span>
          </div>
        </div>
      );
    case 3:
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Gauge pct={98.7} color={C.warning} size={64} />
            <div>
              <div className="text-[10px] uppercase" style={{ color: C.textDim }}>O.Reg 347</div>
              <div className="text-sm font-bold" style={{ color: C.text }}>98.7% Compliant</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: C.textMuted }}>Pending RPRA Manifests</span>
            <span className="text-sm font-bold font-mono" style={{ color: C.warning }}>3</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: C.textMuted }}>Certificate of Origin Queue</span>
            <span className="text-sm font-bold font-mono" style={{ color: C.tech }}>2 awaiting XRF</span>
          </div>
          <div>
            <div className="text-[10px] uppercase mb-1.5" style={{ color: C.textDim }}>TCLP Last 50 Loads</div>
            <TCLPChart pass={47} fail={3} />
            <div className="flex gap-3 mt-1">
              <span className="text-[9px]" style={{ color: C.verified }}>47 PASS</span>
              <span className="text-[9px]" style={{ color: C.risk }}>3 FAIL</span>
            </div>
          </div>
        </div>
      );
    case 4:
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: C.textMuted }}>Today&apos;s Revenue</span>
            <span className="text-xl font-black font-mono" style={{ color: C.carbon }}>$12,840</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: C.textMuted }}>Levy Avoidance Savings</span>
            <span className="text-sm font-bold font-mono" style={{ color: C.verified }}>$3,420</span>
          </div>
          <div className="rounded-lg p-2.5" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
            <div className="text-[10px] uppercase mb-1" style={{ color: C.textDim }}>CORC Accumulation (Month)</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black font-mono" style={{ color: C.carbon }}>12.4</span>
              <span className="text-[10px]" style={{ color: C.textMuted }}>tonnes CO&#x2082;e</span>
              <span className="text-[10px] font-mono" style={{ color: C.textDim }}>~$4,340</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: C.textMuted }}>Overdue Invoices</span>
            <span className="text-sm font-bold font-mono" style={{ color: C.risk }}>2 ($1,890)</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot color={C.warning} />
            <span className="text-[11px]" style={{ color: C.warning }}>7 Missed Savings Alerts triggered today</span>
          </div>
        </div>
      );
    case 5:
      return (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-2.5" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
              <div className="text-[10px] uppercase mb-1" style={{ color: C.textDim }}>Hub XRF Sensor</div>
              <div className="flex items-center gap-1.5">
                <PulseDot color={C.verified} />
                <span className="text-xs font-bold" style={{ color: C.verified }}>ONLINE</span>
              </div>
            </div>
            <div className="rounded-lg p-2.5" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
              <div className="text-[10px] uppercase mb-1" style={{ color: C.textDim }}>Hub NIR Sensor</div>
              <div className="flex items-center gap-1.5">
                <PulseDot color={C.verified} />
                <span className="text-xs font-bold" style={{ color: C.verified }}>ONLINE</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: C.textMuted }}>TCLP Pass Rate (Last 50)</span>
            <span className="text-sm font-bold font-mono" style={{ color: C.verified }}>94%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: C.textMuted }}>Next Calibration</span>
            <span className="text-sm font-mono" style={{ color: C.tech }}>2026-03-25</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: C.textMuted }}>Data Drift</span>
            <Badge color={C.verified}>NOMINAL</Badge>
          </div>
        </div>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Bottom Nav                                                         */
/* ------------------------------------------------------------------ */

function BottomNav() {
  const items: { label: string; href: string; active?: boolean; icon: React.ReactNode }[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      active: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <rect x="3" y="3" width="8" height="8" rx="2" />
          <rect x="13" y="3" width="8" height="8" rx="2" />
          <rect x="3" y="13" width="8" height="8" rx="2" />
          <rect x="13" y="13" width="8" height="8" rx="2" />
        </svg>
      ),
    },
    {
      label: "Driver",
      href: "/driver",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <path d="M16 8h4l3 3v5h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      label: "RFQ",
      href: "/rfq",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      ),
    },
    {
      label: "Certificate",
      href: "/certificate",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 15l-2 5l2-1l2 1l-2-5z" />
          <circle cx="12" cy="9" r="6" />
          <path d="M9 9l1.5 1.5L14 7" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      style={{ backgroundColor: C.surface + "F0", borderTop: `1px solid ${C.border}`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex flex-col items-center gap-0.5 min-w-[48px] min-h-[48px] justify-center"
          style={{ color: item.active ? C.tech : C.textDim }}
        >
          {item.icon}
          <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 1: true });
  const [classCount, setClassCount] = useState(47);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const classInterval = setInterval(() => {
      setClassCount((prev) => prev + 1);
    }, 8000);

    const pulseInterval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 2000);

    return () => {
      clearInterval(classInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  const toggle = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main
      className="min-h-screen flex flex-col pb-20"
      style={{ backgroundColor: C.bg, color: C.text }}
    >
      {/* ---- Header ---- */}
      <header className="sticky top-0 z-30 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3" style={{ backgroundColor: C.bg + "E8", borderBottom: `1px solid ${C.border}`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <div className="flex items-center justify-between mb-1">
          <Link href="/" className="flex items-center gap-1 min-h-[48px]" style={{ color: C.textMuted }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="text-xs">Back</span>
          </Link>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black tracking-tight" style={{ color: C.verified }}>905</span>
            <span className="text-lg font-black tracking-tight">WOOD</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-[48px] justify-end">
            <PulseDot color={pulse ? C.verified : C.verified} size={6} />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: C.verified }}>LIVE</span>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-sm font-bold" style={{ color: C.text }}>Operations Dashboard</h1>
          <p className="text-[10px]" style={{ color: C.textDim }}>5-Layer Refinery Stack &mdash; Real-Time</p>
        </div>
      </header>

      {/* ---- Tier Cards ---- */}
      <div className="flex flex-col gap-3 px-4 py-4">
        {TIERS.map((tier) => {
          const isOpen = !!expanded[tier.id];
          return (
            <div
              key={tier.id}
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: C.surface2,
                border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${tier.accent}`,
              }}
            >
              {/* Collapsed header — always visible */}
              <button
                onClick={() => toggle(tier.id)}
                className="w-full flex items-center gap-3 p-4 text-left min-h-[56px]"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                {/* Layer badge */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                  style={{
                    backgroundColor: tier.accent + "15",
                    color: tier.accent,
                    border: `1px solid ${tier.accent}30`,
                  }}
                >
                  L{tier.id}
                </div>

                {/* Title + subtitle */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: C.text }}>{tier.label}</span>
                    <span className="text-[10px]" style={{ color: C.textDim }}>{tier.subtitle}</span>
                  </div>
                  {/* Key metric visible when collapsed */}
                  {!isOpen && (
                    <div className="text-xs font-mono mt-0.5" style={{ color: tier.accent }}>
                      {tier.id === 1 ? classCount : tier.metric} <span className="text-[9px] font-sans" style={{ color: C.textDim }}>{tier.metricLabel}</span>
                    </div>
                  )}
                </div>

                {/* Chevron */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.textDim}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 transition-transform duration-200"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {/* Expandable detail */}
              {isOpen && (
                <div
                  className="px-4 pb-4 pt-0"
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  <div className="pt-3">
                    <TierDetail id={tier.id} classCount={classCount} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- Bottom Nav ---- */}
      <BottomNav />
    </main>
  );
}
