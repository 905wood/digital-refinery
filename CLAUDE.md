# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start Next.js dev server (Turbopack, port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

Dev server is also configured in `.claude/launch.json` as "AgenticOS Dev Server" for use with `preview_start`.

## Tech Stack

- **Next.js 16** with App Router (Turbopack)
- **React 19** with TypeScript (strict mode)
- **Tailwind CSS 4** via `@tailwindcss/postcss` plugin (not the legacy `tailwindcss` PostCSS plugin)
- **ESM** (`"type": "module"` in package.json)

## Code Architecture

Next.js App Router structure under `src/app/`:

- `layout.tsx` — Root layout (html/body wrapper, metadata)
- `page.tsx` — Landing page (`/`)
- `workflow/page.tsx` — Interactive 5-step dev workflow pipeline (`/workflow`, client component)
- `api/hello/route.ts` — Example API route (`GET /api/hello`)
- `globals.css` — Tailwind import only (`@import "tailwindcss"`)

Path alias: `@/*` maps to `./src/*` (configured in tsconfig.json).

## Conventions

- Client components use `"use client"` directive at top of file
- Tailwind 4 CSS-first config — styles go in `globals.css`, no `tailwind.config.js`
- API routes use Next.js Route Handlers (`NextResponse.json()`)
- Design aesthetic: dark backgrounds, gradient accents, cyber-physical industrial tone

---

# 905WOOD Digital Refinery — Domain Context

## Project Identity

**Company:** 905WOOD (905Wood.com) — est. 2010, Hamilton/GTA, Ontario, Canada
**Founder:** Mike (sales@905wood.com) — handles product, engineering, growth, and operations
**Phone:** +1 (833) 863-9663 (Twilio Cloud PBX)
**What it is:** Canada's tech-enabled, wood-only dumpster rental and recycling service
**Core thesis:** Specialization wins. Wood-only bins = lower contamination, 60%+ diversion rates (vs. industry 15–25%), and better unit economics over 14 years of proof.

The **Digital Refinery** is the platform layer — the "Sentient Bridge" between chaotic construction waste and the high-purity requirements of the pyrogenic biocarbon market (<10% moisture, 2-4mm chip profile for CHAR Technologies).

---

## Architecture Overview: The 5-Layer Refinery Stack

### Layer 1: Intake — The Compliance Gate
Edge AI triage at point of collection. Binary classification (Clean Class 146 vs. Treated/High-Risk) in <2 seconds using INT8-quantized EfficientNet-B0 on the Pixel 10 Pro's Tensor G5 chip via LiteRT.

**Precautionary Principle:** The system inherently distrusts the RGB camera. Weathered CCA-treated wood (arsenic) is visually identical to clean gray pine. Three override rules apply:
1. **Audio overrides Visual** — Driver voice note containing "deck", "demolition", "renovation", "painted", "railway tie", or "pressure treated" shatters any clean AI score
2. **Origin overrides Visual** — If the dropdown = "Demolition", hard-override to high-risk regardless of visual confidence
3. **Hub overrides Edge** — Stationary XRF/NIR sensors at the hub deliver the "verdict"; the edge delivers the "estimate"

**Hold-to-Seal:** 2.0-second haptic verification protocol locks the legal Chain of Custody with GPS provenance (±1m) via Titan M2 hardware attestation. This is intentional "Hostile UX" — friction for legal certainty.

**Volumetric Formula:** `Estimated_Weight = Bin_Volume_Yards × 0.7645 × 174 kg/m³`
If a 14-yard load exceeds 4,000 kg, trigger an OVERWEIGHT WARNING (wet wood "sponge effect" risk).

### Layer 2: Logistics — Hub-and-Spoke (EDI Backbone)
Asset library: 20-yard, 40-yard, and 144-yard Walking Floor ("The Mothership").
The Mothership holds ~108 m³ / ~18.8 tonnes, bypassing transfer stations (which landfill 66% of recyclables) to deliver 2-4mm densified chips directly to regional BioHubs.

- FIFO enforcement on biomass piles prevents spontaneous combustion
- $75/day "Diversion Pass" (rebranded demurrage) as velocity signal for stagnant assets
- EDI X12 204 Motor Carrier Load Tender backbone (ISA/GS/ST/SE envelope hierarchy)
- State management via JMS Spring framework (Apply, Cancel, Confirm My Choices)

### Layer 3: Regulatory — Compliance Engine (RAG)
AlloyDB AI with ScaNN vector index (10x faster than standard PostgreSQL). Zero-hallucination constraint mapping sensor output to O.Reg 347 legal text.

