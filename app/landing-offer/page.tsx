"use client";

import { useState } from "react";

type TierKey = "landing" | "starter" | "os" | null;
type FunnelMode = "inbound" | "outbound";
type IndustryKey = "generic" | "medspa" | "home" | "sales" | "other";

export default function PricingPage() {
  const [openTier, setOpenTier] = useState<TierKey>("landing");
  const [funnelMode, setFunnelMode] = useState<FunnelMode>("inbound");
  const [industry, setIndustry] = useState<IndustryKey>("generic");

  // ROI calculator state
  const [leads, setLeads] = useState("200");
  const [bookRate, setBookRate] = useState("40"); // %
  const [showRate, setShowRate] = useState("60"); // %
  const [closeRate, setCloseRate] = useState("25"); // %
  const [avgTicket, setAvgTicket] = useState("1500");

  // Improvement assumptions
  const [bookDrop, setBookDrop] = useState("7"); // % drop from tighter qual / no-show policy
  const [speedLift, setSpeedLift] = useState("200"); // % uplift on booked (treated as multiplier: 200 = 2x)
  const [showLift, setShowLift] = useState("35"); // additive % points on show rate
  const [closeLift, setCloseLift] = useState("25"); // additive % points on close rate

  const parsedLeads = Number(leads) || 0;
  const parsedBookRate = Number(bookRate) || 0;
  const parsedShowRate = Number(showRate) || 0;
  const parsedCloseRate = Number(closeRate) || 0;
  const parsedAvgTicket = Number(avgTicket) || 0;

  const parsedBookDrop = Number(bookDrop) || 0;
  const parsedSpeedLift = Number(speedLift) || 0;
  const parsedShowLift = Number(showLift) || 0;
  const parsedCloseLift = Number(closeLift) || 0;

  // Baseline funnel
  const baselineBooked = parsedLeads * (parsedBookRate / 100);
  const baselineShows = baselineBooked * (parsedShowRate / 100);
  const baselineSales = baselineShows * (parsedCloseRate / 100);
  const baselineRevenue = baselineSales * parsedAvgTicket;

  // Improved funnel (with full SOP)
  // 1) Speed-to-lead uplift: treat as a MULTIPLIER on current booked
  //    Example: 200% = 2x, 800% = 8x
  // 2) Then apply a small drop from stronger qualification / no-show policy.
  const speedMultiplier = parsedSpeedLift / 100; // 200% -> 2.0
  const improvedBookedRaw =
    baselineBooked * speedMultiplier * (1 - parsedBookDrop / 100);

  // You can never book more appointments than leads
  const improvedBooked = Math.min(parsedLeads, Math.max(0, improvedBookedRaw));

  // Show & close “uplift” are treated as additive percentage points
  // Example: 60% + 35% = 95% show; 25% + 25% = 50% close
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

  const extraRevenue = Math.max(0, improvedRevenue - baselineRevenue);

  // Core SOP cost assumptions (Phase 2 baseline)
  const setupCost = 6200;
  const monthlyOpsCost = 1250;
  const monthsToPayback = extraRevenue > 0 ? setupCost / extraRevenue : Infinity;

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
    <main className="aid-pricing-page">
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

        .aid-pricing-page {
          min-height: 100vh;
        }

        .pricing-wrapper {
          max-width: 1040px;
          margin: 0 auto;
          padding: 28px 16px 96px;
        }

        .pricing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .pricing-header {
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

        .tier-pill-price {
          font-size: 0.88rem;
          color: #FACC15;
        }

        .tier-pill--active {
          border-color: #F4D03F;
          background: radial-gradient(circle at top left, rgba(4, 120, 87, 0.6), rgba(15, 23, 42, 0.98));
          box-shadow: 0 18px 40px rgba(4, 120, 87, 0.65);
          transform: translateY(-1px);
        }

        /* Sections */

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

        .card {
          border-radius: 18px;
          padding: 16px 16px 14px;
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

        .price-main {
          font-size: 1.44rem;
          font-weight: 700;
        }

        .price-subline {
          font-size: 0.94rem;
          color: var(--muted);
        }

        .inline-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          font-size: 0.84rem;
          color: var(--muted);
          margin-top: 8px;
        }

        .inline-badge span {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #4ADE80;
          box-shadow: 0 0 8px rgba(74, 222, 128, 0.8);
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

        /* Tables */

        .price-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          margin-top: 6px;
        }

        .price-table thead {
          background: rgba(15, 23, 42, 0.9);
        }

        .price-table th,
        .price-table td {
          padding: 7px 8px;
          border-bottom: 1px solid rgba(31, 41, 55, 0.8);
          text-align: left;
        }

        .price-table th {
          font-weight: 600;
          font-size: 0.84rem;
          color: #9CA3AF;
        }

        .price-table tr:last-child td {
          border-bottom: none;
        }

        /* Pill callouts */

        .callout-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
          align-items: center;
        }

        .callout-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          background: rgba(15, 23, 42, 0.75);
          font-size: 0.86rem;
          color: #E5E7EB;
        }

        .callout-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 20%, #BBF7D0 0, #22C55E 40%, #166534 100%);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.7);
        }

        .callout-dot-gold {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 20%, #FDE68A 0, #F4D03F 45%, #B45309 100%);
          box-shadow: 0 0 10px rgba(244, 208, 63, 0.55);
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

        .metric-danger {
          color: #f87171;
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

        .cta-link-btn {
          border-radius: 999px;
          border: none;
          padding: 9px 16px;
          font-size: 0.96rem;
          font-weight: 600;
          background: linear-gradient(135deg, #047857, #22C55E);
          color: #ECFDF5;
          cursor: pointer;
          box-shadow: 0 14px 36px rgba(16, 185, 129, 0.55);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .cta-link-btn span {
          font-size: 1.1rem;
        }
      `}</style>

      <div className="pricing-wrapper">
        {/* Header */}
        <header className="pricing-header">
          <div className="brand-mark">
            <div className="brand-logo" />
            <div className="brand-text">
              <div className="brand-name">ALL IN DIGITAL</div>
              <div className="brand-tagline">AI Phone, SMS & Landing Systems</div>
            </div>
          </div>
          <div className="header-pill">
            <div className="header-pill-dot" />
            <span>From first click to funded, show-ready consults.</span>
          </div>
        </header>

        {/* Intro */}
        <div className="page-title-block">
          <div className="page-eyebrow">Pricing & Systems</div>
          <h1 className="page-title">
            From <span>basic AI reception</span> to a full sales operating system.
          </h1>
          <p className="page-subtitle">
            Start with a single AI agent and one landing page, or roll into a complete
            end-to-end SOP with booking psychology, pre-call video, sales, finance, and
            dispatch — all wired around speed-to-lead.
          </p>
        </div>

        {/* Industry selector */}
        <div className="industry-row">
          <div className="industry-label">Which best describes your business?</div>
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
            Optimized for: <strong>{industryLabel}</strong>.
          </div>
        </div>

        {/* Tier selector – Phase ladder */}
        <div className="tier-selector">
          <button
            type="button"
            className={"tier-pill" + (openTier === "landing" ? " tier-pill--active" : "")}
            onClick={() => setOpenTier((prev) => (prev === "landing" ? null : "landing"))}
          >
            <div className="tier-pill-title">Phase 1 – Landing Page Foundation</div>
            <div className="tier-pill-sub">
              Buy 1, get 2 high-converting funnels built for speed-to-lead.
            </div>
            <div className="tier-pill-price">$2,600 + $197/mo + $98/additional page</div>
          </button>

          <button
            type="button"
            className={"tier-pill" + (openTier === "starter" ? " tier-pill--active" : "")}
            onClick={() => setOpenTier((prev) => (prev === "starter" ? null : "starter"))}
          >
            <div className="tier-pill-title">Phase 1 – AI Agent Starter</div>
            <div className="tier-pill-sub">
              One inbound agent, basic booking, and module-based upgrades.
            </div>
            <div className="tier-pill-price">$35 activation + usage plans + add-ons</div>
          </button>

          <button
            type="button"
            className={"tier-pill" + (openTier === "os" ? " tier-pill--active" : "")}
            onClick={() => setOpenTier((prev) => (prev === "os" ? null : "os"))}
          >
            <div className="tier-pill-title">Phase 2 & 3 – Full Operating System</div>
            <div className="tier-pill-sub">
              Phase 2: Full Sales OS • Phase 3: OS + personalized pre-call video.
            </div>
            <div className="tier-pill-price">From $6,200–$13,500 build-out + $1,250/mo</div>
          </button>
        </div>

        {/* Speed-to-lead diagrams – always visible */}
        <section className="section">
          <div className="section-header">
            <div>
              <div className="section-title">Speed-to-Lead & Booking Psychology</div>
              <div className="section-sub">
                This is the core SOP we build around every system: answer fast, book
                cleanly, anchor the no-show fee, and send a pre-call video that raises your
                closing rate.
              </div>
            </div>
          </div>

          <div className="diagram-grid">
            <div className="diagram-card">
              <div className="diagram-title">
                Speed-to-Lead Sequence (up to 800% more bookings)
              </div>
              <div className="diagram-sub">
                Both inbound and outbound flows run on the same spine. Humans won&apos;t
                run this rhythm perfectly; the AI will.
              </div>
              <div className="diagram-flow">
                <div className="diagram-node">Lead hits landing page</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">SMS in 5–10 seconds</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">First call at 15–20 seconds</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">Leave voicemail if no answer</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">Second call shortly after</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">Second voicemail (if no answer)</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">Follow-up SMS at 4 minutes</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">
                  15–30 call attempts & 10–15 SMS over 30–60 days
                </div>
              </div>
              <p className="diagram-footnote">
                Most teams touch a lead once or twice. This SOP keeps leads alive for 30–60
                days without burning out your staff.
              </p>
            </div>

            <div className="diagram-card">
              <div className="diagram-title">
                Booking Psychology: “What works best for you?”
              </div>
              <div className="diagram-sub">
                Intent-based booking, clean A/B options, and a $100 no-show fee anchored
                in the script and the pre-call video.
              </div>
              <div className="diagram-flow">
                <div className="diagram-node">“What works best for you?”</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">
                  Scan calendar from today forward (no backtracking)
                </div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">
                  Offer Slot A/B (e.g. Mon Dec 8, 9am or 11am)
                </div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">
                  Confirm time + anchor no-show fee (e.g. $100)
                </div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">Send SMS confirmation + pre-call video</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">
                  SMS fallback link + “read back what you booked”
                </div>
              </div>
              <p className="diagram-footnote">
                The no-show fee SOP is a free takeaway you get from working with us. The AI
                says it 100% of the time; human teams don&apos;t — and your show rate pays
                for that inconsistency.
              </p>
            </div>
          </div>
        </section>

        {/* Landing package – Phase 1 */}
        {openTier === "landing" && (
          <section className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Phase 1 – Landing Page Foundation</div>
                <div className="section-sub">
                  Built specifically for AI calling and compliance — not just a “pretty
                  site”. This is where the speed-to-lead SOP starts.
                </div>
              </div>
              <div className="section-tag">Buy 1, get 2 live funnels</div>
            </div>

            <div className="pricing-grid">
              <div className="card">
                <div className="card-title">Landing Page Package</div>
                <div className="card-sub">
                  Designed around your AI calling flows, TCPA/FCC compliance, and call
                  outcomes.
                </div>
                <div className="price-main">$2,600</div>
                <div className="price-subline">Buy 1, get 2 live landing pages</div>

                <ul className="card-list">
                  <li>Conversion-optimized, AI-ready landing layout.</li>
                  <li>
                    Built-in TCPA/FCC-compliant consent language for calls &amp; SMS sent
                    by AI systems.
                  </li>
                  <li>Speed-to-lead wiring for form → SMS → calls.</li>
                  <li>Form fields mapped to AI agent variables and (optionally) your CRM.</li>
                  <li>
                    Brand and offer positioning tailored to <strong>{industryLabel}</strong>.
                  </li>
                </ul>

                <div className="inline-badge">
                  <span />
                  Hosted &amp; managed on our stack – no extra “tech ops” needed.
                </div>
              </div>

              <div className="card card-alt">
                <div className="card-title">Ongoing Landing Management</div>
                <div className="card-sub">
                  We keep the pages live, fast, and aligned as your offer and AI flows
                  evolve.
                </div>
                <div className="price-main">$197/mo</div>
                <div className="price-subline">First landing page</div>
                <div className="price-subline">+$98/mo per additional page</div>

                <ul className="card-list">
                  <li>Hosting, monitoring, and speed checks.</li>
                  <li>Minor copy/layout tweaks as you refine your offer.</li>
                  <li>Lead routing and outcome updates to your sheets/CRM.</li>
                  <li>Ready to plug into more advanced agents as you upgrade.</li>
                </ul>

                <div className="inline-note">
                  If you need funding for setup, we can point you to third-party funding
                  tools (e.g. finance marketplaces like Fiona) to keep cash flow smooth.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Starter AI agent & modules – Phase 1 */}
        {openTier === "starter" && (
          <section className="section">
            <div className="section-header">
              <div>
                <div className="section-title">
                  Phase 1 – AI Agent Starter &amp; Core Modules
                </div>
                <div className="section-sub">
                  Get something live fast, then bolt on higher-performing booking and
                  follow-up modules as you go.
                </div>
              </div>
              <div className="section-tag">Great for 30–100 calls/month</div>
            </div>

            {/* Core starter + Callback + Follow-Up */}
            <div className="pricing-grid">
              <div className="card">
                <div className="card-title">Phase 1 – AI Agent Starter</div>
                <div className="card-sub">
                  One inbound agent, basic booking via SMS link, and a clear path to
                  upgrade later.
                </div>
                <ul className="card-list">
                  <li>
                    <strong>$35 Activation Fee</strong> — 1 inbound basic AI agent, basic
                    FAQ (your website as knowledge base), basic calendar via SMS link, and
                    1 phone number included.
                  </li>
                  <li>
                    <strong>$80 – Call Transfer Setup (per destination)</strong> — AI →
                    warm transfer to owner cell, sales line, office, etc.
                  </li>
                  <li>
                    <strong>$80 – Additional Calendar SMS Link Setup (per link)</strong>{" "}
                    — different “send calendar link by SMS” flows (e.g. new lead vs
                    reschedule vs special offer).
                  </li>
                  <li>
                    <strong>$265 – Additional Basic AI Agent</strong> (inbound or outbound)
                    — extra simple intake, customer service, or SMS booking agents.
                  </li>
                  <li>
                    <strong>Basic FAQ</strong> = linking your existing website.
                  </li>
                  <li>
                    <strong>Custom FAQ Pack (20 Qs) – $125 one-time</strong> — written and
                    tuned for your agent.
                  </li>
                  <li>
                    <strong>FCC/TCPA Outbound Compliance – $350/mo</strong> when you&apos;re
                    running outbound without using our compliant landing pages.
                  </li>
                </ul>

                <div className="inline-note">
                  Lightest version: landing page + activation + a small SMS &amp; credits
                  pack — perfect if you&apos;re doing ±50 appointments per month.
                </div>
              </div>

              <div className="card card-alt">
                <div className="card-title">
                  Callback + Follow-Up Workflow Automation (Nurturing)
                </div>
                <div className="card-sub">
                  Callback logic + long-tail nurturing sequence (what most people think of
                  as the “nurturing agent”).
                </div>
                <div className="price-main">$1,700</div>
                <div className="price-subline">One-time build</div>
                <div className="price-subline">$197/mo automation &amp; maintenance</div>

                <ul className="card-list">
                  <li>
                    <strong>Callback Agent</strong> — triggered when a caller requests a
                    callback; books a follow-up: ~10 minutes later, ~3 hours later, or at a
                    specific time the caller requests.
                  </li>
                  <li>
                    Automatically <strong>triggers your outbound NEPQ agent</strong> of
                    choice to make the follow-up call at that time.
                  </li>
                  <li>
                    <strong>Follow-Up Workflow Sequence</strong> — 30 calls + 15 SMS over
                    the next 30–60 days, designed to layer on top of the Speed-to-Lead SOP.
                  </li>
                  <li>
                    Fully FCC/TCPA regulated: 8:00 am – 8:00 pm, no Sundays, no federal
                    holidays.
                  </li>
                  <li>
                    <strong>$197/mo</strong> required for automation cost &amp; ongoing
                    maintenance.
                  </li>
                </ul>
              </div>
            </div>

            {/* NEPQ / complex booking modules */}
            <div className="pricing-grid">
              <div className="card">
                <div className="card-title">NEPQ Agent + Speed-to-Lead Flow</div>
                <div className="card-sub">
                  Your core NEPQ inbound + outbound booking engine wrapped around the
                  Speed-to-Lead SOP and complex slot logic.
                </div>
                <div className="price-main">$2,600</div>
                <div className="price-subline">One-time build</div>
                <div className="price-subline">$497/mo maintenance + weekly A/B testing</div>

                <ul className="card-list">
                  <li>1 Outbound NEPQ Agent + 1 Inbound NEPQ Agent.</li>
                  <li>
                    Speed-to-Lead workflow automation — built to support up to ~800% lift
                    in booked appointments when implemented correctly.
                  </li>
                  <li>
                    Complex booking logic: Slot A / Slot B offer → fallback path offering C
                    and D → E / F / G on a day the caller chooses.
                  </li>
                  <li>
                    Appointment is <strong>only</strong> scheduled if they commit to
                    watching the training video and respecting the no-show policy.
                  </li>
                  <li>
                    <strong>1 calendar sync included</strong> (Google Calendar or
                    GoHighLevel).
                  </li>
                  <li>
                    Extras for this module: <strong>$350 per additional calendar sync</strong>{" "}
                    (one time per calendar), <strong>$350</strong> reschedule appointment
                    logic, <strong>$350</strong> cancel appointment logic.
                  </li>
                  <li>
                    Includes up to <strong>2 phone numbers</strong>; each additional number
                    is <strong>$10/month</strong>.
                  </li>
                </ul>
              </div>

              <div className="card card-alt">
                <div className="card-title">
                  Non-NEPQ Complex Booking Logic (No NEPQ Script)
                </div>
                <div className="card-sub">
                  For clients who want complex booking and calendar logic, but not the full
                  NEPQ discovery script.
                </div>
                <div className="price-main">$2,600</div>
                <div className="price-subline">One-time build</div>
                <div className="price-subline">$197/mo workflows &amp; maintenance</div>

                <ul className="card-list">
                  <li>Complex booking script &amp; routing logic (slot-based offers, rules, routing).</li>
                  <li>Reschedule appointment logic included.</li>
                  <li>Cancel appointment logic included.</li>
                  <li><strong>2 calendar syncs included</strong> out of the box.</li>
                  <li>
                    Up to <strong>2 phone numbers</strong> included; each additional number:
                    <strong> $10/month</strong>.
                  </li>
                  <li>
                    <strong>$350</strong> per additional calendar sync beyond the first 2.
                  </li>
                  <li>
                    Optional A/B testing: add <strong>$397/month</strong> if conversion
                    optimization matters to them.
                  </li>
                </ul>
              </div>
            </div>

            {/* Add-ons + Not Here / No-Show */}
            <div className="pricing-grid">
              <div className="card">
                <div className="card-title">Add-Ons &amp; Integrations</div>
                <div className="card-sub">
                  These are the little switches that make the whole system feel custom to
                  your operation.
                </div>
                <ul className="card-list">
                  <li>
                    <strong>$80 – Call Transfer Setup</strong> (per destination, one time)
                    – configure AI → human warm transfer routing.
                  </li>
                  <li>
                    <strong>$80 – Additional Calendar SMS Link Setup</strong> (per link,
                    one time) – additional “send calendar link by SMS” flows with the
                    correct logic and URL.
                  </li>
                  <li>
                    <strong>$265 – Additional Basic AI Agent</strong> (inbound or outbound,
                    one time) – extra basic agents with FAQ + SMS calendar link logic.
                  </li>
                  <li>
                    <strong>$10/month – Per Additional Phone Number</strong> – each extra number
                    (locations, languages, campaigns).
                  </li>
                  <li><strong>$350 – Reschedule Appointment Logic</strong> (one time).</li>
                  <li><strong>$350 – Cancel Appointment Logic</strong> (one time).</li>
                  <li>
                    <strong>$350 – Per Additional Calendar Sync</strong> (one time per calendar).
                  </li>
                  <li><strong>$35 – Per Automation Setup</strong> — one-time wiring of specific flows.</li>
                  <li>
                    <strong>$170 setup + $17/month + $350 one-time CRM integration</strong> — shared Google Sheet
                    capturing webform + outcomes.
                  </li>
                  <li><strong>$50 – After-Hours Routing</strong> — different flows nights &amp; weekends.</li>
                  <li>
                    <strong>$150–$300 – Multi-Agent Routing</strong> — route between multiple AI agents based on
                    intent, campaign, or time of day.
                  </li>
                </ul>
              </div>

              <div className="card card-alt">
                <div className="card-title">“Not Here” Agent + No-Show Workflow Automation</div>
                <div className="card-sub">
                  Protect every appointment where reps are already in motion — whether the client isn&apos;t
                  on the call, isn&apos;t home, or simply doesn&apos;t show.
                </div>
                <div className="price-main">$1,700</div>
                <div className="price-subline">One-time build</div>
                <div className="price-subline">$497/mo maintenance + A/B testing</div>

                <ul className="card-list">
                  <li>
                    <strong>“Not Here” Agent</strong> – triggered when a rep marks a client as “not on call,”
                    “not home,” etc., and attempts recovery while the rep is physically there or ready.
                  </li>
                  <li><strong>No-Show Agent</strong> – triggered by no-show outcomes via workflow rules.</li>
                  <li>
                    Outbound workflow sequence: <strong>30 outbound call triggers</strong> +{" "}
                    <strong>15 SMS triggers</strong> over the next 30 days.
                  </li>
                  <li>Fully FCC/TCPA regulated: 8:00 am – 8:00 pm, no Sundays, no federal holidays.</li>
                  <li><strong>$497/month</strong> required for maintenance and ongoing A/B testing.</li>
                </ul>
              </div>
            </div>

            {/* Usage plans: SMS + Voice (UPDATED) */}
            <div className="pricing-grid">
              <div className="card">
                <div className="card-title">SMS Plans (Monthly)</div>
                <div className="card-sub">
                  Credit-based SMS packs with optional auto-renew so you&apos;re never surprised by the bill.
                </div>
                <table className="price-table">
                  <thead>
                    <tr>
                      <th>Monthly charge</th>
                      <th>SMS credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>$3.50</td><td>80</td></tr>
                    <tr><td>$8.00</td><td>250</td></tr>
                    <tr><td>$17.00</td><td>600</td></tr>
                    <tr><td>$26.00</td><td>1,200</td></tr>
                    <tr><td>$44.00</td><td>2,500</td></tr>
                    <tr><td>$98.00</td><td>6,000</td></tr>
                  </tbody>
                </table>
                <div className="inline-note">
                  1 SMS credit covers 1 text segment: up to 160 standard characters. If a message is longer,
                  it may use 2+ credits. Messages with emojis or special characters may use around 70 characters per credit.
                </div>
                <div className="inline-note">
                  Optional: 28% auto-renew discount when your balance hits 10 SMS credits (automatic top-up).
                </div>
              </div>

              <div className="card card-alt">
                <div className="card-title">AI Voice Credits (Auto-Refill)</div>
                <div className="card-sub">
                  One wallet. CORE uses <strong>1 credit</strong> per minute. If a call ever touches BEAST,
                  the entire call consumes credits at <strong>2.5×</strong>.
                </div>

                <div className="callout-row">
                  <div className="callout-pill"><span className="callout-dot" /> Auto refill when <strong>20 credits</strong> remain</div>
                  <div className="callout-pill"><span className="callout-dot-gold" /> Credits never expire (while active)</div>
                </div>

                <table className="price-table" style={{ marginTop: 10 }}>
                  <thead>
                    <tr>
                      <th>Charge</th>
                      <th>Core Credits</th>
                      <th>Beast Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>$35.00</td>
                      <td>80</td>
                      <td>32</td>
                    </tr>
                    <tr>
                      <td>$62.00</td>
                      <td>170</td>
                      <td>68</td>
                    </tr>
                    <tr>
                      <td>$80.00</td>
                      <td>260</td>
                      <td>104</td>
                    </tr>
                    <tr>
                      <td>$98.00</td>
                      <td>350</td>
                      <td>140</td>
                    </tr>
                    <tr>
                      <td>$197.00</td>
                      <td>800</td>
                      <td>320</td>
                    </tr>
                  </tbody>
                </table>

                <div className="inline-note">
                  <strong>CORE</strong> = lower-cost LLM mode for most workflows.{" "}
                  <strong>BEAST</strong> = higher-end LLM mode for deeper reasoning and more complex flows.
                </div>
                <div className="inline-note">
                  *Beast Credits shown are the equivalent wallet value when billed at <strong>2.5×</strong>{" "}
                  (example: 80 Core Credits = 32 Beast Credits).
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Phase 2 & 3 – OS + Video */}
        {openTier === "os" && (
          <section className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Phase 2 &amp; 3 – Full AI Operating Systems</div>
                <div className="section-sub">
                  Phase 2 is your “Full Sales OS” starting stack. Phase 3 adds a personalized AI pre-call video layer on top of everything, per booking.
                </div>
              </div>
              <div className="section-tag">Both anchored at $1,250/mo</div>
            </div>

            <div className="pricing-grid">
              {/* Phase 2 bundle */}
              <div className="card">
                <div className="card-title">Phase 2 – “Full Sales OS” Stack (Starting Point Bundle)</div>
                <div className="card-sub">
                  NEPQ + Speed-to-Lead + “Not Here / No-Show” + Callback / Follow-Up + Pre-Call Training Video.
                </div>
                <div className="price-main">$6,200</div>
                <div className="price-subline">One-time core build</div>
                <div className="price-subline">$7,280 with tracking add-on (unique links + tracking)</div>
                <div className="price-subline">$1,250/mo typical OS retainer</div>

                <ul className="card-list">
                  <li>1 Outbound NEPQ Agent + 1 Inbound NEPQ Agent.</li>
                  <li>Speed-to-Lead workflow (first 5 minutes of new lead intake) across phone + SMS.</li>
                  <li>Complex booking logic: Slot A/B offers → C/D fallback → E/F/G options + SMS fallback.</li>
                  <li>“Not Here” Agent + No-Show workflow: 30 calls + 15 SMS over 30 days.</li>
                  <li>Callback Agent + Follow-Up workflow: 30 calls + 15 SMS over 30–60 days.</li>
                  <li>1 Pre-Call Training Video (≈5 minutes / ~10 slides) sent to all bookings.</li>
                </ul>
              </div>

              {/* Phase 3 bundle */}
              <div className="card card-alt">
                <div className="card-title">Phase 3 – Everything + Personalized Pre-Call Video Per Booking</div>
                <div className="card-sub">
                  Full NEPQ OS plus AI custom pre-call video generated for each booked appointment, with deep tracking and cancellation protection.
                </div>
                <div className="price-main">$13,500</div>
                <div className="price-subline">One-time build (includes everything from Phase 2)</div>
                <div className="price-subline">$1,250/mo ongoing optimization</div>

                <ul className="card-list">
                  <li>Everything in Phase 2 included.</li>
                  <li>AI Custom Pre-Call Video per booked appointment.</li>
                  <li>Tracking layer: unique link per caller, view-through tracking, behavior-based SMS logic.</li>
                  <li>Includes reschedule/cancel logic (scoped per build).</li>
                </ul>
              </div>
            </div>

            {/* ROI Calculator – tied to Phase 2 baseline */}
            <section className="section">
              <div className="section-header">
                <div>
                  <div className="section-title">ROI &amp; Payback Calculator</div>
                  <div className="section-sub">
                    Plug in your own leads, booking, show rate, close rate, and average ticket. See what the full SOP could generate — and how fast the{" "}
                    <strong>$6,200</strong> Phase 2 build with a <strong>$1,250/mo</strong> OS retainer can pay for itself.
                  </div>
                </div>
                <div className="pill-toggle-group">
                  <button
                    type="button"
                    className={
                      "pill-toggle-btn" + (funnelMode === "inbound" ? " pill-toggle-btn--active" : "")
                    }
                    onClick={() => setFunnelMode("inbound")}
                  >
                    Inbound Funnel
                  </button>
                  <button
                    type="button"
                    className={
                      "pill-toggle-btn" + (funnelMode === "outbound" ? " pill-toggle-btn--active" : "")
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
                    This doesn&apos;t need to be perfect — estimates are enough to see the gap.
                  </div>

                  <div className="input-grid">
                    <div className="field">
                      <label>Monthly leads / inbound calls</label>
                      <input
                        type="number"
                        min={0}
                        value={leads}
                        onChange={(e) => setLeads(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Lead → Booked ratio (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={bookRate}
                        onChange={(e) => setBookRate(e.target.value)}
                      />
                      <small>
                        If 40 of 100 leads book, enter <strong>40</strong>.
                      </small>
                    </div>
                    <div className="field">
                      <label>Booked → Show ratio (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={showRate}
                        onChange={(e) => setShowRate(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Show → Close ratio (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={closeRate}
                        onChange={(e) => setCloseRate(e.target.value)}
                      />
                      <small>
                        In some medical/dental flows this can be closer to <strong>100%</strong>.
                      </small>
                    </div>
                    <div className="field">
                      <label>Average ticket / deal size ($)</label>
                      <input
                        type="number"
                        min={0}
                        value={avgTicket}
                        onChange={(e) => setAvgTicket(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="inline-note" style={{ marginTop: 10 }}>
                    This is what you&apos;re doing today with the leads you already have.
                  </div>

                  <div className="roi-metrics">
                    <div>
                      <span className="metric-label">Booked per month:</span>{" "}
                      <span className="metric-value">{baselineBooked.toFixed(1)} bookings</span>
                    </div>
                    <div>
                      <span className="metric-label">Shows per month:</span>{" "}
                      <span className="metric-value">{baselineShows.toFixed(1)} kept appointments</span>
                    </div>
                    <div>
                      <span className="metric-label">Sales per month:</span>{" "}
                      <span className="metric-value">{baselineSales.toFixed(1)} closed deals</span>
                    </div>
                    <div>
                      <span className="metric-label">Est. monthly revenue now:</span>{" "}
                      <span className="metric-value">${formatCurrency(baselineRevenue)}</span>
                    </div>
                  </div>
                </div>

                <div className="card card-alt">
                  <div className="card-title">With Full SOP Installed (Phase 2+)</div>
                  <div className="card-sub">
                    Speed-to-lead and long-tail follow-up multiply your booked calls, then the no-show policy and better framing lift show and close.
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
                        100 = no change. 200 = 2x your current bookings. 800 = 8x.
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
                      <small>We usually see a 5–10% drop from stronger qualifiers.</small>
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
                      <small>Treated as additive. Example: 60% + 35 points = 95% show.</small>
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
                      <small>Example: 25% + 25 points = 50% close.</small>
                    </div>
                  </div>

                  <div className="roi-metrics">
                    <div>
                      <span className="metric-label">Bookings with SOP:</span>{" "}
                      <span className="metric-value">{improvedBooked.toFixed(1)} / month</span>
                    </div>
                    <div>
                      <span className="metric-label">Shows with SOP:</span>{" "}
                      <span className="metric-value">{improvedShows.toFixed(1)} / month</span>
                    </div>
                    <div>
                      <span className="metric-label">Sales with SOP:</span>{" "}
                      <span className="metric-value">{improvedSales.toFixed(1)} / month</span>
                    </div>
                    <div>
                      <span className="metric-label">Est. monthly revenue with SOP:</span>{" "}
                      <span className="metric-value metric-highlight">
                        ${formatCurrency(improvedRevenue)}
                      </span>
                    </div>
                    <div>
                      <span className="metric-label">Extra revenue / month:</span>{" "}
                      <span className="metric-value metric-highlight">
                        ${formatCurrency(extraRevenue)}
                      </span>
                    </div>
                    <div>
                      <span className="metric-label">Months to recover $6,200 setup:</span>{" "}
                      <span
                        className={
                          "metric-value " +
                          (monthsToPayback === Infinity ? "metric-danger" : "metric-highlight")
                        }
                      >
                        {monthsToPayback === Infinity
                          ? "N/A (increase your inputs)"
                          : `${formatCurrencyWithDecimals(monthsToPayback)} months`}
                      </span>
                    </div>
                    {extraRevenue > 0 && (
                      <div>
                        <span className="metric-label">
                          Months until SOP + $1,250/mo is fully covered:
                        </span>{" "}
                        <span className="metric-value metric-highlight">
                          {formatCurrencyWithDecimals((setupCost + monthlyOpsCost * 6) / extraRevenue)} months
                          (assuming 6 months of ops)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="cta-footer">
                <div className="cta-text">
                  When the <span>extra monthly revenue</span> is bigger than <span>$1,250</span>, the OS is designed to pay for itself — and then some.
                </div>
                <a href="tel:+12396880201" className="cta-link-btn">
                  Talk through your numbers <span>↗</span>
                </a>
              </div>
            </section>
          </section>
        )}
      </div>
    </main>
  );
}
