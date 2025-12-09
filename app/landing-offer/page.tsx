"use client";

import { useState, useMemo } from "react";

type Industry =
  | "hvac"
  | "roofing"
  | "solar"
  | "medspa"
  | "dental"
  | "homeservices"
  | "contractor"
  | "agency"
  | "realestate"
  | "legal";

const INDUSTRY_LABELS: Record<Industry, string> = {
  hvac: "HVAC",
  roofing: "Roofing",
  solar: "Solar",
  medspa: "Med Spa",
  dental: "Dental",
  homeservices: "Home Services",
  contractor: "Contractors",
  agency: "Marketing Agencies",
  realestate: "Real Estate",
  legal: "Legal / Professional",
};

const INDUSTRY_COPY: Record<
  Industry,
  { headline: string; sub: string; example: string }
> = {
  hvac: {
    headline: "Stop losing AC and furnace jobs to missed calls.",
    sub: "After-hours calls, weekend emergencies, and “call me back later” leads get handled instantly.",
    example: "25-ton rooftop unit replacement or full system install.",
  },
  roofing: {
    headline: "Turn storm spikes into booked roof inspections.",
    sub: "Every call after a storm is a race. Your AI system never lets them go to voicemail.",
    example: "Full roof replacement or insurance restoration project.",
  },
  solar: {
    headline: "Push more solar consultations to the table.",
    sub: "Every inbound lead is pre-framed, pre-qualified, and booked with higher show-up intent.",
    example: "Residential solar consult with finance pre-framing.",
  },
  medspa: {
    headline: "Fill high-ticket med spa appointments consistently.",
    sub: "Botox, fillers, and package offers with fewer no-shows and tighter rebooking.",
    example: "Full-face package or recurring membership plan.",
  },
  dental: {
    headline: "Keep your chairs full with better shows.",
    sub: "Same-day emergencies, hygiene recalls, and high-value cases booked and reminded properly.",
    example: "Implant case, Invisalign, or full-mouth restoration.",
  },
  homeservices: {
    headline: "Never let a hot service lead hit voicemail.",
    sub: "Plumbing, electrical, and other urgent calls get answered, booked, and followed up automatically.",
    example: "Water heater replacement, panel upgrade, or emergency repair.",
  },
  contractor: {
    headline: "More estimates booked, less admin chaos.",
    sub: "Your AI handles intake, scheduling, and follow-up so your crews stay in the field.",
    example: "Kitchen remodel or full interior renovation.",
  },
  agency: {
    headline: "Turn inbound interest into real strategy calls.",
    sub: "Every enquiry gets followed up, booked, and warmed for your closers.",
    example: "Strategy session or monthly retainer proposal.",
  },
  realestate: {
    headline: "Turn curious leads into calendar-showing appointments.",
    sub: "Buyers and sellers get nurtured, booked, and reminded automatically.",
    example: "Buyer consult, listing appointment, or property tour.",
  },
  legal: {
    headline: "Intake calls handled, consults booked, clients prepared.",
    sub: "Every voicemail and “call later” is a missed case. Your AI intake fixes that.",
    example: "Initial consultation for high-value legal matter.",
  },
};

