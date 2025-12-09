"use client";

import { useState } from "react";

type TierKey = "landing" | "starter" | "os" | "enterprise" | null;
type FunnelMode = "inbound" | "outbound";

export default function PricingPage() {
  const [openTier, setOpenTier] = useState<TierKey>("landing");
  const [funnelMode, setFunnelMode] = useState<FunnelMode>("inbound");

  // ROI calculator state
  const [leads, setLeads] = useState("200");
  const [bookRate, setBookRate] = useState("40"); // %
  const [showRate, setShowRate] = useState("60"); // %
  const [closeRate, setCloseRate] = useState("25"); // %
  const [avgTicket, setAvgTicket] = useState("1500");

  // Improvement assumptions (you can tweak defaults)
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

  // Assumptions for full SOP package (you can edit numbers)
  const setupCost = 6200; // base SOP setup
  const monthlyOpsCost = 1250; // base SOP monthly
  const monthsToPayback =
    extraRevenue > 0 ? setupCost / extraRevenue : Infinity;

  const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });

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
          max-width: 1120px;
          margin: 0 auto;
          padding: 32px 16px 96px;
        }

        .pricing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
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
          gap: 10px;
        }

        .brand-logo {
          width: 34px;
          height: 34px;
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
          font-size: 0.98rem;
          text-transform: uppercase;
        }

        .brand-tagline {
          font-size: 0.86rem;
          color: var(--muted);
        }

        .header-pill {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          padding: 8px 18px;
          font-size: 0.9rem;
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
          margin-bottom: 20px;
        }

        .page-eyebrow {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--muted);
          margin-bottom: 4px;
        }

        .page-title {
          font-size: clamp(2.1rem, 3.2vw, 2.8rem);
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
          max-width: 640px;
          color: #CBD5F5;
        }

        /* Tier selector */

        .tier-selector {
          margin-top: 28px;
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
          background: rgba(15, 23, 42, 0.9);
          padding: 10px 12px 9px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 3px;
          transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, transform 0.12s ease;
        }

        .tier-pill-title {
          font-size: 0.98rem;
          font-weight: 600;
        }

        .tier-pill-sub {
          font-size: 0.88rem;
          color: var(--muted);
        }

        .tier-pill-price {
          font-size: 0.86rem;
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
          margin-top: 32px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .section-tag {
          font-size: 0.82rem;
          padding: 3px 9px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          color: var(--muted);
        }

        .section-sub {
          font-size: 0.94rem;
          color: #CBD5F5;
          max-width: 720px;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
          gap: 20px;
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
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.6);
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.85);
        }

        .card-alt {
          background: radial-gradient(circle at top, rgba(24, 24, 27, 0.96), rgba(15, 23, 42, 0.98));
        }

        .card-title {
          font-size: 1.02rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .card-sub {
          font-size: 0.9rem;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .price-main {
          font-size: 1.4rem;
          font-weight: 700;
        }

        .price-subline {
          font-size: 0.9rem;
          color: var(--muted);
        }

        .inline-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          font-size: 0.82rem;
          color: var(--muted);
          margin-top: 6px;
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
          font-size: 0.92rem;
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
          font-size: 0.8rem;
          color: var(--muted);
          margin-top: 8px;
        }

        /* Tables */

        .price-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
          margin-top: 6px;
        }

        .price-table thead {
          background: rgba(15, 23, 42, 0.9);
        }

        .price-table th,
        .price-table td {
          padding: 6px 8px;
          border-bottom: 1px solid rgba(31, 41, 55, 0.8);
          text-align: left;
        }

        .price-table th {
          font-weight: 600;
          font-size: 0.82rem;
          color: #9CA3AF;
        }

        .price-table tr:last-child td {
          border-bottom: none;
        }

        /* Diagrams */

        .diagram-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
          gap: 20px;
          margin-top: 22px;
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
          font-size: 0.98rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .diagram-sub {
          font-size: 0.86rem;
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
          font-size: 0.8rem;
          white-space: nowrap;
        }

        .diagram-arrow {
          font-size: 0.8rem;
          color: #9CA3AF;
          align-self: center;
        }

        .diagram-footnote {
          margin-top: 8px;
          font-size: 0.8rem;
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
          font-size: 0.9rem;
          font-weight: 600;
        }

        .accordion-price {
          font-size: 0.86rem;
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
          font-size: 0.88rem;
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
          font-size: 0.84rem;
          color: #CBD5F5;
        }

        .field input {
          padding: 7px 9px;
          border-radius: 9px;
          border: 1px solid rgba(148, 163, 184, 0.8);
          background: rgba(15, 23, 42, 0.95);
          color: #E5E7EB;
          font-size: 0.9rem;
          outline: none;
        }

        .field input:focus {
          border-color: #047857;
          box-shadow: 0 0 0 1px rgba(4, 120, 87, 0.5);
        }

        .field small {
          font-size: 0.75rem;
          color: var(--muted);
        }

        .pill-toggle-group {
          display: inline-flex;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          overflow: hidden;
          font-size: 0.8rem;
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
          font-size: 0.88rem;
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
          font-size: 0.96rem;
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
            <span>From first click to closed deal, end-to-end.</span>
          </div>
        </header>

        {/* Intro */}
        <div className="page-title-block">
          <div className="page-eyebrow">Pricing & Systems</div>
          <h1 className="page-title">
            From <span>single landing pages</span> to full AI operating systems.
          </h1>
          <p className="page-subtitle">
            Start simple with a conversion-optimized landing page and a basic AI agent, or
            roll into a full, end-to-end sales and booking operating system when you&apos;re ready.
          </p>
        </div>

        {/* Tier selector */}
        <div className="tier-selector">
          <button
            type="button"
            className={
              "tier-pill" + (openTier === "landing" ? " tier-pill--active" : "")
            }
            onClick={() => setOpenTier((prev) => (prev === "landing" ? null : "landing"))}
          >
            <div className="tier-pill-title">Landing Page Foundation</div>
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
            <div className="tier-pill-title">AI Agent Starter</div>
            <div className="tier-pill-sub">
              One inbound agent, basic booking, and live call coverage.
            </div>
            <div className="tier-pill-price">
              $35 activation + voice &amp; SMS plans + add-ons
            </div>
          </button>

          <button
            type="button"
            className={
              "tier-pill" +
              (openTier === "os" || openTier === "enterprise"
                ? " tier-pill--active"
                : "")
            }
            onClick={() => setOpenTier((prev) => (prev === "os" ? null : "os"))}
          >
            <div className="tier-pill-title">Full Operating System</div>
            <div className="tier-pill-sub">
              Booking + pre-call video + sales + finance flows, fully wired.
            </div>
            <div className="tier-pill-price">
              From $6,200 build-out + $1,250/mo, up to full OS &amp; enterprise.
            </div>
          </button>
        </div>

        {/* Speed-to-lead diagrams */}
        <section className="section">
          <div className="section-header">
            <div>
              <div className="section-title">Speed-to-Lead & Booking Psychology</div>
              <div className="section-sub">
                This is the backbone of everything we build: answer fast, book cleanly, and
                anchor the value before the consult even starts.
              </div>
            </div>
          </div>

          <div className="diagram-grid">
            <div className="diagram-card">
              <div className="diagram-title">Speed-to-Lead Sequence (800% booking lift)</div>
              <div className="diagram-sub">
                Designed for both inbound and outbound flows. The goal is simple: respond
                faster and more consistently than any human team ever could.
              </div>
              <div className="diagram-flow">
                <div className="diagram-node">Lead hits landing page</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">SMS in 5–10 seconds</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">First call in 20–30 seconds</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">Second call + voicemail</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">Follow-up SMS at 3–4 minutes</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">
                  Ongoing callbacks &amp; SMS over 30–60 days
                </div>
              </div>
              <p className="diagram-footnote">
                Most teams touch a lead once or twice. This operating rhythm keeps leads
                alive for weeks without burning out your staff.
              </p>
            </div>

            <div className="diagram-card">
              <div className="diagram-title">
                Booking Psychology: “What works best for you?”
              </div>
              <div className="diagram-sub">
                We combine intent-based scheduling with clear A/B options and a strong
                no-show policy to protect your calendar.
              </div>
              <div className="diagram-flow">
                <div className="diagram-node">“What works best for you?”</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">
                  Scan calendar from today forward
                </div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">
                  Offer Slot A/B (e.g. Mon 9am or 11am)
                </div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">
                  Confirm time + anchor expectations (incl. $100 no-show policy if desired)
                </div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">Send SMS confirmation + pre-call video</div>
                <div className="diagram-arrow">→</div>
                <div className="diagram-node">
                  Backup SMS link + transfer path if they don&apos;t book on the spot
                </div>
              </div>
              <p className="diagram-footnote">
                The script does the heavy lifting: the agent never forgets the no-show
                policy, never skips the video, and never stops offering clean A/B choices.
              </p>
            </div>
          </div>
        </section>

        {/* Landing package */}
        {openTier === "landing" && (
          <section className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Landing Page Foundation</div>
                <div className="section-sub">
                  Built specifically for AI calling and speed-to-lead — not just a “pretty
                  site”. This is where everything else starts.
                </div>
              </div>
              <div className="section-tag">Buy 1, get 2 live funnels</div>
            </div>

            <div className="pricing-grid">
              <div className="card">
                <div className="card-title">Landing Page Package</div>
                <div className="card-sub">
                  Designed around your AI calling flows, compliance, and call outcomes.
                </div>
                <div className="price-main">$2,600</div>
                <div className="price-subline">Buy 1, get 2 live landing pages</div>

                <ul className="card-list">
                  <li>Conversion-optimized, AI-ready landing page layout.</li>
                  <li>
                    Built-in TCPA/FCC-compliant consent language for calls &amp; SMS from
                    AI systems.
                  </li>
                  <li>Speed-to-lead wiring for form → call → SMS.</li>
                  <li>Form fields mapped to your AI agents and CRM if needed.</li>
                  <li>Branding aligned to your offer (copy, colors, positioning).</li>
                </ul>

                <div className="inline-badge">
                  <span />
                  Hosting &amp; management on our stack
                </div>
              </div>

              <div className="card card-alt">
                <div className="card-title">Ongoing Landing Management</div>
                <div className="card-sub">
                  We keep the pages live, fast, and aligned to your offer as it evolves.
                </div>
                <div className="price-main">$197/mo</div>
                <div className="price-subline">First landing page</div>
                <div className="price-subline">+$98/mo per additional page</div>

                <ul className="card-list">
                  <li>Hosting, monitoring, and performance checks.</li>
                  <li>Minor copy &amp; layout adjustments as your offer refines.</li>
                  <li>Lead routing &amp; outcome pass-through to your systems.</li>
                  <li>Room to attach upgraded AI agents as you grow.</li>
                </ul>

                <div className="inline-note">
                  Perfect for businesses that want AI-ready pages and don&apos;t want to
                  deal with page builders, hosting, or routing logic.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Starter AI agent & plans */}
        {openTier === "starter" && (
          <section className="section">
            <div className="section-header">
              <div>
                <div className="section-title">AI Agent Starter & Plans</div>
                <div className="section-sub">
                  Start with a single inbound agent, basic FAQ, and simple booking logic,
                  then layer in more agents and logic as you go.
                </div>
              </div>
              <div className="section-tag">Great for 30–100 calls/month</div>
            </div>

            <div className="pricing-grid">
              <div className="card">
                <div className="card-title">Getting Started</div>
                <div className="card-sub">
                  A clean entry point for businesses new to AI voice and SMS.
                </div>
                <ul className="card-list">
                  <li>
                    <strong>$35 Activation Fee</strong> — includes 1 inbound AI agent, 1
                    phone number, basic FAQ linked to your existing website, and basic
                    calendar connection.
                  </li>
                  <li>
                    <strong>$80 Live Transfer Setup (per phone)</strong> — configure
                    transfers from the AI agent directly to your team.
                  </li>
                  <li>
                    <strong>$260 per Additional AI Agent</strong> for simple non-complex
                    flows (e.g. basic customer service, intake, or SMS booking agent).
                  </li>
                  <li>
                    <strong>Basic FAQ</strong> = attaching your website as a reference.
                  </li>
                  <li>
                    <strong>Custom FAQ Pack (20 Qs) – $125 one-time</strong> — curated,
                    written FAQs baked into the agent&apos;s knowledge.
                  </li>
                </ul>

                <div className="inline-note">
                  This is the “test it in your business” tier — minimal risk, real calls,
                  and real data.
                </div>
              </div>

              <div className="card card-alt">
                <div className="card-title">Callback AI Agent</div>
                <div className="card-sub">
                  For leads that say “call me back later” or fills that slip past the
                  first attempt.
                </div>
                <div className="price-main">$35 / callback trigger</div>
                <div className="price-subline">One-time setup</div>
                <ul className="card-list">
                  <li>Full callback automation when a lead requests a callback.</li>
                  <li>Integration with your Calendly/Cal.com/GHL calendar.</li>
                  <li>Outbound Thoughtly webhook configuration.</li>
                  <li>
                    Graceful handling of &ldquo;in 10 minutes or 30 minutes&rdquo; style
                    scheduling.
                  </li>
                  <li>Works alongside your inbound agent for full speed-to-lead coverage.</li>
                </ul>
                <div className="inline-note">
                  <strong>Callback Infrastructure Fee:</strong> $17/mo flat — covers
                  hosting of the callback automation, monitoring, and small adjustments to
                  keep timing logic smooth.
                </div>
              </div>
            </div>

            {/* Plan tables */}
            <div className="pricing-grid">
              <div className="card">
                <div className="card-title">AI Voice Plans (Monthly)</div>
                <table className="price-table">
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Minutes</th>
                      <th>Rate / min</th>
                      <th>Overage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Starter Lite</td>
                      <td>160</td>
                      <td>$0.35</td>
                      <td>$15 overage fee</td>
                    </tr>
                    <tr>
                      <td>Starter</td>
                      <td>280</td>
                      <td>$0.28</td>
                      <td>$15 overage fee</td>
                    </tr>
                    <tr>
                      <td>Growth</td>
                      <td>710</td>
                      <td>$0.22</td>
                      <td>$15 overage fee</td>
                    </tr>
                    <tr>
                      <td>Pro</td>
                      <td>1,700</td>
                      <td>$0.17</td>
                      <td>$15 overage fee</td>
                    </tr>
                    <tr>
                      <td>Enterprise</td>
                      <td>5,300</td>
                      <td>$0.12</td>
                      <td>$15 overage fee</td>
                    </tr>
                    <tr>
                      <td>Ultra Enterprise</td>
                      <td>12,000</td>
                      <td>$0.09</td>
                      <td>$15 overage fee</td>
                    </tr>
                  </tbody>
                </table>
                <div className="inline-note">
                  <strong>Suggested baseline:</strong> many smaller teams start on Starter
                  Lite + a small SMS plan, then upgrade as call volume ramps.
                </div>
              </div>

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
                  For example, SMS Lite at $8/mo with 50 SMS is enough to cover 50 booking
                  link texts if you&apos;re just getting started.
                </div>
              </div>
            </div>

            {/* Add-ons */}
            <div className="pricing-grid">
              <div className="card">
                <div className="card-title">Add-Ons & Integrations</div>
                <ul className="card-list">
                  <li>
                    <strong>Calendar Setup – $35 / person / calendar</strong>  
                    Cal.com, Calendly, Acuity, GHL, etc.
                  </li>
                  <li>
                    <strong>Twilio / Telnyx Setup – $125</strong> — we connect your
                    messaging provider so you pay their usage directly.
                  </li>
                  <li>
                    <strong>CRM Integration – $80</strong> — map outcomes/leads into your
                    CRM.
                  </li>
                  <li>
                    <strong>After-Hours Routing – $50</strong> — separate logic for
                    nights/weekends.
                  </li>
                  <li>
                    <strong>Multi-Agent Routing – $150–$300</strong> — route calls across
                    multiple AI agents and flows.
                  </li>
                  <li>
                    <strong>Complex Logic Build – $250–$500</strong> — for more advanced
                    conditional flows beyond “simple” intakes.
                  </li>
                  <li>
                    <strong>Additional Phone Numbers – $10 each</strong>.
                  </li>
                </ul>
              </div>

              <div className="card card-alt">
                <div className="card-title">CloseBot AI SMS Setup</div>
                <div className="card-sub">
                  For text-based follow-up and closing, layered on top of your voice flows.
                </div>
                <ul className="card-list">
                  <li>
                    <strong>$350 Setup Fee</strong> — configure CloseBot around your offer
                    and funnel.
                  </li>
                  <li>
                    <strong>$64/mo CloseBot subscription</strong> — paid directly by you to
                    the platform.
                  </li>
                  <li>
                    <strong>$35/mo optional maintenance</strong> or <strong>$350</strong>{" "}
                    per-incident update.
                  </li>
                  <li>Nurture and close warm leads via SMS in between live calls.</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Operating system tiers + ROI */}
        {(openTier === "os" || openTier === "enterprise") && (
          <>
            <section className="section">
              <div className="section-header">
                <div>
                  <div className="section-title">Full AI Operating Systems</div>
                  <div className="section-sub">
                    When you&apos;re ready for a complete end-to-end system — booking,
                    pre-call video, sales, finance, and dispatch — this is where it lives.
                  </div>
                </div>
                <div className="section-tag">Designed for serious volume</div>
              </div>

              <div className="pricing-grid">
                <div className="card">
                  <div className="card-title">Speed-to-Lead OS (Core SOP)</div>
                  <div className="card-sub">
                    For teams that want a complete speed-to-lead and booking system around
                    their existing sales team.
                  </div>
                  <div className="price-main">$6,200</div>
                  <div className="price-subline">Core SOP build-out</div>
                  <div className="price-subline">$1,250/mo ongoing optimization</div>

                  <ul className="card-list">
                    <li>
                      Slot A/B booking agent (~15–20 minutes) with &ldquo;what works
                      best&rdquo; and clean A/B time offers.
                    </li>
                    <li>
                      Pre-call video strategy (10–15 minutes) to anchor the $100 no-show
                      policy and build value before the consult.
                    </li>
                    <li>
                      No-show &amp; callback flows tied back into your calendar and call
                      system.
                    </li>
                    <li>
                      SMS fallbacks to push booking to happen on the spot and confirm the
                      time in writing.
                    </li>
                    <li>
                      Ongoing script refinement and A/B testing based on the actual calls
                      and show rates your system produces.
                    </li>
                  </ul>

                  <div className="inline-note">
                    This is where most businesses start seeing a meaningful lift in
                    booked-and-kept appointments, without touching ad spend.
                  </div>
                </div>

                <div className="card card-alt">
                  <div className="card-title">OS &amp; Enterprise Tiers</div>
                  <div className="card-sub">
                    For full-cycle sales teams, high-ticket offers, or operations that
                    need AI across the entire customer journey.
                  </div>

                  <div className="accordion">
                    <div className="accordion-item">
                      <button
                        type="button"
                        className="accordion-header-btn"
                        onClick={() =>
                          setOpenTier((prev) => (prev === "os" ? null : "os"))
                        }
                      >
                        <div className="accordion-header-main">
                          <span className="accordion-label">
                            Full End-to-End AI Operating System
                          </span>
                          <span className="accordion-price">
                            $12,500–$20,000 build-out • $3,500–$4,400/mo
                          </span>
                        </div>
                        <span className="accordion-chevron">
                          {openTier === "os" ? "▾" : "▸"}
                        </span>
                      </button>
                      {openTier === "os" && (
                        <div className="accordion-body">
                          <p>
                            Ideal for offers that justify a 20–60 minute call and need AI
                            involved at every step:
                          </p>
                          <ul className="accordion-list">
                            <li>
                              <strong>20–30 minute booking agent</strong> with full
                              discovery, problem/pain extraction, value framing, and
                              calendar logic.
                            </li>
                            <li>
                              <strong>15–25 minute pre-call video</strong> (via tools like
                              Sora-style video creation) — story, credibility, reviews,
                              value stacking, and no-show policy.
                            </li>
                            <li>
                              <strong>60 minute sales call agent</strong> segmented into
                              structured stages (opener, discovery, offer, price, objection
                              handling, commitment).
                            </li>
                            <li>
                              <strong>10–15 minute finance/closer agent</strong> for
                              options, payment breakdowns, and sending finance links.
                            </li>
                            <li>
                              <strong>Dispatcher / operations agent</strong> for home
                              services-style routing, ETAs, and keeping the field schedule
                              tight.
                            </li>
                            <li>
                              Continuous testing of scripts, offer positioning, and
                              booking/no-show patterns so the system keeps getting better
                              instead of going stale.
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="accordion-item">
                      <button
                        type="button"
                        className="accordion-header-btn"
                        onClick={() =>
                          setOpenTier((prev) =>
                            prev === "enterprise" ? null : "enterprise"
                          )
                        }
                      >
                        <div className="accordion-header-main">
                          <span className="accordion-label">
                            Enterprise AI Department (Custom)
                          </span>
                          <span className="accordion-price">
                            $25,000–$70,000 build-out • $6,000–$12,000/mo
                          </span>
                        </div>
                        <span className="accordion-chevron">
                          {openTier === "enterprise" ? "▾" : "▸"}
                        </span>
                      </button>
                      {openTier === "enterprise" && (
                        <div className="accordion-body">
                          <p>
                            For teams handling 50–200+ inbound leads per day, existing
                            sales teams, finance, underwriting, or multi-location
                            operations:
                          </p>
                          <ul className="accordion-list">
                            <li>
                              Multi-agent architecture across inbound, booking, no-show
                              recovery, outbound, sales, finance, and post-sale.
                            </li>
                            <li>
                              Omnichannel coverage (phone + SMS, with room for more
                              channels).
                            </li>
                            <li>
                              Deep integration with your CRM, billing, and scheduling
                              tools.
                            </li>
                            <li>
                              Advanced routing rules, segmentation, and logic for multiple
                              brands or locations.
                            </li>
                            <li>
                              Performance dashboards and clear ROI tracking so leadership
                              can see where gains are coming from.
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ROI Calculator */}
            <section className="section">
              <div className="section-header">
                <div>
                  <div className="section-title">ROI & Payback Calculator</div>
                  <div className="section-sub">
                    Plug in your numbers to see what an end-to-end operating system could
                    recover — and how fast the core SOP can pay for itself.
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
                    Estimated monthly performance. These don&apos;t need to be perfect —
                    just close enough to see the lift.
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
                        For example: if 40 out of 100 leads book, enter <strong>40</strong>.
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
                        For some medical or dental offers this may be close to{" "}
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
                    <strong>Baseline results:</strong> this is what you&apos;re earning
                    today from the leads you already pay to generate.
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
                      <span className="metric-label">Estimated monthly revenue:</span>{" "}
                      <span className="metric-value">
                        ${formatCurrency(baselineRevenue)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card card-alt">
                  <div className="card-title">With the Full SOP Installed</div>
                  <div className="card-sub">
                    We use conservative lift ranges based on better booking psychology,
                    speed-to-lead, pre-call video, and no-show control.
                  </div>

                  <div className="input-grid">
                    <div className="field">
                      <label>Expected change: Lead → Booked</label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={bookDrop}
                        onChange={(e) => setBookDrop(e.target.value)}
                      />
                      <small>
                        % <strong>drop</strong> in bookings (5–10% is common) from adding a
                        strong no-show policy.
                      </small>
                    </div>
                    <div className="field">
                      <label>Expected lift: Booked → Show</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={showLift}
                        onChange={(e) => setShowLift(e.target.value)}
                      />
                      <small>
                        % <strong>increase</strong> in show rate (20–60% range).
                      </small>
                    </div>
                    <div className="field">
                      <label>Expected lift: Show → Close</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={closeLift}
                        onChange={(e) => setCloseLift(e.target.value)}
                      />
                      <small>
                        % <strong>increase</strong> with pre-call video and stronger
                        framing (20–40% typical).
                      </small>
                    </div>
                  </div>

                  <div className="roi-metrics">
                    <div>
                      <span className="metric-label">
                        New booked ratio (after no-show policy):
                      </span>{" "}
                      <span className="metric-value">
                        {improvedBookRate.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="metric-label">New show ratio:</span>{" "}
                      <span className="metric-value">
                        {improvedShowRate.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="metric-label">New close ratio:</span>{" "}
                      <span className="metric-value">
                        {improvedCloseRate.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="metric-label">New monthly revenue:</span>{" "}
                      <span className="metric-highlight">
                        ${formatCurrency(improvedRevenue)}
                      </span>
                    </div>
                    <div>
                      <span className="metric-label">Extra revenue per month:</span>{" "}
                      <span
                        className={
                          "metric-value " +
                          (extraRevenue > 0 ? "metric-highlight" : "metric-danger")
                        }
                      >
                        {extraRevenue > 0
                          ? `+$${formatCurrency(extraRevenue)}`
                          : "$0 (no lift with current inputs)"}
                      </span>
                    </div>
                    <div>
                      <span className="metric-label">
                        Est. payback period on $6,200 SOP:
                      </span>{" "}
                      <span className="metric-value">
                        {extraRevenue > 0
                          ? `${monthsToPayback.toFixed(1)} months`
                          : "—"}
                      </span>
                    </div>
                    <div className="inline-note">
                      This does not include the cost of the monthly operating package or
                      any extra OS tiers — it&apos;s a simple look at how quickly the{" "}
                      <strong>$6,200</strong> core SOP can pay for itself on the low end.
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* CTA footer */}
        <div className="cta-footer">
          <div className="cta-text">
            Ready to see this in action on a live{" "}
            <span>AI-powered speed-to-lead landing page</span>?
          </div>
          <a href="/" className="cta-link-btn">
            Hear the AI &amp; see the page
            <span>↗</span>
          </a>
        </div>
      </div>
    </main>
  );
}