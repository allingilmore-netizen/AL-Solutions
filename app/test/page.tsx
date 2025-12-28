"use client";

import React, { useMemo, useState } from "react";

type IndustryKey = "local" | "sales" | "other";
type LiftPreset = "low" | "typical" | "high";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function percent(n: number) {
  return `${Math.round(n * 100)}%`;
}

function money(n: number) {
  const v = isFinite(n) ? n : 0;
  return v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function numberWithCommas(n: number) {
  const v = isFinite(n) ? n : 0;
  return Math.round(v).toLocaleString();
}

function presetToValue(p: LiftPreset, low: number, typical: number, high: number) {
  if (p === "low") return low;
  if (p === "high") return high;
  return typical;
}

export default function CallOverviewPage() {
  const [industry, setIndustry] = useState<IndustryKey | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Simple lead form (you can wire this to your own endpoint later)
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", notes: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // ROI Calculator Inputs
  const [monthlyLeads, setMonthlyLeads] = useState<number>(100);
  const [avgDeal, setAvgDeal] = useState<number>(3500);
  const [currentBookingRate, setCurrentBookingRate] = useState<number>(0.12); // leads -> booked appointments
  const [currentShowRate, setCurrentShowRate] = useState<number>(0.55); // booked -> showed
  const [currentCloseRate, setCurrentCloseRate] = useState<number>(0.25); // showed -> closed

  // Which improvements are enabled
  const [enableSpeedToLead, setEnableSpeedToLead] = useState(true);
  const [enableFollowUp, setEnableFollowUp] = useState(true);
  const [enablePreCall, setEnablePreCall] = useState(true);

  // “Up to” ranges via presets
  const [speedPreset, setSpeedPreset] = useState<LiftPreset>("typical"); // 2x / 4x / 8x
  const [followPreset, setFollowPreset] = useState<LiftPreset>("typical"); // 3x / 7x / 15x
  const [showPreset, setShowPreset] = useState<LiftPreset>("typical"); // +10% / +25% / +40% relative lift
  const [closePreset, setClosePreset] = useState<LiftPreset>("typical"); // +10% / +25% / +40% relative lift

  const speedLift = useMemo(() => presetToValue(speedPreset, 2, 4, 8), [speedPreset]);
  const followLift = useMemo(() => presetToValue(followPreset, 3, 7, 15), [followPreset]);
  const showLiftRel = useMemo(() => presetToValue(showPreset, 0.1, 0.25, 0.4), [showPreset]); // relative increase
  const closeLiftRel = useMemo(() => presetToValue(closePreset, 0.1, 0.25, 0.4), [closePreset]); // relative increase

  const roi = useMemo(() => {
    const leads = clamp(monthlyLeads, 0, 1000000);
    const bookingRate = clamp(currentBookingRate, 0, 1);
    const showRate = clamp(currentShowRate, 0, 1);
    const closeRate = clamp(currentCloseRate, 0, 1);

    // Baseline funnel
    const baseBooked = leads * bookingRate;
    const baseShowed = baseBooked * showRate;
    const baseClosed = baseShowed * closeRate;
    const baseRevenue = baseClosed * avgDeal;

    // Uplifts
    // Booking lift: apply as a multiplier on booking rate, but cap at 90% booking rate so it doesn't go absurd.
    let bookingMultiplier = 1;
    if (enableSpeedToLead) bookingMultiplier *= speedLift;
    if (enableFollowUp) bookingMultiplier *= followLift;

    // In real life, both lifts won’t stack perfectly, so we softly dampen compounding
    // (keeps it believable while still showing upside).
    const dampener = 0.55; // 0.55 = moderate dampening
    const effectiveBookingMultiplier = 1 + (bookingMultiplier - 1) * dampener;

    const newBookingRate = clamp(bookingRate * effectiveBookingMultiplier, 0, 0.9);

    const newBooked = leads * newBookingRate;

    let newShowRate = showRate;
    let newCloseRate = closeRate;

    if (enablePreCall) {
      newShowRate = clamp(showRate * (1 + showLiftRel), 0, 0.98);
      newCloseRate = clamp(closeRate * (1 + closeLiftRel), 0, 0.95);
    }

    const newShowed = newBooked * newShowRate;
    const newClosed = newShowed * newCloseRate;
    const newRevenue = newClosed * avgDeal;

    const deltaBooked = newBooked - baseBooked;
    const deltaShowed = newShowed - baseShowed;
    const deltaClosed = newClosed - baseClosed;
    const deltaRevenue = newRevenue - baseRevenue;

    return {
      leads,
      base: { booked: baseBooked, showed: baseShowed, closed: baseClosed, revenue: baseRevenue },
      next: { booked: newBooked, showed: newShowed, closed: newClosed, revenue: newRevenue },
      delta: { booked: deltaBooked, showed: deltaShowed, closed: deltaClosed, revenue: deltaRevenue },
      rates: { bookingRate, showRate, closeRate, newBookingRate, newShowRate, newCloseRate },
    };
  }, [
    monthlyLeads,
    avgDeal,
    currentBookingRate,
    currentShowRate,
    currentCloseRate,
    enableSpeedToLead,
    enableFollowUp,
    enablePreCall,
    speedLift,
    followLift,
    showLiftRel,
    closeLiftRel,
  ]);

  const industryLabel = useMemo(() => {
    if (industry === "local") return "Local Service Business";
    if (industry === "sales") return "Sales Team / Call Center";
    if (industry === "other") return "Other / Mixed";
    return "";
  }, [industry]);

  const timeline = useMemo(() => {
    // Your described sequence (editable later)
    return [
      { t: "0:05", label: "SMS" },
      { t: "0:15–0:20", label: "AI Call" },
      { t: "+0:30", label: "Back-to-back retry (if no answer)" },
      { t: "+4:00", label: "SMS follow-up" },
      { t: "7:55 PM", label: "Evening call attempt" },
      { t: "Next day 8:15 AM", label: "Morning call attempt" },
      { t: "Next day 9:15 AM", label: "Text follow-up" },
      { t: "Days 2–7", label: "Timed touches to recover the lead" },
    ];
  }, []);

  const onContinue = () => {
    if (!industry) return;
    setRevealed(true);
    setTimeout(() => {
      const el = document.getElementById("reveal-start");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // You can wire this to your webhook later.
    // For now, we just show a confirmation state.
    setFormSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-700 text-white shadow-sm">
              <span className="text-sm font-bold">A</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">All In Digital</div>
              <div className="text-xs text-slate-500">Consultation Overview (No pricing on this page)</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#roi"
              className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 md:inline-block"
            >
              ROI Calculator
            </a>
            <a
              href="#system"
              className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 md:inline-block"
            >
              System Breakdown
            </a>
            <a
              href="#cta"
              className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800"
            >
              Request a Call
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 md:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Speed-to-Lead • Booking • Show-rate • Close-rate
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Turn missed leads into <span className="text-emerald-700">booked appointments</span> — automatically.
          </h1>

          <p className="mt-4 max-w-xl text-base text-slate-700">
            This page is what we reference during your consultation. It’s designed to make the process easy to understand:
            how leads are contacted, how appointments get booked, how no-shows drop, and how the sales process becomes
            consistent.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500">Speed-to-Lead</div>
              <div className="mt-1 text-sm font-semibold">SMS in seconds • Call in ~15–20s</div>
              <p className="mt-2 text-xs text-slate-600">
                We contact the lead fast, retry intelligently, and recover “no answer” leads with timed follow-up.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500">NEPQ Booking Agent</div>
              <div className="mt-1 text-sm font-semibold">Pain → Deeper Pain → Impact → Desired Outcome</div>
              <p className="mt-2 text-xs text-slate-600">
                If they answer, an AI agent runs structured discovery and books directly onto your calendar.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold">Choose your path</div>
            <p className="mt-1 text-sm text-slate-600">
              Pick the closest match so we show examples in your language.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setIndustry("local")}
                className={[
                  "rounded-2xl border p-4 text-left shadow-sm transition",
                  industry === "local"
                    ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="text-sm font-semibold">Local Services</div>
                <div className="mt-1 text-xs text-slate-600">Home services, trades, clinics, local operators</div>
              </button>

              <button
                type="button"
                onClick={() => setIndustry("sales")}
                className={[
                  "rounded-2xl border p-4 text-left shadow-sm transition",
                  industry === "sales"
                    ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="text-sm font-semibold">Sales Teams</div>
                <div className="mt-1 text-xs text-slate-600">Inbound SDR, inside sales, appointment setters</div>
              </button>

              <button
                type="button"
                onClick={() => setIndustry("other")}
                className={[
                  "rounded-2xl border p-4 text-left shadow-sm transition",
                  industry === "other"
                    ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="text-sm font-semibold">Other</div>
                <div className="mt-1 text-xs text-slate-600">Mixed flows, multiple offers, custom scenarios</div>
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                Selected:{" "}
                <span className="font-semibold text-slate-900">{industry ? industryLabel : "—"}</span>
              </div>
              <button
                type="button"
                onClick={onContinue}
                disabled={!industry}
                className={[
                  "rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
                  industry ? "bg-emerald-700 text-white hover:bg-emerald-800" : "bg-slate-200 text-slate-500",
                ].join(" ")}
              >
                Continue
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Request a Call form */}
        <div id="cta" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Request a Call</div>
              <p className="mt-1 text-sm text-slate-600">
                When this is wired to your automation, a new submission triggers fast SMS + rapid call attempts.
              </p>
            </div>
            <div className="hidden rounded-2xl bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 md:inline-flex">
              Fast response
            </div>
          </div>

          {!formSubmitted ? (
            <form onSubmit={onSubmit} className="mt-5 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-700">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Company</label>
                  <input
                    value={form.company}
                    onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Company"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">What are you trying to fix?</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  className="mt-1 min-h-[92px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Missed calls, slow response, no-shows, weak close rates, etc."
                />
              </div>

              <button
                type="submit"
                className="mt-1 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
              >
                Submit
              </button>

              <p className="text-xs text-slate-500">
                This page intentionally includes no pricing. We focus on fit + outcomes first.
              </p>
            </form>
          ) : (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-sm font-semibold text-emerald-900">Request received</div>
              <p className="mt-1 text-sm text-emerald-800">
                You’re all set. (When wired up, this is where your Speed-to-Lead sequence kicks off automatically.)
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Reveal start */}
      {revealed && (
        <>
          {/* Benchmarks */}
          <section id="reveal-start" className="mx-auto max-w-6xl px-4 pb-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Expected Uplift <span className="text-slate-500">(Benchmarks)</span>
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    These are “up to” benchmarks and depend on your baseline. If you’re already fast + consistent, lift is smaller.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Designed for clarity, not hype
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-xs font-medium text-slate-500">Speed-to-Lead</div>
                  <div className="mt-2 text-3xl font-semibold text-emerald-700">Up to 8×</div>
                  <p className="mt-2 text-sm text-slate-700">
                    More booked appointments when leads hear back in minutes instead of hours.
                  </p>
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                    Best for businesses currently responding slowly or inconsistently.
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-xs font-medium text-slate-500">Follow-Up System</div>
                  <div className="mt-2 text-3xl font-semibold text-emerald-700">Up to 15×</div>
                  <p className="mt-2 text-sm text-slate-700">
                    More bookings when “no answer” leads get a structured cadence instead of one attempt.
                  </p>
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                    Best for teams with a leaky pipeline and low touch volume.
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-xs font-medium text-slate-500">Pre-Call Prep</div>
                  <div className="mt-2 text-3xl font-semibold text-emerald-700">Up to +40%</div>
                  <p className="mt-2 text-sm text-slate-700">
                    Higher show rates and stronger close rates when the call is pre-framed with a short training video + reminders.
                  </p>
                  <ul className="mt-3 space-y-1 text-xs text-slate-600">
                    <li>• Up to +20–40% show-rate lift</li>
                    <li>• Up to +20–40% close-rate lift</li>
                  </ul>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                * Benchmarks are not guarantees. Outcomes depend on lead source/quality, offer strength, baseline response time,
                and consistency of execution.
              </p>
            </div>
          </section>

          {/* System Breakdown */}
          <section id="system" className="mx-auto max-w-6xl px-4 py-10">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold tracking-tight">What happens when a lead comes in</h3>
                <p className="mt-2 text-sm text-slate-600">
                  The goal is simple: contact fast, retry intelligently, and recover leads that would’ve been lost.
                </p>

                <div className="mt-5 space-y-3">
                  {timeline.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-xl bg-emerald-700 text-xs font-semibold text-white">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-semibold">{step.label}</div>
                          <div className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{step.t}</div>
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          {step.label.toLowerCase().includes("call")
                            ? "If they answer, discovery begins and we attempt to book immediately."
                            : "Keeps the lead warm and increases pick-up rate across attempts."}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-sm font-semibold text-emerald-900">If they answer</div>
                  <p className="mt-1 text-sm text-emerald-800">
                    They get a structured conversation (NEPQ-style discovery) that leads directly into booking.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold tracking-tight">The booking call (NEPQ structure)</h3>
                <p className="mt-2 text-sm text-slate-600">
                  The agent’s job is not to “pitch.” It’s to understand and qualify using consistent discovery.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { k: "Pain Point", d: "What they’re dealing with on the surface right now." },
                    { k: "Deeper Pain", d: "Why it matters and what it’s costing them." },
                    { k: "Impact", d: "How it affects revenue, time, team, stress, outcomes." },
                    { k: "Desired Outcome", d: "What ‘fixed’ looks like and why now." },
                  ].map((x) => (
                    <div key={x.k} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-sm font-semibold">{x.k}</div>
                      <div className="mt-1 text-xs text-slate-600">{x.d}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold">Result</div>
                  <p className="mt-1 text-sm text-slate-700">
                    By the time the appointment is booked, the consult is already focused. Less wandering. Less “what do you do again?”
                    More clarity, faster decisions.
                  </p>
                </div>

                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="text-sm font-semibold text-amber-900">Optional add-on (for the right situations)</div>
                  <p className="mt-1 text-sm text-amber-800">
                    If someone just wants to focus on fulfillment, you can also have sales handled end-to-end — so their calendar fills with
                    jobs and they simply execute.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pre-call video section */}
          <section className="mx-auto max-w-6xl px-4 pb-10">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">Pre-call training video (outline)</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    This is designed to protect the appointment, increase show rate, and pre-frame the conversation so the consult moves fast.
                  </p>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                  Works even when you have zero testimonials yet
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-sm font-semibold">The structure (simple, repeatable)</div>
                  <ol className="mt-3 space-y-2 text-sm text-slate-700">
                    <li>
                      <span className="font-semibold">1)</span> Quick intro and who this is for
                    </li>
                    <li>
                      <span className="font-semibold">2)</span> Re-frame no-show / late reschedule rules (protect time)
                    </li>
                    <li>
                      <span className="font-semibold">3)</span> “Why we built this” (what breaks without a system)
                    </li>
                    <li>
                      <span className="font-semibold">4)</span> Credibility segment (your best project / proof / story)
                    </li>
                    <li>
                      <span className="font-semibold">5)</span> Two routes: DIY vs guided implementation (value build)
                    </li>
                    <li>
                      <span className="font-semibold">6)</span> More credibility (reviews/case studies as you get them)
                    </li>
                    <li>
                      <span className="font-semibold">7)</span> Outro: protect the time, show up prepared
                    </li>
                  </ol>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-sm font-semibold">Customization (high-end experience)</div>
                  <p className="mt-2 text-sm text-slate-700">
                    When the booking call captures the lead’s own words (pain, deeper pain, impact, outcome), you can use those
                    variables to generate a short customized video before the consult — making the lead feel understood immediately.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      { t: "Basic", d: "3–5 min core prep", b: "Best for volume" },
                      { t: "Core", d: "5–8 min deeper framing", b: "Best for most" },
                      { t: "Epic", d: "10–15 min strong customization", b: "High ticket" },
                    ].map((x) => (
                      <div key={x.t} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-sm font-semibold">{x.t}</div>
                        <div className="mt-1 text-xs text-slate-600">{x.d}</div>
                        <div className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                          {x.b}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold">Reminder logic</div>
                    <p className="mt-1 text-sm text-slate-700">
                      A timed reminder before the consult nudges them to watch the video — and if tracking is enabled, you can gently
                      prompt non-watchers to view it so the appointment runs faster and smoother.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Note: The exact no-show/late reschedule rules are configurable per business and should align with your policies and local regulations.
              </p>
            </div>
          </section>

          {/* ROI Calculator */}
          <section id="roi" className="mx-auto max-w-6xl px-4 pb-12">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">ROI Calculator</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Quick way to estimate upside from faster response, structured follow-up, and pre-call prep.
                  </p>
                </div>
                <div className="text-xs text-slate-600">
                  Using <span className="font-semibold">{industryLabel || "your business"}</span> assumptions
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {/* Inputs */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-sm font-semibold">Inputs</div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-slate-700">Monthly leads</label>
                      <input
                        type="number"
                        min={0}
                        value={monthlyLeads}
                        onChange={(e) => setMonthlyLeads(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700">Average deal value</label>
                      <input
                        type="number"
                        min={0}
                        value={avgDeal}
                        onChange={(e) => setAvgDeal(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700">Current booking rate</label>
                      <input
                        type="number"
                        step={0.01}
                        min={0}
                        max={1}
                        value={currentBookingRate}
                        onChange={(e) => setCurrentBookingRate(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                      />
                      <div className="mt-1 text-xs text-slate-500">Example: 0.12 = 12%</div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700">Current show rate</label>
                      <input
                        type="number"
                        step={0.01}
                        min={0}
                        max={1}
                        value={currentShowRate}
                        onChange={(e) => setCurrentShowRate(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                      />
                      <div className="mt-1 text-xs text-slate-500">Example: 0.55 = 55%</div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700">Current close rate</label>
                      <input
                        type="number"
                        step={0.01}
                        min={0}
                        max={1}
                        value={currentCloseRate}
                        onChange={(e) => setCurrentCloseRate(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                      />
                      <div className="mt-1 text-xs text-slate-500">Example: 0.25 = 25%</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-medium text-slate-600">Tip</div>
                      <div className="mt-1 text-sm text-slate-800">
                        If you’re not sure, use: booking 10–15%, show 50–70%, close 15–30%.
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold">Enable improvements</div>
                    <div className="mt-3 space-y-3">
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={enableSpeedToLead}
                          onChange={(e) => setEnableSpeedToLead(e.target.checked)}
                          className="mt-1 h-4 w-4 accent-emerald-700"
                        />
                        <div>
                          <div className="text-sm font-medium">Speed-to-Lead</div>
                          <div className="text-xs text-slate-600">SMS in seconds, call in ~15–20s, fast retries</div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={enableFollowUp}
                          onChange={(e) => setEnableFollowUp(e.target.checked)}
                          className="mt-1 h-4 w-4 accent-emerald-700"
                        />
                        <div>
                          <div className="text-sm font-medium">Follow-up system</div>
                          <div className="text-xs text-slate-600">Timed touches (same day + next day + ongoing)</div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={enablePreCall}
                          onChange={(e) => setEnablePreCall(e.target.checked)}
                          className="mt-1 h-4 w-4 accent-emerald-700"
                        />
                        <div>
                          <div className="text-sm font-medium">Pre-call prep video + reminders</div>
                          <div className="text-xs text-slate-600">Higher show rate + stronger close rate</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-medium text-slate-600">Speed-to-Lead lift</div>
                      <select
                        value={speedPreset}
                        onChange={(e) => setSpeedPreset(e.target.value as LiftPreset)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                      >
                        <option value="low">Conservative (2×)</option>
                        <option value="typical">Typical (4×)</option>
                        <option value="high">High / “Up to” (8×)</option>
                      </select>
                      <div className="mt-2 text-xs text-slate-500">Used only if Speed-to-Lead is enabled.</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-medium text-slate-600">Follow-up lift</div>
                      <select
                        value={followPreset}
                        onChange={(e) => setFollowPreset(e.target.value as LiftPreset)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                      >
                        <option value="low">Conservative (3×)</option>
                        <option value="typical">Typical (7×)</option>
                        <option value="high">High / “Up to” (15×)</option>
                      </select>
                      <div className="mt-2 text-xs text-slate-500">Used only if Follow-up is enabled.</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-medium text-slate-600">Show-rate lift</div>
                      <select
                        value={showPreset}
                        onChange={(e) => setShowPreset(e.target.value as LiftPreset)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                      >
                        <option value="low">Conservative (+10%)</option>
                        <option value="typical">Typical (+25%)</option>
                        <option value="high">High / “Up to” (+40%)</option>
                      </select>
                      <div className="mt-2 text-xs text-slate-500">Applied as a relative lift if Pre-call is enabled.</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-medium text-slate-600">Close-rate lift</div>
                      <select
                        value={closePreset}
                        onChange={(e) => setClosePreset(e.target.value as LiftPreset)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                      >
                        <option value="low">Conservative (+10%)</option>
                        <option value="typical">Typical (+25%)</option>
                        <option value="high">High / “Up to” (+40%)</option>
                      </select>
                      <div className="mt-2 text-xs text-slate-500">Applied as a relative lift if Pre-call is enabled.</div>
                    </div>
                  </div>
                </div>

                {/* Outputs */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-sm font-semibold">Results</div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs font-medium text-slate-600">Baseline monthly revenue</div>
                      <div className="mt-1 text-2xl font-semibold">{money(roi.base.revenue)}</div>
                      <div className="mt-2 text-xs text-slate-600">
                        {numberWithCommas(roi.base.closed)} closes / mo
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="text-xs font-medium text-emerald-900">Projected monthly revenue</div>
                      <div className="mt-1 text-2xl font-semibold text-emerald-900">{money(roi.next.revenue)}</div>
                      <div className="mt-2 text-xs text-emerald-800">
                        {numberWithCommas(roi.next.closed)} closes / mo
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-medium text-slate-600">Additional bookings</div>
                      <div className="mt-1 text-2xl font-semibold">+{numberWithCommas(roi.delta.booked)}</div>
                      <div className="mt-2 text-xs text-slate-600">
                        New booking rate: <span className="font-semibold">{percent(roi.rates.newBookingRate)}</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-medium text-slate-600">Additional closes</div>
                      <div className="mt-1 text-2xl font-semibold">+{numberWithCommas(roi.delta.closed)}</div>
                      <div className="mt-2 text-xs text-slate-600">
                        New show: <span className="font-semibold">{percent(roi.rates.newShowRate)}</span> • New close:{" "}
                        <span className="font-semibold">{percent(roi.rates.newCloseRate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="text-xs font-medium text-amber-900">Estimated monthly upside</div>
                    <div className="mt-1 text-3xl font-semibold text-amber-900">{money(roi.delta.revenue)}</div>
                    <div className="mt-2 text-xs text-amber-800">
                      Annualized: <span className="font-semibold">{money(roi.delta.revenue * 12)}</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold">Why this stays realistic</div>
                    <p className="mt-1 text-sm text-slate-700">
                      Booking multipliers are dampened because speed-to-lead and follow-up overlap in practice. This keeps projections credible
                      while still reflecting upside.
                    </p>
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    Note: This calculator is a directional estimate. Real outcomes depend on lead quality, offer strength, and execution.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mx-auto max-w-6xl px-4 pb-14">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold tracking-tight">FAQ</h3>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  {
                    q: "Do I need a CRM?",
                    a: "No — but it helps. The system can work with whatever you use today, and the follow-up logic can be tied to your pipeline stages.",
                  },
                  {
                    q: "What if my leads come from multiple sources?",
                    a: "That’s normal. We normalize the intake so every lead triggers the same Speed-to-Lead sequence and gets tracked consistently.",
                  },
                  {
                    q: "Is this just an AI chatbot?",
                    a: "No. It’s a sales operating system: speed-to-lead + discovery + booking + pre-call prep + follow-up — enforced consistently.",
                  },
                  {
                    q: "Will this work for my industry?",
                    a: "If you have leads and appointments matter, yes. The wording, routing, and qualification criteria get tailored to your offer and constraints.",
                  },
                ].map((x) => (
                  <div key={x.q} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="text-sm font-semibold">{x.q}</div>
                    <div className="mt-2 text-sm text-slate-700">{x.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Footer CTA */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-lg font-semibold">Want to see exactly how this plugs into your business?</div>
                <div className="mt-1 text-sm text-slate-600">
                  The consult is about fit, leaks, and the simplest next step — not pressure.
                </div>
              </div>
              <a
                href="#cta"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
              >
                Request a Call
              </a>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              This page intentionally includes no pricing. We focus on outcomes, constraints, and fit first.
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} All In Digital • Consultation Overview
          </div>
        </div>
      </footer>
    </main>
  );
}
```0