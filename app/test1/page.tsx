"use client";

import React, { useMemo, useState } from "react";

type PlanKey = "demo" | "proof197" | "monthly750" | "monthly1500";

type PropertyType = "Single Family" | "Condo" | "Townhome" | "Multi-Family" | "Any";

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

const BRAND = {
  emerald: "#047857",
  emeraldDark: "#065f46",
  gold: "#F4D03F",
  charcoal: "#0F172A",
  slate: "#334155",
  white: "#FFFFFF",
  bg: "#F8FAFC",
  border: "#E2E8F0",
  muted: "#64748B",
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

function scoreHeuristic(bb: BuyBox, lead: MockLead): number {
  // Cheap, deterministic demo scoring for UI preview. No “AI” claim here.
  let score = 50;

  // Price fit
  if (lead.price >= bb.priceMin && lead.price <= bb.priceMax) score += 18;
  else score -= 12;

  // Beds fit
  if (lead.beds >= bb.bedsMin && lead.beds <= bb.bedsMax) score += 12;
  else score -= 10;

  // Baths fit
  if (lead.baths >= bb.bathsMin) score += 8;
  else score -= 6;

  // Distance fit
  if (lead.distanceMiles <= bb.maxDistanceMiles) score += 14;
  else score -= 14;

  // Property type fit
  if (bb.propertyType === "Any" || lead.propertyType === bb.propertyType) score += 8;
  else score -= 6;

  // Motivation-ish text signals (still just opportunity signals)
  const text = (lead.blurb || "").toLowerCase();
  const plusSignals = ["price drop", "must sell", "relocating", "estate", "as-is", "motivated", "investor", "needs work"];
  const minusSignals = ["no investors", "firm price", "do not contact", "no showings", "cash only (strict)"];
  for (const s of plusSignals) if (text.includes(s)) score += 4;
  for (const s of minusSignals) if (text.includes(s)) score -= 5;

  // Include/Exclude keywords
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
  }
  if (exclude.length) {
    const hit = exclude.some((k) => text.includes(k));
    score += hit ? -18 : 0;
  }

  // Cap
  return clamp(Math.round(score), 1, 100);
}

type MockLead = {
  id: string;
  address: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  distanceMiles: number;
  propertyType: PropertyType;
  source: "newsletter" | "marketplace" | "web" | "community";
  blurb: string;
};

function buildMockLeads(zips: string[]): MockLead[] {
  const z = (i: number) => zips[i % Math.max(1, zips.length)] || "78701";
  return [
    {
      id: "L-001",
      address: "1108 E 6th St, Austin, TX",
      zip: z(0),
      price: 525000,
      beds: 3,
      baths: 2,
      distanceMiles: 4.2,
      propertyType: "Single Family",
      source: "community",
      blurb: "Price drop this week. As-is. Needs work. Investor special noted in description.",
    },
    {
      id: "L-002",
      address: "2100 S Congress Ave #214, Austin, TX",
      zip: z(1),
      price: 389000,
      beds: 2,
      baths: 2,
      distanceMiles: 2.1,
      propertyType: "Condo",
      source: "web",
      blurb: "Relocating. Quick close preferred. Recently updated.",
    },
    {
      id: "L-003",
      address: "4507 Maple Run Dr, Austin, TX",
      zip: z(2),
      price: 610000,
      beds: 4,
      baths: 3,
      distanceMiles: 8.9,
      propertyType: "Single Family",
      source: "newsletter",
      blurb: "Estate sale mention. Needs cosmetic updates. Motivated timeline hinted.",
    },
    {
      id: "L-004",
      address: "7801 N Lamar Blvd Unit B, Austin, TX",
      zip: z(3),
      price: 289000,
      beds: 2,
      baths: 1,
      distanceMiles: 12.4,
      propertyType: "Townhome",
      source: "marketplace",
      blurb: "Firm price. No investors. Do not contact after 7pm.",
    },
    {
      id: "L-005",
      address: "9203 Riverside Dr, Austin, TX",
      zip: z(0),
      price: 499000,
      beds: 3,
      baths: 2,
      distanceMiles: 10.1,
      propertyType: "Single Family",
      source: "web",
      blurb: "Seller open to concessions. Must sell due to job change. Wants fast closing.",
    },
    {
      id: "L-006",
      address: "1301 W Oltorf St, Austin, TX",
      zip: z(1),
      price: 735000,
      beds: 4,
      baths: 2,
      distanceMiles: 6.0,
      propertyType: "Single Family",
      source: "newsletter",
      blurb: "Renovated. Premium finishes. No urgency. Strong comps.",
    },
    {
      id: "L-007",
      address: "6000 Manor Rd #12, Austin, TX",
      zip: z(2),
      price: 345000,
      beds: 2,
      baths: 2,
      distanceMiles: 7.3,
      propertyType: "Condo",
      source: "community",
      blurb: "Price drop, must sell. Needs work. Cash only (strict).",
    },
    {
      id: "L-008",
      address: "1901 E MLK Jr Blvd, Austin, TX",
      zip: z(3),
      price: 559000,
      beds: 3,
      baths: 2,
      distanceMiles: 3.6,
      propertyType: "Single Family",
      source: "marketplace",
      blurb: "As-is. Motivated. Investor-friendly wording. Viewing windows limited.",
    },
    {
      id: "L-009",
      address: "3400 Speedway, Austin, TX",
      zip: z(0),
      price: 820000,
      beds: 4,
      baths: 3,
      distanceMiles: 5.1,
      propertyType: "Multi-Family",
      source: "web",
      blurb: "Good income potential. Needs work. Investor mention.",
    },
    {
      id: "L-010",
      address: "701 Brazos St, Austin, TX",
      zip: z(1),
      price: 410000,
      beds: 1,
      baths: 1,
      distanceMiles: 1.2,
      propertyType: "Condo",
      source: "community",
      blurb: "Relocating. Quick close. Recently updated. Strong walkability.",
    },
    {
      id: "L-011",
      address: "8200 Burnet Rd, Austin, TX",
      zip: z(2),
      price: 475000,
      beds: 3,
      baths: 2,
      distanceMiles: 11.6,
      propertyType: "Single Family",
      source: "newsletter",
      blurb: "Price drop. Needs cosmetic updates. Motivated seller hinted.",
    },
    {
      id: "L-012",
      address: "2201 S 1st St, Austin, TX",
      zip: z(3),
      price: 515000,
      beds: 3,
      baths: 2,
      distanceMiles: 4.9,
      propertyType: "Townhome",
      source: "web",
      blurb: "No investors. Firm price. Clean and ready.",
    },
  ];
}

