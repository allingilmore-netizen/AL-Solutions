"use client";

import { useMemo, useState } from "react";

type IndustryKey =
  | "sales_team"
  | "local_service"
  | "home_improvement"
  | "medspa"
  | "b2b"
  | "other"
  | null;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatInt(n: number) {
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString();
}

function formatMoney(n: number) {
  if (!Number.isFinite(n)) return "$0";
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Page() {
  const [industry, setIndustry] = useState<IndustryKey>(null);

  // Lead form (placeholder)
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadNotes, setLeadNotes] = useState("");

  // ROI inputs
  const [monthlyLeads, setMonthlyLeads] = useState(40);
  const [bookRate, setBookRate] = useState(10); // % of leads → booked appts
  const [showRate, setShowRate] = useState(30); // %
  const [closeRate, setCloseRate] = useState(14); // %
  const [avgDealValue, setAvgDealValue] = useState(3500);

  // Scenario controls (models “up to”)
  const [bookingLift, setBookingLift] = useState<"off" | "up_to_800" | "up_to_1500">("up_to_800");
  const [showUpliftPts, setShowUpliftPts] = useState(20); // +percentage points (0–60)
  const [closeUpliftPts, setCloseUpliftPts] = useState(20); // +percentage points (0–40)

  const industryLabel = useMemo(() => {
    switch (industry) {
      case "sales_team":
        return "Sales Teams";
      case "local_service":
        return "Local Service Businesses";
      case "home_improvement":
        return "Home Improvement";
      case "medspa":
        return "MedSpas & Aesthetics";
      case "b2b":
        return "B2B Services";
      case "other":
        return "Other";
      default:
        return "";
    }
  }, [industry]);

  const computed = useMemo(() => {
    const leads = clamp(monthlyLeads, 0, 1000000);

    const baseBooked = leads * clamp(bookRate, 0, 100) / 100;
    const baseShowed = baseBooked * clamp(showRate, 0, 100) / 100;
    const baseClosed = baseShowed * clamp(closeRate, 0, 100) / 100;
    const baseRevenue = baseClosed * clamp(avgDealValue, 0, 100000000);

    // Matches your examples: 2 → 16 is “up to 8x total”
    const multiplierTotal = bookingLift === "off" ? 1 : bookingLift === "up_to_800" ? 8 : 15;

    const projectedBooked = baseBooked * multiplierTotal;

    const newShowRate = clamp(clamp(showRate, 0, 100) + clamp(showUpliftPts, 0, 60), 0, 100);
    const newCloseRate = clamp(clamp(closeRate, 0, 100) + clamp(closeUpliftPts, 0, 40), 0, 100);

    const projectedShowed = projectedBooked * newShowRate / 100;
    const projectedClosed = projectedShowed * newCloseRate / 100;
    const projectedRevenue = projectedClosed * clamp(avgDealValue, 0, 100000000);

    return {
      baseBooked,
      baseShowed,
      baseClosed,
      baseRevenue,
      projectedBooked,
      projectedShowed,
      projectedClosed,
      projectedRevenue,
      liftRevenue: projectedRevenue - baseRevenue,
      multiplierTotal,
      newShowRate,
      newCloseRate,
    };
  }, [monthlyLeads, bookRate, showRate, closeRate, avgDealValue, bookingLift, showUpliftPts, closeUpliftPts]);

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-yellow-400/10 blur-3xl" />
      </div>

      {/* Top nav */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1220]/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <div className="font-extrabold tracking-tight">All In Digital</div>
            <div className="hidden text-sm text-white/60 md:block">
              Speed-to-Lead • Booking • Show Rate • Predictable Sales System
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavBtn onClick={() => scrollToId("how")} label="How it works" />
            <NavBtn onClick={() => scrollToId("roi")} label="ROI" />
            <button
              onClick={() => scrollToId("start")}
              className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
            >
              Request a demo
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pb-6 pt-10 md:pt-14">
        <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
          <Card>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-emerald-500/10 px-3 py-2 text-xs font-extrabold text-white/90">
              <span className="h-2 w-2 rounded-full bg-yellow-300" />
              Built to stop leads from slipping through the cracks
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl">
              Turn missed calls + slow follow-up into{" "}
              <span className="text-emerald-300">more booked appointments</span>, higher show rates,
              and a predictable pipeline.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75">
              This page shows the system: <b>Speed-to-Lead</b>, a <b>structured booking call</b>,
              and a <b>pre-call training video</b> that increases show + close rates — plus optional
              <b> done-for-you sales + ops</b> so you can stay focused on fulfillment.
            </p>

            {/* Stat tiles */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <StatTile
                title="Speed-to-Lead (first 5 minutes)"
                value="Up to 800%"
                sub="Increase in booked appointments when you respond in seconds/minutes instead of hours/days."
                accent="emerald"
              />
              <StatTile
                title="Follow-up sequence (same day + day 1/2)"
                value="Up to 1500%"
                sub="Increase in booked appointments when follow-up is consistent instead of “one call and done.”"
                accent="gold"
              />
              <StatTile
                title="No-show anchoring + pre-call training"
                value="+20 to +60 pts"
                sub="Lift in show ratio (example: 30% → 50–90%) when framed + reinforced properly."
                accent="emerald"
              />
              <StatTile
                title="Pre-call video + consistent sales structure"
                value="+20 to +40 pts"
                sub="Lift in close rate + easier scaling because the process becomes consistent."
                accent="emerald"
              />
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => scrollToId("choose")}
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-extrabold shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
              >
                Choose your business type
              </button>
              <button
                onClick={() => scrollToId("roi")}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold hover:bg-white/10"
              >
                See ROI math
              </button>
              <button
                onClick={() => scrollToId("start")}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold hover:bg-white/10"
              >
                Request a demo
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-white/55">
              “Up to” results depend on your current response times, lead quality, offer, and consistency. Biggest gains happen when you’re currently slow or inconsistent.
            </p>
          </Card>

          {/* Right rail */}
          <Card>
            <h3 className="text-lg font-extrabold tracking-tight">What you get (high level)</h3>
            <div className="mt-3 grid gap-3">
              <MiniCard title="Speed-to-Lead Engine" desc="SMS in ~5 seconds, call in ~15–20 seconds, back-to-back attempts, and timed follow-ups." />
              <MiniCard title="Booking that qualifies + books" desc="A structured conversation that captures pain → deeper pain → impact → desired outcome, then books." />
              <MiniCard title="Pre-call training video" desc="Reinforces value + expectations, improving show rate and readiness." />
              <MiniCard title="Optional: done-for-you sales" desc="If you want to focus on fulfillment, we can handle follow-up, selling, and scheduling." />
              <MiniCard title="Optional: ops support" desc="Quote/bid drafting, inbox handling, reminders, reactivation, and B2B outreach with human alerts." />
            </div>

            <div className="mt-4 border-t border-white/10 pt-4 text-sm text-white/70">
              <b className="text-white">Best fit:</b> businesses with leads coming in already — but response times,
              follow-up, appointment quality, or show rates are inconsistent.
            </div>
          </Card>
        </div>
      </section>

      {/* Industry selector */}
      <section id="choose" className="mx-auto max-w-6xl px-4 py-6">
        <Card>
          <h2 className="text-2xl font-black tracking-tight">Choose your business type</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Pick the closest match. We’ll tailor examples and the “next steps” section to your world.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SelectCard title="Sales Teams" desc="Inbound + outbound, appointment setting, pipeline." active={industry === "sales_team"} onClick={() => { setIndustry("sales_team"); setTimeout(() => scrollToId("how"), 80); }} />
            <SelectCard title="Local Service" desc="Calls, forms, missed calls, scheduling, dispatch." active={industry === "local_service"} onClick={() => { setIndustry("local_service"); setTimeout(() => scrollToId("how"), 80); }} />
            <SelectCard title="Home Improvement" desc="Estimates, field visits, no-shows, quoting." active={industry === "home_improvement"} onClick={() => { setIndustry("home_improvement"); setTimeout(() => scrollToId("how"), 80); }} />
            <SelectCard title="MedSpa & Aesthetics" desc="Inquiries, consult bookings, follow-up, upsells." active={industry === "medspa"} onClick={() => { setIndustry("medspa"); setTimeout(() => scrollToId("how"), 80); }} />
            <SelectCard title="B2B Services" desc="Email + calls, lead routing, qualification." active={industry === "b2b"} onClick={() => { setIndustry("b2b"); setTimeout(() => scrollToId("how"), 80); }} />
            <SelectCard title="Other" desc="We’ll map it to your exact flow." active={industry === "other"} onClick={() => { setIndustry("other"); setTimeout(() => scrollToId("how"), 80); }} />
          </div>
        </Card>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-6">
        <Card>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight">How the system works</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {industry ? (
                  <>
                    Tailored for <b className="text-white">{industryLabel}</b>. Same structure across inbound calls, form fills, missed calls, and follow-up.
                  </>
                ) : (
                  <>Choose a business type above to personalize this section — or read it as a universal blueprint.</>
                )}
              </p>
            </div>
            <button
              onClick={() => scrollToId("start")}
              className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-extrabold shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
            >
              Request a demo
            </button>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            <Step
              n="1"
              title="Speed-to-Lead (first 5 minutes)"
              badge="Up to 800% increase in booked appointments"
              bullets={[
                "New lead from form / missed call / inbound inquiry.",
                "SMS in ~5 seconds.",
                "Call begins in ~15–20 seconds.",
                "Back-to-back attempts if no answer, then timed follow-ups.",
              ]}
            />
            <Step
              n="2"
              title="Follow-up sequence (same day + day 1/2)"
              badge="Up to 1500% increase in booked appointments"
              bullets={[
                "If they don’t answer, they’re not “lost” — they’re busy.",
                "Additional call/SMS attempts at strategic times (evening + next morning).",
                "Consistent and automatic — no guessing, no forgetting.",
                "Stops when you connect, book, or disqualify.",
              ]}
            />
            <Step
              n="3"
              title="Booking call: qualify + capture 4 key variables"
              badge="Higher-quality appointments"
              bullets={[
                "Structured conversation (not random).",
                "Captures: pain → deeper pain → impact → desired outcome.",
                "Books on your calendar (or your team’s calendar).",
                "Routes to a human at the right time when needed.",
              ]}
            />
            <Step
              n="4"
              title="No-show anchoring + pre-call training video"
              badge="Show ratio lift: up to +20 to +60 percentage points"
              bullets={[
                "No-show / late reschedule expectations anchored in the booking flow.",
                "Reinforced via pre-call training + reminders.",
                "Prospects show up more prepared and committed.",
                "Example: 30% show rate → 50–90% (depending on offer + framing).",
              ]}
            />
            <Step
              n="5"
              title="Pre-call video increases close rate + makes selling consistent"
              badge="Sales conversion lift: up to +20 to +40 percentage points"
              bullets={[
                "Sets expectations and frames value before the call/visit.",
                "Less variance between reps — easier scaling.",
                "Average performance moves closer to top performance.",
                "Example: 14% close rate → 34–54% (depending on offer + lead quality).",
              ]}
            />
            <Step
              n="6"
              title="Optional: done-for-you sales + ops"
              badge="You focus on fulfillment"
              bullets={[
                "We can handle follow-up, selling, scheduling, and handoff.",
                "Jobs land on your calendar with detailed notes and next steps.",
                "Optional: quote/bid drafting so you stop losing hours writing estimates.",
                "Optional: inbox handling + B2B outreach with human alerts when needed.",
              ]}
            />
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            <CardInner title="Pre-call video blueprint (works before testimonials)">
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-white/70">
                <li>Quick intro + who this is for</li>
                <li>No-show / reschedule framing (protects both sides)</li>
                <li>Why you started / what you believe</li>
                <li>Credibility (projects, proof, “best work”, early wins)</li>
                <li>DIY vs done-with-you framing (teach the real cost of DIY)</li>
                <li>Reviews/testimonials (expand as you collect them)</li>
                <li>Outro + expectations + reminders</li>
              </ul>
            </CardInner>

            <CardInner title="Optional: personalization layer">
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-white/70">
                <li>Use the prospect’s own words from the booking call</li>
                <li>Reinforce pain → impact → desired outcome</li>
                <li>Reminder before appointment to watch it again</li>
                <li>If tracking is enabled, nudge if they haven’t watched yet</li>
                <li>Result: more prepared prospects, shorter calls, higher trust</li>
              </ul>
            </CardInner>
          </div>

          <p className="mt-4 text-xs text-white/55">
            No tools are mentioned here on purpose. This is an outcome-driven blueprint you can implement inside your stack.
          </p>
        </Card>
      </section>

      {/* ROI */}
      <section id="roi" className="mx-auto max-w-6xl px-4 py-6">
        <Card>
          <h2 className="text-3xl font-black tracking-tight">ROI Calculator</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Plug in your numbers. This models potential upside when Speed-to-Lead + follow-up + show-rate protection + pre-call training are applied.
          </p>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-extrabold">Baseline inputs</div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <NumField label="Monthly leads" value={monthlyLeads} onChange={setMonthlyLeads} />
                <NumField label="Avg deal value ($)" value={avgDealValue} onChange={setAvgDealValue} />
                <NumField label="Lead → booked appt rate (%)" value={bookRate} onChange={setBookRate} />
                <NumField label="Show rate (%)" value={showRate} onChange={setShowRate} />
                <NumField label="Close rate (of shows) (%)" value={closeRate} onChange={setCloseRate} />
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="text-xs font-extrabold text-white/70">Scenario controls</div>

                <div className="mt-3">
                  <div className="text-sm font-extrabold">Booking lift</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Pill active={bookingLift === "off"} onClick={() => setBookingLift("off")}>Off</Pill>
                    <Pill active={bookingLift === "up_to_800"} onClick={() => setBookingLift("up_to_800")}>Up to 800% (≈ up to 8x total)</Pill>
                    <Pill active={bookingLift === "up_to_1500"} onClick={() => setBookingLift("up_to_1500")}>Up to 1500% (≈ up to 15x total)</Pill>
                  </div>
                  <p className="mt-2 text-xs text-white/55">
                    Use “up to” when you’re currently slow/inconsistent and become fast + consistent.
                  </p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#0B1220]/40 p-3">
                    <div className="text-sm font-extrabold">Show-rate uplift (+ pts)</div>
                    <input
                      type="range"
                      min={0}
                      max={60}
                      value={showUpliftPts}
                      onChange={(e) => setShowUpliftPts(parseInt(e.target.value || "0", 10))}
                      className="mt-3 w-full"
                    />
                    <div className="mt-1 text-xs text-white/70">
                      +{showUpliftPts} pts → new show rate ≈ <b className="text-white">{computed.newShowRate.toFixed(0)}%</b>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0B1220]/40 p-3">
                    <div className="text-sm font-extrabold">Close-rate uplift (+ pts)</div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={closeUpliftPts}
                      onChange={(e) => setCloseUpliftPts(parseInt(e.target.value || "0", 10))}
                      className="mt-3 w-full"
                    />
                    <div className="mt-1 text-xs text-white/70">
                      +{closeUpliftPts} pts → new close rate ≈ <b className="text-white">{computed.newCloseRate.toFixed(0)}%</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-extrabold">Projected impact</div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Kpi label="Baseline booked appts" value={formatInt(computed.baseBooked)} />
                <Kpi label="Projected booked appts" value={formatInt(computed.projectedBooked)} highlight />
                <Kpi label="Baseline shows" value={formatInt(computed.baseShowed)} />
                <Kpi label="Projected shows" value={formatInt(computed.projectedShowed)} highlight />
                <Kpi label="Baseline closes" value={formatInt(computed.baseClosed)} />
                <Kpi label="Projected closes" value={formatInt(computed.projectedClosed)} highlight />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Kpi label="Baseline revenue" value={formatMoney(computed.baseRevenue)} />
                <Kpi label="Projected revenue" value={formatMoney(computed.projectedRevenue)} highlight />
              </div>

              <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                <div className="text-sm font-extrabold text-white">Potential monthly lift</div>
                <div className="mt-1 text-3xl font-black text-emerald-300">{formatMoney(computed.liftRevenue)}</div>
                <p className="mt-2 text-xs text-white/60">
                  This is “math on your inputs,” not a promise. Results depend on lead quality, offer, and consistent execution.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Form */}
      <section id="start" className="mx-auto max-w-6xl px-4 pb-14 pt-6">
        <Card>
          <h2 className="text-3xl font-black tracking-tight">Request a demo</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Submit the form and we’ll map your flow (inbound calls, form leads, missed calls, follow-up, booking, and pre-call training).
          </p>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-extrabold">Your info</div>
              <div className="mt-4 grid gap-3">
                <TextField label="Name" value={leadName} onChange={setLeadName} placeholder="Your name" />
                <TextField label="Phone" value={leadPhone} onChange={setLeadPhone} placeholder="(555) 555-5555" />
                <TextField label="Email" value={leadEmail} onChange={setLeadEmail} placeholder="you@company.com" />
                <TextArea
                  label="What are you selling + where do leads come from?"
                  value={leadNotes}
                  onChange={setLeadNotes}
                  placeholder="Example: inbound calls + form leads from Google Ads. Biggest issue is slow follow-up and no-shows."
                />
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => alert("Submitted (placeholder). Wire to webhook later.")}
                  className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-extrabold shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
                >
                  Submit
                </button>
                <button
                  onClick={() => scrollToId("choose")}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold hover:bg-white/10"
                >
                  Change business type
                </button>
              </div>

              <p className="mt-3 text-xs text-white/55">
                No pricing is shown here on purpose. This page is designed to build value and clarity without scaring anyone off.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-extrabold">What we’ll cover</div>
              <div className="mt-4 grid gap-3">
                <MiniCard title="Response time + answer rate" desc="Where leads are falling through the cracks." />
                <MiniCard title="Speed-to-Lead sequence" desc="Calls, texts, timing windows, and stop conditions." />
                <MiniCard title="Booking flow" desc="How we capture pain → deeper pain → impact → desired outcome, then book." />
                <MiniCard title="Show-rate protection" desc="No-show anchoring + pre-call training + reminders." />
                <MiniCard title="Optional done-for-you sales + ops" desc="Selling + quoting + inbox + outreach so you can focus on fulfillment." />
              </div>

              <p className="mt-4 text-xs text-white/55">
                If you’re a one-person shop, we can structure this so you mostly see: <b className="text-white">jobs scheduled + clear notes</b>, not admin work.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

