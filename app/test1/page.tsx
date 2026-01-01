"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type PlanKey = "demo" | "proof197" | "monthly750" | "monthly1500";
type PropertyType = "Any" | "Single Family" | "Condo" | "Townhome" | "Multi-Family";

type BuyBox = {
  territoryName: string;
  targetAddress: string;
  zips: string;
  radiusMiles: number;

  propertyType: PropertyType;

  priceMin: number;
  priceMax: number;

  bedsMin: number;
  bedsMax: number;

  bathsMin: number;

  maxDistanceMiles: number;

  keywordsInclude: string;
  keywordsExclude: string;

  hotThreshold: number;
  warmThreshold: number;

  alertsPerDay: number;
};

type MockLead = {
  id: string;
  address: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  distanceMiles: number;
  propertyType: Exclude<PropertyType, "Any">;
  source: "newsletter" | "marketplace" | "web" | "community";
  blurb: string;
};

type ScoredLead = MockLead & {
  score: number;
  tag: "Hot" | "Warm" | "Cold";
  reasons: string[];
};

const BRAND = {
  emerald: "#047857",
  emeraldDark: "#065f46",
  gold: "#F4D03F",
  charcoal: "#0F172A",
  slate: "#334155",
  muted: "#64748B",
  bg: "#0B1220",
  panel: "#0F172A",
  card: "rgba(255,255,255,0.06)",
  card2: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.10)",
  border2: "rgba(255,255,255,0.14)",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseZipList(zips: string): string[] {
  return zips
    .split(/[,\s]+/g)
    .map((z) => z.trim())
    .filter(Boolean)
    .map((z) => z.replace(/[^\d]/g, ""))
    .filter((z) => z.length === 5);
}

function formatMoney(n: number) {
  const v = Math.round(n);
  return v.toLocaleString("en-US");
}

function planMeta(plan: PlanKey) {
  switch (plan) {
    case "demo":
      return {
        label: "Demo Workflow",
        badge: "Preview",
        mode: "Top 10",
        sub: "Deterministic demo mode that always runs clean on a Meet.",
      };
    case "proof197":
      return {
        label: "Proof Sprint (7 days)",
        badge: "$197",
        mode: "Top 5",
        sub: "Tight caps. Deliver Top 5 daily. One tuning pass mid-week.",
      };
    case "monthly750":
      return {
        label: "Monthly — Solo Territory",
        badge: "$750/mo",
        mode: "Top 10",
        sub: "One territory. Standard caps. Monthly tuning included.",
      };
    case "monthly1500":
      return {
        label: "Monthly — Team / High Volume",
        badge: "$1,500/mo",
        mode: "Top 10 + Watchlist",
        sub: "Expanded caps and territory. Weekly tuning included.",
      };
  }
}

function scoreHeuristic(bb: BuyBox, lead: MockLead): { score: number; reasons: string[] } {
  let score = 50;
  const reasons: string[] = [];

  // Price fit
  const priceFit = lead.price >= bb.priceMin && lead.price <= bb.priceMax;
  score += priceFit ? 18 : -12;
  if (priceFit) reasons.push("Price fit");

  // Beds fit
  const bedsFit = lead.beds >= bb.bedsMin && lead.beds <= bb.bedsMax;
  score += bedsFit ? 12 : -10;
  if (bedsFit) reasons.push("Beds fit");

  // Baths fit
  const bathFit = lead.baths >= bb.bathsMin;
  score += bathFit ? 8 : -6;
  if (bathFit) reasons.push("Baths fit");

  // Distance fit
  const distFit = lead.distanceMiles <= bb.maxDistanceMiles;
  score += distFit ? 14 : -14;
  if (distFit) reasons.push("Distance fit");

  // Type fit
  const typeFit = bb.propertyType === "Any" || lead.propertyType === bb.propertyType;
  score += typeFit ? 8 : -6;
  if (typeFit) reasons.push("Type fit");

  // Opportunity signals (NOT “motivated seller guarantee”)
  const text = (lead.blurb || "").toLowerCase();
  const plusSignals = ["price drop", "must sell", "relocating", "estate", "as-is", "motivated", "needs work", "investor"];
  const minusSignals = ["no investors", "firm price", "do not contact", "no showings"];
  const plusHit = plusSignals.some((k) => text.includes(k));
  const minusHit = minusSignals.some((k) => text.includes(k));
  if (plusHit) {
    score += 8;
    reasons.push("Opportunity signal");
  }
  if (minusHit) {
    score -= 10;
    reasons.push("Restriction signal");
  }

  // Keyword include/exclude
  const include = bb.keywordsInclude
    .split(/[,\n]+/g)
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
  const exclude = bb.keywordsExclude
    .split(/[,\n]+/g)
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);

  if (include.length) {
    const hit = include.some((k) => text.includes(k));
    score += hit ? 6 : -6;
    if (hit) reasons.push("Include keyword hit");
  }
  if (exclude.length) {
    const hit = exclude.some((k) => text.includes(k));
    score += hit ? -18 : 0;
    if (hit) reasons.push("Exclude keyword hit");
  }

  score = clamp(Math.round(score), 1, 100);

  // Keep reasons short and clean in UI
  return { score, reasons: Array.from(new Set(reasons)).slice(0, 3) };
}

