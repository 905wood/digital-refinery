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

const LAYERS = [
  {
    num: 1,
    name: "Intake",
    subtitle: "Compliance Gate",
    desc: "Edge AI triage in <2s. EfficientNet-B0 INT8 on Tensor G5 via LiteRT. Precautionary Principle overrides. Hold-to-Seal Chain of Custody.",
    color: C.tech,
    href: "/driver",
  },
  {
    num: 2,
    name: "Logistics",
    subtitle: "Hub-and-Spoke",
    desc: "Fleet dispatch, FIFO enforcement, EDI X12 204 backbone. The Mothership (144yd Walking Floor) bypasses transfer stations.",
    color: C.tech,
    href: "/dashboard",
  },
  {
    num: 3,
    name: "Regulatory",
    subtitle: "RAG Engine",
    desc: "AlloyDB AI + ScaNN vector index. Zero-hallucination O.Reg 347 mapping. RPRA HWPR auto-manifest on TCLP exceedance.",
    color: C.warning,
    href: "/verify",
  },
  {
    num: 4,
    name: "Value Realization",
    subtitle: "Decoupled Billing",
    desc: "Transparent 3-line invoices. Missed Savings Alerts. Zero-Levy Report Cards. CIRCIL Levy passthrough ($5-$60/tonne).",
    color: C.carbon,
    href: "/rfq",
  },
  {
    num: 5,
    name: "Reporting",
    subtitle: "Ecosystem",
    desc: "ForestEdge API for Scope 3 ESG. CORC certificates (0.75t CO₂e/dry tonne). Digital Product Passports. USMCA Shield.",
    color: C.verified,
    href: "/certificate",
  },
];

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: C.bg, color: C.text }}
    >
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-6 pt-16 pb-10 text-center">
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl font-black tracking-tight" style={{ color: C.verified }}>
            905
          </span>
          <span className="text-4xl font-black tracking-tight">WOOD</span>
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: C.textMuted }}>
          Digital Refinery
        </h1>
        <p className="text-xs max-w-md leading-relaxed" style={{ color: C.textDim }}>
          The Sentient Bridge between construction waste and the pyrogenic biocarbon market.
          Canada&apos;s tech-enabled, wood-only dumpster rental and recycling service.
        </p>

        {/* CTA */}
        <Link
          href="/driver"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:scale-105"
          style={{
            backgroundColor: C.tech + "20",
            color: C.tech,
            border: `1px solid ${C.tech}`,
          }}
        >
          Launch Driver App
          <span style={{ fontSize: "16px" }}>→</span>
        </Link>
      </div>

      {/* 5-Layer Stack */}
      <div className="px-6 pb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1" style={{ backgroundColor: C.border }} />
          <span className="text-[10px] uppercase tracking-widest" style={{ color: C.textDim }}>
            5-Layer Refinery Stack
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: C.border }} />
        </div>

        <div className="flex flex-col gap-3">
          {LAYERS.map((layer) => (
            <Link
              key={layer.num}
              href={layer.href}
              className="rounded-xl p-4 transition-all hover:scale-[1.01]"
              style={{
                backgroundColor: C.surface2,
                border: `1px solid ${C.border}`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                  style={{
                    backgroundColor: layer.color + "15",
                    color: layer.color,
                    border: `1px solid ${layer.color}30`,
                  }}
                >
                  L{layer.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold" style={{ color: C.text }}>
                      {layer.name}
                    </span>
                    <span className="text-[10px]" style={{ color: C.textDim }}>
                      {layer.subtitle}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
                    {layer.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Edge Hardware Badge */}
      <div className="px-6 pb-6">
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: C.tech }} />
            <span className="text-xs font-bold" style={{ color: C.tech }}>
              Edge Hardware — Pixel 10 Pro
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Chipset", value: "Tensor G5" },
              { label: "Process", value: "TSMC 3nm" },
              { label: "AI Engine", value: "EdgeTPU" },
              { label: "Inference", value: "LiteRT INT8" },
              { label: "Latency", value: "<2.0s" },
              { label: "Security", value: "Titan M2" },
            ].map((spec) => (
              <div key={spec.label} className="rounded-lg py-1.5 px-1" style={{ backgroundColor: C.surface }}>
                <div className="text-[9px] uppercase" style={{ color: C.textDim }}>
                  {spec.label}
                </div>
                <div className="text-[10px] font-bold font-mono" style={{ color: C.text }}>
                  {spec.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="px-6 pb-8">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl p-3 text-center text-xs font-bold uppercase tracking-wider transition-all hover:scale-105"
            style={{
              backgroundColor: C.tech + "15",
              color: C.tech,
              border: `1px solid ${C.tech}30`,
            }}
          >
            Operations Dashboard
          </Link>
          <Link
            href="/rfq"
            className="rounded-xl p-3 text-center text-xs font-bold uppercase tracking-wider transition-all hover:scale-105"
            style={{
              backgroundColor: C.carbon + "15",
              color: C.carbon,
              border: `1px solid ${C.carbon}30`,
            }}
          >
            Request Quote
          </Link>
          <Link
            href="/certificate"
            className="rounded-xl p-3 text-center text-xs font-bold uppercase tracking-wider transition-all hover:scale-105"
            style={{
              backgroundColor: C.verified + "15",
              color: C.verified,
              border: `1px solid ${C.verified}30`,
            }}
          >
            USMCA Shield
          </Link>
          <Link
            href="/verify"
            className="rounded-xl p-3 text-center text-xs font-bold uppercase tracking-wider transition-all hover:scale-105"
            style={{
              backgroundColor: C.warning + "15",
              color: C.warning,
              border: `1px solid ${C.warning}30`,
            }}
          >
            Sensor Verification
          </Link>
          <Link
            href="/risks"
            className="rounded-xl p-3 text-center text-xs font-bold uppercase tracking-wider transition-all hover:scale-105"
            style={{
              backgroundColor: C.risk + "15",
              color: C.risk,
              border: `1px solid ${C.risk}30`,
            }}
          >
            Risks & Rewards
          </Link>
          <Link
            href="/workflow"
            className="rounded-xl p-3 text-center text-xs font-bold uppercase tracking-wider transition-all hover:scale-105"
            style={{
              backgroundColor: C.text + "08",
              color: C.textMuted,
              border: `1px solid ${C.border}`,
            }}
          >
            Dev Workflow
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-6 text-center" style={{ borderTop: `1px solid ${C.border}` }}>
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
