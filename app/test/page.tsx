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
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function LandingPage() {
  const [industry, setIndustry] = useState<IndustryKey>(null);

  // Lead form (placeholder)
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadNotes, setLeadNotes] = useState("");

  // ROI inputs
  const [monthlyLeads, setMonthlyLeads] = useState(40);
  const [bookRate, setBookRate] = useState(10); // % of leads that become booked appts
  const [showRate, setShowRate] = useState(30); // %
  const [closeRate, setCloseRate] = useState(14); // %
  const [avgDealValue, setAvgDealValue] = useState(3500);

  // Scenario controls (keeps your “up to” language, but lets them choose conservative/moderate/aggressive)
  const [speedToLeadMultiplier, setSpeedToLeadMultiplier] = useState<"off" | "up_to_800" | "up_to_1500">(
    "up_to_800"
  );
  const [showUpliftPts, setShowUpliftPts] = useState(20); // +percentage points (20–60)
  const [closeUpliftPts, setCloseUpliftPts] = useState(20); // +percentage points (20–40)

  const palette = {
    emerald: "#047857",
    gold: "#F4D03F",
    white: "#FFFFFF",
    charcoal: "#0F172A",
    slate: "#334155",
    border: "rgba(15, 23, 42, 0.12)",
    soft: "rgba(15, 23, 42, 0.06)",
  };

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

    // Interpret your phrasing in a way that matches your examples:
    // “Up to 800% more booked appointments” → we show “≈ up to 8x total” (your example 2 → 16).
    // “Up to 1500% more booked appointments” → we show “≈ up to 15x total”.
    const bookingMultiplierTotal =
      speedToLeadMultiplier === "off" ? 1 : speedToLeadMultiplier === "up_to_800" ? 8 : 15;

    const projectedBooked = baseBooked * bookingMultiplierTotal;

    const newShowRate = clamp((clamp(showRate, 0, 100) + clamp(showUpliftPts, 0, 60)), 0, 100);
    const newCloseRate = clamp((clamp(closeRate, 0, 100) + clamp(closeUpliftPts, 0, 40)), 0, 100);

    const projectedShowed = projectedBooked * newShowRate / 100;
    const projectedClosed = projectedShowed * newCloseRate / 100;
    const projectedRevenue = projectedClosed * clamp(avgDealValue, 0, 100000000);

    const liftRevenue = projectedRevenue - baseRevenue;

    return {
      baseBooked,
      baseShowed,
      baseClosed,
      baseRevenue,
      projectedBooked,
      projectedShowed,
      projectedClosed,
      projectedRevenue,
      liftRevenue,
      bookingMultiplierTotal,
      newShowRate,
      newCloseRate,
    };
  }, [
    monthlyLeads,
    bookRate,
    showRate,
    closeRate,
    avgDealValue,
    speedToLeadMultiplier,
    showUpliftPts,
    closeUpliftPts,
  ]);

  const commonCardStyle: React.CSSProperties = {
    border: `1px solid ${palette.border}`,
    borderRadius: 18,
    background: palette.white,
    boxShadow: `0 12px 28px ${palette.soft}`,
  };

  const pill: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 999,
    border: `1px solid ${palette.border}`,
    background: "rgba(4, 120, 87, 0.06)",
    color: palette.charcoal,
    fontWeight: 700,
    fontSize: 13,
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 34,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    color: palette.charcoal,
    margin: 0,
  };

  const sectionSub: React.CSSProperties = {
    color: palette.slate,
    fontSize: 16,
    lineHeight: 1.6,
    margin: "10px 0 0",
  };

  return (
    <div style={{ background: "#F8FAFC", color: palette.charcoal, minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(248,250,252,0.92)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${palette.border}` }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: 999, background: palette.emerald }} />
            <div style={{ fontWeight: 900, letterSpacing: "-0.02em" }}>All In Digital</div>
            <div style={{ fontSize: 12, color: palette.slate }}>Speed-to-Lead • Booking • Show Rate • Sales System</div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button
              onClick={() => scrollToId("how-it-works")}
              style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${palette.border}`, background: palette.white, cursor: "pointer", fontWeight: 800 }}
            >
              How it works
            </button>
            <button
              onClick={() => scrollToId("roi")}
              style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${palette.border}`, background: palette.white, cursor: "pointer", fontWeight: 800 }}
            >
              ROI Calculator
            </button>
            <button
              onClick={() => scrollToId("get-started")}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: `1px solid ${palette.emerald}`,
                background: palette.emerald,
                color: palette.white,
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              Request a demo
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "46px 18px 12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18, alignItems: "stretch" }}>
          <div style={{ ...commonCardStyle, padding: 26 }}>
            <div style={pill}>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: palette.gold }} />
              Built to stop leads from slipping through the cracks
            </div>

            <h1 style={{ margin: "14px 0 0", fontSize: 46, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
              Turn missed calls + slow follow-up into <span style={{ color: palette.emerald }}>more booked appointments</span>, higher show rates, and a predictable pipeline.
            </h1>

            <p style={{ margin: "14px 0 0", color: palette.slate, fontSize: 17, lineHeight: 1.65 }}>
              This page shows the exact system: <b>Speed-to-Lead</b>, a <b>booking call that qualifies + books</b>,
              a <b>pre-call training video</b> that increases show + close rates, and optional <b>done-for-you sales + ops</b>
              so you can focus on fulfillment.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 18 }}>
              <div style={{ ...commonCardStyle, padding: 16, background: "rgba(4,120,87,0.06)" }}>
                <div style={{ fontWeight: 900, fontSize: 14, color: palette.charcoal }}>Speed-to-Lead (first 5 minutes)</div>
                <div style={{ marginTop: 6, fontWeight: 950, fontSize: 26, color: palette.emerald }}>Up to 800%</div>
                <div style={{ marginTop: 2, color: palette.slate, fontSize: 13, lineHeight: 1.5 }}>
                  Increase in booked appointments when you respond in seconds/minutes instead of hours/days.
                </div>
              </div>

              <div style={{ ...commonCardStyle, padding: 16, background: "rgba(244,208,63,0.18)" }}>
                <div style={{ fontWeight: 900, fontSize: 14, color: palette.charcoal }}>Follow-up sequence (same day + day 1/2)</div>
                <div style={{ marginTop: 6, fontWeight: 950, fontSize: 26, color: palette.charcoal }}>Up to 1500%</div>
                <div style={{ marginTop: 2, color: palette.slate, fontSize: 13, lineHeight: 1.5 }}>
                  When you keep following up consistently (instead of “one call and done”).
                </div>
              </div>

              <div style={{ ...commonCardStyle, padding: 16 }}>
                <div style={{ fontWeight: 900, fontSize: 14, color: palette.charcoal }}>No-show anchoring + pre-call training</div>
                <div style={{ marginTop: 6, fontWeight: 950, fontSize: 26, color: palette.emerald }}>+20 to +60 pts</div>
                <div style={{ marginTop: 2, color: palette.slate, fontSize: 13, lineHeight: 1.5 }}>
                  Lift in show ratio (example: 30% → 50–90%) when framed properly and reinforced before the appointment.
                </div>
              </div>

              <div style={{ ...commonCardStyle, padding: 16 }}>
                <div style={{ fontWeight: 900, fontSize: 14, color: palette.charcoal }}>Pre-call video + consistent sales structure</div>
                <div style={{ marginTop: 6, fontWeight: 950, fontSize: 26, color: palette.emerald }}>+20 to +40 pts</div>
                <div style={{ marginTop: 2, color: palette.slate, fontSize: 13, lineHeight: 1.5 }}>
                  Lift in close rate + easier scaling because your process becomes consistent across reps (or even if it’s just you).
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => scrollToId("choose")}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1px solid ${palette.emerald}`,
                  background: palette.emerald,
                  color: palette.white,
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                Choose your business type
              </button>

              <button
                onClick={() => scrollToId("roi")}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1px solid ${palette.border}`,
                  background: palette.white,
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                See ROI math
              </button>

              <button
                onClick={() => scrollToId("get-started")}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1px solid ${palette.border}`,
                  background: palette.white,
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                Request a demo
              </button>
            </div>

            <div style={{ marginTop: 14, color: palette.slate, fontSize: 12, lineHeight: 1.5 }}>
              <b>Note:</b> “Up to” results depend on your current response times, lead quality, offer, and consistency. The biggest gains happen when you’re currently slow or inconsistent.
            </div>
          </div>

          {/* Right panel */}
          <div style={{ ...commonCardStyle, padding: 22 }}>
            <div style={{ fontWeight: 950, fontSize: 18, letterSpacing: "-0.01em" }}>What you get (high level)</div>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {[
                { title: "Speed-to-Lead Engine", desc: "SMS in ~5 seconds, call in ~15–20 seconds, back-to-back attempts, and timed follow-ups." },
                { title: "Booking Call that Qualifies", desc: "A structured conversation that captures pain → deeper pain → impact → desired outcome, then books." },
                { title: "Pre-Call Training Video", desc: "Reinforces value, expectations, and dramatically improves show + readiness." },
                { title: "Optional: Done-for-you Sales", desc: "If you just want to fulfill, we can handle follow-up, selling, and scheduling so jobs land on your calendar." },
                { title: "Optional: Quote + Ops Automation", desc: "Auto-generated quotes/bids, inbox handling, reminders, reactivation, and B2B outreach." },
              ].map((x) => (
                <div key={x.title} style={{ border: `1px solid ${palette.border}`, borderRadius: 14, padding: 14, background: "#FFFFFF" }}>
                  <div style={{ fontWeight: 900 }}>{x.title}</div>
                  <div style={{ marginTop: 4, color: palette.slate, fontSize: 13, lineHeight: 1.55 }}>{x.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, borderTop: `1px solid ${palette.border}`, paddingTop: 14 }}>
              <div style={{ fontWeight: 900 }}>Perfect for:</div>
              <div style={{ marginTop: 6, color: palette.slate, fontSize: 13, lineHeight: 1.55 }}>
                Businesses with leads coming in already (ads, referrals, inbound calls, forms) — but response times, follow-up, or appointment quality are inconsistent.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Industry selector */}
      <div id="choose" style={{ maxWidth: 1120, margin: "0 auto", padding: "22px 18px" }}>
        <div style={{ ...commonCardStyle, padding: 22 }}>
          <h2 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.02em" }}>Choose your business type</h2>
          <p style={{ margin: "8px 0 0", color: palette.slate, lineHeight: 1.6 }}>
            Pick the closest match. We’ll tailor the examples and the “next steps” section to your world.
          </p>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
            <SelectorCard
              title="Sales Teams"
              desc="Inbound + outbound, appointment setting, pipeline."
              active={industry === "sales_team"}
              onClick={() => {
                setIndustry("sales_team");
                setTimeout(() => scrollToId("how-it-works"), 80);
              }}
              palette={palette}
            />
            <SelectorCard
              title="Local Service"
              desc="Calls, forms, missed calls, scheduling, dispatch."
              active={industry === "local_service"}
              onClick={() => {
                setIndustry("local_service");
                setTimeout(() => scrollToId("how-it-works"), 80);
              }}
              palette={palette}
            />
            <SelectorCard
              title="Home Improvement"
              desc="Estimates, field visits, no-shows, quoting."
              active={industry === "home_improvement"}
              onClick={() => {
                setIndustry("home_improvement");
                setTimeout(() => scrollToId("how-it-works"), 80);
              }}
              palette={palette}
            />
            <SelectorCard
              title="MedSpa & Aesthetics"
              desc="Inquiries, consult bookings, follow-up, upsells."
              active={industry === "medspa"}
              onClick={() => {
                setIndustry("medspa");
                setTimeout(() => scrollToId("how-it-works"), 80);
              }}
              palette={palette}
            />
            <SelectorCard
              title="B2B Services"
              desc="Email + calls, lead routing, qualification."
              active={industry === "b2b"}
              onClick={() => {
                setIndustry("b2b");
                setTimeout(() => scrollToId("how-it-works"), 80);
              }}
              palette={palette}
            />
            <SelectorCard
              title="Other"
              desc="We’ll map it to your exact flow."
              active={industry === "other"}
              onClick={() => {
                setIndustry("other");
                setTimeout(() => scrollToId("how-it-works"), 80);
              }}
              palette={palette}
            />
          </div>
        </div>
      </div>

      {/* How it works */}
      <div id="how-it-works" style={{ maxWidth: 1120, margin: "0 auto", padding: "10px 18px 22px" }}>
        <div style={{ ...commonCardStyle, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={sectionTitle}>How the system works</h2>
              <p style={sectionSub}>
                {industry ? (
                  <>
                    Tailored for <b>{industryLabel}</b>. This is the same structure we implement across inbound calls, form fills, missed calls, and follow-up.
                  </>
                ) : (
                  <>Choose a business type above to personalize this section — or just read it as a universal blueprint.</>
                )}
              </p>
            </div>
            <button
              onClick={() => scrollToId("get-started")}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: `1px solid ${palette.emerald}`,
                background: palette.emerald,
                color: palette.white,
                cursor: "pointer",
                fontWeight: 950,
              }}
            >
              Request a demo
            </button>
          </div>

          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            <StepCard
              k="1"
              title="Speed-to-Lead (first 5 minutes)"
              badge="Up to 800% increase in booked appointments"
              bullets={[
                "New lead comes in from a form / missed call / inbound inquiry.",
                "SMS goes out in ~5 seconds.",
                "Call attempt begins in ~15–20 seconds.",
                "Back-to-back attempts if no answer, then timed follow-ups.",
              ]}
              palette={palette}
            />

            <StepCard
              k="2"
              title="Speed-to-Lead Follow-up Sequence (same day + day 1/2)"
              badge="Up to 1500% increase in booked appointments"
              bullets={[
                "If they don’t answer, they’re not “lost” — they’re just busy.",
                "Sequence includes additional SMS + call attempts at strategic times.",
                "Example timing: immediate, +4 minutes, evening follow-up, next-day morning, etc.",
                "Every attempt is consistent and automatic — no guessing, no forgetting.",
              ]}
              palette={palette}
            />

            <StepCard
              k="3"
              title="Booking Call: qualify + capture the 4 variables"
              badge="Creates higher-quality appointments"
              bullets={[
                "The booking conversation is structured (not random).",
                "Captures: pain point → deeper pain → impact → desired outcome.",
                "Books directly on your calendar (or your team’s calendar).",
                "If appropriate, it can route to a human at the right time — not too early, not too late.",
              ]}
              palette={palette}
            />

            <StepCard
              k="4"
              title="No-show anchoring + pre-call training video"
              badge="Show ratio lift: up to +20 to +60 percentage points"
              bullets={[
                "No-show / late reschedule expectations are anchored in the booking flow.",
                "Reinforced inside the pre-call training video (and via reminders).",
                "Prospects show up more prepared and more committed.",
                "Example: 30% show rate → 50–90% (depending on the offer + framing).",
              ]}
              palette={palette}
            />

            <StepCard
              k="5"
              title="Pre-call video increases close rate + makes selling consistent"
              badge="Sales conversion lift: up to +20 to +40 percentage points"
              bullets={[
                "Sets expectations, frames value, and reduces confusion before the call/visit.",
                "Creates a more predictable sales process (less variance between reps).",
                "Helps ‘average’ performance move closer to ‘top rep’ performance.",
                "Example: 14% close rate → 34–54% (depending on offer + lead quality).",
              ]}
              palette={palette}
            />

            <StepCard
              k="6"
              title="Optional: done-for-you sales + ops (you just fulfill)"
              badge="If you love fulfillment, let us run the front end"
              bullets={[
                "We can handle follow-up, selling, scheduling, and handoff.",
                "Jobs land on your calendar with detailed notes and next steps.",
                "Optional: fast quote/bid drafting so you stop losing hours writing estimates.",
                "Optional: inbox automation + B2B cold outreach with human alerts when needed.",
              ]}
              palette={palette}
            />
          </div>

          <div style={{ marginTop: 16, borderTop: `1px solid ${palette.border}`, paddingTop: 16 }}>
            <div style={{ fontWeight: 950, fontSize: 16 }}>Pre-call video blueprint (works even before you have testimonials)</div>
            <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
              <MiniList
                title="Video structure"
                items={[
                  "Quick intro + who this is for",
                  "No-show / reschedule framing (protects both sides)",
                  "Why you started / what you believe",
                  "Credibility (projects, proof, “best work”, any wins)",
                  "DIY vs done-with-you framing (teach the viewer the real cost of DIY)",
                  "Reviews/testimonials (as you collect them, expand this section)",
                  "Outro + expectations + reminders",
                ]}
                palette={palette}
              />
              <MiniList
                title="Optional: personalization layer"
                items={[
                  "Use the prospect’s own words from the booking call",
                  "Reinforce their pain → impact → desired outcome",
                  "Send a reminder before the appointment to watch it",
                  "If tracking is enabled, nudge if they haven’t watched yet",
                  "Result: more prepared prospects, shorter calls, higher trust",
                ]}
                palette={palette}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ROI Calculator */}
      <div id="roi" style={{ maxWidth: 1120, margin: "0 auto", padding: "10px 18px 22px" }}>
        <div style={{ ...commonCardStyle, padding: 22 }}>
          <h2 style={sectionTitle}>ROI Calculator</h2>
          <p style={sectionSub}>
            Plug in your real numbers. This shows potential upside when Speed-to-Lead + follow-up + show-rate protection + pre-call training are applied.
          </p>

          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ ...commonCardStyle, padding: 16 }}>
              <div style={{ fontWeight: 950, fontSize: 15 }}>Your current baseline</div>
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <NumberField label="Monthly leads" value={monthlyLeads} setValue={setMonthlyLeads} suffix="" />
                <NumberField label="Avg deal value" value={avgDealValue} setValue={setAvgDealValue} suffix="$" prefix />
                <NumberField label="Lead → booked appt rate" value={bookRate} setValue={setBookRate} suffix="%" />
                <NumberField label="Show rate" value={showRate} setValue={setShowRate} suffix="%" />
                <NumberField label="Close rate (of shows)" value={closeRate} setValue={setCloseRate} suffix="%" />
              </div>

              <div style={{ marginTop: 14, borderTop: `1px solid ${palette.border}`, paddingTop: 14 }}>
                <div style={{ fontWeight: 900, fontSize: 13, color: palette.slate }}>Scenario controls</div>

                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 900 }}>Booking lift from response + follow-up</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Toggle
                        active={speedToLeadMultiplier === "off"}
                        text="Off"
                        onClick={() => setSpeedToLeadMultiplier("off")}
                        palette={palette}
                      />
                      <Toggle
                        active={speedToLeadMultiplier === "up_to_800"}
                        text="Up to 800% (≈ up to 8x total)"
                        onClick={() => setSpeedToLeadMultiplier("up_to_800")}
                        palette={palette}
                      />
                      <Toggle
                        active={speedToLeadMultiplier === "up_to_1500"}
                        text="Up to 1500% (≈ up to 15x total)"
                        onClick={() => setSpeedToLeadMultiplier("up_to_1500")}
                        palette={palette}
                      />
                    </div>
                    <div style={{ marginTop: 6, color: palette.slate, fontSize: 12, lineHeight: 1.5 }}>
                      Choose what you want to model. “Up to” assumes you’re currently slow/inconsistent and become fast + consistent.
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 900 }}>Show-rate uplift (+ pts)</div>
                      <input
                        type="range"
                        min={0}
                        max={60}
                        value={showUpliftPts}
                        onChange={(e) => setShowUpliftPts(parseInt(e.target.value || "0", 10))}
                        style={{ width: "100%" }}
                      />
                      <div style={{ fontSize: 12, color: palette.slate }}>
                        +{showUpliftPts} pts → new show rate ≈ <b>{computed.newShowRate.toFixed(0)}%</b>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontWeight: 900 }}>Close-rate uplift (+ pts)</div>
                      <input
                        type="range"
                        min={0}
                        max={40}
                        value={closeUpliftPts}
                        onChange={(e) => setCloseUpliftPts(parseInt(e.target.value || "0", 10))}
                        style={{ width: "100%" }}
                      />
                      <div style={{ fontSize: 12, color: palette.slate }}>
                        +{closeUpliftPts} pts → new close rate ≈ <b>{computed.newCloseRate.toFixed(0)}%</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ ...commonCardStyle, padding: 16 }}>
              <div style={{ fontWeight: 950, fontSize: 15 }}>Projected impact</div>

              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Stat title="Baseline booked appts" value={formatInt(computed.baseBooked)} palette={palette} />
                <Stat title="Projected booked appts" value={formatInt(computed.projectedBooked)} palette={palette} highlight />
                <Stat title="Baseline shows" value={formatInt(computed.baseShowed)} palette={palette} />
                <Stat title="Projected shows" value={formatInt(computed.projectedShowed)} palette={palette} highlight />
                <Stat title="Baseline closes" value={formatInt(computed.baseClosed)} palette={palette} />
                <Stat title="Projected closes" value={formatInt(computed.projectedClosed)} palette={palette} highlight />
              </div>

              <div style={{ marginTop: 12, borderTop: `1px solid ${palette.border}`, paddingTop: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Stat title="Baseline revenue" value={formatMoney(computed.baseRevenue)} palette={palette} />
                  <Stat title="Projected revenue" value={formatMoney(computed.projectedRevenue)} palette={palette} highlight />
                </div>

                <div style={{ marginTop: 10, padding: 14, borderRadius: 16, background: "rgba(4,120,87,0.08)", border: `1px solid rgba(4,120,87,0.18)` }}>
                  <div style={{ fontWeight: 950, fontSize: 14 }}>Potential monthly lift</div>
                  <div style={{ marginTop: 4, fontWeight: 980, fontSize: 26, color: palette.emerald }}>
                    {formatMoney(computed.liftRevenue)}
                  </div>
                  <div style={{ marginTop: 4, color: palette.slate, fontSize: 12, lineHeight: 1.5 }}>
                    This is “math on your inputs” — not a promise. Your real results depend on lead quality, offer, and execution consistency.
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12, color: palette.slate, fontSize: 12, lineHeight: 1.5 }}>
                <b>Why this works:</b> speed + consistency creates more conversations, the no-show framework protects the calendar, and the pre-call training makes prospects show up ready.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Get started / form */}
      <div id="get-started" style={{ maxWidth: 1120, margin: "0 auto", padding: "10px 18px 56px" }}>
        <div style={{ ...commonCardStyle, padding: 22 }}>
          <h2 style={sectionTitle}>Request a demo</h2>
          <p style={sectionSub}>
            Want to see how this plugs into your world? Submit the form and we’ll map your flow (inbound calls, form leads, missed calls, follow-up, booking, and pre-call training).
          </p>

          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ ...commonCardStyle, padding: 16 }}>
              <div style={{ fontWeight: 950 }}>Your info</div>
              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                <TextField label="Name" value={leadName} setValue={setLeadName} placeholder="Your name" />
                <TextField label="Phone" value={leadPhone} setValue={setLeadPhone} placeholder="(555) 555-5555" />
                <TextField label="Email" value={leadEmail} setValue={setLeadEmail} placeholder="you@company.com" />
                <TextArea label="What are you selling + where are leads coming from?" value={leadNotes} setValue={setLeadNotes} placeholder="Example: inbound calls + form leads from Google Ads. Biggest issue is slow follow-up and no-shows." />
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => alert("Form submitted (placeholder). Wire this to your webhook later.")}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${palette.emerald}`,
                    background: palette.emerald,
                    color: palette.white,
                    cursor: "pointer",
                    fontWeight: 950,
                  }}
                >
                  Submit
                </button>

                <button
                  onClick={() => scrollToId("choose")}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${palette.border}`,
                    background: palette.white,
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                >
                  Change business type
                </button>
              </div>

              <div style={{ marginTop: 10, color: palette.slate, fontSize: 12, lineHeight: 1.5 }}>
                You can connect this form to your automation layer later. The page intentionally avoids tool names — it’s about outcomes and structure.
              </div>
            </div>

            <div style={{ ...commonCardStyle, padding: 16 }}>
              <div style={{ fontWeight: 950 }}>What we’ll cover on the demo</div>
              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {[
                  { t: "Your current response time + answer rate", d: "Where leads are slipping through the cracks." },
                  { t: "A Speed-to-Lead sequence tailored to your leads", d: "Calls, texts, timing windows, and stop conditions." },
                  { t: "Your booking flow", d: "How we capture pain → deeper pain → impact → desired outcome, then book." },
                  { t: "No-show protection + pre-call training", d: "How to frame expectations so your calendar stays protected." },
                  { t: "Optional done-for-you sales + ops", d: "Selling + quoting + inbox + outreach so you can focus on fulfillment." },
                ].map((x) => (
                  <div key={x.t} style={{ border: `1px solid ${palette.border}`, borderRadius: 14, padding: 14, background: "#FFFFFF" }}>
                    <div style={{ fontWeight: 900 }}>{x.t}</div>
                    <div style={{ marginTop: 4, color: palette.slate, fontSize: 13, lineHeight: 1.55 }}>{x.d}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, borderTop: `1px solid ${palette.border}`, paddingTop: 12, color: palette.slate, fontSize: 12, lineHeight: 1.5 }}>
                If you’re a one-person shop (welder, contractor, owner-operator), we can structure it so you mostly see: <b>jobs scheduled + clear notes</b>, not a bunch of admin work.
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, color: palette.slate, fontSize: 12, lineHeight: 1.5 }}>
            <b>Reminder:</b> No pricing is shown here on purpose. This page is designed to build clarity and value without distracting from outcomes.
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectorCard({
  title,
  desc,
  active,
  onClick,
  palette,
}: {
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
  palette: any;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        cursor: "pointer",
        borderRadius: 18,
        border: active ? `2px solid ${palette.emerald}` : `1px solid ${palette.border}`,
        background: active ? "rgba(4,120,87,0.06)" : "#FFFFFF",
        padding: 14,
        boxShadow: active ? `0 12px 28px rgba(4,120,87,0.12)` : `0 12px 28px rgba(15,23,42,0.06)`,
      }}
    >
      <div style={{ fontWeight: 950, fontSize: 16 }}>{title}</div>
      <div style={{ marginTop: 4, color: palette.slate, fontSize: 13, lineHeight: 1.5 }}>{desc}</div>
    </button>
  );
}