function buildMockLeads(zips: string[]): MockLead[] {
  const z = (i: number) => zips[i % Math.max(1, zips.length)] || "78701";
  return [
    { id: "L-001", address: "1108 E 6th St, Austin, TX", zip: z(0), price: 525000, beds: 3, baths: 2, distanceMiles: 4.2, propertyType: "Single Family", source: "community", blurb: "Price drop this week. As-is. Needs work. Investor special language present." },
    { id: "L-002", address: "2100 S Congress Ave #214, Austin, TX", zip: z(1), price: 389000, beds: 2, baths: 2, distanceMiles: 2.1, propertyType: "Condo", source: "web", blurb: "Relocating. Quick close preferred. Recent updates." },
    { id: "L-003", address: "4507 Maple Run Dr, Austin, TX", zip: z(2), price: 610000, beds: 4, baths: 3, distanceMiles: 8.9, propertyType: "Single Family", source: "newsletter", blurb: "Estate sale mention. Cosmetic updates. Timeline pressure hinted." },
    { id: "L-004", address: "7801 N Lamar Blvd Unit B, Austin, TX", zip: z(3), price: 289000, beds: 2, baths: 1, distanceMiles: 12.4, propertyType: "Townhome", source: "marketplace", blurb: "Firm price. No investors. Do not contact after 7pm." },
    { id: "L-005", address: "9203 Riverside Dr, Austin, TX", zip: z(0), price: 499000, beds: 3, baths: 2, distanceMiles: 10.1, propertyType: "Single Family", source: "web", blurb: "Open to concessions. Job change. Wants faster closing." },
    { id: "L-006", address: "1301 W Oltorf St, Austin, TX", zip: z(1), price: 735000, beds: 4, baths: 2, distanceMiles: 6.0, propertyType: "Single Family", source: "newsletter", blurb: "Renovated. Premium finishes. Strong comps; less urgency." },
    { id: "L-007", address: "6000 Manor Rd #12, Austin, TX", zip: z(2), price: 345000, beds: 2, baths: 2, distanceMiles: 7.3, propertyType: "Condo", source: "community", blurb: "Price drop. Needs work. Cash only (strict)." },
    { id: "L-008", address: "1901 E MLK Jr Blvd, Austin, TX", zip: z(3), price: 559000, beds: 3, baths: 2, distanceMiles: 3.6, propertyType: "Single Family", source: "marketplace", blurb: "As-is. Motivated language. Limited viewing windows." },
    { id: "L-009", address: "3400 Speedway, Austin, TX", zip: z(0), price: 820000, beds: 4, baths: 3, distanceMiles: 5.1, propertyType: "Multi-Family", source: "web", blurb: "Income potential. Needs work. Investor mention." },
    { id: "L-010", address: "701 Brazos St, Austin, TX", zip: z(1), price: 410000, beds: 1, baths: 1, distanceMiles: 1.2, propertyType: "Condo", source: "community", blurb: "Relocating. Quick close. Walkable. Recently updated." },
    { id: "L-011", address: "8200 Burnet Rd, Austin, TX", zip: z(2), price: 475000, beds: 3, baths: 2, distanceMiles: 11.6, propertyType: "Single Family", source: "newsletter", blurb: "Price drop. Cosmetic updates. Timing pressure hinted." },
    { id: "L-012", address: "2201 S 1st St, Austin, TX", zip: z(3), price: 515000, beds: 3, baths: 2, distanceMiles: 4.9, propertyType: "Townhome", source: "web", blurb: "No investors. Firm price. Clean and ready." },
    { id: "L-013", address: "5812 Berkman Dr, Austin, TX", zip: z(0), price: 459000, beds: 3, baths: 2, distanceMiles: 9.7, propertyType: "Single Family", source: "marketplace", blurb: "As-is. Needs work. Seller wants quick close." },
    { id: "L-014", address: "1200 E 12th St, Austin, TX", zip: z(1), price: 680000, beds: 4, baths: 3, distanceMiles: 3.2, propertyType: "Single Family", source: "web", blurb: "Relocating. Negotiable. Great location; limited showings." },
    { id: "L-015", address: "3100 S Lamar Blvd, Austin, TX", zip: z(2), price: 399000, beds: 2, baths: 2, distanceMiles: 6.8, propertyType: "Condo", source: "newsletter", blurb: "Price drop. Updated. Fast closing preferred." },
  ];
}

