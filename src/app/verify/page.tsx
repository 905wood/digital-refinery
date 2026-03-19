"use client";

import { useState, useCallback } from "react";
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
} as const;

/* ── Audio override keywords ── */
const AUDIO_KEYWORDS = [
  "deck",
  "demolition",
  "renovation",
  "painted",
  "railway tie",
  "pressure treated",
];

/* ── Failure modes data ── */
const FAILURE_MODES = [
  {
    name: "XRF Miscalibration",
    severity: "CATASTROPHIC",
    color: C.risk,
    pulse: true,
    consequence:
      "Volatilizes arsenic into toxic corrosive gas, ruins biochar reactors, potential worker exposure.",
    reward: "Precision calibration protocol becomes proprietary moat",
    value: "Reactor longevity, worker safety, brand trust",
  },
  {
    name: "AI Hallucination",
    severity: "SEVERE",
    color: C.risk,
    pulse: false,
    consequence:
      "Incorrect O.Reg 347 citations cause regulatory fines and loss of RPRA standing.",
    reward: "Zero-hallucination RAG becomes audit-proof competitive advantage",
    value: "Regulatory compliance, legal protection",
  },
  {
    name: "Visual Fallacy",
    severity: "HIGH",
    color: C.warning,
    pulse: false,
    consequence:
      'Your camera sees color, not chemistry. Weathered CCA-treated wood (arsenic) is visually identical to clean gray pine.',
    reward: "Precautionary Principle + XRF override eliminates false negatives",
    value: "Supply chain purity, feedstock quality",
  },
  {
    name: "Spontaneous Combustion",
    severity: "HIGH",
    color: C.warning,
    pulse: false,
    consequence:
      "FIFO logic failure in chipped wood piles causes biological heat buildup and ignition.",
    reward: "FIFO enforcement + temperature monitoring prevents inventory loss",
    value: "Asset protection, insurance compliance",
  },
  {
    name: "Transshipment Penalty",
    severity: "SEVERE",
    color: C.risk,
    pulse: false,
    consequence:
      "40% surcharge at Ontario-Michigan border for non-compliant USMCA documentation.",
    reward: "USMCA Shield 9-Point Certificate becomes frictionless border pass",
    value: "Cost avoidance, cross-border market access",
  },
  {
    name: "Data Drift",
    severity: "MODERATE",
    color: C.tech,
    pulse: false,
    consequence:
      "Snow cover, mud, and seasonal weathering degrade AI confidence below 85% threshold.",
    reward: "HITL escalation + retraining pipeline keeps model current",
    value: "Year-round operational reliability",
  },
];

/* ── Simulator state types ── */
type SimStep = 1 | 2 | 3 | 4 | 5;

interface SimState {
  step: SimStep;
  /* Step 1 */
  scanning: boolean;
  aiConfidence: number | null;
  aiResult: "CLEAN" | "HIGH_RISK" | null;
  /* Step 2 */
  voiceNote: string;
  analyzing: boolean;
  detectedKeywords: string[];
  audioOverride: boolean | null;
  /* Step 3 */
  origin: string;
  originOverride: boolean;
  /* Step 4 */
  runningXrf: boolean;
  arsenic: number | null;
  lead: number | null;
  chromium: number | null;
  hubVerdict: "CLEAN" | "SUBJECT_WASTE" | null;
  /* Step 5 */
  citationShown: boolean;
}

const INIT: SimState = {
  step: 1,
  scanning: false,
  aiConfidence: null,
  aiResult: null,
  voiceNote: "",
  analyzing: false,
  detectedKeywords: [],
  audioOverride: null,
  origin: "",
  originOverride: false,
  runningXrf: false,
  arsenic: null,
  lead: null,
  chromium: null,
  hubVerdict: null,
  citationShown: false,
};

