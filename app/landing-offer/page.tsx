"use client";

import { useState } from "react";

type ProblemKey =
  | "missedCalls"
  | "noShows"
  | "slowFollowUp"
  | "salesPipeline"
  | "schedulingChaos";

type PackageConfig = {
  label: string;
  shortLabel: string;
  headline: string;
  setupPrice: string;
  monthlyPrice: string;
  bestFor: string;
  outcomes: string[];
  notes: string[];
};

const PACKAGES: Record<ProblemKey, PackageConfig> = {
  missedCalls: {
    label: "Missed Calls / Voicemail",
    shortLabel: "Missed Calls",
    headline: "AI Inbound + Callback System",
    setupPrice: "$1,700–$2,600 one-time",
    monthlyPrice: "Typically $197–$350/mo + minutes & SMS",
    bestFor:
      "Teams that bleed money every time a call hits voicemail or rings out.",
    outcomes: [
      "24/7 AI agent that answers every call and captures qualified lead info.",
      "Speed-to-lead callback sequences when your team can’t answer in time.",
      "Real-time lead delivery to your inbox/CRM so nothing slips through cracks.",
      "Optional live transfers for hot leads."
    ],
    notes: [
      "Minutes start at $53/mo (160 minutes) and scale with volume.",
      "SMS plans start at $8/mo (50 SMS) for confirmations and booking links.",
      "Designed to be your ‘always-on front desk’ so humans stay on revenue work."
    ]
  },
  noShows: {
    label: "No-Shows & Cancellations",
    shortLabel: "No-Shows",
    headline: "AI No-Show & Callback Recovery System",
    setupPrice: "$1,700 one-time",
    monthlyPrice: "From $350/mo + minutes & SMS",
    bestFor:
      "Businesses with a full calendar on paper but too many empty chairs on the day.",
    outcomes: [
      "Detects missed/abandoned appointments and automatically calls & texts to reschedule.",
      "Brings dead time back to life by filling gaps with recovered bookings.",
      "Keeps your team calendar more stable, with fewer roller-coaster weeks.",
      "Runs quietly in the background, so staff don’t have to chase no-shows."
    ],
    notes: [
      "Pairs perfectly with inbound booking agents for full funnel coverage.",
      "Great first system if your biggest complaint is ‘half my day blew up again’.",
      "Minutes + SMS billed on top, so you only pay for real usage."
    ]
  },
  slowFollowUp: {
    label: "Slow Lead Follow-Up",
    shortLabel: "Slow Follow-Up",
    headline: "Speed-to-Lead AI Callback System",
    setupPrice: "$1,700–$4,400 one-time",
    monthlyPrice: "Typically $197–$620/mo + minutes & SMS",
    bestFor:
      "Teams that generate leads but can’t consistently call/text them back in the first 5 minutes.",
    outcomes: [
      "AI calls new leads in seconds — not hours — with your script and tone.",
      "Layered SMS + voicemail so prospects remember who you are when you call.",
      "Option to add Sales + Finance agents for full lead → close flow.",
      "Built to support your existing reps, not replace them."
    ],
    notes: [
      "Follows proven speed-to-lead SOPs that can boost booked calls dramatically.",
      "You choose how aggressive follow-up should be and when humans step in.",
      "Great for ads, inbound form fills, or high-intent web traffic."
    ]
  },
  salesPipeline: {
    label: "Sales Pipeline & Closing",
    shortLabel: "Sales Pipeline",
    headline: "Advanced Sales OS (Booking + Sales + Finance Agents)",
    setupPrice: "From $4,400 one-time",
    monthlyPrice: "From $620/mo + minutes & SMS",
    bestFor:
      "Teams with real sales volume who want structured, repeatable, AI-supported closing.",
    outcomes: [
      "AI booking agent fills your calendar with qualified appointments.",
      "Sales agent supports structured calls with discovery, recap, and next steps.",
      "Finance agent handles follow-up, agreements, and payment link reminders.",
      "Optional full Sales SOP with training video so humans and AI work as one system."
    ],
    notes: [
      "Full Sales SOP with video starts at $4,400 alone.",
      "Bundle: Booking Agent + Sales Video + Sales Agent + Finance Agent ≈ $6,300.",
      "Best fit for high-ticket offers, consultative sales, or multi-step pipelines."
    ]
  },
  schedulingChaos: {
    label: "Scheduling Chaos & Dispatch",
    shortLabel: "Scheduling Chaos",
    headline: "AI Dispatch & Scheduling System",
    setupPrice: "$2,600 one-time",
    monthlyPrice: "From $530/mo + minutes & SMS",
    bestFor:
      "Service businesses juggling ETAs, techs, routes, and ‘where’s my appointment’ calls.",
    outcomes: [
      "AI handles ETA updates, basic rescheduling, and confirmation calls automatically.",
      "Reduces inbound ‘where is my appointment’ calls that clog your lines.",
      "Keeps customers informed and your schedule tighter without manual chasing.",
      "Plays nicely with human dispatchers — takes the noise, they keep the control."
    ],
    notes: [
      "Ideal for HVAC, home services, deliveries, clinics, and any route-heavy business.",
      "Can be layered in after a basic inbound agent is in place.",
      "Designed as a sane next step once phones stop being on fire all day."
    ]
  }
};

