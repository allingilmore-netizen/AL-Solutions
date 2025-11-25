"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [showBottomCta, setShowBottomCta] = useState(false);
  const [showRoi, setShowRoi] = useState(false);

  // ROI fields
  const [leads, setLeads] = useState<number | "">("");
  const [ticket, setTicket] = useState<number | "">("");
  const [missed, setMissed] = useState<number | "">("");
  const [recovery, setRecovery] = useState<number | "">("");

  const [monthlyRoi, setMonthlyRoi] = useState<number | null>(null);
  const [annualRoi, setAnnualRoi] = useState<number | null>(null);

  // ================================
  // 🔥 3D Fade-in Scroll Animation
  // ================================
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
      { threshold: 0.25 }
    );

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ================================
  // Sticky CTA Scroll Logic
  // ================================
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const nearBottom = y + winHeight > docHeight - 300;

      setShowBottomCta(y > 450 && !nearBottom);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openRoi = () => setShowRoi(true);
  const closeRoi = () => setShowRoi(false);

  const currency = (n: number | null) =>
    n === null ? "" : `$${n.toLocaleString()}`;

  // ================================
  // ROI Calculation
  // ================================
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
        <div className="header-title">All In Digital</div>
        <a href="#demo" className="header-cta">
          Book Demo
        </a>
      </header>

      {/* HERO */}
      <section className="hero fade-3d">
        <div className="hero-inner">
          <p className="eyebrow">
            AI Workforce • Speed to Lead • 24/7 Coverage
          </p>
          <h1>Turn Missed Calls & Slow Follow-Up into a 24/7 AI Workforce</h1>
          <p className="hero-sub">
            AI agents answer instantly, book appointments, recover no-shows,
            handle dispatch, and follow up automatically.
          </p>

          <div className="hero-ctas">
            <a href="#demo" className="primary-cta">
              Hear the AI in Action
            </a>
            <button className="secondary-cta" onClick={openRoi}>
              Run ROI Calculator
            </button>
          </div>
        </div>
      </section>

      {/* SPEED TO LEAD */}
      <section className="section fade-3d" id="demo">
        <h2>⚡ Test Speed to Lead</h2>
        <p>Insert your Typeform to trigger an instant AI callback demo.</p>

        <div className="form-placeholder">
          <h3>📨 FORM PLACEHOLDER</h3>
          <p>Paste your Typeform embed here.</p>
        </div>
      </section>

      {/* AGENT CARDS */}
      <section className="section fade-3d">
        <h2>🚀 What Your AI Agents Do</h2>

        <div className="card-grid">
          <div className="card fade-3d">
            <h3>Answer & Qualify</h3>
            <p>Instant pickup. No voicemail.</p>
          </div>
          <div className="card fade-3d">
            <h3>Book Appointments</h3>
            <p>Push qualified leads onto your calendar.</p>
          </div>
          <div className="card fade-3d">
            <h3>Recover No-Shows</h3>
            <p>AI sequences call/text until rebooked.</p>
          </div>
          <div className="card fade-3d">
            <h3>Handle Dispatch</h3>
            <p>ETAs, confirmations & delays automated.</p>
          </div>
          <div className="card fade-3d">
            <h3>Nurture Cold Leads</h3>
            <p>Revives old leads automatically.</p>
          </div>
          <div className="card fade-3d">
            <h3>24/7 Coverage</h3>
            <p>Never miss a revenue opportunity.</p>
          </div>
        </div>
      </section>

      {/* ROI SECTION */}
      <section className="section fade-3d">
        <h2>📈 See Your ROI</h2>
        <button className="primary-cta" onClick={openRoi}>
          Open ROI Calculator
        </button>
      </section>

      {/* BOTTOM CTA */}
      {showBottomCta && (
        <div className="bottom-cta">
          ⚡ Ready to Automate?{" "}
          <a href="#demo" className="bottom-cta-link">
            Book Your Demo
          </a>
        </div>
      )}

      {/* ROI MODAL */}
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

            <label>Missed Lead %</label>
            <input
              type="number"
              value={missed}
              onChange={(e) =>
                setMissed(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            />

            <label>AI Recovery %</label>
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

            {monthlyRoi !== null && (
              <div className="roi-result">
                <p>
                  📈 Monthly ROI:{" "}
                  <strong>{currency(monthlyRoi)}</strong>
                </p>
                <p>
                  📆 Annual ROI:{" "}
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
