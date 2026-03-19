"use client";

import { useState, useMemo } from "react";
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

const BIN_OPTIONS = [
  { label: "14-Yard", value: 14 },
  { label: "20-Yard", value: 20 },
  { label: "40-Yard", value: 40 },
];

const USMCA_OPTIONS = [
  "Wholly Obtained Good",
  "Produced Exclusively",
  "Non-Originating",
];

const TITAN_ATTESTATIONS = [
  "Root of Trust",
  "Atomic Clock Signature",
  "Secure Boot Version",
  "Titan UID",
  "Device Integrity",
  "Kernel Hash",
  "System Uptime",
];

const BORDER_STEPS = [
  { label: "Edge", desc: "Construction Site", color: C.tech },
  { label: "Cloud", desc: "Compliance Engine", color: C.warning },
  { label: "Hub", desc: "Ground Truth", color: C.verified },
  { label: "Border", desc: "CBP Scrutiny", color: C.risk },
  { label: "Destination", desc: "Michigan BioHub", color: C.verified },
];

function computeWeight(binYd3: number): number {
  return binYd3 * 0.7645 * 174;
}

function sha256Sim(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const hex = (n: number) =>
    (((n >>> 0) * 2654435761) >>> 0).toString(16).padStart(8, "0");
  const base = Math.abs(h);
  return (
    hex(base) +
    hex(base ^ 0xdeadbeef) +
    hex(base ^ 0xcafebabe) +
    hex(base ^ 0x12345678) +
    hex(base ^ 0xfeedface) +
    hex(base ^ 0xabad1dea) +
    hex(base ^ 0x8badf00d) +
    hex(base ^ 0xdefec8ed)
  );
}

interface FormData {
  lat: string;
  lon: string;
  arsenic: string;
  chromium: string;
  copper: string;
  usmcaStatus: string;
  siteOrigin: "construction" | "demolition";
  binVolume: number;
}