function StepCard({
  k,
  title,
  badge,
  bullets,
  palette,
}: {
  k: string;
  title: string;
  badge: string;
  bullets: string[];
  palette: any;
}) {
  return (
    <div style={{ border: `1px solid ${palette.border}`, borderRadius: 18, background: "#FFFFFF", padding: 16, boxShadow: `0 12px 28px rgba(15,23,42,0.06)` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 10, background: "rgba(244,208,63,0.35)", display: "grid", placeItems: "center", fontWeight: 950 }}>
            {k}
          </div>
          <div style={{ fontWeight: 950, fontSize: 16, letterSpacing: "-0.01em" }}>{title}</div>
        </div>
      </div>

      <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 999, border: `1px solid ${palette.border}`, background: "rgba(4,120,87,0.06)", fontWeight: 900, fontSize: 12 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: palette.emerald }} />
        {badge}
      </div>

      <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: palette.slate, lineHeight: 1.6, fontSize: 13 }}>
        {bullets.map((b) => (
          <li key={b} style={{ marginTop: 6 }}>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniList({ title, items, palette }: { title: string; items: string[]; palette: any }) {
  return (
    <div style={{ border: `1px solid ${palette.border}`, borderRadius: 18, padding: 16, background: "#FFFFFF", boxShadow: `0 12px 28px rgba(15,23,42,0.06)` }}>
      <div style={{ fontWeight: 950 }}>{title}</div>
      <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: palette.slate, lineHeight: 1.6, fontSize: 13 }}>
        {items.map((x) => (
          <li key={x} style={{ marginTop: 6 }}>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Toggle({ active, text, onClick, palette }: { active: boolean; text: string; onClick: () => void; palette: any }) {
  return (
    <button
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: "10px 12px",
        borderRadius: 12,
        border: active ? `2px solid ${palette.emerald}` : `1px solid ${palette.border}`,
        background: active ? "rgba(4,120,87,0.06)" : "#FFFFFF",
        fontWeight: 900,
        fontSize: 12,
      }}
    >
      {text}
    </button>
  );
}

function Stat({ title, value, palette, highlight }: { title: string; value: string; palette: any; highlight?: boolean }) {
  return (
    <div style={{ border: `1px solid ${palette.border}`, borderRadius: 16, padding: 12, background: highlight ? "rgba(4,120,87,0.06)" : "#FFFFFF" }}>
      <div style={{ fontSize: 12, color: palette.slate, fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 4, fontSize: 22, fontWeight: 980, color: highlight ? palette.emerald : palette.charcoal }}>{value}</div>
    </div>
  );
}

function NumberField({
  label,
  value,
  setValue,
  suffix,
  prefix,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  suffix: string;
  prefix?: boolean;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 900, color: "#334155" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid rgba(15,23,42,0.12)", borderRadius: 12, background: "#FFFFFF", padding: "10px 12px" }}>
        {prefix ? <span style={{ fontWeight: 900, color: "#0F172A" }}>$</span> : null}
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => setValue(parseFloat(e.target.value || "0"))}
          style={{ width: "100%", border: "none", outline: "none", fontWeight: 900, color: "#0F172A" }}
        />
        {suffix ? <span style={{ fontWeight: 900, color: "#334155" }}>{suffix}</span> : null}
      </div>
    </label>
  );
}

function TextField({
  label,
  value,
  setValue,
  placeholder,
}: {
  label: string;
  value: string;
  setValue: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 900, color: "#334155" }}>{label}</div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={{
          border: "1px solid rgba(15,23,42,0.12)",
          borderRadius: 12,
          padding: "10px 12px",
          outline: "none",
          fontWeight: 800,
          color: "#0F172A",
          background: "#FFFFFF",
        }}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  setValue,
  placeholder,
}: {
  label: string;
  value: string;
  setValue: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 900, color: "#334155" }}>{label}</div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={5}
        style={{
          border: "1px solid rgba(15,23,42,0.12)",
          borderRadius: 12,
          padding: "10px 12px",
          outline: "none",
          fontWeight: 700,
          color: "#0F172A",
          background: "#FFFFFF",
          resize: "vertical",
        }}
      />
    </label>
  );
}