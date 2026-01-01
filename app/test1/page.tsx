"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * 10/10 DEMO PAGE
 * - Designed for screen-share: looks like a SaaS product, not a form.
 * - Deterministic demo leads (no scraping) so it NEVER fails live.
 * - Supports 4 workflow modes: Demo, $197 Proof, $750, $1500 (UI only here).
 * - Includes: Territory lock UI, pipeline run animation, toasts, lead drawer,
 *   filters, analytics, map preview, export/copy actions.
 */

type PlanKey = "demo" | "proof197" | "monthly750" | "monthly1500";
type SourceKey = "Newsletter" | "Marketplace" | "Web" | "Community";
type PropertyType = "Any" | "Single Family" | "Condo" | "Townhome" | "Multi-Family";
type TagKey = "Hot" | "Warm" | "Cold";

type BuyBoxPresetKey = "Balanced" | "Investor" | "Family" | "Luxury" | "Starter";

type BuyBox = {
  territoryName: string;
  countyOrArea: string;
  anchorAddress: string;

  zips: string;
  radiusMiles: number;

  propertyType: PropertyType;

  priceMin: number;
  priceMax: number;

  bedsMin: number;
  bedsMax: number;

  bathsMin: number;

  maxDistanceMiles: number;

  includeSignals: string; // comma separated
  excludeSignals: string; // comma separated

  hotThreshold: number;
  warmThreshold: number;

  dailyCapHotAlerts: number;
};

type Lead = {
  id: string;
  addressLine: string;
  cityState: string;
  zip: string;

  price: number;
  beds: number;
  baths: number;

  distanceMiles: number;

  propertyType: Exclude<PropertyType, "Any">;
  source: SourceKey;

  blurb: string;

  lat: number;
  lng: number;

  createdAtIso: string;
};

type ScoredLead = Lead & {
  score: number;
  tag: TagKey;
  reasons: string[];
  confidence: number; // 0-100 (demo heuristic)
};

type Toast = {
  id: string;
  title: string;
  message: string;
  tone: "success" | "warn" | "info";
};

