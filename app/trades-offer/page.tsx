"use client";

import React, { useMemo, useState } from "react";

type IndustryKey = "general" | "home" | "trades" | "remodel" | "local";
type PackageKey = "A" | "B" | "C";

const BRAND = {
  emerald: "#047857",
  emeraldDark: "#065f46",
  gold: "#F4D03F",
  charcoal: "#0F172A",
  deepBg: "#020617",
  muted: "#9CA3AF",
  offwhite: "#F9FAFB",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Accordion(props: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(props.defaultOpen));
  return (
    <div className={cx("acc", open && "acc--open")}>
      <button type="button" className="accBtn" onClick={() => setOpen((v) => !v)}>
        <span className="accTitle">{props.title}</span>
        <span className={cx("accIcon", open && "accIcon--open")}>▾</span>
      </button>
      {open ? <div className="accBody">{props.children}</div> : null}
    </div>
  );
}

export default function PricingPage() {
  const [industry, setIndustry] = useState<IndustryKey>("trades");
  const [selected, setSelected] = useState<PackageKey>("B");

  // lightweight ROI calculator (optional, not “promises”)
  const [leads, setLeads] = useState("120");
  const [contactRate, setContactRate] = useState("55"); // %
  const [bookRate, setBookRate] = useState("35"); // %
  const [showRate, setShowRate] = useState("70"); // %
  const [avgTicket, setAvgTicket] = useState("1500");

  const parsed = useMemo(() => {
    const n = (v: string) => (Number.isFinite(Number(v)) ? Number(v) : 0);
    return {
      leads: Math.max(0, n(leads)),
      contactRate: Math.min(100, Math.max(0, n(contactRate))),
      bookRate: Math.min(100, Math.max(0, n(bookRate))),
      showRate: Math.min(100, Math.max(0, n(showRate))),
      avgTicket: Math.max(0, n(avgTicket)),
    };
  }, [leads, contactRate, bookRate, showRate, avgTicket]);

  const roi = useMemo(() => {
    // Baseline (simple funnel): leads -> contacted -> booked -> shows -> revenue
    const contacted = parsed.leads * (parsed.contactRate / 100);
    const booked = contacted * (parsed.bookRate / 100);
    const shows = booked * (parsed.showRate / 100);
    const revenue = shows * parsed.avgTicket;

    // Conservative “improvement” model (editable later):
    // - improve contact rate by +20 points (cap 95)
    // - improve booked rate by +10 points (cap 80)
    // - improve show rate by +10 points (cap 95)
    const improvedContact = parsed.leads * (Math.min(95, parsed.contactRate + 20) / 100);
    const improvedBooked = improvedContact * (Math.min(80, parsed.bookRate + 10) / 100);
    const improvedShows = improvedBooked * (Math.min(95, parsed.showRate + 10) / 100);
    const improvedRevenue = improvedShows * parsed.avgTicket;

    const delta = Math.max(0, improvedRevenue - revenue);

    return {
      contacted,
      booked,
      shows,
      revenue,
      improvedContacted: improvedContact,
      improvedBooked,
      improvedShows,
      improvedRevenue,
      delta,
    };
  }, [parsed]);

  const industryLabel = useMemo(() => {
    switch (industry) {
      case "home":
        return "Home Services (HVAC, Plumbing, Roofing, Electrical, etc.)";
      case "remodel":
        return "Remodelers (kitchens, baths, flooring, windows, etc.)";
      case "local":
        return "Local Services (appointments + inbound calls)";
      case "general":
        return "Any appointment-based business";
      default:
        return "Trades & Field Services";
    }
  }, [industry]);

  const packages = useMemo(
    () => [
      {
        key: "A" as const,
        title: "Package A — Answer + Book",
        bestFor: "Shops that miss calls, get interrupted, or have inconsistent phone coverage.",
        setup: "$2,500",
        monthly: "$497/mo",
        bullets: [
          "24/7 AI receptionist (answers calls, captures details, qualifies, routes)",
          "Appointment booking to 1 calendar (Google or GoHighLevel)",
          "Missed-call text back + booking-link fallback",
          "Basic FAQ + service area / hours / pricing-range handling (no complex quoting)",
          "Call transfer rules (to owner / office / on-call)",
          "Basic reporting (call outcomes + booked vs missed)",
        ],
        notIncluded: [
          "Deep quoting / custom estimating logic",
          "Multi-location routing complexity (available as add-on)",
        ],
      },
      {
        key: "B" as const,
        title: "Package B — Speed-to-Lead Booking Engine",
        bestFor: "Inbound lead flow from ads/referrals where speed matters.",
        setup: "$6,900",
        monthly: "$997/mo",
        bullets: [
          "Everything in Package A",
          "Speed-to-lead: lead triggers immediate SMS + outbound call within ~60 seconds",
          "Follow-up sequence (call + SMS) for 7–14 days if not reached",
          "Appointment confirmation + reminders",
          "Reschedule + cancel flows included",
          "Booking logic that reduces fake appointments (clear next steps + verification)",
          "Up to 2 phone numbers included (main + tracking number)",
        ],
        notIncluded: ["No-show recovery & old-lead reactivation (Package C add-on)"],
      },
      {
        key: "C" as const,
        title: "Package C — Recovery & Reactivation Add-On",
        bestFor: "Trades with high no-show rates or lots of old estimates that died.",
        setup: "$4,900",
        monthly: "+$497/mo",
        bullets: [
          "No-show recovery agent + workflow (calls + SMS after no-show)",
          "No-sale follow-up agent (revives didn’t-buy and stale estimates)",
          "Call-me-back logic (caller requests callback → books time → AI executes)",
          "Controlled outreach cadence with opt-out handling",
        ],
        notIncluded: ["Requires Package A or B as the base system"],
      },
    ],
    []
  );

  const addOns = useMemo(
    () => [
      { name: "Additional calendar sync", price: "$250 one-time each" },
      { name: "Additional phone number", price: "$25/mo each" },
      { name: "Multi-location routing pack (by zip/city/service type)", price: "$750 one-time" },
      { name: "Pre-call training video (one-to-many) — short", price: "$1,250 (≈5 min / ~10 scenes)" },
      { name: "Pre-call training video (one-to-many) — long", price: "$4,400 (≈30 min / ~30 scenes)" },
      { name: "Unique link tracking + behavior-based reminders", price: "$1,250 one-time + $197/mo" },
    ],
    []
  );

  const voicePacks = useMemo(
    () => [
      { charge: "$35", core: "80", beastEq: "32" },
      { charge: "$62", core: "170", beastEq: "68" },
      { charge: "$80", core: "260", beastEq: "104" },
      { charge: "$98", core: "350", beastEq: "140" },
      { charge: "$197", core: "800", beastEq: "320" },
    ],
    []
  );

  const smsPacks = useMemo(
    () => [
      { charge: "$3.50", credits: "80" },
      { charge: "$8.00", credits: "250" },
      { charge: "$17.00", credits: "600" },
      { charge: "$26.00", credits: "1,200" },
      { charge: "$44.00", credits: "2,500" },
      { charge: "$98.00", credits: "6,000" },
    ],
    []
  );

  const active = packages.find((p) => p.key === selected) ?? packages[1];

  return (
    <main className="aid">
      <style>{`
        :root{
          --emerald:${BRAND.emerald};
          --emeraldDark:${BRAND.emeraldDark};
          --gold:${BRAND.gold};
          --charcoal:${BRAND.charcoal};
          --deepBg:${BRAND.deepBg};
          --muted:${BRAND.muted};
          --offwhite:${BRAND.offwhite};
        }

        body{
          margin:0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
          background: radial-gradient(circle at top, #022c22 0, #020617 55%, #000000 100%);
          color:#E5E7EB;
        }

        .aid{ min-height:100vh; }
        .wrap{
          max-width: 1120px;
          margin: 0 auto;
          padding: 28px 16px 90px;
        }

        /* Header */
        .top{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:16px;
          margin-bottom:18px;
        }
        @media (max-width: 860px){ .top{ flex-direction:column; align-items:flex-start; } }

        .brand{
          display:inline-flex;
          gap:12px;
          align-items:center;
        }
        .logo{
          width:40px; height:40px; border-radius:14px;
          background: radial-gradient(circle at 30% 20%, #6EE7B7 0, var(--emerald) 45%, #022c22 100%);
          box-shadow: 0 14px 34px rgba(5,150,105,.45);
        }
        .btxt{ display:flex; flex-direction:column; }
        .bname{
          font-weight:800;
          letter-spacing:.12em;
          text-transform:uppercase;
          font-size:1rem;
        }
        .btag{ color: var(--muted); font-size:.92rem; }

        .pill{
          border: 1px solid rgba(148,163,184,.55);
          background: rgba(15,23,42,.72);
          backdrop-filter: blur(12px);
          border-radius: 999px;
          padding: 8px 14px;
          display:inline-flex;
          align-items:center;
          gap:10px;
          font-size:.92rem;
          color:#D1D5DB;
          white-space:nowrap;
        }
        .dot{
          width:9px; height:9px; border-radius:999px;
          background: radial-gradient(circle at 30% 20%, #BBF7D0 0, #22C55E 40%, #166534 100%);
          box-shadow: 0 0 12px rgba(34,197,94,.6);
        }

        /* Hero */
        .hero{
          display:grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, .8fr);
          gap: 18px;
          margin-top: 14px;
          align-items: stretch;
        }
        @media (max-width: 980px){ .hero{ grid-template-columns:1fr; } }

        .hcard{
          border-radius: 20px;
          background: rgba(15,23,42,.93);
          border: 1px solid rgba(148,163,184,.65);
          box-shadow: 0 18px 60px rgba(15,23,42,.85);
          padding: 16px;
        }
        .eyebrow{
          font-size:.88rem;
          letter-spacing:.18em;
          text-transform:uppercase;
          color: var(--muted);
          margin-bottom: 6px;
        }
        .h1{
          margin: 0 0 8px;
          font-size: clamp(2.1rem, 3.2vw, 2.9rem);
          letter-spacing: -0.04em;
          line-height: 1.08;
        }
        .h1 span{
          background: linear-gradient(120deg, var(--gold), #F59E0B);
          -webkit-background-clip:text;
          background-clip:text;
          color: transparent;
        }
        .sub{
          margin: 0;
          color:#CBD5F5;
          font-size: 1.02rem;
          max-width: 760px;
        }

        .heroRight{
          display:flex;
          flex-direction:column;
          gap: 10px;
        }
        .contactRow{
          display:flex;
          flex-direction:column;
          gap: 8px;
        }
        .kv{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 14px;
          background: rgba(2,6,23,.6);
          border: 1px solid rgba(148,163,184,.55);
        }
        .kvl{ color: #CBD5F5; font-size:.92rem; }
        .kvr{
          color:#E5E7EB;
          font-weight: 700;
          font-size:.95rem;
        }
        .kvr a{ color: #E5E7EB; text-decoration:none; }
        .kvr a:hover{ text-decoration:underline; }

        .ctaRow{
          display:flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 6px;
        }
        .btn{
          border:none;
          border-radius:999px;
          padding: 10px 14px;
          font-weight: 800;
          cursor:pointer;
          text-decoration:none;
          display:inline-flex;
          align-items:center;
          gap:8px;
          letter-spacing:.01em;
        }
        .btnPrimary{
          background: linear-gradient(135deg, var(--emerald), #22C55E);
          color: #ECFDF5;
          box-shadow: 0 14px 40px rgba(16,185,129,.48);
        }
        .btnGhost{
          background: rgba(2,6,23,.6);
          border: 1px solid rgba(148,163,184,.65);
          color: #E5E7EB;
        }
        .btn small{ opacity: .9; font-weight: 700; }

        /* Industry */
        .row{
          margin-top: 14px;
          display:flex;
          flex-wrap: wrap;
          align-items:center;
          gap: 10px;
        }
        .rowLabel{ color: var(--muted); font-size:.92rem; }
        .pills{ display:flex; flex-wrap: wrap; gap: 8px; }
        .ipill{
          border-radius: 999px;
          border: 1px solid rgba(148,163,184,.75);
          background: rgba(15,23,42,.95);
          color: #E5E7EB;
          padding: 6px 11px;
          font-size:.86rem;
          cursor:pointer;
        }
        .ipillActive{
          background: rgba(4,120,87,.92);
          border-color: var(--gold);
          color:#ECFDF5;
        }
        .helper{
          width: 100%;
          color:#E5E7EB;
          font-size:.88rem;
          margin-top: 2px;
        }

        /* Sections */
        .section{ margin-top: 22px; }
        .sh{
          display:flex;
          justify-content:space-between;
          align-items:flex-end;
          gap: 10px;
          margin-bottom: 10px;
        }
        .st{
          font-size: 1.26rem;
          font-weight: 800;
          margin: 0;
        }
        .ss{
          margin: 6px 0 0;
          color:#CBD5F5;
          font-size:.96rem;
          max-width: 860px;
        }
        .tag{
          font-size:.82rem;
          color: var(--muted);
          border: 1px solid rgba(148,163,184,.55);
          background: rgba(15,23,42,.7);
          padding: 4px 10px;
          border-radius: 999px;
          white-space:nowrap;
        }

        /* Package selector */
        .pkgGrid{
          display:grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 10px;
        }
        @media (max-width: 980px){ .pkgGrid{ grid-template-columns:1fr; } }

        .pkgPill{
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,.65);
          background: rgba(15,23,42,.95);
          padding: 12px 12px 10px;
          cursor:pointer;
          transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
          text-align:left;
        }
        .pkgPill:hover{ transform: translateY(-1px); }
        .pkgActive{
          border-color: var(--gold);
          background: radial-gradient(circle at top left, rgba(4,120,87,.55), rgba(15,23,42,.98));
          box-shadow: 0 18px 50px rgba(4,120,87,.55);
        }
        .pkgTitle{ font-weight: 900; font-size: 1rem; margin:0; }
        .pkgBest{ margin: 4px 0 0; color: var(--muted); font-size:.9rem; }
        .pkgPrice{ margin: 10px 0 0; color: #FACC15; font-weight: 900; font-size:.92rem; }

        /* Cards */
        .grid2{
          display:grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
          gap: 14px;
          margin-top: 12px;
        }
        @media (max-width: 980px){ .grid2{ grid-template-columns:1fr; } }

        .card{
          border-radius: 20px;
          background: rgba(15,23,42,.95);
          border: 1px solid rgba(148,163,184,.65);
          box-shadow: 0 18px 60px rgba(15,23,42,.82);
          padding: 14px;
        }
        .cardAlt{
          background: radial-gradient(circle at top, rgba(24,24,27,.96), rgba(15,23,42,.98));
        }
        .ct{ font-weight: 900; margin:0 0 4px; }
        .csub{ color: var(--muted); margin:0 0 8px; font-size:.93rem; }
        .priceMain{ font-size: 1.6rem; font-weight: 1000; margin: 8px 0 0; }
        .priceLine{ color: var(--muted); margin-top: 2px; font-size:.92rem; }

        .list{
          list-style:none;
          padding:0;
          margin: 10px 0 0;
          display:grid;
          gap: 6px;
          font-size: .95rem;
        }
        .list li{
          position:relative;
          padding-left: 16px;
          color:#E5E7EB;
        }
        .list li:before{
          content:"•";
          position:absolute;
          left: 3px; top: 0;
          color: var(--gold);
        }
        .divider{
          height:1px;
          background: rgba(31,41,55,.85);
          margin: 12px 0;
        }
        .note{
          margin-top: 10px;
          color: var(--muted);
          font-size: .88rem;
          line-height: 1.45;
        }

        /* Tables */
        table{
          width:100%;
          border-collapse: collapse;
          font-size:.9rem;
          margin-top: 8px;
        }
        thead{
          background: rgba(2,6,23,.55);
        }
        th, td{
          text-align:left;
          padding: 8px 8px;
          border-bottom: 1px solid rgba(31,41,55,.85);
        }
        th{
          color:#9CA3AF;
          font-size:.84rem;
          font-weight: 800;
        }
        tr:last-child td{ border-bottom:none; }

        /* FAQ */
        .acc{
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,.55);
          background: rgba(15,23,42,.88);
          overflow:hidden;
        }
        .accBtn{
          width:100%;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 12px;
          padding: 12px 12px;
          background: transparent;
          border:none;
          cursor:pointer;
          color:#E5E7EB;
          text-align:left;
        }
        .accTitle{ font-weight: 900; }
        .accIcon{
          color: var(--muted);
          transition: transform .12s ease;
        }
        .accIcon--open{ transform: rotate(180deg); }
        .accBody{
          padding: 0 12px 12px;
          color:#CBD5F5;
          font-size:.94rem;
          line-height: 1.5;
        }

        /* Footer CTA */
        .footerCta{
          margin-top: 26px;
          padding-top: 16px;
          border-top: 1px solid rgba(31,41,55,.85);
          display:flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items:center;
          justify-content: space-between;
        }
        .footerText{
          color:#CBD5F5;
          font-size:.98rem;
          max-width: 820px;
        }
        .footerText strong{ color: var(--gold); }
      `}</style>

      <div className="wrap">
        {/* Top */}
        <header className="top">
          <div className="brand">
            <div className="logo" />
            <div className="btxt">
              <div className="bname">ALL IN DIGITAL</div>
              <div className="btag">Trades Lead Capture + Booking System</div>
            </div>
          </div>

          <div className="pill">
            <span className="dot" />
            <span>24/7 booking + follow-up. Built to stop missed leads.</span>
          </div>
        </header>

        {/* Hero */}
        <section className="hero">
          <div className="hcard">
            <div className="eyebrow">Offer & Pricing</div>
            <h1 className="h1">
              Stop losing money to <span>missed calls</span>, slow follow-up, and no-shows.
            </h1>
            <p className="sub">
              We run a 24/7 AI booking + follow-up system that sits on top of your calendar and phone number.
              No gimmicks — the goal is simple: more booked appointments, more shows, and more recovered leads.
            </p>

            <div className="row" style={{ marginTop: 12 }}>
              <div className="rowLabel">Best fit for:</div>
              <div className="pills">
                <button
                  type="button"
                  className={cx("ipill", industry === "trades" && "ipillActive")}
                  onClick={() => setIndustry("trades")}
                >
                  Trades
                </button>
                <button
                  type="button"
                  className={cx("ipill", industry === "home" && "ipillActive")}
                  onClick={() => setIndustry("home")}
                >
                  Home Services
                </button>
                <button
                  type="button"
                  className={cx("ipill", industry === "remodel" && "ipillActive")}
                  onClick={() => setIndustry("remodel")}
                >
                  Remodelers
                </button>
                <button
                  type="button"
                  className={cx("ipill", industry === "local" && "ipillActive")}
                  onClick={() => setIndustry("local")}
                >
                  Local Services
                </button>
                <button
                  type="button"
                  className={cx("ipill", industry === "general" && "ipillActive")}
                  onClick={() => setIndustry("general")}
                >
                  Other
                </button>
              </div>
              <div className="helper">
                Optimized for: <strong>{industryLabel}</strong>.
              </div>
            </div>

            <div className="ctaRow">
              <a className={cx("btn", "btnPrimary")} href="tel:+14695008848">
                Call <small>469-500-8848</small> ↗
              </a>
              <a className={cx("btn", "btnGhost")} href="mailto:info@allindigitalmktg.com">
                Email <small>info@allindigitalmktg.com</small> ↗
              </a>
            </div>

            <p className="note" style={{ marginTop: 10 }}>
              Important: this system improves speed, coverage, and follow-up if your lead intake is legitimate.
              Garbage leads = garbage results.
            </p>
          </div>

          <div className="hcard heroRight">
            <div>
              <div className="ct">Quick snapshot</div>
              <div className="csub">What you’re buying (in plain English)</div>
            </div>

            <div className="contactRow">
              <div className="kv">
                <div className="kvl">Answer 24/7</div>
                <div className="kvr">AI receptionist + routing</div>
              </div>
              <div className="kv">
                <div className="kvl">Book to calendar</div>
                <div className="kvr">Google / GHL sync</div>
              </div>
              <div className="kv">
                <div className="kvl">Fast response</div>
                <div className="kvr">SMS + call in ~60s (Pkg B)</div>
              </div>
              <div className="kv">
                <div className="kvl">Follow-up</div>
                <div className="kvr">7–14 days (Pkg B)</div>
              </div>
              <div className="kv">
                <div className="kvl">Recover losses</div>
                <div className="kvr">No-show + stale leads (Pkg C)</div>
              </div>
            </div>

            <div className="divider" />

            <div>
              <div className="ct">Fast way to sell it</div>
              <div className="csub" style={{ color: "#CBD5F5" }}>
                “We stop missed calls and slow follow-up. The system answers 24/7, books to your calendar, and follows up until you
                either get them scheduled or they opt out.”
              </div>
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="section">
          <div className="sh">
            <div>
              <p className="st">Packages</p>
              <p className="ss">
                Pick the base system, then add recovery if you want no-shows and dead estimates handled automatically.
              </p>
            </div>
            <div className="tag">Simple pricing • predictable scope</div>
          </div>

          <div className="pkgGrid">
            {packages.map((p) => (
              <button
                key={p.key}
                type="button"
                className={cx("pkgPill", selected === p.key && "pkgActive")}
                onClick={() => setSelected(p.key)}
              >
                <div className="pkgTitle">{p.title}</div>
                <div className="pkgBest">{p.bestFor}</div>
                <div className="pkgPrice">
                  Setup {p.setup} • Ongoing {p.monthly} + usage
                </div>
              </button>
            ))}
          </div>

          <div className="grid2">
            <div className="card">
              <div className="ct">{active.title}</div>
              <div className="csub">{active.bestFor}</div>

              <div className="priceMain">{active.setup}</div>
              <div className="priceLine">One-time setup</div>
              <div className="priceLine">
                Ongoing: <strong>{active.monthly}</strong> (Platform + Support) + usage
              </div>

              <div className="divider" />

              <div className="ct" style={{ marginTop: 0 }}>
                Includes
              </div>
              <ul className="list">
                {active.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              <div className="divider" />

              <div className="ct" style={{ marginTop: 0 }}>
                Not included
              </div>
              <ul className="list">
                {active.notIncluded.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              <p className="note">
                Platform + Support covers monitoring, upkeep, and small workflow refinements. Usage (voice + SMS) is separate so you only
                pay for volume you actually use.
              </p>
            </div>

            <div className="card cardAlt">
              <div className="ct">Optional Add-Ons</div>
              <div className="csub">Add these only when you need them.</div>
              <ul className="list">
                {addOns.map((a) => (
                  <li key={a.name}>
                    <strong>{a.name}:</strong> {a.price}
                  </li>
                ))}
              </ul>

              <div className="divider" />

              <div className="ct">What we need to launch</div>
              <ul className="list">
                <li>Business hours + service list + service area</li>
                <li>Calendar access + availability rules</li>
                <li>Lead sources (calls/forms/ads) + where to send logs</li>
                <li>Your consent posture for SMS/calls (we configure opt-out + contact windows)</li>
              </ul>

              <p className="note">
                If you want “AI that negotiates price and closes,” that’s a separate scope with higher risk. Most trades don’t need it to win.
              </p>
            </div>
          </div>
        </section>

        {/* Usage */}
        <section className="section">
          <div className="sh">
            <div>
              <p className="st">Usage (Voice + SMS)</p>
              <p className="ss">Simple wallets, auto-refill, and clean rules that avoid billing fights.</p>
            </div>
            <div className="tag">Credits don’t expire</div>
          </div>

          <div className="grid2">
            <div className="card">
              <div className="ct">AI Voice Credits (Auto-Refill)</div>
              <div className="csub">
                Calls run in <strong>CORE</strong> by default (1 credit = 1 minute). <strong>BEAST</strong> is used only when explicitly enabled
                for that call/segment (2.5 credits per minute while BEAST is active).
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Charge</th>
                    <th>CORE credits</th>
                    <th>BEAST-minute equivalent</th>
                  </tr>
                </thead>
                <tbody>
                  {voicePacks.map((p) => (
                    <tr key={p.charge}>
                      <td>{p.charge}</td>
                      <td>{p.core}</td>
                      <td>{p.beastEq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="note">
                Auto-refill triggers at <strong>20 remaining credits</strong>. You can run CORE-only if you want maximum predictability.
              </p>
            </div>

            <div className="card cardAlt">
              <div className="ct">SMS Plans (Auto-rebill)</div>
              <div className="csub">
                Most normal texts cost <strong>1 credit</strong>. Very long texts may cost more depending on segmentation.
                Auto-rebill triggers when <strong>10 credits</strong> are left.
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Charge</th>
                    <th>SMS credits</th>
                  </tr>
                </thead>
                <tbody>
                  {smsPacks.map((p) => (
                    <tr key={p.charge}>
                      <td>{p.charge}</td>
                      <td>{p.credits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="note">
                We configure STOP handling + opt-out logic. You’re responsible for how consent is collected from your lead sources.
              </p>
            </div>
          </div>
        </section>

        {/* ROI (lightweight) */}
        <section className="section">
          <div className="sh">
            <div>
              <p className="st">Quick ROI Estimator</p>
              <p className="ss">Not a guarantee. Just a sanity check using your own numbers.</p>
            </div>
            <div className="tag">Edit inputs</div>
          </div>

          <div className="grid2">
            <div className="card">
              <div className="ct">Your current month</div>
              <div className="csub">Leads → contacted → booked → shows → revenue</div>

              <div className="grid2" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <div>
                  <label className="rowLabel">Monthly leads</label>
                  <input className="in" value={leads} onChange={(e) => setLeads(e.target.value)} type="number" min={0} />
                </div>
                <div>
                  <label className="rowLabel">Contact rate (%)</label>
                  <input
                    className="in"
                    value={contactRate}
                    onChange={(e) => setContactRate(e.target.value)}
                    type="number"
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <label className="rowLabel">Booked rate (of contacted) (%)</label>
                  <input
                    className="in"
                    value={bookRate}
                    onChange={(e) => setBookRate(e.target.value)}
                    type="number"
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <label className="rowLabel">Show rate (%)</label>
                  <input
                    className="in"
                    value={showRate}
                    onChange={(e) => setShowRate(e.target.value)}
                    type="number"
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <label className="rowLabel">Average ticket ($)</label>
                  <input
                    className="in"
                    value={avgTicket}
                    onChange={(e) => setAvgTicket(e.target.value)}
                    type="number"
                    min={0}
                  />
                </div>
              </div>

              <style>{`
                .in{
                  width:100%;
                  margin-top: 6px;
                  padding: 8px 10px;
                  border-radius: 12px;
                  border: 1px solid rgba(148,163,184,.7);
                  background: rgba(2,6,23,.55);
                  color:#E5E7EB;
                  outline:none;
                  font-size:.96rem;
                }
                .in:focus{
                  border-color: var(--emerald);
                  box-shadow: 0 0 0 1px rgba(4,120,87,.45);
                }
              `}</style>

              <div className="divider" />

              <ul className="list">
                <li>Contacted: {roi.contacted.toFixed(1)}</li>
                <li>Booked: {roi.booked.toFixed(1)}</li>
                <li>Shows: {roi.shows.toFixed(1)}</li>
                <li>
                  Est. revenue: <strong>${Math.round(roi.revenue).toLocaleString()}</strong>
                </li>
              </ul>
            </div>

            <div className="card cardAlt">
              <div className="ct">With faster response + follow-up</div>
              <div className="csub">
                This uses a conservative model (contact +20 points, booking +10 points, show +10 points, capped).
              </div>

              <div className="divider" />

              <ul className="list">
                <li>Contacted: {roi.improvedContacted.toFixed(1)}</li>
                <li>Booked: {roi.improvedBooked.toFixed(1)}</li>
                <li>Shows: {roi.improvedShows.toFixed(1)}</li>
                <li>
                  Est. revenue:{" "}
                  <strong>${Math.round(roi.improvedRevenue).toLocaleString()}</strong>
                </li>
                <li>
                  Est. lift:{" "}
                  <strong style={{ color: BRAND.gold }}>
                    ${Math.round(roi.delta).toLocaleString()}
                  </strong>
                </li>
              </ul>

              <p className="note">
                If your leads are junk, this won’t save it. If your leads are decent and you’re just slow/inconsistent, this is where the
                money shows up.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section">
          <div className="sh">
            <div>
              <p className="st">FAQ</p>
              <p className="ss">Clear answers to the stuff that usually stalls decisions.</p>
            </div>
            <div className="tag">No fluff</div>
          </div>

          <div className="grid2" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
            <div style={{ display: "grid", gap: 10 }}>
              <Accordion title="Do you replace my front office?" defaultOpen>
                No. This system covers missed calls, after-hours, fast response, booking, reminders, and follow-up. If you want a human to
                quote, dispatch, or negotiate, we route to them.
              </Accordion>
              <Accordion title="Can you work with my calendar and CRM?">
                Yes — Google Calendar and GoHighLevel are the default. If you’re on something else, we can usually integrate, but it may be an
                add-on depending on complexity.
              </Accordion>
              <Accordion title="What happens if someone asks for a callback?">
                Package C includes callback scheduling logic. If it’s a must-have for you, take Package B + C and you’re covered.
              </Accordion>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <Accordion title="What about compliance for SMS/calls?">
                We configure opt-out handling (STOP), contact windows, and logging. You’re responsible for how consent is collected from your
                lead sources. If your lead vendor won’t show consent language, don’t use them.
              </Accordion>
              <Accordion title="How fast can we launch?">
                If you can provide calendar access, basic business info, and lead routing, the base system can go live quickly. Complex
                routing and multi-location rules take longer.
              </Accordion>
              <Accordion title="Do credits expire?">
                No. Voice and SMS credits don’t expire. Auto-refill keeps things from shutting off mid-month.
              </Accordion>
            </div>
          </div>

          <div className="footerCta">
            <div className="footerText">
              Want this installed for <strong>{industryLabel}</strong>? Send your calendar access + lead source details and we’ll scope the right
              package in one call.
            </div>
            <div className="ctaRow" style={{ marginTop: 0 }}>
              <a className={cx("btn", "btnPrimary")} href="tel:+14695008848">
                Call <small>469-500-8848</small> ↗
              </a>
              <a className={cx("btn", "btnGhost")} href="mailto:info@allindigitalmktg.com">
                Email <small>info@allindigitalmktg.com</small> ↗
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
