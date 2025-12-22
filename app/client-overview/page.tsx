"use client";

import { useState } from "react";

type TierKey = "landing" | "starter" | "os" | null;
type FunnelMode = "inbound" | "outbound";
type IndustryKey = "generic" | "medspa" | "home" | "sales" | "other";

export default function ExplainerPage() {
  const [openTier, setOpenTier] = useState<TierKey>("landing");
  const [funnelMode, setFunnelMode] = useState<FunnelMode>("inbound");
  const [industry, setIndustry] = useState<IndustryKey>("generic");

  // ROI calculator state – focused on THEIR numbers, not your pricing
  const [leads, setLeads] = useState("200");
  const [bookRate, setBookRate] = useState("40"); // %
  const [showRate, setShowRate] = useState("60"); // %
  const [closeRate, setCloseRate] = useState("25"); // %
  const [avgTicket, setAvgTicket] = useState("1500");

  // Improvement assumptions
  const [speedLift, setSpeedLift] = useState("200"); // % multiplier on booked
  const [bookDrop, setBookDrop] = useState("7"); // % drop from tighter qual / no-show policy
  const [showLift, setShowLift] = useState("35"); // additive points
  const [closeLift, setCloseLift] = useState("25"); // additive points

  const parsedLeads = Number(leads) || 0;
  const parsedBookRate = Number(bookRate) || 0;
  const parsedShowRate = Number(showRate) || 0;
  const parsedCloseRate = Number(closeRate) || 0;
  const parsedAvgTicket = Number(avgTicket) || 0;

  const parsedSpeedLift = Number(speedLift) || 0;
  const parsedBookDrop = Number(bookDrop) || 0;
  const parsedShowLift = Number(showLift) || 0;
  const parsedCloseLift = Number(closeLift) || 0;

  // Baseline funnel
  const baselineBooked = parsedLeads * (parsedBookRate / 100);
  const baselineShows = baselineBooked * (parsedShowRate / 100);
  const baselineSales = baselineShows * (parsedCloseRate / 100);
  const baselineRevenue = baselineSales * parsedAvgTicket;

  // Improved funnel (with full SOP)
  // Speed-to-lead uplift is treated as a multiplier of current booked calls.
  const speedMultiplier = parsedSpeedLift / 100; // 200 => 2x, 800 => 8x
  const improvedBookedRaw =
    baselineBooked * speedMultiplier * (1 - parsedBookDrop / 100);

  const improvedBooked = Math.min(
    parsedLeads,
    Math.max(0, improvedBookedRaw)
  );

  const improvedShowRate = Math.min(
    100,
    Math.max(0, parsedShowRate + parsedShowLift)
  );
  const improvedCloseRate = Math.min(
    100,
    Math.max(0, parsedCloseRate + parsedCloseLift)
  );

  const improvedShows = improvedBooked * (improvedShowRate / 100);
  const improvedSales = improvedShows * (improvedCloseRate / 100);
  const improvedRevenue = improvedSales * parsedAvgTicket;

  const extraMonthlyRevenue = Math.max(0, improvedRevenue - baselineRevenue);
  const extraYearlyRevenue = extraMonthlyRevenue * 12;

  const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });

  const formatCurrencyWithDecimals = (value: number) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

  const industryLabel = (() => {
    switch (industry) {
      case "medspa":
        return "Med Spa, Dental & Aesthetic Clinics";
      case "home":
        return "Home Services (HVAC, Plumbing, Roofing, Electrical, etc.)";
      case "sales":
        return "Sales Teams & High-Ticket Closers";
      case "other":
        return "Other Local & B2B Services";
      default:
        return "Most appointment-based businesses";
    }
  })();

  return (
    <main className="aid-explainer-page">
      <style>{`
        :root {
          --emerald: #047857;
          --emerald-dark: #065f46;
          --gold: #F4D03F;
          --charcoal: #0F172A;
          --bg-deep: #020617;
          --offwhite: #F9FAFB;
          --muted: #9CA3AF;
        }

        body {
          margin: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
          background: radial-gradient(circle at top, #022c22 0, #020617 55%, #000000 100%);
          color: #E5E7EB;
        }

        .aid-explainer-page {
          min-height: 100vh;
        }

        .explainer-wrapper {
          max-width: 1040px;
          margin: 0 auto;
          padding: 28px 16px 96px;
        }

        .explainer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .explainer-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .brand-mark {
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          width: 38px;
          height: 38px;
          border-radius: 12px;
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
          font-size: 1rem;
          text-transform: uppercase;
        }

        .brand-tagline {
          font-size: 0.9rem;
          color: var(--muted);
        }

        .header-pill {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          padding: 8px 18px;
          font-size: 0.92rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(12px);
        }

        .header-pill-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 20%, #BBF7D0 0, #22C55E 40%, #166534 100%);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.7);
        }

        .page-title-block {
          margin-bottom: 16px;
        }

        .page-eyebrow {
          font-size: 0.92rem;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--muted);
          margin-bottom: 4px;
        }

        .page-title {
          font-size: clamp(2.2rem, 3.3vw, 2.9rem);
          letter-spacing: -0.04em;
          margin: 0 0 8px;
        }

        .page-title span {
          background: linear-gradient(120deg, #F4D03F, #F9A826);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .page-subtitle {
          font-size: 1.02rem;
          max-width: 670px;
          color: #CBD5F5;
        }

        .page-subtitle-quiet {
          font-size: 0.94rem;
          max-width: 650px;
          color: var(--muted);
          margin-top: 4px;
        }

        /* Industry selector */

        .industry-row {
          margin-top: 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }

        .industry-label {
          font-size: 0.92rem;
          color: var(--muted);
        }

        .industry-pills {
          display: inline-flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .industry-pill {
          padding: 6px 11px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.8);
          font-size: 0.86rem;
          background: rgba(15, 23, 42, 0.95);
          cursor: pointer;
          color: #E5E7EB;
        }

        .industry-pill--active {
          background: rgba(4, 120, 87, 0.9);
          border-color: #F4D03F;
          color: #ECFDF5;
        }

        .industry-helper {
          font-size: 0.86rem;
          color: #E5E7EB;
          margin-top: 4px;
        }

        /* Tier selector */

        .tier-selector {
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        @media (max-width: 900px) {
          .tier-selector {
            grid-template-columns: 1fr;
          }
        }

        .tier-pill {
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          background: rgba(15, 23, 42, 0.95);
          padding: 12px 13px 10px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, transform 0.12s ease;
        }

        .tier-pill-title {
          font-size: 1rem;
          font-weight: 600;
        }

        .tier-pill-sub {
          font-size: 0.9rem;
          color: var(--muted);
        }

        .tier-pill--active {
          border-color: #F4D03F;
          background: radial-gradient(circle at top left, rgba(4, 120, 87, 0.6), rgba(15, 23, 42, 0.98));
          box-shadow: 0 18px 40px rgba(4, 120, 87, 0.65);
          transform: translateY(-1px);
        }

        /* Section */

        .section {
          margin-top: 28px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .section-title {
          font-size: 1.26rem;
          font-weight: 600;
        }

        .section-tag {
          font-size: 0.84rem;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          color: var(--muted);
          white-space: nowrap;
        }

        .section-sub {
          font-size: 0.96rem;
          color: #CBD5F5;
          max-width: 740px;
        }

        .card {
          border-radius: 18px;
          padding: 16px;
          background: rgba(15, 23, 42, 0.97);
          border: 1px solid rgba(148, 163, 184, 0.7);
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.85);
        }

        .card-alt {
          background: radial-gradient(circle at top, rgba(24, 24, 27, 0.96), rgba(15, 23, 42, 0.98));
        }

        .card-title {
          font-size: 1.04rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .card-sub {
          font-size: 0.94rem;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .card-list {
          list-style: none;
          padding: 0;
          margin: 10px 0 0;
          display: grid;
          gap: 6px;
          font-size: 0.95rem;
        }

        .card-list li {
          padding-left: 16px;
          position: relative;
          color: #E5E7EB;
        }

        .card-list li::before {
          content: "•";
          position: absolute;
          left: 3px;
          top: 0;
          color: #F4D03F;
        }

        .inline-note {
          font-size: 0.84rem;
          color: var(--muted);
          margin-top: 8px;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
          gap: 18px;
          margin-top: 16px;
        }

        @media (max-width: 900px) {
          .pricing-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Diagrams */

        .diagram-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
          gap: 18px;
          margin-top: 20px;
        }

        @media (max-width: 900px) {
          .diagram-grid {
            grid-template-columns: 1fr;
          }
        }

        .diagram-card {
          border-radius: 18px;
          padding: 14px 14px 12px;
          background: radial-gradient(circle at top, rgba(4, 120, 87, 0.35), rgba(15, 23, 42, 0.96));
          border: 1px solid rgba(148, 163, 184, 0.6);
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.9);
        }

        .diagram-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .diagram-sub {
          font-size: 0.9rem;
          color: #E5E7EB;
          margin-bottom: 8px;
        }

        .diagram-flow {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .diagram-node {
          padding: 6px 9px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.98);
          border: 1px solid rgba(148, 163, 184, 0.65);
          font-size: 0.84rem;
          white-space: nowrap;
        }

        .diagram-arrow {
          font-size: 0.84rem;
          color: #9CA3AF;
          align-self: center;
        }

        .diagram-footnote {
          margin-top: 8px;
          font-size: 0.84rem;
          color: var(--muted);
        }

        /* ROI */

        .roi-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
          gap: 18px;
          margin-top: 14px;
        }

        @media (max-width: 900px) {
          .roi-grid {
            grid-template-columns: 1fr;
          }
        }

        .input-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        @media (max-width: 640px) {
          .input-grid {
            grid-template-columns: 1fr;
          }
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .field label {
          font-size: 0.88rem;
          color: #CBD5F5;
        }

        .field input {
          padding: 7px 9px;
          border-radius: 9px;
          border: 1px solid rgba(148, 163, 184, 0.8);
          background: rgba(15, 23, 42, 0.95);
          color: #E5E7EB;
          font-size: 0.94rem;
          outline: none;
        }

        .field input:focus {
          border-color: #047857;
          box-shadow: 0 0 0 1px rgba(4, 120, 87, 0.5);
        }

        .field small {
          font-size: 0.78rem;
          color: var(--muted);
        }

        .pill-toggle-group {
          display: inline-flex;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          overflow: hidden;
          font-size: 0.82rem;
        }

        .pill-toggle-btn {
          padding: 4px 9px;
          border: none;
          background: transparent;
          color: #9CA3AF;
          cursor: pointer;
        }

        .pill-toggle-btn--active {
          background: rgba(4, 120, 87, 0.85);
          color: #ECFDF5;
        }

        .roi-metrics {
          font-size: 0.9rem;
          display: grid;
          gap: 6px;
          margin-top: 8px;
        }

        .metric-label {
          color: var(--muted);
        }

        .metric-value {
          font-weight: 600;
        }

        .metric-highlight {
          color: #FACC15;
        }

        /* CTA footer */

        .cta-footer {
          margin-top: 32px;
          padding-top: 18px;
          border-top: 1px solid rgba(31, 41, 55, 0.8);
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
        }

        .cta-text {
          font-size: 0.98rem;
          color: #CBD5F5;
        }

        .cta-text span {
          color: #F4D03F;
          font-weight: 600;
        }

        .cta-note {
          font-size: 0.88rem;
          color: var(--muted);
        }
      `}</style>

      <div className="explainer-wrapper">
        {/* Header */}
        <header className="explainer-header">
          <div className="brand-mark">
            <div className="brand-logo" />
            <div className="brand-text">
              <div className="brand-name">ALL IN DIGITAL</div>
              <div className="brand-tagline">AI Phone, SMS & Landing Systems</div>
            </div>
          </div>
          <div className="header-pill">
            <div className="header-pill-dot" />
            <span>This is an overview page — not a pricing sheet.</span>
          </div>
        </header>

        {/* Intro */}
        <div className="page-title-block">
          <div className="page-eyebrow">AI SALES OPERATING SYSTEM</div>
          <h1 className="page-title">
            How the <span>AI call & SMS system</span> actually works.
          </h1>
          <p className="page-subtitle">
            Use this during our call. We&apos;re not talking about your investment yet —
            we&apos;re just mapping where your leads leak, how we fix it, and what that
            could mean for booked, showed, and closed deals.
          </p>
          <p className="page-subtitle-quiet">
            After we&apos;re done talking through this, we can decide together if it makes
            sense to plug this into your business and what the investment should be. For
            now, just follow along and picture your numbers.
          </p>
        </div>

        {/* Industry selector */}
        <div className="industry-row">
          <div className="industry-label">What kind of business are you running?</div>
          <div className="industry-pills">
            <button
              type="button"
              className={
                "industry-pill" + (industry === "medspa" ? " industry-pill--active" : "")
              }
              onClick={() => setIndustry("medspa")}
            >
              Med Spa / Dental
            </button>
            <button
              type="button"
              className={
                "industry-pill" + (industry === "home" ? " industry-pill--active" : "")
              }
              onClick={() => setIndustry("home")}
            >
              Home Services
            </button>
            <button
              type="button"
              className={
                "industry-pill" + (industry === "sales" ? " industry-pill--active" : "")
              }
              onClick={() => setIndustry("sales")}
            >
              Sales Teams
            </button>
            <button
              type="button"
              className={
                "industry-pill" + (industry === "other" ? " industry-pill--active" : "")
              }
              onClick={() => setIndustry("other")}
            >
              Other
            </button>
          </div>
          <div className="industry-helper">
            This framework is tuned for: <strong>{industryLabel}</strong>.
          </div>
        </div>

        {/* Tier selector (no pricing text) */}
        <div className="tier-selector">
          <button
            type="button"
            className={
              "tier-pill" + (openTier === "landing" ? " tier-pill--active" : "")
            }
            onClick={() => setOpenTier((prev) => (prev === "landing" ? null : "landing"))}
          >
            <div className="tier-pill-title">Phase 1 – Landing Foundation</div>
            <div className="tier-pill-sub">
              AI-ready landing, form, and consent so every lead can be called and texted.
            </div>
          </button>

          <button
            type="button"
            className={
              "tier-pill" + (openTier === "starter" ? " tier-pill--active" : "")
            }
            onClick={() => setOpenTier((prev) => (prev === "starter" ? null : "starter"))}
          >
            <div className="tier-pill-title">Phase 1 – AI Agent Starter</div>
            <div className="tier-pill-sub">
              One core agent, basic booking, plus modules for callbacks and follow-up.
            </div>
          </button>

          <button
            type="button"
            className={"tier-pill" + (openTier === "os" ? " tier-pill--active" : "")}
            onClick={() => setOpenTier((prev) => (prev === "os" ? null : "os"))}
          >
            <div className="tier-pill-title">Phase 2 & 3 – Full Operating System</div>
            <div className="tier-pill-sub">
              Full sales OS with NEPQ, no-show rescue, and pre-call training video.
            </div>
          </button>
        </div>

        {/* Speed-to-lead diagrams – always visible */}
        <section className="section">
          <div className="section-header">
            <div>
              <div className="section-title">The Speed-to-Lead Engine</div>
              <div className="section-sub">
                This is the backbone: answer fast, follow up longer than humans ever will,
                and anchor expectations so people show up ready to buy.
              </div>
            </div>
            <div className="section-tag">
              Goal: up to 8× more booked calls from the same leads
            </div>
          </div>

          <div className="diagram-grid">
            <div className="diagram-card">
              <div className="diagram-title">
                Inbound / New Lead Flow (first 5 minutes)
              </div>
              <div className="diagram-sub">
                Same structure whether the lead comes from a form, phone call, or referral.
              </div>
              <div className="diagram-flow">
                <div className="diagram-node">Lead hits landing page or calls in</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">Instant SMS in 5–10 seconds</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">First call at 15–20 seconds</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">Voicemail if no answer</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">Second call shortly after</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">Second voicemail (if no answer)</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">Follow-up SMS around minute 4</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">
                  10–15 touches in the first 24–48 hours
                </div>
              </div>
              <p className="diagram-footnote">
                Most teams hit a new lead once or twice at random times. The system is
                built to be ruthless about the first 4 minutes and intentional about the
                next 30–60 days.
              </p>
            </div>

            <div className="diagram-card">
              <div className="diagram-title">
                Booking Psychology, No-Show Fee & Pre-Call Training
              </div>
              <div className="diagram-sub">
                We use NEPQ-style language to not only book the appointment, but get them
                emotionally committed to showing up and making a decision.
              </div>
              <div className="diagram-flow">
                <div className="diagram-node">“What works best for you?”</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">
                  Offer Slot A / B from real availability (no fake scarcity)
                </div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">
                  Confirm date, time, and no-show / on-call fee
                </div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">
                  Send SMS confirmation + pre-call training video link
                </div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">
                  Reminder logic based on whether they watched the video
                </div>
              </div>
              <p className="diagram-footnote">
                The pre-call training video is where you explain how your process works,
                why it matters, and what happens if they don&apos;t show or answer when
                you&apos;re on your way or on the line.
              </p>
            </div>
          </div>
        </section>

        {/* Phase content: all explanation, no pricing */}
        {openTier === "landing" && (
          <section className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Phase 1 – Landing Page Foundation</div>
                <div className="section-sub">
                  This is where everything starts: a landing page and form that are built
                  for AI — not just “pretty design”.
                </div>
              </div>
              <div className="section-tag">Goal: clean, compliant lead intake</div>
            </div>

            <div className="pricing-grid">
              <div className="card">
                <div className="card-title">What’s Included</div>
                <div className="card-sub">
                  The entire point is to make sure every lead can legally be called and
                  texted, and that the info your AI needs is captured up front.
                </div>
                <ul className="card-list">
                  <li>
                    AI-ready landing layout tuned for mobile and “thumb-first”
                    conversions.
                  </li>
                  <li>TCPA/FCC-compliant language for calls and SMS.</li>
                  <li>
                    Form fields mapped to AI variables (name, phone, email, intent, pain,
                    location, etc.).
                  </li>
                  <li>
                    Optional integration to your CRM or a structured Google Sheet for
                    tracking.
                  </li>
                  <li>
                    Basic speed-to-lead wiring: when a form comes in, the AI and SMS know
                    what to do.
                  </li>
                </ul>
                <p className="inline-note">
                  When this is in place, every other phase (agents, callbacks, video) has a
                  strong foundation to plug into.
                </p>
              </div>

              <div className="card card-alt">
                <div className="card-title">Where This Fits in Your Business</div>
                <div className="card-sub">
                  Use Phase 1 whether you&apos;re running ads, buying leads, getting
                  referrals, or doing organic content.
                </div>
                <ul className="card-list">
                  <li>
                    At the very least, it replaces “random forms” with a true conversion
                    funnel.
                  </li>
                  <li>
                    You can keep running your current workflow and simply let the AI and
                    SMS follow up behind the scenes.
                  </li>
                  <li>
                    If you don&apos;t have a real landing or form yet, this becomes your
                    new starting point.
                  </li>
                  <li>
                    If you do, this becomes the version built specifically for AI calls and
                    compliance.
                  </li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {openTier === "starter" && (
          <section className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Phase 1 – AI Agent Starter</div>
                <div className="section-sub">
                  One core agent, smart booking, and clear upgrade paths once you see it
                  working on real calls.
                </div>
              </div>
              <div className="section-tag">Goal: get something live quickly</div>
            </div>

            <div className="pricing-grid">
              <div className="card">
                <div className="card-title">Core AI Agent</div>
                <div className="card-sub">
                  Your “Tessa-style” agent that answers calls, handles basic discovery, and
                  gets people booked.
                </div>
                <ul className="card-list">
                  <li>
                    One inbound AI agent with a calm, human-sounding script built around
                    NEPQ.
                  </li>
                  <li>
                    Basic FAQ ability from your existing website or a small custom FAQ
                    pack.
                  </li>
                  <li>
                    Basic booking via SMS link (“I just texted you a link to choose your
                    time”).
                  </li>
                  <li>
                    One main phone number, with options to route to you or your team when
                    needed.
                  </li>
                </ul>
                <p className="inline-note">
                  This is the simplest starting point: one agent, a calendar, and a clear
                  path to scale into callbacks and long-tail follow-up.
                </p>
              </div>

              <div className="card card-alt">
                <div className="card-title">
                  Callback & Follow-Up Workflow Modules (Optional)
                </div>
                <div className="card-sub">
                  These modules sit on top of the starter agent. You switch them on when
                  you want deeper coverage.
                </div>
                <ul className="card-list">
                  <li>
                    <strong>Callback logic</strong> – when someone asks for a callback,
                    they automatically get booked at a specific time or window.
                  </li>
                  <li>
                    <strong>Follow-up workflow</strong> – a structured sequence of calls
                    and SMS over 30–60 days for people who didn&apos;t book or didn&apos;t
                    answer.
                  </li>
                  <li>
                    Designed to support up to around 15 call attempts and 10–15 SMS without
                    feeling spammy.
                  </li>
                  <li>
                    Can be applied to new leads, old leads, and even past no-shows.
                  </li>
                </ul>
                <p className="inline-note">
                  Once you see the impact on booked calls, this is where you typically move
                  toward the full operating system.
                </p>
              </div>
            </div>
          </section>
        )}

        {openTier === "os" && (
          <section className="section">
            <div className="section-header">
              <div>
                <div className="section-title">
                  Phase 2 & 3 – Full AI Operating System
                </div>
                <div className="section-sub">
                  This is where we’re not just answering calls — we’re building a full
                  speed-to-lead, NEPQ, pre-call video, and no-show / “not here” rescue
                  system.
                </div>
              </div>
              <div className="section-tag">Goal: a real sales OS, not a single agent</div>
            </div>

            <div className="pricing-grid">
              <div className="card">
                <div className="card-title">Phase 2 – Full Sales OS</div>
                <div className="card-sub">
                  Everything needed around the call to turn leads into booked, showed, and
                  closed revenue.
                </div>
                <ul className="card-list">
                  <li>
                    Inbound & outbound NEPQ agents tuned for your offer and objections.
                  </li>
                  <li>
                    Speed-to-lead flows wired into your landing pages, forms, and inbound
                    calls.
                  </li>
                  <li>
                    Complex booking logic: A/B slot offers, fallback options, same-day and
                    future-day logic, and “read back” confirmation.
                  </li>
                  <li>
                    “Not here” and no-show agents that run rescue attempts and route notes
                    back to your reps.
                  </li>
                  <li>
                    Callback workflow for “call me later” and long-tail nurturing on leads
                    that don&apos;t book right away.
                  </li>
                  <li>
                    One pre-call training video that explains your process and anchors the
                    no-show / on-call fee.
                  </li>
                  <li>
                    Calendar syncing across your main sales calendar (plus callback
                    calendars if needed).
                  </li>
                </ul>
                <p className="inline-note">
                  Think of Phase 2 as “everything your best rep wishes you did around the
                  call” — scripted and automated.
                </p>
              </div>

              <div className="card card-alt">
                <div className="card-title">
                  Phase 3 – AI Custom Pre-Call Video Per Booking
                </div>
                <div className="card-sub">
                  Phase 3 adds a personalized video layer for each booked client, based on
                  what the agent learns on the call.
                </div>
                <ul className="card-list">
                  <li>
                    AI script and video tailored to each caller&apos;s situation, pain, and
                    desired outcome.
                  </li>
                  <li>
                    Unique link per booking, with tracking: who watched, how long they
                    watched, and how that ties into show and close.
                  </li>
                  <li>
                    Dynamic reminder logic: different follow-up if they did or didn&apos;t
                    watch their video.
                  </li>
                  <li>
                    Optional A/B testing: test short vs long versions, message angles, and
                    different positioning for different lead types.
                  </li>
                  <li>
                    Designed to feed more qualified, mentally committed people into your
                    calendar — not just more appointments.
                  </li>
                </ul>
                <p className="inline-note">
                  If Phase 2 is your sales OS, Phase 3 is the “custom video sales rep” that
                  sits in front of it and warms up every single call.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ROI / Impact calculator – focused on THEIR revenue, not your pricing */}
        <section className="section">
          <div className="section-header">
            <div>
              <div className="section-title">
                Impact Calculator – What This Could Mean for You
              </div>
              <div className="section-sub">
                Plug in rough numbers for your world. Ignore perfection. The idea is to see
                what happens if your booking, show, and close rates all move together.
              </div>
            </div>
            <div className="pill-toggle-group">
              <button
                type="button"
                className={
                  "pill-toggle-btn" +
                  (funnelMode === "inbound" ? " pill-toggle-btn--active" : "")
                }
                onClick={() => setFunnelMode("inbound")}
              >
                Inbound Funnel
              </button>
              <button
                type="button"
                className={
                  "pill-toggle-btn" +
                  (funnelMode === "outbound" ? " pill-toggle-btn--active" : "")
                }
                onClick={() => setFunnelMode("outbound")}
              >
                Outbound Funnel
              </button>
            </div>
          </div>

          <div className="roi-grid">
            <div className="card">
              <div className="card-title">
                Your Current {funnelMode === "inbound" ? "Inbound" : "Outbound"} Funnel
              </div>
              <div className="card-sub">
                Use rough monthly averages. Even ballpark numbers will show whether you’re
                leaking a little — or a lot.
              </div>

              <div className="input-grid">
                <div className="field">
                  <label>Leads / calls per month</label>
                  <input
                    type="number"
                    min={0}
                    value={leads}
                    onChange={(e) => setLeads(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Lead → Booked (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={bookRate}
                    onChange={(e) => setBookRate(e.target.value)}
                  />
                  <small>If 40 of 100 leads book, enter 40.</small>
                </div>
                <div className="field">
                  <label>Booked → Show (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={showRate}
                    onChange={(e) => setShowRate(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Show → Close (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={closeRate}
                    onChange={(e) => setCloseRate(e.target.value)}
                  />
                  <small>
                    For some medical/dental flows, this might actually be closer to 100.
                  </small>
                </div>
                <div className="field">
                  <label>Average ticket / deal size</label>
                  <input
                    type="number"
                    min={0}
                    value={avgTicket}
                    onChange={(e) => setAvgTicket(e.target.value)}
                  />
                  <small>Whatever “one sale” is worth to you.</small>
                </div>
              </div>

              <div className="roi-metrics">
                <div>
                  <span className="metric-label">Booked per month:</span>{" "}
                  <span className="metric-value">
                    {baselineBooked.toFixed(1)} appointments
                  </span>
                </div>
                <div>
                  <span className="metric-label">Shows per month:</span>{" "}
                  <span className="metric-value">
                    {baselineShows.toFixed(1)} kept appointments
                  </span>
                </div>
                <div>
                  <span className="metric-label">Sales per month:</span>{" "}
                  <span className="metric-value">
                    {baselineSales.toFixed(1)} closed deals
                  </span>
                </div>
                <div>
                  <span className="metric-label">Estimated monthly revenue now:</span>{" "}
                  <span className="metric-value">
                    {baselineRevenue > 0 ? `~$${formatCurrency(baselineRevenue)}` : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="card card-alt">
              <div className="card-title">
                With Full Speed-to-Lead + Follow-Up + Pre-Call System
              </div>
              <div className="card-sub">
                Here’s where you can play with what happens if we fix speed-to-lead, show
                rate, and close rate together.
              </div>

              <div className="input-grid">
                <div className="field">
                  <label>Speed-to-lead booking uplift (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={1500}
                    value={speedLift}
                    onChange={(e) => setSpeedLift(e.target.value)}
                  />
                  <small>
                    100 = keep bookings the same.
                    <br />
                    200 = roughly 2× your current bookings.
                    <br />
                    800 = extreme case (almost no one is being called fast enough now).
                  </small>
                </div>
                <div className="field">
                  <label>Lead → Booked drop (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={bookDrop}
                    onChange={(e) => setBookDrop(e.target.value)}
                  />
                  <small>Small drop from stronger qualifiers (often 5–10).</small>
                </div>
                <div className="field">
                  <label>Show rate uplift (points)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={showLift}
                    onChange={(e) => setShowLift(e.target.value)}
                  />
                  <small>
                    Example: 60 + 35 points = 95% show (pre-call video + no-show fee).
                  </small>
                </div>
                <div className="field">
                  <label>Close rate uplift (points)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={closeLift}
                    onChange={(e) => setCloseLift(e.target.value)}
                  />
                  <small>
                    Example: 25 + 25 points = 50% close when everything is dialed in.
                  </small>
                </div>
              </div>

              <div className="roi-metrics">
                <div>
                  <span className="metric-label">
                    Bookings with full system (after uplift + qualifiers):
                  </span>{" "}
                  <span className="metric-value">
                    {improvedBooked.toFixed(1)} appointments / month
                  </span>
                </div>
                <div>
                  <span className="metric-label">Shows with full system:</span>{" "}
                  <span className="metric-value">
                    {improvedShows.toFixed(1)} kept appointments / month
                  </span>
                </div>
                <div>
                  <span className="metric-label">Sales with full system:</span>{" "}
                  <span className="metric-value">
                    {improvedSales.toFixed(1)} closed deals / month
                  </span>
                </div>
                <div>
                  <span className="metric-label">Estimated monthly revenue:</span>{" "}
                  <span className="metric-value metric-highlight">
                    {improvedRevenue > 0 ? `~$${formatCurrency(improvedRevenue)}` : "—"}
                  </span>
                </div>
                <div>
                  <span className="metric-label">Extra revenue / month (same leads):</span>{" "}
                  <span className="metric-value metric-highlight">
                    {extraMonthlyRevenue > 0
                      ? `~$${formatCurrency(extraMonthlyRevenue)}`
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="metric-label">Extra revenue / year (same leads):</span>{" "}
                  <span className="metric-value metric-highlight">
                    {extraYearlyRevenue > 0
                      ? `~$${formatCurrency(extraYearlyRevenue)}`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="cta-footer">
            <div className="cta-text">
              On our call, we&apos;ll look at your real numbers and decide{" "}
              <span>whether the extra revenue</span> this creates justifies building the
              system — and how big or small it should start.
            </div>
            <div className="cta-note">
              No decisions from this page alone. This is just a shared scoreboard so we can
              think clearly together.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
