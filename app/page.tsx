"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [showBottomCta, setShowBottomCta] = useState(false);
  const [showRoi, setShowRoi] = useState(false);

  // Simple ROI state
  const [leads, setLeads] = useState<number | "">("");
  const [ticket, setTicket] = useState<number | "">("");
  const [missed, setMissed] = useState<number | "">("");
  const [recovery, setRecovery] = useState<number | "">("");
  const [monthlyRoi, setMonthlyRoi] = useState<number | null>(null);
  const [annualRoi, setAnnualRoi] = useState<number | null>(null);

  // 3D fade-in on scroll
  useEffect(() => {
    const revealElements = document.querySelectorAll(".fade-3d, .fade-3d-slow");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.18 }
    );

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Bottom sticky CTA logic
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const nearBottom = y + winHeight > docHeight - 350;
      setShowBottomCta(y > 500 && !nearBottom);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openRoi = () => setShowRoi(true);
  const closeRoi = () => setShowRoi(false);

  const currency = (n: number | null) =>
    n === null ? "" : `$${n.toLocaleString()}`;

  const calcRoi = () => {
    if (leads === "" || ticket === "" || missed === "" || recovery === "") {
      setMonthlyRoi(null);
      setAnnualRoi(null);
      return;
    }

    const L = Number(leads);
    const T = Number(ticket);
    const M = Number(missed) / 100;
    const R = Number(recovery) / 100;

    const recoveredLeads = L * M * R;
    const monthly = recoveredLeads * T;
    const annual = monthly * 12;

    setMonthlyRoi(monthly);
    setAnnualRoi(annual);
  };

  return (
    <div className="page-root">
      {/* Sticky Header */}
      <header className="sticky-header">
        <div className="header-title">All In Digital</div>
        <a href="#demo" className="header-cta">
          Book Demo
        </a>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner fade-3d">
          <span className="eyebrow">AI Workforce • Speed to Lead • 24/7 Coverage</span>
          <h1>Turn Missed Calls & Slow Follow-Up into a 24/7 AI Workforce</h1>
          <p className="hero-sub">
            Your AI agents answer instantly, qualify leads, book calendars, recover no-shows, and handle dispatch —
            so you stop bleeding revenue to voicemail, delays, and “we’ll call them later.”
          </p>

          <div className="hero-ctas">
            <a href="#demo" className="primary-cta">
              Hear the AI in Action
            </a>
            <button className="secondary-cta" onClick={openRoi}>
              Run ROI Calculator
            </button>
          </div>

          <div className="hero-badges">
            <div className="hero-badge">Speed-to-Lead under 3 minutes</div>
            <div className="hero-badge">AI Booking • No-Show Recovery</div>
            <div className="hero-badge">Built for small & mid-sized teams</div>
          </div>
        </div>
      </section>

      {/* SPEED-TO-LEAD DEMO */}
      <section className="section fade-3d" id="demo">
        <h2>⚡ Test Speed to Lead in Real Time</h2>
        <p className="section-lead">
          Embed your Typeform here, connect it to Thoughtly, and let prospects experience what “instant response”
          really feels like when AI calls back within seconds.
        </p>

        <div className="form-placeholder">
          <h3>📨 FORM PLACEHOLDER</h3>
          <p>
            Paste your <strong>Typeform embed</strong> here and wire it to your Thoughtly AI phone agent for live
            speed-to-lead demos.
          </p>
        </div>
      </section>

      {/* AGENT DIAGRAM — SYSTEM FLOW */}
      <section className="section fade-3d">
        <h2>🧠 Your AI Workforce Flow</h2>
        <p className="section-lead">
          Think of this like hiring a full small team — booking, recovering, dispatching, and cleaning up your pipeline —
          but fully AI-driven and always on.
        </p>

        <div className="diagram-grid">
          <div className="diagram-column">
            <div className="diagram-label">Top of Funnel</div>
            <div className="diagram-node">
              <h3>Inbound AI Agent</h3>
              <p>Answers every call, captures name + intent, and routes intelligently.</p>
            </div>
            <div className="diagram-arrow">↓</div>
            <div className="diagram-node">
              <h3>Qualified Booking Agent</h3>
              <p>Asks a few key questions and books onto your calendar in real time.</p>
            </div>
          </div>

          <div className="diagram-column">
            <div className="diagram-label">Recovery & Nurture</div>
            <div className="diagram-node">
              <h3>No-Show Recovery Agent</h3>
              <p>Calls & texts missed appointments to reschedule and fill gaps.</p>
            </div>
            <div className="diagram-arrow">↓</div>
            <div className="diagram-node">
              <h3>Follow-Up & Nurture Agent</h3>
              <p>Reaches back out to “not now,” “call later,” and cold leads.</p>
            </div>
          </div>

          <div className="diagram-column">
            <div className="diagram-label">Operations</div>
            <div className="diagram-node">
              <h3>Dispatcher Agent</h3>
              <p>Handles ETAs, delays, and confirmations so field teams keep moving.</p>
            </div>
            <div className="diagram-arrow">↓</div>
            <div className="diagram-node">
              <h3>Handoff / Finance Agent</h3>
              <p>Collects payment links, sends agreements, and hands off cleanly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT AGENTS DO — FEATURE GRID */}
      <section className="section fade-3d">
        <h2>🚀 What Your AI Workforce Actually Does</h2>

        <div className="card-grid">
          <div className="card fade-3d">
            <h3>Answer & Qualify</h3>
            <p>Instant call pickup, natural questions, and clear routing.</p>
          </div>
          <div className="card fade-3d">
            <h3>Book Revenue Time</h3>
            <p>Pushes serious prospects directly into booked calendar slots.</p>
          </div>
          <div className="card fade-3d">
            <h3>Recover No-Shows</h3>
            <p>Automated call + SMS sequences designed to rebook missed slots.</p>
          </div>
          <div className="card fade-3d">
            <h3>Handle Dispatch Chatter</h3>
            <p>ETAs, “running late,” and confirmations handled without staff time.</p>
          </div>
          <div className="card fade-3d">
            <h3>Nurture Cold Leads</h3>
            <p>Follows up over days/weeks so “not yet” doesn’t become “never.”</p>
          </div>
          <div className="card fade-3d">
            <h3>24/7 Coverage</h3>
            <p>Late nights, weekends, and after-hours inquiries never get lost.</p>
          </div>
        </div>
      </section>

      {/* VALUE COMPARISON — NO PRICES */}
      <section className="section fade-3d">
        <h2>💵 What This Quietly Replaces</h2>
        <p className="section-lead">
          This isn’t “just software.” It’s an AI workforce that plugs the silent leaks already costing you real money.
        </p>

        <div className="card-grid">
          <div className="card fade-3d-slow">
            <h3>Missed & Abandoned Calls</h3>
            <p>Calls that hit voicemail or ring out are often lost deals forever.</p>
          </div>
          <div className="card fade-3d-slow">
            <h3>Slow Follow-Up</h3>
            <p>Leads that wait hours or days drift to whoever answers first.</p>
          </div>
          <div className="card fade-3d-slow">
            <h3>No-Show Waste</h3>
            <p>Empty appointment slots equal lost production time & ad spend.</p>
          </div>
          <div className="card fade-3d-slow">
            <h3>Manual Dispatch Calls</h3>
            <p>Your team stuck updating clients instead of doing revenue work.</p>
          </div>
          <div className="card fade-3d-slow">
            <h3>Human Error</h3>
            <p>Forgotten follow-ups, misrouted calls, and “I thought someone else had it.”</p>
          </div>
        </div>

        <p className="section-footnote">
          Most growing service businesses quietly leak{" "}
          <strong>hundreds of thousands per year</strong> through these gaps. Your AI workforce exists to quietly plug them.
        </p>
      </section>

      {/* PHASE OVERVIEW — NO PRICES */}
      <section className="section fade-3d">
        <h2>📦 How We Roll This Out</h2>
        <p className="section-lead">
          We don’t throw a random bot at your phones. We phase in an AI workforce that matches where your operation is today.
        </p>

        <div className="package-grid">
          <div className="package-card fade-3d">
            <h3>Phase 1 — Core Inbound & Booking</h3>
            <ul>
              <li>Inbound agent answering calls 24/7</li>
              <li>FAQ + intake scripting tuned to your offers</li>
              <li>Calendar connection & booking flows</li>
              <li>Live transfer path to you or your team</li>
              <li>Basic reporting on calls & bookings</li>
            </ul>
          </div>

          <div className="package-card fade-3d">
            <h3>Phase 2 — Recovery & Nurture Stack</h3>
            <ul>
              <li>No-show recovery agent (call + SMS)</li>
              <li>Multi-step nurture for “not now” and slow leads</li>
              <li>Multi-agent coordination logic behind the scenes</li>
              <li>Deeper qualification flows & routing</li>
              <li>Improvements driven by real call & booking data</li>
            </ul>
          </div>

          <div className="package-card fade-3d">
            <h3>Phase 3 — Operational AI Workforce</h3>
            <ul>
              <li>Dispatcher agent wired into your operations</li>
              <li>Lead → booking → job → follow-up pipelines</li>
              <li>Industry-specific workflows (home services, med spa, etc.)</li>
              <li>Review, reactivation, and rebooking logic</li>
              <li>Foundation for AI sales agents when you’re ready</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ROI SECTION */}
      <section className="section fade-3d">
        <h2>📈 See Your Potential ROI</h2>
        <p className="section-lead">
          Use this quick calculator to estimate what a real AI workforce could be recovering in pure revenue
          before you even talk pricing.
        </p>

        <button className="primary-cta" onClick={openRoi}>
          Open ROI Calculator
        </button>
      </section>

      {/* CENTER CTA */}
      <section className="section center-cta fade-3d">
        <h2>Ready to Hear Your AI Workforce in Action?</h2>
        <p>
          Book a live demo and listen to how your inbound calls, booking flow, and no-show recovery could sound —
          before you plug it into your business.
        </p>
        <a href="#demo" className="primary-cta">
          Book a Demo
        </a>
      </section>

      {/* Bottom Sticky CTA */}
      {showBottomCta && (
        <div className="bottom-cta">
          ⚡ Ready to Automate?{" "}
          <a href="#demo" className="bottom-cta-link">
            Book Your Demo
          </a>
        </div>
      )}

      {/* ROI POPUP */}
      {showRoi && (
        <div className="roi-popup-overlay" onClick={closeRoi}>
          <div className="roi-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeRoi}>
              ×
            </button>

            <h3>ROI Calculator</h3>

            <label>Leads per Month</label>
            <input
              type="number"
              value={leads}
              onChange={(e) =>
                setLeads(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            />

            <label>Average Ticket ($)</label>
            <input
              type="number"
              value={ticket}
              onChange={(e) =>
                setTicket(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            />

            <label>Missed Lead % (slow or no follow-up)</label>
            <input
              type="number"
              value={missed}
              onChange={(e) =>
                setMissed(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            />

            <label>AI Recovery % of Those Missed Leads</label>
            <input
              type="number"
              value={recovery}
              onChange={(e) =>
                setRecovery(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            />

            <button className="roi-btn" onClick={calcRoi}>
              Calculate ROI
            </button>

            {monthlyRoi !== null && annualRoi !== null && (
              <div className="roi-result">
                <p>
                  📈 Estimated Monthly Revenue Recovered:{" "}
                  <strong>{currency(monthlyRoi)}</strong>
                </p>
                <p>
                  📆 Estimated Annual Revenue Recovered:{" "}
                  <strong>{currency(annualRoi)}</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
