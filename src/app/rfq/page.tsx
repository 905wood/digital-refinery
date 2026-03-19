"use client";

import { useState, useCallback, useEffect } from "react";

// ─── 905WOOD Design Tokens ────────────────────────────────────────────
const COLORS = {
  verified: "#30D158",
  risk: "#FF453A",
  warning: "#FFD60A",
  tech: "#64D2FF",
  carbon: "#34C759",
  bg: "#0A0A0A",
  surface: "#141414",
  surfaceHover: "#1C1C1E",
  border: "#2C2C2E",
  textPrimary: "#F5F5F7",
  textSecondary: "#8E8E93",
};

// ─── Bin Catalog ──────────────────────────────────────────────────────
const BIN_OPTIONS = [
  {
    id: "10yd",
    label: "10-Yard",
    yards: 10,
    dims: '12\' × 8\' × 3.5\'',
    icon: "▪️",
    description: "Small renos, deck removals",
    maxWeight: 2000,
    baseLogistics: 295,
  },
  {
    id: "14yd",
    label: "14-Yard",
    yards: 14,
    dims: '14\' × 8\' × 3.5\'',
    icon: "◼️",
    description: "Mid-size framing, siding jobs",
    maxWeight: 4000,
    baseLogistics: 350,
  },
  {
    id: "20yd",
    label: "20-Yard",
    yards: 20,
    dims: '22\' × 8\' × 4\'',
    icon: "⬛",
    description: "Large construction, multi-trade",
    maxWeight: 6000,
    baseLogistics: 420,
  },
  {
    id: "40yd",
    label: "40-Yard",
    yards: 40,
    dims: '22\' × 8\' × 8\'',
    icon: "🟫",
    description: "Commercial, institutional",
    maxWeight: 10000,
    baseLogistics: 550,
  },
];

// ─── Material Types ───────────────────────────────────────────────────
const MATERIAL_TYPES = [
  {
    id: "clean_wood",
    label: "Clean Wood Only",
    description: "Untreated lumber, framing, pallets, plywood",
    riskLevel: "low",
    circulLevy: 5,
    benchmark: 142.4,
    diversionRate: 92,
  },
  {
    id: "mixed_wood",
    label: "Mixed Wood",
    description: "Wood with nails, minor paint, mixed grades",
    riskLevel: "medium",
    circulLevy: 25,
    benchmark: 165.0,
    diversionRate: 60,
  },
  {
    id: "painted_treated",
    label: "Painted / Stained",
    description: "Painted wood, stained surfaces (non-CCA)",
    riskLevel: "high",
    circulLevy: 45,
    benchmark: 185.0,
    diversionRate: 35,
  },
  {
    id: "demolition_mixed",
    label: "Demolition Mixed",
    description: "Demo waste — may contain treated, unknown origin",
    riskLevel: "critical",
    circulLevy: 60,
    benchmark: 196.96,
    diversionRate: 15,
  },
];

// ─── Origin Types (Precautionary Principle) ───────────────────────────
const ORIGIN_TYPES = [
  { id: "new_construction", label: "New Construction", riskOverride: false },
  { id: "renovation", label: "Renovation", riskOverride: true },
  { id: "demolition", label: "Demolition", riskOverride: true },
  { id: "landscaping", label: "Landscaping / Fencing", riskOverride: false },
  { id: "commercial", label: "Commercial Fit-out", riskOverride: false },
  { id: "industrial", label: "Industrial", riskOverride: true },
];

// ─── Volumetric Calculation ───────────────────────────────────────────
const VOID_RATIO = 0.7645;
const DENSITY_KG_M3 = 174;

function calculateWeight(binYards: number): number {
  return binYards * VOID_RATIO * DENSITY_KG_M3;
}

function kgToTonnes(kg: number): number {
  return kg / 1000;
}

// ─── CORC Calculation ─────────────────────────────────────────────────
const CORC_YIELD_PER_TONNE = 0.75; // tonnes CO2e
const CORC_PRICE = 350; // $/ton