export default function PricingOsPage() {
  // Global industry selection
  const [industry, setIndustry] = useState<Industry>("homeservices");

  // Calculator 1: Lead → Book → Show → Close
  const [leadsPerMonth, setLeadsPerMonth] = useState("200");
  const [leadToBookRate, setLeadToBookRate] = useState("35"); // %
  const [showRate, setShowRate] = useState("60"); // %
  const [closeRate, setCloseRate] = useState("30"); // %
  const [avgTicket, setAvgTicket] = useState("2500");

  // Improvements (your SOP impact)
  const [bookLiftDelta, setBookLiftDelta] = useState("-5"); // % change (can be negative)
  const [showLift, setShowLift] = useState("30"); // %
  const [closeLift, setCloseLift] = useState("25"); // %

  // Implementation cost for ROI payback
  const [implSetupCost, setImplSetupCost] = useState("6200");
  const [implMonthlyFee, setImplMonthlyFee] = useState("1250");

  // Calculator 2: Inbound Missed Calls → Recovered Revenue
  const [dailyInboundCalls, setDailyInboundCalls] = useState("40");
  const [missedRate, setMissedRate] = useState("35"); // %
  const [aiReachRate, setAiReachRate] = useState("70"); // %
  const [aiConvertRate, setAiConvertRate] = useState("30"); // %
  const [inboundCloseRate, setInboundCloseRate] = useState("80"); // %
  const [inboundAvgTicket, setInboundAvgTicket] = useState("900");
  const [workingDays, setWorkingDays] = useState("22");

  // Derived metrics: Calculator 1
  const {
    baseCloses,
    baseRevenue,
    sopCloses,
    sopRevenue,
    sopExtraRevenue,
    paybackMonths,
  } = useMemo(() => {
    const leads = Number(leadsPerMonth) || 0;
    const l2b = (Number(leadToBookRate) || 0) / 100;
    const show = (Number(showRate) || 0) / 100;
    const close = (Number(closeRate) || 0) / 100;
    const ticket = Number(avgTicket) || 0;

    // baseline
    const booked = leads * l2b;
    const showed = booked * show;
    const closed = showed * close;
    const rev = closed * ticket;

    // improved
    const bookLift = (Number(bookLiftDelta) || 0) / 100;
    const showLiftVal = (Number(showLift) || 0) / 100;
    const closeLiftVal = (Number(closeLift) || 0) / 100;

    const newL2b = Math.max(l2b * (1 + bookLift), 0);
    const newShow = Math.min(show * (1 + showLiftVal), 1);
    const newClose = Math.min(close * (1 + closeLiftVal), 1);

    const newBooked = leads * newL2b;
    const newShowed = newBooked * newShow;
    const newClosed = newShowed * newClose;
    const newRev = newClosed * ticket;

    const extra = Math.max(newRev - rev, 0);

    const setup = Number(implSetupCost) || 0;
    const monthly = Number(implMonthlyFee) || 0;
    const totalInvestmentYear1 = setup + monthly * 12;

    const payback =
      extra > 0 ? Math.max(totalInvestmentYear1 / (extra || 1), 0) : Infinity;

    return {
      baseCloses: closed,
      baseRevenue: rev,
      sopCloses: newClosed,
      sopRevenue: newRev,
      sopExtraRevenue: extra,
      paybackMonths: payback,
    };
  }, [
    leadsPerMonth,
    leadToBookRate,
    showRate,
    closeRate,
    avgTicket,
    bookLiftDelta,
    showLift,
    closeLift,
    implSetupCost,
    implMonthlyFee,
  ]);

  // Derived metrics: Calculator 2
  const {
    missedCallsPerMonth,
    aiReached,
    aiBooked,
    aiClosed,
    aiRecoveredRevenue,
  } = useMemo(() => {
    const dailyCalls = Number(dailyInboundCalls) || 0;
    const missedPct = (Number(missedRate) || 0) / 100;
    const reachPct = (Number(aiReachRate) || 0) / 100;
    const convertPct = (Number(aiConvertRate) || 0) / 100;
    const closePct = (Number(inboundCloseRate) || 0) / 100;
    const ticket = Number(inboundAvgTicket) || 0;
    const days = Number(workingDays) || 0;

    const totalCalls = dailyCalls * days;
    const missed = totalCalls * missedPct;
    const reached = missed * reachPct;
    const booked = reached * convertPct;
    const closed = booked * closePct;
    const recovered = closed * ticket;

    return {
      missedCallsPerMonth: missed,
      aiReached: reached,
      aiBooked: booked,
      aiClosed: closed,
      aiRecoveredRevenue: recovered,
    };
  }, [
    dailyInboundCalls,
    missedRate,
    aiReachRate,
    aiConvertRate,
    inboundCloseRate,
    inboundAvgTicket,
    workingDays,
  ]);

  const industryData = INDUSTRY_COPY[industry];

  return (
    <main className="aid-pricing-page">
      <style>{`
        :root {
          --emerald: #047857;
          --emerald-dark: #065f46;
          --gold: #F4D03F;
          --charcoal: #0F172A;
          --offblack: #020617;
          --offwhite: #F9FAFB;
          --muted: #9CA3AF;
        }

        body {
          margin: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
          background: radial-gradient(circle at top, #022c22 0, #020617 48%, #000000 100%);
          color: #E5E7EB;
        }

        .aid-pricing-page {
          min-height: 100vh;
        }

        .aid-pricing-wrapper {
          max-width: 1120px;
          margin: 0 auto;
          padding: 32px 16px 96px;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
        }

        @media (max-width: 720px) {
          .page-header {
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
          font-size: 0.95rem;
          text-transform: uppercase;
        }

        .brand-tagline {
          font-size: 0.86rem;
          color: var(--muted);
        }

        .header-pill {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          padding: 7px 16px;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
        }

        .header-pill-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 20%, #BBF7D0 0, #22C55E 40%, #166534 100%);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.8);
        }

        .hero-section {
          border-radius: 24px;
          padding: 28px 22px 22px;
          background: radial-gradient(circle at top left, rgba(4, 120, 87, 0.45), rgba(15, 23, 42, 0.98));
          border: 1px solid rgba(148, 163, 184, 0.35);
          box-shadow:
            0 24px 80px rgba(15, 23, 42, 0.9),
            0 0 0 1px rgba(15, 23, 42, 0.7);
          margin-bottom: 26px;
        }

        .hero-top-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
        }

        .hero-title-block {
          max-width: 620px;
        }

        .hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 12px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          font-size: 0.86rem;
          margin-bottom: 10px;
          background: rgba(15, 23, 42, 0.9);
        }

        .hero-kicker span {
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(4, 120, 87, 0.2);
          color: #A7F3D0;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .hero-title {
          margin: 0 0 8px;
          font-size: clamp(2.1rem, 3.3vw, 2.8rem);
          letter-spacing: -0.04em;
          line-height: 1.05;
        }

        .hero-highlight {
          background: linear-gradient(120deg, #F4D03F, #F97316);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-subtitle {
          font-size: 1.02rem;
          color: #E5E7EB;
          max-width: 520px;
        }

        .industry-selector {
          min-width: 240px;
          padding: 10px 12px;
          border-radius: 16px;
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.7);
        }

        .industry-selector-label {
          font-size: 0.83rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 4px;
        }

        .industry-select {
          width: 100%;
          padding: 7px 9px;
          border-radius: 9px;
          border: 1px solid rgba(148, 163, 184, 0.8);
          background: #020617;
          color: #E5E7EB;
          font-size: 0.9rem;
          outline: none;
        }

        .industry-note {
          font-size: 0.8rem;
          color: var(--muted);
          margin-top: 6px;
        }

        .hero-bottom-row {
          margin-top: 18px;
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
          gap: 20px;
        }

        @media (max-width: 900px) {
          .hero-bottom-row {
            grid-template-columns: 1fr;
          }
        }

        .hero-industry-card {
          border-radius: 18px;
          padding: 14px 14px 12px;
          background: radial-gradient(circle at top, rgba(15, 118, 110, 0.35), rgba(15, 23, 42, 0.98));
          border: 1px solid rgba(148, 163, 184, 0.6);
        }

        .hero-industry-headline {
          font-size: 1.02rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .hero-industry-sub {
          font-size: 0.9rem;
          color: #CBD5F5;
          margin-bottom: 6px;
        }

        .hero-industry-example {
          font-size: 0.86rem;
          color: var(--muted);
        }

        .hero-bullet-card {
          border-radius: 18px;
          padding: 14px;
          background: radial-gradient(circle at top, rgba(24, 24, 27, 0.9), rgba(15, 23, 42, 0.98));
          border: 1px solid rgba(148, 163, 184, 0.6);
        }

        .hero-bullet-title {
          font-size: 0.98rem;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .hero-bullet-list {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 0.88rem;
          color: var(--muted);
        }

        .hero-bullet-list li {
          margin-bottom: 4px;
          padding-left: 16px;
          position: relative;
        }

        .hero-bullet-list li::before {
          content: "•";
          position: absolute;
          left: 4px;
          color: var(--gold);
        }

        /* Booking Psychology Diagram */

        .section-title-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 16px;
          margin: 32px 0 10px;
        }

        .section-kicker {
          font-size: 0.82rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .section-title {
          font-size: 1.4rem;
          margin-top: 4px;
        }

        .section-sub {
          font-size: 0.95rem;
          color: #CBD5F5;
          max-width: 520px;
        }

        .slot-diagram-card {
          border-radius: 20px;
          padding: 16px 16px 14px;
          background: radial-gradient(circle at top, rgba(15, 118, 110, 0.4), rgba(15, 23, 42, 0.98));
          border: 1px solid rgba(148, 163, 184, 0.65);
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.8);
        }

        .slot-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .slot-flow {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          font-size: 0.88rem;
        }

        .slot-pill {
          border-radius: 999px;
          padding: 7px 11px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(148, 163, 184, 0.8);
          white-space: nowrap;
        }

        .slot-pill--gold {
          border-color: var(--gold);
          background: rgba(24, 24, 27, 0.98);
        }

        .slot-arrow {
          font-size: 1.1rem;
          color: var(--muted);
        }

        .slot-copy {
          font-size: 0.88rem;
          color: var(--muted);
          margin-top: 10px;
        }

        .slot-copy strong {
          color: #E5E7EB;
        }

        .slot-callout {
          font-size: 0.86rem;
          color: #D1D5DB;
          margin-top: 4px;
        }

        .slot-callout span {
          color: var(--gold);
          font-weight: 600;
        }

        /* Two-column calculators */

        .calc-grid {
          margin-top: 26px;
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
          gap: 18px;
        }

        @media (max-width: 960px) {
          .calc-grid {
            grid-template-columns: 1fr;
          }
        }

        .calc-card {
          border-radius: 18px;
          padding: 16px 16px 14px;
          background: rgba(15, 23, 42, 0.97);
          border: 1px solid rgba(148, 163, 184, 0.7);
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.85);
        }

        .calc-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .calc-sub {
          font-size: 0.86rem;
          color: var(--muted);
          margin-bottom: 10px;
        }

        .calc-grid-inner {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        @media (max-width: 640px) {
          .calc-grid-inner {
            grid-template-columns: 1fr;
          }
        }

        .calc-field label {
          display: block;
          font-size: 0.82rem;
          color: #CBD5F5;
          margin-bottom: 2px;
        }

        .calc-input {
          width: 100%;
          padding: 7px 8px;
          border-radius: 8px;
          border: 1px solid rgba(148, 163, 184, 0.8);
          background: #020617;
          color: #E5E7EB;
          font-size: 0.9rem;
          outline: none;
        }

        .calc-input:focus {
          border-color: var(--emerald);
          box-shadow: 0 0 0 1px rgba(4, 120, 87, 0.5);
        }

        .calc-metric {
          margin-top: 10px;
          padding: 9px 10px;
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(148, 163, 184, 0.75);
          font-size: 0.86rem;
          color: #E5E7EB;
        }

        .calc-metric strong {
          font-size: 1.02rem;
        }

        .calc-metric span {
          color: var(--gold);
          font-weight: 600;
        }

        .calc-footnote {
          margin-top: 6px;
          font-size: 0.8rem;
          color: var(--muted);
        }

        /* Pricing tiers */

        .tiers-section {
          margin-top: 36px;
        }

        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        @media (max-width: 960px) {
          .tiers-grid {
            grid-template-columns: 1fr;
          }
        }

        .tier-card {
          border-radius: 20px;
          padding: 16px 16px 14px;
          background: rgba(15, 23, 42, 0.97);
          border: 1px solid rgba(148, 163, 184, 0.7);
        }

        .tier-card--featured {
          border-color: var(--gold);
          box-shadow: 0 20px 60px rgba(250, 204, 21, 0.2);
          position: relative;
          overflow: hidden;
        }

        .tier-chip {
          font-size: 0.78rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 4px;
        }

        .tier-name {
          font-size: 1.05rem;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .tier-price {
          font-size: 0.95rem;
          margin-bottom: 8px;
          color: #E5E7EB;
        }

        .tier-price span {
          color: var(--gold);
          font-weight: 600;
        }

        .tier-desc {
          font-size: 0.86rem;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .tier-list {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 0.86rem;
          color: #E5E7EB;
        }

        .tier-list li {
          margin-bottom: 4px;
          padding-left: 16px;
          position: relative;
        }

        .tier-list li::before {
          content: "✓";
          position: absolute;
          left: 2px;
          font-size: 0.75rem;
          color: var(--gold);
        }

        .tier-tagline {
          margin-top: 8px;
          font-size: 0.8rem;
          color: var(--muted);
        }

        .cta-strip {
          margin-top: 32px;
          border-radius: 18px;
          padding: 14px 16px;
          background: radial-gradient(circle at top, rgba(4, 120, 87, 0.6), rgba(15, 23, 42, 0.98));
          border: 1px solid rgba(148, 163, 184, 0.75);
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }

        .cta-text {
          font-size: 0.95rem;
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

        .cta-btn-primary,
        .cta-btn-secondary {
          border-radius: 999px;
          border: none;
          padding: 8px 14px;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .cta-btn-primary {
          background: linear-gradient(135deg, #047857, #22C55E);
          color: #ECFDF5;
          box-shadow: 0 12px 34px rgba(16, 185, 129, 0.55);
        }

        .cta-btn-primary:hover {
          transform: translateY(-1px);
        }

        .cta-btn-secondary {
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(148, 163, 184, 0.8);
          color: #E5E7EB;
        }

        .footer-note {
          margin-top: 18px;
          font-size: 0.75rem;
          color: var(--muted);
          text-align: center;
        }
      `}</style>

      <div className="aid-pricing-wrapper">
        {/* HEADER */}
        <header className="page-header">
          <div className="brand-mark">
            <div className="brand-logo" />
            <div className="brand-text">
              <div className="brand-name">ALL IN DIGITAL</div>
              <div className="brand-tagline">AI Workforce &amp; Booking Systems</div>
            </div>
          </div>
          <div className="header-pill">
            <div className="header-pill-dot" />
            <span>From missed calls to a full AI Operating System</span>
          </div>
        </header>

        {/* HERO / INDUSTRY PICKER */}
        <section className="hero-section">
          <div className="hero-top-row">
            <div className="hero-title-block">
              <div className="hero-kicker">
                <span>Pricing + ROI</span>
                <div>See what an AI Operating System could return</div>
              </div>
              <h1 className="hero-title">
                Design your{" "}
                <span className="hero-highlight">AI Operating System</span>{" "}
                around your business — not “just a bot”.
              </h1>
              <p className="hero-subtitle">
                Pick your industry, run the numbers, and see what a full
                end-to-end speed-to-lead + no-show + sales SOP could return in
                booked revenue.
              </p>
            </div>

            <div className="industry-selector">
              <div className="industry-selector-label">FOCUS INDUSTRY</div>
              <select
                className="industry-select"
                value={industry}
                onChange={(e) => setIndustry(e.target.value as Industry)}
              >
                {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="industry-note">
                Content below adapts to{" "}
                <strong>{INDUSTRY_LABELS[industry]}</strong> so you can speak to
                their world in concrete terms.
              </div>
            </div>
          </div>

          <div className="hero-bottom-row">
            <div className="hero-industry-card">
              <div className="hero-industry-headline">
                {industryData.headline}
              </div>
              <div className="hero-industry-sub">{industryData.sub}</div>
              <div className="hero-industry-example">
                Example outcome: one extra{" "}
                <strong>{industryData.example}</strong> booked (and closed)
                already moves the needle.
              </div>
            </div>
            <div className="hero-bullet-card">
              <div className="hero-bullet-title">
                What this Pricing OS actually includes:
              </div>
              <ul className="hero-bullet-list">
                <li>
                  <strong>Slot A/B booking AI</strong> that says “What works
                  best for you?” and does real calendar logic.
                </li>
                <li>
                  <strong>Speed-to-lead SOP</strong> with call + SMS sequences
                  that can boost bookings up to 800%.
                </li>
                <li>
                  <strong>No-show &amp; callback agents</strong> that save
                  dropped consults and “call me later” leads.
                </li>
                <li>
                  <strong>Sales &amp; finance agent handoff</strong> that can
                  handle 10–60 minute consult flows cleanly.
                </li>
                <li>
                  <strong>Real-time lead delivery &amp; outcome updates</strong>{" "}
                  into your pipeline (no “CSV hell”).
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* BOOKING PSYCHOLOGY DIAGRAM */}
        <section>
          <div className="section-title-row">
            <div>
              <div className="section-kicker">BOOKING PSYCHOLOGY FLOW</div>
              <div className="section-title">
                “What works best for you?” — turned into a machine.
              </div>
            </div>
            <p className="section-sub">
              Humans forget. AI doesn’t. This is the Slot A/B booking logic that
              runs the same way on Monday at 9am and Saturday at 11pm.
            </p>
          </div>

          <div className="slot-diagram-card">
            <div className="slot-row">
              <div className="slot-flow">
                <div className="slot-pill slot-pill--gold">
                  Caller: “I&apos;d like to book...”
                </div>
                <div className="slot-arrow">→</div>
                <div className="slot-pill">
                  AI: “What works best for you today?”
                </div>
                <div className="slot-arrow">→</div>
                <div className="slot-pill">
                  Calendar scan (from today forward)
                </div>
                <div className="slot-arrow">→</div>
                <div className="slot-pill slot-pill--gold">
                  Slot A / Slot B offer
                </div>
                <div className="slot-arrow">→</div>
                <div className="slot-pill">Confirmed booking</div>
                <div className="slot-arrow">→</div>
                <div className="slot-pill">SMS link + details</div>
                <div className="slot-arrow">→</div>
                <div className="slot-pill">Backup transfer (optional)</div>
              </div>
            </div>
            <div className="slot-copy">
              Script example:{" "}
              <strong>
                “What works best for you? — without pause — Monday, December
                8th at 9am or 11am?”
              </strong>{" "}
              then repeat this pattern 2–3 times, fall back to SMS, and finally
              to a transfer if needed.
            </div>
            <div className="slot-callout">
              Always-on AI runs this SOP with <span>perfect consistency.</span>{" "}
              Human teams will never follow a 15–20 touch speed-to-lead + no-show
              playbook on every lead for 60 days straight.
            </div>
          </div>
        </section>

        {/* ROI CALCULATORS */}
        <section>
          <div className="section-title-row">
            <div>
              <div className="section-kicker">TWO ROI VIEWS</div>
              <div className="section-title">
                1) Full pipeline uplift. 2) Missed-call recovery.
              </div>
            </div>
            <p className="section-sub">
              Use these to justify budget, present to partners, or sanity-check
              the upside before we even touch ad spend.
            </p>
          </div>

          <div className="calc-grid">
            {/* CALC 1: FULL PIPELINE */}
            <div className="calc-card">
              <div className="calc-title">
                1. Lead → Book → Show → Close Uplift
              </div>
              <div className="calc-sub">
                Model how the end-to-end SOP (booking psychology, no-show fee,
                pre-call video, and AI consistency) affects your core funnel.
              </div>

              <div className="calc-grid-inner">
                <div className="calc-field">
                  <label>Monthly leads / inbound opportunities</label>
                  <input
                    className="calc-input"
                    type="number"
                    min={0}
                    value={leadsPerMonth}
                    onChange={(e) => setLeadsPerMonth(e.target.value)}
                  />
                </div>
                <div className="calc-field">
                  <label>Current lead → booked (%)</label>
                  <input
                    className="calc-input"
                    type="number"
                    min={0}
                    max={100}
                    value={leadToBookRate}
                    onChange={(e) => setLeadToBookRate(e.target.value)}
                  />
                </div>
                <div className="calc-field">
                  <label>Current show rate (%)</label>
                  <input
                    className="calc-input"
                    type="number"
                    min={0}
                    max={100}
                    value={showRate}
                    onChange={(e) => setShowRate(e.target.value)}
                  />
                </div>
                <div className="calc-field">
                  <label>Current close rate (%)</label>
                  <input
                    className="calc-input"
                    type="number"
                    min={0}
                    max={100}
                    value={closeRate}
                    onChange={(e) => setCloseRate(e.target.value)}
                  />
                </div>
                <div className="calc-field">
                  <label>Average ticket / case value ($)</label>
                  <input
                    className="calc-input"
                    type="number"
                    min={0}
                    value={avgTicket}
                    onChange={(e) => setAvgTicket(e.target.value)}
                  />
                </div>

                <div className="calc-field">
                  <label>
                    Change in lead → booked with SOP (%){" "}
                    <span style={{ color: "#9CA3AF", fontSize: "0.75rem" }}>
                      (often -5% to -10% with no-show fee)
                    </span>
                  </label>
                  <input
                    className="calc-input"
                    type="number"
                    value={bookLiftDelta}
                    onChange={(e) => setBookLiftDelta(e.target.value)}
                  />
                </div>
                <div className="calc-field">
                  <label>Show rate lift with SOP (%)</label>
                  <input
                    className="calc-input"
                    type="number"
                    min={0}
                    value={showLift}
                    onChange={(e) => setShowLift(e.target.value)}
                  />
                </div>
                <div className="calc-field">
                  <label>Close rate lift with SOP (%)</label>
                  <input
                    className="calc-input"
                    type="number"
                    min={0}
                    value={closeLift}
                    onChange={(e) => setCloseLift(e.target.value)}
                  />
                </div>
                <div className="calc-field">
                  <label>Implementation setup cost ($)</label>
                  <input
                    className="calc-input"
                    type="number"
                    min={0}
                    value={implSetupCost}
                    onChange={(e) => setImplSetupCost(e.target.value)}
                  />
                </div>
                <div className="calc-field">
                  <label>Ongoing monthly fee ($)</label>
                  <input
                    className="calc-input"
                    type="number"
                    min={0}
                    value={implMonthlyFee}
                    onChange={(e) => setImplMonthlyFee(e.target.value)}
                  />
                </div>
              </div>

              <div className="calc-metric">
                <div>
                  Current monthly revenue from this funnel:{" "}
                  <strong>
                    $
                    {baseRevenue.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </strong>{" "}
                  ({baseCloses.toFixed(1)} closes)
                </div>
                <div style={{ marginTop: 4 }}>
                  With full SOP in place:{" "}
                  <strong>
                    $
                    {sopRevenue.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </strong>{" "}
                  ({sopCloses.toFixed(1)} closes)
                </div>
                <div style={{ marginTop: 4 }}>
                  Estimated extra revenue / month:{" "}
                  <span>
                    $
                    {sopExtraRevenue.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div style={{ marginTop: 4 }}>
                  Rough payback on Year 1 investment:{" "}
                  {Number.isFinite(paybackMonths) && paybackMonths > 0 ? (
                    <span>
                      {paybackMonths.toFixed(1)}{" "}
                      {paybackMonths <= 12 ? "months" : "months (beyond 1 year)"}
                    </span>
                  ) : (
                    <span>—</span>
                  )}
                </div>
              </div>
              <div className="calc-footnote">
                This is intentionally conservative. It doesn&apos;t include lower
                ad CPA, referral lift, or lifetime value. It&apos;s just what the
                end-to-end SOP can do at the front of your funnel.
              </div>
            </div>

            {/* CALC 2: MISSED CALL RECOVERY */}
            <div className="calc-card">
              <div className="calc-title">
                2. Inbound Missed Call &amp; Voicemail Recovery
              </div>
              <div className="calc-sub">
                Your AI workforce runs the full speed-to-lead sequence on every
                missed call and voicemail: 5–10 SMS + 15–20 calls over 30–60
                days.
              </div>

              <div className="calc-grid-inner">
                <div className="calc-field">
                  <label>Average inbound calls per day</label>
                  <input
                    className="calc-input"
                    type="number"
                    min={0}
                    value={dailyInboundCalls}
                    onChange={(e) => setDailyInboundCalls(e.target.value)}
                  />
                </div>
                <div className="calc-field">
                  <label>Estimated missed / voicemail (%)</label>
                  <input
                    className="calc-input"
                    type="number"
                    min={0}
                    max={100}
                    value={missedRate}
                    onChange={(e) => setMissedRate(e.target.value)}
                  />
                </div>
                <div className="calc-field">
                  <label>AI reaches these missed leads (%)</label>
                  <input
                    className="calc-input"
                    type="number"
                    min={0}
                    max={100}
                    value={aiReachRate}
                    onChange={(e) => setAiReachRate(e.target.value)}
                  />
                </div>
                <div className="calc-field">
                  <label>AI books from reached leads (%)</label>
                  <input
                    className="calc-input"
                    type="number"
                    min={0}
                    max={100}
                    value={aiConvertRate}
                    onChange={(e) => setAiConvertRate(e.target.value)}
                  />
                </div>
                <div className="calc-field">
                  <label>Show / consult completion rate (%)</label>
                  <input
                    className="calc-input"
                    type="number"
                    min={0}
                    max={100}
                    value={inboundCloseRate}
                    onChange={(e) => setInboundCloseRate(e.target.value)}
                  />
                </div>
                <div className="calc-field">
                  <label>Average ticket / job size ($)</label>
                  <input
                    className="calc-input"
                    type="number"
                    min={0}
                    value={inboundAvgTicket}
                    onChange={(e) => setInboundAvgTicket(e.target.value)}
                  />
                </div>
                <div className="calc-field">
                  <label>Working days per month</label>
                  <input
                    className="calc-input"
                    type="number"
                    min={0}
                    value={workingDays}
                    onChange={(e) => setWorkingDays(e.target.value)}
                  />
                </div>
              </div>

              <div className="calc-metric">
                <div>
                  Missed / voicemail calls per month:{" "}
                  <strong>{missedCallsPerMonth.toFixed(0)}</strong>
                </div>
                <div style={{ marginTop: 4 }}>
                  AI re-engages:{" "}
                  <strong>{aiReached.toFixed(0)} calls</strong>
                </div>
                <div style={{ marginTop: 4 }}>
                  AI books: <strong>{aiBooked.toFixed(0)} extra slots</strong>
                </div>
                <div style={{ marginTop: 4 }}>
                  Estimated extra completed jobs / cases:{" "}
                  <strong>{aiClosed.toFixed(0)}</strong>
                </div>
                <div style={{ marginTop: 4 }}>
                  Estimated extra revenue / month from missed calls:{" "}
                  <span>
                    $
                    {aiRecoveredRevenue.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </div>
              <div className="calc-footnote">
                This reflects just the missed-call / voicemail layer. When you
                stack this on top of the full Booking Psychology SOP, the
                compounding effect is where the big revenue lives.
              </div>
            </div>
          </div>
        </section>

        {/* TIERS */}
        <section className="tiers-section">
          <div className="section-title-row">
            <div>
              <div className="section-kicker">TIERS &amp; IMPLEMENTATION</div>
              <div className="section-title">
                Start simple, or go straight to the full end-to-end SOP.
              </div>
            </div>
            <p className="section-sub">
              We&apos;ll tailor specifics to{" "}
              <strong>{INDUSTRY_LABELS[industry]}</strong>, but these tiers give
              you a realistic lane for budget and scope.
            </p>
          </div>

          <div className="tiers-grid">
            {/* Tier 1 */}
            <div className="tier-card">
              <div className="tier-chip">TIER 1 — FOUNDATION</div>
              <div className="tier-name">Core Booking &amp; Callback OS</div>
              <div className="tier-price">
                <span>Entry-level project</span> — built around your inbound
                calls.
              </div>
              <div className="tier-desc">
                Designed for teams that want AI handling basic booking, simple
                intake, and structured callbacks without touching the whole
                sales stack yet.
              </div>
              <ul className="tier-list">
                <li>Inbound AI booking agent (Slot A/B or link-based).</li>
                <li>Callback agent for “call me later” leads.</li>
                <li>Basic FAQ connection to your website.</li>
                <li>TCPA / FCC-aligned landing page + consent language.</li>
                <li>Real-time lead delivery into your CRM or sheet.</li>
              </ul>
              <div className="tier-tagline">
                Perfect for proving the model and recapturing dropped inbound
                demand before scaling up.
              </div>
            </div>

            {/* Tier 2 */}
            <div className="tier-card">
              <div className="tier-chip">TIER 2 — GROWTH</div>
              <div className="tier-name">
                No-Show, Recovery &amp; Nurture OS
              </div>
              <div className="tier-price">
                <span>Mid-size project</span> — layered on top of your existing
                booking.
              </div>
              <div className="tier-desc">
                Ideal if you already book a decent calendar, but no-shows,
                cancellations, and “not now” leads quietly bleed revenue.
              </div>
              <ul className="tier-list">
                <li>No-show AI agent with voice + SMS sequences.</li>
                <li>Multi-touch recovery SOP (up to 15–20 calls, 5–10 SMS).</li>
                <li>“Call me later” logic wired into your calendars.</li>
                <li>Outcome tracking (show, no-show, reschedule, lost).</li>
                <li>Reporting on recovered revenue and show-rate lift.</li>
              </ul>
              <div className="tier-tagline">
                Great for med spas, dental, and home services losing thousands
                in unused time every month.
              </div>
            </div>

            {/* Tier 3 */}
            <div className="tier-card tier-card--featured">
              <div className="tier-chip">TIER 3 — FULL AI OPERATING SYSTEM</div>
              <div className="tier-name">
                End-to-End Speed-to-Lead + Sales SOP
              </div>
              <div className="tier-price">
                Starting around <span>$6,200</span> for full build-out +{" "}
                <span>$1,250/mo</span> for ongoing optimization and AB testing.
              </div>
              <div className="tier-desc">
                This is the complete stack: booking psychology, pre-call video,
                no-show fee anchoring, callback flows, sales &amp; finance
                agents, plus continuous AB testing.
              </div>
              <ul className="tier-list">
                <li>
                  Slot A/B booking agent that runs your full script{" "}
                  <em>every single time</em>.
                </li>
                <li>
                  10–25 minute pre-call sales video SOP (anchoring no-show fee,
                  your story, authority, and offer value).
                </li>
                <li>
                  No-show fee logic that typically sacrifices 5–10% of bookings
                  to gain 20–60% higher show rates.
                </li>
                <li>
                  Dedicated callback, no-show, sales, and finance agents with
                  clean variable handoff between each node.
                </li>
                <li>
                  Weekly AB tests on scripts, offers, and flows – routing 5–10%
                  of calls to test variants before rolling out winners.
                </li>
                <li>
                  Real-time lead + outcome updates, ready for your CRM and
                  reporting stack.
                </li>
              </ul>
              <div className="tier-tagline">
                Built for teams serious about turning this into an{" "}
                <strong>operating system</strong>, not a one-off bot. Pricing
                adjusts with complexity, volume, and how deep we go into your
                sales cycles.
              </div>
            </div>
          </div>
        </section>

        {/* CTA STRIP */}
        <div className="cta-strip">
          <div className="cta-text">
            Ready to see this{" "}
            <span>speed-to-lead + no-show + sales OS</span> run for{" "}
            {INDUSTRY_LABELS[industry]} in real time?
          </div>
          <div className="cta-buttons">
            <a href="/" className="cta-btn-primary">
              Run a live AI demo call
            </a>
            <a href="tel:2396880201" className="cta-btn-secondary">
              Or call 239-688-0201
            </a>
          </div>
        </div>

        <div className="footer-note">
          Use this page live on calls to walk prospects through the diagrams and
          calculators — then let the AI demo and your pre-call video do the
          heavy lifting.
        </div>
      </div>
    </main>
  );
}