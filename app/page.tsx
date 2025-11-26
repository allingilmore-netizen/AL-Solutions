"use client";

import { useEffect, useState } from "react";

type Track = "generic" | "sales" | "service";

export default function HomePage() {
  const [showBottomCta, setShowBottomCta] = useState(false);
  const [showRoi, setShowRoi] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [industryTrack, setIndustryTrack] = useState<Track>("generic");

  // Simple ROI state
  const [leads, setLeads] = useState<number | "">("");
  const [ticket, setTicket] = useState<number | "">("");
  const [missed, setMissed] = useState<number | "">("");
  const [recovery, setRecovery] = useState<number | "">("");
  const [closeRate, setCloseRate] = useState<number | "">("");
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

  // Exit-intent logic (smarter, once-only, mobile aware)
  useEffect(() => {
    let hasShownModal = false;
    let exitReady = false;

    const enableExit = () => {
      exitReady = true;
    };

    const showModal = () => {
      if (hasShownModal || !exitReady) return;
      hasShownModal = true;
      setShowExitModal(true);
    };

    // Time-based readiness
    const timer = window.setTimeout(enableExit, 7000);

    // Scroll-based readiness (user has engaged a bit)
    const onScroll = () => {
      if (window.scrollY > 250) exitReady = true;
    };

    window.addEventListener("scroll", onScroll);

    // Desktop: mouse leaves top of viewport
    const onMouseOut = (e: MouseEvent) => {
      if (!exitReady) return;
      if (e.clientY <= 0) showModal();
    };

    document.addEventListener("mouseout", onMouseOut);

    // Mobile: fast upward scroll near top
    let lastScroll = window.scrollY;
    const onMobileScroll = () => {
      const current = window.scrollY;
      const delta = lastScroll - current;
      lastScroll = current;
      if (!exitReady) return;
      if (delta > 40 && current < 120) {
        showModal();
      }
    };

    window.addEventListener("scroll", onMobileScroll);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onMobileScroll);
    };
  }, []);

  const openRoi = () => setShowRoi(true);
  const closeRoi = () => setShowRoi(false);

  const currency = (n: number | null) => (n === null ? "" : `$${n.toLocaleString()}`);

  const calcRoi = () => {
    if (
      leads === "" ||
      ticket === "" ||
      missed === "" ||
      recovery === "" ||
      closeRate === ""
    ) {
      setMonthlyRoi(null);
      setAnnualRoi(null);
      return;
    }

    const L = Number(leads);
    const T = Number(ticket);
    const M = Number(missed) / 100; // missed %
    const R = Number(recovery) / 100; // AI recovery of missed
    const C = Number(closeRate) / 100; // appointment-to-close %

    const recoveredLeads = L * M * R;
    const closedDeals = recoveredLeads * C;
    const monthly = closedDeals * T;
    const annual = monthly * 12;

    setMonthlyRoi(monthly);
    setAnnualRoi(annual);
  };

  // React version of your lead form submit logic
  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const data = {
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement)?.value,
      email: (form.elements.namedItem("email") as HTMLInputElement)?.value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement)?.value,
      fccConsent: (form.elements.namedItem("fccConsent") as HTMLInputElement)?.checked,
    };

    try {
      await fetch("https://api.thoughtly.com/webhook/automation/Oqf6FbI5nD04", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      alert("Thank you! Our team will reach out shortly!");
      form.reset();
    } catch (err) {
      console.error("Lead submit failed", err);
      alert("Something went wrong. Please try again in a moment.");
    }
  };

  return (
    <div className="page-root" data-ai-track={industryTrack}>
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
          <h1>Turn Missed Calls &amp; Slow Follow-Up into a 24/7 AI Workforce</h1>
          <p className="hero-sub">
            Your AI agents answer instantly, qualify leads, book calendars, recover no-shows, and handle
            dispatch — so you stop bleeding revenue to voicemail, delays, and “we’ll call them later.”
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
            <div className="hero-badge">Speed-to-Lead under 30 SECONDS</div>
            <div className="hero-badge">AI Booking • No-Show Recovery</div>
            <div className="hero-badge">Built for small &amp; mid-sized teams</div>
          </div>
        </div>
      </section>

      {/* SPEED-TO-LEAD DEMO + FORM */}
      <section className="section fade-3d" id="demo">
        <h2>⚡ Test Speed to Lead in Real Time</h2>
        <p className="section-lead">
          Fill out the form below and let your AI agent call back. This is exactly how your prospects would
          experience instant response.
        </p>

        <div className="form-placeholder">
          {/* Inline styles for the lead form (your original CSS) */}
          <style>{`
            .lead-form {
              max-width: 420px;
              padding: 20px;
              background: #FFFFFF;
              border: 2px solid #047857;
              border-radius: 14px;
              font-family: Arial, sans-serif;
              color: #0F172A;
              margin: 0 auto;
            }

            .lead-form h2 {
              color: #047857;
              font-size: 22px;
              margin-bottom: 12px;
              text-align: center;
            }

            .lead-form label {
              display: block;
              margin-bottom: 6px;
              font-weight: bold;
              color: #047857;
            }

            .lead-form input[type="text"],
            .lead-form input[type="email"],
            .lead-form input[type="tel"] {
              width: 100%;
              padding: 10px;
              border: 1px solid #047857;
              border-radius: 8px;
              margin-bottom: 15px;
              font-size: 15px;
            }

            .consent-box {
              display: flex;
              align-items: flex-start;
              gap: 10px;
              margin-bottom: 18px;
              font-size: 14px;
              line-height: 1.35;
            }

            .lead-form button {
              width: 100%;
              background-color: #047857;
              color: #FFFFFF;
              padding: 12px;
              border: none;
              border-radius: 8px;
              font-size: 17px;
              font-weight: bold;
              cursor: pointer;
            }

            .lead-form button:hover {
              background-color: #036149;
            }
          `}</style>

          <form id="leadForm" className="lead-form" onSubmit={handleLeadSubmit}>
            <h2>FREE LIVE DEMO</h2>

            <label htmlFor="firstName">First Name *</label>
            <input type="text" id="firstName" name="firstName" required />

            <label htmlFor="email">Email *</label>
            <input type="email" id="email" name="email" required />

            <label htmlFor="phone">Phone *</label>
            <input type="tel" id="phone" name="phone" required />

            <label className="consent-box">
              <input type="checkbox" id="fccConsent" name="fccConsent" required />
              <span>
                I consent to receive marketing calls and SMS messages, including calls and messages sent by AI
                systems, to the phone number I provided. Consent is not a condition of purchase. Message and data
                rates may apply.
              </span>
            </label>

            <button type="submit">Submit</button>
          </form>
        </div>
      </section>

      {/* Industry Selector Section */}
      <section id="industry-selector" className="py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-3 text-gray-900">Who are you improving results for?</h2>
          <p className="text-gray-700 mb-6">Select your focus so we can tailor the examples and language to you.</p>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIndustryTrack("sales")}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition shadow-sm hover:shadow-md ${
                industryTrack === "sales"
                  ? "bg-emerald-600 text-white border-emerald-700"
                  : "bg-white text-gray-800 border-gray-300"
              }`}
            >
              Sales Teams
            </button>

            <button
              type="button"
              onClick={() => setIndustryTrack("service")}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition shadow-sm hover:shadow-md ${
                industryTrack === "service"
                  ? "bg-emerald-600 text-white border-emerald-700"
                  : "bg-white text-gray-800 border-gray-300"
              }`}
            >
              Local Businesses
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-3">(All features apply to both — this only adjusts the examples.)</p>
        </div>
      </section>

      {/* AGENT DIAGRAM — SYSTEM FLOW */}
      <section className="section fade-3d">
        <h2>🧠 Your AI Workforce Flow</h2>
        <p className="section-lead">
          Think of this like hiring a full small team — booking, recovering, dispatching, and cleaning up your
          pipeline — but fully AI-driven and always on.
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
            <div className="diagram-label">Recovery &amp; Nurture</div>
            <div className="diagram-node">
              <h3>No-Show Recovery Agent</h3>
              <p>Calls &amp; texts missed appointments to reschedule and fill gaps.</p>
            </div>
            <div className="diagram-arrow">↓</div>
            <div className="diagram-node">
              <h3>Follow-Up &amp; Nurture Agent</h3>
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
            <h3>Answer &amp; Qualify</h3>
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
            <p>ETAs, “running late,” and confirmations handled without staff.</p>
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
          This isn’t “just software.” It’s an AI workforce that plugs the silent leaks already costing you
          real money.
        </p>

        <div className="card-grid">
          <div className="card fade-3d-slow">
            <h3>Missed &amp; Abandoned Calls</h3>
            <p>Calls that hit voicemail or ring out are often lost deals forever.</p>
          </div>
          <div className="card fade-3d-slow">
            <h3>Slow Follow-Up</h3>
            <p>Leads that wait hours or days drift to whoever answers first.</p>
          </div>
          <div className="card fade-3d-slow">
            <h3>No-Show Waste</h3>
            <p>Empty appointment slots equal lost production time &amp; ad spend.</p>
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
          Most growing service businesses quietly leak <strong>hundreds of thousands per year</strong> through
          these gaps. Your AI workforce exists to quietly plug them.
        </p>
      </section>

      {/* PHASE OVERVIEW — NO PRICES */}
      <section className="section fade-3d">
        <h2>📦 How We Roll This Out</h2>
        <p className="section-lead">
          We don’t throw a random bot at your phones. We phase in an AI workforce that matches where your
          operation is today.
        </p>

        <div className="package-grid">
          <div className="package-card fade-3d">
            <h3>Phase 1 — Core Inbound &amp; Booking</h3>
            <ul>
              <li>Inbound agent answering calls 24/7</li>
              <li>FAQ + intake scripting tuned to your offers</li>
              <li>Calendar connection &amp; booking flows</li>
              <li>Live transfer path to you or your team</li>
              <li>Basic reporting on calls &amp; bookings</li>
            </ul>
          </div>

          <div className="package-card fade-3d">
            <h3>Phase 2 — Recovery &amp; Nurture Stack</h3>
            <ul>
              <li>No-show recovery agent (call + SMS)</li>
              <li>Multi-step nurture for “not now” and slow leads</li>
              <li>Multi-agent coordination logic behind the scenes</li>
              <li>Deeper qualification flows &amp; routing</li>
              <li>Improvements driven by real call &amp; booking data</li>
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

      {/* Advanced Sales Performance (Expandable) */}
      <section id="advanced-sales-system" className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Want Even Higher Sales Performance?</h2>
          <p className="text-gray-700 mb-4 text-center">
            For teams that run structured demos, consults, or sales calls, we also offer an optional advanced
            system that sits on top of your AI workforce.
          </p>

          <AdvancedSalesPanel />
        </div>
      </section>

      {/* CENTER CTA */}
      <section className="section center-cta fade-3d">
        <h2>Ready to Hear Your AI Workforce in Action?</h2>
        <p>
          Book a live demo and listen to how your inbound calls, booking flow, and no-show recovery could sound
          — before you plug it into your business.
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
              onChange={(e) => setLeads(e.target.value === "" ? "" : Number(e.target.value))}
            />

            <label>Average Ticket ($)</label>
            <input
              type="number"
              value={ticket}
              onChange={(e) => setTicket(e.target.value === "" ? "" : Number(e.target.value))}
            />

            <label>Missed Lead % (slow or no follow-up)</label>
            <input
              type="number"
              value={missed}
              onChange={(e) => setMissed(e.target.value === "" ? "" : Number(e.target.value))}
            />

            <label>AI Recovery % of Those Missed Leads</label>
            <input
              type="number"
              value={recovery}
              onChange={(e) => setRecovery(e.target.value === "" ? "" : Number(e.target.value))}
            />

            <label>Appointment-to-Close %</label>
            <input
              type="number"
              value={closeRate}
              onChange={(e) => setCloseRate(e.target.value === "" ? "" : Number(e.target.value))}
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
                  📅 Estimated Annual Revenue Recovered:{" "}
                  <strong>{currency(annualRoi)}</strong>
                </p>
                <p className="roi-footnote">
                  This assumes your current appointment-to-close rate stays the same. Our advanced performance
                  system often adds another <strong>20–40%</strong> lift in close rate and up to
                  <strong> 60%</strong> higher show rates — ask our Consulting Assistant about it during your demo.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exit Intent Modal */}
      {showExitModal && (
        <div
          id="exitModal"
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowExitModal(false)}
        >
          <div
            className="bg-white max-w-md w-full mx-4 rounded-2xl shadow-xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
              aria-label="Close"
              onClick={() => setShowExitModal(false)}
            >
              ×
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Before you go — want to see AI speed-to-lead in action?
            </h3>
            <p className="text-gray-700 mb-4 text-sm">
              Enter your number and we’ll have your AI agent call you back so you can experience instant
              response from a prospect’s point of view.
            </p>

            <form
              id="exitDemoForm"
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: wire to Typeform or Thoughtly trigger
                alert("Got it! This will be wired to your AI demo trigger.");
                setShowExitModal(false);
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Name</label>
                <input
                  type="text"
                  name="exitName"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  name="exitPhone"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="555-555-5555"
                />
              </div>
              <p className="text-xs text-gray-500">
                By submitting, you consent to receive an AI demo call and SMS. Message and data rates may apply.
              </p>
              <button
                type="submit"
                className="w-full mt-1 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                Send Me the AI Demo Call
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdvancedSalesPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-900">
          See how teams are adding 20–40% more conversions on the same lead flow
        </span>
        <span className="text-xl leading-none">{open ? "–" : "+"}</span>
      </button>

      {open && (
        <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-white text-sm text-gray-800 space-y-3">
          <p>
            This private framework is built around a full journey:
            <strong> marketing → speed-to-lead → quality booking → sales video → consultant call.</strong>
          </p>
          <p>When implemented correctly, we’ve seen:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>800%+ lift in booked appointments</strong> vs. slow manual follow-up.
            </li>
            <li>
              <strong>20–40% higher appointment-to-close ratios</strong> by getting buyers ready before they ever
              arrive on the call.
            </li>
            <li>
              <strong>Up to 60% more show-ups</strong> using simple, consistent phrasing your AI agent never forgets
              to say.
            </li>
          </ul>
          <p>
            It works for sales-heavy teams <em>and</em> for service businesses that depend on kept appointments
            (med spa, dental, home services, clinics, etc.). The details stay off the website — they’re only
            walked through live.
          </p>
          <p className="font-semibold">
            Ask our Consulting Assistant about the <em>Advanced Sales Performance System</em> during your demo and
            you’ll get a few free pointers tailored to your business, without us handing over the full playbook.
          </p>
        </div>
      )}
    </div>
  );
}
