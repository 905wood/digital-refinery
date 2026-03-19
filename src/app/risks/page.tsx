"use client";

import { useState } from "react";
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

const BIN_SIZES = [14, 20, 40] as const;
const MATERIAL_TYPES = [
  "Clean Wood Only",
  "Mixed Wood",
  "Painted/Stained",
  "Demolition Mixed",
] as const;

type MaterialType = (typeof MATERIAL_TYPES)[number];

function calcWeight(binYd3: number): number {
  return binYd3 * 0.7645 * 174;
}

function kgToTonnes(kg: number): number {
  return kg / 1000;
}

function fmt(n: number): string {
  return n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Card({
  children,
  borderColor,
  className = "",
}: {
  children: React.ReactNode;
  borderColor?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl p-5 ${className}`}
      style={{
        background: C.surface2,
        border: `1px solid ${borderColor || C.border}`,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xl font-bold tracking-tight mb-4 uppercase"
      style={{ color: C.text, letterSpacing: "0.05em" }}
    >
      {children}
    </h2>
  );
}

export default function RisksPage() {
  const [binSize, setBinSize] = useState<number>(14);
  const [material, setMaterial] = useState<MaterialType>("Clean Wood Only");
  const [loadsPerMonth, setLoadsPerMonth] = useState<number>(10);

  const weightKg = calcWeight(binSize);
  const weightTonnes = kgToTonnes(weightKg);

  const mixedCostPerTon = 189.96;
  const cleanCostPerTon = 142.4;
  const circlMixed = 60;
  const circlClean = 5;
  const corcRate = 0.75;
  const corcPrice = 350;

  const monthlyMixedCost = loadsPerMonth * weightTonnes * mixedCostPerTon;
  const monthlyCleanCost = loadsPerMonth * weightTonnes * cleanCostPerTon;
  const monthlySavings = monthlyMixedCost - monthlyCleanCost;

  const monthlyCirclMixed = loadsPerMonth * weightTonnes * circlMixed;
  const monthlyCirclClean = loadsPerMonth * weightTonnes * circlClean;
  const levySavings = monthlyCirclMixed - monthlyCirclClean;

  const carbonDividend = loadsPerMonth * weightTonnes * corcRate * corcPrice;

  const annualSavings = (monthlySavings + levySavings) * 12;

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: C.bg, color: C.text }}
    >
      <div className="max-w-[412px] mx-auto px-4 py-6 pb-28">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 min-h-[48px] min-w-[48px] justify-center"
              style={{ color: C.textMuted }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm">Back</span>
            </Link>
            <span
              className="text-sm font-bold tracking-widest uppercase"
              style={{ color: C.verified }}
            >
              905WOOD
            </span>
          </div>
          <h1
            className="text-2xl font-black tracking-tight leading-tight"
            style={{ color: C.text }}
          >
            Risks, Rewards
            <br />& Incentives
          </h1>
          <p
            className="text-sm mt-1 uppercase tracking-widest"
            style={{ color: C.textDim }}
          >
            Digital Refinery Economic Model
          </p>
        </header>

        {/* Section 1: Interactive Savings Calculator */}
        <section className="mb-8">
          <SectionTitle>Savings Calculator</SectionTitle>
          <Card borderColor={C.border}>
            {/* Bin Size */}
            <div className="mb-5">
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: C.textMuted }}
              >
                Bin Size (yards)
              </label>
              <div className="flex gap-2">
                {BIN_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setBinSize(size)}
                    className="flex-1 rounded-lg py-3 text-sm font-bold transition-all min-h-[48px]"
                    style={{
                      background:
                        binSize === size ? C.verified : C.surface,
                      color: binSize === size ? C.bg : C.textMuted,
                      border: `1px solid ${binSize === size ? C.verified : C.border}`,
                    }}
                  >
                    {size} yd
                  </button>
                ))}
              </div>
            </div>

            {/* Material Type */}
            <div className="mb-5">
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: C.textMuted }}
              >
                Material Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MATERIAL_TYPES.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMaterial(m)}
                    className="rounded-lg py-3 px-2 text-xs font-semibold transition-all min-h-[48px]"
                    style={{
                      background:
                        material === m ? C.tech : C.surface,
                      color: material === m ? C.bg : C.textMuted,
                      border: `1px solid ${material === m ? C.tech : C.border}`,
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Loads Per Month */}
            <div className="mb-6">
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: C.textMuted }}
              >
                Loads / Month:{" "}
                <span style={{ color: C.text }}>{loadsPerMonth}</span>
              </label>
              <input
                type="range"
                min={1}
                max={50}
                value={loadsPerMonth}
                onChange={(e) => setLoadsPerMonth(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer min-h-[48px]"
                style={{
                  background: `linear-gradient(to right, ${C.tech} ${((loadsPerMonth - 1) / 49) * 100}%, ${C.border} ${((loadsPerMonth - 1) / 49) * 100}%)`,
                }}
              />
              <div
                className="flex justify-between text-xs mt-1"
                style={{ color: C.textDim }}
              >
                <span>1</span>
                <span>50</span>
              </div>
            </div>

            {/* Weight Info */}
            <div
              className="rounded-lg p-3 mb-5"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <div
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: C.textDim }}
              >
                Weight per load
              </div>
              <div className="text-sm font-mono" style={{ color: C.text }}>
                {binSize} yd³ x 0.7645 x 174 ={" "}
                <span style={{ color: C.tech }}>{fmt(weightKg)} kg</span> (
                {fmt(weightTonnes)} t)
              </div>
            </div>

            {/* Results */}
            <div className="space-y-3">
              <div
                className="flex justify-between items-center rounded-lg p-3"
                style={{ background: `${C.risk}12`, border: `1px solid ${C.risk}40` }}
              >
                <span className="text-xs" style={{ color: C.risk }}>
                  Mixed Cost/mo
                </span>
                <span className="font-bold font-mono" style={{ color: C.risk }}>
                  ${fmt(monthlyMixedCost)}
                </span>
              </div>

              <div
                className="flex justify-between items-center rounded-lg p-3"
                style={{
                  background: `${C.verified}12`,
                  border: `1px solid ${C.verified}40`,
                }}
              >
                <span className="text-xs" style={{ color: C.verified }}>
                  Clean Cost/mo
                </span>
                <span
                  className="font-bold font-mono"
                  style={{ color: C.verified }}
                >
                  ${fmt(monthlyCleanCost)}
                </span>
              </div>

              <div
                className="flex justify-between items-center rounded-lg p-4"
                style={{
                  background: `${C.verified}18`,
                  border: `1px solid ${C.verified}60`,
                }}
              >
                <span className="text-sm font-semibold" style={{ color: C.verified }}>
                  Monthly Savings
                </span>
                <span
                  className="text-xl font-black font-mono flex items-center gap-1"
                  style={{ color: C.verified }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill={C.verified}>
                    <path d="M8 3l5 7H3l5-7z" />
                  </svg>
                  ${fmt(monthlySavings)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: `${C.risk}12`,
                    border: `1px solid ${C.risk}30`,
                  }}
                >
                  <div className="text-[10px] uppercase" style={{ color: C.risk }}>
                    CIRCIL (Mixed)
                  </div>
                  <div className="text-sm font-bold font-mono" style={{ color: C.risk }}>
                    ${fmt(monthlyCirclMixed)}
                  </div>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: `${C.verified}12`,
                    border: `1px solid ${C.verified}30`,
                  }}
                >
                  <div
                    className="text-[10px] uppercase"
                    style={{ color: C.verified }}
                  >
                    CIRCIL (Clean)
                  </div>
                  <div
                    className="text-sm font-bold font-mono"
                    style={{ color: C.verified }}
                  >
                    ${fmt(monthlyCirclClean)}
                  </div>
                </div>
              </div>

              <div
                className="flex justify-between items-center rounded-lg p-3"
                style={{
                  background: `${C.verified}12`,
                  border: `1px solid ${C.verified}40`,
                }}
              >
                <span className="text-xs font-semibold" style={{ color: C.verified }}>
                  Levy Savings/mo
                </span>
                <span
                  className="font-bold font-mono"
                  style={{ color: C.verified }}
                >
                  ${fmt(levySavings)}
                </span>
              </div>

              <div
                className="flex justify-between items-center rounded-lg p-3"
                style={{
                  background: `${C.tech}12`,
                  border: `1px solid ${C.tech}40`,
                }}
              >
                <span className="text-xs" style={{ color: C.tech }}>
                  Carbon Dividend/mo
                </span>
                <span className="font-bold font-mono" style={{ color: C.tech }}>
                  ${fmt(carbonDividend)}
                </span>
              </div>

              {/* Annual Projection */}
              <div
                className="rounded-xl p-5 text-center mt-2"
                style={{
                  background: `linear-gradient(135deg, ${C.verified}20, ${C.carbon}15)`,
                  border: `2px solid ${C.verified}80`,
                }}
              >
                <div
                  className="text-xs uppercase tracking-widest mb-1"
                  style={{ color: C.textMuted }}
                >
                  Annual Projection
                </div>
                <div
                  className="text-3xl font-black font-mono"
                  style={{ color: C.verified }}
                >
                  ${fmt(annualSavings)}
                </div>
                <div className="text-xs mt-1" style={{ color: C.textDim }}>
                  Total annual savings (disposal + levy)
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 2: Immediate Financial Incentives */}
        <section className="mb-8">
          <SectionTitle>Immediate Financial Incentives</SectionTitle>
          <div className="space-y-3">
            {[
              {
                title: "CIRCIL Levy Avoidance",
                value: "$5 - $60/tonne",
                desc: "Clean sorting eliminates levy to $0.00",
                border: C.verified,
              },
              {
                title: "Mixed-to-Clean Spread",
                value: "$47.56/ton savings",
                desc: "$189.96 mixed \u2192 $142.40 clean",
                border: C.verified,
              },
              {
                title: "Tariff Bypass",
                value: "10-35% cost avoidance",
                desc: "USMCA Shield proves origin at border",
                border: C.tech,
              },
              {
                title: "Transshipment Avoidance",
                value: "40% surcharge eliminated",
                desc: "9-Point Certificate of Origin",
                border: C.tech,
              },
            ].map((item) => (
              <Card key={item.title} borderColor={item.border}>
                <div className="flex justify-between items-start">
                  <div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: C.text }}
                    >
                      {item.title}
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: C.textDim }}
                    >
                      {item.desc}
                    </div>
                  </div>
                  <div
                    className="text-sm font-bold font-mono text-right whitespace-nowrap ml-3"
                    style={{ color: item.border }}
                  >
                    {item.value}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 3: Revenue-Generating Rewards */}
        <section className="mb-8">
          <SectionTitle>Revenue-Generating Rewards</SectionTitle>
          <div className="space-y-3">
            {[
              {
                title: "Carbon Dividends (CORCs)",
                value: "~$350/ton",
                desc: "0.75t CO\u2082e per ton refined dry feedstock",
                color: C.carbon,
              },
              {
                title: "ESG Data Products",
                value: "Recurring SaaS",
                desc: "ForestEdge API \u2192 Scope 3 compliance",
                color: C.tech,
              },
              {
                title: "Municipal Diversion Reporting",
                value: "Recurring SaaS",
                desc: "Digital Diversion Certificates",
                color: C.verified,
              },
              {
                title: "Digital Product Passports",
                value: "Premium pricing",
                desc: "Saw Blade to Soil verified provenance",
                color: C.verified,
              },
              {
                title: "Waste-as-a-Service (WaaS)",
                value: "Platform revenue",
                desc: "Transform waste into data revenue",
                color: C.carbon,
              },
            ].map((item) => (
              <Card key={item.title} borderColor={item.color}>
                <div className="flex justify-between items-start">
                  <div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: C.text }}
                    >
                      {item.title}
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: C.textDim }}
                    >
                      {item.desc}
                    </div>
                  </div>
                  <div
                    className="text-sm font-bold font-mono text-right whitespace-nowrap ml-3"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 4: The Capacity Cliff Timeline */}
        <section className="mb-8">
          <SectionTitle>The Capacity Cliff Timeline</SectionTitle>
          <div className="relative pl-8">
            {/* Vertical line */}
            <div
              className="absolute left-3 top-2 bottom-2 w-0.5"
              style={{
                background: `linear-gradient(to bottom, ${C.warning}, ${C.risk}, ${C.risk}, #8B0000)`,
              }}
            />

            {[
              {
                date: "Jan 2026",
                title: "Municipal ICI Exit",
                desc: 'Orphan Crisis: 4M tonnes feedstock available',
                color: C.warning,
                pulse: false,
              },
              {
                date: "Jul 2026",
                title: "USMCA Joint Review",
                desc: "Section 122 tariffs + 40% transshipment penalty",
                color: C.risk,
                pulse: false,
              },
              {
                date: "2029",
                title: "REWOOD Landfill Ban",
                desc: "Landfilling clean wood becomes criminal",
                color: C.risk,
                pulse: true,
              },
              {
                date: "2034",
                title: "Capacity Exhaustion",
                desc: "Terminal limit of Ontario landfill volume",
                color: "#8B0000",
                pulse: false,
              },
            ].map((item, i) => (
              <div key={item.date} className="relative mb-6 last:mb-0">
                {/* Marker dot */}
                <div
                  className={`absolute -left-5 top-1 w-4 h-4 rounded-full border-2 ${item.pulse ? "animate-pulse" : ""}`}
                  style={{
                    background: item.color,
                    borderColor: item.color,
                    boxShadow: `0 0 8px ${item.color}80`,
                  }}
                />
                <div
                  className="text-xs font-mono font-bold uppercase mb-0.5"
                  style={{ color: item.color }}
                >
                  {item.date}
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: C.text }}
                >
                  {item.title}
                </div>
                <div className="text-xs" style={{ color: C.textDim }}>
                  {item.desc}
                </div>
                {i < 3 && (
                  <div
                    className="text-[10px] uppercase tracking-widest mt-2 font-semibold"
                    style={{ color: C.textMuted }}
                  >
                    905WOOD becomes essential infrastructure
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Market Positioning Rewards */}
        <section className="mb-8">
          <SectionTitle>Market Positioning Rewards</SectionTitle>
          <div className="space-y-3">
            {[
              {
                title: "Orphan Feedstock Capture",
                date: "Jan 2026",
                desc: "Municipal ICI exit \u2192 4M tonnes available",
                color: C.carbon,
              },
              {
                title: "Sole Clean Wood Gate",
                date: "2029",
                desc: "REWOOD ban \u2192 only compliant operators survive",
                color: C.verified,
              },
              {
                title: "Regional Infrastructure Necessity",
                date: "2034",
                desc: "Capacity exhaustion \u2192 essential service",
                color: C.tech,
              },
            ].map((item) => (
              <Card key={item.title} borderColor={item.color}>
                <div className="flex justify-between items-start">
                  <div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: C.text }}
                    >
                      {item.title}
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: C.textDim }}
                    >
                      {item.desc}
                    </div>
                  </div>
                  <div
                    className="text-xs font-mono font-bold text-right whitespace-nowrap ml-3"
                    style={{ color: item.color }}
                  >
                    {item.date}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 6: Escalator Tax Model */}
        <section className="mb-8">
          <SectionTitle>Escalator Tax Model</SectionTitle>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Mixed Waste */}
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: `${C.risk}15`,
                border: `1px solid ${C.risk}50`,
              }}
            >
              <div
                className="text-[10px] uppercase tracking-widest font-bold mb-2"
                style={{ color: C.risk }}
              >
                Mixed Waste
              </div>
              <div className="space-y-1">
                <div className="text-xs" style={{ color: C.textMuted }}>
                  Disposal
                </div>
                <div
                  className="text-sm font-bold font-mono"
                  style={{ color: C.risk }}
                >
                  $189.96/ton
                </div>
                <div className="text-xs" style={{ color: C.textMuted }}>
                  + CIRCIL
                </div>
                <div
                  className="text-sm font-bold font-mono"
                  style={{ color: C.risk }}
                >
                  $60.00/ton
                </div>
                <div
                  className="w-full h-px my-2"
                  style={{ background: C.risk }}
                />
                <div
                  className="text-lg font-black font-mono"
                  style={{ color: C.risk }}
                >
                  $249.96
                </div>
                <div className="text-[10px]" style={{ color: C.textDim }}>
                  per ton
                </div>
              </div>
            </div>

            {/* Clean Wood */}
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: `${C.verified}15`,
                border: `1px solid ${C.verified}50`,
              }}
            >
              <div
                className="text-[10px] uppercase tracking-widest font-bold mb-2"
                style={{ color: C.verified }}
              >
                Clean Wood
              </div>
              <div className="space-y-1">
                <div className="text-xs" style={{ color: C.textMuted }}>
                  Disposal
                </div>
                <div
                  className="text-sm font-bold font-mono"
                  style={{ color: C.verified }}
                >
                  $142.40/ton
                </div>
                <div className="text-xs" style={{ color: C.textMuted }}>
                  + CIRCIL
                </div>
                <div
                  className="text-sm font-bold font-mono"
                  style={{ color: C.verified }}
                >
                  $5.00/ton
                </div>
                <div
                  className="w-full h-px my-2"
                  style={{ background: C.verified }}
                />
                <div
                  className="text-lg font-black font-mono"
                  style={{ color: C.verified }}
                >
                  $147.40
                </div>
                <div className="text-[10px]" style={{ color: C.textDim }}>
                  per ton
                </div>
              </div>
            </div>
          </div>

          {/* Center savings callout */}
          <div
            className="rounded-xl p-5 text-center"
            style={{
              background: `linear-gradient(135deg, ${C.verified}20, ${C.carbon}10)`,
              border: `2px solid ${C.verified}80`,
            }}
          >
            <div
              className="text-xs uppercase tracking-widest mb-1"
              style={{ color: C.textMuted }}
            >
              You Save
            </div>
            <div
              className="text-3xl font-black font-mono"
              style={{ color: C.verified }}
            >
              $102.56/ton
            </div>
          </div>
        </section>

        {/* Bottom Nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 border-t z-50"
          style={{
            background: C.surface,
            borderColor: C.border,
          }}
        >
          <div className="max-w-[412px] mx-auto flex">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Driver", href: "/driver" },
              { label: "RFQ", href: "/rfq" },
              { label: "Certificate", href: "/certificate" },
            ].map((nav) => (
              <Link
                key={nav.href}
                href={nav.href}
                className="flex-1 flex items-center justify-center min-h-[48px] text-xs font-semibold uppercase tracking-wider transition-colors hover:opacity-80"
                style={{ color: C.textMuted }}
              >
                {nav.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