export default function PricingPage() {
  const [selectedProblem, setSelectedProblem] = useState<ProblemKey | null>(
    null
  );

  const selectedPackage = selectedProblem ? PACKAGES[selectedProblem] : null;

  return (
    <main className="aid-pricing-page">
      <style>{`
        :root {
          --emerald: #047857;
          --emerald-dark: #065f46;
          --gold: #F4D03F;
          --charcoal: #0F172A;
          --offwhite: #F9FAFB;
          --text-muted: #9CA3AF;
        }

        body {
          margin: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
          background: radial-gradient(circle at top, #022c22 0, #020617 55%, #000000 100%);
          color: #E5E7EB;
        }

        .aid-pricing-page {
          min-height: 100vh;
        }

        .pricing-wrapper {
          max-width: 1080px;
          margin: 0 auto;
          padding: 32px 16px 96px;
        }

        .pricing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }

        .brand-mark {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .brand-logo {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: radial-gradient(circle at 30% 20%, #6EE7B7 0, #047857 45%, #022c22 100%);
          box-shadow: 0 12px 28px rgba(5, 150, 105, 0.45);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-weight: 700;
          letter-spacing: 0.09em;
          font-size: 0.96rem;
          text-transform: uppercase;
        }

        .brand-tagline {
          font-size: 0.84rem;
          color: var(--text-muted);
        }

        .back-link {
          font-size: 0.85rem;
          padding: 7px 14px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          background: rgba(15, 23, 42, 0.75);
          color: #E5E7EB;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .back-link span {
          font-size: 0.88rem;
        }

        .pricing-hero {
          border-radius: 24px;
          padding: 26px 22px 24px;
          background: radial-gradient(circle at top left, rgba(4, 120, 87, 0.4), rgba(15, 23, 42, 0.95));
          border: 1px solid rgba(148, 163, 184, 0.35);
          box-shadow:
            0 24px 80px rgba(15, 23, 42, 0.85),
            0 0 0 1px rgba(15, 23, 42, 0.7);
          margin-bottom: 28px;
        }

        .step-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 12px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 12px;
          background: rgba(15, 23, 42, 0.85);
        }

        .step-tag span {
          font-size: 0.8rem;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(4, 120, 87, 0.2);
          color: #A7F3D0;
          font-weight: 600;
        }

        .pricing-title {
          font-size: clamp(2rem, 3vw, 2.4rem);
          margin: 0 0 10px;
          letter-spacing: -0.04em;
        }

        .pricing-highlight {
          background: linear-gradient(120deg, #F4D03F, #F9A826);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .pricing-subtitle {
          font-size: 1rem;
          color: #CBD5F5;
          max-width: 640px;
          margin: 0 0 10px;
        }

        .pricing-note {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .pricing-layout {
          margin-top: 22px;
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
          gap: 22px;
          align-items: flex-start;
        }

        @media (max-width: 900px) {
          .pricing-layout {
            grid-template-columns: 1fr;
          }
        }

        .problem-card {
          border-radius: 18px;
          padding: 16px 14px 14px;
          background: rgba(15, 23, 42, 0.98);
          border: 1px solid rgba(148, 163, 184, 0.6);
        }

        .problem-title {
          font-size: 0.98rem;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .problem-sub {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .problem-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 12px;
        }

        @media (max-width: 680px) {
          .problem-grid {
            grid-template-columns: 1fr;
          }
        }

        .problem-button {
          border-radius: 14px;
          border: 2px solid rgba(148, 163, 184, 0.7);
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.92));
          padding: 10px 11px 9px;
          text-align: left;
          color: #E5E7EB;
          font-size: 0.9rem;
          cursor: pointer;
          transition:
            border-color 0.15s ease,
            background 0.15s ease,
            transform 0.12s ease,
            box-shadow 0.12s ease;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.95);
        }

        .problem-button strong {
          display: block;
          margin-bottom: 2px;
          font-size: 0.95rem;
        }

        .problem-button span {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .problem-button--active {
          border-color: var(--gold);
          background: linear-gradient(145deg, rgba(4, 120, 87, 1), rgba(15, 23, 42, 0.98));
          box-shadow: 0 18px 40px rgba(4, 120, 87, 0.75);
          transform: translateY(-1px);
        }

        .problem-hint {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .problem-hint strong {
          color: #E5E7EB;
        }

        .package-card {
          border-radius: 18px;
          padding: 16px 15px 15px;
          background: radial-gradient(circle at top, rgba(15, 118, 110, 0.38), rgba(15, 23, 42, 0.98));
          border: 1px solid rgba(148, 163, 184, 0.7);
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.8);
        }

        .package-label {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .package-headline {
          font-size: 1.2rem;
          margin: 0 0 8px;
        }

        .package-pricing {
          font-size: 0.94rem;
          margin-bottom: 10px;
        }

        .package-pricing strong {
          color: #fef9c3;
        }

        .package-bestfor {
          font-size: 0.92rem;
          color: #CBD5F5;
          margin-bottom: 10px;
        }

        .package-section-title {
          font-size: 0.88rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #A5B4FC;
          margin-top: 10px;
          margin-bottom: 4px;
        }

        .package-list {
          list-style: none;
          padding: 0;
          margin: 0 0 6px;
          font-size: 0.9rem;
        }

        .package-list li {
          position: relative;
          padding-left: 18px;
          margin-bottom: 4px;
        }

        .package-list li::before {
          content: "•";
          position: absolute;
          left: 4px;
          top: -1px;
          color: var(--gold);
        }

        .package-notes {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .package-notes li {
          margin-bottom: 3px;
        }

        .cta-panel {
          margin-top: 22px;
          border-radius: 16px;
          padding: 14px 13px;
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.6);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cta-text {
          font-size: 0.9rem;
          color: #E5E7EB;
        }

        .cta-text span {
          color: var(--gold);
          font-weight: 600;
        }

        .cta-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .primary-cta {
          border-radius: 999px;
          border: none;
          padding: 9px 16px;
          font-size: 0.94rem;
          font-weight: 600;
          background: linear-gradient(135deg, #047857, #22C55E);
          color: #ECFDF5;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 14px 40px rgba(16, 185, 129, 0.45);
          cursor: pointer;
        }

        .secondary-cta {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          padding: 8px 14px;
          font-size: 0.9rem;
          background: transparent;
          color: #E5E7EB;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .disclaimer {
          margin-top: 18px;
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .pricing-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="pricing-wrapper">
        <header className="pricing-header">
          <div className="brand-mark">
            <div className="brand-logo" />
            <div className="brand-text">
              <div className="brand-name">ALL IN DIGITAL</div>
              <div className="brand-tagline">AI Call, Booking &amp; Recovery Systems</div>
            </div>
          </div>
          <a href="/" className="back-link">
            <span>←</span> Back to main site
          </a>
        </header>

        <section className="pricing-hero">
          <div className="step-tag">
            <span>Step 1</span> Choose what you want fixed first
          </div>
          <h1 className="pricing-title">
            Build your{" "}
            <span className="pricing-highlight">AI call &amp; booking system</span> around the
            real problem in your business.
          </h1>
          <p className="pricing-subtitle">
            This page is for after we&apos;ve spoken. Pick the biggest bottleneck you want to
            solve first and we&apos;ll map it to a concrete AI system configuration with{" "}
            ballpark pricing.
          </p>
          <p className="pricing-note">
            You don&apos;t have to know all the tech. Just choose where it hurts most. We&apos;ll
            design the rest.
          </p>

          <div className="pricing-layout">
            {/* Left: Problem selection */}
            <div className="problem-card">
              <div className="problem-title">What&apos;s your loudest problem right now?</div>
              <div className="problem-sub">
                Click the one that sounds most like your world today. You can add more systems
                later — we start with the biggest win.
              </div>

              <div className="problem-grid">
                <button
                  type="button"
                  className={
                    "problem-button" +
                    (selectedProblem === "missedCalls" ? " problem-button--active" : "")
                  }
                  onClick={() => setSelectedProblem("missedCalls")}
                >
                  <strong>Missed calls &amp; voicemail</strong>
                  <span>Ringing out, hitting voicemail, staff can&apos;t keep up.</span>
                </button>
                <button
                  type="button"
                  className={
                    "problem-button" +
                    (selectedProblem === "noShows" ? " problem-button--active" : "")
                  }
                  onClick={() => setSelectedProblem("noShows")}
                >
                  <strong>No-shows &amp; cancellations</strong>
                  <span>Calendar looks full, but half the day blows up.</span>
                </button>
                <button
                  type="button"
                  className={
                    "problem-button" +
                    (selectedProblem === "slowFollowUp" ? " problem-button--active" : "")
                  }
                  onClick={() => setSelectedProblem("slowFollowUp")}
                >
                  <strong>Slow follow-up on leads</strong>
                  <span>Leads sit for hours before anyone calls or texts.</span>
                </button>
                <button
                  type="button"
                  className={
                    "problem-button" +
                    (selectedProblem === "salesPipeline" ? " problem-button--active" : "")
                  }
                  onClick={() => setSelectedProblem("salesPipeline")}
                >
                  <strong>Sales pipeline &amp; closing</strong>
                  <span>Lots of interest, not enough closed revenue.</span>
                </button>
                <button
                  type="button"
                  className={
                    "problem-button" +
                    (selectedProblem === "schedulingChaos" ? " problem-button--active" : "")
                  }
                  onClick={() => setSelectedProblem("schedulingChaos")}
                >
                  <strong>Scheduling chaos &amp; dispatch</strong>
                  <span>ETAs, routes, &quot;where&apos;s my appointment&quot; calls all day.</span>
                </button>
              </div>

              <div className="problem-hint">
                {selectedPackage ? (
                  <>
                    You picked: <strong>{selectedPackage.label}</strong>. Scroll right to see
                    the recommended system.
                  </>
                ) : (
                  <>
                    Not sure which one fits
                    <span>?</span> Pick the one that would make your life easier this month
                    if it disappeared.
                  </>
                )}
              </div>
            </div>

            {/* Right: Recommended package */}
            <div className="package-card">
              <div className="package-label">Recommended System</div>
              {selectedPackage ? (
                <>
                  <h2 className="package-headline">{selectedPackage.headline}</h2>
                  <div className="package-pricing">
                    <div>
                      <strong>Setup:</strong> {selectedPackage.setupPrice}
                    </div>
                    <div>
                      <strong>Ongoing:</strong> {selectedPackage.monthlyPrice}
                    </div>
                  </div>
                  <div className="package-bestfor">
                    <strong>Best for:</strong> {selectedPackage.bestFor}
                  </div>

                  <div className="package-section-title">What this system does for you</div>
                  <ul className="package-list">
                    {selectedPackage.outcomes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  <div className="package-section-title">How the pricing works</div>
                  <ul className="package-list package-notes">
                    {selectedPackage.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                    <li>
                      We&apos;ll finalize exact numbers together on a call based on volume,
                      complexity, and how many agents you actually need.
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <h2 className="package-headline">Pick a problem to see your system</h2>
                  <div className="package-bestfor">
                    Once you choose the problem that best fits your world, this side will show:
                  </div>
                  <ul className="package-list">
                    <li>The recommended AI system configuration.</li>
                    <li>A clear one-time setup range and typical monthly range.</li>
                    <li>Exactly what that system will do to clean up your phones, calendar, or pipeline.</li>
                    <li>How we keep everything TCPA and FCC compliant by design.</li>
                  </ul>
                  <p className="package-notes">
                    Most clients start with <strong>one core system</strong> (inbound + callbacks
                    or no-show recovery) and expand into dispatch or full sales OS once the first
                    system is printing wins.
                  </p>
                </>
              )}

              <div className="cta-panel">
                <div className="cta-text">
                  Next step:{" "}
                  <span>See this system in action with a live AI call</span> — and, if it
                  feels right, use that call to lock in your build and handle payment.
                </div>
                <div className="cta-buttons">
                  <a href="/#leadForm" className="primary-cta">
                    Trigger my live AI demo
                    <span>↗</span>
                  </a>
                  <a href="mailto:info@allindigitalmktg.com" className="secondary-cta">
                    Email Tom a question
                  </a>
                </div>
                <div className="disclaimer">
                  This page is meant as a transparent guide. Final pricing depends on the
                  exact workflows, number of agents, and volume we agree on together.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}