/* ----------------- UI Components ----------------- */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-6">
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/5" />
      {children}
    </div>
  );
}

function CardInner({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0B1220]/40 p-4">
      <div className="text-sm font-extrabold">{title}</div>
      {children}
    </div>
  );
}

function NavBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-extrabold hover:bg-white/10 md:inline-flex"
    >
      {label}
    </button>
  );
}

function StatTile({
  title,
  value,
  sub,
  accent,
}: {
  title: string;
  value: string;
  sub: string;
  accent: "emerald" | "gold";
}) {
  const accentClass =
    accent === "gold"
      ? "bg-yellow-400/10 border-yellow-300/20 text-yellow-200"
      : "bg-emerald-500/10 border-emerald-400/20 text-emerald-200";

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0B1220]/35 p-4">
      <div className="text-sm font-extrabold text-white/85">{title}</div>
      <div className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xl font-black ${accentClass}`}>
        {value}
      </div>
      <div className="mt-2 text-sm leading-relaxed text-white/65">{sub}</div>
    </div>
  );
}

function MiniCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B1220]/40 p-4">
      <div className="text-sm font-extrabold">{title}</div>
      <div className="mt-1 text-sm leading-relaxed text-white/70">{desc}</div>
    </div>
  );
}

function SelectCard({
  title,
  desc,
  active,
  onClick,
}: {
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "text-left rounded-3xl border p-4 transition",
        active ? "border-emerald-400/40 bg-emerald-500/10" : "border-white/10 bg-white/5 hover:bg-white/10",
      ].join(" ")}
    >
      <div className="text-sm font-extrabold">{title}</div>
      <div className="mt-1 text-sm leading-relaxed text-white/70">{desc}</div>
    </button>
  );
}

function Step({
  n,
  title,
  badge,
  bullets,
}: {
  n: string;
  title: string;
  badge: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0B1220]/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-yellow-400/15 text-sm font-black text-yellow-200">
            {n}
          </div>
          <div>
            <div className="text-base font-black">{title}</div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {badge}
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/70">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-2 text-xs font-extrabold transition",
        active ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Kpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={["rounded-2xl border p-3", highlight ? "border-emerald-400/20 bg-emerald-500/10" : "border-white/10 bg-[#0B1220]/40"].join(" ")}>
      <div className="text-xs font-extrabold text-white/70">{label}</div>
      <div className={["mt-1 text-2xl font-black", highlight ? "text-emerald-200" : "text-white"].join(" ")}>{value}</div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="grid gap-2">
      <div className="text-xs font-extrabold text-white/70">{label}</div>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(parseFloat(e.target.value || "0"))}
        className="w-full rounded-xl border border-white/10 bg-[#0B1220]/50 px-3 py-2 text-sm font-extrabold text-white outline-none focus:border-emerald-400/40"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <div className="text-xs font-extrabold text-white/70">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#0B1220]/50 px-3 py-2 text-sm font-bold text-white placeholder:text-white/40 outline-none focus:border-emerald-400/40"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <div className="text-xs font-extrabold text-white/70">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="w-full resize-y rounded-xl border border-white/10 bg-[#0B1220]/50 px-3 py-2 text-sm font-bold text-white placeholder:text-white/40 outline-none focus:border-emerald-400/40"
      />
    </label>
  );
}