// ─── Step Components ──────────────────────────────────────────────────

interface FormData {
  // Step 1: Contact
  name: string;
  email: string;
  phone: string;
  company: string;
  // Step 2: Project
  address: string;
  city: string;
  postalCode: string;
  projectType: string;
  deliveryDate: string;
  pickupDate: string;
  // Step 3: Bin
  binId: string;
  quantity: number;
  // Step 4: Material
  materialId: string;
  originId: string;
  hasTreeKeywords: boolean;
  // Step 5: Review (computed)
}

const STEPS = [
  { id: 1, title: "Contact", subtitle: "Who you are", icon: "👤" },
  { id: 2, title: "Project", subtitle: "Where & when", icon: "📍" },
  { id: 3, title: "Bin Size", subtitle: "What you need", icon: "📦" },
  { id: 4, title: "Material", subtitle: "Compliance Gate", icon: "🔬" },
  { id: 5, title: "Quote", subtitle: "Decoupled Billing", icon: "💰" },
];

// ─── Reusable Components ──────────────────────────────────────────────

function StepIndicator({
  steps,
  current,
  onNav,
}: {
  steps: typeof STEPS;
  current: number;
  onNav: (s: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1 mb-10">
      {steps.map((step, idx) => {
        const isActive = step.id === current;
        const isComplete = step.id < current;
        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => isComplete && onNav(step.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300
                ${isActive
                  ? "bg-white/10 border border-white/20 text-white shadow-lg shadow-white/5"
                  : isComplete
                    ? "bg-white/5 border border-white/10 text-gray-400 cursor-pointer hover:bg-white/8"
                    : "bg-transparent border border-transparent text-gray-600 cursor-default"
                }
              `}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                  ${isComplete
                    ? "bg-[#30D158] text-black"
                    : isActive
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-gray-600"
                  }
                `}
              >
                {isComplete ? "✓" : step.id}
              </span>
              <span className="hidden sm:inline">{step.title}</span>
            </button>
            {idx < steps.length - 1 && (
              <div
                className={`w-6 h-px mx-1 transition-colors duration-500 ${
                  isComplete ? "bg-[#30D158]/60" : "bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        {label} {required && <span className="text-[#FF453A]">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm
          placeholder:text-gray-600 focus:outline-none focus:border-[#64D2FF]/50 focus:bg-white/8
          transition-all duration-200"
      />
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    low: { bg: "bg-[#30D158]/15", text: "text-[#30D158]", label: "LOW RISK" },
    medium: { bg: "bg-[#FFD60A]/15", text: "text-[#FFD60A]", label: "MODERATE" },
    high: { bg: "bg-[#FF9500]/15", text: "text-[#FF9500]", label: "ELEVATED" },
    critical: { bg: "bg-[#FF453A]/15", text: "text-[#FF453A]", label: "HIGH RISK" },
  };
  const c = config[level] || config.low;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${c.bg} ${c.text}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {c.label}
    </span>
  );
}

// ─── Step 1: Contact ──────────────────────────────────────────────────

function StepContact({
  data,
  update,
}: {
  data: FormData;
  update: (d: Partial<FormData>) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Contact Information</h2>
        <p className="text-sm text-gray-500">
          Tell us who you are so we can prepare your quote.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputField label="Full Name" value={data.name} onChange={(v) => update({ name: v })} placeholder="Mike Smith" required />
        <InputField label="Company" value={data.company} onChange={(v) => update({ company: v })} placeholder="ABC Construction" />
        <InputField label="Email" value={data.email} onChange={(v) => update({ email: v })} type="email" placeholder="mike@company.com" required />
        <InputField label="Phone" value={data.phone} onChange={(v) => update({ phone: v })} type="tel" placeholder="+1 (905) 555-0123" required />
      </div>

      {/* Trust signals */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
        {[
          { icon: "🛡️", text: "SSL Encrypted" },
          { icon: "⚡", text: "Instant Quote" },
          { icon: "♻️", text: "60%+ Diversion" },
          { icon: "📱", text: "iOS & Android App" },
        ].map((s) => (
          <div key={s.text} className="flex items-center gap-2 text-xs text-gray-500">
            <span>{s.icon}</span>
            <span>{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Project Details ──────────────────────────────────────────

function StepProject({
  data,
  update,
}: {
  data: FormData;
  update: (d: Partial<FormData>) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Project Location & Schedule</h2>
        <p className="text-sm text-gray-500">
          Where do you need the bin and when? We service the Greater Toronto & Hamilton Area.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <InputField label="Street Address" value={data.address} onChange={(v) => update({ address: v })} placeholder="123 Main Street" required />
        </div>
        <InputField label="City" value={data.city} onChange={(v) => update({ city: v })} placeholder="Hamilton" required />
        <InputField label="Postal Code" value={data.postalCode} onChange={(v) => update({ postalCode: v })} placeholder="L8H 1A1" required />
        <InputField label="Delivery Date" value={data.deliveryDate} onChange={(v) => update({ deliveryDate: v })} type="date" required />
        <InputField label="Pickup Date" value={data.pickupDate} onChange={(v) => update({ pickupDate: v })} type="date" />
      </div>

      {/* Project Type Selector */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Project Type <span className="text-[#FF453A]">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ORIGIN_TYPES.map((origin) => (
            <button
              key={origin.id}
              onClick={() => update({ projectType: origin.id, originId: origin.id })}
              className={`
                p-3 rounded-xl border text-left text-sm transition-all duration-200
                ${data.projectType === origin.id
                  ? origin.riskOverride
                    ? "border-[#FFD60A]/50 bg-[#FFD60A]/10 text-[#FFD60A]"
                    : "border-[#30D158]/50 bg-[#30D158]/10 text-[#30D158]"
                  : "border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/[0.06]"
                }
              `}
            >
              <span className="font-medium">{origin.label}</span>
              {origin.riskOverride && data.projectType === origin.id && (
                <div className="mt-1 text-[10px] opacity-75">⚠ Precautionary flag</div>
              )}
            </button>
          ))}
        </div>
        {data.projectType && ORIGIN_TYPES.find((o) => o.id === data.projectType)?.riskOverride && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FFD60A]/8 border border-[#FFD60A]/20">
            <span className="text-[#FFD60A] text-lg mt-0.5">⚠</span>
            <div className="text-xs text-[#FFD60A]/90 leading-relaxed">
              <strong>Precautionary Principle Active:</strong> Origin type &ldquo;{ORIGIN_TYPES.find((o) => o.id === data.projectType)?.label}&rdquo;
              triggers elevated compliance screening. Weathered CCA-treated wood is visually identical to clean pine —
              <strong> Origin overrides Visual AI classification.</strong> Hub XRF/NIR sensors will deliver final verdict.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Bin Selection ────────────────────────────────────────────

function StepBin({
  data,
  update,
}: {
  data: FormData;
  update: (d: Partial<FormData>) => void;
}) {
  const selectedBin = BIN_OPTIONS.find((b) => b.id === data.binId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Select Bin Size</h2>
        <p className="text-sm text-gray-500">
          Choose the right container for your project. All bins are wood-only — our specialization is your savings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BIN_OPTIONS.map((bin) => {
          const estWeight = calculateWeight(bin.yards);
          const isSelected = data.binId === bin.id;
          const isOverweight = estWeight > bin.maxWeight;
          return (
            <button
              key={bin.id}
              onClick={() => update({ binId: bin.id })}
              className={`
                relative p-5 rounded-2xl border text-left transition-all duration-300 group
                ${isSelected
                  ? "border-[#64D2FF]/50 bg-[#64D2FF]/8 shadow-lg shadow-[#64D2FF]/10"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
                }
              `}
            >
              {/* Popular badge */}
              {bin.id === "14yd" && (
                <div className="absolute -top-2 right-3 px-2 py-0.5 rounded-md bg-[#30D158] text-black text-[9px] font-bold tracking-wider">
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-lg font-bold text-white">{bin.label}</div>
                  <div className="text-xs text-gray-500">{bin.dims}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#64D2FF]">${bin.baseLogistics}</div>
                  <div className="text-[10px] text-gray-500">base logistics</div>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-3">{bin.description}</p>

              {/* Volumetric estimate */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="text-[10px] text-gray-500">
                  Est. weight: <span className="text-gray-300 font-mono">{Math.round(estWeight).toLocaleString()} kg</span>
                </div>
                {isOverweight && (
                  <span className="text-[9px] text-[#FF453A] font-bold animate-pulse">
                    ⚠ OVERWEIGHT RISK
                  </span>
                )}
              </div>

              {/* Selection ring */}
              <div
                className={`absolute inset-0 rounded-2xl border-2 transition-opacity duration-300 pointer-events-none
                  ${isSelected ? "border-[#64D2FF] opacity-100" : "border-transparent opacity-0"}`}
              />
            </button>
          );
        })}
      </div>

      {/* Quantity selector */}
      {selectedBin && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <span className="text-sm text-gray-400">Quantity:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => update({ quantity: Math.max(1, data.quantity - 1) })}
              className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              −
            </button>
            <span className="w-10 text-center text-lg font-bold text-white font-mono">
              {data.quantity}
            </span>
            <button
              onClick={() => update({ quantity: Math.min(10, data.quantity + 1) })}
              className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              +
            </button>
          </div>
          <span className="text-xs text-gray-500 ml-auto">
            Volumetric formula: V × {VOID_RATIO} × {DENSITY_KG_M3} kg/m³
          </span>
        </div>
      )}

      {/* Mothership upsell */}
      <div className="p-4 rounded-xl border border-[#64D2FF]/20 bg-[#64D2FF]/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🚛</span>
          <span className="text-sm font-bold text-[#64D2FF]">Need more? Meet The Mothership</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Our 144-yard Walking Floor trailer holds ~108 m³ / ~18.8 tonnes. Bypasses transfer stations
          (which landfill 66% of recyclables) and delivers densified 2-4mm chips directly to regional BioHubs.
          <span className="text-[#64D2FF] ml-1 cursor-pointer hover:underline">Contact us →</span>
        </p>
      </div>
    </div>
  );
}

// ─── Step 4: Material Classification ──────────────────────────────────

function StepMaterial({
  data,
  update,
}: {
  data: FormData;
  update: (d: Partial<FormData>) => void;
}) {
  const selectedMaterial = MATERIAL_TYPES.find((m) => m.id === data.materialId);
  const originHasRisk = ORIGIN_TYPES.find((o) => o.id === data.originId)?.riskOverride;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Material Classification</h2>
        <p className="text-sm text-gray-500">
          This is the <span className="text-[#64D2FF] font-medium">Compliance Gate</span> — Layer 1 of the Digital Refinery.
          Honest classification = lower costs, higher diversion, and potential Carbon Dividend.
        </p>
      </div>

      {/* Material selector */}
      <div className="space-y-3">
        {MATERIAL_TYPES.map((mat) => {
          const isSelected = data.materialId === mat.id;
          return (
            <button
              key={mat.id}
              onClick={() => update({ materialId: mat.id })}
              className={`
                w-full p-4 rounded-xl border text-left transition-all duration-200
                ${isSelected
                  ? `border-white/20 bg-white/8`
                  : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                }
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                      ${isSelected ? "bg-white/15" : "bg-white/5"}`}
                  >
                    {mat.riskLevel === "low" ? "🪵" : mat.riskLevel === "medium" ? "🔨" : mat.riskLevel === "high" ? "🎨" : "🏚️"}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{mat.label}</div>
                    <div className="text-xs text-gray-500">{mat.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RiskBadge level={mat.riskLevel} />
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#30D158] flex items-center justify-center">
                      <span className="text-black text-xs">✓</span>
                    </div>
                  )}
                </div>
              </div>

              {isSelected && (
                <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">CIRCIL Levy</div>
                    <div className={`text-sm font-bold font-mono ${mat.circulLevy > 30 ? "text-[#FF453A]" : mat.circulLevy > 10 ? "text-[#FFD60A]" : "text-[#30D158]"}`}>
                      ${mat.circulLevy}/t
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Benchmark</div>
                    <div className="text-sm font-bold font-mono text-white">${mat.benchmark}/t</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Diversion Rate</div>
                    <div className={`text-sm font-bold font-mono ${mat.diversionRate > 70 ? "text-[#30D158]" : mat.diversionRate > 40 ? "text-[#FFD60A]" : "text-[#FF453A]"}`}>
                      {mat.diversionRate}%
                    </div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Precautionary override warning */}
      {originHasRisk && selectedMaterial && selectedMaterial.riskLevel === "low" && (
        <div className="p-4 rounded-xl border border-[#FF453A]/30 bg-[#FF453A]/8">
          <div className="flex items-start gap-3">
            <span className="text-xl">🔴</span>
            <div className="text-xs text-[#FF453A]/90 leading-relaxed">
              <strong>Precautionary Principle Override:</strong> You selected &ldquo;Clean Wood Only&rdquo; but your project origin
              (&ldquo;{ORIGIN_TYPES.find((o) => o.id === data.originId)?.label}&rdquo;) is flagged for elevated risk.
              <strong> Origin overrides Visual.</strong> Our hub XRF/NIR sensors will perform atomic-level verification.
              If CCA treatment is detected (Arsenic &gt; 2.5 mg/L), the load will be reclassified as Subject Waste per O.Reg 347.
              <div className="mt-2 text-[#FF453A] font-bold">This may affect your final invoice.</div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Fallacy education */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">👁️</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">The Visual Fallacy</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Weathered CCA-treated wood (containing arsenic, chromium, copper) is visually identical to clean gray pine.
          An RGB camera — or the human eye — cannot distinguish them. That&apos;s why 905WOOD uses a three-tier override system:
          Audio overrides Visual, Origin overrides Visual, Hub overrides Edge. Your honest classification here
          starts the Chain of Custody that protects you legally and financially.
        </p>
      </div>
    </div>
  );
}

// ─── Step 5: Quote / Decoupled Billing ────────────────────────────────

function StepQuote({
  data,
}: {
  data: FormData;
}) {
  const bin = BIN_OPTIONS.find((b) => b.id === data.binId);
  const material = MATERIAL_TYPES.find((m) => m.id === data.materialId);

  if (!bin || !material) {
    return (
      <div className="text-center py-12 text-gray-500">
        Please complete previous steps to generate your quote.
      </div>
    );
  }

  const estWeight = calculateWeight(bin.yards) * data.quantity;
  const tonnes = kgToTonnes(estWeight);
  const baseLogistics = bin.baseLogistics * data.quantity;
  const netWeightCost = tonnes * material.benchmark;
  const circulLevyCost = tonnes * material.circulLevy;
  const totalCost = baseLogistics + netWeightCost + circulLevyCost;

  // Carbon Dividend (only for clean/mixed wood)
  const eligibleForCarbon = material.riskLevel === "low" || material.riskLevel === "medium";
  const corcYield = eligibleForCarbon ? tonnes * CORC_YIELD_PER_TONNE : 0;
  const corcValue = corcYield * CORC_PRICE;

  // Missed savings (vs. clean benchmark)
  const cleanMaterial = MATERIAL_TYPES[0];
  const missedSavings =
    material.id !== "clean_wood"
      ? (material.benchmark - cleanMaterial.benchmark) * tonnes + (material.circulLevy - cleanMaterial.circulLevy) * tonnes
      : 0;

  // Diversion
  const diverted = tonnes * (material.diversionRate / 100);
  const landfilled = tonnes - diverted;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Your Decoupled Quote</h2>
        <p className="text-sm text-gray-500">
          No black-box invoicing. Every dollar is transparent, traceable, and audit-ready.
        </p>
      </div>

      {/* Main invoice */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Quote Estimate</div>
            <div className="text-sm text-gray-400">
              {data.quantity}× {bin.label} • {material.label}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white font-mono">
              ${totalCost.toFixed(2)}
            </div>
            <div className="text-[10px] text-gray-500">+ applicable taxes</div>
          </div>
        </div>

        {/* Line items — Decoupled Billing */}
        <div className="divide-y divide-white/5">
          {/* Base Logistics */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#64D2FF]/10 flex items-center justify-center">
                <span className="text-[#64D2FF] text-sm">🚛</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Base Logistics</div>
                <div className="text-xs text-gray-500">Delivery + pickup + container rental</div>
              </div>
            </div>
            <div className="text-sm font-mono text-white">${baseLogistics.toFixed(2)}</div>
          </div>

          {/* Net Weight */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#30D158]/10 flex items-center justify-center">
                <span className="text-[#30D158] text-sm">⚖️</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Net Weight</div>
                <div className="text-xs text-gray-500">
                  {tonnes.toFixed(2)}t × ${material.benchmark}/t ({material.label} benchmark)
                </div>
              </div>
            </div>
            <div className="text-sm font-mono text-white">${netWeightCost.toFixed(2)}</div>
          </div>

          {/* CIRCIL Levy */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center
                  ${material.circulLevy > 30 ? "bg-[#FF453A]/10" : material.circulLevy > 10 ? "bg-[#FFD60A]/10" : "bg-[#30D158]/10"}`}
              >
                <span className={`text-sm ${material.circulLevy > 30 ? "text-[#FF453A]" : material.circulLevy > 10 ? "text-[#FFD60A]" : "text-[#30D158]"}`}>
                  📊
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">CIRCIL Levy</div>
                <div className="text-xs text-gray-500">
                  {tonnes.toFixed(2)}t × ${material.circulLevy}/t (escalating to $60/t by 2036)
                </div>
              </div>
            </div>
            <div className={`text-sm font-mono ${material.circulLevy > 30 ? "text-[#FF453A]" : material.circulLevy > 10 ? "text-[#FFD60A]" : "text-[#30D158]"}`}>
              ${circulLevyCost.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Missed Savings Alert */}
      {missedSavings > 0 && (
        <div className="p-4 rounded-xl border border-[#FF453A]/30 bg-[#FF453A]/8 flex items-start gap-3">
          <span className="text-2xl">💸</span>
          <div>
            <div className="text-sm font-bold text-[#FF453A]">Missed Savings Alert</div>
            <div className="text-xs text-[#FF453A]/80 mt-1">
              Failure to sort clean wood from mixed material — you&apos;re burning{" "}
              <span className="font-bold font-mono">${missedSavings.toFixed(2)}</span> on this load.
              Switching to &ldquo;Clean Wood Only&rdquo; drops your benchmark from ${material.benchmark}/t to ${cleanMaterial.benchmark}/t
              and your CIRCIL Levy from ${material.circulLevy}/t to ${cleanMaterial.circulLevy}/t.
            </div>
          </div>
        </div>
      )}

      {/* Zero-Levy Report Card */}
      {material.id === "clean_wood" && (
        <div className="p-4 rounded-xl border border-[#30D158]/30 bg-[#30D158]/8 flex items-start gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <div className="text-sm font-bold text-[#30D158]">Zero-Levy Report Card</div>
            <div className="text-xs text-[#30D158]/80 mt-1">
              Clean wood sorting drives your CIRCIL Levy to the minimum ($5/t). You&apos;re achieving a{" "}
              <span className="font-bold">{material.diversionRate}% diversion rate</span> —
              vs. the industry average of 15–25%. This load qualifies for Digital Diversion Certification.
            </div>
          </div>
        </div>
      )}

      {/* Carbon Dividend Display */}
      {eligibleForCarbon && (
        <div className="p-5 rounded-2xl border border-[#34C759]/20 bg-gradient-to-br from-[#34C759]/5 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🌱</span>
            <span className="text-sm font-bold text-[#34C759]">Carbon Dividend Preview</span>
            <span className="text-[9px] bg-[#34C759]/20 text-[#34C759] px-2 py-0.5 rounded-full font-bold">CORC ELIGIBLE</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">CORC Yield</div>
              <div className="text-lg font-bold font-mono text-[#34C759]">
                {corcYield.toFixed(2)}
                <span className="text-xs text-gray-500 ml-1">t CO₂e</span>
              </div>
              <div className="text-[10px] text-gray-500">@ 0.75t/dry tonne</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Estimated Value</div>
              <div className="text-lg font-bold font-mono text-white">
                ${corcValue.toFixed(0)}
              </div>
              <div className="text-[10px] text-gray-500">@ $350/CORC</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Net Effective Cost</div>
              <div className="text-lg font-bold font-mono text-[#64D2FF]">
                ${(totalCost - corcValue).toFixed(2)}
              </div>
              <div className="text-[10px] text-gray-500">quote − carbon dividend</div>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
            CO₂ Removal Certificates (CORCs) are generated when clean wood feedstock is converted to pyrogenic biocarbon
            at regional BioHubs. Values are theoretical estimates based on current market pricing. Actual yields depend on
            hub XRF/NIR verification and moisture content at processing.
          </p>
        </div>
      )}

      {/* Diversion metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Diversion Estimate</div>
          <div className="flex items-end gap-2">
            <span className={`text-2xl font-bold font-mono ${material.diversionRate > 70 ? "text-[#30D158]" : material.diversionRate > 40 ? "text-[#FFD60A]" : "text-[#FF453A]"}`}>
              {material.diversionRate}%
            </span>
            <span className="text-xs text-gray-500 mb-1">from landfill</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                material.diversionRate > 70 ? "bg-[#30D158]" : material.diversionRate > 40 ? "bg-[#FFD60A]" : "bg-[#FF453A]"
              }`}
              style={{ width: `${material.diversionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-gray-500">
            <span>♻️ {diverted.toFixed(1)}t diverted</span>
            <span>🗑️ {landfilled.toFixed(1)}t to landfill</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Industry Comparison</div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-gray-400">Industry Average</span>
                <span className="text-gray-400 font-mono">20%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5">
                <div className="h-full rounded-full bg-[#FF453A]/50" style={{ width: "20%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-[#30D158]">905WOOD ({material.label})</span>
                <span className="text-[#30D158] font-mono">{material.diversionRate}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-[#30D158]"
                  style={{ width: `${material.diversionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity Cliff context */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">📉</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">The Capacity Cliff</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Ontario&apos;s landfill capacity hits terminal exhaustion by 2034. The REWOOD landfill ban (2029) will make landfilling clean
          wood criminal. Getting ahead of the curve with proper classification and diversion isn&apos;t just good practice —
          it&apos;s future-proofing your cost structure against an escalating CIRCIL Levy ($10→$60/t by 2036).
        </p>
      </div>
    </div>
  );
}

// ─── Main RFQ Page ────────────────────────────────────────────────────

export default function RFQPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    postalCode: "",
    projectType: "",
    deliveryDate: "",
    pickupDate: "",
    binId: "",
    quantity: 1,
    materialId: "",
    originId: "",
    hasTreeKeywords: false,
  });

  const update = useCallback(
    (partial: Partial<FormData>) => {
      setFormData((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const canAdvance = useCallback((): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.email && formData.phone);
      case 2:
        return !!(formData.address && formData.city && formData.postalCode && formData.projectType && formData.deliveryDate);
      case 3:
        return !!formData.binId;
      case 4:
        return !!formData.materialId;
      case 5:
        return true;
      default:
        return false;
    }
  }, [step, formData]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    // In production: POST to /v1/rfq endpoint
    console.log("RFQ Submitted:", formData);
  }, [formData]);

  // Auto-scroll on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#30D158]/15 flex items-center justify-center mx-auto">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold">Quote Submitted</h1>
          <p className="text-gray-400 leading-relaxed">
            Your request has been received. We&apos;ll send a detailed Decoupled Invoice to{" "}
            <span className="text-[#64D2FF]">{formData.email}</span> within 15 minutes
            during business hours.
          </p>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Reference</span>
              <span className="font-mono text-[#64D2FF]">RFQ-{Date.now().toString(36).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Bin</span>
              <span className="text-white">{BIN_OPTIONS.find((b) => b.id === formData.binId)?.label} × {formData.quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Material</span>
              <span className="text-white">{MATERIAL_TYPES.find((m) => m.id === formData.materialId)?.label}</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => { setSubmitted(false); setStep(1); setFormData({ name: "", email: "", phone: "", company: "", address: "", city: "", postalCode: "", projectType: "", deliveryDate: "", pickupDate: "", binId: "", quantity: 1, materialId: "", originId: "", hasTreeKeywords: false }); }}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:bg-white/10 transition-colors"
            >
              New Quote
            </button>
            <a
              href="tel:+18338639663"
              className="px-5 py-2.5 rounded-xl bg-[#30D158] text-black text-sm font-bold hover:bg-[#28b84d] transition-colors"
            >
              Call Us: (833) 863-9663
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-[#0A0A0A]/90 backdrop-blur-xl sticky top-0">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#30D158]/15 flex items-center justify-center">
              <span className="text-[#30D158] font-bold text-sm">905</span>
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">905WOOD</div>
              <div className="text-[10px] text-gray-500">Digital Refinery • RFQ</div>
            </div>
          </div>
          <a
            href="tel:+18338639663"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 transition-colors"
          >
            📞 <span className="hidden sm:inline">(833) 863-9663</span>
          </a>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        {/* Step indicator */}
        <StepIndicator steps={STEPS} current={step} onNav={setStep} />

        {/* Step content */}
        <div className="min-h-[400px]">
          {step === 1 && <StepContact data={formData} update={update} />}
          {step === 2 && <StepProject data={formData} update={update} />}
          {step === 3 && <StepBin data={formData} update={update} />}
          {step === 4 && <StepMaterial data={formData} update={update} />}
          {step === 5 && <StepQuote data={formData} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className={`px-5 py-2.5 rounded-xl text-sm transition-all duration-200
              ${step === 1
                ? "opacity-0 pointer-events-none"
                : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
              }
            `}
          >
            ← Back
          </button>

          <div className="text-xs text-gray-600">
            Step {step} of {STEPS.length}
          </div>

          {step < 5 ? (
            <button
              onClick={() => canAdvance() && setStep((s) => s + 1)}
              disabled={!canAdvance()}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                ${canAdvance()
                  ? "bg-[#30D158] text-black hover:bg-[#28b84d] shadow-lg shadow-[#30D158]/20"
                  : "bg-white/5 text-gray-600 cursor-not-allowed"
                }
              `}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#30D158] text-black hover:bg-[#28b84d] shadow-lg shadow-[#30D158]/20 transition-all duration-200"
            >
              Submit Quote Request
            </button>
          )}
        </div>

        {/* Footer trust bar */}
        <div className="mt-16 text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-6 text-[10px] text-gray-600 uppercase tracking-widest">
            <span>Wood-Only Since 2010</span>
            <span>•</span>
            <span>60%+ Diversion</span>
            <span>•</span>
            <span>GTA & Hamilton</span>
          </div>
          <p className="text-[10px] text-gray-700">
            905WOOD Digital Refinery — The Sentient Bridge between construction waste and the circular bioeconomy.
          </p>
        </div>
      </div>
    </div>
  );
}
