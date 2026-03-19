"use client";

import { useState, useCallback, useEffect, useRef } from "react";

// ─── 905WOOD Design Tokens (Cyber-Physical Industrial) ───────────────
const C = {
  verified: "#30D158",
  risk: "#FF453A",
  warning: "#FFD60A",
  tech: "#64D2FF",
  carbon: "#34C759",
  bg: "#000000",
  surface: "#0A0A0A",
  surface2: "#141414",
  surface3: "#1C1C1E",
  border: "#2C2C2E",
  borderActive: "#3A3A3C",
  text: "#F5F5F7",
  textMuted: "#8E8E93",
  textDim: "#636366",
};

// ─── Volumetric Constants ────────────────────────────────────────────
const VOID_RATIO = 0.7645;
const DENSITY_KG_M3 = 174;
const YARD_TO_M3 = 0.764555;
const CORC_YIELD = 0.75; // tonnes CO₂e per dry tonne
const CORC_PRICE = 350; // $/ton

// ─── Types ───────────────────────────────────────────────────────────
type Tab = "intake" | "dispatch" | "comply" | "billing" | "report";
type RiskLevel = "clean" | "low" | "medium" | "high" | "critical";
type SealState = "idle" | "holding" | "sealed" | "failed";

interface IntakeRecord {
  id: string;
  timestamp: number;
  binYards: number;
  materialType: string;
  riskLevel: RiskLevel;
  estimatedWeight: number;
  gpsLat: number;
  gpsLng: number;
  aiConfidence: number;
  overrideApplied: string | null;
  sealState: SealState;
  origin: string;
  driverNote: string;
}

// ─── Utility ─────────────────────────────────────────────────────────
function calcWeight(binYards: number): number {
  return binYards * YARD_TO_M3 * VOID_RATIO * DENSITY_KG_M3;
}

function calcCIRCIL(tonnes: number, materialType: string): number {
  const rates: Record<string, number> = {
    clean_wood: 5,
    mixed_wood: 25,
    painted: 45,
    demolition: 60,
  };
  return tonnes * (rates[materialType] ?? 25);
}

function calcBaseLogistics(binYards: number): number {
  if (binYards <= 10) return 295;
  if (binYards <= 14) return 350;
  if (binYards <= 20) return 420;
  return 550;
}

function riskColor(level: RiskLevel): string {
  switch (level) {
    case "clean": return C.verified;
    case "low": return C.verified;
    case "medium": return C.warning;
    case "high": return C.risk;
    case "critical": return C.risk;
  }
}

function riskLabel(level: RiskLevel): string {
  switch (level) {
    case "clean": return "CLEAN — Class 146";
    case "low": return "LOW RISK";
    case "medium": return "MEDIUM — Mixed";
    case "high": return "HIGH RISK — Treated";
    case "critical": return "CRITICAL — Hazardous";
  }
}