function pillStyle(kind: "hot" | "warm" | "cold") {
  if (kind === "hot") return { background: "rgba(244,208,63,0.20)", border: "1px solid rgba(244,208,63,0.45)", color: "rgba(255,255,255,0.95)" };
  if (kind === "warm") return { background: "rgba(4,120,87,0.18)", border: "1px solid rgba(4,120,87,0.45)", color: "rgba(255,255,255,0.95)" };
  return { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" };
}

function ringColor(tag: "Hot" | "Warm" | "Cold") {
  if (tag === "Hot") return "rgba(244,208,63,0.65)";
  if (tag === "Warm") return "rgba(4,120,87,0.65)";
  return "rgba(255,255,255,0.22)";
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function Page() {
  const [plan, setPlan] = useState<PlanKey>("demo");
  const meta = planMeta(plan);

  const [bb, setBb] = useState<BuyBox>({
    territoryName: "Austin Core",
    targetAddress: "1100 Congress Ave, Austin, TX 78701",
    zips: "78701, 78702, 78703, 78704",
    radiusMiles: 25,

    propertyType: "Any",

    priceMin: 350000,
    priceMax: 750000,

    bedsMin: 3,
    bedsMax: 5,

    bathsMin: 2,

    maxDistanceMiles: 15,

    keywordsInclude: "price drop, must sell, relocating, estate, as-is",
    keywordsExclude: "no investors, firm price",

    hotThreshold: 80,
    warmThreshold: 60,

    alertsPerDay: 3,
  });

  const zips = useMemo(() => parseZipList(bb.zips), [bb.zips]);
  const mockLeads = useMemo(() => buildMockLeads(zips), [zips]);

  const scoredAll = useMemo<ScoredLead[]>(() => {
    const rows = mockLeads.map((l) => {
      const s = scoreHeuristic(bb, l);
      const tag: ScoredLead["tag"] = s.score >= bb.hotThreshold ? "Hot" : s.score >= bb.warmThreshold ? "Warm" : "Cold";
      return { ...l, score: s.score, tag, reasons: s.reasons };
    });
    rows.sort((a, b) => b.score - a.score);
    return rows;
  }, [bb, mockLeads]);

  const topN = plan === "proof197" ? 5 : 10;
  const topRows = useMemo(() => scoredAll.slice(0, topN), [scoredAll, topN]);

  const counts = useMemo(() => {
    const c = { hot: 0, warm: 0, cold: 0 };
    for (const r of scoredAll) {
      if (r.tag === "Hot") c.hot++;
      else if (r.tag === "Warm") c.warm++;
      else c.cold++;
    }
    return c;
  }, [scoredAll]);

  // Demo run animation
  const steps = useMemo(
    () => [
      { key: "sources", label: "Sources" },
      { key: "normalize", label: "Normalize" },
      { key: "distance", label: "Distance" },
      { key: "score", label: "Score" },
      { key: "deliver", label: "Deliver" },
    ],
    []
  );

  const [runId, setRunId] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  function stopTimers() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function runDemo() {
    stopTimers();
    setRunId(`RUN-${new Date().toISOString().slice(0, 10)}-${makeId().toUpperCase()}`);
    setRunning(true);
    setStepIdx(0);
    setProgress(0);

    let p = 0;
    let s = 0;

    timerRef.current = window.setInterval(() => {
      p += 2 + Math.random() * 6; // speed varies
      if (p >= 100) {
        p = 100;
        stopTimers();
        setProgress(100);
        setStepIdx(steps.length - 1);
        window.setTimeout(() => {
          setRunning(false);
        }, 250);
        return;
      }

      // Move step by progress thresholds
      const nextStep = Math.min(steps.length - 1, Math.floor((p / 100) * steps.length));
      s = nextStep;
      setProgress(p);
      setStepIdx(s);
    }, 90);
  }

  useEffect(() => {
    return () => stopTimers();
  }, []);

  const alertPreview = useMemo(() => {
    const hot = topRows.filter((r) => r.tag === "Hot").slice(0, bb.alertsPerDay);
    return hot.map((r) => ({
      id: r.id,
      title: `HOT (${r.score}) • ${r.address.split(",")[0]}`,
      line: `$${formatMoney(r.price)} • ${r.beds}bd/${r.baths}ba • ${r.distanceMiles.toFixed(1)}mi`,
      note: r.reasons.join(" • ") || "Ranked opportunity",
    }));
  }, [topRows, bb.alertsPerDay]);

  const buyBoxSummary = useMemo(() => {
    const zipLabel = zips.length ? `${zips.slice(0, 7).join(", ")}${zips.length > 7 ? "…" : ""}` : "—";
    return [
      { k: "Territory", v: bb.territoryName || "—" },
      { k: "ZIPs", v: zipLabel },
      { k: "Radius", v: `${bb.radiusMiles} mi` },
      { k: "Price", v: `$${formatMoney(bb.priceMin)}–$${formatMoney(bb.priceMax)}` },
      { k: "Beds", v: `${bb.bedsMin}–${bb.bedsMax}` },
      { k: "Baths", v: `${bb.bathsMin}+` },
      { k: "Max Distance", v: `${bb.maxDistanceMiles} mi` },
      { k: "Type", v: bb.propertyType },
      { k: "Hot ≥", v: `${bb.hotThreshold}` },
    ];
  }, [bb, zips]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }

  const configJson = useMemo(() => JSON.stringify({ plan, ...bb }, null, 2), [plan, bb]);

  return (
    <div className="min-h-screen" style={{ background: BRAND.bg }}>
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(900px 500px at 20% 10%, rgba(4,120,87,0.35), transparent 60%), radial-gradient(700px 500px at 80% 20%, rgba(244,208,63,0.20), transparent 55%), radial-gradient(800px 600px at 50% 90%, rgba(255,255,255,0.10), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ border: `1px solid ${BRAND.border}`, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.85)" }}>
              <span className="h-2 w-2 rounded-full" style={{ background: BRAND.gold }} />
              Opportunity Intelligence Feed
              <span className="opacity-60">•</span>
              <span className="opacity-90">Territory-based delivery</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Demo Console: Buy Box → Ranked Feed → Alerts
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
              This is the screen-share page. It shows what they get without relying on live scraping.
              You sell “ranked opportunities,” not “guaranteed motivated sellers.”
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <div className="inline-flex items-center gap-2 rounded-2xl px-4 py-2" style={{ border: `1px solid ${BRAND.border2}`, background: "rgba(255,255,255,0.06)" }}>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
                Selected
              </span>
              <span className="text-sm font-semibold text-white">{meta.label}</span>
              <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: "rgba(244,208,63,0.18)", border: "1px solid rgba(244,208,63,0.4)", color: "rgba(255,255,255,0.95)" }}>
                {meta.badge}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={runDemo}
                className="rounded-2xl px-5 py-3 text-sm font-semibold text-white transition"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.emerald} 0%, ${BRAND.emeraldDark} 65%)`,
                  boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
                }}
              >
                {running ? "Running…" : "Run Demo"}
              </button>
              <button
                onClick={() => copy(configJson)}
                className="rounded-2xl px-5 py-3 text-sm font-semibold transition"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${BRAND.border}`,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Copy Config
              </button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-7 grid gap-6 lg:grid-cols-12">
          {/* Left: Plan Selector */}
          <div className="lg:col-span-3">
            <GlassCard>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Plans</div>
                <span className="rounded-full px-2 py-1 text-[11px] font-semibold" style={{ background: "rgba(4,120,87,0.18)", border: "1px solid rgba(4,120,87,0.35)", color: "rgba(255,255,255,0.9)" }}>
                  4 workflows
                </span>
              </div>

              <div className="mt-4 grid gap-2">
                {(
                  [
                    { k: "demo", t: "Demo Workflow", s: "Always works (mock data)" },
                    { k: "proof197", t: "Proof Sprint", s: "Top 5 daily (tight caps)" },
                    { k: "monthly750", t: "Monthly $750", s: "Solo territory" },
                    { k: "monthly1500", t: "Monthly $1,500", s: "Team / high volume" },
                  ] as Array<{ k: PlanKey; t: string; s: string }>
                ).map((p) => {
                  const active = plan === p.k;
                  const m = planMeta(p.k);
                  return (
                    <button
                      key={p.k}
                      onClick={() => setPlan(p.k)}
                      className="w-full rounded-2xl px-3 py-3 text-left transition"
                      style={{
                        border: `1px solid ${active ? "rgba(244,208,63,0.45)" : BRAND.border}`,
                        background: active ? "rgba(244,208,63,0.10)" : "rgba(255,255,255,0.04)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-white">{p.t}</div>
                          <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                            {p.s}
                          </div>
                        </div>
                        <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.border}`, color: "rgba(255,255,255,0.85)" }}>
                          {m.mode}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl px-3 py-3" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BRAND.border}` }}>
                <div className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
                  What you say (one line)
                </div>
                <div className="mt-2 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {meta.sub}
                </div>
              </div>
            </GlassCard>

            <div className="mt-6">
              <GlassCard>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">Run</div>
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {runId || "—"}
                  </span>
                </div>

                <div className="mt-3 grid gap-2">
                  <div className="flex items-center justify-between text-xs" style={{ color: "rgba(255,255,255,0.70)" }}>
                    <span>Pipeline</span>
                    <span>{running ? `${Math.round(progress)}%` : "Ready"}</span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${running ? progress : 0}%`,
                        background: `linear-gradient(90deg, ${BRAND.emerald} 0%, ${BRAND.gold} 70%)`,
                      }}
                    />
                  </div>

                  <div className="mt-3 grid gap-2">
                    {steps.map((s, i) => {
                      const done = !running && progress === 100 ? true : i < stepIdx;
                      const active = running && i === stepIdx;
                      return (
                        <div
                          key={s.key}
                          className="flex items-center justify-between rounded-xl px-3 py-2"
                          style={{
                            background: active ? "rgba(244,208,63,0.10)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${active ? "rgba(244,208,63,0.35)" : BRAND.border}`,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: done ? BRAND.emerald : active ? BRAND.gold : "rgba(255,255,255,0.20)" }}
                            />
                            <span className="text-xs font-semibold text-white">{s.label}</span>
                          </div>
                          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                            {done ? "Done" : active ? "Working" : "Queued"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Middle: Results */}
          <div className="lg:col-span-6">
            <GlassCard>
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
                    Ranked queue preview
                  </div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    {plan === "proof197" ? "Top 5 for Proof Sprint" : "Top 10 Daily Board"}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.62)" }}>
                    Clean, reason-coded, threshold-based. This is the “product feel.”
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full px-2 py-1 text-[11px] font-semibold" style={pillStyle("hot")}>
                    Hot {counts.hot}
                  </span>
                  <span className="rounded-full px-2 py-1 text-[11px] font-semibold" style={pillStyle("warm")}>
                    Warm {counts.warm}
                  </span>
                  <span className="rounded-full px-2 py-1 text-[11px] font-semibold" style={pillStyle("cold")}>
                    Cold {counts.cold}
                  </span>
                </div>
              </div>

              {/* Distribution mini chart */}
              <div className="mt-4 rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BRAND.border}` }}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.70)" }}>
                    Score distribution
                  </div>
                  <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.60)" }}>
                    Hot ≥ {bb.hotThreshold} • Warm ≥ {bb.warmThreshold}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-12 gap-1">
                  {scoredAll.slice(0, 24).map((r) => (
                    <div
                      key={r.id}
                      title={`${r.tag} ${r.score} — ${r.address}`}
                      className="h-10 rounded-lg"
                      style={{
                        background: r.tag === "Hot" ? "rgba(244,208,63,0.18)" : r.tag === "Warm" ? "rgba(4,120,87,0.18)" : "rgba(255,255,255,0.06)",
                        border: `1px solid ${ringColor(r.tag)}`,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        className="w-full"
                        style={{
                          height: `${clamp(r.score, 1, 100)}%`,
                          background: r.tag === "Hot" ? "rgba(244,208,63,0.35)" : r.tag === "Warm" ? "rgba(4,120,87,0.35)" : "rgba(255,255,255,0.12)",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Board */}
              <div className="mt-4 overflow-hidden rounded-2xl" style={{ border: `1px solid ${BRAND.border}` }}>
                <div className="grid grid-cols-12 gap-2 px-4 py-3 text-[11px] font-semibold" style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.70)" }}>
                  <div className="col-span-5">Opportunity</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2">Specs</div>
                  <div className="col-span-2">Distance</div>
                  <div className="col-span-1 text-right">Score</div>
                </div>

                <div className="divide-y" style={{ borderColor: BRAND.border }}>
                  {(running ? Array.from({ length: topN }) : topRows).map((row: any, idx: number) => {
                    if (running) {
                      return <SkeletonRow key={`sk-${idx}`} />;
                    }

                    const r = row as ScoredLead;
                    return (
                      <div key={r.id} className="grid grid-cols-12 gap-2 px-4 py-4">
                        <div className="col-span-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-white">{r.address.split(",")[0]}</div>
                              <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                                {r.source.toUpperCase()} • {r.propertyType} • ZIP {r.zip}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {r.reasons.map((x) => (
                                  <span key={x} className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.border}`, color: "rgba(255,255,255,0.82)" }}>
                                    {x}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <span className="rounded-full px-2 py-1 text-[11px] font-semibold" style={r.tag === "Hot" ? pillStyle("hot") : r.tag === "Warm" ? pillStyle("warm") : pillStyle("cold")}>
                              {r.tag}
                            </span>
                          </div>

                          <div className="mt-2 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.62)" }}>
                            {r.blurb}
                          </div>
                        </div>

                        <div className="col-span-2 text-sm font-semibold text-white">${formatMoney(r.price)}</div>
                        <div className="col-span-2 text-sm" style={{ color: "rgba(255,255,255,0.80)" }}>
                          {r.beds}bd / {r.baths}ba
                        </div>
                        <div className="col-span-2 text-sm" style={{ color: "rgba(255,255,255,0.80)" }}>
                          {r.distanceMiles.toFixed(1)} mi
                        </div>

                        <div className="col-span-1 flex items-center justify-end">
                          <div className="relative">
                            <div className="h-8 w-14 rounded-xl text-center text-sm font-semibold text-white" style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${ringColor(r.tag)}`, lineHeight: "32px" }}>
                              {r.score}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => copy(JSON.stringify(topRows, null, 2))}
                  className="rounded-2xl px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.border}` }}
                >
                  Copy Preview Rows
                </button>
                <button
                  onClick={() =>
                    copy(
                      topRows
                        .map((r) => `${r.tag} ${r.score} — ${r.address} — $${formatMoney(r.price)} — ${r.distanceMiles.toFixed(1)}mi`)
                        .join("\n")
                    )
                  }
                  className="rounded-2xl px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.border}` }}
                >
                  Copy as Text
                </button>
              </div>
            </GlassCard>

            {/* Alerts preview */}
            <div className="mt-6">
              <GlassCard>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Hot Alerts Preview</div>
                    <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                      Threshold based. Capped to {bb.alertsPerDay}/day.
                    </div>
                  </div>
                  <span className="rounded-full px-2 py-1 text-[11px] font-semibold" style={pillStyle("hot")}>
                    Send on Hot only
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {(running ? Array.from({ length: 2 }) : alertPreview.length ? alertPreview : []).map((a: any, idx: number) => {
                    if (running) return <SkeletonCard key={`skc-${idx}`} />;
                    if (!a) return null;

                    return (
                      <div key={a.id} className="rounded-2xl p-4" style={{ background: "rgba(244,208,63,0.08)", border: "1px solid rgba(244,208,63,0.25)" }}>
                        <div className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
                          🔥 HOT ALERT
                        </div>
                        <div className="mt-2 text-sm font-semibold text-white">{a.title}</div>
                        <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.72)" }}>
                          {a.line}
                        </div>
                        <div className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                          {a.note}
                        </div>
                      </div>
                    );
                  })}

                  {!running && !alertPreview.length && (
                    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BRAND.border}` }}>
                      <div className="text-sm font-semibold text-white">No hot alerts</div>
                      <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                        Raise scoring by tightening the buy box, or lower the hot threshold.
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Right: Buy Box Panel */}
          <div className="lg:col-span-3">
            <GlassCard>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Buy Box</div>
                <span className="rounded-full px-2 py-1 text-[11px] font-semibold" style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.border}`, color: "rgba(255,255,255,0.85)" }}>
                  Client-configured
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                <Labeled label="Territory name">
                  <input
                    value={bb.territoryName}
                    onChange={(e) => setBb((p) => ({ ...p, territoryName: e.target.value }))}
                    className="w-full rounded-2xl px-3 py-2 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}` }}
                  />
                </Labeled>

                <Labeled label="Target address (anchor)">
                  <input
                    value={bb.targetAddress}
                    onChange={(e) => setBb((p) => ({ ...p, targetAddress: e.target.value }))}
                    className="w-full rounded-2xl px-3 py-2 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}` }}
                  />
                </Labeled>

                <Labeled label="ZIPs (comma/space)">
                  <input
                    value={bb.zips}
                    onChange={(e) => setBb((p) => ({ ...p, zips: e.target.value }))}
                    className="w-full rounded-2xl px-3 py-2 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}` }}
                  />
                  <div className="mt-1 text-[11px]" style={{ color: "rgba(255,255,255,0.62)" }}>
                    Parsed ZIPs: {zips.length}
                  </div>
                </Labeled>

                <div className="grid grid-cols-2 gap-3">
                  <Labeled label="Radius (mi)">
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={bb.radiusMiles}
                      onChange={(e) => setBb((p) => ({ ...p, radiusMiles: clamp(Number(e.target.value || 0), 1, 200) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}` }}
                    />
                  </Labeled>

                  <Labeled label="Max dist (mi)">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={bb.maxDistanceMiles}
                      onChange={(e) => setBb((p) => ({ ...p, maxDistanceMiles: clamp(Number(e.target.value || 0), 1, 100) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}` }}
                    />
                  </Labeled>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Labeled label="Price min">
                    <input
                      type="number"
                      min={0}
                      value={bb.priceMin}
                      onChange={(e) => setBb((p) => ({ ...p, priceMin: Math.max(0, Number(e.target.value || 0)) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}` }}
                    />
                  </Labeled>

                  <Labeled label="Price max">
                    <input
                      type="number"
                      min={0}
                      value={bb.priceMax}
                      onChange={(e) => setBb((p) => ({ ...p, priceMax: Math.max(0, Number(e.target.value || 0)) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}` }}
                    />
                  </Labeled>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Labeled label="Beds min">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={bb.bedsMin}
                      onChange={(e) => setBb((p) => ({ ...p, bedsMin: clamp(Number(e.target.value || 0), 0, 10) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}` }}
                    />
                  </Labeled>

                  <Labeled label="Beds max">
                    <input
                      type="number"
                      min={0}
                      max={15}
                      value={bb.bedsMax}
                      onChange={(e) => setBb((p) => ({ ...p, bedsMax: clamp(Number(e.target.value || 0), 0, 15) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}` }}
                    />
                  </Labeled>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Labeled label="Baths min">
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      max={10}
                      value={bb.bathsMin}
                      onChange={(e) => setBb((p) => ({ ...p, bathsMin: clamp(Number(e.target.value || 0), 0, 10) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}` }}
                    />
                  </Labeled>

                  <Labeled label="Property type">
                    <select
                      value={bb.propertyType}
                      onChange={(e) => setBb((p) => ({ ...p, propertyType: e.target.value as PropertyType }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}` }}
                    >
                      {["Any", "Single Family", "Condo", "Townhome", "Multi-Family"].map((v) => (
                        <option key={v} value={v} style={{ color: "#000" }}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </Labeled>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Labeled label="Warm ≥">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={bb.warmThreshold}
                      onChange={(e) => setBb((p) => ({ ...p, warmThreshold: clamp(Number(e.target.value || 0), 1, 99) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}` }}
                    />
                  </Labeled>

                  <Labeled label="Hot ≥">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={bb.hotThreshold}
                      onChange={(e) => setBb((p) => ({ ...p, hotThreshold: clamp(Number(e.target.value || 0), 1, 100) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}` }}
                    />
                  </Labeled>
                </div>

                <Labeled label="Keywords include (comma separated)">
                  <textarea
                    value={bb.keywordsInclude}
                    onChange={(e) => setBb((p) => ({ ...p, keywordsInclude: e.target.value }))}
                    className="h-20 w-full resize-none rounded-2xl px-3 py-2 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}` }}
                  />
                </Labeled>

                <Labeled label="Keywords exclude (comma separated)">
                  <textarea
                    value={bb.keywordsExclude}
                    onChange={(e) => setBb((p) => ({ ...p, keywordsExclude: e.target.value }))}
                    className="h-20 w-full resize-none rounded-2xl px-3 py-2 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}` }}
                  />
                </Labeled>

                <Labeled label="Alerts/day cap">
                  <input
                    type="number"
                    min={0}
                    max={25}
                    value={bb.alertsPerDay}
                    onChange={(e) => setBb((p) => ({ ...p, alertsPerDay: clamp(Number(e.target.value || 0), 0, 25) }))}
                    className="w-full rounded-2xl px-3 py-2 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}` }}
                  />
                </Labeled>

                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setBb((p) => ({
                        ...p,
                        priceMin: 350000,
                        priceMax: 650000,
                        bedsMin: 3,
                        bedsMax: 4,
                        bathsMin: 2,
                        maxDistanceMiles: 12,
                        hotThreshold: 82,
                        warmThreshold: 62,
                      }))
                    }
                    className="rounded-2xl px-3 py-2 text-xs font-semibold text-white"
                    style={{ background: "rgba(244,208,63,0.12)", border: "1px solid rgba(244,208,63,0.25)" }}
                  >
                    Tighten filters
                  </button>
                  <button
                    onClick={() =>
                      setBb((p) => ({
                        ...p,
                        priceMin: 250000,
                        priceMax: 850000,
                        bedsMin: 2,
                        bedsMax: 6,
                        bathsMin: 2,
                        maxDistanceMiles: 20,
                        hotThreshold: 78,
                        warmThreshold: 58,
                      }))
                    }
                    className="rounded-2xl px-3 py-2 text-xs font-semibold text-white"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.border}` }}
                  >
                    Widen filters
                  </button>
                </div>
              </div>
            </GlassCard>

            <div className="mt-6">
              <GlassCard>
                <div className="text-sm font-semibold text-white">Top Criteria (plug-in)</div>
                <div className="mt-3 grid gap-2">
                  {buyBoxSummary.map((x) => (
                    <div key={x.k} className="flex items-start justify-between gap-3">
                      <div className="text-xs font-semibold text-white">{x.k}</div>
                      <div className="text-xs text-right" style={{ color: "rgba(255,255,255,0.70)" }}>
                        {x.v}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => copy(JSON.stringify(buyBoxSummary, null, 2))}
                    className="rounded-2xl px-3 py-2 text-xs font-semibold text-white"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.border}` }}
                  >
                    Copy Top List
                  </button>
                  <button
                    onClick={() => copy(buyBoxSummary.map((x) => `${x.k}: ${x.v}`).join("\n"))}
                    className="rounded-2xl px-3 py-2 text-xs font-semibold text-white"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.border}` }}
                  >
                    Copy as Text
                  </button>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
          Demo mode uses deterministic sample opportunities so you never debug live sources on a sales call.
        </div>
      </div>
    </div>
  );
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl p-5"
      style={{
        background: `linear-gradient(180deg, ${BRAND.card} 0%, ${BRAND.card2} 100%)`,
        border: `1px solid ${BRAND.border}`,
        boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
        backdropFilter: "blur(10px)",
      }}
    >
      {children}
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 gap-2 px-4 py-4">
      <div className="col-span-5 space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded-lg" style={{ background: "rgba(255,255,255,0.10)" }} />
        <div className="h-3 w-1/2 animate-pulse rounded-lg" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="mt-2 flex gap-2">
          <div className="h-5 w-20 animate-pulse rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="h-5 w-24 animate-pulse rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>
      </div>
      <div className="col-span-2">
        <div className="h-4 w-20 animate-pulse rounded-lg" style={{ background: "rgba(255,255,255,0.10)" }} />
      </div>
      <div className="col-span-2">
        <div className="h-4 w-20 animate-pulse rounded-lg" style={{ background: "rgba(255,255,255,0.10)" }} />
      </div>
      <div className="col-span-2">
        <div className="h-4 w-16 animate-pulse rounded-lg" style={{ background: "rgba(255,255,255,0.10)" }} />
      </div>
      <div className="col-span-1 flex justify-end">
        <div className="h-8 w-14 animate-pulse rounded-xl" style={{ background: "rgba(255,255,255,0.10)" }} />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BRAND.border}` }}>
      <div className="h-3 w-20 animate-pulse rounded" style={{ background: "rgba(255,255,255,0.10)" }} />
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded" style={{ background: "rgba(255,255,255,0.10)" }} />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="mt-3 h-3 w-2/3 animate-pulse rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
}