const BRAND = {
  emerald: "#047857",
  emerald2: "#10B981",
  gold: "#F4D03F",
  ink: "#0B1220",
  panel: "rgba(255,255,255,0.055)",
  panel2: "rgba(255,255,255,0.035)",
  stroke: "rgba(255,255,255,0.12)",
  stroke2: "rgba(255,255,255,0.18)",
  text: "rgba(255,255,255,0.92)",
  sub: "rgba(255,255,255,0.68)",
  dim: "rgba(255,255,255,0.54)",
};

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function money(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

function parseZipList(s: string): string[] {
  return s
    .split(/[,\s]+/g)
    .map((x) => x.trim().replace(/[^\d]/g, ""))
    .filter((x) => x.length === 5);
}

function pick<T>(arr: T[], seed: number) {
  return arr[Math.abs(seed) % arr.length];
}

function seeded(seed: number) {
  // deterministic pseudo-random 0..1 based on seed
  const x = Math.sin(seed * 9999.123) * 10000;
  return x - Math.floor(x);
}

function id(prefix: string, seed: number) {
  return `${prefix}-${seed.toString(36).toUpperCase()}-${Math.floor(seeded(seed + 7) * 9999)
    .toString()
    .padStart(4, "0")}`;
}

function planMeta(plan: PlanKey) {
  switch (plan) {
    case "demo":
      return { name: "Demo Workflow", badge: "Preview", topN: 10, watchlist: false, caps: "Mock run • Always stable" };
    case "proof197":
      return { name: "Proof Sprint (7 days)", badge: "$197", topN: 5, watchlist: false, caps: "Tight caps • Top 5 daily" };
    case "monthly750":
      return { name: "Monthly Solo Territory", badge: "$750/mo", topN: 10, watchlist: false, caps: "Standard caps • Solo" };
    case "monthly1500":
      return { name: "Monthly Team / High Volume", badge: "$1,500/mo", topN: 10, watchlist: true, caps: "Higher caps • Watchlist" };
  }
}

function preset(name: BuyBoxPresetKey): Partial<BuyBox> {
  switch (name) {
    case "Balanced":
      return {
        priceMin: 350000,
        priceMax: 750000,
        bedsMin: 3,
        bedsMax: 5,
        bathsMin: 2,
        maxDistanceMiles: 15,
        includeSignals: "price drop, relocating, estate, as-is, quick close",
        excludeSignals: "no investors, firm price, do not contact",
        hotThreshold: 82,
        warmThreshold: 62,
        dailyCapHotAlerts: 3,
        propertyType: "Any",
      };
    case "Investor":
      return {
        priceMin: 250000,
        priceMax: 650000,
        bedsMin: 2,
        bedsMax: 6,
        bathsMin: 1,
        maxDistanceMiles: 20,
        includeSignals: "as-is, needs work, investor, cash only, price drop, distress",
        excludeSignals: "no investors, firm price",
        hotThreshold: 78,
        warmThreshold: 58,
        dailyCapHotAlerts: 5,
        propertyType: "Any",
      };
    case "Family":
      return {
        priceMin: 450000,
        priceMax: 950000,
        bedsMin: 3,
        bedsMax: 5,
        bathsMin: 2,
        maxDistanceMiles: 12,
        includeSignals: "school, quiet, renovated, move-in, yard",
        excludeSignals: "cash only, needs work, as-is",
        hotThreshold: 84,
        warmThreshold: 64,
        dailyCapHotAlerts: 2,
        propertyType: "Single Family",
      };
    case "Luxury":
      return {
        priceMin: 900000,
        priceMax: 2500000,
        bedsMin: 4,
        bedsMax: 7,
        bathsMin: 3,
        maxDistanceMiles: 18,
        includeSignals: "pool, views, gated, new build, designer",
        excludeSignals: "needs work, as-is, cash only",
        hotThreshold: 86,
        warmThreshold: 66,
        dailyCapHotAlerts: 2,
        propertyType: "Single Family",
      };
    case "Starter":
      return {
        priceMin: 200000,
        priceMax: 450000,
        bedsMin: 2,
        bedsMax: 4,
        bathsMin: 1,
        maxDistanceMiles: 18,
        includeSignals: "price drop, first time, updated, quick close",
        excludeSignals: "firm price, do not contact",
        hotThreshold: 80,
        warmThreshold: 60,
        dailyCapHotAlerts: 3,
        propertyType: "Any",
      };
  }
}

function buildDemoUniverse(bb: BuyBox): Lead[] {
  const zips = parseZipList(bb.zips);
  const baseZip = zips.length ? zips : ["78701", "78702", "78703", "78704"];

  // Fake lat/lng near Austin-ish (demo)
  const baseLat = 30.2672;
  const baseLng = -97.7431;

  const types: Array<Exclude<PropertyType, "Any">> = ["Single Family", "Condo", "Townhome", "Multi-Family"];
  const sources: SourceKey[] = ["Newsletter", "Marketplace", "Web", "Community"];

  const blurbs = [
    "Price drop this week. Seller mentioned timeline pressure. As-is language present.",
    "Relocating for work. Quick close preferred. Limited showings.",
    "Estate situation. Cosmetic updates. Negotiable on terms.",
    "Renovated with premium finishes. Strong comps; less urgency.",
    "Needs work. Cash only noted. Investor language appears.",
    "Open to concessions. Job change. Wants faster closing.",
    "Firm price stated. No investors. Restrictions on contact.",
    "As-is. Motivated wording. Limited viewing windows.",
    "Income potential. Deferred maintenance. Investor mention.",
    "Recently updated. Walkable. Flexible on close date.",
  ];

  const now = Date.now();
  const leads: Lead[] = [];

  // Make a realistic volume range
  const total = 60;

  for (let i = 0; i < total; i++) {
    const seed = i + 11;
    const zip = pick(baseZip, seed);
    const t = pick(types, seed + 3);
    const s = pick(sources, seed + 5);

    const priceBandMin = Math.max(120000, bb.priceMin * (0.75 + seeded(seed + 1) * 0.5));
    const priceBandMax = bb.priceMax * (0.8 + seeded(seed + 2) * 0.6);
    const price = Math.round(clamp(priceBandMin + seeded(seed + 9) * (priceBandMax - priceBandMin), 120000, 3500000));

    const beds = clamp(Math.round(1 + seeded(seed + 7) * 6), 1, 7);
    const baths = clamp(Math.round((1 + seeded(seed + 8) * 4) * 2) / 2, 1, 5);

    const dist = Math.round((1 + seeded(seed + 4) * 28) * 10) / 10;

    const lat = baseLat + (seeded(seed + 12) - 0.5) * 0.22;
    const lng = baseLng + (seeded(seed + 13) - 0.5) * 0.22;

    const addrNum = 100 + Math.floor(seeded(seed + 14) * 8900);
    const street = pick(
      ["Congress", "Lamar", "Riverside", "Oltorf", "Burnet", "Manor", "MLK", "Speedway", "Brazos", "Guadalupe", "South 1st", "South Lamar"],
      seed + 20
    );
    const suffix = pick(["St", "Ave", "Blvd", "Dr", "Rd", "Ln"], seed + 21);

    const cityState = "Austin, TX";
    const addressLine =
      seeded(seed + 15) > 0.78
        ? `${addrNum} ${street} ${suffix} #${Math.floor(seeded(seed + 16) * 40) + 1}`
        : `${addrNum} ${street} ${suffix}`;

    const createdAtIso = new Date(now - (Math.floor(seeded(seed + 10) * 72) * 60 * 60 * 1000)).toISOString();

    leads.push({
      id: id("LEAD", seed),
      addressLine,
      cityState,
      zip,
      price,
      beds,
      baths,
      distanceMiles: dist,
      propertyType: t,
      source: s,
      blurb: pick(blurbs, seed + 30),
      lat,
      lng,
      createdAtIso,
    });
  }

  return leads;
}

function scoreLead(bb: BuyBox, lead: Lead): { score: number; reasons: string[]; confidence: number } {
  // No “motivated seller guarantee”. This is fit + signals + constraints.
  let score = 50;
  const reasons: string[] = [];

  const inPrice = lead.price >= bb.priceMin && lead.price <= bb.priceMax;
  score += inPrice ? 18 : -14;
  if (inPrice) reasons.push("Price fit");

  const bedsFit = lead.beds >= bb.bedsMin && lead.beds <= bb.bedsMax;
  score += bedsFit ? 12 : -10;
  if (bedsFit) reasons.push("Beds fit");

  const bathsFit = lead.baths >= bb.bathsMin;
  score += bathsFit ? 8 : -7;
  if (bathsFit) reasons.push("Baths fit");

  const distFit = lead.distanceMiles <= bb.maxDistanceMiles;
  score += distFit ? 16 : -18;
  if (distFit) reasons.push("Distance fit");

  const typeFit = bb.propertyType === "Any" || lead.propertyType === bb.propertyType;
  score += typeFit ? 8 : -8;
  if (typeFit && bb.propertyType !== "Any") reasons.push("Type match");

  const include = bb.includeSignals
    .split(/[,\n]+/g)
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);

  const exclude = bb.excludeSignals
    .split(/[,\n]+/g)
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);

  const text = `${lead.blurb} ${lead.source}`.toLowerCase();

  let includeHit = 0;
  for (const k of include) if (text.includes(k)) includeHit++;
  if (include.length) {
    const boost = clamp(includeHit * 4, 0, 14);
    score += boost;
    if (includeHit > 0) reasons.push("Signal hit");
    if (includeHit >= 2) reasons.push("Multiple signals");
  }

  let excludeHit = 0;
  for (const k of exclude) if (text.includes(k)) excludeHit++;
  if (excludeHit > 0) {
    score -= clamp(excludeHit * 10, 10, 24);
    reasons.push("Restriction hit");
  }

  // Source weighting (demo)
  if (lead.source === "Community") score += 4, reasons.push("Local signal");
  if (lead.source === "Marketplace") score += 2;
  if (lead.source === "Newsletter") score += 1;
  if (lead.source === "Web") score += 0;

  score = clamp(Math.round(score), 1, 100);

  // Confidence is *not truth*; it’s a proxy for completeness of fields
  let conf = 55;
  if (lead.price > 0) conf += 10;
  if (lead.beds > 0 && lead.baths > 0) conf += 10;
  if (lead.distanceMiles > 0) conf += 10;
  conf += clamp(includeHit * 4, 0, 10);
  conf -= clamp(excludeHit * 6, 0, 12);
  conf = clamp(Math.round(conf), 0, 100);

  return { score, reasons: Array.from(new Set(reasons)).slice(0, 3), confidence: conf };
}

function tagFor(bb: BuyBox, score: number): TagKey {
  if (score >= bb.hotThreshold) return "Hot";
  if (score >= bb.warmThreshold) return "Warm";
  return "Cold";
}

function toneForTag(tag: TagKey) {
  if (tag === "Hot") return { bg: "rgba(244,208,63,0.14)", br: "rgba(244,208,63,0.35)" };
  if (tag === "Warm") return { bg: "rgba(16,185,129,0.12)", br: "rgba(16,185,129,0.30)" };
  return { bg: "rgba(255,255,255,0.05)", br: "rgba(255,255,255,0.12)" };
}

function minutesAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.max(0, Math.floor(ms / 60000));
  if (m < 1) return "just now";
  if (m === 1) return "1 min ago";
  if (m < 60) return `${m} mins ago`;
  const h = Math.floor(m / 60);
  return h === 1 ? "1 hr ago" : `${h} hrs ago`;
}

function safeCopy(text: string) {
  return navigator.clipboard?.writeText(text).catch(() => {});
}

function Sparkline({ data }: { data: number[] }) {
  const w = 140;
  const h = 42;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const xs = data.map((_, i) => (i / (data.length - 1)) * w);
  const ys = data.map((v) => h - ((v - min) / Math.max(1, max - min)) * h);
  const d = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke="rgba(244,208,63,0.65)" strokeWidth="2.2" strokeLinecap="round" />
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill="rgba(244,208,63,0.08)" stroke="none" />
    </svg>
  );
}