function generateId(): string {
  return `905W-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

// ─── Mock GPS (Hamilton, ON) ─────────────────────────────────────────
function mockGPS() {
  return {
    lat: 43.2557 + (Math.random() - 0.5) * 0.05,
    lng: -79.8711 + (Math.random() - 0.5) * 0.05,
  };
}

// ─── TCLP Thresholds (mg/L) ─────────────────────────────────────────
const TCLP = {
  arsenic: { limit: 2.5, unit: "mg/L" },
  lead: { limit: 5.0, unit: "mg/L" },
  chromium: { limit: 5.0, unit: "mg/L" },
};

// ═══════════════════════════════════════════════════════════════════════
// TAB 1: INTAKE — The Compliance Gate
// ═══════════════════════════════════════════════════════════════════════
function IntakeTab({
  onRecordCreated,
}: {
  onRecordCreated: (r: IntakeRecord) => void;
}) {
  const [binSize, setBinSize] = useState(14);
  const [materialType, setMaterialType] = useState("clean_wood");
  const [origin, setOrigin] = useState("Construction");
  const [driverNote, setDriverNote] = useState("");
  const [aiConfidence, setAiConfidence] = useState(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("clean");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [sealState, setSealState] = useState<SealState>("idle");
  const [sealProgress, setSealProgress] = useState(0);
  const [overrideApplied, setOverrideApplied] = useState<string | null>(null);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef<number>(0);

  const estimatedWeight = calcWeight(binSize);
  const isOverweight = estimatedWeight > 4000 && binSize <= 14;

  // ── Precautionary Principle: Override Logic ──
  const applyOverrides = useCallback(
    (baseRisk: RiskLevel, conf: number): { risk: RiskLevel; override: string | null } => {
      // Rule 1: Audio overrides Visual
      const dangerWords = ["deck", "demolition", "renovation", "painted", "railway tie", "pressure treated"];
      const noteLC = driverNote.toLowerCase();
      for (const word of dangerWords) {
        if (noteLC.includes(word)) {
          return { risk: "high", override: `AUDIO OVERRIDE: "${word}" detected in driver note` };
        }
      }
      // Rule 2: Origin overrides Visual
      if (origin === "Demolition") {
        return { risk: "high", override: "ORIGIN OVERRIDE: Demolition source — hard override to High-Risk" };
      }
      return { risk: baseRisk, override: null };
    },
    [driverNote, origin]
  );

  // ── Simulate AI Triage (<2s on Tensor G5 / LiteRT) ──
  const runAITriage = useCallback(() => {
    setScanning(true);
    setScanned(false);
    setSealState("idle");
    setSealProgress(0);
    setOverrideApplied(null);

    // Simulate EfficientNet-B0 INT8 inference
    const inferenceTime = 800 + Math.random() * 1000; // 0.8–1.8s
    setTimeout(() => {
      const conf = 0.72 + Math.random() * 0.26; // 72–98%
      setAiConfidence(conf);

      let baseRisk: RiskLevel = "clean";
      if (materialType === "mixed_wood") baseRisk = "medium";
      else if (materialType === "painted") baseRisk = "high";
      else if (materialType === "demolition") baseRisk = "critical";

      const { risk, override } = applyOverrides(baseRisk, conf);
      setRiskLevel(risk);
      setOverrideApplied(override);
      setScanning(false);
      setScanned(true);
    }, inferenceTime);
  }, [materialType, applyOverrides]);

  // ── Hold-to-Seal: 2.0s Haptic Verification ──
  const startSeal = useCallback(() => {
    if (sealState === "sealed") return;
    setSealState("holding");
    setSealProgress(0);
    holdStart.current = Date.now();

    holdTimer.current = setInterval(() => {
      const elapsed = Date.now() - holdStart.current;
      const progress = Math.min(elapsed / 2000, 1);
      setSealProgress(progress);

      if (progress >= 1) {
        if (holdTimer.current) clearInterval(holdTimer.current);
        setSealState("sealed");
        // Trigger haptic feedback if available
        if (navigator.vibrate) navigator.vibrate([100, 50, 200]);

        const gps = mockGPS();
        const record: IntakeRecord = {
          id: generateId(),
          timestamp: Date.now(),
          binYards: binSize,
          materialType,
          riskLevel,
          estimatedWeight,
          gpsLat: gps.lat,
          gpsLng: gps.lng,
          aiConfidence,
          overrideApplied,
          sealState: "sealed",
          origin,
          driverNote,
        };
        onRecordCreated(record);
      }
    }, 50);
  }, [sealState, binSize, materialType, riskLevel, estimatedWeight, aiConfidence, overrideApplied, origin, driverNote, onRecordCreated]);

  const cancelSeal = useCallback(() => {
    if (holdTimer.current) clearInterval(holdTimer.current);
    if (sealState === "holding") {
      setSealState("failed");
      setSealProgress(0);
      setTimeout(() => setSealState("idle"), 1500);
    }
  }, [sealState]);

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearInterval(holdTimer.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: C.text }}>
            Compliance Gate
          </h2>
          <p className="text-xs" style={{ color: C.textDim }}>
            Layer 1 — Edge AI Triage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: C.tech }} />
          <span className="text-xs font-mono" style={{ color: C.tech }}>
            Tensor G5 / LiteRT
          </span>
        </div>
      </div>

      {/* Bin Size Selector */}
      <div className="rounded-xl p-3" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
        <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: C.textMuted }}>
          Bin Size
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[10, 14, 20, 40].map((size) => (
            <button
              key={size}
              onClick={() => setBinSize(size)}
              className="rounded-lg py-2 text-center text-sm font-bold transition-all"
              style={{
                backgroundColor: binSize === size ? C.tech + "20" : C.surface3,
                border: `1px solid ${binSize === size ? C.tech : C.border}`,
                color: binSize === size ? C.tech : C.textMuted,
              }}
            >
              {size}yd
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs" style={{ color: C.textDim }}>
          <span>Est. Weight: {estimatedWeight.toFixed(0)} kg</span>
          <span>{(estimatedWeight / 1000).toFixed(2)} tonnes</span>
        </div>
        {isOverweight && (
          <div className="mt-2 rounded-lg px-3 py-2 text-xs font-bold" style={{ backgroundColor: C.warning + "20", color: C.warning, border: `1px solid ${C.warning}40` }}>
            OVERWEIGHT WARNING — Wet wood &quot;sponge effect&quot; risk. Load exceeds 4,000 kg.
          </div>
        )}
      </div>

      {/* Material Type */}
      <div className="rounded-xl p-3" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
        <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: C.textMuted }}>
          Material Classification
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "clean_wood", label: "Clean Wood", sub: "Untreated lumber" },
            { id: "mixed_wood", label: "Mixed Wood", sub: "Nails, minor paint" },
            { id: "painted", label: "Painted/Stained", sub: "Non-CCA treated" },
            { id: "demolition", label: "Demolition", sub: "Unknown origin" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMaterialType(m.id)}
              className="rounded-lg p-2 text-left transition-all"
              style={{
                backgroundColor: materialType === m.id ? C.surface3 : C.surface,
                border: `1px solid ${materialType === m.id ? C.tech : C.border}`,
              }}
            >
              <div className="text-xs font-semibold" style={{ color: materialType === m.id ? C.text : C.textMuted }}>{m.label}</div>
              <div className="text-[10px]" style={{ color: C.textDim }}>{m.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Origin Dropdown */}
      <div className="rounded-xl p-3" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
        <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: C.textMuted }}>
          Site Origin
        </label>
        <select
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm"
          style={{ backgroundColor: C.surface3, color: C.text, border: `1px solid ${C.border}` }}
        >
          <option value="Construction">Construction (New Build)</option>
          <option value="Renovation">Renovation</option>
          <option value="Demolition">Demolition</option>
          <option value="Industrial">Industrial / Manufacturing</option>
          <option value="Municipal">Municipal Collection</option>
        </select>
      </div>

      {/* Driver Voice Note (Audio Override) */}
      <div className="rounded-xl p-3" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
        <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: C.textMuted }}>
          Driver Note (Audio Override)
        </label>
        <textarea
          value={driverNote}
          onChange={(e) => setDriverNote(e.target.value)}
          placeholder='e.g. "Old deck boards, possible pressure treated"'
          rows={2}
          className="w-full rounded-lg px-3 py-2 text-sm resize-none"
          style={{ backgroundColor: C.surface3, color: C.text, border: `1px solid ${C.border}` }}
        />
        <p className="mt-1 text-[10px]" style={{ color: C.textDim }}>
          Precautionary Principle: Keywords &quot;deck&quot;, &quot;demolition&quot;, &quot;painted&quot;, &quot;pressure treated&quot; override AI classification
        </p>
      </div>

      {/* AI Triage Button */}
      <button
        onClick={runAITriage}
        disabled={scanning}
        className="w-full rounded-xl py-3 text-sm font-bold uppercase tracking-wider transition-all"
        style={{
          backgroundColor: scanning ? C.surface3 : C.tech + "20",
          color: scanning ? C.textDim : C.tech,
          border: `1px solid ${scanning ? C.border : C.tech}`,
        }}
      >
        {scanning ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: `${C.tech}40`, borderTopColor: C.tech }} />
            Running EfficientNet-B0 INT8...
          </span>
        ) : (
          "Run AI Triage"
        )}
      </button>

      {/* AI Result */}
      {scanned && (
        <div className="rounded-xl p-4" style={{ backgroundColor: C.surface2, border: `1px solid ${riskColor(riskLevel)}40` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: riskColor(riskLevel) }}>
              {riskLabel(riskLevel)}
            </div>
            <div className="text-xs font-mono" style={{ color: C.textMuted }}>
              {(aiConfidence * 100).toFixed(1)}% confidence
            </div>
          </div>

          {/* Confidence Bar */}
          <div className="h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: C.surface3 }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${aiConfidence * 100}%`, backgroundColor: riskColor(riskLevel) }}
            />
          </div>

          {/* Override Alert */}
          {overrideApplied && (
            <div className="rounded-lg px-3 py-2 mb-3 text-xs font-bold" style={{ backgroundColor: C.risk + "15", color: C.risk, border: `1px solid ${C.risk}30` }}>
              {overrideApplied}
            </div>
          )}

          {/* HITL Alert */}
          {aiConfidence < 0.85 && (
            <div className="rounded-lg px-3 py-2 mb-3 text-xs" style={{ backgroundColor: C.warning + "15", color: C.warning, border: `1px solid ${C.warning}30` }}>
              HITL ALERT — Confidence below 85%. Escalating for human review.
            </div>
          )}

          {/* Hold-to-Seal */}
          <div className="mt-2">
            <p className="text-[10px] uppercase tracking-wider mb-2 text-center" style={{ color: C.textDim }}>
              Hold-to-Seal — 2.0s Haptic Chain of Custody Lock
            </p>
            <button
              onMouseDown={startSeal}
              onMouseUp={cancelSeal}
              onMouseLeave={cancelSeal}
              onTouchStart={startSeal}
              onTouchEnd={cancelSeal}
              disabled={sealState === "sealed"}
              className="relative w-full rounded-xl py-4 text-sm font-bold uppercase tracking-wider overflow-hidden transition-all"
              style={{
                backgroundColor: sealState === "sealed" ? C.verified + "20" : sealState === "failed" ? C.risk + "20" : C.surface3,
                color: sealState === "sealed" ? C.verified : sealState === "holding" ? C.warning : sealState === "failed" ? C.risk : C.text,
                border: `2px solid ${sealState === "sealed" ? C.verified : sealState === "holding" ? C.warning : sealState === "failed" ? C.risk : C.border}`,
              }}
            >
              {/* Progress fill */}
              {sealState === "holding" && (
                <div
                  className="absolute inset-0 transition-none"
                  style={{
                    width: `${sealProgress * 100}%`,
                    backgroundColor: C.warning + "20",
                  }}
                />
              )}
              <span className="relative z-10">
                {sealState === "idle" && "HOLD TO SEAL"}
                {sealState === "holding" && `SEALING... ${(sealProgress * 2).toFixed(1)}s`}
                {sealState === "sealed" && "SEALED — Chain of Custody Locked"}
                {sealState === "failed" && "SEAL BROKEN — Try Again"}
              </span>
            </button>
            <p className="text-[10px] text-center mt-1" style={{ color: C.textDim }}>
              Titan M2 Hardware Attestation — GPS + Timestamp + Model Version
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 2: DISPATCH — Logistics / Hub-and-Spoke
// ═══════════════════════════════════════════════════════════════════════
function DispatchTab({ records }: { records: IntakeRecord[] }) {
  const activeLoads = [
    { id: "LD-001", truck: "Unit 7 (20yd)", status: "En Route", dest: "Hamilton Hub", eta: "12 min", fill: 82 },
    { id: "LD-002", truck: "Unit 3 (14yd)", status: "Loading", dest: "Oakville Site", eta: "—", fill: 35 },
    { id: "LD-003", truck: "Mothership (144yd)", status: "At Hub", dest: "CHAR BioHub", eta: "Ready", fill: 91 },
    { id: "LD-004", truck: "Unit 12 (40yd)", status: "Returning", dest: "Depot", eta: "28 min", fill: 0 },
  ];

  const fifoQueue = [
    { pile: "P-A3", age: "18h", temp: "42°C", status: "ok" },
    { pile: "P-B1", age: "36h", temp: "51°C", status: "warning" },
    { pile: "P-C2", age: "64h", temp: "58°C", status: "critical" },
    { pile: "P-D1", age: "4h", temp: "28°C", status: "ok" },
  ];

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: C.text }}>Fleet Dispatch</h2>
          <p className="text-xs" style={{ color: C.textDim }}>Layer 2 — Hub-and-Spoke / EDI X12</p>
        </div>
        <div className="px-2 py-1 rounded-lg text-xs font-mono" style={{ backgroundColor: C.verified + "15", color: C.verified }}>
          {activeLoads.length} Active
        </div>
      </div>

      {/* Active Loads */}
      <div className="flex flex-col gap-2">
        {activeLoads.map((load) => (
          <div key={load.id} className="rounded-xl p-3" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold" style={{ color: C.text }}>{load.id}</span>
                <span className="text-xs ml-2" style={{ color: C.textMuted }}>{load.truck}</span>
              </div>
              <span
                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: load.status === "En Route" ? C.tech + "20" : load.status === "Loading" ? C.warning + "20" : load.status === "At Hub" ? C.verified + "20" : C.textDim + "20",
                  color: load.status === "En Route" ? C.tech : load.status === "Loading" ? C.warning : load.status === "At Hub" ? C.verified : C.textMuted,
                }}
              >
                {load.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]" style={{ color: C.textDim }}>
              <span>{load.dest}</span>
              <span>ETA: {load.eta}</span>
            </div>
            {load.fill > 0 && (
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.surface3 }}>
                <div className="h-full rounded-full" style={{ width: `${load.fill}%`, backgroundColor: load.fill > 85 ? C.warning : C.tech }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FIFO Monitor */}
      <div className="rounded-xl p-3" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>
            FIFO Pile Monitor — Combustion Prevention
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {fifoQueue.map((pile) => (
            <div key={pile.pile} className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ backgroundColor: C.surface3 }}>
              <span className="text-xs font-mono font-bold" style={{ color: C.text }}>{pile.pile}</span>
              <span className="text-[10px]" style={{ color: C.textMuted }}>{pile.age}</span>
              <span className="text-[10px] font-mono" style={{ color: pile.status === "ok" ? C.verified : pile.status === "warning" ? C.warning : C.risk }}>
                {pile.temp}
              </span>
              <span
                className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: pile.status === "ok" ? C.verified + "15" : pile.status === "warning" ? C.warning + "15" : C.risk + "15",
                  color: pile.status === "ok" ? C.verified : pile.status === "warning" ? C.warning : C.risk,
                }}
              >
                {pile.status === "critical" ? "MOVE NOW" : pile.status === "warning" ? "AGING" : "OK"}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] mt-2" style={{ color: C.textDim }}>
          Piles &gt;72h without movement trigger emergency FIFO rotation. $75/day Diversion Pass enforces velocity.
        </p>
      </div>

      {/* Sealed Records Count */}
      <div className="rounded-xl p-3 text-center" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
        <span className="text-xs" style={{ color: C.textMuted }}>Sealed Intakes Today: </span>
        <span className="text-sm font-bold" style={{ color: C.verified }}>{records.length}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 3: COMPLY — Regulatory / RAG Engine