function planMeta(plan: PlanKey) {
  switch (plan) {
    case "demo":
      return {
        label: "Demo Workflow",
        badge: "Preview",
        priceLine: "$0",
        desc: "Interactive demo mode with deterministic sample data.",
        outputs: ["Ranked Top 10 queue", "Hot alerts preview", "Daily report preview"],
      };
    case "proof197":
      return {
        label: "Proof Sprint (7 days)",
        badge: "$197",
        priceLine: "$197 / 7 days",
        desc: "Live run with tight caps. Top 5 delivered daily.",
        outputs: ["Daily Top 5", "Alerts (hot only)", "End-of-week recap"],
      };
    case "monthly750":
      return {
        label: "Monthly — Solo Territory",
        badge: "$750",
        priceLine: "$750 / month",
        desc: "One territory, moderate volume, limited tuning.",
        outputs: ["Daily Top 10", "Hot alerts", "Weekly tuning (optional)"],
      };
    case "monthly1500":
      return {
        label: "Monthly — Team / High Volume",
        badge: "$1,500",
        priceLine: "$1,500 / month",
        desc: "Wider territory, higher caps, more tuning & monitoring.",
        outputs: ["Daily Top 10 + Watchlist", "More alerts", "Weekly tuning included"],
      };
  }
}

function workflowSet(plan: PlanKey) {
  // You asked for 4 JSON workflows; this is just the *front-end spec* list.
  // (No auditing of JSON here.)
  const common = [
    { name: "W0 — Demo Workflow", note: "Mock data path + UI preview output" },
    { name: "W1 — Proof Sprint ($197) Workflow", note: "Tight caps + Top 5 daily" },
    { name: "W2 — Monthly $750 Workflow", note: "Standard caps + Daily Top 10" },
    { name: "W3 — Monthly $1,500 Workflow", note: "High-volume caps + multi-territory option" },
  ];

  // Highlight selected, but keep same list.
  return common.map((w, i) => ({
    ...w,
    selected: (plan === "demo" && i === 0) || (plan === "proof197" && i === 1) || (plan === "monthly750" && i === 2) || (plan === "monthly1500" && i === 3),
  }));
}

function buildTopCriteria(bb: BuyBox) {
  const zips = parseZipList(bb.zips);
  const zipLabel = zips.length ? `${zips.slice(0, 8).join(", ")}${zips.length > 8 ? "…" : ""}` : "Not set";
  return [
    { key: "Territory", value: bb.territoryName || "Unnamed territory" },
    { key: "Target Address", value: bb.targetAddress || "Not set" },
    { key: "ZIPs", value: zipLabel },
    { key: "Radius", value: `${bb.radiusMiles} miles` },
    { key: "Property Type", value: bb.propertyType },
    { key: "Price Range", value: `$${formatMoney(bb.priceMin)} – $${formatMoney(bb.priceMax)}` },
    { key: "Beds", value: `${bb.bedsMin} – ${bb.bedsMax}` },
    { key: "Baths (min)", value: `${bb.bathsMin}+` },
    { key: "Max Distance to Target", value: `${bb.maxDistanceMiles} miles` },
    {
      key: "Keywords",
      value:
        (bb.keywordsInclude.trim() ? `Include: ${bb.keywordsInclude.trim()}` : "Include: —") +
        (bb.keywordsExclude.trim() ? ` | Exclude: ${bb.keywordsExclude.trim()}` : " | Exclude: —"),
    },
  ];
}

