"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [showBottomCta, setShowBottomCta] = useState(false);
  const [showRoi, setShowRoi] = useState(false);

  // Simple ROI inputs
  const [leads, setLeads] = useState<number | "">("");
  const [ticket, setTicket] = useState<number | "">("");
  const [missed, setMissed] = useState<number | "">("");
  const [recovery, setRecovery] = useState<number | "">("");
  const [monthlyRoi, setMonthlyRoi] = useState<number | null>(null);
  const [annualRoi, setAnnualRoi] = useState<number | null>(null);

  // Enterprise ROI inputs
  const [entLeads, setEntLeads] = useState<number | "">("");
  const [currentClose, setCurrentClose] = useState<number | "">("");
  const [aiClose, setAiClose] = useState<number | "">("");
  const [avgTicket, setAvgTicket] = useState<number | "">("");
  const [staffCost, setStaffCost] = useState<number | "">("");
  const [aiCost, setAiCost] = useState<number | "">("");
  const [entExtraRevenue, setEntExtraRevenue] = useState<number | null>(null);
  const [entNetGain, setEntNetGain] = useState<number | null>(null);
  const [entAnnualGain, setEntAnnualGain] = useState<number | null>(null);

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

  const currency = (n: number | null) =>
    n === null ? "" : `$${n.toLocaleString()}`;

  // Simple “recovered lead” ROI calculator
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

  // Enterprise ROI calculator
  const calcEnterpriseRoi = () => {
    if (
      entLeads === "" ||
      currentClose === "" ||
      aiClose === "" ||
      avgTicket === ""
    ) {
      setEntExtraRevenue(null);
      setEntNetGain(null);
      setEntAnnualGain(null);
      return;
    }

    const L = Number(entLeads);
    const curr = Number(currentClose) / 100;
    const ai = Number(aiClose) / 100;
    const T = Number(avgTicket);
    const staff = staffCost === "" ? 0 : Number(staffCost);
    const aiMonthly = aiCost === "" ? 0 : Number(aiCost);

    const closedCurrent = L * curr;
    const closedWithAi = L * ai;
    const extraDeals = closedWithAi - closedCurrent;
    const extraRevenue = extraDeals * T;
    const netGain = extraRevenue - staff - aiMonthly;
    const annual = netGain * 12;

    setEntExtraRevenue(extraRevenue);
    setEntNetGain(netGain);
    setEntAnnualGain(annual);
  };

  return (
    <div className="page-root">
      {/* Sticky Header */}
      <div className="sticky-header fade-in">
        <div className="header-title">All In Digital</div>
        <a href="#demo" className="header-cta">
          Book Demo
        </a>
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">AI Workforce • Speed to Lead • No Human Bottlenecks</p>
          <h1>Turn Missed Calls & Slow Follow-Up into a 24/7 AI Workforce</h1>
          <p className="hero-sub">
            Your AI agents answer instantly, book qualified appointments, recover no-shows, and coordinate dispatch —
            so you stop leaking revenue from voicemail, delays, and manual follow-up.
          </p>
          <div className="hero-ctas">
            <a href="#demo" className="primary-cta">
              Hear the AI in Action
            </a>
            <button type="button" className="secondary-cta" onClick={openRoi}>
              Run ROI Calculator
            </button>
          </div>
          <p className="hero-note">
            Built for owners who care about speed-to-lead, booked calendars, and operational sanity.
          </p>
        </div>
      </section>

      {/* Speed to Lead Demo */}
      <section className="section" id="demo">
        <h2>⚡ Test Speed to Lead</h2>
        <p>
          Drop your info into the form below and have the AI call you back. Experience true speed-to-lead and AI booking
          like your prospects would.
        </p>

        <div className="form-placeholder">
          <h3>📨 FORM PLACEHOLDER</h3>
          <p>
            Paste your <strong>Typeform embed</strong> here and connect it to Thoughtly to trigger an instant AI callback
            demo.
          </p>
          {/* Example:
          <iframe
            src="YOUR_TYPEFORM_URL"
            style={{ width: "100%", height: "600px", border: "none" }}
          />
          */}
        </div>
      </section>

      {/* Agent Diagram / System Overview */}
      <section className="section">
        <h2>🧠 Your AI Workforce at a Glance</h2>
        <p className="section-lead">
          Think of it as a small digital team working 24/7: booking, recovering, dispatching, and closing loops —
          without breaks, moods, or missed calls.
        </p>

        <div className="diagram-grid">
          <div className="diagram-column">
            <div className="diagram-label">Top of Funnel</div>
            <div className="diagram-card">
              <h3>Inbound AI Agent</h3>
              <p>Answers every call instantly, captures name + intent, and routes to the right flow.</p>
            </div>
            <div className="diagram-arrow">↓</div>
            <div className="diagram-card">
              <h3>Qualified Booking Agent</h3>
              <p>
                Asks a few smart questions, books into your calendar, and sends confirmations & reminders.
              </p>
            </div>
          </div>

          <div className="diagram-column">
            <div className="diagram-label">Recovery & Nurture</div>
            <div className="diagram-card">
              <h3>No-Show Recovery Agent</h3>
              <p>Calls and texts missed appointments, reschedules, and keeps your pipeline moving.</p>
            </div>
            <div className="diagram-arrow">↓</div>
            <div className="diagram-card">
              <h3>Follow-Up & Nurture Agent</h3>
              <p>Multi-day and long-tail follow-up to revive “not now,” “call later,” and cold leads.</p>
            </div>
          </div>

          <div className="diagram-column">
            <div className="diagram-label">Operations</div>
            <div className="diagram-card">
              <h3>Dispatcher Agent</h3>
              <p>Handles ETAs, delays, and confirmations so field teams aren’t stuck on the phone.</p>
            </div>
            <div className="diagram-arrow">↓</div>
            <div className="diagram-card">
              <h3>Finance / Handoff Agent</h3>
              <p>Collects payment links, sends agreements, and hands off to your systems cleanly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What the Agents Do (Feature cards, no pricing) */}
      <section className="section">
        <h2>🚀 What Your AI Agents Actually Do</h2>
        <div className="card-grid">
          <div className="card slide-up">
            <h3>Answer & Qualify</h3>
            <p>Every call answered on the first ring. No more voicemail, no more “sorry, we missed you.”</p>
          </div>
          <div className="card slide-up">
            <h3>Book Revenue Time</h3>
            <p>Routes good leads into booked appointments and pushes tire-kickers into nurture flows.</p>
          </div>
          <div className="card slide-up">
            <h3>Recover No-Shows</h3>
            <p>Automated call + SMS sequences to reschedule missed appointments and recapture revenue.</p>
          </div>
          <div className="card slide-up">
            <h3>Handle Dispatch Chatter</h3>
            <p>ETA updates, delays, and confirmation calls — without your team losing hours on the phone.</p>
          </div>
          <div className="card slide-up">
            <h3>Clean Handoffs</h3>
            <p>Structured logs, clean dispositioning, and easy handoff into your CRM or internal tools.</p>
          </div>
          <div className="card slide-up">
            <h3>24/7 Coverage</h3>
            <p>Late-night, weekends, and after-hours inquiries are captured and routed properly, not lost.</p>
          </div>
        </div>
      </section>

      {/* Real-World Cost Comparison */}
      <section className="section">
        <h2>💵 What This Replaces in the Real World</h2>
        <p className="section-lead">
          This isn’t “buying software” — it’s replacing silent leakage that’s already costing you real money.
        </p>

        <div className="card-grid">
          <div className="card">
            <h3>Missed & Abandoned Calls</h3>
            <p>Every call that hits voicemail or rings out is a potential lost job, treatment, or sale.</p>
          </div>
          <div className="card">
            <h3>Slow Follow-Up</h3>
            <p>Leads that wait hours (or days) for a call back drift to whoever picked up fastest.</p>
          </div>
          <div className="card">
            <h3>No-Show Waste</h3>
            <p>Calendar gaps from no-shows represent direct lost production time and ad spend waste.</p>
          </div>
          <div className="card">
            <h3>Manual Dispatch Calls</h3>
            <p>Your team calling “We’re running late” all day instead of doing work that moves revenue.</p>
          </div>
          <div className="card">
            <h3>Human Error</h3>
            <p>Forgotten follow-ups, lost notes, misrouted calls, and “I thought someone else handled it.”</p>
          </div>
        </div>

        <p className="section-footnote">
          Most growing service businesses quietly bleed <strong>hundreds of thousands per year</strong> from these cracks.
          Your AI Workforce is built to quietly plug them.
        </p>
      </section>

      {/* “Package” overview – Features only, NO prices */}
      <section className="section">
        <h2>📦 How Engagement with All In Digital Is Structured</h2>
        <p className="section-lead">
          We don’t sell “AI toys.” We deploy an AI workforce in stages that fit where your business is today.
        </p>

        <div className="package-grid">
          <div className="package-card">
            <h3>Phase 1 — Core Inbound & Booking</h3>
            <ul>
              <li>Inbound AI agent answering your phone 24/7</li>
              <li>Basic FAQ + intake scripting</li>
              <li>Calendar connection & booking flows</li>
              <li>Live transfer path to you or your team</li>
              <li>Simple reporting on calls & bookings</li>
            </ul>
          </div>

          <div className="package-card">
            <h3>Phase 2 — Recovery & Nurture Stack</h3>
            <ul>
              <li>No-show recovery agent (call + SMS)</li>
              <li>Nurture sequences for “not now” and cold leads</li>
              <li>Multi-agent coordination logic behind the scenes</li>
              <li>Deeper qualification flows & routing</li>
              <li>Performance tweaks based on real call data</li>
            </ul>
          </div>

          <div className="package-card">
            <h3>Phase 3 — Operational AI Workforce</h3>
            <ul>
              <li>Dispatcher agent layered into your operations</li>
              <li>More complex workflows & integrations (CRM, etc.)</li>
              <li>Multi-step pipelines from lead → booking → job</li>
              <li>Industry-specific workflows (home services, med spa, etc.)</li>
              <li>Review, reactivation, and re-booking logic</li>
            </ul>
          </div>
        </div>

        <p className="section-footnote">
          Your AI Sales Agent and more advanced sales flows sit <strong>on top</strong> of this foundation when you’re ready.
        </p>
      </section>

      {/* ROI Section */}
      <section className="section">
        <h2>📈 See Your Potential ROI</h2>
        <p>
          Use the calculator to see what a real AI workforce can do to your monthly and annual revenue —
          without touching your internal pricing.
        </p>
        <button type="button" className="primary-cta" onClick={openRoi}>
          Open ROI Calculator
        </button>
      </section>

      {/* Center CTA */}
      <section className="section center-cta">
        <h2>Ready to Hear Your AI Workforce in Action?</h2>
        <p>Book a live demo call and listen to how your prospects would be handled — in real time.</p>
        <a href="#demo" className="primary-cta">
          Book a Demo
        </a>
      </section>

      {/* Bottom Sticky CTA */}
      {showBottomCta && (
        <div className="bottom-cta">
          🔥 Ready to Automate?{" "}
          <a href="#demo">Book Your Demo</a>
        </div>
      )}

      {/* ROI Popup Modal */}
      {showRoi && (
        <div className="roi-popup-overlay" onClick={closeRoi}>
          <div className="roi-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeRoi}>
              ×
            </button>
            <h3>ROI Calculator</h3>

            <div className="roi-section">
              <h4>Simple Recovery Model</h4>
              <p className="roi-caption">
                Estimate recovered revenue from speed-to-lead + follow-up only.
              </p>

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
                  setMissed(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />

              <label>AI Recovery % of Missed Leads</label>
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
                Calculate Simple ROI
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

            <hr className="roi-divider" />

            <div className="roi-section">
              <h4>Enterprise Impact Model</h4>
              <p className="roi-caption">
                Model the impact of better close rates plus staffing & AI costs.
              </p>

              <label>Leads per Month</label>
              <input
                type="number"
                value={entLeads}
                onChange={(e) =>
                  setEntLeads(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />

              <label>Current Close %</label>
              <input
                type="number"
                value={currentClose}
                onChange={(e) =>
                  setCurrentClose(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />

              <label>Close % with AI Workforce</label>
              <input
                type="number"
                value={aiClose}
                onChange={(e) =>
                  setAiClose(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />

              <label>Average Ticket ($)</label>
              <input
                type="number"
                value={avgTicket}
                onChange={(e) =>
                  setAvgTicket(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />

              <label>Monthly Staff Cost Attributed to This (Optional)</label>
              <input
                type="number"
                value={staffCost}
                onChange={(e) =>
                  setStaffCost(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />

              <label>Monthly AI Cost (Optional)</label>
              <input
                type="number"
                value={aiCost}
                onChange={(e) =>
                  setAiCost(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />

              <button
                type="button"
                className="roi-btn"
                onClick={calcEnterpriseRoi}
              >
                Calculate Enterprise ROI
              </button>

              {entExtraRevenue !== null && entNetGain !== null && entAnnualGain !== null && (
                <div className="roi-result">
                  <p>
                    💰 Additional Monthly Revenue from AI Close Rate:{" "}
                    <strong>{currency(entExtraRevenue)}</strong>
                  </p>
                  <p>
                    🧮 Estimated Net Monthly Gain (after staff + AI cost):{" "}
                    <strong>{currency(entNetGain)}</strong>
                  </p>
                  <p>
                    📆 Estimated Net Annual Gain:{" "}
                    <strong>{currency(entAnnualGain)}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