// ═══════════════════════════════════════════════════════════════════════
function ComplyTab({ records }: { records: IntakeRecord[] }) {
  const [queryText, setQueryText] = useState("");
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [querying, setQuerying] = useState(false);

  const runQuery = useCallback(() => {
    if (!queryText.trim()) return;
    setQuerying(true);
    setQueryResult(null);
    setTimeout(() => {
      setQueryResult(
        `O.Reg 347, Schedule 4, Section 3(1): "${queryText}" — ` +
        "Waste classified under this regulation must be accompanied by a completed manifest (Part A) " +
        "when transported for disposal. Generator registration with RPRA HWPR is mandatory when TCLP " +
        "levels exceed prescribed thresholds (Arsenic >2.5 mg/L, Lead >5.0 mg/L, Chromium >5.0 mg/L). " +
        "Non-compliance carries penalties under O.Reg 102/94 audit lineage requirements.\n\n" +
        "Citation confidence: 97.2% | Zero-hallucination constraint: ACTIVE | " +
        "AlloyDB ScaNN vector distance: 0.0234"
      );
      setQuerying(false);
    }, 1500);
  }, [queryText]);

  const manifests = records.filter((r) => r.riskLevel === "high" || r.riskLevel === "critical");

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: C.text }}>Compliance Engine</h2>
          <p className="text-xs" style={{ color: C.textDim }}>Layer 3 — Agentic RAG / AlloyDB + ScaNN</p>
        </div>
        <div className="px-2 py-1 rounded-lg text-xs font-mono" style={{ backgroundColor: C.verified + "15", color: C.verified }}>
          Zero-Hallucination
        </div>
      </div>

      {/* TCLP Thresholds */}
      <div className="rounded-xl p-3" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
        <span className="text-xs font-semibold uppercase tracking-wider block mb-3" style={{ color: C.textMuted }}>
          TCLP Chemical Thresholds — Auto-Manifest Triggers
        </span>
        <div className="flex flex-col gap-2">
          {Object.entries(TCLP).map(([chem, { limit, unit }]) => (
            <div key={chem} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ backgroundColor: C.surface3 }}>
              <span className="text-xs font-bold capitalize" style={{ color: C.text }}>{chem}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono" style={{ color: C.risk }}>&gt; {limit} {unit}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: C.risk + "15", color: C.risk }}>
                  AUTO-MANIFEST
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] mt-2" style={{ color: C.textDim }}>
          Exceedance triggers automatic RPRA HWPR Part A manifest via API. Hub XRF/NIR delivers the verdict.
        </p>
      </div>

      {/* RAG Query */}
      <div className="rounded-xl p-3" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
        <span className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: C.textMuted }}>
          Natural Language Compliance Query
        </span>
        <div className="flex gap-2">
          <input
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="e.g. What are CCA wood disposal requirements?"
            className="flex-1 rounded-lg px-3 py-2 text-xs"
            style={{ backgroundColor: C.surface3, color: C.text, border: `1px solid ${C.border}` }}
            onKeyDown={(e) => e.key === "Enter" && runQuery()}
          />
          <button
            onClick={runQuery}
            disabled={querying}
            className="rounded-lg px-3 py-2 text-xs font-bold"
            style={{ backgroundColor: C.tech + "20", color: C.tech, border: `1px solid ${C.tech}` }}
          >
            {querying ? "..." : "Ask"}
          </button>
        </div>
        {queryResult && (
          <div className="mt-3 rounded-lg p-3 text-xs leading-relaxed" style={{ backgroundColor: C.surface, color: C.textMuted, border: `1px solid ${C.border}` }}>
            {queryResult}
          </div>
        )}
      </div>

      {/* Manifest Queue */}
      <div className="rounded-xl p-3" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>
            RPRA HWPR Manifest Queue
          </span>
          <span className="text-xs font-bold" style={{ color: manifests.length > 0 ? C.risk : C.verified }}>
            {manifests.length} Pending
          </span>
        </div>
        {manifests.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: C.textDim }}>No manifests required — all loads classified clean.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {manifests.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ backgroundColor: C.surface3 }}>
                <div>
                  <span className="text-xs font-mono font-bold" style={{ color: C.text }}>{r.id}</span>
                  <span className="text-[10px] ml-2" style={{ color: C.textDim }}>{new Date(r.timestamp).toLocaleTimeString()}</span>
                </div>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: C.risk + "15", color: C.risk }}>
                  {r.riskLevel}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Regulatory Timeline */}
      <div className="rounded-xl p-3" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
        <span className="text-xs font-semibold uppercase tracking-wider block mb-3" style={{ color: C.textMuted }}>
          Capacity Cliff Timeline
        </span>
        {[
          { date: "Jan 1, 2026", event: "Municipal ICI Exit", impact: "Orphan Crisis — 4M tonnes", color: C.warning, done: true },
          { date: "Jul 2026", event: "USMCA Joint Review", impact: "Section 122 tariffs", color: C.risk, done: false },
          { date: "2029", event: "REWOOD Landfill Ban", impact: "Criminal penalties", color: C.risk, done: false },
          { date: "2034", event: "Capacity Exhaustion", impact: "Terminal landfill limit", color: C.risk, done: false },
        ].map((m, i) => (
          <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.done ? C.verified : m.color + "60", border: `2px solid ${m.done ? C.verified : m.color}` }} />
              {i < 3 && <div className="w-0.5 h-6" style={{ backgroundColor: C.border }} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: m.done ? C.verified : C.text }}>{m.event}</span>
                <span className="text-[10px] font-mono" style={{ color: C.textDim }}>{m.date}</span>
              </div>
              <span className="text-[10px]" style={{ color: C.textDim }}>{m.impact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 4: BILLING — Value Realization / Decoupled Billing
// ═══════════════════════════════════════════════════════════════════════
function BillingTab({ records }: { records: IntakeRecord[] }) {
  const invoices = records.map((r) => {
    const tonnes = r.estimatedWeight / 1000;
    const baseLogistics = calcBaseLogistics(r.binYards);
    const weightCharge = tonnes * 142.4;
    const circulLevy = calcCIRCIL(tonnes, r.materialType);
    const total = baseLogistics + weightCharge + circulLevy;
    const cleanBenchmark = baseLogistics + (tonnes * 142.4) + (tonnes * 5);
    const missedSavings = total - cleanBenchmark;
    const corcValue = tonnes * CORC_YIELD * CORC_PRICE;

    return { ...r, tonnes, baseLogistics, weightCharge, circulLevy, total, missedSavings, corcValue };
  });

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalCORC = invoices.reduce((sum, inv) => sum + inv.corcValue, 0);
  const totalLevy = invoices.reduce((sum, inv) => sum + inv.circulLevy, 0);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: C.text }}>Decoupled Billing</h2>
          <p className="text-xs" style={{ color: C.textDim }}>Layer 4 — Transparent 3-Line Invoice</p>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Revenue", value: `$${totalRevenue.toFixed(0)}`, color: C.text },
          { label: "CIRCIL Levy", value: `$${totalLevy.toFixed(0)}`, color: C.warning },
          { label: "CORC Value", value: `$${totalCORC.toFixed(0)}`, color: C.carbon },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textDim }}>{s.label}</div>
            <div className="text-lg font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Invoice List */}
      {invoices.length === 0 ? (
        <div className="rounded-xl p-6 text-center" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
          <p className="text-xs" style={{ color: C.textDim }}>No sealed intakes yet. Complete an intake to generate invoices.</p>
        </div>
      ) : (
        invoices.map((inv) => (
          <div key={inv.id} className="rounded-xl p-4" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold" style={{ color: C.text }}>{inv.id}</span>
              <span className="text-[10px]" style={{ color: C.textDim }}>{new Date(inv.timestamp).toLocaleString()}</span>
            </div>

            {/* 3-Line Invoice */}
            <div className="flex flex-col gap-1.5 mb-3">
              <div className="flex justify-between text-xs py-1.5 px-2 rounded" style={{ backgroundColor: C.surface3 }}>
                <span style={{ color: C.textMuted }}>Base Logistics ({inv.binYards}yd)</span>
                <span className="font-mono font-bold" style={{ color: C.text }}>${inv.baseLogistics.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 px-2 rounded" style={{ backgroundColor: C.surface3 }}>
                <span style={{ color: C.textMuted }}>Net Weight ({inv.tonnes.toFixed(2)}t @ $142.40)</span>
                <span className="font-mono font-bold" style={{ color: C.text }}>${inv.weightCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 px-2 rounded" style={{ backgroundColor: C.surface3 }}>
                <span style={{ color: C.textMuted }}>CIRCIL Levy</span>
                <span className="font-mono font-bold" style={{ color: C.warning }}>${inv.circulLevy.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs py-2 px-2 rounded-lg font-bold" style={{ backgroundColor: C.text + "08", border: `1px solid ${C.border}` }}>
                <span style={{ color: C.text }}>TOTAL</span>
                <span className="font-mono" style={{ color: C.text }}>${inv.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Missed Savings Alert */}
            {inv.missedSavings > 1 && (
              <div className="rounded-lg px-3 py-2 mb-2 text-xs" style={{ backgroundColor: C.risk + "10", border: `1px solid ${C.risk}25`, color: C.risk }}>
                Missed Savings Alert — Failure to sort: You burned <strong>${inv.missedSavings.toFixed(2)}</strong> on this load
              </div>
            )}

            {/* Zero-Levy Report Card */}
            {inv.circulLevy <= inv.tonnes * 5 && (
              <div className="rounded-lg px-3 py-2 mb-2 text-xs" style={{ backgroundColor: C.verified + "10", border: `1px solid ${C.verified}25`, color: C.verified }}>
                Zero-Levy Report Card — Clean sorting drives CIRCIL levy to minimum!
              </div>
            )}

            {/* Carbon Dividend */}
            <div className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: C.carbon + "10", border: `1px solid ${C.carbon}25`, color: C.carbon }}>
              Carbon Dividend: {(inv.tonnes * CORC_YIELD).toFixed(2)}t CO₂e removed = <strong>${inv.corcValue.toFixed(2)}</strong> CORC value
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 5: REPORT — Ecosystem Integration
// ═══════════════════════════════════════════════════════════════════════
function ReportTab({ records }: { records: IntakeRecord[] }) {
  const totalTonnes = records.reduce((sum, r) => sum + r.estimatedWeight / 1000, 0);
  const totalCORC = totalTonnes * CORC_YIELD;
  const totalCORCValue = totalCORC * CORC_PRICE;
  const cleanCount = records.filter((r) => r.riskLevel === "clean" || r.riskLevel === "low").length;
  const diversionRate = records.length > 0 ? (cleanCount / records.length) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: C.text }}>Reporting Hub</h2>
          <p className="text-xs" style={{ color: C.textDim }}>Layer 5 — ForestEdge API / CORC / ESG</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Total Tonnage", value: `${totalTonnes.toFixed(1)}t`, color: C.text },
          { label: "Diversion Rate", value: `${diversionRate.toFixed(0)}%`, color: diversionRate >= 60 ? C.verified : C.warning },
          { label: "CO₂e Removed", value: `${totalCORC.toFixed(2)}t`, color: C.carbon },
          { label: "CORC Value", value: `$${totalCORCValue.toFixed(0)}`, color: C.carbon },
          { label: "Sealed Loads", value: `${records.length}`, color: C.tech },
          { label: "High-Risk Flags", value: `${records.filter((r) => r.riskLevel === "high" || r.riskLevel === "critical").length}`, color: C.risk },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl p-3" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textDim }}>{kpi.label}</div>
            <div className="text-xl font-bold font-mono" style={{ color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* USMCA Shield Status */}
      <div className="rounded-xl p-4" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: C.verified + "20" }}>
            🛡️
          </div>
          <div>
            <span className="text-xs font-bold block" style={{ color: C.text }}>USMCA Shield — 9-Point Certificate</span>
            <span className="text-[10px]" style={{ color: C.textDim }}>HS Code 3825.0 | Wholly Obtained Good</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            "GPS Origin", "HS 3825.0", "XRF Signature",
            "USMCA Attest", "Site Origin", "AI Model v.",
            "Net Weight", "O.Reg 347", "Blockchain Hash",
          ].map((point, i) => (
            <div key={i} className="rounded px-2 py-1.5 text-center" style={{ backgroundColor: C.surface3 }}>
              <div className="text-[9px] font-mono" style={{ color: C.verified }}>✓</div>
              <div className="text-[8px]" style={{ color: C.textDim }}>{point}</div>
            </div>
          ))}
        </div>
        <p className="text-[10px] mt-2" style={{ color: C.textDim }}>
          Titan M2 Hardware Attestation binds all 9 points. Fax-ready, CBP-optimized format.
        </p>
      </div>

      {/* ForestEdge API */}
      <div className="rounded-xl p-3" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
        <span className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: C.textMuted }}>
          ForestEdge API — Scope 3 ESG Data
        </span>
        <div className="rounded-lg p-3 font-mono text-[10px] leading-relaxed" style={{ backgroundColor: C.surface, color: C.tech, border: `1px solid ${C.border}` }}>
          {`GET /v1/forestEdge/scope3\n`}
          {`{\n`}
          {`  "total_co2e_removed": ${totalCORC.toFixed(3)},\n`}
          {`  "corc_certificates": ${records.length},\n`}
          {`  "diversion_rate": ${(diversionRate / 100).toFixed(3)},\n`}
          {`  "tonnes_processed": ${totalTonnes.toFixed(3)},\n`}
          {`  "compliance_status": "O.Reg 347 COMPLIANT",\n`}
          {`  "attestation": "Titan M2 SHA-256"\n`}
          {`}`}
        </div>
      </div>

      {/* Digital Product Passport */}
      <div className="rounded-xl p-3" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
        <span className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: C.textMuted }}>
          Digital Product Passport — Saw Blade to Soil
        </span>
        {records.length > 0 ? (
          <div className="flex flex-col gap-1">
            {records.slice(-3).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-1.5 px-2 rounded" style={{ backgroundColor: C.surface3 }}>
                <span className="text-[10px] font-mono" style={{ color: C.text }}>{r.id}</span>
                <span className="text-[10px]" style={{ color: C.verified }}>PASSPORT ISSUED</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-center py-3" style={{ color: C.textDim }}>Complete intakes to generate Digital Product Passports.</p>
        )}
      </div>

      {/* Craft 4.0 Preview */}
      <div className="rounded-xl p-3" style={{ backgroundColor: C.carbon + "08", border: `1px solid ${C.carbon}20` }}>
        <span className="text-xs font-bold block mb-1" style={{ color: C.carbon }}>Craft 4.0 — Return-to-Sender Loop (2027)</span>
        <p className="text-[10px]" style={{ color: C.textDim }}>
          Refined waste re-manufactured into biocomposite bricks. Pyrogenic biocarbon end product: &lt;10% moisture, 2-4mm chip profile for CHAR Technologies.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN APP — 5-Tab Pixel 10 Pro Layout
// ═══════════════════════════════════════════════════════════════════════
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "intake", label: "Intake", icon: "⊙" },
  { id: "dispatch", label: "Dispatch", icon: "◈" },
  { id: "comply", label: "Comply", icon: "◆" },
  { id: "billing", label: "Billing", icon: "◇" },
  { id: "report", label: "Report", icon: "◎" },
];