/* ── Helpers ── */
function rand(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function isoNow() {
  return new Date().toISOString();
}

/* ── Badge component ── */
function Badge({
  label,
  color,
  pulse,
}: {
  label: string;
  color: string;
  pulse?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${pulse ? "animate-pulse" : ""}`}
      style={{
        backgroundColor: color + "20",
        color,
        border: `1px solid ${color}50`,
      }}
    >
      {pulse && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-ping"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </span>
  );
}

/* ── Section heading ── */
function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5 mt-10">
      <div className="h-px flex-1" style={{ backgroundColor: C.border }} />
      <span
        className="text-[10px] uppercase tracking-widest whitespace-nowrap"
        style={{ color: C.textDim }}
      >
        {title}
      </span>
      <div className="h-px flex-1" style={{ backgroundColor: C.border }} />
    </div>
  );
}

/* ── Card wrapper ── */
function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: C.surface2,
        border: `1px solid ${C.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Button ── */
function Btn({
  onClick,
  disabled,
  color,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="min-h-[48px] min-w-[48px] px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed"
      style={{
        backgroundColor: color + "20",
        color,
        border: `1px solid ${color}`,
      }}
    >
      {children}
    </button>
  );
}

/* ── Progress bar ── */
function ProgressBar({
  progress,
  color,
}: {
  progress: number;
  color: string;
}) {
  return (
    <div
      className="h-1.5 rounded-full overflow-hidden w-full"
      style={{ backgroundColor: C.surface }}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${progress}%`, backgroundColor: color }}
      />
    </div>
  );
}

/* ── Threshold gauge ── */
function ThresholdGauge({
  label,
  value,
  max,
  threshold,
}: {
  label: string;
  value: number | null;
  max: number;
  threshold: number;
}) {
  const pass = value !== null && value <= threshold;
  const color = value === null ? C.textDim : pass ? C.verified : C.risk;
  const pct = value !== null ? Math.min((value / max) * 100, 100) : 0;
  const threshPct = (threshold / max) * 100;

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] font-bold" style={{ color: C.text }}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono" style={{ color }}>
            {value !== null ? `${value} mg/L` : "---"}
          </span>
          {value !== null && (
            <Badge
              label={pass ? "PASS" : "FAIL"}
              color={pass ? C.verified : C.risk}
            />
          )}
        </div>
      </div>
      <div className="relative">
        <div
          className="h-2 rounded-full overflow-hidden w-full"
          style={{ backgroundColor: C.surface }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
        {/* Threshold marker */}
        <div
          className="absolute top-[-3px] w-0.5 h-[14px]"
          style={{
            left: `${threshPct}%`,
            backgroundColor: C.warning,
          }}
        />
        <span
          className="absolute text-[8px] font-mono"
          style={{
            left: `${threshPct}%`,
            top: "14px",
            transform: "translateX(-50%)",
            color: C.warning,
          }}
        >
          {threshold}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════ */
export default function VerifyPage() {
  const [sim, setSim] = useState<SimState>(INIT);
  const [scanProgress, setScanProgress] = useState(0);

  /* ── Override resolution ── */
  const isOverridden = sim.audioOverride || sim.originOverride;

  /* ── Chain flow status ── */
  const chainNodes = [
    {
      label: "Edge",
      sub: "Estimate",
      status:
        sim.aiResult !== null
          ? sim.aiResult === "CLEAN"
            ? "pass"
            : "fail"
          : sim.step >= 1
            ? "pending"
            : "idle",
    },
    {
      label: "Hub",
      sub: "Verdict",
      status:
        sim.hubVerdict !== null
          ? sim.hubVerdict === "CLEAN"
            ? "pass"
            : "fail"
          : sim.step >= 4
            ? "pending"
            : "idle",
    },
    {
      label: "RAG",
      sub: "Citation",
      status: sim.citationShown ? "pass" : sim.step >= 5 ? "pending" : "idle",
    },
    {
      label: "Cert",
      sub: "USMCA",
      status: sim.citationShown
        ? isOverridden || sim.hubVerdict === "SUBJECT_WASTE"
          ? "fail"
          : "pass"
        : "idle",
    },
    {
      label: "Border",
      sub: "Cleared",
      status: sim.citationShown
        ? !isOverridden && sim.hubVerdict === "CLEAN"
          ? "pass"
          : "fail"
        : "idle",
    },
  ];

  /* ── Step 1: Scan ── */
  const handleScan = useCallback(() => {
    setSim((s) => ({ ...s, scanning: true }));
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 5;
      });
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
      setScanProgress(100);
      const conf = rand(72, 98);
      setSim((s) => ({
        ...s,
        scanning: false,
        aiConfidence: conf,
        aiResult: conf >= 85 ? "CLEAN" : "HIGH_RISK",
        step: 2,
      }));
    }, 2000);
  }, []);

  /* ── Step 2: Analyze audio ── */
  const handleAnalyze = useCallback(() => {
    setSim((s) => ({ ...s, analyzing: true }));
    setTimeout(() => {
      setSim((s) => {
        const lower = s.voiceNote.toLowerCase();
        const found = AUDIO_KEYWORDS.filter((kw) => lower.includes(kw));
        return {
          ...s,
          analyzing: false,
          detectedKeywords: found,
          audioOverride: found.length > 0,
          step: 3,
        };
      });
    }, 1200);
  }, []);

  /* ── Step 3: Origin select ── */
  const handleOrigin = useCallback((val: string) => {
    setSim((s) => ({
      ...s,
      origin: val,
      originOverride: val === "Demolition",
      step: 4,
    }));
  }, []);

  /* ── Step 4: XRF ── */
  const handleXrf = useCallback(() => {
    setSim((s) => ({ ...s, runningXrf: true }));
    setTimeout(() => {
      const as_ = rand(0.1, 6.0);
      const pb = rand(0.2, 10.0);
      const cr = rand(0.3, 10.0);
      const clean = as_ <= 2.5 && pb <= 5.0 && cr <= 5.0;
      setSim((s) => ({
        ...s,
        runningXrf: false,
        arsenic: as_,
        lead: pb,
        chromium: cr,
        hubVerdict: clean ? "CLEAN" : "SUBJECT_WASTE",
        step: 5,
      }));
    }, 1800);
  }, []);

  /* ── Step 5: Show citation ── */
  const handleCitation = useCallback(() => {
    setSim((s) => ({ ...s, citationShown: true }));
  }, []);

  /* ── Reset ── */
  const handleReset = useCallback(() => {
    setSim(INIT);
    setScanProgress(0);
  }, []);

  /* ── Final determination ── */
  const finalVerdict =
    sim.citationShown
      ? isOverridden || sim.hubVerdict === "SUBJECT_WASTE"
        ? "SUBJECT_WASTE"
        : "CLEAN"
      : null;

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: C.bg, color: C.text }}
    >
      {/* ══ HEADER ══ */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="flex items-center gap-2 min-h-[48px] min-w-[48px] px-3 rounded-lg text-xs font-bold transition-all hover:scale-105"
            style={{ color: C.textMuted }}
          >
            <span style={{ fontSize: 16 }}>&larr;</span> Back
          </Link>
          <div className="flex items-baseline gap-1">
            <span
              className="text-lg font-black tracking-tight"
              style={{ color: C.verified }}
            >
              905
            </span>
            <span className="text-lg font-black tracking-tight">WOOD</span>
          </div>
        </div>
        <h1 className="text-xl font-black tracking-tight mb-1">
          Sensor Verification Chain
        </h1>
        <p className="text-xs" style={{ color: C.textDim }}>
          Precautionary Principle &mdash; Guilty Until Proven Innocent
        </p>
      </div>

      <div className="px-6 pb-10">
        {/* ═══════════════════════════════════════
            SECTION 1: OVERRIDE HIERARCHY
           ═══════════════════════════════════════ */}
        <SectionHeading title="Override Hierarchy" />

        <div className="flex flex-col gap-3">
          {/* Priority 1 — Audio */}
          <Card>
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-base"
                style={{
                  backgroundColor: C.risk + "15",
                  border: `1px solid ${C.risk}30`,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.risk}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-[10px] font-mono font-bold"
                    style={{ color: C.textDim }}
                  >
                    PRIORITY 1
                  </span>
                  <Badge label="CRITICAL" color={C.risk} />
                </div>
                <h3 className="text-sm font-bold mb-1">
                  Audio overrides Visual
                </h3>
                <p
                  className="text-[11px] mb-2 leading-relaxed"
                  style={{ color: C.textMuted }}
                >
                  <span style={{ color: C.textDim }}>Trigger:</span> Driver
                  voice note contains keywords
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {AUDIO_KEYWORDS.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                      style={{
                        backgroundColor: C.risk + "15",
                        color: C.risk,
                        border: `1px solid ${C.risk}30`,
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
                <p
                  className="text-[10px] leading-relaxed"
                  style={{ color: C.warning }}
                >
                  Action: Shatters any clean AI score &rarr; mandatory XRF
                  screening
                </p>
              </div>
            </div>
          </Card>

          {/* Priority 2 — Origin */}
          <Card>
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: C.warning + "15",
                  border: `1px solid ${C.warning}30`,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.warning}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-[10px] font-mono font-bold"
                    style={{ color: C.textDim }}
                  >
                    PRIORITY 2
                  </span>
                  <Badge label="HIGH" color={C.warning} />
                </div>
                <h3 className="text-sm font-bold mb-1">
                  Origin overrides Visual
                </h3>
                <p
                  className="text-[11px] mb-1 leading-relaxed"
                  style={{ color: C.textMuted }}
                >
                  <span style={{ color: C.textDim }}>Trigger:</span> Risk Origin
                  dropdown = Demolition
                </p>
                <p
                  className="text-[10px] leading-relaxed"
                  style={{ color: C.warning }}
                >
                  Action: Hard-override AI &rarr; flag as high-risk subject
                  waste
                </p>
              </div>
            </div>
          </Card>

          {/* Priority 3 — Hub */}
          <Card>
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: C.tech + "15",
                  border: `1px solid ${C.tech}30`,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.tech}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-[10px] font-mono font-bold"
                    style={{ color: C.textDim }}
                  >
                    PRIORITY 3
                  </span>
                  <Badge label="STANDARD" color={C.tech} />
                </div>
                <h3 className="text-sm font-bold mb-1">Hub overrides Edge</h3>
                <p
                  className="text-[11px] mb-1 leading-relaxed"
                  style={{ color: C.textMuted }}
                >
                  <span style={{ color: C.textDim }}>Trigger:</span> Stationary
                  XRF/NIR sensors at hub
                </p>
                <p
                  className="text-[10px] leading-relaxed"
                  style={{ color: C.warning }}
                >
                  Action: Hub delivers verdict; edge delivers estimate
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ═══════════════════════════════════════
            SECTION 2: INTERACTIVE SIMULATOR
           ═══════════════════════════════════════ */}
        <SectionHeading title="Interactive Verification Simulator" />

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((s) => {
            const labels = ["Edge", "Audio", "Origin", "Hub XRF", "RAG"];
            const active = sim.step >= s;
            return (
              <div key={s} className="flex items-center gap-1 shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black"
                  style={{
                    backgroundColor: active ? C.tech + "25" : C.surface,
                    color: active ? C.tech : C.textDim,
                    border: `1px solid ${active ? C.tech + "60" : C.border}`,
                  }}
                >
                  {s}
                </div>
                <span
                  className="text-[9px] font-bold uppercase tracking-wider mr-2"
                  style={{ color: active ? C.tech : C.textDim }}
                >
                  {labels[s - 1]}
                </span>
                {s < 5 && (
                  <div
                    className="w-4 h-px mr-1"
                    style={{
                      backgroundColor: sim.step > s ? C.tech : C.border,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── STEP 1: Edge Estimate ── */}
        <Card style={{ marginBottom: 12 }}>
          <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: C.tech }}>
            Step 1 &mdash; Edge Estimate
          </h3>
          {/* Camera viewfinder */}
          <div
            className="relative rounded-lg mb-3 flex items-center justify-center overflow-hidden"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              height: 160,
            }}
          >
            {/* Crosshairs */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ opacity: 0.3 }}
            >
              <div className="w-20 h-20" style={{ position: "relative" }}>
                <div
                  className="absolute top-0 left-1/2 w-px h-full"
                  style={{ backgroundColor: C.tech, transform: "translateX(-50%)" }}
                />
                <div
                  className="absolute top-1/2 left-0 w-full h-px"
                  style={{ backgroundColor: C.tech, transform: "translateY(-50%)" }}
                />
                {/* Corner brackets */}
                <div
                  className="absolute top-0 left-0 w-3 h-3"
                  style={{ borderTop: `2px solid ${C.tech}`, borderLeft: `2px solid ${C.tech}` }}
                />
                <div
                  className="absolute top-0 right-0 w-3 h-3"
                  style={{ borderTop: `2px solid ${C.tech}`, borderRight: `2px solid ${C.tech}` }}
                />
                <div
                  className="absolute bottom-0 left-0 w-3 h-3"
                  style={{ borderBottom: `2px solid ${C.tech}`, borderLeft: `2px solid ${C.tech}` }}
                />
                <div
                  className="absolute bottom-0 right-0 w-3 h-3"
                  style={{ borderBottom: `2px solid ${C.tech}`, borderRight: `2px solid ${C.tech}` }}
                />
              </div>
            </div>
            {sim.scanning && (
              <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
                <ProgressBar progress={scanProgress} color={C.tech} />
                <p
                  className="text-[10px] font-mono text-center mt-1"
                  style={{ color: C.tech }}
                >
                  SCANNING... EfficientNet-B0 INT8 via LiteRT
                </p>
              </div>
            )}
            {!sim.scanning && sim.aiResult === null && (
              <p className="text-[10px] font-mono" style={{ color: C.textDim }}>
                VIEWFINDER READY &mdash; Tensor G5 EdgeTPU
              </p>
            )}
            {sim.aiResult !== null && (
              <div className="text-center">
                <p className="text-[10px] font-mono mb-1" style={{ color: C.textDim }}>
                  AI CONFIDENCE
                </p>
                <p
                  className="text-3xl font-black font-mono"
                  style={{
                    color:
                      sim.aiConfidence! >= 85 ? C.verified : C.risk,
                  }}
                >
                  {sim.aiConfidence}%
                </p>
                <Badge
                  label={
                    sim.aiResult === "CLEAN"
                      ? "CLEAN (Class 146)"
                      : "HIGH RISK"
                  }
                  color={sim.aiResult === "CLEAN" ? C.verified : C.risk}
                />
              </div>
            )}
          </div>
          {sim.aiResult === null && (
            <Btn onClick={handleScan} disabled={sim.scanning} color={C.tech}>
              {sim.scanning ? "Scanning..." : "SCAN"}
            </Btn>
          )}
        </Card>

        {/* ── STEP 2: Audio Analysis ── */}
        {sim.step >= 2 && (
          <Card style={{ marginBottom: 12 }}>
            <h3
              className="text-xs font-black uppercase tracking-wider mb-3"
              style={{ color: C.risk }}
            >
              Step 2 &mdash; Audio Analysis
            </h3>
            <textarea
              value={sim.voiceNote}
              onChange={(e) =>
                setSim((s) => ({ ...s, voiceNote: e.target.value }))
              }
              placeholder='Enter driver voice note... (e.g. "Old deck boards from renovation project")'
              className="w-full rounded-lg p-3 text-xs font-mono resize-none min-h-[48px]"
              rows={3}
              style={{
                backgroundColor: C.surface,
                color: C.text,
                border: `1px solid ${C.border}`,
                outline: "none",
              }}
              disabled={sim.audioOverride !== null}
            />
            {sim.audioOverride === null && (
              <div className="mt-3">
                <Btn
                  onClick={handleAnalyze}
                  disabled={sim.analyzing || !sim.voiceNote.trim()}
                  color={C.risk}
                >
                  {sim.analyzing ? "Analyzing..." : "ANALYZE"}
                </Btn>
              </div>
            )}
            {sim.audioOverride !== null && (
              <div className="mt-3">
                {sim.detectedKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {sim.detectedKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                        style={{
                          backgroundColor: C.risk + "25",
                          color: C.risk,
                          border: `1px solid ${C.risk}`,
                        }}
                      >
                        DETECTED: {kw}
                      </span>
                    ))}
                  </div>
                )}
                <div
                  className={`rounded-lg px-3 py-2 text-xs font-bold ${sim.audioOverride ? "animate-pulse" : ""}`}
                  style={{
                    backgroundColor: sim.audioOverride
                      ? C.risk + "20"
                      : C.verified + "20",
                    color: sim.audioOverride ? C.risk : C.verified,
                    border: `1px solid ${sim.audioOverride ? C.risk : C.verified}`,
                  }}
                >
                  {sim.audioOverride
                    ? "AUDIO OVERRIDE TRIGGERED"
                    : "NO OVERRIDE"}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ── STEP 3: Origin Check ── */}
        {sim.step >= 3 && (
          <Card style={{ marginBottom: 12 }}>
            <h3
              className="text-xs font-black uppercase tracking-wider mb-3"
              style={{ color: C.warning }}
            >
              Step 3 &mdash; Origin Check
            </h3>
            <select
              value={sim.origin}
              onChange={(e) => handleOrigin(e.target.value)}
              className="w-full rounded-lg p-3 text-xs font-mono min-h-[48px] cursor-pointer"
              style={{
                backgroundColor: C.surface,
                color: sim.origin ? C.text : C.textDim,
                border: `1px solid ${C.border}`,
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
              }}
              disabled={!!sim.origin}
            >
              <option value="">Select site origin...</option>
              <option value="Construction">Construction</option>
              <option value="Demolition">Demolition</option>
              <option value="Renovation">Renovation</option>
              <option value="Landscaping">Landscaping</option>
            </select>
            {sim.originOverride && (
              <div
                className="mt-3 rounded-lg px-3 py-2 text-xs font-bold animate-pulse"
                style={{
                  backgroundColor: C.risk + "20",
                  color: C.risk,
                  border: `1px solid ${C.risk}`,
                }}
              >
                ORIGIN OVERRIDE &mdash; HIGH RISK ENFORCED
              </div>
            )}
            {sim.origin && !sim.originOverride && (
              <div
                className="mt-3 rounded-lg px-3 py-2 text-xs font-bold"
                style={{
                  backgroundColor: C.verified + "20",
                  color: C.verified,
                  border: `1px solid ${C.verified}`,
                }}
              >
                Origin: {sim.origin} &mdash; No override
              </div>
            )}
          </Card>
        )}

        {/* ── STEP 4: Hub XRF/NIR ── */}
        {sim.step >= 4 && (
          <Card style={{ marginBottom: 12 }}>
            <h3
              className="text-xs font-black uppercase tracking-wider mb-3"
              style={{ color: C.tech }}
            >
              Step 4 &mdash; Hub Verdict (XRF/NIR)
            </h3>
            <p className="text-[10px] mb-3" style={{ color: C.textDim }}>
              TCLP Chemical Thresholds &mdash; O.Reg 347
            </p>
            <ThresholdGauge
              label="Arsenic (As)"
              value={sim.arsenic}
              max={10}
              threshold={2.5}
            />
            <ThresholdGauge
              label="Lead (Pb)"
              value={sim.lead}
              max={15}
              threshold={5.0}
            />
            <ThresholdGauge
              label="Chromium (Cr)"
              value={sim.chromium}
              max={15}
              threshold={5.0}
            />
            {sim.hubVerdict === null && (
              <div className="mt-3">
                <Btn
                  onClick={handleXrf}
                  disabled={sim.runningXrf}
                  color={C.tech}
                >
                  {sim.runningXrf ? "Running XRF..." : "RUN XRF"}
                </Btn>
              </div>
            )}
            {sim.hubVerdict !== null && (
              <div
                className="mt-3 rounded-lg px-3 py-3 text-center text-sm font-black"
                style={{
                  backgroundColor:
                    sim.hubVerdict === "CLEAN"
                      ? C.verified + "15"
                      : C.risk + "15",
                  color:
                    sim.hubVerdict === "CLEAN" ? C.verified : C.risk,
                  border: `1px solid ${sim.hubVerdict === "CLEAN" ? C.verified : C.risk}`,
                }}
              >
                {sim.hubVerdict === "CLEAN"
                  ? "CLEAN \u2014 DIVERT TO BIOHUB"
                  : "SUBJECT WASTE \u2014 AUTO-MANIFEST RPRA"}
              </div>
            )}
          </Card>
        )}

        {/* ── STEP 5: RAG Citation ── */}
        {sim.step >= 5 && (
          <Card style={{ marginBottom: 12 }}>
            <h3
              className="text-xs font-black uppercase tracking-wider mb-3"
              style={{ color: C.carbon }}
            >
              Step 5 &mdash; RAG Citation
            </h3>
            {!sim.citationShown && (
              <Btn onClick={handleCitation} color={C.carbon}>
                GENERATE DECISION LINEAGE
              </Btn>
            )}
            {sim.citationShown && (
              <div>
                <div
                  className="rounded-lg p-3 mb-3 font-mono text-[11px] leading-relaxed"
                  style={{
                    backgroundColor: C.surface,
                    border: `1px solid ${C.border}`,
                    color: C.text,
                  }}
                >
                  <p style={{ color: C.warning }} className="font-bold mb-2">
                    O.Reg 347 Schedule 4 &mdash; Waste Classification
                  </p>
                  <p style={{ color: C.textMuted }} className="mb-1">
                    {sim.hubVerdict === "SUBJECT_WASTE" || isOverridden
                      ? "Material classified as Subject Waste under O.Reg 347. Automatic manifest generation required via RPRA HWPR API. TCLP leachate analysis confirms exceedance of regulated thresholds."
                      : "Material classified as Clean Wood (Class 146) under O.Reg 347 Schedule 4. Eligible for diversion to pyrogenic biocarbon processing. No RPRA manifest required."}
                  </p>
                </div>
                <div
                  className="rounded-lg p-3 font-mono text-[10px] leading-relaxed"
                  style={{
                    backgroundColor: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                      style={{
                        backgroundColor: C.tech + "20",
                        color: C.tech,
                        border: `1px solid ${C.tech}40`,
                      }}
                    >
                      The Time Machine
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={C.tech}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <p style={{ color: C.textMuted }}>
                    Frozen at{" "}
                    <span style={{ color: C.text }}>{isoNow()}</span>
                  </p>
                  <p style={{ color: C.textMuted }}>
                    Model{" "}
                    <span style={{ color: C.text }}>v2.4.1</span> | Dataset{" "}
                    <span style={{ color: C.text }}>905W-2026Q1</span>
                  </p>
                  <p style={{ color: C.textMuted }}>
                    AI Confidence:{" "}
                    <span style={{ color: C.text }}>{sim.aiConfidence}%</span> |
                    Audio Override:{" "}
                    <span
                      style={{
                        color: sim.audioOverride ? C.risk : C.verified,
                      }}
                    >
                      {sim.audioOverride ? "YES" : "NO"}
                    </span>{" "}
                    | Origin Override:{" "}
                    <span
                      style={{
                        color: sim.originOverride ? C.risk : C.verified,
                      }}
                    >
                      {sim.originOverride ? "YES" : "NO"}
                    </span>
                  </p>
                  <p style={{ color: C.textMuted }}>
                    XRF: As={sim.arsenic} / Pb={sim.lead} / Cr={sim.chromium}{" "}
                    mg/L
                  </p>
                </div>

                {/* Final verdict banner */}
                <div
                  className="mt-3 rounded-lg px-4 py-3 text-center text-sm font-black"
                  style={{
                    backgroundColor:
                      finalVerdict === "CLEAN"
                        ? C.verified + "15"
                        : C.risk + "15",
                    color:
                      finalVerdict === "CLEAN" ? C.verified : C.risk,
                    border: `2px solid ${finalVerdict === "CLEAN" ? C.verified : C.risk}`,
                  }}
                >
                  FINAL DETERMINATION:{" "}
                  {finalVerdict === "CLEAN"
                    ? "CLEAN \u2014 CLEARED FOR BIOHUB"
                    : "SUBJECT WASTE \u2014 RPRA MANIFEST GENERATED"}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Reset button */}
        {sim.step > 1 && (
          <div className="flex justify-center mt-2 mb-4">
            <Btn onClick={handleReset} color={C.textDim}>
              RESET SIMULATOR
            </Btn>
          </div>
        )}

        {/* ═══════════════════════════════════════
            SECTION 3: CRITICAL FAILURE MODES
           ═══════════════════════════════════════ */}
        <SectionHeading title="Critical Failure Modes" />

        <div className="flex flex-col gap-3">
          {FAILURE_MODES.map((fm) => (
            <Card key={fm.name}>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge label={fm.severity} color={fm.color} pulse={fm.pulse} />
                <h3 className="text-sm font-bold">{fm.name}</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <span
                    className="text-[9px] uppercase tracking-wider font-bold"
                    style={{ color: C.textDim }}
                  >
                    Consequence
                  </span>
                  <p
                    className="text-[11px] leading-relaxed"
                    style={{ color: C.textMuted }}
                  >
                    {fm.consequence}
                  </p>
                </div>
                <div>
                  <span
                    className="text-[9px] uppercase tracking-wider font-bold"
                    style={{ color: C.carbon }}
                  >
                    Strategic Reward
                  </span>
                  <p
                    className="text-[11px] leading-relaxed"
                    style={{ color: C.textMuted }}
                  >
                    {fm.reward}
                  </p>
                </div>
                <div>
                  <span
                    className="text-[9px] uppercase tracking-wider font-bold"
                    style={{ color: C.tech }}
                  >
                    Value
                  </span>
                  <p
                    className="text-[11px] leading-relaxed"
                    style={{ color: C.textMuted }}
                  >
                    {fm.value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ═══════════════════════════════════════
            SECTION 4: VERIFICATION CHAIN FLOW
           ═══════════════════════════════════════ */}
        <SectionHeading title="Verification Chain Flow" />

        <Card>
          <div className="flex items-center justify-between overflow-x-auto py-4 px-2">
            {chainNodes.map((node, i) => {
              const statusColor =
                node.status === "pass"
                  ? C.verified
                  : node.status === "fail"
                    ? C.risk
                    : node.status === "pending"
                      ? C.warning
                      : C.textDim;

              return (
                <div key={node.label} className="flex items-center shrink-0">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500"
                      style={{
                        backgroundColor: statusColor + "20",
                        color: statusColor,
                        border: `2px solid ${statusColor}`,
                        boxShadow:
                          node.status === "pass"
                            ? `0 0 12px ${statusColor}40`
                            : node.status === "fail"
                              ? `0 0 12px ${statusColor}40`
                              : "none",
                      }}
                    >
                      {node.status === "pass"
                        ? "\u2713"
                        : node.status === "fail"
                          ? "\u2717"
                          : (i + 1).toString()}
                    </div>
                    <span
                      className="text-[10px] font-bold mt-1.5"
                      style={{ color: statusColor }}
                    >
                      {node.label}
                    </span>
                    <span
                      className="text-[8px]"
                      style={{ color: C.textDim }}
                    >
                      {node.sub}
                    </span>
                  </div>
                  {i < chainNodes.length - 1 && (
                    <div
                      className="w-5 h-0.5 mx-1"
                      style={{
                        backgroundColor:
                          chainNodes[i + 1].status !== "idle"
                            ? C.tech + "60"
                            : C.border,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <p
            className="text-[10px] text-center mt-2"
            style={{ color: C.textDim }}
          >
            Edge (Estimate) &rarr; Hub (Verdict) &rarr; RAG (Citation) &rarr;
            Certificate (USMCA) &rarr; Border (Cleared)
          </p>
        </Card>
      </div>

      {/* ══ FOOTER ══ */}
      <footer
        className="px-6 py-6 text-center mt-auto"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <p className="text-[10px]" style={{ color: C.textDim }}>
          905WOOD | 905Wood.com | Est. 2010 | Hamilton/GTA, Ontario
        </p>
        <p className="text-[10px] mt-1" style={{ color: C.textDim }}>
          +1 (833) 863-9663 | sales@905wood.com
        </p>
      </footer>
    </main>
  );
}