function Donut({ hot, warm, cold }: { hot: number; warm: number; cold: number }) {
  const total = Math.max(1, hot + warm + cold);
  const r = 18;
  const c = 2 * Math.PI * r;

  const aHot = (hot / total) * c;
  const aWarm = (warm / total) * c;
  const aCold = c - aHot - aWarm;

  return (
    <svg width={70} height={70} viewBox="0 0 70 70">
      <g transform="translate(35,35)">
        <circle r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="8" />
        <circle
          r={r}
          fill="none"
          stroke="rgba(244,208,63,0.70)"
          strokeWidth="8"
          strokeDasharray={`${aHot} ${c - aHot}`}
          strokeDashoffset={0}
          transform="rotate(-90)"
          strokeLinecap="round"
        />
        <circle
          r={r}
          fill="none"
          stroke="rgba(16,185,129,0.65)"
          strokeWidth="8"
          strokeDasharray={`${aWarm} ${c - aWarm}`}
          strokeDashoffset={-aHot}
          transform="rotate(-90)"
          strokeLinecap="round"
        />
        <circle
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="8"
          strokeDasharray={`${aCold} ${c - aCold}`}
          strokeDashoffset={-(aHot + aWarm)}
          transform="rotate(-90)"
          strokeLinecap="round"
        />
      </g>
      <text x="35" y="38" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.82)" fontWeight="700">
        {total}
      </text>
      <text x="35" y="52" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.55)">
        leads
      </text>
    </svg>
  );
}