export default function DriverApp() {
  const [activeTab, setActiveTab] = useState<Tab>("intake");
  const [records, setRecords] = useState<IntakeRecord[]>([]);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setCurrentTime(fmt());
    const t = setInterval(() => setCurrentTime(fmt()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleRecordCreated = useCallback((r: IntakeRecord) => {
    setRecords((prev) => [...prev, r]);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: C.bg,
        color: C.text,
        maxWidth: "412px",
        margin: "0 auto",
        fontFamily: "'Google Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: C.surface }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: C.verified }}>905</span>
          <span className="text-xs font-bold" style={{ color: C.text }}>WOOD</span>
          <span className="text-[10px] ml-1" style={{ color: C.textDim }}>Digital Refinery</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono" style={{ color: C.textMuted }}>
            {currentTime || "--:--"}
          </span>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.verified }} />
        </div>
      </div>

      {/* Layer Indicator */}
      <div className="flex items-center justify-between px-4 py-1.5" style={{ backgroundColor: C.surface2, borderBottom: `1px solid ${C.border}` }}>
        <span className="text-[10px] uppercase tracking-widest" style={{ color: C.textDim }}>
          L{TABS.findIndex((t) => t.id === activeTab) + 1} — {activeTab === "intake" ? "Compliance Gate" : activeTab === "dispatch" ? "Hub-and-Spoke" : activeTab === "comply" ? "RAG Engine" : activeTab === "billing" ? "Value Realization" : "Ecosystem"}
        </span>
        <span className="text-[10px] font-mono" style={{ color: C.tech }}>
          Pixel 10 Pro / Android 16
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ paddingBottom: "80px" }}>
        {activeTab === "intake" && <IntakeTab onRecordCreated={handleRecordCreated} />}
        {activeTab === "dispatch" && <DispatchTab records={records} />}
        {activeTab === "comply" && <ComplyTab records={records} />}
        {activeTab === "billing" && <BillingTab records={records} />}
        {activeTab === "report" && <ReportTab records={records} />}
      </div>

      {/* Bottom Tab Bar */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full flex items-stretch justify-around py-1 pb-2"
        style={{
          maxWidth: "412px",
          backgroundColor: C.surface,
          borderTop: `1px solid ${C.border}`,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center justify-center py-1.5 px-2 transition-all"
            style={{ minWidth: "56px" }}
          >
            <span
              className="text-lg mb-0.5 transition-all"
              style={{
                color: activeTab === tab.id ? C.tech : C.textDim,
                filter: activeTab === tab.id ? `drop-shadow(0 0 6px ${C.tech}60)` : "none",
              }}
            >
              {tab.icon}
            </span>
            <span
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: activeTab === tab.id ? C.tech : C.textDim }}
            >
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="w-4 h-0.5 rounded-full mt-0.5" style={{ backgroundColor: C.tech }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
