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
  const [bookDrop, setBookDrop] = useState("7"); // 5–10% drop
  const [showLift, setShowLift] = useState("35"); // 20–60% lift
  const [closeLift, setCloseLift] = useState("25"); // 20–40% lift

  const parsedLeads = Number(leads) || 0;
  const parsedBookRate = Number(bookRate) || 0;
  const parsedShowRate = Number(showRate) || 0;
  const parsedCloseRate = Number(closeRate) || 0;
  const parsedAvgTicket = Number(avgTicket) || 0;

  const parsedBookDrop = Number(bookDrop) || 0;
  const parsedShowLift = Number(showLift) || 0;
  const parsedCloseLift = Number(closeLift) || 0;

  // Baseline funnel
  const baselineBooked = parsedLeads * (parsedBookRate / 100);
  const baselineShows = baselineBooked * (parsedShowRate / 100);
  const baselineSales = baselineShows * (parsedCloseRate / 100);
  const baselineRevenue = baselineSales * parsedAvgTicket;

  // Improved funnel (with full SOP)
  const improvedBookRate = parsedBookRate * (1 - parsedBookDrop / 100);
  const improvedShowRate = parsedShowRate * (1 + parsedShowLift / 100);
  const improvedCloseRate = parsedCloseRate * (1 + parsedCloseLift / 100);

  const improvedBooked = parsedLeads * (improvedBookRate / 100);
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

        /* Accordions / OS tiers */

        .accordion {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }

        .accordion-item {
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.55);
          background: rgba(15, 23, 42, 0.96);
          overflow: hidden;
        }

        .accordion-header-btn {
          width: 100%;
          border: none;
          background: transparent;
          padding: 10px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          color: #E5E7EB;
        }

        .accordion-header-main {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: left;
        }

        .accordion-label {
          font-size: 0.94rem;
          font-weight: 600;
        }

        .accordion-price {
          font-size: 0.88rem;
          color: #FACC15;
        }

        .accordion-chevron {
          font-size: 1rem;
          opacity: 0.7;
        }

        .accordion-body {
          padding: 0 12px 10px;
          border-top: 1px solid rgba(30, 64, 175, 0.3);
          font-size: 0.9rem;
        }

        .accordion-body p {
          margin: 8px 0;
          color: #CBD5F5;
        }

        .accordion-list {
          list-style: none;
          padding: 0;
          margin: 6px 0 0;
          display: grid;
          gap: 4px;
        }

        .accordion-list li {
          padding-left: 16px;
          position: relative;
          color: #E5E7EB;
          font-size: 0.9rem;
        }

        .accordion-list li::before {
          content: "•";
          position: absolute;
          left: 3px;
          top: 0;
          color: #F4D03F;
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
            className={
              "tier-pill" + (openTier === "landing" ? " tier-pill--active" : "")
            }
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
            className={
              "tier-pill" + (openTier === "starter" ? " tier-pill--active" : "")
            }
            onClick={() => setOpenTier((prev) => (prev === "starter" ? null : "starter"))}
          >
            <div className="tier-pill-title">Phase 1 – AI Agent Starter</div>
            <div className="tier-pill-sub">
              One inbound agent, basic booking, and real call coverage.
            </div>
            <div className="tier-pill-price">
              $35 activation + SMS plan + add-ons
            </div>
          </button>

          <button
            type="button"
            className={
              "tier-pill" + (openTier === "os" ? " tier-pill--active" : "")
            }
            onClick={() => setOpenTier((prev) => (prev === "os" ? null : "os"))}
          >
            <div className="tier-pill-title">Phase 2 & 3 – Full Operating System</div>
            <div className="tier-pill-sub">
              Phase 2: Speed-to-lead OS • Phase 3: OS + personalized pre-call video.
            </div>
            <div className="tier-pill-price">
              From $6,200–$13,500 build-out + $1,250/mo
            </div>
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
                    Built-in TCPA/FCC-compliant consent language for calls & SMS sent by AI
                    systems.
                  </li>
                  <li>Speed-to-lead wiring for form → SMS → calls.</li>
                  <li>
                    Form fields mapped to AI agent variables and (optionally) your CRM.
                  </li>
                  <li>
                    Brand and offer positioning tailored to{" "}
                    <strong>{industryLabel}</strong>.
                  </li>
                </ul>

                <div className="inline-badge">
                  <span />
                  Hosted & managed on our stack – no extra “tech ops” needed.
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

        {/* Starter AI agent & plans – Phase 1 */}
        {openTier === "starter" && (
          <section className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Phase 1 – AI Agent Starter & Base Plans</div>
                <div className="section-sub">
                  This is the “get something live fast” tier — one inbound agent, basic
                  booking, and enough SMS to test real calls.
                </div>
              </div>
              <div className="section-tag">Great for 30–100 calls/month</div>
            </div>

            <div className="pricing-grid">
              <div className="card">
                <div className="card-title">Getting Started</div>
                <div className="card-sub">
                  You don&apos;t have to go “full OS” to see value. Start small, then
                  upgrade.
                </div>
                <ul className="card-list">
                  <li>
                    <strong>$35 Activation Fee</strong> — 1 inbound AI agent, 1 phone
                    number, basic FAQ (your website as knowledge base), basic calendar
                    connection via SMS link.
                  </li>
                  <li>
                    <strong>$80 Live Transfer Setup (per phone)</strong> — transfer from AI
                    to your team or a closer.
                  </li>
                  <li>
                    <strong>$260 per Additional AI Agent</strong> for simple non-complex
                    flows (basic customer service, intake, SMS booking agent, etc.).
                  </li>
                  <li>
                    <strong>Basic FAQ</strong> = linking your existing website.
                  </li>
                  <li>
                    <strong>Custom FAQ Pack (20 Qs) – $125 one-time</strong> — written and
                    tuned for the agent.
                  </li>
                  <li>
                    <strong>FCC/TCPA Outbound Compliance – $350/mo</strong> when you&apos;re
                    running outbound without using our compliant landing pages.
                  </li>
                </ul>

                <div className="inline-note">
                  The lightest version is: landing page + activation + small SMS plan —
                  perfect if you&apos;re doing ~50 appointments a month.
                </div>
              </div>

              <div className="card card-alt">
                <div className="card-title">Callback AI Agent</div>
                <div className="card-sub">
                  For “call me back later” or missed inbound calls that shouldn&apos;t slip
                  away.
                </div>
                <div className="price-main">$1,700</div>
                <div className="price-subline">Setup</div>
                <div className="price-subline">$197/mo + SMS plan</div>

                <ul className="card-list">
                  <li>
                    Requires a Go High Level calendar (we structure it for callbacks).
                  </li>
                  <li>
                    Uses automation (e.g. Make.com) to trigger the AI call at the exact
                    requested time.
                  </li>
                  <li>
                    15–30 call attempts & 10–15 SMS over 30–60 days until the lead books,
                    says no, or truly dies.
                  </li>
                  <li>
                    Plays perfectly with your inbound agent and speed-to-lead sequence.
                  </li>
                </ul>

                <div className="inline-note">
                  The goal: nobody falls through the cracks. If they say “call me later”,
                  this agent owns that lead until it&apos;s handled.
                </div>
              </div>
            </div>

            {/* SMS plans only – minutes kept off-site */}
            <div className="pricing-grid">
              <div className="card card-alt">
                <div className="card-title">SMS Plans (Monthly)</div>
                <table className="price-table">
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Included SMS</th>
                      <th>Overage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>SMS Lite</td>
                      <td>50</td>
                      <td>$0.15 + $15 overage fee</td>
                    </tr>
                    <tr>
                      <td>SMS Starter</td>
                      <td>100</td>
                      <td>$0.15 + $15 overage fee</td>
                    </tr>
                    <tr>
                      <td>SMS Boost</td>
                      <td>200</td>
                      <td>$0.14 + $15 overage fee</td>
                    </tr>
                    <tr>
                      <td>SMS Growth</td>
                      <td>400</td>
                      <td>$0.13 + $15 overage fee</td>
                    </tr>
                    <tr>
                      <td>SMS Pro</td>
                      <td>800</td>
                      <td>$0.12 + $15 overage fee</td>
                    </tr>
                  </tbody>
                </table>
                <div className="inline-note">
                  Example: SMS Lite at $8/mo covers 50 SMS — enough for 50 booking link
                  texts if you&apos;re just testing.
                </div>
              </div>
            </div>

            {/* Add-ons + follow-up agents */}
            <div className="pricing-grid">
              <div className="card">
                <div className="card-title">Add-Ons & Integrations</div>
                <ul className="card-list">
                  <li>
                    <strong>Calendar Setup – $35 / person / calendar</strong>{" "}
                    (Cal.com, Calendly, Acuity, GHL, etc.).
                  </li>
                  <li>
                    <strong>Twilio / Telnyx Setup – $125</strong> — we connect your SMS
                    provider.{" "}
                    <em>
                      Note: if SMS comes from a different number than your AI calls, it can
                      slightly reduce booking conversion.
                    </em>
                  </li>
                  <li>
                    <strong>Per Automation Setup – $35</strong> — one-time wiring of
                    specific flows.
                  </li>
                  <li>
                    <strong>CRM Integration – $80</strong> — push leads and outcomes into
                    your CRM.
                  </li>
                  <li>
                    <strong>After-Hours Routing – $50</strong> — different flows nights &amp;
                    weekends.
                  </li>
                  <li>
                    <strong>Multi-Agent Routing – $150–$300</strong> — route between
                    multiple AI agents.
                  </li>
                  <li>
                    <strong>Complex Logic Build – $250–$500</strong> — heavy branching,
                    conditions, or niche flows.
                  </li>
                  <li>
                    <strong>Additional Phone Numbers – $10 each</strong>.
                  </li>
                </ul>
              </div>

              <div className="card card-alt">
                <div className="card-title">CloseBot AI SMS Setup</div>
                <div className="card-sub">
                  Nurture and close warm leads via SMS between live calls.
                </div>
                <ul className="card-list">
                  <li>
                    <strong>$350 Setup Fee</strong> — map CloseBot to your funnel and
                    scripts.
                  </li>
                  <li>
                    <strong>$64/mo CloseBot subscription</strong> — paid directly by you.
                  </li>
                  <li>
                    <strong>$35/mo optional maintenance</strong> or{" "}
                    <strong>$350</strong> per-incident update.
                  </li>
                </ul>
              </div>
            </div>

            <div className="pricing-grid">
              <div className="card">
                <div className="card-title">No-Show Recovery Agent</div>
                <div className="card-sub">
                  For booked calls that cancel or simply don&apos;t show. It treats every
                  no-show as a recoverable asset.
                </div>
                <div className="price-main">$1,700</div>
                <div className="price-subline">Setup</div>
                <div className="price-subline">$197/mo + SMS plan</div>
                <ul className="card-list">
                  <li>
                    Triggers when someone cancels late or doesn&apos;t show for their
                    appointment.
                  </li>
                  <li>
                    Uses the same 15–30 calls & 10–15 SMS cadence over 30–60 days to get
                    them rebooked.
                  </li>
                  <li>Re-anchors the $100 no-show policy and your value.</li>
                  <li>
                    Keeps your calendar full instead of constantly chasing new cold leads.
                  </li>
                </ul>
              </div>

              <div className="card card-alt">
                <div className="card-title">Nurture Agent</div>
                <div className="card-sub">
                  Long-term nurture for leads that didn&apos;t book yet, but shouldn&apos;t
                  be wasted.
                </div>
                <div className="price-main">$1,700</div>
                <div className="price-subline">Setup</div>
                <div className="price-subline">$197/mo + SMS plan</div>
                <ul className="card-list">
                  <li>
                    Kicks in after the 4-minute SMS if the lead still hasn&apos;t booked.
                  </li>
                  <li>
                    15–30 call attempts & 10–15 SMS touches over 30–60 days with
                    value-based messaging.
                  </li>
                  <li>
                    Keeps your brand in front of them without relying on a human SDR to
                    remember.
                  </li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Operating system tiers + ROI – Phase 2 & 3 */}
        {openTier === "os" && (
          <>
            <section className="section">
              <div className="section-header">
                <div>
                  <div className="section-title">Phase 2 & 3 – Full AI Operating Systems</div>
                  <div className="section-sub">
                    Phase 2: your speed-to-lead OS wrapped around your existing sales pros.
                    Phase 3: everything from Phase 2 plus fully personalized pre-call
                    videos for every booking.
                  </div>
                </div>
                <div className="section-tag">Both anchored at $1,250/mo</div>
              </div>

              <div className="pricing-grid">
                {/* Phase 2 */}
                <div className="card">
                  <div className="card-title">Phase 2 – Speed-to-Lead Operating System</div>
                  <div className="card-sub">
                    For teams that want the entire booking & show-rate machine wrapped
                    around their existing sales closers.
                  </div>
                  <div className="price-main">$6,200</div>
                  <div className="price-subline">Core SOP build-out</div>
                  <div className="price-subline">$1,250/mo ongoing optimization</div>

                  <ul className="card-list">
                    <li>
                      <strong>NEPQ inbound + outbound booking agents</strong> tied to your
                      calendars.
                    </li>
                    <li>
                      <strong>Speed-to-lead SOP</strong> (SMS in seconds, calls in
                      minutes, 30–60 day multi-touch cadence).
                    </li>
                    <li>
                      <strong>No-show & “Not Here” recovery flows</strong> to rebook lost
                      appointments.
                    </li>
                    <li>
                      <strong>Callback & follow-up agents</strong> for “call me later”
                      leads.
                    </li>
                    <li>
                      <strong>Pre-call training video strategy</strong> (shared to all
                      bookings) so people show up pre-framed and ready.
                    </li>
                    <li>
                      <strong>No-show fee SOP</strong> – AI anchors your $100 policy 100%
                      of the time.
                    </li>
                    <li>
                      Script refinement & weekly A/B testing based on real calls and
                      outcomes.
                    </li>
                  </ul>

                  <div className="inline-note">
                    This is the baseline package your ROI calculator is tied to: $6,200
                    build + $1,250/mo, paid for by the extra shows & closed deals.
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="card card-alt">
                  <div className="card-title">
                    Phase 3 – OS + Personalized Pre-Call Video for Every Booking
                  </div>
                  <div className="card-sub">
                    Everything in Phase 2, plus fully personalized AI-powered pre-call
                    videos tailored to each prospect&apos;s pain, deeper pain, impact, and
                    desired outcome.
                  </div>
                  <div className="price-main">$13,500</div>
                  <div className="price-subline">Full OS + video orchestration build-out</div>
                  <div className="price-subline">$1,250/mo ongoing optimization</div>

                  <ul className="card-list">
                    <li>
                      Includes <strong>all Phase 2 agents & workflows</strong> (NEPQ, speed
                      to lead, callbacks, no-show, nurture).
                    </li>
                    <li>
                      <strong>Custom pre-call video generation</strong> for every booking,
                      built from 3 tiers:
                      Basic (≈3 minutes), Core (≈5 minutes), and Epic (≈15 minutes).
                    </li>
                    <li>
                      <strong>Credit wallet system</strong> (Basic/Core/Epic credits per
                      client; 1 credit used per booking when video is requested).
                    </li>
                    <li>
                      <strong>Unique tracking links</strong> so you know who watched, how
                      long they watched, and which rep they&apos;re assigned to.
                    </li>
                    <li>
                      <strong>Dynamic reminder logic</strong> – different 30-minute
                      reminder SMS if they watched vs. didn&apos;t watch.
                    </li>
                    <li>
                      <strong>Salesmanship cancellation logic</strong> that pulls in pain,
                      deeper pain, impact, and desired outcome before letting them cancel.
                    </li>
                    <li>
                      Optional <strong>A/B testing service</strong> for pre-call video
                      variants: $750/mo or $1,250/mo depending on revision volume (credits
                      billed separately).
                    </li>
                  </ul>

                  <div className="inline-note">
                    Phase 3 is your “flagship” offer for serious teams who want an AI
                    booking & video engine that feels 1:1 personalized at scale, while the
                    core retainer stays a simple $1,250/mo.
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="pricing-grid">
                <div className="card">
                  <div className="card-title">90-Day Rollout Timeline (Typical)</div>
                  <div className="card-sub">
                    You don&apos;t get all of this on day one — we stage it so you can
                    launch, then compound.
                  </div>
                  <ul className="card-list">
                    <li>
                      <strong>Inbound agent with basic booking:</strong> live in ~24 hours.
                    </li>
                    <li>
                      <strong>Landing pages:</strong> 48–72 hours (AI-ready and
                      compliant).
                    </li>
                    <li>
                      <strong>Booking agent:</strong> 15–30 days.
                    </li>
                    <li>
                      <strong>Pre-call video (Phase 2 shared asset):</strong> 30–60 days
                      once story, assets, and offer are dialed in.
                    </li>
                    <li>
                      <strong>Personalized pre-call video engine (Phase 3):</strong>{" "}
                      usually 45–90 days after data is flowing.
                    </li>
                    <li>
                      <strong>Callback &amp; no-show agents:</strong> 45–90 days as call
                      and outcome data builds.
                    </li>
                  </ul>
                  <div className="inline-note">
                    You&apos;re generating usage and revenue as each piece comes online,
                    not waiting for everything to be perfect before it starts paying you
                    back.
                  </div>
                </div>

                <div className="card card-alt">
                  <div className="card-title">Funding &amp; Cash Flow</div>
                  <div className="card-sub">
                    Many clients use funding or existing profit to cover the setup, then
                    let the extra recovered revenue pay for the $1,250/mo OS retainer.
                  </div>
                  <ul className="card-list">
                    <li>
                      We can refer you to funding marketplaces (like Fiona) so setup can
                      be financed instead of pulled from operating cash.
                    </li>
                    <li>
                      Your <strong>$1,250/mo</strong> retainer is intentionally set below
                      what even a modest lift in shows & closes can create.
                    </li>
                    <li>
                      The ROI calculator below is wired to the Phase 2 baseline: $6,200
                      setup + $1,250/mo.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ROI Calculator */}
            <section className="section">
              <div className="section-header">
                <div>
                  <div className="section-title">ROI &amp; Payback Calculator</div>
                  <div className="section-sub">
                    Plug in your own leads, booking, show rate, close rate, and average
                    ticket. See what the full SOP could generate — and how fast the{" "}
                    <strong>$6,200</strong> core build can pay for itself with a{" "}
                    <strong>$1,250/mo</strong> OS retainer.
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
                    This doesn&apos;t need to be perfect — estimates are enough to see the
                    gap.
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
                        In some medical/dental flows this can be closer to{" "}
                        <strong>100%</strong>.
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
                      <span className="metric-value">
                        {baselineBooked.toFixed(1)} bookings
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
                      <span className="metric-label">Est. monthly revenue now:</span>{" "}
                      <span className="metric-value">
                        ${formatCurrency(baselineRevenue)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card card-alt">
                  <div className="card-title">With Full SOP Installed (Phase 2+)</div>
                  <div className="card-sub">
                    We assume a small drop in booking rate (more friction from the no-show
                    policy), but a big lift in show and close rates.
                  </div>

                  <div className="input-grid">
                    <div className="field">
                      <label>Lead → Booked drop (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={bookDrop}
                        onChange={(e) => setBookDrop(e.target.value)}
                      />
                      <small>We usually see a 5–10% drop.</small>
                    </div>
                    <div className="field">
                      <label>Show rate lift (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={200}
                        value={showLift}
                        onChange={(e) => setShowLift(e.target.value)}
                      />
                      <small>Typical range is 20–60% lift.</small>
                    </div>
                    <div className="field">
                      <label>Close rate lift (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={200}
                        value={closeLift}
                        onChange={(e) => setCloseLift(e.target.value)}
                      />
                      <small>Typical range is 20–40% lift.</small>
                    </div>
                  </div>

                  <div className="roi-metrics">
                    <div>
                      <span className="metric-label">Bookings with SOP:</span>{" "}
                      <span className="metric-value">
                        {improvedBooked.toFixed(1)} / month
                      </span>
                    </div>
                    <div>
                      <span className="metric-label">Shows with SOP:</span>{" "}
                      <span className="metric-value">
                        {improvedShows.toFixed(1)} / month
                      </span>
                    </div>
                    <div>
                      <span className="metric-label">Sales with SOP:</span>{" "}
                      <span className="metric-value">
                        {improvedSales.toFixed(1)} / month
                      </span>
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
                          (monthsToPayback === Infinity
                            ? "metric-danger"
                            : "metric-highlight")
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
                          {formatCurrencyWithDecimals(
                            (setupCost + monthlyOpsCost * 6) / extraRevenue
                          )}{" "}
                          months (assuming 6 months of ops)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="cta-footer">
                <div className="cta-text">
                  When the <span>extra monthly revenue</span> is bigger than{" "}
                  <span>$1,250</span>, the OS is designed to pay for itself — and then some.
                </div>
                <a href="tel:+12396880201" className="cta-link-btn">
                  Talk through your numbers <span>↗</span>
                </a>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
