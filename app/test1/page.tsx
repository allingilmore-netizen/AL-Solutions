```tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type PresetId = "listing" | "buyer" | "investor" | "rental" | "luxury" | "multifamily";
type TerritoryType = "zip_cluster" | "radius";
type PropertyType = "single_family" | "condo" | "townhome" | "multi_family" | "land" | "mixed";
type AlertFrequency = "daily" | "weekday" | "twice_week" | "weekly";
type Decision = "unmarked" | "pursue" | "ignore";

const BRAND = {
  emerald: "#047857",
  gold: "#F4D03F",
  deepBg: "#020617",
  charcoal: "#0F172A",
} as const;

const PRICING = {
  proof: { name: "Proof Sprint (7 days)", price: 197 },
  solo: { name: "Solo Territory", price: 750, cadence: "/mo" },
  team: { name: "Team / High Volume", price: 1500, cadence: "/mo" },
} as const;

const CAPS = {
  proof: {
    processedRawPerWeek: 1500,
    aiScoredPerWeek: 600,
    hotAlertsPerWeek: 10,
    dailyTopSms: 5,
  },
  solo: {
    aiScoredPerDay: 30,
    hotAlertsPerWeek: 10,
    tuningChangesPerMonth: 1,
    territoryZipMax: 10,
    territoryRadiusMiles: 10,
  },
  team: {
    aiScoredPerDay: 120,
    hotAlertsPerWeek: 50,
    territories: 2,
    territoryZipLargeMax: 30,
  },
} as const;

const PRESETS: Array<{
  id: PresetId;
  title: string;
  blurb: string;
  signals: string[];
  alertSnippet: string;
}> = [
  {
    id: "listing",
    title: "Listing-focused",
    blurb: "Prioritize listing-side opportunities and pricing movement signals.",
    signals: ["Price Drop", "Stale Listing", "Relist/Withdraw", "High DOM vs Area", "Underpriced vs Comps"],
    alertSnippet: "Alert: 76 score - Stale listing + recent price drop. Possible listing-side outreach angle.",
  },
  {
    id: "buyer",
    title: "Buyer-focused",
    blurb: "Find inventory that fits buyer demand patterns in your territory.",
    signals: ["New Listing Velocity", "Open House Signals", "DOM Sweet Spot", "Price Band Fit", "School Zone Priority"],
    alertSnippet: "Digest: 10 picks - Strong buyer-fit inventory clustered near target schools and price bands.",
  },
  {
    id: "investor",
    title: "Investor",
    blurb: "Surface yield, rehab, and distress-adjacent signals for investor conversations.",
    signals: ["Rent-to-Price", "Rehab Indicators", "Distress Keywords", "Tax/HOA Flags", "Days on Market"],
    alertSnippet: "Alert: 82 score - Rent-to-price strong + rehab indicators. Worth underwriting quickly.",
  },
  {
    id: "rental",
    title: "Rental",
    blurb: "Rental inventory and landlord-style opportunities with a low-friction daily digest.",
    signals: ["Tenant-Friendly Layout", "Rent Band Fit", "Turnover Indicators", "Listing Activity Spikes", "DOM Threshold"],
    alertSnippet: "Digest: Rental-fit set - Properties matching rent band and quick-turn features.",
  },
  {
    id: "luxury",
    title: "Luxury",
    blurb: "High-end inventory movement, off-cycle changes, and concierge-style alerting.",
    signals: ["High-Value Bands", "Low Inventory Pockets", "Price Adjustments", "Premium Amenities", "Pocket Market Shifts"],
    alertSnippet: "Alert: 71 score - Premium pocket inventory shift + recent price adjustment. Soft-touch outreach recommended.",
  },
  {
    id: "multifamily",
    title: "Multifamily",
    blurb: "2-20 unit opportunities and signals that matter to small multifamily buyers.",
    signals: ["Unit Count Fit", "Cap-Rate Adjacent", "Value-Add Notes", "Stabilization Signals", "Days on Market"],
    alertSnippet: "Digest: Multifamily shortlist - Value-add notes + stable demand pockets within territory.",
  },
];

const DIGEST_ROWS: Array<{ id: string; title: string; score: number; reasons: string[] }> = [
  { id: "r1", title: "3BR Ranch - Price reduction + above-area DOM", score: 79, reasons: ["Price Drop", "Stale Listing"] },
  { id: "r2", title: "Townhome cluster - strong price-band fit", score: 73, reasons: ["Price Band Fit", "DOM Sweet Spot"] },
  { id: "r3", title: "2-4 Unit - value-add notes in remarks", score: 81, reasons: ["Value-Add Notes", "Unit Count Fit"] },
  { id: "r4", title: "Condo - relisted after withdraw", score: 68, reasons: ["Relist/Withdraw", "Underpriced vs Comps"] },
  { id: "r5", title: "SFR - rehab indicators + rent-to-price signal", score: 84, reasons: ["Rehab Indicators", "Rent-to-Price"] },
  { id: "r6", title: "New listing pocket - low inventory zone", score: 70, reasons: ["Low Inventory Pockets", "New Listing Velocity"] },
  { id: "r7", title: "School-zone match - stable demand band", score: 76, reasons: ["School Zone Priority", "Price Band Fit"] },
  { id: "r8", title: "Multifamily - longer DOM + notes suggest flexibility", score: 74, reasons: ["Days on Market", "Stabilization Signals"] },
  { id: "r9", title: "Luxury - small adjustment in premium pocket", score: 66, reasons: ["Price Adjustments", "Pocket Market Shifts"] },
  { id: "r10", title: "Rental-fit - turnover indicators + band fit", score: 72, reasons: ["Turnover Indicators", "Rent Band Fit"] },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function clampInt(input: string, min: number, max: number, fallback: number) {
  const v = Number.parseInt(input, 10);
  if (Number.isFinite(v)) return Math.min(max, Math.max(min, v));
  return fallback;
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "emerald" | "gold";
}) {
  return (
    <span className={cx("badge", tone === "emerald" && "badge-emerald", tone === "gold" && "badge-gold")}>
      {children}
    </span>
  );
}

function Toggle({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <button
      type="button"
      className={cx("toggle", value && "toggle-on")}
      onClick={() => onChange(!value)}
      aria-pressed={value}
    >
      <span className="toggle-label">
        <span className="toggle-title">{label}</span>
        {hint ? <span className="toggle-hint">{hint}</span> : null}
      </span>
      <span className="toggle-pill" aria-hidden="true">
        <span className="toggle-knob" />
      </span>
    </button>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  hint?: string;
}) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {hint ? <span className="field-hint">{hint}</span> : null}
      </span>
      <select className="field-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  hint,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  suffix?: string;
}) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {hint ? <span className="field-hint">{hint}</span> : null}
      </span>
      <div className="field-row">
        <input
          className="field-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {suffix ? <span className="field-suffix">{suffix}</span> : null}
      </div>
    </label>
  );
}

function Accordion({ items }: { items: Array<{ q: string; a: React.ReactNode }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="accordion">
      {items.map((it, idx) => {
        const open = openIndex === idx;
        return (
          <div key={it.q} className={cx("acc-item", open && "acc-open")}>
            <button
              type="button"
              className="acc-q"
              onClick={() => setOpenIndex(open ? null : idx)}
              aria-expanded={open}
            >
              <span>{it.q}</span>
              <span className="acc-icon" aria-hidden="true">
                {open ? "-" : "+"}
              </span>
            </button>
            <div className="acc-a" role="region">
              <div className="acc-a-inner">{it.a}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Toast({ open, message, onClose }: { open: boolean; message: string; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => onClose(), 2200);
    return () => window.clearTimeout(t);
  }, [open, onClose]);

  return (
    <div className={cx("toast-wrap", open && "toast-open")} aria-live="polite" aria-atomic="true">
      <div className="toast">
        <span className="toast-dot" aria-hidden="true" />
        <span className="toast-msg">{message}</span>
        <button type="button" className="toast-x" onClick={onClose} aria-label="Close status">
          x
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const exampleRef = useRef<HTMLElement | null>(null);
  const pricingRef = useRef<HTMLElement | null>(null);

  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const [preset, setPreset] = useState<PresetId>("investor");

  const [territoryType, setTerritoryType] = useState<TerritoryType>("zip_cluster");
  const [zipCount, setZipCount] = useState<string>("8");
  const [radiusMiles, setRadiusMiles] = useState<string>("10");
  const [priceMin, setPriceMin] = useState<string>("300000");
  const [priceMax, setPriceMax] = useState<string>("750000");
  const [propertyTypes, setPropertyTypes] = useState<Record<PropertyType, boolean>>({
    single_family: true,
    condo: false,
    townhome: true,
    multi_family: false,
    land: false,
    mixed: false,
  });
  const [domThreshold, setDomThreshold] = useState<string>("21");
  const [distressKeywords, setDistressKeywords] = useState<boolean>(true);
  const [schoolZonePriority, setSchoolZonePriority] = useState<boolean>(false);
  const [rehabIndicator, setRehabIndicator] = useState<boolean>(true);
  const [cashBuyerFriendly, setCashBuyerFriendly] = useState<boolean>(true);
  const [alertFrequency, setAlertFrequency] = useState<AlertFrequency>("daily");

  const [revealConfig, setRevealConfig] = useState<boolean>(false);

  const [digestDecisions, setDigestDecisions] = useState<Record<string, Decision>>(() => {
    const init: Record<string, Decision> = {};
    for (const r of DIGEST_ROWS) init[r.id] = "unmarked";
    return init;
  });

  const presetObj = useMemo(() => PRESETS.find((p) => p.id === preset)!, [preset]);

  const selectedPropertyTypeList = useMemo(() => {
    const labels: Record<PropertyType, string> = {
      single_family: "Single-family",
      condo: "Condo",
      townhome: "Townhome",
      multi_family: "Multi-family",
      land: "Land",
      mixed: "Mixed",
    };
    return (Object.keys(propertyTypes) as PropertyType[])
      .filter((k) => propertyTypes[k])
      .map((k) => labels[k]);
  }, [propertyTypes]);

  const configSummary = useMemo(() => {
    const min = clampInt(priceMin.replace(/[^0-9]/g, ""), 0, 100000000, 0);
    const max = clampInt(priceMax.replace(/[^0-9]/g, ""), 0, 100000000, 0);
    const dom = clampInt(domThreshold.replace(/[^0-9]/g, ""), 0, 365, 0);

    const territory =
      territoryType === "zip_cluster"
        ? `${clampInt(zipCount.replace(/[^0-9]/g, ""), 1, 99, 8)} ZIPs`
        : `${clampInt(radiusMiles.replace(/[^0-9]/g, ""), 1, 50, 10)}-mile radius`;

    const toggles: string[] = [];
    if (distressKeywords) toggles.push("Distress keyword scan");
    if (schoolZonePriority) toggles.push("School-zone weighting");
    if (rehabIndicator) toggles.push("Rehab indicators");
    if (cashBuyerFriendly) toggles.push("Cash-friendly tilt");

    return {
      territory,
      price: min && max && max >= min ? `${formatMoney(min)}-${formatMoney(max)}` : "Set price band",
      dom: dom ? `${dom}+ DOM` : "Set DOM threshold",
      propertyTypes: selectedPropertyTypeList.length ? selectedPropertyTypeList.join(", ") : "Select property types",
      toggles: toggles.length ? toggles.join(" · ") : "No extra toggles",
      alertFreq:
        alertFrequency === "daily"
          ? "Daily"
          : alertFrequency === "weekday"
            ? "Weekdays"
            : alertFrequency === "twice_week"
              ? "2x / week"
              : "Weekly",
    };
  }, [
    territoryType,
    zipCount,
    radiusMiles,
    priceMin,
    priceMax,
    domThreshold,
    distressKeywords,
    schoolZonePriority,
    rehabIndicator,
    cashBuyerFriendly,
    alertFrequency,
    selectedPropertyTypeList,
  ]);

  function pushToast(message: string) {
    setToast({ open: true, message });
  }

  function closeToast() {
    setToast((t) => ({ ...t, open: false }));
  }

  function scrollToExample() {
    exampleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToPricing() {
    pricingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onPrimaryCta() {
    pushToast("Proof Sprint selected. Next: confirm your territory + buy box.");
    setRevealConfig(true);
    scrollToPricing();
  }

  function setDecision(id: string, d: Decision) {
    setDigestDecisions((prev) => ({ ...prev, [id]: d }));
  }

  return (
    <>
      <style>{`
        :root{
          --emerald:${BRAND.emerald};
          --gold:${BRAND.gold};
          --deep:${BRAND.deepBg};
          --char:${BRAND.charcoal};
          --text: rgba(255,255,255,.92);
          --muted: rgba(255,255,255,.66);
          --faint: rgba(255,255,255,.46);
          --line: rgba(255,255,255,.12);
          --glass: rgba(255,255,255,.06);
          --shadow: 0 18px 50px rgba(0,0,0,.35);
          --shadow2: 0 10px 30px rgba(0,0,0,.28);
          --radius: 18px;
          --radius2: 22px;
          --max: 1100px;
        }

        *{ box-sizing:border-box; }
        html, body { height:100%; }
        body{
          margin:0;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
          background: radial-gradient(1200px 700px at 18% 12%, rgba(4,120,87,.18), transparent 55%),
                      radial-gradient(900px 550px at 86% 16%, rgba(244,208,63,.12), transparent 55%),
                      radial-gradient(700px 500px at 65% 85%, rgba(4,120,87,.14), transparent 55%),
                      linear-gradient(180deg, var(--deep), #050b1f 60%, #030712);
          color: var(--text);
        }

        a{ color:inherit; text-decoration:none; }
        button, input, select{ font:inherit; color:inherit; }
        .page{ min-height:100%; }
        .container{ max-width: var(--max); margin:0 auto; padding: 24px; }

        .topbar{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 14px;
          padding: 10px 0 18px;
        }
        .brand{ display:flex; align-items:center; gap:10px; user-select:none; }
        .logo{
          width:38px;
          height:38px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(4,120,87,.55), rgba(244,208,63,.35));
          box-shadow: 0 10px 30px rgba(0,0,0,.28);
          position: relative;
          border: 1px solid rgba(255,255,255,.16);
        }
        .logo:after{
          content:"";
          position:absolute;
          inset:10px;
          border-radius: 10px;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.24), transparent 60%),
                      linear-gradient(135deg, rgba(0,0,0,.12), transparent);
          border: 1px solid rgba(255,255,255,.10);
        }
        .brand-title{
          font-weight: 760;
          letter-spacing: .2px;
          display:flex;
          flex-direction:column;
        }
        .brand-title small{
          font-weight: 560;
          color: var(--muted);
          letter-spacing: .3px;
        }

        .nav{ display:flex; gap:10px; flex-wrap:wrap; }
        .nav a, .nav button{
          padding: 9px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.04);
          color: var(--muted);
          transition: transform .18s ease, background .18s ease, border-color .18s ease;
          cursor:pointer;
        }
        .nav a:hover, .nav button:hover{
          transform: translateY(-1px);
          background: rgba(255,255,255,.06);
          border-color: rgba(255,255,255,.22);
          color: var(--text);
        }

        .hero{
          display:grid;
          grid-template-columns: 1.15fr .85fr;
          gap: 18px;
          padding: 18px 0 8px;
          align-items: stretch;
        }

        .card{
          border-radius: var(--radius2);
          background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04));
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: var(--shadow2);
          overflow:hidden;
          position: relative;
        }
        .card:before{
          content:"";
          position:absolute;
          inset:0;
          background: radial-gradient(700px 300px at 10% 20%, rgba(4,120,87,.18), transparent 55%),
                      radial-gradient(600px 260px at 85% 30%, rgba(244,208,63,.13), transparent 55%);
          opacity:.9;
          pointer-events:none;
        }
        .card > *{ position:relative; }
        .card-pad{ padding: 22px; }
        .subtle{
          border-radius: var(--radius2);
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.10);
        }

        .hero h1{
          margin: 8px 0 10px;
          font-size: 44px;
          line-height: 1.05;
          letter-spacing: -0.6px;
        }
        .hero p{
          margin: 0 0 14px;
          color: var(--muted);
          font-size: 16px;
          line-height: 1.45;
        }
        .hero .no-promise{
          display:flex;
          gap:10px;
          align-items:flex-start;
          padding: 12px 12px;
          border-radius: 14px;
          background: rgba(244,208,63,.08);
          border: 1px solid rgba(244,208,63,.22);
          color: rgba(255,255,255,.85);
        }
        .dot{
          width: 10px;
          height:10px;
          border-radius: 999px;
          background: var(--gold);
          box-shadow: 0 0 0 4px rgba(244,208,63,.18);
          margin-top: 4px;
          flex: 0 0 auto;
        }

        .hero-cta{ display:flex; flex-wrap:wrap; gap:10px; margin-top: 14px; }
        .btn{
          padding: 11px 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.06);
          color: var(--text);
          cursor:pointer;
          transition: transform .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease;
          display:inline-flex;
          align-items:center;
          gap:10px;
          user-select:none;
        }
        .btn:hover{
          transform: translateY(-1px);
          background: rgba(255,255,255,.08);
          border-color: rgba(255,255,255,.24);
        }
        .btn-primary{
          background: linear-gradient(135deg, rgba(4,120,87,.70), rgba(4,120,87,.42));
          border-color: rgba(4,120,87,.55);
          box-shadow: 0 14px 40px rgba(4,120,87,.18);
        }
        .btn-primary:hover{
          background: linear-gradient(135deg, rgba(4,120,87,.80), rgba(4,120,87,.48));
          border-color: rgba(4,120,87,.70);
        }
        .btn-secondary{ background: rgba(2,6,23,.35); }
        .btn-ghost{
          background: transparent;
          border-color: rgba(255,255,255,.12);
          color: var(--muted);
        }
        .btn-mini{ padding: 7px 10px; border-radius: 12px; font-size: 13px; }
        .btn-pill{ border-radius: 999px; padding: 8px 11px; font-size: 13px; }

        .hero-right{ display:flex; flex-direction:column; gap: 12px; }

        .kpi{ display:grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .kpi .box{
          padding: 14px;
          border-radius: 16px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.10);
          overflow:hidden;
          position: relative;
        }
        .kpi .box:before{
          content:"";
          position:absolute;
          inset:-40px;
          background: radial-gradient(200px 120px at 10% 10%, rgba(4,120,87,.18), transparent 60%),
                      radial-gradient(220px 140px at 80% 20%, rgba(244,208,63,.14), transparent 60%);
          opacity:.9;
        }
        .kpi .box > *{ position:relative; }
        .kpi .label{ color: var(--muted); font-size: 12px; }
        .kpi .val{ font-weight: 780; font-size: 16px; margin-top: 6px; }
        .kpi .val span{ color: rgba(244,208,63,.95); }

        .timeline{
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.10);
        }
        .timeline h3{ margin: 0 0 10px; font-size: 14px; letter-spacing:.2px; }
        .steps{ display:grid; gap: 10px; }
        .step{ display:flex; gap: 10px; align-items:flex-start; }
        .step .n{
          width: 22px;
          height:22px;
          border-radius: 8px;
          border: 1px solid rgba(244,208,63,.28);
          background: rgba(244,208,63,.10);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size: 12px;
          flex: 0 0 auto;
          margin-top: 1px;
        }
        .step .t{ font-size: 13px; color: var(--muted); line-height: 1.35; }
        .step .t b{ color: rgba(255,255,255,.90); font-weight: 680; }

        .section{ padding: 18px 0; }
        .section h2{ margin: 0 0 10px; font-size: 22px; letter-spacing: -0.2px; }
        .section p.lead{ margin: 0 0 14px; color: var(--muted); line-height: 1.5; }

        .grid2{ display:grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .split{ display:grid; grid-template-columns: 1.05fr .95fr; gap: 14px; }

        .preset-grid{ display:grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .preset{
          padding: 14px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.04);
          cursor:pointer;
          transition: transform .18s ease, border-color .18s ease, background .18s ease;
          min-height: 120px;
        }
        .preset:hover{
          transform: translateY(-1px);
          background: rgba(255,255,255,.05);
          border-color: rgba(255,255,255,.22);
        }
        .preset.sel{
          border-color: rgba(4,120,87,.65);
          background: linear-gradient(180deg, rgba(4,120,87,.18), rgba(255,255,255,.04));
          box-shadow: 0 14px 40px rgba(4,120,87,.12);
        }
        .preset h3{ margin: 0 0 6px; font-size: 15px; letter-spacing: .1px; }
        .preset p{ margin: 0; color: var(--muted); font-size: 13px; line-height: 1.35; }

        .badge{
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.04);
          color: rgba(255,255,255,.84);
          font-size: 12px;
          line-height: 1;
          white-space: nowrap;
        }
        .badge-emerald{ border-color: rgba(4,120,87,.45); background: rgba(4,120,87,.12); }
        .badge-gold{ border-color: rgba(244,208,63,.35); background: rgba(244,208,63,.10); }

        .chips{ display:flex; flex-wrap:wrap; gap: 8px; }

        .panel-title{
          display:flex;
          align-items:baseline;
          justify-content:space-between;
          gap: 10px;
          margin-bottom: 10px;
        }
        .panel-title h3{ margin:0; font-size: 15px; }
        .panel-title span{ color: var(--muted); font-size: 12px; }

        .snippet{
          padding: 12px;
          border-radius: 16px;
          border: 1px dashed rgba(255,255,255,.18);
          background: rgba(2,6,23,.30);
          color: rgba(255,255,255,.84);
          line-height: 1.35;
          font-size: 13px;
        }

        .config{ display:grid; gap: 10px; }
        .field{ display:grid; gap: 6px; }
        .field-label{
          font-size: 12px;
          color: var(--muted);
          display:flex;
          align-items:center;
          gap: 8px;
        }
        .field-hint{
          color: var(--faint);
          font-size: 11px;
          border: 1px solid rgba(255,255,255,.10);
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(255,255,255,.04);
        }
        .field-input{
          width:100%;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.05);
          padding: 10px 12px;
          outline:none;
          transition: border-color .18s ease, background .18s ease;
        }
        .field-input:focus{
          border-color: rgba(244,208,63,.35);
          background: rgba(255,255,255,.06);
        }
        .field-row{ display:flex; align-items:center; gap: 10px; }
        .field-suffix{
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.04);
          color: var(--muted);
          white-space: nowrap;
        }

        .type-grid{ display:grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .type-btn{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.04);
          cursor:pointer;
          transition: transform .18s ease, border-color .18s ease, background .18s ease;
        }
        .type-btn:hover{
          transform: translateY(-1px);
          border-color: rgba(255,255,255,.22);
          background: rgba(255,255,255,.05);
        }
        .type-btn.sel{
          border-color: rgba(4,120,87,.65);
          background: rgba(4,120,87,.12);
        }
        .type-btn .l{ display:flex; flex-direction:column; gap: 4px; }
        .type-btn .l b{ font-size: 13px; font-weight: 720; }
        .type-btn .l small{ color: var(--muted); font-size: 12px; }
        .type-btn .r{
          width: 10px;
          height:10px;
          border-radius: 999px;
          border: 2px solid rgba(255,255,255,.25);
          background: transparent;
          position: relative;
        }
        .type-btn.sel .r{ border-color: rgba(4,120,87,.75); }
        .type-btn.sel .r:after{
          content:"";
          position:absolute;
          inset:2px;
          border-radius: 999px;
          background: var(--emerald);
        }

        .toggle{
          width:100%;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 12px;
          padding: 12px 12px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.04);
          cursor:pointer;
          transition: transform .18s ease, border-color .18s ease, background .18s ease;
          text-align:left;
        }
        .toggle:hover{
          transform: translateY(-1px);
          border-color: rgba(255,255,255,.22);
          background: rgba(255,255,255,.05);
        }
        .toggle-on{
          border-color: rgba(244,208,63,.35);
          background: rgba(244,208,63,.08);
        }
        .toggle-label{ display:flex; flex-direction:column; gap: 3px; }
        .toggle-title{ font-weight: 680; font-size: 13px; }
        .toggle-hint{ color: var(--muted); font-size: 12px; }
        .toggle-pill{
          width: 44px;
          height: 24px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.18);
          background: rgba(255,255,255,.06);
          position: relative;
          flex: 0 0 auto;
        }
        .toggle-on .toggle-pill{
          border-color: rgba(4,120,87,.55);
          background: rgba(4,120,87,.16);
        }
        .toggle-knob{
          position:absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: rgba(255,255,255,.82);
          transition: transform .18s ease;
          box-shadow: 0 10px 20px rgba(0,0,0,.28);
        }
        .toggle-on .toggle-knob{
          transform: translateX(20px);
          background: rgba(255,255,255,.92);
        }

        .summary{
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.10);
          display:grid;
          gap: 10px;
        }
        .summary-row{
          display:flex;
          flex-wrap:wrap;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
        }
        .summary-row .k{ color: var(--muted); font-size: 12px; }
        .summary-row .v{ font-size: 13px; color: rgba(255,255,255,.88); font-weight: 650; }

        .divider{ height:1px; background: rgba(255,255,255,.10); margin: 10px 0; }

        .pricing{
          display:grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          align-items: stretch;
        }
        .price-card{
          padding: 18px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.05);
          position: relative;
          overflow:hidden;
          display:flex;
          flex-direction:column;
          gap: 12px;
          min-height: 330px;
        }
        .price-card:before{
          content:"";
          position:absolute;
          inset:-60px;
          background: radial-gradient(380px 160px at 12% 16%, rgba(4,120,87,.20), transparent 60%),
                      radial-gradient(380px 160px at 86% 16%, rgba(244,208,63,.14), transparent 60%);
          opacity:.8;
        }
        .price-card > *{ position: relative; }
        .price-top{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap: 10px;
        }
        .price-top h3{ margin:0; font-size: 15px; letter-spacing: .1px; }
        .price{ font-weight: 860; font-size: 30px; letter-spacing: -0.4px; }
        .cadence{ color: var(--muted); font-size: 13px; font-weight: 650; margin-left: 6px; }
        .price-sub{ color: var(--muted); font-size: 13px; margin-top: 2px; line-height: 1.35; }

        .list{ display:grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
        .li{
          display:flex;
          gap: 10px;
          align-items:flex-start;
          color: rgba(255,255,255,.84);
          font-size: 13px;
          line-height: 1.35;
        }
        .check{
          width: 18px;
          height: 18px;
          border-radius: 7px;
          border: 1px solid rgba(4,120,87,.55);
          background: rgba(4,120,87,.14);
          flex: 0 0 auto;
          margin-top: 1px;
          position: relative;
        }
        .check:after{
          content:"";
          position:absolute;
          width: 7px;
          height: 4px;
          border-left: 2px solid rgba(255,255,255,.86);
          border-bottom: 2px solid rgba(255,255,255,.86);
          transform: rotate(-45deg);
          left: 4px;
          top: 6px;
          opacity: .95;
        }
        .caps{
          padding: 12px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(2,6,23,.30);
          display:grid;
          gap: 8px;
        }
        .caps h4{
          margin:0;
          font-size: 12px;
          letter-spacing: .3px;
          color: var(--muted);
          text-transform: uppercase;
        }
        .caprow{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
          font-size: 13px;
          color: rgba(255,255,255,.86);
        }
        .caprow span{ color: var(--muted); font-size: 12px; }

        .price-cta{ margin-top:auto; display:flex; flex-wrap:wrap; gap: 10px; }

        .note{
          margin-top: 10px;
          color: var(--muted);
          font-size: 12.5px;
          line-height: 1.5;
        }

        .digest{
          padding: 14px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.04);
          overflow:hidden;
        }
        .digest-head{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
          margin-bottom: 10px;
        }
        .digest-head .left{ display:flex; flex-direction:column; gap: 4px; }
        .digest-head h3{ margin:0; font-size: 15px; }
        .digest-head .sub{ color: var(--muted); font-size: 12px; }

        .table{
          width:100%;
          border-collapse: collapse;
          overflow:hidden;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.10);
        }
        .table th, .table td{
          padding: 10px 10px;
          border-bottom: 1px solid rgba(255,255,255,.08);
          text-align:left;
          vertical-align: top;
        }
        .table th{
          font-size: 12px;
          color: var(--muted);
          font-weight: 650;
          background: rgba(2,6,23,.30);
        }
        .table td{
          font-size: 13px;
          color: rgba(255,255,255,.86);
          background: rgba(255,255,255,.02);
        }
        .row-title{ display:flex; flex-direction:column; gap: 6px; }
        .row-title b{ font-weight: 700; }
        .row-actions{ display:flex; gap: 8px; flex-wrap:wrap; }

        .pill{
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.04);
          color: rgba(255,255,255,.86);
          font-size: 12px;
          line-height: 1;
          white-space: nowrap;
          user-select:none;
        }
        .pill-on{ border-color: rgba(4,120,87,.62); background: rgba(4,120,87,.14); }
        .pill-off{ border-color: rgba(255,255,255,.14); background: rgba(255,255,255,.04); color: var(--muted); }

        .faqwrap{ display:grid; grid-template-columns: 1fr; gap: 14px; }
        .accordion{ display:grid; gap: 10px; }
        .acc-item{
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.04);
          overflow:hidden;
        }
        .acc-q{
          width:100%;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 12px;
          padding: 14px;
          background: transparent;
          border: none;
          cursor:pointer;
          color: rgba(255,255,255,.90);
          font-weight: 680;
          text-align:left;
        }
        .acc-icon{
          width: 28px;
          height: 28px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.04);
          display:flex;
          align-items:center;
          justify-content:center;
          color: var(--muted);
          flex: 0 0 auto;
        }
        .acc-a{ height: 0; overflow:hidden; transition: height .22s ease; }
        .acc-open .acc-a{ height: auto; }
        .acc-a-inner{
          padding: 0 14px 14px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.5;
        }

        .footer{
          padding: 20px 0 34px;
          color: rgba(255,255,255,.58);
          font-size: 12px;
          line-height: 1.45;
        }

        .toast-wrap{
          position: fixed;
          left: 0;
          right: 0;
          bottom: 18px;
          display:flex;
          justify-content:center;
          pointer-events:none;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity .18s ease, transform .18s ease;
          z-index: 50;
        }
        .toast-open{ opacity: 1; transform: translateY(0); }
        .toast{
          pointer-events:auto;
          display:flex;
          align-items:center;
          gap: 10px;
          padding: 12px 12px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(2,6,23,.72);
          box-shadow: var(--shadow);
          min-width: min(560px, calc(100vw - 40px));
        }
        .toast-dot{
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: var(--emerald);
          box-shadow: 0 0 0 4px rgba(4,120,87,.18);
          flex: 0 0 auto;
        }
        .toast-msg{ color: rgba(255,255,255,.90); font-size: 13px; line-height: 1.35; flex: 1 1 auto; }
        .toast-x{
          width: 28px;
          height: 28px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.04);
          color: rgba(255,255,255,.78);
          cursor:pointer;
        }

        .reveal{
          max-height: 0;
          opacity: 0;
          transform: translateY(6px);
          overflow:hidden;
          transition: max-height .35s ease, opacity .25s ease, transform .25s ease;
        }
        .reveal.on{
          max-height: 1500px;
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 980px){
          .hero{ grid-template-columns: 1fr; }
          .preset-grid{ grid-template-columns: 1fr 1fr; }
          .pricing{ grid-template-columns: 1fr; }
          .split{ grid-template-columns: 1fr; }
          .grid2{ grid-template-columns: 1fr; }
        }
        @media (max-width: 520px){
          .container{ padding: 18px; }
          .hero h1{ font-size: 36px; }
          .preset-grid{ grid-template-columns: 1fr; }
          .kpi{ grid-template-columns: 1fr; }
          .nav{ display:none; }
          .table th:nth-child(2), .table td:nth-child(2){ display:none; }
        }
      `}</style>

      <div className="page">
        <div className="container">
          <header className="topbar">
            <div className="brand">
              <div className="logo" aria-hidden="true" />
              <div className="brand-title">
                <span>Territory Signal Feed</span>
                <small>Ranked daily opportunities + capped hot alerts for your territory</small>
              </div>
            </div>

            <nav className="nav" aria-label="Sections">
              <button
                type="button"
                onClick={() => setRevealConfig(true)}
                className="btn btn-pill btn-ghost"
              >
                Configure Feed
              </button>
              <button type="button" onClick={scrollToPricing} className="btn btn-pill btn-ghost">
                Pricing
              </button>
              <button type="button" onClick={scrollToExample} className="btn btn-pill btn-ghost">
                Example Digest
              </button>
            </nav>
          </header>

          <section className="hero">
            <div className="card">
              <div className="card-pad">
                <Badge tone="emerald">Territory-protected delivery</Badge>{" "}
                <Badge tone="gold">ZIP cluster / radius</Badge>

                <h1>Stop scanning the internet for &quot;deals.&quot; Get the top opportunities pushed to you daily.</h1>

                <p>
                  You set territory + buy box. We aggregate non-MLS public signals, dedupe them, score them, and deliver a ranked digest plus a capped set of high-signal alerts.
                </p>

                <div className="no-promise">
                  <span className="dot" aria-hidden="true" />
                  <div>
                    <b>What this is:</b> ranked opportunities + reasons.<br />
                    <b>What this is not:</b> motivation, contactability, or outcome guarantees.
                  </div>
                </div>

                <p style={{ marginTop: 14, marginBottom: 0 }}>
                  MLS shows inventory. This shows priority. Aggregation: public signals in one place. Ranking: reason chips + scoring. Push delivery: digest + capped alerts.
                </p>

                <div className="hero-cta">
                  <button type="button" className="btn btn-primary" onClick={onPrimaryCta}>
                    <span>Start Proof Sprint — {formatMoney(PRICING.proof.price)}</span>
                    <span aria-hidden="true">→</span>
                  </button>

                  <button type="button" className="btn btn-secondary" onClick={scrollToExample}>
                    See example feed
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setRevealConfig((v) => !v);
                      pushToast(
                        revealConfig
                          ? "Configuration collapsed."
                          : "Configuration opened."
                      );
                    }}
                  >
                    {revealConfig ? "Hide configuration" : "Configure your feed"}
                  </button>
                </div>
              </div>
            </div>

            <div className="hero-right">
              <div className="kpi">
                <div className="box">
                  <div className="label">Territory structure</div>
                  <div className="val">
                    ZIP cluster <span>or</span> radius
                  </div>
                </div>
                <div className="box">
                  <div className="label">Alert discipline</div>
                  <div className="val">
                    Capped <span>hot</span> alerts
                  </div>
                </div>
                <div className="box">
                  <div className="label">Transparency</div>
                  <div className="val">
                    Reason chips <span>+</span> scoring
                  </div>
                </div>
                <div className="box">
                  <div className="label">Tuning</div>
                  <div className="val">
                    Profile weights <span>+</span> rules
                  </div>
                </div>
              </div>

              <div className="timeline">
                <h3>How it works</h3>
                <div className="steps">
                  <div className="step">
                    <div className="n">1</div>
                    <div className="t">
                      <b>Define territory + profile</b> — ZIP cluster or radius, then pick a starting profile.
                    </div>
                  </div>
                  <div className="step">
                    <div className="n">2</div>
                    <div className="t">
                      <b>Configure buy box</b> — price band, property types, DOM threshold, toggles, alert cadence.
                    </div>
                  </div>
                  <div className="step">
                    <div className="n">3</div>
                    <div className="t">
                      <b>Receive digest + capped hot alerts</b> — every opportunity includes reason chips.
                    </div>
                  </div>
                  <div className="step">
                    <div className="n">4</div>
                    <div className="t">
                      <b>Tune</b> — adjust weights and rules to match your workflow.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="section">
            <h2>Pick a Profile. Set Your Territory. Get Your Feed.</h2>
            <p className="lead">
              Choose a profile that matches how you work, then set territory + criteria.
            </p>

            <div className={cx("reveal", revealConfig && "on")}>
              <div className="card">
                <div className="card-pad">
                  <div className="preset-grid" role="list" aria-label="Presets">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={cx("preset", preset === p.id && "sel")}
                        onClick={() => {
                          setPreset(p.id);
                          pushToast(`Profile selected: ${p.title}`);
                        }}
                        role="listitem"
                      >
                        <h3>{p.title}</h3>
                        <p>{p.blurb}</p>
                      </button>
                    ))}
                  </div>

                  <div className="divider" />

                  <div className="split">
                    <div className="subtle" style={{ padding: 16, borderRadius: 18 }}>
                      <div className="panel-title">
                        <h3>Signals we prioritize</h3>
                        <span>Profile: {presetObj.title}</span>
                      </div>
                      <div className="chips">
                        {presetObj.signals.map((s) => (
                          <Badge
                            key={s}
                            tone={s.includes("Price") || s.includes("DOM") ? "gold" : "emerald"}
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>

                      <div style={{ height: 12 }} />

                      <div className="panel-title">
                        <h3>Example alert</h3>
                        <span>Sample snippet</span>
                      </div>
                      <div className="snippet">{presetObj.alertSnippet}</div>

                      <div style={{ height: 12 }} />

                      <div className="summary">
                        <div className="summary-row">
                          <span className="k">Territory</span>
                          <span className="v">{configSummary.territory}</span>
                        </div>
                        <div className="summary-row">
                          <span className="k">Price band</span>
                          <span className="v">{configSummary.price}</span>
                        </div>
                        <div className="summary-row">
                          <span className="k">Property types</span>
                          <span className="v">{configSummary.propertyTypes}</span>
                        </div>
                        <div className="summary-row">
                          <span className="k">DOM threshold</span>
                          <span className="v">{configSummary.dom}</span>
                        </div>
                        <div className="summary-row">
                          <span className="k">Toggles</span>
                          <span className="v">{configSummary.toggles}</span>
                        </div>
                        <div className="summary-row">
                          <span className="k">Alert frequency</span>
                          <span className="v">{configSummary.alertFreq}</span>
                        </div>
                      </div>
                    </div>

                    <div className="subtle" style={{ padding: 16, borderRadius: 18 }}>
                      <div className="panel-title">
                        <h3>Buy box configuration</h3>
                        <span>10 fields</span>
                      </div>

                      <div className="config">
                        <div className="type-grid" role="group" aria-label="Territory type">
                          <button
                            type="button"
                            className={cx("type-btn", territoryType === "zip_cluster" && "sel")}
                            onClick={() => setTerritoryType("zip_cluster")}
                          >
                            <span className="l">
                              <b>ZIP cluster</b>
                              <small>Define a list/count of ZIPs</small>
                            </span>
                            <span className="r" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className={cx("type-btn", territoryType === "radius" && "sel")}
                            onClick={() => setTerritoryType("radius")}
                          >
                            <span className="l">
                              <b>Radius</b>
                              <small>Define a mile radius</small>
                            </span>
                            <span className="r" aria-hidden="true" />
                          </button>
                        </div>

                        {territoryType === "zip_cluster" ? (
                          <Input
                            label="ZIP count"
                            hint="2 of 10"
                            value={zipCount}
                            onChange={setZipCount}
                            placeholder="e.g., 8"
                            suffix="ZIPs"
                          />
                        ) : (
                          <Input
                            label="Radius"
                            hint="2 of 10"
                            value={radiusMiles}
                            onChange={setRadiusMiles}
                            placeholder="e.g., 10"
                            suffix="miles"
                          />
                        )}

                        <div className="grid2">
                          <Input
                            label="Min price"
                            hint="3 of 10"
                            value={priceMin}
                            onChange={setPriceMin}
                            placeholder="e.g., 300000"
                            suffix="USD"
                          />
                          <Input
                            label="Max price"
                            hint="3 of 10"
                            value={priceMax}
                            onChange={setPriceMax}
                            placeholder="e.g., 750000"
                            suffix="USD"
                          />
                        </div>

                        <div className="field">
                          <span className="field-label">
                            Property types <span className="field-hint">4 of 10</span>
                          </span>
                          <div className="chips">
                            {(
                              [
                                ["single_family", "Single-family"],
                                ["townhome", "Townhome"],
                                ["condo", "Condo"],
                                ["multi_family", "Multi-family"],
                                ["land", "Land"],
                                ["mixed", "Mixed"],
                              ] as const
                            ).map(([key, label]) => {
                              const k = key as PropertyType;
                              const on = propertyTypes[k];
                              return (
                                <button
                                  key={k}
                                  type="button"
                                  className={cx("pill", on ? "pill-on" : "pill-off")}
                                  onClick={() => setPropertyTypes((p) => ({ ...p, [k]: !p[k] }))}
                                  aria-pressed={on}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <Input
                          label="DOM threshold"
                          hint="5 of 10"
                          value={domThreshold}
                          onChange={setDomThreshold}
                          placeholder="e.g., 21"
                          suffix="days"
                        />

                        <Toggle
                          label="Distress keywords"
                          hint="6 of 10"
                          value={distressKeywords}
                          onChange={setDistressKeywords}
                        />
                        <Toggle
                          label="School zone priority"
                          hint="7 of 10"
                          value={schoolZonePriority}
                          onChange={setSchoolZonePriority}
                        />
                        <Toggle
                          label="Rehab indicator"
                          hint="8 of 10"
                          value={rehabIndicator}
                          onChange={setRehabIndicator}
                        />
                        <Toggle
                          label="Cash-buyer friendly tilt"
                          hint="9 of 10"
                          value={cashBuyerFriendly}
                          onChange={setCashBuyerFriendly}
                        />

                        <Select
                          label="Alert frequency preference"
                          hint="10 of 10"
                          value={alertFrequency}
                          onChange={(v) => setAlertFrequency(v as AlertFrequency)}
                          options={[
                            { value: "daily", label: "Daily" },
                            { value: "weekday", label: "Weekdays" },
                            { value: "twice_week", label: "2x per week" },
                            { value: "weekly", label: "Weekly" },
                          ]}
                        />

                        <div className="note" style={{ marginTop: 0 }}>
                          Configuration defines territory and scoring criteria. Tuning adjustments are included with your plan.
                        </div>

                        <div className="hero-cta" style={{ marginTop: 4 }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => pushToast("Configuration saved.")}
                          >
                            Save configuration
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => {
                              setPreset("investor");
                              setTerritoryType("zip_cluster");
                              setZipCount("8");
                              setRadiusMiles("10");
                              setPriceMin("300000");
                              setPriceMax("750000");
                              setPropertyTypes({
                                single_family: true,
                                condo: false,
                                townhome: true,
                                multi_family: false,
                                land: false,
                                mixed: false,
                              });
                              setDomThreshold("21");
                              setDistressKeywords(true);
                              setSchoolZonePriority(false);
                              setRehabIndicator(true);
                              setCashBuyerFriendly(true);
                              setAlertFrequency("daily");
                              pushToast("Reset to defaults.");
                            }}
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ height: 10 }} />
                </div>
              </div>
            </div>
          </section>

          <section className="section">
            <h2>Territory protection</h2>
            <p className="lead">
              Territory protection applies to our ranked feed and alerts for your boundary. It does not imply ownership of public listings or inventory.
            </p>

            <div className="grid2">
              <div className="card">
                <div className="card-pad">
                  <div className="panel-title">
                    <h3>How protection works</h3>
                    <span>ZIP cluster or radius</span>
                  </div>

                  <div className="list" style={{ gap: 10 }}>
                    <div className="li">
                      <span className="check" aria-hidden="true" />
                      <span>
                        <b>ZIP cluster protection:</b> the ranked feed + hot alerts are reserved
                        for your defined ZIP list.
                      </span>
                    </div>
                    <div className="li">
                      <span className="check" aria-hidden="true" />
                      <span>
                        <b>Radius option:</b> define a center point and mile radius for coverage.
                      </span>
                    </div>
                    <div className="li">
                      <span className="check" aria-hidden="true" />
                      <span>
                        <b>Optional category carve-out:</b> scope can be full territory or a
                        category when available.
                      </span>
                    </div>
                    <div className="li">
                      <span className="check" aria-hidden="true" />
                      <span>
                        <b>Scope:</b> Protection covers our ranked feed output and alerting in
                        that boundary, not public inventory.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-pad">
                  <div className="panel-title">
                    <h3>Agreement highlights</h3>
                    <span>Plain language</span>
                  </div>

                  <div className="caps">
                    <h4>Highlights</h4>
                    <div className="caprow">
                      <div>Territory definition</div>
                      <span>ZIP list / radius boundary</span>
                    </div>
                    <div className="caprow">
                      <div>Protection scope</div>
                      <span>Full vs category</span>
                    </div>
                    <div className="caprow">
                      <div>Terms</div>
                      <span>Month-to-month; ends if unpaid</span>
                    </div>
                    <div className="caprow">
                      <div>Scope clarity</div>
                      <span>Ranked feed output only</span>
                    </div>
                  </div>

                  <p className="note">
                    Territory is explicitly defined. Caps exist. Tuning is tracked. Scope stays honest.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            className="section"
            ref={(el) => {
              pricingRef.current = el;
            }}
          >
            <h2>Pricing</h2>
            <p className="lead">
              Simple tiers with hard caps. If caps are exceeded, overages or upgrades apply.
            </p>

            <div className="pricing" aria-label="Pricing comparison">
              <div className="price-card">
                <div className="price-top">
                  <div>
                    <h3>{PRICING.proof.name}</h3>
                    <div className="price">
                      {formatMoney(PRICING.proof.price)}
                      <span className="cadence">one-time</span>
                    </div>
                    <div className="price-sub">
                      For agents who want to validate quality before committing.
                    </div>
                  </div>
                  <Badge tone="gold">Best first step</Badge>
                </div>

                <ul className="list" aria-label="Proof Sprint features">
                  <li className="li">
                    <span className="check" aria-hidden="true" />
                    <span>
                      <b>1 territory</b> (ZIP cluster or radius)
                    </span>
                  </li>
                  <li className="li">
                    <span className="check" aria-hidden="true" />
                    <span>
                      <b>Daily Top {CAPS.proof.dailyTopSms} SMS</b> (capped)
                    </span>
                  </li>
                  <li className="li">
                    <span className="check" aria-hidden="true" />
                    <span>
                      <b>Daily digest email</b> (ranked list + reasons)
                    </span>
                  </li>
                  <li className="li">
                    <span className="check" aria-hidden="true" />
                    <span>
                      <b>Pipeline queue</b> (New / Review / Pursue / Ignore)
                    </span>
                  </li>
                  <li className="li">
                    <span className="check" aria-hidden="true" />
                    <span>
                      <b>End-of-week tuning recommendations</b>
                    </span>
                  </li>
                </ul>

                <div className="caps">
                  <h4>Hard caps (Proof Sprint)</h4>
                  <div className="caprow">
                    <div>{CAPS.proof.processedRawPerWeek.toLocaleString()}</div>
                    <span>processed raw / week</span>
                  </div>
                  <div className="caprow">
                    <div>{CAPS.proof.aiScoredPerWeek.toLocaleString()}</div>
                    <span>AI-scored / week</span>
                  </div>
                  <div className="caprow">
                    <div>{CAPS.proof.hotAlertsPerWeek.toLocaleString()}</div>
                    <span>hot alerts / week</span>
                  </div>
                </div>

                <div className="price-cta">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      pushToast("Proof Sprint selected. Next: confirm territory + buy box.");
                      setRevealConfig(true);
                    }}
                  >
                    Start Proof Sprint — {formatMoney(PRICING.proof.price)}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={scrollToExample}>
                    See example digest
                  </button>
                </div>
              </div>

              <div className="price-card">
                <div className="price-top">
                  <div>
                    <h3>
                      {formatMoney(PRICING.solo.price)}
                      <span className="cadence">{PRICING.solo.cadence}</span> — {PRICING.solo.name}
                    </h3>
                    <div className="price-sub">
                      For solo agents working one tight territory.
                    </div>
                  </div>
                  <Badge tone="emerald">Most common</Badge>
                </div>

                <ul className="list" aria-label="Solo features">
                  <li className="li">
                    <span className="check" aria-hidden="true" />
                    <span>
                      <b>1 territory</b> (up to ~{CAPS.solo.territoryZipMax} ZIPs or ~
                      {CAPS.solo.territoryRadiusMiles}-mile radius)
                    </span>
                  </li>
                  <li className="li">
                    <span className="check" aria-hidden="true" />
                    <span>
                      <b>Up to ~{CAPS.solo.aiScoredPerDay} AI-scored / day</b> (cap)
                    </span>
                  </li>
                  <li className="li">
                    <span className="check" aria-hidden="true" />
                    <span>
                      <b>Up to ~{CAPS.solo.hotAlertsPerWeek} hot SMS alerts / week</b> (cap)
                    </span>
                  </li>
                  <li className="li">
                    <span className="check" aria-hidden="true" />
                    <span>
                      <b>{CAPS.solo.tuningChangesPerMonth} tuning change / month</b> included
                    </span>
                  </li>
                  <li className="li">
                    <span className="check" aria-hidden="true" />
                    <span>
                      <b>Daily digest + pipeline queue</b>
                    </span>
                  </li>
                </ul>

                <div className="caps">
                  <h4>Caps (Solo)</h4>
                  <div className="caprow">
                    <div>~{CAPS.solo.aiScoredPerDay.toLocaleString()}</div>
                    <span>AI-scored / day</span>
                  </div>
                  <div className="caprow">
                    <div>~{CAPS.solo.hotAlertsPerWeek.toLocaleString()}</div>
                    <span>hot SMS alerts / week</span>
                  </div>
                  <div className="caprow">
                    <div>1</div>
                    <span>tuning change / month</span>
                  </div>
                </div>

                <div className="price-cta">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      pushToast(
                        "Solo Territory selected. Next: confirm territory + buy box + start date."
                      )
                    }
                  >
                    Choose {formatMoney(PRICING.solo.price)}/mo
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setRevealConfig(true)}
                  >
                    Configure buy box
                  </button>
                </div>
              </div>

              <div className="price-card">
                <div className="price-top">
                  <div>
                    <h3>
                      {formatMoney(PRICING.team.price)}
                      <span className="cadence">{PRICING.team.cadence}</span> — {PRICING.team.name}
                    </h3>
                    <div className="price-sub">
                      For teams/high-output agents covering multiple territories with weekly tuning.
                    </div>
                  </div>
                  <Badge tone="gold">Highest volume</Badge>
                </div>

                <ul className="list" aria-label="Team features">
                  <li className="li">
                    <span className="check" aria-hidden="true" />
                    <span>
                      <b>{CAPS.team.territories} territories</b> (or 1 large up to ~
                      {CAPS.team.territoryZipLargeMax} ZIPs)
                    </span>
                  </li>
                  <li className="li">
                    <span className="check" aria-hidden="true" />
                    <span>
                      <b>Up to ~{CAPS.team.aiScoredPerDay} AI-scored / day</b> (cap)
                    </span>
                  </li>
                  <li className="li">
                    <span className="check" aria-hidden="true" />
                    <span>
                      <b>Up to ~{CAPS.team.hotAlertsPerWeek} hot SMS alerts / week</b> (cap)
                    </span>
                  </li>
                  <li className="li">
                    <span className="check" aria-hidden="true" />
                    <span>
                      <b>Weekly tuning</b> included
                    </span>
                  </li>
                  <li className="li">
                    <span className="check" aria-hidden="true" />
                    <span>
                      <b>Priority monitoring + faster fixes</b>
                    </span>
                  </li>
                </ul>

                <div className="caps">
                  <h4>Caps (Team)</h4>
                  <div className="caprow">
                    <div>~{CAPS.team.aiScoredPerDay.toLocaleString()}</div>
                    <span>AI-scored / day</span>
                  </div>
                  <div className="caprow">
                    <div>~{CAPS.team.hotAlertsPerWeek.toLocaleString()}</div>
                    <span>hot SMS alerts / week</span>
                  </div>
                  <div className="caprow">
                    <div>Weekly</div>
                    <span>tuning cadence</span>
                  </div>
                </div>

                <div className="price-cta">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      pushToast(
                        "Team plan selected. Next: confirm territory split + buy boxes per territory."
                      )
                    }
                  >
                    Choose {formatMoney(PRICING.team.price)}/mo
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={scrollToExample}>
                    See example output
                  </button>
                </div>
              </div>
            </div>

            <p className="note">
              Overages or upgrades apply if caps are exceeded. Caps keep throughput predictable and output reviewable.
            </p>
          </section>

          <section
            className="section"
            ref={(el) => {
              exampleRef.current = el;
            }}
          >
            <h2>Example digest</h2>
            <p className="lead">
              Daily digest: 10 ranked rows with reason chips and a simple Pursue / Ignore workflow.
            </p>

            <div className="grid2">
              <div className="digest">
                <div className="digest-head">
                  <div className="left">
                    <h3>Daily Digest — Ranked Opportunities</h3>
                    <div className="sub">
                      Territory: {configSummary.territory} · Profile: {presetObj.title} · Alerts:{" "}
                      {configSummary.alertFreq}
                    </div>
                  </div>
                  <div className="chips">
                    <Badge tone="emerald">Reason chips</Badge>
                    <Badge tone="gold">Capped alerts</Badge>
                  </div>
                </div>

                <table className="table" aria-label="Example daily digest table">
                  <thead>
                    <tr>
                      <th style={{ width: "56%" }}>Opportunity</th>
                      <th style={{ width: "14%" }}>Score</th>
                      <th style={{ width: "30%" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DIGEST_ROWS.map((r) => {
                      const d = digestDecisions[r.id] ?? "unmarked";
                      return (
                        <tr key={r.id}>
                          <td>
                            <div className="row-title">
                              <b>{r.title}</b>
                              <div className="chips">
                                {r.reasons.map((c) => (
                                  <Badge key={c} tone={c.includes("Price") ? "gold" : "emerald"}>
                                    {c}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge
                              tone={
                                r.score >= 80 ? "emerald" : r.score >= 70 ? "gold" : "neutral"
                              }
                            >
                              {r.score}
                            </Badge>
                          </td>
                          <td>
                            <div className="row-actions">
                              <button
                                type="button"
                                className={cx(
                                  "btn btn-mini",
                                  d === "pursue" ? "btn-primary" : "btn-ghost"
                                )}
                                onClick={() => {
                                  setDecision(r.id, d === "pursue" ? "unmarked" : "pursue");
                                  pushToast(d === "pursue" ? "Cleared: Pursue" : "Marked: Pursue");
                                }}
                              >
                                Pursue
                              </button>
                              <button
                                type="button"
                                className={cx(
                                  "btn btn-mini",
                                  d === "ignore" ? "btn-secondary" : "btn-ghost"
                                )}
                                onClick={() => {
                                  setDecision(r.id, d === "ignore" ? "unmarked" : "ignore");
                                  pushToast(d === "ignore" ? "Cleared: Ignore" : "Marked: Ignore");
                                }}
                              >
                                Ignore
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <p className="note">
                  Scores are illustrative. A ranked feed is not a guarantee of outcomes.
                </p>
              </div>

              <div className="card">
                <div className="card-pad">
                  <div className="panel-title">
                    <h3>Why start with Proof Sprint</h3>
                    <span>Validate before committing</span>
                  </div>

                  <ul className="list" style={{ marginBottom: 10 }}>
                    <li className="li">
                      <span className="check" aria-hidden="true" />
                      <span>
                        <b>Deliverables in ~48 hours:</b> territory + profile + buy box + first
                        digest + Top {CAPS.proof.dailyTopSms} alerts.
                      </span>
                    </li>
                    <li className="li">
                      <span className="check" aria-hidden="true" />
                      <span>
                        <b>Midweek tuning check-in:</b> adjust weights and rules based on what you
                        actually want.
                      </span>
                    </li>
                    <li className="li">
                      <span className="check" aria-hidden="true" />
                      <span>
                        <b>End-of-week recap:</b> what worked, what didn&apos;t, and recommended
                        plan/caps.
                      </span>
                    </li>
                  </ul>

                  <div className="no-promise" style={{ marginBottom: 12 }}>
                    <span className="dot" aria-hidden="true" />
                    <div>
                      <b>What this is:</b> ranked opportunities + reasons.<br />
                      <b>What this is not:</b> motivation, contactability, or outcome guarantees.
                    </div>
                  </div>

                  <div className="hero-cta">
                    <button type="button" className="btn btn-primary" onClick={onPrimaryCta}>
                      Start Proof Sprint — {formatMoney(PRICING.proof.price)}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setRevealConfig(true)}
                    >
                      Configure your feed
                    </button>
                  </div>

                  <p className="note">
                    If you want guarantees, this is the wrong product. If you want a disciplined, ranked feed tuned to your buy box, start here.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="section">
            <h2>FAQ</h2>
            <p className="lead">Common questions, direct answers.</p>

            <div className="faqwrap">
              <Accordion
                items={[
                  {
                    q: "Is this lead gen?",
                    a: (
                      <>
                        It&apos;s a ranked opportunity feed and alerting layer. It helps you decide
                        where to focus. It is not a guarantee of results, contactability, or
                        contract-ready situations.
                      </>
                    ),
                  },
                  {
                    q: "Do you guarantee motivated sellers?",
                    a: (
                      <>
                        No. We rank opportunities based on your buy box and signals. We do not
                        guarantee motivation, contactability, or outcomes.
                      </>
                    ),
                  },
                  {
                    q: "How is territory protection enforced?",
                    a: (
                      <>
                        Protection is enforced by an explicitly defined territory boundary (ZIP
                        list/cluster or radius) and a clear scope. It applies to our ranked feed
                        output in that boundary, not public inventory.
                      </>
                    ),
                  },
                  {
                    q: "What do I need to start?",
                    a: (
                      <>
                        A territory definition (ZIP cluster or radius), a starting profile, and a
                        basic buy box (price band, property types, DOM threshold, toggles, and
                        alert frequency). Proof Sprint is the recommended entry.
                      </>
                    ),
                  },
                  {
                    q: "Can I switch profiles later?",
                    a: (
                      <>
                        Yes. Profiles are starting points. You can switch profiles and tune
                        weights/rules; caps still apply so output remains reviewable.
                      </>
                    ),
                  },
                  {
                    q: "What if I don't like the opportunities?",
                    a: (
                      <>
                        That&apos;s why Proof Sprint exists. If the feed isn&apos;t relevant after tuning, don&apos;t continue into monthly.
                      </>
                    ),
                  },
                ]}
              />

              <div className="card">
                <div className="card-pad">
                  <div className="panel-title">
                    <h3>Ready to start?</h3>
                    <span>Next step</span>
                  </div>

                  <div className="hero-cta">
                    <button type="button" className="btn btn-primary" onClick={onPrimaryCta}>
                      Start Proof Sprint — {formatMoney(PRICING.proof.price)}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={scrollToExample}>
                      See example feed
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setRevealConfig(true)}
                    >
                      Configure buy box
                    </button>
                  </div>

                  <p className="note">
                    Overages or upgrades apply if caps are exceeded. This is a capped, tunable
                    ranked feed — not a guarantee.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <footer className="footer">
            © {new Date().getFullYear()} Territory Signal Feed. Ranked opportunities with caps and tuning. Not a guarantee of motivation, contactability, or outcomes.
          </footer>
        </div>

        <Toast open={toast.open} message={toast.message} onClose={closeToast} />
      </div>
    </>
  );
}
```