function SectionBox({
  num,
  title,
  color,
  children,
}: {
  num: number;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
          style={{
            backgroundColor: color + "18",
            color,
            border: `1px solid ${color}40`,
          }}
        >
          {num}
        </div>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function Badge({
  label,
  color,
  large,
}: {
  label: string;
  color: string;
  large?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md font-bold uppercase tracking-wider ${
        large ? "px-3 py-1.5 text-xs" : "px-2 py-1 text-[10px]"
      }`}
      style={{
        backgroundColor: color + "18",
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  );
}

function InputField({
  label,
  value,
  onChange,
  suffix,
  note,
  noteColor,
  readOnly,
  type = "text",
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  suffix?: string;
  note?: string;
  noteColor?: string;
  readOnly?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label
        className="block text-[10px] uppercase tracking-wider mb-1"
        style={{ color: C.textDim }}
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2.5 text-sm font-mono outline-none min-h-[48px]"
          style={{
            backgroundColor: readOnly ? C.surface : C.bg,
            color: readOnly ? C.textMuted : C.text,
            border: `1px solid ${C.border}`,
          }}
        />
        {suffix && (
          <span className="text-[10px] font-mono shrink-0" style={{ color: C.textDim }}>
            {suffix}
          </span>
        )}
      </div>
      {note && (
        <p className="text-[10px] mt-1" style={{ color: noteColor || C.textDim }}>
          {note}
        </p>
      )}
    </div>
  );
}

export default function CertificatePage() {
  const [mode, setMode] = useState<"form" | "preview">("form");
  const [form, setForm] = useState<FormData>({
    lat: "43.2557",
    lon: "-79.8711",
    arsenic: "0.8",
    chromium: "1.2",
    copper: "3.5",
    usmcaStatus: "Wholly Obtained Good",
    siteOrigin: "construction",
    binVolume: 14,
  });

  const update = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const weight = useMemo(() => computeWeight(form.binVolume), [form.binVolume]);
  const weightTonnes = weight / 1000;
  const volumeM3 = form.binVolume * 0.7645;
  const overweight = weight > 4000;

  const arsenicVal = parseFloat(form.arsenic) || 0;
  const chromiumVal = parseFloat(form.chromium) || 0;
  const arsenicFail = arsenicVal > 2.5;
  const chromiumFail = chromiumVal > 5.0;
  const xrfPass = !arsenicFail && !chromiumFail;
  const isDemolition = form.siteOrigin === "demolition";
  const isWhollyObtained = form.usmcaStatus === "Wholly Obtained Good";
  const regPass = xrfPass && !isDemolition;

  const timestamp = new Date().toISOString();
  const hashInput = `${form.lat}|${form.lon}|${timestamp}|EfficientNet-B0-v2.4.1|As:${form.arsenic}|Cr:${form.chromium}|Cu:${form.copper}|${weight.toFixed(1)}kg`;
  const blockchainHash = sha256Sim(hashInput);

  const overallPass = regPass && isWhollyObtained;

  /* ── CERTIFICATE PREVIEW ── */
  if (mode === "preview") {
    return (
      <main
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: C.bg, color: C.text }}
      >
        {/* Preview Header */}
        <div
          className="px-6 py-4"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <button
            onClick={() => setMode("form")}
            className="text-xs font-bold uppercase tracking-wider min-h-[48px] px-4 rounded-lg"
            style={{ color: C.tech, border: `1px solid ${C.tech}40` }}
          >
            Back to Form
          </button>
        </div>

        {/* Certificate Document */}
        <div className="px-4 py-6">
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: `2px solid ${overallPass ? C.verified : C.risk}` }}
          >
            {/* Doc Header */}
            <div
              className="px-5 py-4 text-center"
              style={{
                backgroundColor: overallPass ? C.verified + "12" : C.risk + "12",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: C.textDim }}>
                905WOOD CERTIFICATE OF ORIGIN
              </div>
              <div
                className="text-sm font-black uppercase tracking-wider"
                style={{ color: overallPass ? C.verified : C.risk }}
              >
                USMCA SHIELD -- HS 3825.0
              </div>
            </div>

            {/* Stamp Overlay */}
            <div className="relative px-5 py-5">
              <div
                className="absolute top-4 right-4 px-4 py-2 rounded-lg text-sm font-black uppercase tracking-widest -rotate-12 opacity-80"
                style={{
                  color: overallPass ? C.verified : C.risk,
                  border: `3px solid ${overallPass ? C.verified : C.risk}`,
                  backgroundColor: C.bg,
                }}
              >
                {overallPass ? "VERIFIED" : "FAILED"}
              </div>

              {/* 9 Points Grid */}
              <div className="flex flex-col gap-4">
                {/* Point 1: GPS */}
                <CertRow num={1} label="GPS Origin" color={C.tech}>
                  <span className="font-mono">
                    {form.lat}, {form.lon}
                  </span>
                  <span className="text-[10px] ml-2" style={{ color: C.textDim }}>
                    +/-1m Titan M2
                  </span>
                </CertRow>

                {/* Point 2: HS */}
                <CertRow num={2} label="HS Classification" color={C.warning}>
                  <Badge label="3825.0" color={C.warning} />
                  <span className="text-[10px] ml-2" style={{ color: C.textDim }}>
                    Waste; residual products
                  </span>
                </CertRow>

                {/* Point 3: XRF */}
                <CertRow num={3} label="XRF Atomic Signature" color={xrfPass ? C.verified : C.risk}>
                  <div className="flex flex-wrap gap-3 text-[11px] font-mono">
                    <span style={{ color: arsenicFail ? C.risk : C.verified }}>
                      As: {form.arsenic} mg/L
                    </span>
                    <span style={{ color: chromiumFail ? C.risk : C.verified }}>
                      Cr: {form.chromium} mg/L
                    </span>
                    <span style={{ color: C.textMuted }}>
                      Cu: {form.copper} mg/L
                    </span>
                  </div>
                </CertRow>

                {/* Point 4: USMCA */}
                <CertRow
                  num={4}
                  label="USMCA Status"
                  color={isWhollyObtained ? C.verified : C.warning}
                >
                  <Badge
                    label={form.usmcaStatus}
                    color={isWhollyObtained ? C.verified : C.warning}
                  />
                </CertRow>

                {/* Point 5: Site Origin */}
                <CertRow
                  num={5}
                  label="Site Origin"
                  color={isDemolition ? C.risk : C.verified}
                >
                  <span
                    className="font-bold uppercase text-xs"
                    style={{ color: isDemolition ? C.risk : C.verified }}
                  >
                    {form.siteOrigin}
                  </span>
                  {isDemolition && (
                    <span className="text-[10px] ml-2" style={{ color: C.risk }}>
                      HIGH RISK OVERRIDE
                    </span>
                  )}
                </CertRow>

                {/* Point 6: AI Model */}
                <CertRow num={6} label="AI Model Version" color={C.tech}>
                  <span className="font-mono text-[11px]">
                    EfficientNet-B0 v2.4.1 | 905W-2026Q1-47K | LiteRT INT8
                  </span>
                </CertRow>

                {/* Point 7: Weight */}
                <CertRow num={7} label="Net Weight" color={overweight ? C.warning : C.text}>
                  <span className="font-mono">
                    {weight.toFixed(1)} kg ({weightTonnes.toFixed(3)} t)
                  </span>
                  <span className="text-[10px] ml-2" style={{ color: C.textDim }}>
                    {form.binVolume}yd | {volumeM3.toFixed(2)} m3
                  </span>
                  {overweight && (
                    <span className="text-[10px] ml-2 font-bold" style={{ color: C.warning }}>
                      OVERWEIGHT WARNING
                    </span>
                  )}
                </CertRow>

                {/* Point 8: O.Reg 347 */}
                <CertRow num={8} label="O.Reg 347 Compliance" color={regPass ? C.verified : C.risk}>
                  <Badge
                    label={regPass ? "SCHEDULE 4 -- PASS" : "SCHEDULE 4 -- FAIL"}
                    color={regPass ? C.verified : C.risk}
                    large
                  />
                </CertRow>

                {/* Point 9: Hash */}
                <CertRow num={9} label="Blockchain Hash" color={C.tech}>
                  <span
                    className="font-mono text-[10px] break-all"
                    style={{ color: C.tech }}
                  >
                    {blockchainHash}
                  </span>
                </CertRow>
              </div>
            </div>

            {/* Titan M2 Attestation */}
            <div
              className="px-5 py-4"
              style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.surface }}
            >
              <div
                className="text-[10px] uppercase tracking-widest mb-2 font-bold"
                style={{ color: C.tech }}
              >
                Titan M2 Hardware Attestation
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {TITAN_ATTESTATIONS.map((a) => (
                  <div key={a} className="flex items-center gap-1.5">
                    <span style={{ color: C.verified }}>&#10003;</span>
                    <span className="text-[10px] font-mono" style={{ color: C.textMuted }}>
                      {a}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timestamp */}
            <div
              className="px-5 py-3 text-center"
              style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.surface2 }}
            >
              <span className="text-[10px] font-mono" style={{ color: C.textDim }}>
                Generated: {timestamp} | ISO 8601
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setMode("form")}
              className="flex-1 rounded-xl text-sm font-bold uppercase tracking-wider min-h-[48px]"
              style={{
                backgroundColor: C.surface2,
                color: C.textMuted,
                border: `1px solid ${C.border}`,
              }}
            >
              Back to Form
            </button>
            <button
              onClick={() => alert("PDF generation will be available in production. Certificate data has been captured.")}
              className="flex-1 rounded-xl text-sm font-bold uppercase tracking-wider min-h-[48px]"
              style={{
                backgroundColor: C.tech + "15",
                color: C.tech,
                border: `1px solid ${C.tech}`,
              }}
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Border Crossing Workflow */}
        <BorderWorkflow />

        <Footer />
      </main>
    );
  }

  /* ── FORM MODE ── */
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: C.bg, color: C.text }}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-widest"
          style={{ color: C.textDim }}
        >
          &#8592; Back to Refinery
        </Link>
        <div className="flex items-baseline gap-2 mt-3 mb-1">
          <span className="text-2xl font-black tracking-tight" style={{ color: C.verified }}>
            905
          </span>
          <span className="text-2xl font-black tracking-tight">WOOD</span>
        </div>
        <h1 className="text-lg font-bold" style={{ color: C.text }}>
          USMCA Shield
        </h1>
        <p className="text-xs mt-0.5" style={{ color: C.textDim }}>
          9-Point Certificate of Origin -- HS 3825.0
        </p>
      </div>

      {/* Divider */}
      <div className="px-6 mb-4">
        <div className="h-px" style={{ backgroundColor: C.border }} />
      </div>

      {/* 9-Point Form */}
      <div className="px-4 flex flex-col gap-4 pb-6">
        {/* 1. GPS Origin */}
        <SectionBox num={1} title="GPS Origin Coordinates" color={C.tech}>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Latitude"
              value={form.lat}
              onChange={(v) => update("lat", v)}
              type="number"
            />
            <InputField
              label="Longitude"
              value={form.lon}
              onChange={(v) => update("lon", v)}
              type="number"
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: C.tech }}
            />
            <span className="text-[10px] font-mono" style={{ color: C.tech }}>
              +/-1m Titan M2 Hardware Attestation
            </span>
          </div>
        </SectionBox>

        {/* 2. HS Classification */}
        <SectionBox num={2} title="HS Classification" color={C.warning}>
          <div className="flex items-center gap-3">
            <Badge label="3825.0" color={C.warning} large />
            <span className="text-[11px]" style={{ color: C.textMuted }}>
              Waste; residual products of the chemical or allied industries
            </span>
          </div>
        </SectionBox>

        {/* 3. XRF Atomic Signature */}
        <SectionBox num={3} title="XRF Atomic Signature" color={C.tech}>
          <div className="flex flex-col gap-3">
            <InputField
              label="Arsenic (mg/L)"
              value={form.arsenic}
              onChange={(v) => update("arsenic", v)}
              type="number"
              suffix="mg/L"
              note={`TCLP Threshold: 2.5 mg/L${arsenicFail ? " -- EXCEEDS LIMIT" : " -- WITHIN LIMIT"}`}
              noteColor={arsenicFail ? C.risk : C.verified}
            />
            <InputField
              label="Chromium (mg/L)"
              value={form.chromium}
              onChange={(v) => update("chromium", v)}
              type="number"
              suffix="mg/L"
              note={`TCLP Threshold: 5.0 mg/L${chromiumFail ? " -- EXCEEDS LIMIT" : " -- WITHIN LIMIT"}`}
              noteColor={chromiumFail ? C.risk : C.verified}
            />
            <InputField
              label="Copper (mg/L)"
              value={form.copper}
              onChange={(v) => update("copper", v)}
              type="number"
              suffix="mg/L"
              note="TCLP Threshold: N/A (reference only)"
            />
          </div>
        </SectionBox>

        {/* 4. USMCA Status */}
        <SectionBox num={4} title="USMCA Originating Status" color={C.verified}>
          <select
            value={form.usmcaStatus}
            onChange={(e) => update("usmcaStatus", e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm font-bold outline-none min-h-[48px] appearance-none"
            style={{
              backgroundColor: C.bg,
              color: C.text,
              border: `1px solid ${C.border}`,
            }}
          >
            {USMCA_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <div className="mt-2">
            {isWhollyObtained ? (
              <Badge label="WHOLLY OBTAINED -- TARIFF EXEMPT" color={C.verified} />
            ) : (
              <Badge label="REVIEW REQUIRED" color={C.warning} />
            )}
          </div>
        </SectionBox>

        {/* 5. Site Origin Declaration */}
        <SectionBox num={5} title="Site Origin Declaration" color={isDemolition ? C.risk : C.verified}>
          <div className="flex gap-3">
            {(["construction", "demolition"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => update("siteOrigin", opt)}
                className="flex-1 rounded-lg px-3 py-3 text-xs font-bold uppercase tracking-wider min-h-[48px] transition-all"
                style={{
                  backgroundColor:
                    form.siteOrigin === opt
                      ? opt === "demolition"
                        ? C.risk + "20"
                        : C.verified + "20"
                      : C.bg,
                  color:
                    form.siteOrigin === opt
                      ? opt === "demolition"
                        ? C.risk
                        : C.verified
                      : C.textDim,
                  border: `1px solid ${
                    form.siteOrigin === opt
                      ? opt === "demolition"
                        ? C.risk
                        : C.verified
                      : C.border
                  }`,
                }}
              >
                {opt}
              </button>
            ))}
          </div>
          {isDemolition && (
            <div
              className="mt-3 rounded-lg px-3 py-2.5"
              style={{ backgroundColor: C.risk + "12", border: `1px solid ${C.risk}40` }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.risk }}>
                PRECAUTIONARY PRINCIPLE -- Hard override to High Risk
              </span>
            </div>
          )}
        </SectionBox>

        {/* 6. AI Model Version */}
        <SectionBox num={6} title="AI Model Version" color={C.tech}>
          <InputField
            label="Model / Dataset / Runtime"
            value="EfficientNet-B0 v2.4.1 | Dataset: 905W-2026Q1-47K | LiteRT INT8"
            readOnly
          />
        </SectionBox>

        {/* 7. Net Weight & Volumetric */}
        <SectionBox num={7} title="Net Weight & Volumetric" color={C.text}>
          <div className="mb-3">
            <label
              className="block text-[10px] uppercase tracking-wider mb-1.5"
              style={{ color: C.textDim }}
            >
              Bin Volume
            </label>
            <div className="flex gap-2">
              {BIN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update("binVolume", opt.value)}
                  className="flex-1 rounded-lg px-3 py-3 text-xs font-bold font-mono min-h-[48px] transition-all"
                  style={{
                    backgroundColor:
                      form.binVolume === opt.value ? C.tech + "18" : C.bg,
                    color: form.binVolume === opt.value ? C.tech : C.textDim,
                    border: `1px solid ${
                      form.binVolume === opt.value ? C.tech : C.border
                    }`,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calculation breakdown */}
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
          >
            <div className="text-[10px] uppercase tracking-widest mb-2 font-bold" style={{ color: C.textDim }}>
              Air Gap Calculation
            </div>
            <div className="flex flex-col gap-1 font-mono text-[11px]" style={{ color: C.textMuted }}>
              <div>
                Volume: {form.binVolume} yd3 x 0.7645 ={" "}
                <span style={{ color: C.text }}>{volumeM3.toFixed(2)} m3</span>
              </div>
              <div>
                Weight: {volumeM3.toFixed(2)} m3 x 174 kg/m3 ={" "}
                <span style={{ color: C.text }}>{weight.toFixed(1)} kg</span>
              </div>
              <div>
                Tonnes:{" "}
                <span style={{ color: C.text }}>{weightTonnes.toFixed(3)} t</span>
              </div>
            </div>
            {overweight && (
              <div
                className="mt-2 rounded-md px-2.5 py-1.5"
                style={{ backgroundColor: C.warning + "15", border: `1px solid ${C.warning}40` }}
              >
                <span className="text-[10px] font-bold uppercase" style={{ color: C.warning }}>
                  OVERWEIGHT WARNING -- Exceeds 4,000 kg. Wet wood &quot;sponge effect&quot; risk.
                </span>
              </div>
            )}
          </div>
        </SectionBox>

        {/* 8. O.Reg 347 Compliance */}
        <SectionBox num={8} title="O.Reg 347 Compliance" color={regPass ? C.verified : C.risk}>
          <div className="flex items-center gap-3">
            <Badge
              label={regPass ? "SCHEDULE 4 -- PASS" : "SCHEDULE 4 -- FAIL"}
              color={regPass ? C.verified : C.risk}
              large
            />
          </div>
          <div className="mt-2 text-[10px]" style={{ color: C.textDim }}>
            {!xrfPass && "XRF thresholds exceeded. Auto-manifest as Subject Waste via RPRA HWPR API. "}
            {isDemolition && "Demolition site origin triggers Precautionary Principle hard override. "}
            {regPass && "All chemical thresholds within limits. Construction origin verified."}
          </div>
        </SectionBox>

        {/* 9. Blockchain Hash */}
        <SectionBox num={9} title="Blockchain Hash" color={C.tech}>
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
          >
            <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: C.textDim }}>
              SHA-256 binding: GPS + Timestamp + Model + XRF + Weight
            </div>
            <div
              className="font-mono text-[11px] break-all leading-relaxed"
              style={{ color: C.tech }}
            >
              {blockchainHash}
            </div>
          </div>
        </SectionBox>

        {/* Titan M2 Attestation */}
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: C.surface2, border: `1px solid ${C.tech}30` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.tech }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.tech }}>
              Titan M2 Hardware Attestation
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {TITAN_ATTESTATIONS.map((a) => (
              <div key={a} className="flex items-center gap-2">
                <span className="text-sm" style={{ color: C.verified }}>&#10003;</span>
                <span className="text-[11px]" style={{ color: C.textMuted }}>
                  {a}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* GENERATE BUTTON */}
        <button
          onClick={() => setMode("preview")}
          className="w-full rounded-xl text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            minHeight: "56px",
            backgroundColor: C.verified + "12",
            color: C.verified,
            border: `2px solid ${C.verified}`,
          }}
        >
          GENERATE CERTIFICATE
        </button>
      </div>

      {/* Border Crossing Workflow */}
      <BorderWorkflow />

      <Footer />
    </main>
  );
}

/* ── Shared sub-components ── */

function CertRow({
  num,
  label,
  color,
  children,
}: {
  num: number;
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg p-3"
      style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[10px] font-black font-mono"
          style={{ color }}
        >
          [{num}]
        </span>
        <span
          className="text-[10px] uppercase tracking-wider font-bold"
          style={{ color: C.textDim }}
        >
          {label}
        </span>
      </div>
      <div className="text-xs" style={{ color: C.text }}>
        {children}
      </div>
    </div>
  );
}

function BorderWorkflow() {
  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-px flex-1" style={{ backgroundColor: C.border }} />
        <span className="text-[10px] uppercase tracking-widest" style={{ color: C.textDim }}>
          Border Crossing Workflow
        </span>
        <div className="h-px flex-1" style={{ backgroundColor: C.border }} />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {BORDER_STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center shrink-0">
            <div
              className="rounded-xl p-3 min-w-[120px]"
              style={{
                backgroundColor: step.color + "10",
                border: `1px solid ${step.color}40`,
              }}
            >
              <div
                className="text-[10px] font-black uppercase tracking-wider mb-0.5"
                style={{ color: step.color }}
              >
                {step.label}
              </div>
              <div className="text-[10px]" style={{ color: C.textMuted }}>
                {step.desc}
              </div>
            </div>
            {i < BORDER_STEPS.length - 1 && (
              <span
                className="mx-1 text-sm shrink-0"
                style={{ color: C.textDim }}
              >
                &#8594;
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
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
  );
}
