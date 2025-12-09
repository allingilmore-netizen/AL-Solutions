"use client";

import { useState } from "react";

type ViewTab = "overview" | "systems" | "pricing" | "plans";

export default function PricingPage() {
  const [tab, setTab] = useState<ViewTab>("overview");

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
          margin-bottom: 26px;
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
          color: var(--text-muted);
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .header-pill {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          padding: 7px 16px;
          font-size: 0.86rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(12px);
          color: #E5E7EB;
        }

        .header-pill-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 20%, #BBF7D0 0, #22C55E 40%, #166534 100%);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.7);
        }

        .header-call {
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 0.86rem;
          font-weight: 600;
          border: 1px solid rgba(148, 163, 184, 0.7);
          background: rgba(15, 23, 42, 0.8);
          color: #E5E7EB;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .header-call span {
          font-size: 0.9rem;
        }

        .hero-card {
          border-radius: 24px;
          padding: 26px 20px 20px;
          background: radial-gradient(circle at top left, rgba(4, 120, 87, 0.4), rgba(15, 23, 42, 0.96));
          border: 1px solid rgba(148, 163, 184, 0.35);
          box-shadow:
            0 24px 80px rgba(15, 23, 42, 0.9),
            0 0 0 1px rgba(15, 23, 42, 0.85);
          margin-bottom: 22px;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 13px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.6);
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 14px;
        }

        .hero-eyebrow span {
          padding: 2px 9px;
          border-radius: 999px;
          background: rgba(4, 120, 87, 0.2);
          color: #A7F3D0;
          font-weight: 600;
          font-size: 0.82rem;
        }

        .hero-title {
          font-size: clamp(2.1rem, 3.2vw, 2.7rem);
          line-height: 1.05;
          letter-spacing: -0.04em;
          margin: 0 0 10px;
        }

        .hero-highlight {
          background: linear-gradient(120deg, #F4D03F, #F9A826);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-subtitle {
          font-size: 1.02rem;
          line-height: 1.6;
          max-width: 640px;
          color: #CBD5F5;
        }

        .hero-subtitle strong {
          color: #FBBF24;
        }

        .hero-cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }

        .hero-cta-primary,
        .hero-cta-secondary {
          border-radius: 999px;
          border: none;
          padding: 9px 16px;
          font-size: 0.96rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
        }

        .hero-cta-primary {
          background: linear-gradient(135deg, #047857, #22C55E);
          color: #ECFDF5;
          box-shadow: 0 14px 40px rgba(16, 185, 129, 0.45);
        }

        .hero-cta-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 52px rgba(16, 185, 129, 0.7);
        }

        .hero-cta-secondary {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.7);
          color: #E5E7EB;
        }

        .hero-cta-secondary:hover {
          background: rgba(15, 23, 42, 1);
          transform: translateY(-1px);
        }

        .hero-footnote {
          margin-top: 10px;
          font-size: 0.86rem;
          color: var(--text-muted);
        }

        .tab-strip {
          margin-top: 22px;
          display: inline-flex;
          flex-wrap: wrap;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.6);
          padding: 4px;
          gap: 4px;
        }

        .tab-btn {
          border-radius: 999px;
          border: none;
          padding: 6px 12px;
          font-size: 0.88rem;
          cursor: pointer;
          background: transparent;
          color: #CBD5F5;
          opacity: 0.7;
          transition: background 0.16s ease, opacity 0.16s ease;
        }

        .tab-btn--active {
          background: rgba(15, 23, 42, 1);
          opacity: 1;
        }

        .layout-grid {
          margin-top: 22px;
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
          gap: 20px;
          align-items: flex-start;
        }

        @media (max-width: 900px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            justify-content: flex-start;
          }

          .layout-grid {
            grid-template-columns: 1fr;
          }

          .hero-card {
            padding: 20px 16px 16px;
          }
        }

        .panel {
          border-radius: 18px;
          padding: 16px 14px 14px;
          background: radial-gradient(circle at top, rgba(15, 118, 110, 0.32), rgba(15, 23, 42, 0.96));
          border: 1px solid rgba(148, 163, 184, 0.58);
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.85);
        }

        .panel-alt {
          background: radial-gradient(circle at top, rgba(24, 24, 27, 0.9), rgba(15, 23, 42, 0.98));
        }

        .panel-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 8px;
        }

        .panel-title {
          font-size: 1.02rem;
          font-weight: 600;
        }

        .panel-tag {
          font-size: 0.8rem;
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          color: var(--text-muted);
        }

        .panel-body {
          font-size: 0.94rem;
          color: #E5E7EB;
        }

        .diagram {
          margin-top: 10px;
          border-radius: 14px;
          padding: 10px 10px 9px;
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.7);
          font-size: 0.9rem;
        }

        .diagram-steps {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .diagram-pill {
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 0.82rem;
          border: 1px solid rgba(148, 163, 184, 0.7);
          background: rgba(15, 23, 42, 0.9);
          white-space: nowrap;
        }

        .diagram-arrow {
          font-size: 0.8rem;
          opacity: 0.6;
          display: inline-flex;
          align-items: center;
        }

        .diagram-caption {
          margin-top: 8px;
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .list-tight {
          list-style: disc;
          padding-left: 18px;
          margin: 6px 0 0;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .list-tight li {
          margin-bottom: 4px;
        }

        .two-col {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 10px;
        }

        @media (max-width: 700px) {
          .two-col {
            grid-template-columns: 1fr;
          }
        }

        .mini-card {
          border-radius: 12px;
          padding: 9px 10px;
          background: rgba(15, 23, 42, 0.98);
          border: 1px solid rgba(148, 163, 184, 0.6);
          font-size: 0.88rem;
        }

        .mini-card-title {
          font-weight: 600;
          margin-bottom: 3px;
        }

        .mini-card-tag {
          font-size: 0.76rem;
          color: #FBBF24;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-top: 10px;
        }

        @media (max-width: 960px) {
          .pricing-grid {
            grid-template-columns: 1fr;
          }
        }

        .price-tier {
          border-radius: 16px;
          padding: 13px 12px 12px;
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.65);
        }

        .price-tier-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 4px;
        }

        .price-tier-name {
          font-size: 1.02rem;
          font-weight: 600;
        }

        .price-tier-pill {
          font-size: 0.78rem;
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          color: var(--text-muted);
        }

        .price-main {
          font-size: 1.1rem;
          font-weight: 700;
          margin-top: 2px;
        }

        .price-sub {
          font-size: 0.84rem;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .price-list {
          margin: 0;
          padding-left: 18px;
          font-size: 0.9rem;
          color: #CBD5F5;
        }

        .price-list li {
          margin-bottom: 4px;
        }

        .price-footnote {
          margin-top: 6px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .plans-table {
          margin-top: 8px;
          border-radius: 14px;
          border: 1px solid rgba(148, 163, 184, 0.65);
          overflow: hidden;
          font-size: 0.86rem;
        }

        .plans-row {
          display: grid;
          grid-template-columns: 2.2fr 1.2fr 1.3fr;
        }

        .plans-head {
          background: rgba(15, 23, 42, 0.98);
          font-weight: 600;
        }

        .plans-cell {
          padding: 7px 9px;
          border-bottom: 1px solid rgba(31, 41, 55, 0.9);
        }

        .plans-row:nth-child(even):not(.plans-head) .plans-cell {
          background: rgba(15, 23, 42, 0.92);
        }

        .plans-row:nth-child(odd):not(.plans-head) .plans-cell {
          background: rgba(15, 23, 42, 0.86);
        }

        .cta-banner {
          margin-top: 26px;
          border-radius: 18px;
          padding: 14px 14px 12px;
          background: radial-gradient(circle at top, rgba(4, 120, 87, 0.35), rgba(15, 23, 42, 0.96));
          border: 1px solid rgba(148, 163, 184, 0.7);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          justify-content: space-between;
        }

        .cta-banner strong {
          color: #FBBF24;
        }

        .cta-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .cta-small-btn {
          border-radius: 999px;
          border: none;
          padding: 7px 13px;
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .cta-small-btn--primary {
          background: linear-gradient(135deg, #047857, #22C55E);
          color: #ECFDF5;
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.55);
        }

        .cta-small-btn--ghost {
          background: transparent;
          border: 1px solid rgba(148, 163, 184, 0.8);
          color: #E5E7EB;
        }

        .footer-legal {
          margin-top: 32px;
          font-size: 0.72rem;
          color: #6B7280;
          text-align: center;
          opacity: 0.85;
        }

        .footer-legal a {
          color: inherit;
          text-decoration: none;
          border-bottom: 1px solid rgba(107, 114, 128, 0.3);
          padding-bottom: 1px;
        }

        .footer-legal a:hover {
          border-bottom-color: rgba(148, 163, 184, 0.8);
        }
      `}</style>

      <div className="aid-pricing-wrapper">
        <header className="page-header">
          <div className="brand-mark">
            <div className="brand-logo" />
            <div className="brand-text">
              <div className="brand-name">ALL IN DIGITAL</div>
              <div className="brand-tagline">AI Revenue Operating Systems</div>
            </div>
          </div>
          <div className="header-actions">
            <div className="header-pill">
              <div className="header-pill-dot" />
              <span>From “AI agent” to full operating system</span>
            </div>
            <a className="header-call" href="tel:2396880201">
              <span>📞</span>
              <span>Call Tom · 239-688-0201</span>
            </a>
          </div>
        </header>

        <section className="hero-card">
          <div className="hero-eyebrow">
            <span>Interactive Pricing</span>
            <div>See the full system · Not just a bot</div>
          </div>
          <h1 className="hero-title">
            Turn your leads, calls, and no-shows into an{" "}
            <span className="hero-highlight">AI Revenue Operating System.</span>
          </h1>
          <p className="hero-subtitle">
            Stop paying for random automations.{" "}
            <strong>
              This is a complete operating system around your lead flow, booking,
              no-shows, and sales
            </strong>{" "}
            — with real-time lead delivery and always-on agents that do not get tired.
          </p>

          <div className="hero-cta-row">
            <a href="/" className="hero-cta-primary">
              See the live Speed-to-Lead demo
            </a>
            <a
              href="https://calendly.com/tom-vge/new-meeting"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-cta-secondary"
            >
              Book a consult to walk through this
            </a>
          </div>

          <p className="hero-footnote">
            Most clients plug this into their existing traffic and{" "}
            <strong>add 20–40% more closed revenue</strong> without touching ad spend.
          </p>

          <div className="tab-strip" aria-label="View selector">
            <button
              type="button"
              className={
                "tab-btn" + (tab === "overview" ? " tab-btn--active" : "")
              }
              onClick={() => setTab("overview")}
            >
              1 · Overview
            </button>
            <button
              type="button"
              className={
                "tab-btn" + (tab === "systems" ? " tab-btn--active" : "")
              }
              onClick={() => setTab("systems")}
            >
              2 · Systems & Diagrams
            </button>
            <button
              type="button"
              className={
                "tab-btn" + (tab === "pricing" ? " tab-btn--active" : "")
              }
              onClick={() => setTab("pricing")}
            >
              3 · Interactive Pricing
            </button>
            <button
              type="button"
              className={
                "tab-btn" + (tab === "plans" ? " tab-btn--active" : "")
              }
              onClick={() => setTab("plans")}
            >
              4 · Minutes & SMS Plans
            </button>
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="layout-grid">
          {/* LEFT SIDE – content changes by tab */}
          <div>
            {tab === "overview" && (
              <>
                <div className="panel">
                  <div className="panel-header-row">
                    <div className="panel-title">What you&apos;re really buying</div>
                    <div className="panel-tag">Not “just an AI agent”</div>
                  </div>
                  <div className="panel-body">
                    <p>
                      You are not paying for a random voice bot. You are buying a{" "}
                      <strong>repeatable operating system</strong> around:
                    </p>
                    <ul className="list-tight">
                      <li>Inbound speed-to-lead (from form to ringing phone).</li>
                      <li>
                        High-intent booking flows with Slot A/B options (“what works best for
                        you?”).
                      </li>
                      <li>
                        No-show enforcement and pre-call positioning so people actually show.
                      </li>
                      <li>
                        A pre-call video system that warms the lead and anchors your value.
                      </li>
                      <li>
                        A 30–60 day follow-up engine that quietly rescues &quot;not yet&quot;
                        leads.
                      </li>
                    </ul>
                    <p style={{ marginTop: 8 }}>
                      The diagrams on this page are the top-level map. The{" "}
                      <strong>exact scripts, timing, and logic are proprietary</strong> and
                      delivered only to paying clients.
                    </p>
                  </div>
                </div>

                <div className="panel panel-alt" style={{ marginTop: 16 }}>
                  <div className="panel-header-row">
                    <div className="panel-title">The 3 layers of your AI Operating System</div>
                    <div className="panel-tag">Stacked, not random</div>
                  </div>
                  <div className="panel-body two-col">
                    <div className="mini-card">
                      <div className="mini-card-title">Layer 1 · Traffic → Lead</div>
                      <div className="mini-card-tag">Landing Page OS</div>
                      <ul className="list-tight">
                        <li>Emerald + gold, conversion-first landing bundle.</li>
                        <li>Real-time lead delivery into your system.</li>
                        <li>TCPA / FCC compliant forms and consent language.</li>
                      </ul>
                    </div>
                    <div className="mini-card">
                      <div className="mini-card-title">Layer 2 · Lead → Show</div>
                      <div className="mini-card-tag">Speed-to-Lead Engine</div>
                      <ul className="list-tight">
                        <li>Instant SMS + callback logic.</li>
                        <li>Booking call with Slot A/B options.</li>
                        <li>No-show fee psychology and pre-call video.</li>
                      </ul>
                    </div>
                    <div className="mini-card">
                      <div className="mini-card-title">Layer 3 · Show → Closed</div>
                      <div className="mini-card-tag">Sales & Follow-Up OS</div>
                      <ul className="list-tight">
                        <li>Sales-ready handoff and scripting.</li>
                        <li>Finance / payment agent if needed.</li>
                        <li>20–60 day call + SMS follow-up engine.</li>
                      </ul>
                    </div>
                    <div className="mini-card">
                      <div className="mini-card-title">Optional · Dispatch & Ops</div>
                      <div className="mini-card-tag">Field & Service OS</div>
                      <ul className="list-tight">
                        <li>Dispatcher agent wired into your calendar.</li>
                        <li>ETA + reschedule calls handled by AI.</li>
                        <li>Free your humans for the actual work.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}

            {tab === "systems" && (
              <>
                {/* Speed-to-Lead Diagram */}
                <div className="panel">
                  <div className="panel-header-row">
                    <div className="panel-title">Speed-to-Lead Engine</div>
                    <div className="panel-tag">Form → Ringing phone in under a minute</div>
                  </div>
                  <div className="panel-body">
                    <p>
                      This is the front door. When someone fills out your form, they don&apos;t
                      get lost. They go into a tight, proven speed-to-lead sequence:
                    </p>
                    <div className="diagram">
                      <div className="diagram-steps">
                        <div className="diagram-pill">Form submitted</div>
                        <div className="diagram-arrow">→</div>
                        <div className="diagram-pill">Instant SMS: &quot;Heads up, we&apos;ll call&quot;</div>
                        <div className="diagram-arrow">→</div>
                        <div className="diagram-pill">1st call attempt (AI agent)</div>
                        <div className="diagram-arrow">→</div>
                        <div className="diagram-pill">Voicemail if needed</div>
                        <div className="diagram-arrow">→</div>
                        <div className="diagram-pill">2nd call attempt</div>
                        <div className="diagram-arrow">→</div>
                        <div className="diagram-pill">Short SMS follow-up</div>
                      </div>
                      <div className="diagram-caption">
                        The full sequence runs over the first few minutes. After that, leads
                        enter a longer follow-up engine (15–20 human-style calls + 5–10 SMS over{" "}
                        30–60 days). The exact timing and scripting are client-only IP.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Psychology Diagram */}
                <div className="panel panel-alt" style={{ marginTop: 16 }}>
                  <div className="panel-header-row">
                    <div className="panel-title">Booking Psychology Flow</div>
                    <div className="panel-tag">“What works best for you?”</div>
                  </div>
                  <div className="panel-body">
                    <p>
                      A big difference between “meh” booking and high conversion is how the slot is
                      presented. Your AI doesn&apos;t ask open-ended &quot;when are you free?&quot;
                      questions. It sells the slot.
                    </p>
                    <div className="diagram">
                      <div className="diagram-steps">
                        <div className="diagram-pill">Caller says what they&apos;re trying to fix</div>
                        <div className="diagram-arrow">→</div>
                        <div className="diagram-pill">AI: “What works best for you…”</div>
                        <div className="diagram-arrow">→</div>
                        <div className="diagram-pill">
                          Slot A/B offer: “Mon 9:00am or Mon 11:00am?”
                        </div>
                        <div className="diagram-arrow">→</div>
                        <div className="diagram-pill">Confirmation + expectations</div>
                        <div className="diagram-arrow">→</div>
                        <div className="diagram-pill">SMS calendar link as backup</div>
                        <div className="diagram-arrow">→</div>
                        <div className="diagram-pill">Optional transfer to human</div>
                      </div>
                      <div className="diagram-caption">
                        Always-on agent consistency. Human teams rarely offer slots the same way,
                        every time, on every call. The AI does — and that&apos;s where a lot of lift
                        comes from.
                      </div>
                    </div>
                  </div>
                </div>

                {/* No-show + Pre-call video */}
                <div className="panel" style={{ marginTop: 16 }}>
                  <div className="panel-header-row">
                    <div className="panel-title">No-Show Physics & Pre-Call Video</div>
                    <div className="panel-tag">Show rate ↑ · Time waste ↓</div>
                  </div>
                  <div className="panel-body">
                    <p>
                      Two levers here:{" "}
                      <strong>no-show fee psychology</strong> and a{" "}
                      <strong>required pre-call video.</strong>
                    </p>
                    <div className="two-col">
                      <div className="mini-card">
                        <div className="mini-card-title">$100 no-show anchor</div>
                        <ul className="list-tight">
                          <li>
                            Booking call positions a nominal $100 no-show fee as standard policy.
                          </li>
                          <li>
                            This alone can reduce no-shows by <strong>20–60%</strong> depending on
                            industry.
                          </li>
                          <li>
                            You choose whether to actually enforce it — we can wire in invoicing if
                            you want.
                          </li>
                        </ul>
                      </div>
                      <div className="mini-card">
                        <div className="mini-card-title">Pre-call value video</div>
                        <ul className="list-tight">
                          <li>10–15 minute &quot;required&quot; pre-call video.</li>
                          <li>
                            Shows your story, proof, reviews, and why your offer is worth 2–10x the
                            price.
                          </li>
                          <li>
                            Sales or field team re-anchors it on the call (“what did you notice in
                            that video?”).
                          </li>
                          <li>
                            That alone can increase close rates by{" "}
                            <strong>20–40% on the same lead volume.</strong>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Follow-up Engine */}
                <div className="panel panel-alt" style={{ marginTop: 16 }}>
                  <div className="panel-header-row">
                    <div className="panel-title">Follow-Up Engine (30–60 days)</div>
                    <div className="panel-tag">“Not now” ≠ “Never”</div>
                  </div>
                  <div className="panel-body">
                    <p>
                      Most businesses leave a scary amount of money in{" "}
                      <strong>&quot;not now&quot; or &quot;call me later&quot; land.</strong> This
                      engine quietly rescues those.
                    </p>
                    <div className="diagram">
                      <div className="diagram-steps">
                        <div className="diagram-pill">Lead doesn&apos;t book / no-shows / says &quot;later&quot;</div>
                        <div className="diagram-arrow">→</div>
                        <div className="diagram-pill">Drip of human-style calls</div>
                        <div className="diagram-arrow">→</div>
                        <div className="diagram-pill">Occasional, relevant SMS</div>
                        <div className="diagram-arrow">→</div>
                        <div className="diagram-pill">Reactivated booking or handoff to sales</div>
                      </div>
                      <div className="diagram-caption">
                        Inside: ~15–20 call attempts and 5–10 SMS over 30–60 days, tuned to your
                        sales cycle. Exact copy, timing, and branching are not published — they are
                        implemented directly in your system.
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {tab === "pricing" && (
              <>
                {/* Landing Page OS */}
                <div className="panel">
                  <div className="panel-header-row">
                    <div className="panel-title">Landing Page Operating System</div>
                    <div className="panel-tag">Traffic → Lead (with compliance)</div>
                  </div>
                  <div className="panel-body">
                    <p>
                      This is the front-end of the OS — SaaS-style, emerald + gold landing pages
                      built for speed-to-lead and TCPA / FCC compliance.
                    </p>
                    <div className="pricing-grid">
                      <div className="price-tier">
                        <div className="price-tier-header">
                          <div className="price-tier-name">Landing Bundle</div>
                          <div className="price-tier-pill">Buy 1 · Get 2</div>
                        </div>
                        <div className="price-main">$2,600 one-time</div>
                        <div className="price-sub">
                          3 coordinated landing pages (1 core + 2 variants).
                        </div>
                        <ul className="price-list">
                          <li>Designed and hosted on our stack.</li>
                          <li>Speed-to-lead form &amp; consent baked in.</li>
                          <li>Real-time lead delivery into your system.</li>
                          <li>Ready for AI agent routing from day one.</li>
                        </ul>
                      </div>

                      <div className="price-tier">
                        <div className="price-tier-header">
                          <div className="price-tier-name">Landing Retainer</div>
                          <div className="price-tier-pill">Per month</div>
                        </div>
                        <div className="price-main">$197 /mo · first page</div>
                        <div className="price-sub">$98 /mo per additional page</div>
                        <ul className="price-list">
                          <li>Hosting, uptime, and core maintenance.</li>
                          <li>Minor copy / layout tweaks as needed.</li>
                          <li>Real-time lead routing upkeep.</li>
                          <li>Perfect when running multiple offers or locations.</li>
                        </ul>
                        <div className="price-footnote">
                          Example: 3 pages = $393/mo (197 + 98 + 98).
                        </div>
                      </div>

                      <div className="price-tier">
                        <div className="price-tier-header">
                          <div className="price-tier-name">Launch Incentive</div>
                          <div className="price-tier-pill">For serious buyers</div>
                        </div>
                        <div className="price-main">1st month core agent fees covered</div>
                        <div className="price-sub">
                          When you start with 3 landing pages (≈ $393/mo).
                        </div>
                        <ul className="price-list">
                          <li>
                            We cover the basic activation fee, starter minutes, and SMS for month
                            one.
                          </li>
                          <li>You only pay overages if you blow past volume.</li>
                          <li>Gives you a clean runway to see results.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Agent Builds */}
                <div className="panel panel-alt" style={{ marginTop: 16 }}>
                  <div className="panel-header-row">
                    <div className="panel-title">AI Agent Build Options</div>
                    <div className="panel-tag">Layered by complexity</div>
                  </div>
                  <div className="panel-body">
                    <div className="pricing-grid">
                      <div className="price-tier">
                        <div className="price-tier-header">
                          <div className="price-tier-name">Basic Inbound Agent</div>
                          <div className="price-tier-pill">Great starter</div>
                        </div>
                        <div className="price-main">$35 activation</div>
                        <div className="price-sub">
                          + voice &amp; SMS plan of your choice (below).
                        </div>
                        <ul className="price-list">
                          <li>1 inbound AI agent.</li>
                          <li>Basic FAQ via your existing website.</li>
                          <li>Basic calendar connection and intake.</li>
                          <li>1 phone number and caller info capture.</li>
                        </ul>
                        <div className="price-footnote">
                          Need deeper FAQ? Add a 20-question FAQ pack for $125 one-time.
                        </div>
                      </div>

                      <div className="price-tier">
                        <div className="price-tier-header">
                          <div className="price-tier-name">Custom Agent (no complex booking)</div>
                          <div className="price-tier-pill">Service, triage, simple booking</div>
                        </div>
                        <div className="price-main">$260 one-time per agent</div>
                        <div className="price-sub">+ $35 per automation buildout</div>
                        <ul className="price-list">
                          <li>Custom intake and routing logic.</li>
                          <li>Can text booking links instead of handling slot logic.</li>
                          <li>Optional multi-agent routing ($150–$300).</li>
                          <li>Plug in your CRM integration for $80 one-time.</li>
                        </ul>
                      </div>

                      <div className="price-tier">
                        <div className="price-tier-header">
                          <div className="price-tier-name">Complex Slot A/B Booking Agent</div>
                          <div className="price-tier-pill">Higher-end booking logic</div>
                        </div>
                        <div className="price-main">
                          $800–$1,250 per agent (scope-based)
                        </div>
                        <div className="price-sub">
                          For “what works best for you” booking with layered fallbacks.
                        </div>
                        <ul className="price-list">
                          <li>Slot A/B logic + calendar scanning.</li>
                          <li>Multiple attempts to get a firm time.</li>
                          <li>SMS fallback with booking links.</li>
                          <li>Optional transfer path to human if needed.</li>
                        </ul>
                        <div className="price-footnote">
                          Priced higher when booking, sales, and finance logic are all combined in
                          one flow.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Systems Bundles */}
                <div className="panel" style={{ marginTop: 16 }}>
                  <div className="panel-header-row">
                    <div className="panel-title">90-Day System Packages</div>
                    <div className="panel-tag">For people who want the whole engine</div>
                  </div>
                  <div className="panel-body pricing-grid">
                    <div className="price-tier">
                      <div className="price-tier-header">
                        <div className="price-tier-name">No-Show + Callback OS</div>
                        <div className="price-tier-pill">Show rate ↑</div>
                      </div>
                      <div className="price-main">$1,700 setup · $350/mo</div>
                      <div className="price-sub">Designed to rescue dropped and delayed leads.</div>
                      <ul className="price-list">
                        <li>Callback agent + no-show recovery logic.</li>
                        <li>Embedded into your speed-to-lead flows.</li>
                        <li>Includes call + SMS follow-up patterns.</li>
                        <li>Ideal add-on to an existing inbound team.</li>
                      </ul>
                    </div>

                    <div className="price-tier">
                      <div className="price-tier-header">
                        <div className="price-tier-name">Dispatcher &amp; Field OS</div>
                        <div className="price-tier-pill">Ops layer</div>
                      </div>
                      <div className="price-main">$2,600 setup · $530/mo</div>
                      <div className="price-sub">Great for home services and field teams.</div>
                      <ul className="price-list">
                        <li>Dispatcher agent wired into your calendar.</li>
                        <li>Handles ETAs, running-late calls, reschedules.</li>
                        <li>Reduces &quot;where is my tech?&quot; phone chaos.</li>
                        <li>Keeps humans focused on billable work.</li>
                      </ul>
                    </div>

                    <div className="price-tier">
                      <div className="price-tier-header">
                        <div className="price-tier-name">Sales OS (Booking + Sales + Finance)</div>
                        <div className="price-tier-pill">3-Agent system</div>
                      </div>
                      <div className="price-main">$4,400 setup · $620/mo</div>
                      <div className="price-sub">Built for teams selling real ticket sizes.</div>
                      <ul className="price-list">
                        <li>Booking agent tuned to your offer.</li>
                        <li>Sales support / handoff agent.</li>
                        <li>Finance / payment agent logic.</li>
                        <li>Designed to drive 20–40% more closed revenue.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="panel panel-alt" style={{ marginTop: 16 }}>
                  <div className="panel-header-row">
                    <div className="panel-title">Full Sales SOP + Video System</div>
                    <div className="panel-tag">Serious scaler package</div>
                  </div>
                  <div className="panel-body">
                    <p>
                      For teams that want the whole thing mapped:{" "}
                      <strong>sales SOP, pre-call video framework, booking scripts, and AI agent
                      handoff</strong> — all working together.
                    </p>
                    <div className="two-col">
                      <div className="mini-card">
                        <div className="mini-card-title">Delivery</div>
                        <ul className="list-tight">
                          <li>Complete sales SOP customized to your offer.</li>
                          <li>10–15 minute pre-call video blueprint.</li>
                          <li>Booking call verbiage tied to that video.</li>
                          <li>Agent prompts designed to support your closer.</li>
                        </ul>
                      </div>
                      <div className="mini-card">
                        <div className="mini-card-title">Investment</div>
                        <ul className="list-tight">
                          <li>Starts at <strong>$4,400 setup</strong>.</li>
                          <li>From <strong>$1,250/mo</strong> for ongoing tuning.</li>
                          <li>Best for offers where one extra close pays for the whole system.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {tab === "plans" && (
              <>
                <div className="panel">
                  <div className="panel-header-row">
                    <div className="panel-title">AI Voice Minute Plans</div>
                    <div className="panel-tag">You only pay for usage</div>
                  </div>
                  <div className="panel-body">
                    <p style={{ marginBottom: 6 }}>
                      Voice minutes are where the agent actually does its job. You can dial this up
                      or down as you grow.
                    </p>
                    <div className="plans-table">
                      <div className="plans-row plans-head">
                        <div className="plans-cell">Plan</div>
                        <div className="plans-cell">Included minutes</div>
                        <div className="plans-cell">Rate &amp; overage</div>
                      </div>
                      <div className="plans-row">
                        <div className="plans-cell">Starter Lite</div>
                        <div className="plans-cell">160 minutes / mo</div>
                        <div className="plans-cell">$53/mo · $0.35/min + $15 overage fee</div>
                      </div>
                      <div className="plans-row">
                        <div className="plans-cell">Starter</div>
                        <div className="plans-cell">280 minutes / mo</div>
                        <div className="plans-cell">$98/mo · $0.28/min + $15 overage fee</div>
                      </div>
                      <div className="plans-row">
                        <div className="plans-cell">Growth</div>
                        <div className="plans-cell">710 minutes / mo</div>
                        <div className="plans-cell">$197/mo · $0.22/min + $15 overage fee</div>
                      </div>
                      <div className="plans-row">
                        <div className="plans-cell">Pro</div>
                        <div className="plans-cell">1,700 minutes / mo</div>
                        <div className="plans-cell">$377/mo · $0.17/min + $15 overage fee</div>
                      </div>
                      <div className="plans-row">
                        <div className="plans-cell">Enterprise</div>
                        <div className="plans-cell">5,300 minutes / mo</div>
                        <div className="plans-cell">$800/mo · $0.12/min + $15 overage fee</div>
                      </div>
                      <div className="plans-row">
                        <div className="plans-cell">Ultra Enterprise</div>
                        <div className="plans-cell">12,000 minutes / mo</div>
                        <div className="plans-cell">$1,500/mo · $0.09/min + $15 overage fee</div>
                      </div>
                    </div>
                    <p className="price-footnote" style={{ marginTop: 8 }}>
                      Your underlying costs: ~$0.08/min call cost, phone numbers, and carrier fees.
                      We handle all of that and keep the math simple on your side.
                    </p>
                  </div>
                </div>

                <div className="panel panel-alt" style={{ marginTop: 16 }}>
                  <div className="panel-header-row">
                    <div className="panel-title">SMS Plans</div>
                    <div className="panel-tag">Booking &amp; follow-up fuel</div>
                  </div>
                  <div className="panel-body">
                    <p style={{ marginBottom: 6 }}>
                      SMS is what your leads actually read. This powers booking links,
                      confirmations, and the quiet follow-up that closes the gap.
                    </p>
                    <div className="plans-table">
                      <div className="plans-row plans-head">
                        <div className="plans-cell">Plan</div>
                        <div className="plans-cell">Included SMS</div>
                        <div className="plans-cell">Rate &amp; overage</div>
                      </div>
                      <div className="plans-row">
                        <div className="plans-cell">SMS Lite</div>
                        <div className="plans-cell">50 SMS / mo</div>
                        <div className="plans-cell">$8/mo · $0.15/SMS + $15 overage fee</div>
                      </div>
                      <div className="plans-row">
                        <div className="plans-cell">SMS Starter</div>
                        <div className="plans-cell">100 SMS / mo</div>
                        <div className="plans-cell">$17/mo · $0.15/SMS + $15 overage fee</div>
                      </div>
                      <div className="plans-row">
                        <div className="plans-cell">SMS Boost</div>
                        <div className="plans-cell">200 SMS / mo</div>
                        <div className="plans-cell">$29/mo · $0.14/SMS + $15 overage fee</div>
                      </div>
                      <div className="plans-row">
                        <div className="plans-cell">SMS Growth</div>
                        <div className="plans-cell">400 SMS / mo</div>
                        <div className="plans-cell">$53/mo · $0.13/SMS + $15 overage fee</div>
                      </div>
                      <div className="plans-row">
                        <div className="plans-cell">SMS Pro</div>
                        <div className="plans-cell">800 SMS / mo</div>
                        <div className="plans-cell">$98/mo · $0.12/SMS + $15 overage fee</div>
                      </div>
                    </div>

                    <p className="price-footnote" style={{ marginTop: 8 }}>
                      If a client insists on using their own carrier account (e.g. Twilio / Telnyx)
                      to shave costs, we can wire that in for{" "}
                      <strong>$125 one-time</strong>. The trade-off: callers may see one number for
                      SMS and a different number for calls, which can dent conversion.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT SIDE – stays fairly consistent to anchor the “why” */}
          <aside>
            <div className="panel panel-alt">
              <div className="panel-header-row">
                <div className="panel-title">Why this is not “just another AI agent”</div>
                <div className="panel-tag">Operating system view</div>
              </div>
              <div className="panel-body">
                <ul className="list-tight">
                  <li>
                    <strong>System, not tool:</strong> We design the whole path: traffic →
                    landing → call → booking → show → close → follow-up.
                  </li>
                  <li>
                    <strong>Real-time lead routing:</strong> Leads do not sit in a Google Sheet
                    for 15 minutes while a zap runs. They hit the system in seconds.
                  </li>
                  <li>
                    <strong>Booking psychology baked in:</strong> Slot A/B offers, no-show
                    enforcement, and pre-call value set up correctly, every time.
                  </li>
                  <li>
                    <strong>Sales-aware design:</strong> The video and scripts are built to make
                    your closer&apos;s life easier, not harder.
                  </li>
                  <li>
                    <strong>Proprietary follow-up engine:</strong> The “extra” 20–40% often comes
                    from what others completely ignore — long-tail follow-up.
                  </li>
                </ul>
                <p style={{ marginTop: 8 }}>
                  If you already have traffic and even a halfway decent offer,{" "}
                  <strong>this is usually the highest leverage upgrade</strong> you can make.
                </p>
              </div>
            </div>

            <div className="panel" style={{ marginTop: 16 }}>
              <div className="panel-header-row">
                <div className="panel-title">How most clients start</div>
                <div className="panel-tag">Simple entry path</div>
              </div>
              <div className="panel-body">
                <ol className="list-tight">
                  <li>
                    Start with the <strong>Landing Bundle</strong> so traffic has a clean,
                    compliant home.
                  </li>
                  <li>
                    Turn on a <strong>basic inbound agent</strong> + starter minutes/SMS to catch
                    calls 24/7.
                  </li>
                  <li>
                    Add the <strong>Speed-to-Lead engine</strong> and Slot A/B booking logic.
                  </li>
                  <li>
                    Layer in <strong>No-Show + Callback OS</strong> after the first wins.</li>
                  <li>
                    Graduate to the <strong>Sales OS</strong> and full SOP + video once you want
                    to treat this like a serious revenue channel.
                  </li>
                </ol>
              </div>
            </div>
          </aside>
        </section>

        {/* CTA BANNER */}
        <div className="cta-banner">
          <div>
            Ready to see how this would plug into{" "}
            <strong>your</strong> traffic and sales flow?
          </div>
          <div className="cta-actions">
            <a href="/" className="cta-small-btn cta-small-btn--primary">
              Trigger the live demo flow
            </a>
            <a
              href="https://calendly.com/tom-vge/new-meeting"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-small-btn cta-small-btn--ghost"
            >
              Talk through my numbers with Tom
            </a>
          </div>
        </div>

        <footer className="footer-legal">
          <span>© {new Date().getFullYear()} All In Digital. </span>
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>
          {" · "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
        </footer>
      </div>
    </main>
  );
}