function deliverableCards(plan: PlanKey) {
  const base = [
    {
      title: "Ranked Opportunity Queue",
      body: "Airtable board with scores, reason codes, and a clean Top view.",
      icon: "▦",
    },
    {
      title: "Hot Opportunity Alerts",
      body: "Push alerts only when it clears your threshold.",
      icon: "⚡",
    },
    {
      title: "Daily Digest",
      body: "Short daily email with Top opportunities + watchlist movement.",
      icon: "✉",
    },
    {
      title: "Admin Controls",
      body: "Quick edits to territory and thresholds without touching the workflow.",
      icon: "⛭",
    },
  ];

  if (plan === "proof197") {
    return [
      { title: "Top 5 Only", body: "Proof sprint focuses on the highest-signal items only.", icon: "⑤" },
      ...base,
    ];
  }

  if (plan === "monthly1500") {
    return [
      ...base,
      { title: "Expanded Volume + Territory", body: "Higher caps, wider territory, more tuning cycles.", icon: "⤢" },
    ];
  }

  return base;
}

function badgeStyle(bg: string, fg: string) {
  return { backgroundColor: bg, color: fg };
}

export default function Page() {
  const [plan, setPlan] = useState<PlanKey>("demo");
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

  const meta = planMeta(plan);

  const top10 = useMemo(() => buildTopCriteria(bb), [bb]);
  const top5 = useMemo(() => top10.slice(0, 5), [top10]);

  const zipList = useMemo(() => parseZipList(bb.zips), [bb.zips]);
  const mockLeads = useMemo(() => buildMockLeads(zipList), [zipList]);

  const scored = useMemo(() => {
    const rows = mockLeads.map((l) => {
      const score = scoreHeuristic(bb, l);
      const tag = score >= bb.hotThreshold ? "Hot" : score >= bb.warmThreshold ? "Warm" : "Cold";
      const reasons: string[] = [];

      if (l.distanceMiles <= bb.maxDistanceMiles) reasons.push("Distance fit");
      if (l.price >= bb.priceMin && l.price <= bb.priceMax) reasons.push("Price fit");
      if (l.beds >= bb.bedsMin && l.beds <= bb.bedsMax) reasons.push("Beds fit");
      if (l.baths >= bb.bathsMin) reasons.push("Baths fit");
      if (bb.propertyType === "Any" || l.propertyType === bb.propertyType) reasons.push("Type fit");

      const text = l.blurb.toLowerCase();
      if (["price drop", "must sell", "relocating", "estate", "as-is", "motivated", "needs work"].some((k) => text.includes(k))) {
        reasons.push("Opportunity signal");
      }

      return { ...l, score, tag, reasons: reasons.slice(0, 3) };
    });

    rows.sort((a, b) => b.score - a.score);
    return rows;
  }, [bb, mockLeads]);

  const listForPlan = useMemo(() => {
    if (plan === "proof197") return scored.slice(0, 5);
    return scored.slice(0, 10);
  }, [plan, scored]);

  const workflows = useMemo(() => workflowSet(plan), [plan]);

  const caps = useMemo(() => {
    if (plan === "proof197") {
      return [
        { k: "Daily Delivery", v: "Top 5 opportunities" },
        { k: "Alerts", v: "Hot only (limited)" },
        { k: "Volume Caps", v: "Tight caps to keep costs predictable" },
        { k: "Tuning", v: "One tuning pass mid-week" },
      ];
    }
    if (plan === "monthly750") {
      return [
        { k: "Territory", v: "1 territory (ZIP set or radius)" },
        { k: "Daily Delivery", v: "Top 10 opportunities" },
        { k: "Alerts", v: "Hot only (moderate)" },
        { k: "Tuning", v: "Monthly tuning included" },
      ];
    }
    if (plan === "monthly1500") {
      return [
        { k: "Territory", v: "2 territories or expanded ZIP set" },
        { k: "Daily Delivery", v: "Top 10 + watchlist movement" },
        { k: "Alerts", v: "Hot + warm (higher cap)" },
        { k: "Tuning", v: "Weekly tuning included" },
      ];
    }
    return [
      { k: "Mode", v: "Demo mode (mock inputs)" },
      { k: "Outputs", v: "Queue, alerts preview, digest preview" },
      { k: "Goal", v: "Show how the system behaves" },
      { k: "Risk", v: "No dependency on live sources" },
    ];
  }, [plan]);

  const priceSummary = useMemo(() => {
    const setupLow = 2500;
    const setupHigh = 5000;
    const monthly = plan === "monthly1500" ? 1500 : plan === "monthly750" ? 750 : 0;
    const proof = plan === "proof197" ? 197 : 0;

    return {
      proof,
      setupLow,
      setupHigh,
      monthly,
    };
  }, [plan]);

  const accentGradient = useMemo(() => {
    return {
      background: `linear-gradient(135deg, ${BRAND.emerald} 0%, ${BRAND.emeraldDark} 60%, ${BRAND.charcoal} 100%)`,
    } as React.CSSProperties;
  }, []);

  const goldGlow = useMemo(() => {
    return {
      boxShadow: `0 0 0 1px rgba(244, 208, 63, 0.55), 0 10px 30px rgba(15, 23, 42, 0.15)`,
    } as React.CSSProperties;
  }, []);

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied.");
    } catch {
      alert("Copy failed.");
    }
  }

  const buyBoxSpecText = useMemo(() => {
    const z = parseZipList(bb.zips);
    return [
      `Plan: ${meta.label}`,
      `Territory: ${bb.territoryName}`,
      `Target: ${bb.targetAddress}`,
      `ZIPs: ${z.length ? z.join(", ") : "—"}`,
      `Radius: ${bb.radiusMiles} mi`,
      `Property Type: ${bb.propertyType}`,
      `Price: $${formatMoney(bb.priceMin)} - $${formatMoney(bb.priceMax)}`,
      `Beds: ${bb.bedsMin}-${bb.bedsMax}`,
      `Baths: ${bb.bathsMin}+`,
      `Max Distance: ${bb.maxDistanceMiles} mi`,
      `Keywords Include: ${bb.keywordsInclude || "—"}`,
      `Keywords Exclude: ${bb.keywordsExclude || "—"}`,
      `Hot Threshold: ${bb.hotThreshold}`,
      `Warm Threshold: ${bb.warmThreshold}`,
    ].join("\n");
  }, [bb, meta.label]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND.bg }}>
      {/* Top bar */}
      <div style={accentGradient} className="text-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm"
                   style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                <span className="font-semibold" style={{ color: BRAND.gold }}>AI</span>
                <span>Opportunity Intelligence</span>
                <span className="opacity-70">•</span>
                <span className="opacity-90">Territory-exclusive feed</span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Interactive Demo — Ranked Opportunity Feed
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/85">
                Configure a buy box, pick a plan, and preview what the deliverables look like.
                This page is built to demo cleanly on a Google Meet without relying on live scraping.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 md:items-end">
              <div className="inline-flex items-center gap-2 rounded-2xl px-4 py-2"
                   style={{ backgroundColor: "rgba(255,255,255,0.10)" }}>
                <span className="text-xs opacity-80">Selected:</span>
                <span className="font-semibold">{meta.label}</span>
                <span className="ml-2 rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={badgeStyle(BRAND.gold, BRAND.charcoal)}>
                  {meta.badge}
                </span>
              </div>
              <button
                onClick={() => copyText(buyBoxSpecText)}
                className="rounded-xl px-4 py-2 text-sm font-semibold"
                style={{
                  backgroundColor: BRAND.white,
                  color: BRAND.charcoal,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                }}
              >
                Copy Buy Box Spec
              </button>
            </div>
          </div>

          {/* Pipeline visual */}
          <div className="mt-7 grid gap-3 md:grid-cols-5">
            {[
              { t: "Sources", d: "Multiple inputs", i: "⛏" },
              { t: "Normalize", d: "Dedupe + enrich", i: "🧹" },
              { t: "Distance", d: "Target-fit", i: "📍" },
              { t: "Score", d: "Rank + tags", i: "🏷" },
              { t: "Deliver", d: "Queue + alerts", i: "🚀" },
            ].map((s, idx) => (
              <div
                key={s.t}
                className={cx(
                  "relative rounded-2xl border px-4 py-4",
                  idx === 3 ? "md:scale-[1.02]" : ""
                )}
                style={{
                  borderColor: "rgba(255,255,255,0.18)",
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs opacity-80">{s.d}</div>
                    <div className="mt-1 text-lg font-semibold">{s.t}</div>
                  </div>
                  <div className="text-2xl">{s.i}</div>
                </div>
                {idx < 4 && (
                  <div className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 md:block">
                    <div
                      className="h-8 w-8 rotate-45 rounded-md"
                      style={{ backgroundColor: "rgba(244,208,63,0.35)" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left: plan selection + workflow list */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl border bg-white p-5" style={{ borderColor: BRAND.border }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ color: BRAND.charcoal }}>
                  Pick the workflow
                </h2>
                <span className="rounded-full px-2 py-1 text-xs font-semibold"
                      style={badgeStyle("rgba(4,120,87,0.10)", BRAND.emerald)}>
                  4 JSON workflows
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                {(
                  [
                    { key: "demo", title: "Demo Workflow", sub: "Deterministic mock mode (always works)" },
                    { key: "proof197", title: "Proof Sprint — $197", sub: "Top 5 daily, tight caps" },
                    { key: "monthly750", title: "Monthly — $750", sub: "Solo territory, standard caps" },
                    { key: "monthly1500", title: "Monthly — $1,500", sub: "Team/high volume, higher caps" },
                  ] as Array<{ key: PlanKey; title: string; sub: string }>
                ).map((p) => {
                  const active = plan === p.key;
                  const m = planMeta(p.key);
                  return (
                    <button
                      key={p.key}
                      onClick={() => setPlan(p.key)}
                      className={cx(
                        "w-full rounded-2xl border px-4 py-3 text-left transition",
                        active ? "translate-y-[-1px]" : "hover:translate-y-[-1px]"
                      )}
                      style={{
                        borderColor: active ? "rgba(244,208,63,0.8)" : BRAND.border,
                        backgroundColor: active ? "rgba(244,208,63,0.10)" : BRAND.white,
                        boxShadow: active ? "0 12px 28px rgba(15,23,42,0.10)" : "none",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold" style={{ color: BRAND.charcoal }}>
                            {p.title}
                          </div>
                          <div className="mt-1 text-xs" style={{ color: BRAND.muted }}>
                            {p.sub}
                          </div>
                        </div>
                        <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                              style={badgeStyle(BRAND.emerald, BRAND.white)}>
                          {m.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: BRAND.border }}>
                <div className="text-xs font-semibold" style={{ color: BRAND.slate }}>
                  Selected outputs
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {meta.outputs.map((o) => (
                    <span
                      key={o}
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={badgeStyle("rgba(4,120,87,0.10)", BRAND.emeraldDark)}
                    >
                      {o}
                    </span>
                  ))}
                </div>

                <div className="mt-4 grid gap-2">
                  {caps.map((c) => (
                    <div key={c.k} className="flex items-start justify-between gap-3 text-sm">
                      <div className="font-semibold" style={{ color: BRAND.charcoal }}>
                        {c.k}
                      </div>
                      <div className="text-right" style={{ color: BRAND.muted }}>
                        {c.v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl px-4 py-4" style={{ backgroundColor: "rgba(2,6,23,0.04)" }}>
                <div className="text-xs font-semibold" style={{ color: BRAND.slate }}>
                  Pricing snapshot (front-end only)
                </div>
                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span style={{ color: BRAND.muted }}>Proof Sprint</span>
                    <span className="font-semibold" style={{ color: BRAND.charcoal }}>
                      {priceSummary.proof ? `$${priceSummary.proof}` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: BRAND.muted }}>Setup</span>
                    <span className="font-semibold" style={{ color: BRAND.charcoal }}>
                      ${formatMoney(priceSummary.setupLow)}–${formatMoney(priceSummary.setupHigh)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: BRAND.muted }}>Monthly</span>
                    <span className="font-semibold" style={{ color: BRAND.charcoal }}>
                      {priceSummary.monthly ? `$${formatMoney(priceSummary.monthly)}` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border bg-white p-5" style={{ borderColor: BRAND.border }}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{ color: BRAND.charcoal }}>
                  Workflow set (JSON)
                </h3>
                <button
                  onClick={() =>
                    copyText(
                      workflows
                        .map((w) => `${w.selected ? "✅ " : ""}${w.name} — ${w.note}`)
                        .join("\n")
                    )
                  }
                  className="rounded-xl px-3 py-2 text-xs font-semibold"
                  style={badgeStyle("rgba(4,120,87,0.10)", BRAND.emeraldDark)}
                >
                  Copy list
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                {workflows.map((w) => (
                  <div
                    key={w.name}
                    className="rounded-2xl border px-4 py-3"
                    style={{
                      borderColor: w.selected ? "rgba(244,208,63,0.8)" : BRAND.border,
                      backgroundColor: w.selected ? "rgba(244,208,63,0.08)" : BRAND.white,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold" style={{ color: BRAND.charcoal }}>
                          {w.name}
                        </div>
                        <div className="mt-1 text-xs" style={{ color: BRAND.muted }}>
                          {w.note}
                        </div>
                      </div>
                      {w.selected && (
                        <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                              style={badgeStyle(BRAND.gold, BRAND.charcoal)}>
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs leading-relaxed" style={{ color: BRAND.muted }}>
                This page is the front-end demo layer. The JSON workflows are separate artifacts you’ll generate and wire later.
              </div>
            </div>
          </div>

          {/* Right: Buy box config + outputs */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border bg-white p-6" style={{ borderColor: BRAND.border }}>
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: BRAND.charcoal }}>
                    Configure the buy box
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: BRAND.muted }}>
                    This is what the client configures. The workflow consumes this and produces a ranked feed.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: BRAND.muted }}>
                    Hot threshold
                  </span>
                  <div className="rounded-2xl border px-3 py-2 text-sm font-semibold"
                       style={{ borderColor: BRAND.border, color: BRAND.charcoal }}>
                    {bb.hotThreshold}+
                  </div>
                  <span className="rounded-full px-2 py-1 text-xs font-semibold"
                        style={badgeStyle("rgba(244,208,63,0.18)", BRAND.charcoal)}>
                    {plan === "proof197" ? "Top 5" : "Top 10"}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {/* Left column inputs */}
                <div className="space-y-4">
                  <Field label="Territory name">
                    <input
                      value={bb.territoryName}
                      onChange={(e) => setBb((p) => ({ ...p, territoryName: e.target.value }))}
                      className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                      style={{ borderColor: BRAND.border }}
                      placeholder="e.g., North Austin Core"
                    />
                  </Field>

                  <Field label="Target address (distance anchor)">
                    <input
                      value={bb.targetAddress}
                      onChange={(e) => setBb((p) => ({ ...p, targetAddress: e.target.value }))}
                      className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                      style={{ borderColor: BRAND.border }}
                      placeholder="e.g., 1100 Congress Ave, Austin, TX 78701"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="ZIPs (comma/space)">
                      <input
                        value={bb.zips}
                        onChange={(e) => setBb((p) => ({ ...p, zips: e.target.value }))}
                        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                        style={{ borderColor: BRAND.border }}
                        placeholder="78701, 78702..."
                      />
                      <div className="mt-1 text-xs" style={{ color: BRAND.muted }}>
                        Parsed: {parseZipList(bb.zips).length || 0}
                      </div>
                    </Field>

                    <Field label="Radius (miles)">
                      <input
                        type="number"
                        value={bb.radiusMiles}
                        min={1}
                        max={200}
                        onChange={(e) => setBb((p) => ({ ...p, radiusMiles: clamp(Number(e.target.value || 0), 1, 200) }))}
                        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                        style={{ borderColor: BRAND.border }}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Price min">
                      <input
                        type="number"
                        value={bb.priceMin}
                        min={0}
                        onChange={(e) => setBb((p) => ({ ...p, priceMin: Math.max(0, Number(e.target.value || 0)) }))}
                        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                        style={{ borderColor: BRAND.border }}
                      />
                    </Field>
                    <Field label="Price max">
                      <input
                        type="number"
                        value={bb.priceMax}
                        min={0}
                        onChange={(e) => setBb((p) => ({ ...p, priceMax: Math.max(0, Number(e.target.value || 0)) }))}
                        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                        style={{ borderColor: BRAND.border }}
                      />
                    </Field>
                  </div>
                </div>

                {/* Right column inputs */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Beds min">
                      <input
                        type="number"
                        value={bb.bedsMin}
                        min={0}
                        max={10}
                        onChange={(e) => setBb((p) => ({ ...p, bedsMin: clamp(Number(e.target.value || 0), 0, 10) }))}
                        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                        style={{ borderColor: BRAND.border }}
                      />
                    </Field>
                    <Field label="Beds max">
                      <input
                        type="number"
                        value={bb.bedsMax}
                        min={0}
                        max={15}
                        onChange={(e) => setBb((p) => ({ ...p, bedsMax: clamp(Number(e.target.value || 0), 0, 15) }))}
                        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                        style={{ borderColor: BRAND.border }}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Baths min">
                      <input
                        type="number"
                        step="0.5"
                        value={bb.bathsMin}
                        min={0}
                        max={10}
                        onChange={(e) => setBb((p) => ({ ...p, bathsMin: clamp(Number(e.target.value || 0), 0, 10) }))}
                        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                        style={{ borderColor: BRAND.border }}
                      />
                    </Field>
                    <Field label="Max distance (miles)">
                      <input
                        type="number"
                        value={bb.maxDistanceMiles}
                        min={1}
                        max={100}
                        onChange={(e) => setBb((p) => ({ ...p, maxDistanceMiles: clamp(Number(e.target.value || 0), 1, 100) }))}
                        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                        style={{ borderColor: BRAND.border }}
                      />
                    </Field>
                  </div>

                  <Field label="Property type">
                    <select
                      value={bb.propertyType}
                      onChange={(e) => setBb((p) => ({ ...p, propertyType: e.target.value as PropertyType }))}
                      className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                      style={{ borderColor: BRAND.border }}
                    >
                      {["Any", "Single Family", "Condo", "Townhome", "Multi-Family"].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Keywords include (comma separated)">
                    <textarea
                      value={bb.keywordsInclude}
                      onChange={(e) => setBb((p) => ({ ...p, keywordsInclude: e.target.value }))}
                      className="h-20 w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none"
                      style={{ borderColor: BRAND.border }}
                      placeholder="price drop, must sell, relocating…"
                    />
                  </Field>

                  <Field label="Keywords exclude (comma separated)">
                    <textarea
                      value={bb.keywordsExclude}
                      onChange={(e) => setBb((p) => ({ ...p, keywordsExclude: e.target.value }))}
                      className="h-20 w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none"
                      style={{ borderColor: BRAND.border }}
                      placeholder="no investors, firm price…"
                    />
                  </Field>

                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Warm threshold">
                      <input
                        type="number"
                        value={bb.warmThreshold}
                        min={1}
                        max={99}
                        onChange={(e) => setBb((p) => ({ ...p, warmThreshold: clamp(Number(e.target.value || 0), 1, 99) }))}
                        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                        style={{ borderColor: BRAND.border }}
                      />
                    </Field>
                    <Field label="Hot threshold">
                      <input
                        type="number"
                        value={bb.hotThreshold}
                        min={1}
                        max={100}
                        onChange={(e) => setBb((p) => ({ ...p, hotThreshold: clamp(Number(e.target.value || 0), 1, 100) }))}
                        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                        style={{ borderColor: BRAND.border }}
                      />
                    </Field>
                    <Field label="Alerts/day (cap)">
                      <input
                        type="number"
                        value={bb.alertsPerDay}
                        min={0}
                        max={25}
                        onChange={(e) => setBb((p) => ({ ...p, alertsPerDay: clamp(Number(e.target.value || 0), 0, 25) }))}
                        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                        style={{ borderColor: BRAND.border }}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-sm" style={{ color: BRAND.muted }}>
                  Output preview below updates instantly based on this configuration.
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => copyText(JSON.stringify(bb, null, 2))}
                    className="rounded-2xl px-4 py-2 text-sm font-semibold"
                    style={badgeStyle("rgba(4,120,87,0.10)", BRAND.emeraldDark)}
                  >
                    Copy JSON config
                  </button>
                  <button
                    onClick={() =>
                      setBb((p) => ({
                        ...p,
                        priceMin: 300000,
                        priceMax: 650000,
                        bedsMin: 3,
                        bedsMax: 4,
                        bathsMin: 2,
                        maxDistanceMiles: 12,
                        hotThreshold: 82,
                        warmThreshold: 62,
                      }))
                    }
                    className="rounded-2xl px-4 py-2 text-sm font-semibold"
                    style={badgeStyle("rgba(244,208,63,0.22)", BRAND.charcoal)}
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
                    className="rounded-2xl px-4 py-2 text-sm font-semibold"
                    style={badgeStyle("rgba(2,6,23,0.06)", BRAND.charcoal)}
                  >
                    Widen filters
                  </button>
                </div>
              </div>
            </div>

            {/* Deliverables */}
            <div className="mt-6 grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="rounded-3xl border bg-white p-6" style={{ borderColor: BRAND.border, ...goldGlow }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold" style={{ color: BRAND.muted }}>
                        Deliverables preview
                      </div>
                      <div className="mt-1 text-xl font-semibold" style={{ color: BRAND.charcoal }}>
                        What the client sees
                      </div>
                      <div className="mt-2 text-sm" style={{ color: BRAND.muted }}>
                        Cards below are the “feel” of the output: queue, alerts, digest, controls.
                      </div>
                    </div>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold"
                          style={badgeStyle(BRAND.emerald, BRAND.white)}>
                      {plan === "proof197" ? "Top 5 mode" : "Top 10 mode"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {deliverableCards(plan).map((c) => (
                      <div
                        key={c.title}
                        className="rounded-2xl border p-4"
                        style={{ borderColor: BRAND.border, backgroundColor: "rgba(2,6,23,0.02)" }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-semibold"
                            style={{ backgroundColor: "rgba(4,120,87,0.10)", color: BRAND.emeraldDark }}
                          >
                            {c.icon}
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: BRAND.charcoal }}>
                              {c.title}
                            </div>
                            <div className="mt-1 text-xs leading-relaxed" style={{ color: BRAND.muted }}>
                              {c.body}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: BRAND.border }}>
                    <div className="text-xs font-semibold" style={{ color: BRAND.muted }}>
                      Top criteria (plug-in list)
                    </div>

                    <div className="mt-3 grid gap-2">
                      {(plan === "proof197" ? top5 : top10).map((r) => (
                        <div key={r.key} className="flex items-start justify-between gap-3">
                          <div className="text-sm font-semibold" style={{ color: BRAND.charcoal }}>
                            {r.key}
                          </div>
                          <div className="text-sm text-right" style={{ color: BRAND.muted }}>
                            {r.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => copyText(JSON.stringify(plan === "proof197" ? top5 : top10, null, 2))}
                        className="rounded-2xl px-4 py-2 text-sm font-semibold"
                        style={badgeStyle("rgba(4,120,87,0.10)", BRAND.emeraldDark)}
                      >
                        Copy Top {plan === "proof197" ? "5" : "10"}
                      </button>
                      <button
                        onClick={() => copyText((plan === "proof197" ? top5 : top10).map((x) => `${x.key}: ${x.value}`).join("\n"))}
                        className="rounded-2xl px-4 py-2 text-sm font-semibold"
                        style={badgeStyle("rgba(2,6,23,0.06)", BRAND.charcoal)}
                      >
                        Copy as text
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Queue Preview */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl border bg-white p-6" style={{ borderColor: BRAND.border }}>
                  <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                      <div className="text-xs font-semibold" style={{ color: BRAND.muted }}>
                        Ranked queue preview
                      </div>
                      <div className="mt-1 text-xl font-semibold" style={{ color: BRAND.charcoal }}>
                        {plan === "proof197" ? "Top 5 (Proof Sprint)" : "Top 10 (Daily)"}
                      </div>
                      <div className="mt-1 text-sm" style={{ color: BRAND.muted }}>
                        This is what you screen-share on the call: clean, ranked, reason-coded.
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: BRAND.muted }}>
                        Alerts/day cap
                      </span>
                      <span className="rounded-2xl border px-3 py-2 text-sm font-semibold"
                            style={{ borderColor: BRAND.border, color: BRAND.charcoal }}>
                        {bb.alertsPerDay}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-2xl border" style={{ borderColor: BRAND.border }}>
                    <div className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-xs font-semibold"
                         style={{ borderColor: BRAND.border, color: BRAND.muted, backgroundColor: "rgba(2,6,23,0.02)" }}>
                      <div className="col-span-4">Address</div>
                      <div className="col-span-2">Price</div>
                      <div className="col-span-1">Beds</div>
                      <div className="col-span-1">Baths</div>
                      <div className="col-span-2">Distance</div>
                      <div className="col-span-2">Score</div>
                    </div>

                    {listForPlan.map((l) => (
                      <div key={l.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm" style={{ borderTop: `1px solid ${BRAND.border}` }}>
                        <div className="col-span-4">
                          <div className="font-semibold" style={{ color: BRAND.charcoal }}>
                            {l.address}
                          </div>
                          <div className="mt-1 text-xs" style={{ color: BRAND.muted }}>
                            {l.source.toUpperCase()} • {l.propertyType} • ZIP {l.zip}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {l.reasons.map((r) => (
                              <span key={r} className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                    style={badgeStyle("rgba(4,120,87,0.10)", BRAND.emeraldDark)}>
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="col-span-2 font-semibold" style={{ color: BRAND.charcoal }}>
                          ${formatMoney(l.price)}
                        </div>
                        <div className="col-span-1" style={{ color: BRAND.charcoal }}>
                          {l.beds}
                        </div>
                        <div className="col-span-1" style={{ color: BRAND.charcoal }}>
                          {l.baths}
                        </div>
                        <div className="col-span-2" style={{ color: BRAND.charcoal }}>
                          {l.distanceMiles.toFixed(1)} mi
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="rounded-full px-2 py-1 text-xs font-semibold"
                              style={
                                l.tag === "Hot"
                                  ? badgeStyle("rgba(244,208,63,0.35)", BRAND.charcoal)
                                  : l.tag === "Warm"
                                  ? badgeStyle("rgba(4,120,87,0.12)", BRAND.emeraldDark)
                                  : badgeStyle("rgba(2,6,23,0.06)", BRAND.slate)
                              }
                            >
                              {l.tag}
                            </span>
                            <span className="text-sm font-semibold" style={{ color: BRAND.charcoal }}>
                              {l.score}
                            </span>
                          </div>
                          <div className="mt-2 text-xs leading-relaxed" style={{ color: BRAND.muted }}>
                            {l.blurb}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => copyText(JSON.stringify(listForPlan, null, 2))}
                      className="rounded-2xl px-4 py-2 text-sm font-semibold"
                      style={badgeStyle("rgba(4,120,87,0.10)", BRAND.emeraldDark)}
                    >
                      Copy preview rows
                    </button>
                    <button
                      onClick={() =>
                        copyText(
                          listForPlan
                            .map((l) => `${l.tag} ${l.score} — ${l.address} — $${formatMoney(l.price)} — ${l.distanceMiles.toFixed(1)}mi`)
                            .join("\n")
                        )
                      }
                      className="rounded-2xl px-4 py-2 text-sm font-semibold"
                      style={badgeStyle("rgba(2,6,23,0.06)", BRAND.charcoal)}
                    >
                      Copy as plain text
                    </button>
                  </div>
                </div>

                {/* CTA + exclusivity blurb */}
                <div className="mt-6 rounded-3xl border bg-white p-6" style={{ borderColor: BRAND.border }}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-xs font-semibold" style={{ color: BRAND.muted }}>
                        Sales close
                      </div>
                      <div className="mt-1 text-xl font-semibold" style={{ color: BRAND.charcoal }}>
                        Proof Sprint → Build → Monthly
                      </div>
                      <div className="mt-2 text-sm leading-relaxed" style={{ color: BRAND.muted }}>
                        Pitch it as a territory-exclusive opportunity feed, not “lead gen.”
                        Territory should be defined as a ZIP set or radius, not “county.”
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full px-3 py-1 text-xs font-semibold"
                              style={badgeStyle("rgba(244,208,63,0.22)", BRAND.charcoal)}>
                          Proof Sprint: $197 (Top 5)
                        </span>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold"
                              style={badgeStyle("rgba(4,120,87,0.10)", BRAND.emeraldDark)}>
                          Setup: $2,500–$5,000
                        </span>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold"
                              style={badgeStyle("rgba(2,6,23,0.06)", BRAND.charcoal)}>
                          Monthly: $750–$1,500
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      <button
                        onClick={() => setPlan("proof197")}
                        className="rounded-2xl px-5 py-3 text-sm font-semibold"
                        style={{ backgroundColor: BRAND.emerald, color: BRAND.white }}
                      >
                        Switch to Proof Sprint view
                      </button>
                      <button
                        onClick={() =>
                          copyText(
                            [
                              "Proof Sprint Offer (copy/paste):",
                              "- $197 for 7 days (credited to setup if they move forward)",
                              "- Daily Top 5 ranked opportunities",
                              "- Hot alerts only (threshold-based)",
                              "- Airtable queue + daily digest",
                              "- One tuning pass mid-week",
                              "",
                              "Setup: $2,500–$5,000",
                              "Monthly: $750 (solo territory) or $1,500 (team/high volume)",
                            ].join("\n")
                          )
                        }
                        className="rounded-2xl px-5 py-3 text-sm font-semibold"
                        style={badgeStyle("rgba(244,208,63,0.22)", BRAND.charcoal)}
                      >
                        Copy offer script
                      </button>
                      <div className="text-xs" style={{ color: BRAND.muted }}>
                        Designed for screen-share clarity.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer spacer */}
            <div className="h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold" style={{ color: BRAND.muted }}>
        {props.label}
      </div>
      {props.children}
    </div>
  );
}