**Chemical Thresholds (TCLP):**
- Arsenic > 2.5 mg/L → auto-manifest as "Subject Waste" via RPRA HWPR API
- Lead > 5.0 mg/L → auto-manifest
- Chromium > 5.0 mg/L → auto-manifest

**Decision Lineage ("The Time Machine"):** Vertex ML Metadata creates a cryptographic audit trail freezing AI model version, training dataset, and regulatory text at the exact millisecond of validation.

### Layer 4: Value Realization — Decoupled Billing
Destroys the opaque "Black Box Invoice." Every invoice splits into 3 transparent line items:
- **Base Logistics** (~$350 fixed)
- **Net Weight** (variable, benchmark $142.40/ton for clean wood)
- **CIRCIL Levy** ($5–$60/tonne, escalating through 2036)

**Behavioral economics mechanics:**
- "Missed Savings Alert": "Failure to Sort Mixed Material — You burned $240.00 on this load"
- "Zero-Levy Report Card": Gamifies compliance; clean sorting drives the CIRCIL levy to $0.00
- "Carbon Dividend Display": Shows theoretical CORC yield (~0.75t CO₂e/dry tonne, ~$350/ton)

### Layer 5: Reporting — Ecosystem Integration
- **ForestEdge API:** Generates Scope 3 climate compliance data for enterprise ESG dashboards
- **Digital Diversion Certificates:** Cryptographically locked to AI model version, training dataset, and regulatory text
- **CORCs (CO₂ Removal Certificates):** 0.75 tonnes CO₂e per ton of refined dry feedstock, valued at ~$350/ton
- **Digital Product Passports:** JSON-based lineage + Blockchain Hash ID for "Saw Blade to Soil" verification
- **Craft 4.0 (2027):** "Return-to-Sender Loop" — refined waste re-manufactured into biocomposite bricks

---

## The Capacity Cliff — Why This Matters Now

| Date | Milestone | Impact |
|------|-----------|--------|
| Jan 1, 2026 | Municipal ICI Exit | Municipal collection ends → "Orphan Crisis" for 4M tonnes feedstock |
| Jul 2026 | USMCA Joint Review | Section 122 tariffs (10% global) + 40% transshipment penalty |
| 2029 | REWOOD Landfill Ban | Landfilling clean wood becomes criminal |
| 2034 | Capacity Exhaustion | Terminal limit of Ontario's domestic landfill volume |

**Michigan dependency:** Ontario exports 3.44M tonnes/year to Michigan (14.35% of all Michigan landfill disposal). If the border thickens, Ontario has no domestic capacity.

**Financial escalator:** Mixed waste = $196.96/ton vs. Clean wood benchmark = $142.40/ton. The CIRCIL Levy ($10–$60/tonne by 2036) is the behavioral lever that makes sorting economically rational.

---

## USMCA Shield — 9-Point Certificate of Origin

Cryptographically verified, high-contrast "Fax-Ready" PDF optimized for CBP officer scrutiny at the Ontario-Michigan border. Proves "Wholly Obtained Good" status to bypass Section 122 tariffs and the 40% transshipment penalty on HS Code 3825.0 shipments.

1. Validated GPS Origin Coordinates
2. 6-digit HS Classification (3825.0)
3. XRF Atomic Signature (Arsenic/Chromium/Copper levels)
4. USMCA "Wholly Obtained Good" Attestation
5. Site Origin Declaration (Construction vs. Demolition)
6. AI Model Version & Metadata
7. Net Weight & Volumetric Air Gap Calculation
8. O.Reg 347 Schedule 4 Compliance Check
9. Cryptographic Blockchain Hash (binding GPS, timestamp, model version)

**Titan M2 Hardware Attestation** binds all 9 points via: Root of Trust, Atomic Clock Signature, Secure Boot Version, Titan UID, Device Integrity, Kernel Hash, System Uptime.

---

## Edge Hardware — Pixel 10 Pro

