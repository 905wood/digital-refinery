"use client";

import { useState } from "react";

const steps = [
  {
    id: 1,
    title: "Detect",
    subtitle: "Scan Project",
    icon: "🔍",
    color: "from-violet-500 to-purple-600",
    border: "border-violet-400",
    glow: "shadow-violet-500/30",
    description: "Scan the desktop and project directories for existing dev servers, package.json scripts, and framework configurations.",
    details: [
      "Search for package.json, Makefile, docker-compose",
      "Identify frameworks (Next.js, Express, FastAPI)",
      "Map script commands to server configurations",
    ],
  },
  {
    id: 2,
    title: "Scaffold",
    subtitle: "Build Structure",
    icon: "🏗️",
    color: "from-blue-500 to-cyan-500",
    border: "border-blue-400",
    glow: "shadow-blue-500/30",
    description: "Initialize the project with the chosen stack — install dependencies, create directory structure, and wire up core files.",
    details: [
      "npm init + install Next.js, React, TypeScript",
      "Create src/app/ with layout, page, and API routes",
      "Configure Tailwind CSS, ESLint, PostCSS",
    ],
  },
  {
    id: 3,
    title: "Configure",
    subtitle: "Launch Settings",
    icon: "⚙️",
    color: "from-emerald-500 to-green-500",
    border: "border-emerald-400",
    glow: "shadow-emerald-500/30",
    description: "Generate .claude/launch.json with dev server configurations — executable, arguments, and ports.",
    details: [
      "Define runtimeExecutable and runtimeArgs",
      "Set port mappings for each server",
      "Support multiple server configurations",
    ],
  },
  {
    id: 4,
    title: "Launch",
    subtitle: "Start Servers",
    icon: "🚀",
    color: "from-orange-500 to-amber-500",
    border: "border-orange-400",
    glow: "shadow-orange-500/30",
    description: "Start selected dev servers via preview_start, binding to configured ports with hot-reload enabled.",
    details: [
      "Call preview_start for each selected server",
      "Turbopack-powered hot module replacement",
      "Automatic error overlay and diagnostics",
    ],
  },
  {
    id: 5,
    title: "Verify",
    subtitle: "Preview & Fix",
    icon: "✅",
    color: "from-rose-500 to-pink-500",
    border: "border-rose-400",
    glow: "shadow-rose-500/30",
    description: "Screenshot the running app, catch build errors, fix issues in real-time, and confirm the app renders correctly.",
    details: [
      "Take preview screenshot to check rendering",
      "Detect and resolve build errors (e.g. ESM/CJS)",
      "Iterate until clean build confirmed",
    ],
  },
];

function Connector({ active }: { active: boolean }) {
  return (
    <div className="hidden md:flex items-center mx-1">
      <div className="flex items-center gap-0.5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
              active
                ? "bg-white/80 scale-110"
                : "bg-white/20 scale-100"
            }`}
            style={{ transitionDelay: `${i * 60}ms` }}
          />
        ))}
        <svg
          className={`w-3 h-3 transition-colors duration-300 ${
            active ? "text-white/80" : "text-white/20"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}

export default function WorkflowPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AgenticOS Development Pipeline
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            Dev Workflow
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            From empty directory to running application in five automated steps.
            <br />
            Click any step to explore the details.
          </p>
        </header>

        {/* Pipeline — horizontal on desktop, vertical on mobile */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center mb-16">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-col md:flex-row items-center">
              {/* Step card */}
              <button
                onClick={() =>
                  setActiveStep(activeStep === step.id ? null : step.id)
                }
                className={`
                  group relative w-36 rounded-2xl border p-5 text-center
                  transition-all duration-300 cursor-pointer
                  ${
                    activeStep === step.id
                      ? `${step.border} bg-white/10 ${step.glow} shadow-lg scale-105`
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
                  }
                `}
              >
                {/* Step number badge */}
                <div
                  className={`
                    absolute -top-3 -right-3 w-7 h-7 rounded-full text-xs font-bold
                    flex items-center justify-center
                    bg-gradient-to-br ${step.color} shadow-lg
                  `}
                >
                  {step.id}
                </div>

                <div className="text-3xl mb-3">{step.icon}</div>
                <div className="font-semibold text-sm">{step.title}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {step.subtitle}
                </div>
              </button>

              {/* Connector */}
              {idx < steps.length - 1 && (
                <>
                  {/* Desktop connector (horizontal) */}
                  <Connector
                    active={
                      activeStep !== null &&
                      activeStep > step.id
                    }
                  />
                  {/* Mobile connector (vertical) */}
                  <div className="flex md:hidden flex-col items-center my-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full mb-0.5 transition-colors ${
                          activeStep !== null && activeStep > step.id
                            ? "bg-white/60"
                            : "bg-white/15"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div
          className={`
            max-w-2xl mx-auto transition-all duration-500 overflow-hidden
            ${activeStep ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          {activeStep && (() => {
            const step = steps.find((s) => s.id === activeStep)!;
            return (
              <div
                className={`rounded-2xl border ${step.border} bg-white/[0.04] p-8`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{step.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold">{step.title}</h2>
                    <span className="text-sm text-gray-400">
                      Step {step.id} of {steps.length}
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {step.description}
                </p>
                <ul className="space-y-3">
                  {step.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                      <span
                        className={`mt-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${step.color} shrink-0`}
                      />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
        </div>

        {/* Tech stack bar */}
        <footer className="mt-20 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-4">
            Powered by
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            {["Next.js 16", "React 19", "TypeScript", "Tailwind 4", "Turbopack"].map(
              (tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-full border border-white/5 bg-white/[0.02]"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
