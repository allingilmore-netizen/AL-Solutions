"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [showBottomCta, setShowBottomCta] = useState(false);
  const [showRoi, setShowRoi] = useState(false);

  // --- Simple ROI calculator (Original Version) ---
  const [leads, setLeads] = useState<number | "">("");
  const [ticket, setTicket] = useState<number | "">("");
  const [missed, setMissed] = useState<number | "">("");
  const [recovery, setRecovery] = useState<number | "">("");
  const [monthlyRoi, setMonthlyRoi] = useState<number | null>(null);
  const [annualRoi, setAnnualRoi] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const nearBottom = y + winHeight > docHeight - 300;

      setShowBottomCta(y > 400 && !nearBottom);
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

    const recovered = L * M * R;
    const monthly = recovered * T;
    const annual = monthly * 12;

    setMonthlyRoi(monthly);
    setAnnualRoi(annual);
  };

  return (
    <div className="page-root">
      {/* Sticky Header */}
      <header className="sticky-header fade-in">
        <div className="header-left">All In Digital</div>
        <a href="#demo" className="header-cta">Book Demo</a>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">AI Workforce • Speed to Lead • No Human Bottlenecks</p>
          <h1>Turn Missed Calls & Slow Follow-Up into a 24/7 AI Workforce</h1>
          <p className="hero-sub">
            Your AI agents answer instantly, book appointments, recover no-shows, and handle dispatch workloads — so you stop leaking revenue.
          </p>

          <div className="hero-ctas">
            <a href="#demo" className="primary-cta">Hear the AI in Action</a>
            <button className="secondary-cta" onClick={openRoi}>Run ROI Calculator</button>
          </div>
        </div>
      </section>

      {/* SPEED-TO-LEAD DEMO */}
      <section className="section" id="demo">
        <h2>⚡ Test Speed to Lead</h2>
        <p>Embed your Typeform here to trigger an instant AI call-back.</p>

        <div className="form-placeholder">
          <h3>📨 FORM PLACEHOLDER</h3>
          <p>Paste your <strong>Typeform embed</strong> here.</p>
        </div>
      </section>

      {/* WHAT AGENTS DO */}
      <section className="section">
        <h2>🚀 What Your AI Agents Do</h2>
        <div className="card-grid">
          <div className="card slide-up"><h3>Answer & Qualify</h3><p>Instant call pickup, clean routing, and intake.</p></div>
          <div className="card slide-up"><h3>Book Appointments</h3><p>Push good leads into booked revenue time.</p></div>
          <div className="card slide-up"><h3>Recover No-Shows</h3><p>Reschedules missed appointments 24/7.</p></div>
          <div className="card slide-up"><h3>Handle Dispatch</h3><p>ETAs, delays, confirmations handled automatically.</p></div>
          <div className="card slide-up"><h3>Nurture Cold Leads</h3><p>Long-term follow-ups to revive old leads.</p></div>
          <div className="card slide-up"><h3>24/7 Coverage</h3><p>Never miss a call again.</p></div>
        </div>
      </section>

      {/* VALUE COMPARISON (NO PRICING) */}
      <section className="section">
        <h2>💵 What This Replaces</h2>
        <div className="card-grid">
          <div className="card"><h3>Missed Calls</h3><p>Lost jobs & sales from voicemail.</p></div>
          <div className="card"><h3>Slow Follow-Up</h3><p>Leads drift to competitors.</p></div>
          <div className="card"><h3>No-Show Waste</h3><p>Empty calendars = lost revenue.</p></div>
          <div className="card"><h3>Manual Dispatch</h3><p>Hours wasted on phone calls.</p></div>
          <div className="card"><h3>Human Error</h3><p>Dropped leads, forgotten tasks.</p></div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="section">
        <h2>📈 See Your ROI</h2>
        <button className="primary-cta" onClick={openRoi}>
          Open ROI Calculator
        </button>
      </section>

      {/* Bottom CTA */}
      {showBottomCta && (
        <div className="bottom-cta">
          🔥 Ready to Automate? <a href="#demo">Book Your Demo</a>
        </div>
      )}

      {/* ROI MODAL */}
      {showRoi && (
        <div className="roi-popup-overlay" onClick={closeRoi}>
          <div className="roi-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeRoi}>×</button>

            <h3>ROI Calculator</h3>

            <label>Leads per Month</label>
            <input type="number" value={leads} onChange={(e) => setLeads(e.target.value || "")} />

            <label>Average Ticket ($)</label>
            <input type="number" value={ticket} onChange={(e) => setTicket(e.target.value || "")} />

            <label>Missed Lead %</label>
            <input type="number" value={missed} onChange={(e) => setMissed(e.target.value || "")} />

            <label>AI Recovery %</label>
            <input type="number" value={recovery} onChange={(e) => setRecovery(e.target.value || "")} />

            <button className="roi-btn" onClick={calcRoi}>Calculate ROI</button>

            {monthlyRoi !== null && (
              <div className="roi-result">
                <p>📈 Monthly ROI: <strong>{currency(monthlyRoi)}</strong></p>
                <p>📆 Annual ROI: <strong>{currency(annualRoi)}</strong></p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