function MiniMap({ lead, anchorLabel }: { lead?: ScoredLead | null; anchorLabel: string }) {
  // Fake map: grid + pins. Still reads as a “map widget” in demo.
  const w = 420;
  const h = 260;
  const pinX = lead ? 40 + (Math.abs(lead.lat) % 1) * (w - 80) : w * 0.58;
  const pinY = lead ? 35 + (Math.abs(lead.lng) % 1) * (h - 70) : h * 0.48;

  const anchorX = w * 0.55;
  const anchorY = h * 0.52;

  const t = lead ? toneForTag(lead.tag) : null;

  return (
    <div
      className="rounded-3xl p-4"
      style={{
        background: `linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))`,
        border: `1px solid ${BRAND.stroke}`,
        boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold" style={{ color: BRAND.sub }}>
            Map Preview
          </div>
          <div className="mt-1 text-sm font-semibold" style={{ color: BRAND.text }}>
            Anchor: {anchorLabel.split(",")[0]}
          </div>
        </div>
        <div className="text-xs font-semibold" style={{ color: BRAND.dim }}>
          Demo widget
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl" style={{ border: `1px solid ${BRAND.stroke}` }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="gridGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(16,185,129,0.14)" />
              <stop offset="60%" stopColor="rgba(244,208,63,0.10)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width={w} height={h} fill="url(#gridGlow)" />
          {/* Grid */}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`v-${i}`} x1={(i / 9) * w} y1={0} x2={(i / 9) * w} y2={h} stroke="rgba(255,255,255,0.07)" />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`h-${i}`} x1={0} y1={(i / 6) * h} x2={w} y2={(i / 6) * h} stroke="rgba(255,255,255,0.07)" />
          ))}

          {/* “Roads” */}
          <path d={`M 0 ${h * 0.62} C ${w * 0.25} ${h * 0.50}, ${w * 0.55} ${h * 0.78}, ${w} ${h * 0.55}`} stroke="rgba(255,255,255,0.10)" strokeWidth="3" fill="none" />
          <path d={`M ${w * 0.15} 0 C ${w * 0.30} ${h * 0.25}, ${w * 0.65} ${h * 0.35}, ${w * 0.85} ${h}`} stroke="rgba(255,255,255,0.10)" strokeWidth="3" fill="none" />

          {/* Anchor pin */}
          <circle cx={anchorX} cy={anchorY} r="10" fill="rgba(16,185,129,0.35)" stroke="rgba(16,185,129,0.65)" strokeWidth="2" />
          <circle cx={anchorX} cy={anchorY} r="3" fill="rgba(255,255,255,0.9)" />
          <text x={anchorX + 14} y={anchorY + 4} fontSize="10" fill="rgba(255,255,255,0.70)">
            anchor
          </text>

          {/* Lead pin */}
          {lead && (
            <>
              <circle cx={pinX} cy={pinY} r="12" fill={t?.bg || "rgba(244,208,63,0.20)"} stroke={t?.br || "rgba(244,208,63,0.40)"} strokeWidth="2" />
              <circle cx={pinX} cy={pinY} r="3.5" fill="rgba(255,255,255,0.95)" />
              <path
                d={`M ${anchorX} ${anchorY} L ${pinX} ${pinY}`}
                stroke={lead.tag === "Hot" ? "rgba(244,208,63,0.65)" : lead.tag === "Warm" ? "rgba(16,185,129,0.60)" : "rgba(255,255,255,0.18)"}
                strokeWidth="2"
                strokeDasharray="5 6"
              />
            </>
          )}
        </svg>
      </div>

      <div className="mt-3 text-xs" style={{ color: BRAND.sub }}>
        {lead ? (
          <>
            Selected: <span style={{ color: BRAND.text, fontWeight: 700 }}>{lead.addressLine}</span> • {lead.distanceMiles.toFixed(1)} mi from anchor
          </>
        ) : (
          <>Select a lead to preview distance + path.</>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold" style={{ color: BRAND.sub }}>
        {label}
      </div>
      {children}
      {hint ? (
        <div className="mt-2 text-[11px]" style={{ color: BRAND.dim }}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export default function Page() {
  const [plan, setPlan] = useState<PlanKey>("demo");
  const meta = planMeta(plan);

  const [territoryLocked, setTerritoryLocked] = useState(false);
  const [territoryKey, setTerritoryKey] = useState("TX-TRAVIS-78701-CORE");

  const [presetKey, setPresetKey] = useState<BuyBoxPresetKey>("Balanced");

  const [bb, setBb] = useState<BuyBox>({
    territoryName: "Austin Core",
    countyOrArea: "Travis County",
    anchorAddress: "1100 Congress Ave, Austin, TX 78701",
    zips: "78701, 78702, 78703, 78704",
    radiusMiles: 25,

    propertyType: "Any",

    priceMin: 350000,
    priceMax: 750000,

    bedsMin: 3,
    bedsMax: 5,

    bathsMin: 2,

    maxDistanceMiles: 15,

    includeSignals: "price drop, relocating, estate, as-is, quick close",
    excludeSignals: "no investors, firm price, do not contact",

    hotThreshold: 82,
    warmThreshold: 62,

    dailyCapHotAlerts: 3,
  });

  // Apply preset
  useEffect(() => {
    const p = preset(presetKey);
    setBb((prev) => ({ ...prev, ...p }));
  }, [presetKey]);

  const universe = useMemo(() => buildDemoUniverse(bb), [bb.zips, bb.priceMin, bb.priceMax, bb.bedsMin, bb.bedsMax, bb.bathsMin, bb.maxDistanceMiles, bb.propertyType, bb.includeSignals, bb.excludeSignals]);

  const scored = useMemo<ScoredLead[]>(() => {
    const rows = universe.map((l) => {
      const s = scoreLead(bb, l);
      const tg = tagFor(bb, s.score);
      return { ...l, score: s.score, tag: tg, reasons: s.reasons, confidence: s.confidence };
    });
    rows.sort((a, b) => b.score - a.score);
    return rows;
  }, [universe, bb]);

  // Filters
  const [q, setQ] = useState("");
  const [tagFilter, setTagFilter] = useState<TagKey | "All">("All");
  const [sourceFilter, setSourceFilter] = useState<SourceKey | "All">("All");
  const [onlyWithinDistance, setOnlyWithinDistance] = useState(true);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return scored.filter((r) => {
      if (tagFilter !== "All" && r.tag !== tagFilter) return false;
      if (sourceFilter !== "All" && r.source !== sourceFilter) return false;
      if (onlyWithinDistance && r.distanceMiles > bb.maxDistanceMiles) return false;
      if (!qq) return true;
      const blob = `${r.addressLine} ${r.cityState} ${r.zip} ${r.source} ${r.propertyType} ${r.blurb}`.toLowerCase();
      return blob.includes(qq);
    });
  }, [scored, q, tagFilter, sourceFilter, onlyWithinDistance, bb.maxDistanceMiles]);

  const topN = useMemo(() => filtered.slice(0, meta.topN), [filtered, meta.topN]);

  const counts = useMemo(() => {
    let hot = 0,
      warm = 0,
      cold = 0;
    for (const r of filtered) {
      if (r.tag === "Hot") hot++;
      else if (r.tag === "Warm") warm++;
      else cold++;
    }
    return { hot, warm, cold, total: filtered.length };
  }, [filtered]);

  // Analytics (demo trends)
  const trend = useMemo(() => {
    // build a fake 14-day sparkline derived from current distribution
    const base = Math.max(10, Math.min(95, 40 + counts.hot * 2 - counts.cold));
    const data = Array.from({ length: 14 }).map((_, i) => clamp(base + Math.round((seeded(i + counts.total + 33) - 0.5) * 20), 10, 95));
    return data;
  }, [counts.total, counts.hot, counts.cold]);

  // Drawer
  const [selected, setSelected] = useState<ScoredLead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openLead(r: ScoredLead) {
    setSelected(r);
    setDrawerOpen(true);
  }

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  function pushToast(t: Omit<Toast, "id">) {
    const tid = `T-${Math.random().toString(36).slice(2, 9)}`;
    const toast: Toast = { id: tid, ...t };
    setToasts((p) => [toast, ...p].slice(0, 4));
    window.setTimeout(() => {
      setToasts((p) => p.filter((x) => x.id !== tid));
    }, 4200);
  }

  // Pipeline run sim
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<"Idle" | "Ingest" | "Normalize" | "Distance" | "Score" | "Deliver">("Idle");
  const [liveFeed, setLiveFeed] = useState<ScoredLead[]>([]);
  const runTimer = useRef<number | null>(null);

  function stopRun() {
    if (runTimer.current) window.clearInterval(runTimer.current);
    runTimer.current = null;
    setRunning(false);
    setProgress(0);
    setStep("Idle");
  }

  function runDemo() {
    // Always deterministic and clean.
    stopRun();
    setRunning(true);
    setProgress(0);
    setStep("Ingest");
    setLiveFeed([]);

    // staged insertion so it feels “live”
    const batch = [...topN].sort((a, b) => b.score - a.score);
    let idx = 0;
    let p = 0;

    pushToast({ title: "Pipeline started", message: "Running ingest → score → deliver", tone: "info" });

    runTimer.current = window.setInterval(() => {
      p += 3 + seeded(p + 17) * 6;
      p = clamp(p, 0, 100);
      setProgress(p);

      if (p < 20) setStep("Ingest");
      else if (p < 40) setStep("Normalize");
      else if (p < 60) setStep("Distance");
      else if (p < 82) setStep("Score");
      else setStep("Deliver");

      // emit rows
      const shouldEmit = p > 22 && idx < batch.length && seeded(idx + Math.floor(p)) > 0.35;
      if (shouldEmit) {
        const r = batch[idx];
        idx++;
        setLiveFeed((prev) => [r, ...prev].slice(0, meta.topN));

        if (r.tag === "Hot") {
          pushToast({
            title: `HOT (${r.score})`,
            message: `${r.addressLine.split(",")[0]} • $${money(r.price)} • ${r.distanceMiles.toFixed(1)} mi`,
            tone: "warn",
          });
        }
      }

      if (p >= 100) {
        window.setTimeout(() => {
          setRunning(false);
          setStep("Deliver");
          pushToast({ title: "Delivery complete", message: `Top ${meta.topN} queued + alerts capped`, tone: "success" });

          // settle to idle after a moment
          window.setTimeout(() => {
            setStep("Idle");
            setProgress(0);
          }, 900);
        }, 220);

        if (runTimer.current) window.clearInterval(runTimer.current);
        runTimer.current = null;
      }
    }, 120);
  }

  useEffect(() => {
    return () => {
      if (runTimer.current) window.clearInterval(runTimer.current);
    };
  }, []);

  // Export payloads
  const config = useMemo(() => ({ plan, territoryKey, territoryLocked, presetKey, buyBox: bb }), [plan, territoryKey, territoryLocked, presetKey, bb]);

  const deliverablePreview = useMemo(() => {
    // "What the realtor gets" style payload
    const rows = (liveFeed.length ? liveFeed : topN).slice(0, meta.topN);
    return rows.map((r) => ({
      tag: r.tag,
      score: r.score,
      confidence: r.confidence,
      address: `${r.addressLine}, ${r.cityState} ${r.zip}`,
      price: r.price,
      beds: r.beds,
      baths: r.baths,
      distanceMiles: r.distanceMiles,
      source: r.source,
      reasons: r.reasons,
      summary: r.blurb,
      mapLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.addressLine}, ${r.cityState} ${r.zip}`)}`,
    }));
  }, [liveFeed, topN, meta.topN]);

  const hotAlerts = useMemo(() => {
    const cap = bb.dailyCapHotAlerts;
    const rows = (liveFeed.length ? liveFeed : topN).filter((r) => r.tag === "Hot").slice(0, cap);
    return rows;
  }, [liveFeed, topN, bb.dailyCapHotAlerts]);

  const exclusivityText = territoryLocked
    ? `Reserved • ${territoryKey}`
    : `Not reserved • ${territoryKey}`;

  const headerKpi = useMemo(() => {
    const avgScore = filtered.length ? Math.round(filtered.reduce((a, b) => a + b.score, 0) / filtered.length) : 0;
    const hotRate = filtered.length ? Math.round((counts.hot / filtered.length) * 100) : 0;
    return { avgScore, hotRate };
  }, [filtered, counts.hot]);

  // Visual tokens
  const tagPill = (tag: TagKey) => {
    const t = toneForTag(tag);
    return { background: t.bg, border: `1px solid ${t.br}`, color: BRAND.text };
  };

  return (
    <div className="min-h-screen" style={{ background: BRAND.ink }}>
      {/* Global styles / keyframes */}
      <style jsx global>{`
        .glass {
          background: linear-gradient(180deg, ${BRAND.panel} 0%, ${BRAND.panel2} 100%);
          border: 1px solid ${BRAND.stroke};
          box-shadow: 0 24px 80px rgba(0,0,0,0.42);
          backdrop-filter: blur(10px);
        }
        .glow-border {
          position: relative;
        }
        .glow-border:before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 24px;
          padding: 1px;
          background: linear-gradient(
            135deg,
            rgba(16,185,129,0.55),
            rgba(244,208,63,0.35),
            rgba(255,255,255,0.10)
          );
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0.55;
        }
        .shine {
          position: relative;
          overflow: hidden;
        }
        .shine:after {
          content: "";
          position: absolute;
          top: -60%;
          left: -40%;
          width: 80%;
          height: 220%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent);
          animation: sweep 4.2s infinite;
          opacity: 0.55;
        }
        @keyframes sweep {
          0% { transform: translateX(-30%) rotate(18deg); }
          60% { transform: translateX(170%) rotate(18deg); }
          100% { transform: translateX(170%) rotate(18deg); }
        }
        .bg-orb {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.75;
          background:
            radial-gradient(900px 520px at 18% 10%, rgba(16,185,129,0.30), transparent 60%),
            radial-gradient(780px 560px at 82% 18%, rgba(244,208,63,0.22), transparent 58%),
            radial-gradient(1000px 650px at 50% 92%, rgba(255,255,255,0.10), transparent 60%);
          filter: saturate(120%);
        }
        .btn {
          border-radius: 18px;
          padding: 12px 14px;
          font-weight: 700;
          font-size: 13px;
          transition: transform .12s ease, filter .12s ease, background .12s ease;
          user-select: none;
        }
        .btn:active { transform: translateY(1px) scale(0.99); }
        .btnPrimary {
          background: linear-gradient(135deg, ${BRAND.emerald} 0%, rgba(16,185,129,0.92) 55%, rgba(244,208,63,0.24) 100%);
          color: rgba(255,255,255,0.96);
          box-shadow: 0 18px 44px rgba(0,0,0,0.35);
          border: 1px solid rgba(16,185,129,0.35);
        }
        .btnGhost {
          background: rgba(255,255,255,0.06);
          border: 1px solid ${BRAND.stroke};
          color: rgba(255,255,255,0.90);
        }
        .chip {
          border-radius: 999px;
          padding: 6px 10px;
          font-weight: 800;
          font-size: 11px;
          border: 1px solid ${BRAND.stroke};
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.84);
          white-space: nowrap;
        }
        .mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
      `}</style>

      <div className="bg-orb" />

      {/* Top Nav */}
      <div className="relative mx-auto max-w-7xl px-4 pt-6">
        <div className="glass glow-border shine flex flex-col gap-4 rounded-3xl p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: "rgba(244,208,63,0.16)", border: "1px solid rgba(244,208,63,0.28)" }}>
              <span className="text-lg" style={{ color: BRAND.text }}>✦</span>
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight" style={{ color: BRAND.text }}>
                Territory Opportunity Console
              </div>
              <div className="mt-1 text-xs" style={{ color: BRAND.sub }}>
                Buy Box → Ranked Feed → Hot Alerts (capped) → Weekly/Monthly delivery
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="chip" style={{ borderColor: territoryLocked ? "rgba(244,208,63,0.42)" : BRAND.stroke, background: territoryLocked ? "rgba(244,208,63,0.10)" : "rgba(255,255,255,0.06)" }}>
                  {territoryLocked ? "Territory Reserved" : "Territory Available"}
                </span>
                <span className="chip mono">{exclusivityText}</span>
                <span className="chip" style={{ borderColor: "rgba(16,185,129,0.30)", background: "rgba(16,185,129,0.10)" }}>
                  Avg Score {headerKpi.avgScore}
                </span>
                <span className="chip" style={{ borderColor: "rgba(244,208,63,0.28)", background: "rgba(244,208,63,0.10)" }}>
                  Hot Rate {headerKpi.hotRate}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 md:min-w-[420px] md:items-end">
            <div className="flex w-full gap-2">
              <div className="flex-1">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search address / zip / notes…"
                  className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                />
              </div>
              <button className={cx("btn btnPrimary")} onClick={runDemo} disabled={running} style={{ filter: running ? "grayscale(0.4) brightness(0.9)" : "none" }}>
                {running ? `Running • ${step}` : "Run Demo"}
              </button>
              <button className={cx("btn btnGhost")} onClick={() => safeCopy(JSON.stringify(config, null, 2))}>
                Copy Config
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs" style={{ color: BRAND.sub }}>
              <div className="flex items-center gap-2">
                <span className="mono">{meta.name}</span>
                <span className="chip" style={{ borderColor: "rgba(244,208,63,0.35)", background: "rgba(244,208,63,0.10)" }}>
                  {meta.badge}
                </span>
                <span className="chip" style={{ borderColor: "rgba(255,255,255,0.14)" }}>
                  {meta.caps}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ background: running ? "rgba(244,208,63,0.85)" : "rgba(16,185,129,0.55)" }} />
                <span>{running ? "Live run" : "Ready"}</span>
              </div>
            </div>

            {/* progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${running ? progress : 0}%`,
                  transition: "width 120ms ease",
                  background: `linear-gradient(90deg, ${BRAND.emerald2} 0%, ${BRAND.gold} 65%, rgba(255,255,255,0.25) 100%)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold" style={{ color: BRAND.text }}>
                  Workflows
                </div>
                <span className="chip" style={{ background: "rgba(255,255,255,0.05)" }}>
                  4 modes
                </span>
              </div>

              <div className="mt-4 grid gap-2">
                {(
                  [
                    { k: "demo", t: "Demo Workflow", d: "Always stable preview" },
                    { k: "proof197", t: "$197 Proof Sprint", d: "Top 5 daily" },
                    { k: "monthly750", t: "$750 Monthly", d: "Solo territory" },
                    { k: "monthly1500", t: "$1,500 Monthly", d: "High volume + watchlist" },
                  ] as Array<{ k: PlanKey; t: string; d: string }>
                ).map((x) => {
                  const active = plan === x.k;
                  return (
                    <button
                      key={x.k}
                      onClick={() => setPlan(x.k)}
                      className="w-full rounded-2xl px-4 py-3 text-left"
                      style={{
                        background: active ? "rgba(244,208,63,0.10)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${active ? "rgba(244,208,63,0.35)" : BRAND.stroke}`,
                        transition: "transform .12s ease, background .12s ease",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-extrabold" style={{ color: BRAND.text }}>
                            {x.t}
                          </div>
                          <div className="mt-1 text-xs" style={{ color: BRAND.sub }}>
                            {x.d}
                          </div>
                        </div>
                        <span className="chip">{planMeta(x.k).topN === 5 ? "Top 5" : "Top 10"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BRAND.stroke}` }}>
                <div className="text-xs font-extrabold" style={{ color: BRAND.text }}>
                  Territory Lock (Exclusivity UI)
                </div>
                <div className="mt-2 text-xs leading-relaxed" style={{ color: BRAND.sub }}>
                  You can’t promise outcomes. You can promise <span style={{ color: BRAND.text, fontWeight: 800 }}>exclusivity on delivery</span> for a territory key.
                </div>

                <div className="mt-3">
                  <div className="mb-2 text-[11px] font-semibold" style={{ color: BRAND.sub }}>
                    Territory key
                  </div>
                  <input
                    value={territoryKey}
                    onChange={(e) => setTerritoryKey(e.target.value)}
                    className="w-full rounded-2xl px-3 py-2 text-xs outline-none mono"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    className="btn btnGhost"
                    onClick={() => {
                      setTerritoryLocked((v) => !v);
                      pushToast({
                        title: territoryLocked ? "Territory released" : "Territory reserved",
                        message: territoryLocked ? "Key is now available" : "Key is now reserved for this client",
                        tone: territoryLocked ? "info" : "success",
                      });
                    }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 16,
                      width: "100%",
                      background: territoryLocked ? "rgba(244,208,63,0.10)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${territoryLocked ? "rgba(244,208,63,0.35)" : BRAND.stroke}`,
                    }}
                  >
                    {territoryLocked ? "Release Territory" : "Reserve Territory"}
                  </button>
                </div>

                <div className="mt-2 text-[11px]" style={{ color: BRAND.dim }}>
                  In your back-end later: a DB unique constraint on territory_key.
                </div>
              </div>

              <div className="mt-5 rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BRAND.stroke}` }}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold" style={{ color: BRAND.text }}>
                    Health
                  </div>
                  <span className="chip" style={{ borderColor: "rgba(16,185,129,0.30)", background: "rgba(16,185,129,0.10)" }}>
                    OK
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-xs" style={{ color: BRAND.sub }}>
                  <div className="flex items-center justify-between">
                    <span>Pipeline</span>
                    <span style={{ color: BRAND.text, fontWeight: 800 }}>{running ? step : "Idle"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Alerts capped</span>
                    <span style={{ color: BRAND.text, fontWeight: 800 }}>{bb.dailyCapHotAlerts}/day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Delivery</span>
                    <span style={{ color: BRAND.text, fontWeight: 800 }}>{meta.topN === 5 ? "Top 5" : "Top 10"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buy box panel */}
            <div className="mt-6 glass rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold" style={{ color: BRAND.text }}>
                  Buy Box
                </div>
                <span className="chip" style={{ borderColor: "rgba(255,255,255,0.14)" }}>
                  client-config
                </span>
              </div>

              <div className="mt-4">
                <Field label="Preset">
                  <select
                    value={presetKey}
                    onChange={(e) => setPresetKey(e.target.value as BuyBoxPresetKey)}
                    className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                  >
                    {(["Balanced", "Investor", "Family", "Luxury", "Starter"] as BuyBoxPresetKey[]).map((k) => (
                      <option key={k} value={k} style={{ color: "#000" }}>
                        {k}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-4 grid gap-3">
                <Field label="Territory name">
                  <input
                    value={bb.territoryName}
                    onChange={(e) => setBb((p) => ({ ...p, territoryName: e.target.value }))}
                    className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                  />
                </Field>

                <Field label="County/Area">
                  <input
                    value={bb.countyOrArea}
                    onChange={(e) => setBb((p) => ({ ...p, countyOrArea: e.target.value }))}
                    className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                  />
                </Field>

                <Field label="Anchor address">
                  <input
                    value={bb.anchorAddress}
                    onChange={(e) => setBb((p) => ({ ...p, anchorAddress: e.target.value }))}
                    className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                  />
                </Field>

                <Field label="ZIPs" hint={`Parsed: ${parseZipList(bb.zips).length}`}>
                  <input
                    value={bb.zips}
                    onChange={(e) => setBb((p) => ({ ...p, zips: e.target.value }))}
                    className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Price min">
                    <input
                      type="number"
                      value={bb.priceMin}
                      onChange={(e) => setBb((p) => ({ ...p, priceMin: Math.max(0, Number(e.target.value || 0)) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                    />
                  </Field>
                  <Field label="Price max">
                    <input
                      type="number"
                      value={bb.priceMax}
                      onChange={(e) => setBb((p) => ({ ...p, priceMax: Math.max(0, Number(e.target.value || 0)) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Beds min">
                    <input
                      type="number"
                      value={bb.bedsMin}
                      onChange={(e) => setBb((p) => ({ ...p, bedsMin: clamp(Number(e.target.value || 0), 0, 10) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                    />
                  </Field>
                  <Field label="Beds max">
                    <input
                      type="number"
                      value={bb.bedsMax}
                      onChange={(e) => setBb((p) => ({ ...p, bedsMax: clamp(Number(e.target.value || 0), 0, 15) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Baths min">
                    <input
                      type="number"
                      step="0.5"
                      value={bb.bathsMin}
                      onChange={(e) => setBb((p) => ({ ...p, bathsMin: clamp(Number(e.target.value || 0), 0, 10) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                    />
                  </Field>
                  <Field label="Max distance (mi)">
                    <input
                      type="number"
                      value={bb.maxDistanceMiles}
                      onChange={(e) => setBb((p) => ({ ...p, maxDistanceMiles: clamp(Number(e.target.value || 0), 1, 100) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                    />
                  </Field>
                </div>

                <Field label="Property type">
                  <select
                    value={bb.propertyType}
                    onChange={(e) => setBb((p) => ({ ...p, propertyType: e.target.value as PropertyType }))}
                    className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                  >
                    {(["Any", "Single Family", "Condo", "Townhome", "Multi-Family"] as PropertyType[]).map((k) => (
                      <option key={k} value={k} style={{ color: "#000" }}>
                        {k}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Include signals (comma)">
                  <textarea
                    value={bb.includeSignals}
                    onChange={(e) => setBb((p) => ({ ...p, includeSignals: e.target.value }))}
                    className="h-20 w-full resize-none rounded-2xl px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                  />
                </Field>

                <Field label="Exclude signals (comma)">
                  <textarea
                    value={bb.excludeSignals}
                    onChange={(e) => setBb((p) => ({ ...p, excludeSignals: e.target.value }))}
                    className="h-20 w-full resize-none rounded-2xl px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Warm ≥">
                    <input
                      type="number"
                      value={bb.warmThreshold}
                      onChange={(e) => setBb((p) => ({ ...p, warmThreshold: clamp(Number(e.target.value || 0), 1, 99) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                    />
                  </Field>
                  <Field label="Hot ≥">
                    <input
                      type="number"
                      value={bb.hotThreshold}
                      onChange={(e) => setBb((p) => ({ ...p, hotThreshold: clamp(Number(e.target.value || 0), 1, 100) }))}
                      className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                    />
                  </Field>
                </div>

                <Field label="Hot alerts cap/day">
                  <input
                    type="number"
                    value={bb.dailyCapHotAlerts}
                    onChange={(e) => setBb((p) => ({ ...p, dailyCapHotAlerts: clamp(Number(e.target.value || 0), 0, 25) }))}
                    className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Center */}
          <div className="lg:col-span-6">
            {/* Analytics header */}
            <div className="glass rounded-3xl p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs font-semibold" style={{ color: BRAND.sub }}>
                    Live board
                  </div>
                  <div className="mt-1 text-xl font-extrabold tracking-tight" style={{ color: BRAND.text }}>
                    Ranked Opportunities — Top {meta.topN}
                  </div>
                  <div className="mt-2 text-xs" style={{ color: BRAND.sub }}>
                    You sell ranked fit + speed. You do not sell “motivated seller guarantees.”
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Donut hot={counts.hot} warm={counts.warm} cold={counts.cold} />
                  <div>
                    <div className="text-xs font-extrabold" style={{ color: BRAND.text }}>
                      {counts.total} leads
                    </div>
                    <div className="mt-1 text-xs" style={{ color: BRAND.sub }}>
                      Hot {counts.hot} • Warm {counts.warm} • Cold {counts.cold}
                    </div>
                    <div className="mt-2">
                      <Sparkline data={trend} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter bar */}
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div>
                  <div className="mb-2 text-[11px] font-semibold" style={{ color: BRAND.sub }}>
                    Tag
                  </div>
                  <select
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value as any)}
                    className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                  >
                    {(["All", "Hot", "Warm", "Cold"] as const).map((v) => (
                      <option key={v} value={v} style={{ color: "#000" }}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="mb-2 text-[11px] font-semibold" style={{ color: BRAND.sub }}>
                    Source
                  </div>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value as any)}
                    className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BRAND.stroke}`, color: BRAND.text }}
                  >
                    {(["All", "Newsletter", "Marketplace", "Web", "Community"] as const).map((v) => (
                      <option key={v} value={v} style={{ color: "#000" }}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <div className="mb-2 text-[11px] font-semibold" style={{ color: BRAND.sub }}>
                    Distance filter
                  </div>
                  <button
                    className="btn btnGhost w-full"
                    onClick={() => setOnlyWithinDistance((v) => !v)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 16,
                      background: onlyWithinDistance ? "rgba(16,185,129,0.10)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${onlyWithinDistance ? "rgba(16,185,129,0.30)" : BRAND.stroke}`,
                    }}
                  >
                    {onlyWithinDistance ? `Within ${bb.maxDistanceMiles} mi (ON)` : "Distance filter (OFF)"}
                  </button>
                </div>
              </div>
            </div>

            {/* Board */}
            <div className="mt-6 glass rounded-3xl p-0 overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-5 py-4 text-[11px] font-extrabold" style={{ color: BRAND.sub, background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${BRAND.stroke}` }}>
                <div className="col-span-5">Opportunity</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Specs</div>
                <div className="col-span-2">Distance</div>
                <div className="col-span-1 text-right">Score</div>
              </div>

              <div className="divide-y" style={{ borderColor: BRAND.stroke }}>
                {(liveFeed.length ? liveFeed : topN).slice(0, meta.topN).map((r) => (
                  <button
                    key={r.id}
                    className="w-full text-left"
                    onClick={() => openLead(r)}
                    style={{ background: "transparent" }}
                  >
                    <div className="grid grid-cols-12 gap-2 px-5 py-4 hover:opacity-95" style={{ transition: "opacity .12s ease" }}>
                      <div className="col-span-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-extrabold" style={{ color: BRAND.text }}>
                              {r.addressLine}
                            </div>
                            <div className="mt-1 text-xs" style={{ color: BRAND.sub }}>
                              {r.cityState} • ZIP {r.zip} • {r.propertyType} • {r.source}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {r.reasons.map((x) => (
                                <span key={x} className="chip" style={{ background: "rgba(255,255,255,0.05)" }}>
                                  {x}
                                </span>
                              ))}
                              <span className="chip mono" title="heuristic completeness proxy">
                                conf {r.confidence}%
                              </span>
                            </div>
                          </div>

                          <span className="chip" style={tagPill(r.tag)}>
                            {r.tag}
                          </span>
                        </div>

                        <div className="mt-2 text-xs leading-relaxed" style={{ color: BRAND.sub }}>
                          {r.blurb}
                        </div>
                      </div>

                      <div className="col-span-2 text-sm font-extrabold" style={{ color: BRAND.text }}>
                        ${money(r.price)}
                      </div>

                      <div className="col-span-2 text-sm" style={{ color: BRAND.text }}>
                        {r.beds}bd • {r.baths}ba
                        <div className="mt-1 text-xs" style={{ color: BRAND.dim }}>
                          {minutesAgo(r.createdAtIso)}
                        </div>
                      </div>

                      <div className="col-span-2 text-sm" style={{ color: BRAND.text }}>
                        {r.distanceMiles.toFixed(1)} mi
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <div
                          className="flex h-9 w-14 items-center justify-center rounded-2xl text-sm font-extrabold"
                          style={{
                            background: toneForTag(r.tag).bg,
                            border: `1px solid ${toneForTag(r.tag).br}`,
                            color: BRAND.text,
                          }}
                        >
                          {r.score}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" style={{ borderTop: `1px solid ${BRAND.stroke}`, background: "rgba(255,255,255,0.02)" }}>
                <div className="text-xs" style={{ color: BRAND.sub }}>
                  Delivery payload is <span style={{ color: BRAND.text, fontWeight: 900 }}>structured</span> and exportable (email, Airtable, Slack, SMS caps later).
                </div>
                <div className="flex gap-2">
                  <button className="btn btnGhost" onClick={() => safeCopy(JSON.stringify(deliverablePreview, null, 2))}>
                    Copy Deliverable JSON
                  </button>
                  <button
                    className="btn btnGhost"
                    onClick={() =>
                      safeCopy(
                        deliverablePreview
                          .map((x) => `${x.tag} ${x.score} • ${x.address} • $${money(x.price)} • ${x.distanceMiles.toFixed(1)}mi`)
                          .join("\n")
                      )
                    }
                  >
                    Copy as Text
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-3">
            <MiniMap lead={selected} anchorLabel={bb.anchorAddress} />

            <div className="mt-6 glass rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold" style={{ color: BRAND.text }}>
                  Hot Alerts (capped)
                </div>
                <span className="chip" style={{ borderColor: "rgba(244,208,63,0.35)", background: "rgba(244,208,63,0.10)" }}>
                  cap {bb.dailyCapHotAlerts}/day
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                {hotAlerts.length ? (
                  hotAlerts.map((r) => (
                    <div key={r.id} className="rounded-2xl p-4" style={{ background: "rgba(244,208,63,0.08)", border: "1px solid rgba(244,208,63,0.25)" }}>
                      <div className="text-[11px] font-extrabold" style={{ color: BRAND.text }}>
                        🔥 HOT ({r.score})
                      </div>
                      <div className="mt-2 text-sm font-extrabold" style={{ color: BRAND.text }}>
                        {r.addressLine.split(",")[0]}
                      </div>
                      <div className="mt-1 text-xs" style={{ color: BRAND.sub }}>
                        ${money(r.price)} • {r.beds}bd/{r.baths}ba • {r.distanceMiles.toFixed(1)} mi
                      </div>
                      <button className="mt-3 btn btnGhost w-full" onClick={() => openLead(r)} style={{ padding: "10px 12px", borderRadius: 16 }}>
                        View
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BRAND.stroke}` }}>
                    <div className="text-sm font-extrabold" style={{ color: BRAND.text }}>
                      No hot alerts
                    </div>
                    <div className="mt-1 text-xs" style={{ color: BRAND.sub }}>
                      Tighten buy box or lower hot threshold.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 glass rounded-3xl p-5">
              <div className="text-sm font-extrabold" style={{ color: BRAND.text }}>
                What you’re actually selling
              </div>
              <div className="mt-3 text-xs leading-relaxed" style={{ color: BRAND.sub }}>
                <ul className="list-disc pl-4">
                  <li>
                    <span style={{ color: BRAND.text, fontWeight: 900 }}>Exclusive delivery</span> for a territory key (not “exclusive leads everywhere”).
                  </li>
                  <li>
                    <span style={{ color: BRAND.text, fontWeight: 900 }}>Ranked opportunities</span> based on fit + signals + distance.
                  </li>
                  <li>
                    <span style={{ color: BRAND.text, fontWeight: 900 }}>Speed</span>: alerts for hot only, capped to avoid spam.
                  </li>
                </ul>
              </div>

              <div className="mt-4 grid gap-2">
                <button
                  className="btn btnGhost"
                  onClick={() => {
                    pushToast({ title: "Demo deliverable", message: `Generated Top ${meta.topN} list + capped alerts`, tone: "success" });
                    safeCopy(JSON.stringify({ territory: territoryKey, reserved: territoryLocked, deliverablePreview }, null, 2));
                  }}
                >
                  Export “Client Report” (copy)
                </button>

                <button
                  className="btn btnGhost"
                  onClick={() => {
                    setSelected(null);
                    setDrawerOpen(false);
                    setLiveFeed([]);
                    pushToast({ title: "Reset", message: "Cleared live feed + selection", tone: "info" });
                  }}
                >
                  Reset view
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast stack */}
      <div className="fixed right-4 top-4 z-50 grid gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="glass rounded-2xl px-4 py-3"
            style={{
              width: 340,
              borderColor:
                t.tone === "success"
                  ? "rgba(16,185,129,0.35)"
                  : t.tone === "warn"
                  ? "rgba(244,208,63,0.35)"
                  : BRAND.stroke,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-extrabold" style={{ color: BRAND.text }}>
                  {t.title}
                </div>
                <div className="mt-1 text-xs" style={{ color: BRAND.sub }}>
                  {t.message}
                </div>
              </div>
              <button
                className="text-xs font-extrabold"
                style={{ color: BRAND.dim }}
                onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lead Drawer */}
      <div
        className={cx("fixed inset-0 z-40", drawerOpen ? "pointer-events-auto" : "pointer-events-none")}
        style={{
          background: drawerOpen ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)",
          transition: "background .16s ease",
        }}
        onClick={() => setDrawerOpen(false)}
      />

      <div
        className="fixed right-0 top-0 z-50 h-full w-full max-w-xl"
        style={{
          transform: drawerOpen ? "translateX(0)" : "translateX(110%)",
          transition: "transform .18s ease",
        }}
      >
        <div className="h-full glass rounded-l-[32px] p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold" style={{ color: BRAND.sub }}>
                Lead details
              </div>
              <div className="mt-1 text-lg font-extrabold" style={{ color: BRAND.text }}>
                {selected ? selected.addressLine : "—"}
              </div>
              <div className="mt-1 text-xs" style={{ color: BRAND.sub }}>
                {selected ? `${selected.cityState} • ZIP ${selected.zip} • ${selected.propertyType} • ${selected.source}` : "Select a lead"}
              </div>
            </div>
            <button className="btn btnGhost" style={{ padding: "10px 12px", borderRadius: 16 }} onClick={() => setDrawerOpen(false)}>
              Close
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <div className="rounded-3xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BRAND.stroke}` }}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold" style={{ color: BRAND.text }}>
                  Score
                </div>
                {selected ? (
                  <span className="chip" style={tagPill(selected.tag)}>
                    {selected.tag}
                  </span>
                ) : (
                  <span className="chip">—</span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <Stat label="Score" value={selected ? selected.score : "—"} accent={selected?.tag === "Hot" ? "gold" : selected?.tag === "Warm" ? "emerald" : "neutral"} />
                <Stat label="Confidence" value={selected ? `${selected.confidence}%` : "—"} accent="neutral" />
                <Stat label="Distance" value={selected ? `${selected.distanceMiles.toFixed(1)} mi` : "—"} accent="neutral" />
              </div>

              <div className="mt-4">
                <div className="text-[11px] font-semibold" style={{ color: BRAND.sub }}>
                  Reasons
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(selected?.reasons || ["—"]).map((x) => (
                    <span key={x} className="chip" style={{ background: "rgba(255,255,255,0.05)" }}>
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BRAND.stroke}` }}>
              <div className="text-sm font-extrabold" style={{ color: BRAND.text }}>
                Property snapshot
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs" style={{ color: BRAND.sub }}>
                <Row k="Price" v={selected ? `$${money(selected.price)}` : "—"} />
                <Row k="Beds/Baths" v={selected ? `${selected.beds} / ${selected.baths}` : "—"} />
                <Row k="Created" v={selected ? minutesAgo(selected.createdAtIso) : "—"} />
                <Row k="Type" v={selected ? selected.propertyType : "—"} />
              </div>

              <div className="mt-4 text-[11px] font-semibold" style={{ color: BRAND.sub }}>
                Summary
              </div>
              <div className="mt-2 text-xs leading-relaxed" style={{ color: BRAND.sub }}>
                {selected?.blurb || "—"}
              </div>
            </div>

            <div className="rounded-3xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BRAND.stroke}` }}>
              <div className="text-sm font-extrabold" style={{ color: BRAND.text }}>
                Actions
              </div>
              <div className="mt-4 grid gap-2">
                <button
                  className="btn btnPrimary"
                  onClick={() => {
                    if (!selected) return;
                    safeCopy(
                      `HOT? ${selected.tag === "Hot"}\nScore: ${selected.score}\nAddress: ${selected.addressLine}, ${selected.cityState} ${selected.zip}\nPrice: $${money(selected.price)}\nBeds/Baths: ${selected.beds}/${selected.baths}\nDistance: ${selected.distanceMiles.toFixed(1)} mi\nNotes: ${selected.blurb}`
                    );
                    pushToast({ title: "Copied lead", message: "Paste into SMS/email/CRM", tone: "success" });
                  }}
                >
                  Copy lead card (text)
                </button>

                <button
                  className="btn btnGhost"
                  onClick={() => {
                    if (!selected) return;
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selected.addressLine}, ${selected.cityState} ${selected.zip}`)}`;
                    safeCopy(url);
                    pushToast({ title: "Map link copied", message: "Open in browser", tone: "info" });
                  }}
                >
                  Copy map link
                </button>

                <button
                  className="btn btnGhost"
                  onClick={() => {
                    pushToast({ title: "Demo only", message: "Outreach automation is a separate workflow later", tone: "info" });
                  }}
                >
                  Add to Watchlist (demo)
                </button>
              </div>

              <div className="mt-3 text-[11px]" style={{ color: BRAND.dim }}>
                Later in your workflow JSON: upsert to Airtable/DB + notify if Hot + cap.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent: "gold" | "emerald" | "neutral" }) {
  const border =
    accent === "gold"
      ? "rgba(244,208,63,0.35)"
      : accent === "emerald"
      ? "rgba(16,185,129,0.32)"
      : "rgba(255,255,255,0.14)";
  const bg =
    accent === "gold"
      ? "rgba(244,208,63,0.10)"
      : accent === "emerald"
      ? "rgba(16,185,129,0.08)"
      : "rgba(255,255,255,0.05)";
  return (
    <div className="rounded-3xl p-4" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="text-[11px] font-semibold" style={{ color: BRAND.sub }}>
        {label}
      </div>
      <div className="mt-2 text-xl font-extrabold" style={{ color: BRAND.text }}>
        {value}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-[11px] font-semibold" style={{ color: BRAND.dim }}>
        {k}
      </div>
      <div className="text-xs font-extrabold" style={{ color: BRAND.text }}>
        {v}
      </div>
    </div>
  );
}