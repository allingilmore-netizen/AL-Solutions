// app/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [showBottomCta, setShowBottomCta] = useState(false);
  const [showRoi, setShowRoi] = useState(false);

  // ROI inputs
  const [leads, setLeads] = useState<number | "">("");
  const [ticket, setTicket] = useState<number | "">("");
  const [missed, setMissed] = useState<number | "">("");
  const [recovery, setRecovery] = useState<number | "">("");
  const [monthlyRoi, setMonthlyRoi] = useState<number | null>(null);
  const [annualRoi, setAnnualRoi] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (typeof window === "undefined") return;
      const y = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;

      const nearBottom = y + winHeight > docHeight - 300;
      if (y > 400 && !nearBottom) {
        setShowBottomCta(true);
      } else {
        setShowBottomCta(false);
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openRoi = () => setShowRoi(true);
  const closeRoi = () => setShowRoi(false);

  const calcRoi = () => {
    if (
      leads === "" ||
      ticket === "" ||
      missed === "" ||
      recovery === ""
    ) {
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

  const currency = (n: number | null) =>
    n === null ? "" : `$${n.toLocaleString()}`;

  return (
    <div style={{ background: "#ffffff", color: "#043c25" }}>
      {/* Sticky Header */}
      <div className="sticky-header fade-in">
        <div style={{ color: "white", fontSize: 22, fontWeight: 700 }}>
          All In Digital
        </div>
        <a href="#demo">Book Demo</a>
      </div>

      {/* Hero */}
      <section className="hero">
        <h1>AI Workforce Automation for Small & Mid-Sized Businesses</h1>
        <p>
          Instant Lead Response • AI Booking • No-Show Recovery • Dispatch
          Automation • 24/7 Revenue Capture
        </p>
      </section>

      {/* Speed to Lead + Form Placeholder */}
      <section className="section" id="demo">
        <h2>⚡ Test Speed to Lead</h2>
        <p>
          Fill out the form below and watch how fast our AI calls you back.
          Experience true instant-response automation in real time.
        </p>

        <div className="form-placeholder">
          <h3>📨 FORM PLACEHOLDER</h3>
          <p>
            Paste your <strong>Typeform embed</strong> here and connect it to
            Thoughtly to trigger an instant AI callback demo.
          </p>
          {/* Example: 
            <iframe src="YOUR_TYPEFORM_EMBED_URL" ...></iframe>
          */}
        </div>
      </section>

      {/* AI Workforce Agents */}
      <section className="section">
        <h2>🚀 AI Workforce Agents</h2>

        <div className="card slide-up">
          <h3>Inbound AI Agent</h3>
          <p>24/7 instant answering, booking, FAQs, and caller capture.</p>
        </div>

        <div className="card slide-up">
          <h3>Qualified Booking Agent</h3>
          <p>
            Responds in under 3 minutes, qualifies leads, and routes into a
            sales video + consult flow.
          </p>
        </div>

        <div className="card slide-up">
          <h3>No-Show Recovery Agent</h3>
          <p>
            10–15 call attempts, 5–10 SMS attempts, rescheduling and
            recapturing lost appointments.
          </p>
        </div>

        <div className="card slide-up">
          <h3>Follow-Up & Nurture Agent</h3>
          <p>
            Multi-day and long-term follow-up sequences to revive cold and
            “dead” leads.
          </p>
        </div>

        <div className="card slide-up">
          <h3>Dispatcher Agent</h3>
          <p>
            Field ETA notifications, delay detection, CRM integration, and
            manager escalations.
          </p>
        </div>

        <div className="card slide-up">
          <h3>Finance Agent</h3>
          <p>
            Handles payments, contracts, and financing applications in a
            structured, compliant flow.
          </p>
        </div>

        <div className="card slide-up">
          <h3>AI Sales Consultant</h3>
          <p>
            Consultative sales calls, objection handling, and pipeline syncing
            into your CRM.
          </p>
        </div>
      </section>

      {/* Real-World Cost Comparison (No pricing cards for your plans) */}
      <section className="section slide-up">
        <h2>💵 What This Replaces in the Real World</h2>

        <div className="card">
          <h3>Receptionist & Phone Staff</h3>
          <p>Full-time salary + benefits: $42,000–$68,000 per year.</p>
        </div>

        <div className="card">
          <h3>Lost Leads from Slow Response</h3>
          <p>Missed calls & slow follow-up: $50,000–$150,000+/year.</p>
        </div>

        <div className="card">
          <h3>Sales Lost from Delayed Follow-Up</h3>
          <p>Missed opportunities: $75,000–$200,000+/year.</p>
        </div>

        <div className="card">
          <h3>Dispatch & Operations Inefficiencies</h3>
          <p>Late arrivals, misroutes, wasted time: $12,000–$30,000/year.</p>
        </div>

        <div className="card">
          <h3>Human Error Cost</h3>
          <p>
            Forgotten follow-ups, bad handoffs, lead slips: $25,000+/year in
            avoidable loss.
          </p>
        </div>

        <p style={{ fontSize: 20, marginTop: 25 }}>
          👉 Most growing service businesses lose{" "}
          <strong>$200,000–$400,000 per year</strong> from slow response and
          workflow friction. <br />
          <br />
          <strong>
            Your AI Workforce replaces all of that for a fraction of the cost.
          </strong>
        </p>
      </section>

      {/* ROI Section */}
      <section className="section">
        <h2>📈 See Your Potential ROI</h2>
        <p>
          Enter your numbers and instantly estimate your monthly and annual
          revenue gain.{" "}
          <button
            type="button"
            className="roi-trigger"
            onClick={openRoi}
          >
            Open ROI Calculator
          </button>
        </p>
      </section>

      {/* Middle CTA */}
      <section className="section" style={{ textAlign: "center" }}>
        <a href="#demo" className="cta">
          Book a Demo & Hear the AI in Action
        </a>
      </section>

      {/* Bottom Sticky CTA */}
      {showBottomCta && (
        <div className="bottom-cta">
          🔥 Ready to Automate?{" "}
          <a
            href="#demo"
            style={{
              marginLeft: 10,
              textDecoration: "underline",
              color: "#000",
            }}
          >
            Book Your Demo
          </a>
        </div>
      )}

      {/* ROI Popup Modal */}
      {showRoi && (
        <div className="roi-popup-overlay" onClick={closeRoi}>
          <div
            className="roi-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={closeRoi}>
              ×
            </button>
            <h3>ROI Calculator</h3>

            <label>Leads per Month</label>
            <input
              type="number"
              value={leads}
              onChange={(e) =>
                setLeads(e.target.value === "" ? "" : Number(e.target.value))
              }
            />

            <label>Average Ticket ($)</label>
            <input
              type="number"
              value={ticket}
              onChange={(e) =>
                setTicket(e.target.value === "" ? "" : Number(e.target.value))
              }
            />

            <label>Missed Lead % (slow/no follow-up)</label>
            <input
              type="number"
              value={missed}
              onChange={(e) =>
                setMissed(e.target.value === "" ? "" : Number(e.target.value))
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

            <button
              type="button"
              className="roi-btn"
              onClick={calcRoi}
            >
              Calculate ROI
            </button>

            {monthlyRoi !== null && annualRoi !== null && (
              <div id="roiResult">
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