| Component | Specification |
|-----------|--------------|
| Device | Google Pixel 10 Pro (6.3" LTPO OLED, 2424×1080) |
| OS | Android 16 |
| Chipset | Tensor G5 (TSMC 3nm N3E) |
| Packaging | InFO-POP (superior thermal dissipation) |
| AI Engine | EdgeTPU (40% TOPS increase over previous gen) |
| Local AI | Gemini Nano (on-device multimodal) |
| Vision Model | EfficientNet-B0 (INT8 quantized via LiteRT) |
| Latency | <2.0s binary triage |
| Security | Titan M2 hardware root of trust |
| Always-On | nanoTPU (cough/fall detection) |
| Duty Cycle | 8-hour continuous NPU throughput, zero thermal throttling |

**Why Tensor G5:** Google controls the full vertical stack — Silicon (Tensor G5) → Models (Gemini Nano) → OS (Android 16) → Compiler (XLA/LiteRT) → Features. TSMC 3nm N3E provides frequency stability for 8-hour industrial duty cycles. InFO-POP packaging dissipates heat during Hamilton summer construction.

**Systolic Array Mechanics:** The EdgeTPU uses Weight-Stationary dataflow in a 256×256 Processing Element grid. Weights are pre-loaded (eliminating ~200x DRAM energy cost), activations stream horizontally, partial sums accumulate vertically. This converts matrix multiplication from memory-bound to compute-bound. Each data element is reused hundreds of times within the grid.

---

## Cloud & Backend Architecture

### Microservices (Cloud Run)
- `service-905wood-rfq` → rfq.905wood.com
- `service-905wood-driver` → driver.905wood.com
- `service-905wood-ai` → ai.905wood.com

Headless, API-first design prevents MLOps vector search degradation of Sales/RFQ UI.

### Database
- **Engine:** Google AlloyDB AI
- **Index:** ScaNN (Scalable Nearest Neighbors)
- **RAG:** Policy-as-Code governance with zero-hallucination constraint

### Telephony
- **PBX:** Twilio Cloud (+1-833-863-9663)
- **Channels:** Voice, SMS, WhatsApp Business API
- **Photo quoting:** WhatsApp → ChatGPT/Gemini vision endpoint → automated quote

### Security
- **DeepREJECT Score:** `Score = R × W × (0.65·K + 0.35·F)` — evaluates practical harmfulness
- **Plan Auditor:** Semantic analysis on generated search plans before execution
- **Intent Hijack Detection:** Blocks motive obfuscation and goal-shifting
- **Biosecurity:** Terminal security violation for biothreats
- **HITL Alerting:** Automatic human escalation below 85% AI confidence (e.g., snow cover data drift)

---

## Deployment Roadmap

| Phase | Quarter | Objectives | Key Modules |
|-------|---------|------------|-------------|
| The Edge | Q1 2026 | Pixel 10 Pro deployment, AI training | INDEX, DRIVER |
| The Core | Q2 2026 | Twilio trunk, dispatch logic | LAPTOP (Twilio Flex), OPS |
| The Truth | Q3 2026 | Hub XRF/NIR sensor install, RPRA API | HUB, ADMIN, DATA (AlloyDB) |
| The Value | Q4 2026 | Financial launch, carbon tracking | RFQ, SALES |

### Development Phases (Completed Feb 2026)
- **Phase 1 (Feb 2–3):** Foundational architecture, Compliance Gate, Offline-First Caching
- **Phase 2 (Feb 6–7):** Governance, Policy-as-Code, Carbon Dividend visualization, Decoupled Billing
- **Phase 3 (Feb 8):** Intelligent Compliance, Natural Language UI, Certificate of Origin PDFs
- **Phase 4 (Feb 9–12):** Multimodal Agentic Triage, Audio-Visual Override, Hold-to-Seal, Twilio/WhatsApp
- **Phase 5 (Feb 13–16):** Hardware convergence, Cloud Run microservices, Android 16 notification intelligence

---

## Business Context

### KPIs Mike Tracks
Conversion rate, Cost/tonne, Route utilization, Repeat rate, CAC/LTV, Diversion %

### Growth Strategy (2026–2027)
- **Asset-light fleet expansion:** 2x capacity via revenue-share deals with equipment lessors and municipalities
- **B2B partnerships:** API integrations with GCs, municipalities, building supply chains
- **Data monetization:** Carbon credit bundling, municipal diversion reporting SaaS, ESG dashboards
- **Regional growth:** Replicating in K-W, Ottawa, London

### Competitive Advantage
- Focused SKU → simpler ops, faster turns, lower costs
- Owned tech → rapid iteration, no platform fees
- Clean-wood specialization → recyclers pay more, landfills cost less
- 14 years of proof → validated demand, established infrastructure

---

## Key Regulatory Anchors

- **O.Reg 347:** Chain-of-custody manifest and compliance requirements
- **O.Reg 102/94:** Audit lineage tracking
- **RPRA HWPR:** Resource Productivity and Recovery Authority Hazardous Waste Program Registry
- **USMCA Chapter 4:** Rules of origin, transshipment penalties (40%)
- **Section 122 (Trade Act 1974):** 10% global tariff, 150-day duration limit
- **REWOOD (2029):** Landfill ban on clean wood
- **CIRCIL Levy:** Escalating $10–$60/tonne through 2036
- **Bill 5 (Protect Ontario Act):** Doug Ford's geopolitical defense for waste self-reliance

---

## Terminology — Always Use These Terms

- **Digital Refinery** — the platform (never "app" or "tool")
- **Sentient Bridge** — the metaphor connecting chaos to carbon
- **Compliance Gate** — Layer 1 intake (not "scanner" or "classifier")
- **Precautionary Principle** — audio/origin overrides visual AI
- **Hold-to-Seal** — 2.0s haptic Chain of Custody lock
- **Hostile UX / Intelligent Slowing** — intentional friction for safety
- **Decoupled Billing** — transparent 3-line invoice (not "pricing")
- **Zero-Levy Report Card** — gamified compliance outcome
- **Missed Savings Alert** — loss aversion behavioral nudge
- **USMCA Shield** — 9-Point Certificate of Origin
- **The Mothership** — 144-yard walking floor trailer
- **Diversion Pass** — rebranded demurrage ($75/day velocity signal)
- **Carbon Dividend** — CORC yield per tonne
- **Capacity Cliff** — the structural collapse timeline (2026–2034)
- **Orphan Crisis** — feedstock abandoned after municipal ICI exit
- **Visual Fallacy** — the RGB camera's blind spot for weathered CCA
- **The Time Machine** — Vertex ML decision lineage
- **Agentic RAG** — autonomous multi-step retrieval architecture
- **Systolic Computing** — TPU's weight-stationary dataflow
- **Zero-Copy Interoperability** — LiteRT's inference mode
- **Pyrogenic Biocarbon** — the end product (biochar)
- **Intent Hijack** — security threat: reframing harmful queries
- **DeepREJECT** — risk scoring formula for safety alignment

---

## Operational Tone

Industrial, Audit-Ready, Authoritative, and Architecturally Precise. "Hamilton Grit meets Silicon Valley." The aesthetic is cyber-physical — black backgrounds, green (#30D158) for verified/clean status, red (#FF453A) for risk/alert, amber (#FFD60A) for warnings, cyan (#64D2FF) for tech/hardware. High-contrast, fax-ready for border scrutiny. All documentation must be audit-proof for government review.

---

## Critical Failure Modes to Always Consider

1. **XRF Miscalibration** → Volatilizes arsenic into toxic corrosive gas, ruins biochar reactors
2. **AI Hallucination** → Incorrect citations causing O.Reg 347 fines
3. **Visual Fallacy** → Missing CCA treatment in weathered gray pine
4. **Spontaneous Combustion** → FIFO logic failure in chipped wood piles → biological heat → ignition
5. **Transshipment Penalty** → 40% surcharge at border for non-compliant documentation

---

## Skills Available

When working on 905WOOD tasks, these specialized skills exist:
- `digital-refinery` — Master technical architecture and implementation guide
- `waste-corridor-compliance` — Ontario-Michigan trade corridor, USMCA tariffs, regulatory landscape
- `ai-silicon-specs` — TPU evolution, Tensor G5, systolic arrays, LiteRT deployment

Always consult the relevant skill before generating compliance documentation, technical specs, or regulatory analysis.

---

## Files & Deliverables Created

- `905wood-digital-refinery.jsx` — Full interactive website (desktop, React artifact)
- `905wood-pixel10pro-app.jsx` — Mobile-first React prototype (Pixel 10 Pro viewport)
- `905wood-app/index.html` — Production PWA (deployable, 48KB, zero dependencies)
- `905wood-app/manifest.json` — Web App Manifest for Android 16 install
- `905wood-app/sw.js` — Service Worker for offline-first capability

---

## API Endpoints

### Volumetric Intake
```
POST /v1/intake/calculate_volume
{
  "bin_volume_yd3": 14,
  "material_type": "mixed_wood",
  "density_constant_kg_m3": 174,
  "void_ratio_multiplier": 0.7645
}
```

### Key Formulas
- **Weight:** `Bin_Volume × 0.7645 × 174`
- **CIRCIL Levy (mixed):** `Weight_tonnes × $60/tonne`
- **Carbon Dividend:** `Weight_tonnes × 0.75 × $350`
- **DeepREJECT:** `R × W × (0.65·K + 0.35·F)`
- **Network Diameter (3D Torus):** `3∛N` hops (vs. `2√N` for 2D grid)
