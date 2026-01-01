"use client";

import React, { useMemo, useState } from "react";

type PlanKey = "demo" | "week197" | "monthly750" | "monthly1500";
type NavKey = "workflows" | "modules" | "activity" | "settings";

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

function formatDate(ts: number) {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  let hh = d.getHours();
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12;
  hh = hh ? hh : 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${min} ${ampm}`;
}

function money(n: number) {
  return n.toLocaleString("en-US");
}

function planMeta(plan: PlanKey) {
  switch (plan) {
    case "demo":
      return {
        title: "Demo Workflow",
        price: "Preview",
        cadence: "Mock runs",
        delivery: "Top 10 + health",
        cap: "Stable demo data",
        highlight: "Best for: screen share + onboarding call",
      };
    case "week197":
      return {
        title: "$197 Proof Sprint",
        price: "$197",
        cadence: "7 days",
        delivery: "Top 5 essentials + reporting",
        cap: "Tight scope, fast setup",
        highlight: "Best for: proof + confidence before scaling",
      };
    case "monthly750":
      return {
        title: "$750 Monthly",
        price: "$750/mo",
        cadence: "Ongoing",
        delivery: "Top 10 + alerts + monitoring",
        cap: "Solo territory / standard caps",
        highlight: "Best for: consistent inbound and follow-up",
      };
    case "monthly1500":
      return {
        title: "$1,500 Monthly",
        price: "$1,500/mo",
        cadence: "Ongoing",
        delivery: "High-volume + watchlist + SLA",
        cap: "Higher caps / advanced routing",
        highlight: "Best for: teams + multiple pipelines",
      };
  }
}

type WorkflowRow = {
  id: string;
  name: string;
  tier: "Core" | "Billing" | "Ops" | "Safety";
  trigger: string;
  status: "Ready" | "Paused" | "Running" | "Error";
  lastRun: number;
  nextRun: number | null;
  runs7d: number;
  successRate: number; // 0-100
  notes: string;
};

type ModuleRow = {
  key: string;
  name: string;
  category: "Core" | "Follow-up" | "Scheduling" | "Billing" | "Reporting" | "Safety";
  value: string;
  complexity: "Low" | "Medium" | "High";
  includedIn: Array<PlanKey>;
};

type EventRow = {
  id: string;
  ts: number;
  source: "Webhook" | "DB" | "Scheduler" | "Monitor";
  type: string;
  outcome: "ok" | "warn" | "fail";
  message: string;
};

function seeded(n: number) {
  const x = Math.sin(n * 9301.11) * 10000;
  return x - Math.floor(x);
}

function Badge(props: { tone?: "gold" | "emerald" | "slate"; children: React.ReactNode }) {
  const tone = props.tone ?? "slate";
  const style =
    tone === "gold"
      ? { border: "1px solid rgba(244,208,63,.38)", background: "rgba(244,208,63,.10)" }
      : tone === "emerald"
      ? { border: "1px solid rgba(16,185,129,.30)", background: "rgba(16,185,129,.10)" }
      : { border: "1px solid rgba(148,163,184,.40)", background: "rgba(2,6,23,.45)" };

  return (
    <span className="badge" style={style}>
      {props.children}
    </span>
  );
}

function PillButton(props: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={cx("pillBtn", props.active && "pillBtnActive")} onClick={props.onClick}>
      {props.children}
    </button>
  );
}

function IconDot({ tone }: { tone: "emerald" | "gold" | "red" | "slate" }) {
  const bg =
    tone === "emerald"
      ? "radial-gradient(circle at 30% 20%, #BBF7D0 0, #22C55E 40%, #166534 100%)"
      : tone === "gold"
      ? "radial-gradient(circle at 30% 20%, #FEF9C3 0, #FACC15 45%, #B45309 100%)"
      : tone === "red"
      ? "radial-gradient(circle at 30% 20%, #FECACA 0, #EF4444 45%, #7F1D1D 100%)"
      : "radial-gradient(circle at 30% 20%, #E5E7EB 0, #94A3B8 45%, #334155 100%)";

  return <span className="idot" style={{ background: bg }} />;
}

export default function Page() {
  const [mode, setMode] = useState<"configure" | "workspace">("configure");
  const [nav, setNav] = useState<NavKey>("workflows");

  // Config form
  const [plan, setPlan] = useState<PlanKey>("demo");
  const meta = planMeta(plan);

  const [businessName, setBusinessName] = useState("All In Digital — Client Workspace");
  const [territoryKey, setTerritoryKey] = useState("TX-AUSTIN-CORE-78701");
  const [primaryCalendar, setPrimaryCalendar] = useState("Google Calendar");
  const [notifyChannel, setNotifyChannel] = useState("Telegram");
  const [integrations, setIntegrations] = useState({
    stripe: true,
    telnyx: true,
    vapi: true,
    email: true,
    telegram: true,
    slack: false,
  });

  // Workspace state
  const [toast, setToast] = useState<{ on: boolean; title: string; msg: string; tone: "ok" | "warn" | "fail" }>({
    on: false,
    title: "",
    msg: "",
    tone: "ok",
  });

  const [sortKey, setSortKey] = useState<keyof WorkflowRow>("successRate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const now = Date.now();

  const workflowsBase: WorkflowRow[] = useMemo(() => {
    const rows: WorkflowRow[] = [
      {
        id: "W1",
        name: "Stripe Webhook Router (LIVE)",
        tier: "Billing",
        trigger: "stripe.events → /webhook",
        status: "Ready",
        lastRun: now - 1000 * 60 * (8 + Math.floor(seeded(2) * 25)),
        nextRun: null,
        runs7d: 142,
        successRate: 99,
        notes: "Routes invoice.paid, payment_failed, dispute.created + idempotency guard.",
      },
      {
        id: "W2",
        name: "Invoice Paid → Grant Credits",
        tier: "Billing",
        trigger: "route: invoice.paid",
        status: "Ready",
        lastRun: now - 1000 * 60 * (16 + Math.floor(seeded(6) * 25)),
        nextRun: null,
        runs7d: 57,
        successRate: 98,
        notes: "Wallet credit + receipt log + notify.",
      },
      {
        id: "W3",
        name: "Invoice Payment Failed → Halt + Notify",
        tier: "Billing",
        trigger: "route: invoice.payment_failed",
        status: "Ready",
        lastRun: now - 1000 * 60 * (41 + Math.floor(seeded(9) * 25)),
        nextRun: null,
        runs7d: 12,
        successRate: 100,
        notes: "Sets account hold flags and sends critical alert.",
      },
      {
        id: "W4",
        name: "Dispute Created → CRITICAL Notify",
        tier: "Safety",
        trigger: "route: charge.dispute.created",
        status: "Ready",
        lastRun: now - 1000 * 60 * (190 + Math.floor(seeded(11) * 60)),
        nextRun: null,
        runs7d: 0,
        successRate: 100,
        notes: "Immediate escalation. No retries.",
      },
      {
        id: "W5",
        name: "Refill Engine (Threshold + Cooldown)",
        tier: "Ops",
        trigger: "cron / on-usage / low-balance",
        status: "Ready",
        lastRun: now - 1000 * 60 * (27 + Math.floor(seeded(15) * 25)),
        nextRun: now + 1000 * 60 * (40 + Math.floor(seeded(17) * 40)),
        runs7d: 88,
        successRate: 97,
        notes: "Cooldown lock prevents repeat charges.",
      },
      {
        id: "W6",
        name: "Global Error Trigger → CRITICAL Notify",
        tier: "Safety",
        trigger: "workflow.error",
        status: "Ready",
        lastRun: now - 1000 * 60 * (66 + Math.floor(seeded(19) * 25)),
        nextRun: null,
        runs7d: 9,
        successRate: 100,
        notes: "Captures stack + node + payload snapshot.",
      },
      {
        id: "W7",
        name: "Client Provisioner (Clone + Config)",
        tier: "Ops",
        trigger: "manual / onboarding",
        status: "Paused",
        lastRun: now - 1000 * 60 * (520 + Math.floor(seeded(25) * 90)),
        nextRun: null,
        runs7d: 2,
        successRate: 96,
        notes: "Creates client config row + assigns pricing catalog + creds placeholders.",
      },
      {
        id: "W8",
        name: "Usage Collector (Voice + SMS)",
        tier: "Ops",
        trigger: "webhook: usage.*",
        status: "Ready",
        lastRun: now - 1000 * 60 * (19 + Math.floor(seeded(29) * 22)),
        nextRun: null,
        runs7d: 211,
        successRate: 98,
        notes: "Normalizes usage records and appends ledger transactions.",
      },
      {
        id: "W9",
        name: "Daily Digest (Ops + Billing)",
        tier: "Reporting",
        trigger: "cron: daily 7am",
        status: "Ready",
        lastRun: now - 1000 * 60 * (600 + Math.floor(seeded(33) * 120)),
        nextRun: now + 1000 * 60 * (900 + Math.floor(seeded(35) * 180)),
        runs7d: 7,
        successRate: 100,
        notes: "Summary: top failures, charges, credit usage, alerts sent.",
      } as any,
    ];

    // Ensure tier type correctness (Reporting isn't in union, map to Ops but label later)
    return rows.map((r) => {
      if ((r as any).tier === "Reporting") return { ...r, tier: "Ops", name: r.name.replace("Daily Digest (Ops + Billing)", "Daily Digest (Ops + Billing)") };
      return r;
    });
  }, [now]);

  const modules: ModuleRow[] = useMemo(() => {
    const rows: ModuleRow[] = [
      { key: "M1", name: "Client Config (source of truth)", category: "Core", value: "Prevents drift + makes builds repeatable", complexity: "Low", includedIn: ["demo", "week197", "monthly750", "monthly1500"] },
      { key: "M2", name: "Workflow Health + Global Error Trap", category: "Safety", value: "Audit trail + instant escalation", complexity: "Medium", includedIn: ["demo", "week197", "monthly750", "monthly1500"] },
      { key: "M3", name: "Stripe Webhook Router + Idempotency", category: "Billing", value: "No duplicate credits / no double charges", complexity: "High", includedIn: ["demo", "week197", "monthly750", "monthly1500"] },
      { key: "M4", name: "Wallet + Ledger (credits)", category: "Billing", value: "Credits, packs, thresholds, cooldown locks", complexity: "High", includedIn: ["demo", "week197", "monthly750", "monthly1500"] },
      { key: "M5", name: "Refill Engine (threshold + cooldown)", category: "Billing", value: "Auto-rebill without runaway charges", complexity: "High", includedIn: ["demo", "week197", "monthly750", "monthly1500"] },

      { key: "M6", name: "SMS Notify Templates (ops + billing)", category: "Reporting", value: "Cleaner client comms (alerts & digests)", complexity: "Medium", includedIn: ["demo", "monthly750", "monthly1500"] },
      { key: "M7", name: "Voice Usage Normalizer", category: "Reporting", value: "Usage → ledger, with reconciliation", complexity: "High", includedIn: ["demo", "monthly750", "monthly1500"] },
      { key: "M8", name: "Audit Log Browser (client view)", category: "Reporting", value: "Proof that the system ran", complexity: "Medium", includedIn: ["demo", "monthly750", "monthly1500"] },
      { key: "M9", name: "Client Provisioner (clone + config)", category: "Core", value: "Spin up new client in minutes", complexity: "High", includedIn: ["demo", "monthly750", "monthly1500"] },
      { key: "M10", name: "SLA Monitor (latency + failure rate)", category: "Safety", value: "Stops silent breakage", complexity: "High", includedIn: ["monthly1500"] },
    ];
    return rows;
  }, []);

  const essentialsTop5 = useMemo(() => ["M1", "M2", "M3", "M4", "M5"], []);

  const events: EventRow[] = useMemo(() => {
    const base: EventRow[] = [];
    for (let i = 0; i < 16; i++) {
      const s = seeded(i + 7);
      const outcome: EventRow["outcome"] = s > 0.86 ? "fail" : s > 0.70 ? "warn" : "ok";
      base.push({
        id: `E-${i + 1}`,
        ts: now - 1000 * 60 * (4 + i * 13 + Math.floor(seeded(i + 77) * 10)),
        source: s > 0.6 ? "Webhook" : s > 0.35 ? "Scheduler" : s > 0.2 ? "DB" : "Monitor",
        type:
          outcome === "fail"
            ? "delivery.failed"
            : outcome === "warn"
            ? "cooldown.prevented"
            : i % 3 === 0
            ? "invoice.paid"
            : i % 3 === 1
            ? "usage.ingested"
            : "health.ok",
        outcome,
        message:
          outcome === "fail"
            ? "Webhook payload rejected: missing required field"
            : outcome === "warn"
            ? "Cooldown lock active — prevented duplicate charge"
            : i % 3 === 0
            ? "Invoice paid — credits granted"
            : i % 3 === 1
            ? "Usage records normalized + appended to ledger"
            : "All monitors green",
      });
    }
    return base.sort((a, b) => b.ts - a.ts);
  }, [now]);

  const workflows = useMemo(() => {
    // Filter based on plan (simple gating to sell the tiers)
    const allow = (row: WorkflowRow) => {
      if (plan === "week197") {
        // Show the “essentials” only (what proof sprint includes)
        return ["W1", "W2", "W3", "W4", "W5", "W6"].includes(row.id);
      }
      if (plan === "monthly750") {
        return ["W1", "W2", "W3", "W4", "W5", "W6", "W8"].includes(row.id);
      }
      if (plan === "monthly1500") {
        return true;
      }
      return true; // demo shows all
    };

    const qq = q.trim().toLowerCase();
    const filtered = workflowsBase.filter(allow).filter((r) => {
      if (!qq) return true;
      return `${r.id} ${r.name} ${r.tier} ${r.trigger} ${r.status} ${r.notes}`.toLowerCase().includes(qq);
    });

    const sorted = [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const dir = sortDir === "asc" ? 1 : -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });

    return sorted;
  }, [workflowsBase, plan, q, sortKey, sortDir]);

  const selected = useMemo(() => workflows.find((w) => w.id === selectedId) ?? null, [workflows, selectedId]);

  const kpis = useMemo(() => {
    const total = workflows.length || 1;
    const ready = workflows.filter((w) => w.status === "Ready").length;
    const paused = workflows.filter((w) => w.status === "Paused").length;
    const error = workflows.filter((w) => w.status === "Error").length;
    const running = workflows.filter((w) => w.status === "Running").length;
    const avgSuccess = Math.round(workflows.reduce((a, b) => a + b.successRate, 0) / total);
    return { total, ready, paused, error, running, avgSuccess };
  }, [workflows]);

  function toggleSort(k: keyof WorkflowRow) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  }

  function showToast(title: string, msg: string, tone: "ok" | "warn" | "fail") {
    setToast({ on: true, title, msg, tone });
    window.setTimeout(() => setToast((t) => ({ ...t, on: false })), 3600);
  }

  function simulateRun() {
    // Don’t pretend this is “real” — it’s a UI demo to show polish.
    showToast("Run queued", "Simulating workflow run + health updates", "ok");
  }

  function enterWorkspace() {
    // Your $5k offer needs this reveal. This is the “aha” moment.
    setMode("workspace");
    setNav("workflows");
    showToast("Workspace ready", "Configuration applied. Showing client-ready deliverables.", "ok");
  }

  const moduleRowsForPlan = useMemo(() => modules.filter((m) => m.includedIn.includes(plan)), [modules, plan]);

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
          background:
            radial-gradient(900px 520px at 18% 8%, rgba(16,185,129,.24) 0, transparent 60%),
            radial-gradient(760px 540px at 86% 16%, rgba(244,208,63,.18) 0, transparent 58%),
            radial-gradient(1000px 600px at 50% 92%, rgba(255,255,255,.08) 0, transparent 60%),
            linear-gradient(180deg, #020617 0%, #000000 100%);
          color:#E5E7EB;
        }

        .aid{ min-height:100vh; }
        .wrap{
          max-width: 1180px;
          margin: 0 auto;
          padding: 26px 16px 90px;
        }

        /* Top */
        .top{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:16px;
          margin-bottom:16px;
        }
        @media (max-width: 900px){ .top{ flex-direction:column; align-items:flex-start; } }

        .brand{
          display:inline-flex;
          gap:12px;
          align-items:center;
        }
        .logo{
          width:42px; height:42px; border-radius:15px;
          background: radial-gradient(circle at 30% 20%, #6EE7B7 0, var(--emerald) 45%, #022c22 100%);
          box-shadow: 0 14px 38px rgba(5,150,105,.45);
        }
        .btxt{ display:flex; flex-direction:column; }
        .bname{
          font-weight:900;
          letter-spacing:.12em;
          text-transform:uppercase;
          font-size:1rem;
        }
        .btag{ color: rgba(226,232,240,.75); font-size:.92rem; }

        .pill{
          border: 1px solid rgba(148,163,184,.45);
          background: rgba(15,23,42,.62);
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
        .idot{
          width:10px; height:10px; border-radius:999px;
          box-shadow: 0 0 14px rgba(244,208,63,.25);
          display:inline-block;
        }

        /* Shared cards */
        .card{
          border-radius: 20px;
          background: rgba(15,23,42,.90);
          border: 1px solid rgba(148,163,184,.55);
          box-shadow: 0 18px 60px rgba(15,23,42,.78);
          padding: 14px;
        }
        .glass{
          background: rgba(15,23,42,.70);
          border: 1px solid rgba(148,163,184,.45);
          backdrop-filter: blur(12px);
        }
        .cardSoft{
          border-radius: 18px;
          background: rgba(2,6,23,.48);
          border: 1px solid rgba(148,163,184,.35);
          padding: 12px;
        }
        .ct{ font-weight: 950; margin:0 0 4px; color:#F9FAFB; }
        .csub{ color: rgba(203,213,225,.85); margin:0; font-size:.93rem; line-height:1.4; }

        .badge{
          display:inline-flex;
          align-items:center;
          gap:8px;
          border-radius:999px;
          padding: 6px 10px;
          font-weight: 900;
          font-size: 11px;
          color: rgba(255,255,255,.86);
          white-space: nowrap;
        }

        .btn{
          border:none;
          border-radius:999px;
          padding: 10px 14px;
          font-weight: 950;
          cursor:pointer;
          text-decoration:none;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          letter-spacing:.01em;
          transition: transform .12s ease, filter .12s ease, background .12s ease;
          user-select:none;
        }
        .btn:active{ transform: translateY(1px) scale(.99); }
        .btnPrimary{
          background: linear-gradient(135deg, var(--emerald), #22C55E);
          color: #ECFDF5;
          box-shadow: 0 14px 40px rgba(16,185,129,.42);
        }
        .btnGold{
          background: linear-gradient(135deg, rgba(244,208,63,.95), #F59E0B);
          color: rgba(15,23,42,.95);
          box-shadow: 0 14px 40px rgba(244,208,63,.18);
        }
        .btnGhost{
          background: rgba(2,6,23,.55);
          border: 1px solid rgba(148,163,184,.55);
          color: #E5E7EB;
        }

        .mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

        /* Configure */
        .hero{
          display:grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, .8fr);
          gap: 14px;
          margin-top: 10px;
          align-items: stretch;
        }
        @media (max-width: 980px){ .hero{ grid-template-columns: 1fr; } }

        .eyebrow{
          font-size:.86rem;
          letter-spacing:.18em;
          text-transform:uppercase;
          color: rgba(226,232,240,.70);
          margin-bottom: 6px;
        }
        .h1{
          margin: 0 0 8px;
          font-size: clamp(2.05rem, 3.2vw, 2.85rem);
          letter-spacing: -0.04em;
          line-height: 1.08;
          color: #F9FAFB;
          text-shadow: 0 2px 22px rgba(0,0,0,.55);
        }
        .h1 span{
          background: linear-gradient(120deg, var(--gold), #F59E0B);
          -webkit-background-clip:text;
          background-clip:text;
          color: transparent;
          text-shadow:none;
        }

        .grid2{
          display:grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 12px;
          margin-top: 12px;
        }
        @media (max-width: 980px){ .grid2{ grid-template-columns:1fr; } }

        .row{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 16px;
          background: rgba(2,6,23,.55);
          border: 1px solid rgba(148,163,184,.40);
        }
        .kvl{ color: rgba(226,232,240,.82); font-size:.9rem; }
        .kvr{ color: #E5E7EB; font-weight: 950; font-size:.92rem; }

        .pillRow{
          display:flex;
          flex-wrap:wrap;
          gap: 8px;
          margin-top: 10px;
        }
        .pillBtn{
          border-radius:999px;
          border: 1px solid rgba(148,163,184,.55);
          background: rgba(15,23,42,.80);
          color:#E5E7EB;
          padding: 7px 11px;
          font-size:.86rem;
          cursor:pointer;
          transition: transform .12s ease, border-color .12s ease, background .12s ease;
        }
        .pillBtn:hover{ transform: translateY(-1px); }
        .pillBtnActive{
          background: rgba(4,120,87,.85);
          border-color: rgba(244,208,63,.70);
          color:#ECFDF5;
          box-shadow: 0 14px 34px rgba(4,120,87,.28);
        }

        .gridInputs{
          display:grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        @media (max-width: 720px){ .gridInputs{ grid-template-columns: 1fr; } }
        .label{
          color: rgba(226,232,240,.75);
          font-size: .84rem;
          font-weight: 850;
        }
        .in{
          width:100%;
          margin-top: 6px;
          padding: 9px 10px;
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,.55);
          background: rgba(2,6,23,.55);
          color:#E5E7EB;
          outline:none;
          font-size:.95rem;
        }
        .in:focus{
          border-color: rgba(16,185,129,.75);
          box-shadow: 0 0 0 1px rgba(4,120,87,.38);
        }

        /* Reveal */
        .revealWrap{
          margin-top: 14px;
          display:grid;
          grid-template-columns: 270px minmax(0, 1fr);
          gap: 12px;
        }
        @media (max-width: 980px){ .revealWrap{ grid-template-columns: 1fr; } }

        .side{
          position: sticky;
          top: 14px;
          align-self: start;
        }
        @media (max-width: 980px){ .side{ position: static; } }

        .navBtn{
          width:100%;
          text-align:left;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,.40);
          background: rgba(2,6,23,.45);
          color:#E5E7EB;
          padding: 10px 12px;
          cursor:pointer;
          transition: transform .12s ease, background .12s ease, border-color .12s ease;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
        }
        .navBtn:hover{ transform: translateY(-1px); }
        .navActive{
          background: radial-gradient(circle at top left, rgba(4,120,87,.42), rgba(15,23,42,.82));
          border-color: rgba(244,208,63,.55);
          box-shadow: 0 18px 55px rgba(4,120,87,.25);
        }

        /* Data grid */
        .gridShell{
          border-radius: 20px;
          overflow:hidden;
          border: 1px solid rgba(148,163,184,.45);
          background: rgba(15,23,42,.86);
          box-shadow: 0 18px 60px rgba(0,0,0,.35);
        }
        .gridTop{
          padding: 12px 12px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
          background: rgba(2,6,23,.42);
          border-bottom: 1px solid rgba(148,163,184,.30);
        }
        .search{
          flex:1;
          display:flex;
          align-items:center;
          gap: 10px;
        }
        .search input{
          width:100%;
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,.45);
          background: rgba(2,6,23,.55);
          padding: 9px 10px;
          color:#E5E7EB;
          outline:none;
          font-size:.95rem;
        }

        .gridHead{
          display:grid;
          grid-template-columns: 72px minmax(240px, 1.2fr) 130px 190px 110px 95px;
          gap: 0px;
          padding: 10px 12px;
          font-size: 12px;
          font-weight: 950;
          color: rgba(226,232,240,.70);
          background: rgba(2,6,23,.55);
          border-bottom: 1px solid rgba(148,163,184,.22);
        }
        .hcell{
          cursor:pointer;
          user-select:none;
          display:flex;
          align-items:center;
          gap:8px;
        }
        .sortArrow{
          opacity: .8;
          font-size: 12px;
        }
        .gridBody{
          max-height: 460px;
          overflow:auto;
        }
        .rowGrid{
          display:grid;
          grid-template-columns: 72px minmax(240px, 1.2fr) 130px 190px 110px 95px;
          padding: 10px 12px;
          gap:0px;
          border-bottom: 1px solid rgba(148,163,184,.16);
          transition: background .12s ease;
          cursor:pointer;
        }
        .rowGrid:hover{ background: rgba(255,255,255,.03); }
        .rowSel{ background: rgba(244,208,63,.06); }

        .cellMain{
          font-weight: 950;
          color:#F9FAFB;
          font-size:.95rem;
        }
        .cellSub{
          font-size:.84rem;
          color: rgba(203,213,225,.80);
          margin-top:2px;
          line-height:1.25;
        }
        .status{
          display:inline-flex;
          align-items:center;
          gap:8px;
          border-radius: 999px;
          padding: 6px 10px;
          font-weight: 950;
          font-size: 11px;
          border: 1px solid rgba(148,163,184,.35);
          background: rgba(2,6,23,.45);
          width: fit-content;
        }
        .statusReady{ border-color: rgba(16,185,129,.30); background: rgba(16,185,129,.08); }
        .statusPaused{ border-color: rgba(148,163,184,.35); background: rgba(255,255,255,.04); }
        .statusRunning{ border-color: rgba(244,208,63,.35); background: rgba(244,208,63,.08); }
        .statusError{ border-color: rgba(239,68,68,.35); background: rgba(239,68,68,.08); }

        /* Drawer */
        .overlay{
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.55);
          z-index: 30;
        }
        .drawer{
          position: fixed;
          top: 0;
          right: 0;
          height: 100vh;
          width: min(520px, 100%);
          z-index: 40;
          background: rgba(15,23,42,.90);
          border-left: 1px solid rgba(148,163,184,.35);
          backdrop-filter: blur(14px);
          padding: 16px;
          box-shadow: -20px 0 70px rgba(0,0,0,.45);
        }

        /* Toast */
        .toast{
          position: fixed;
          top: 14px;
          right: 14px;
          z-index: 60;
          width: 340px;
          border-radius: 18px;
          padding: 12px 12px;
          background: rgba(15,23,42,.92);
          border: 1px solid rgba(148,163,184,.35);
          box-shadow: 0 18px 70px rgba(0,0,0,.45);
        }
      `}</style>

      <div className="wrap">
        {/* Top */}
        <header className="top">
          <div className="brand">
            <div className="logo" />
            <div className="btxt">
              <div className="bname">ALL IN DIGITAL</div>
              <div className="btag">Client-Ready Stack Workspace (Billing + Ops + Deliverables)</div>
            </div>
          </div>

          <div className="pill">
            <IconDot tone={mode === "workspace" ? "emerald" : "gold"} />
            <span>{mode === "workspace" ? "Workspace active • deliverables visible" : "Configure → Reveal workspace"}</span>
          </div>
        </header>

        {/* CONFIGURE */}
        {mode === "configure" ? (
          <section className="hero">
            <div className="card">
              <div className="eyebrow">Front-end reveal experience</div>
              <h1 className="h1">
                A <span>client-ready stack</span> that looks like it costs $5,000 to install.
              </h1>
              <p className="csub" style={{ fontSize: "1.02rem", maxWidth: 820 }}>
                Don’t show “options.” Show a configured system: workflows, health, audit trail, and modules. Submit below to reveal the workspace view.
              </p>

              <div className="pillRow">
                <PillButton active={plan === "demo"} onClick={() => setPlan("demo")}>
                  Demo
                </PillButton>
                <PillButton active={plan === "week197"} onClick={() => setPlan("week197")}>
                  $197 week
                </PillButton>
                <PillButton active={plan === "monthly750"} onClick={() => setPlan("monthly750")}>
                  $750/mo
                </PillButton>
                <PillButton active={plan === "monthly1500"} onClick={() => setPlan("monthly1500")}>
                  $1,500/mo
                </PillButton>
              </div>

              <div className="grid2">
                <div className="cardSoft">
                  <div className="ct">{meta.title}</div>
                  <p className="csub">{meta.highlight}</p>
                  <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <Badge tone="gold">{meta.price}</Badge>
                    <Badge tone="emerald">{meta.delivery}</Badge>
                    <Badge>{meta.cap}</Badge>
                  </div>
                </div>

                <div className="cardSoft">
                  <div className="ct">What gets revealed</div>
                  <p className="csub">
                    A workspace view with a smooth data grid, audit trail, modules, and “run simulation” controls for screen share.
                  </p>
                  <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <Badge tone="emerald">Workflows</Badge>
                    <Badge>Health</Badge>
                    <Badge>Activity</Badge>
                    <Badge tone="gold">Modules</Badge>
                  </div>
                </div>
              </div>

              <div className="gridInputs">
                <div>
                  <div className="label">Workspace name</div>
                  <input className="in" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div>
                  <div className="label">Territory key</div>
                  <input className="in mono" value={territoryKey} onChange={(e) => setTerritoryKey(e.target.value)} />
                </div>

                <div>
                  <div className="label">Primary calendar</div>
                  <select className="in" value={primaryCalendar} onChange={(e) => setPrimaryCalendar(e.target.value)}>
                    <option value="Google Calendar">Google Calendar</option>
                    <option value="GoHighLevel Calendar">GoHighLevel Calendar</option>
                    <option value="Other (custom)">Other (custom)</option>
                  </select>
                </div>
                <div>
                  <div className="label">Primary notifications</div>
                  <select className="in" value={notifyChannel} onChange={(e) => setNotifyChannel(e.target.value)}>
                    <option value="Telegram">Telegram</option>
                    <option value="Email">Email</option>
                    <option value="Slack">Slack</option>
                  </select>
                </div>
              </div>

              <div className="cardSoft" style={{ marginTop: 12 }}>
                <div className="ct">Integrations toggles</div>
                <p className="csub">This is visual proof that the build is modular and controlled — not “random automations.”</p>
                <div className="pillRow">
                  {([
                    ["stripe", "Stripe"],
                    ["telnyx", "Telnyx"],
                    ["vapi", "Voice AI"],
                    ["email", "Email"],
                    ["telegram", "Telegram"],
                    ["slack", "Slack"],
                  ] as const).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      className={cx("pillBtn", integrations[k] && "pillBtnActive")}
                      onClick={() => setIntegrations((p) => ({ ...p, [k]: !p[k] }))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className={cx("btn", "btnGold")} onClick={enterWorkspace}>
                  Reveal workspace ↗
                </button>
                <button
                  className={cx("btn", "btnGhost")}
                  onClick={() => {
                    setBusinessName("All In Digital — Client Workspace");
                    setTerritoryKey("TX-AUSTIN-CORE-78701");
                    setPlan("demo");
                    showToast("Reset", "Configuration reset to defaults", "warn");
                  }}
                >
                  Reset
                </button>
              </div>

              <div style={{ marginTop: 10, color: "rgba(203,213,225,.78)", fontSize: ".88rem", lineHeight: 1.45 }}>
                If your “setup fee feels expensive,” it’s usually because your front-end looks like a landing page. Your reveal needs to look like an
                installed product with monitoring, auditability, and modular expansion.
              </div>
            </div>

            <div className="card">
              <div className="ct">Quick snapshot</div>
              <p className="csub">This makes the offer feel like a system, not a service.</p>

              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                <div className="row">
                  <div className="kvl">Territory</div>
                  <div className="kvr mono">{territoryKey}</div>
                </div>
                <div className="row">
                  <div className="kvl">Plan</div>
                  <div className="kvr">{meta.title}</div>
                </div>
                <div className="row">
                  <div className="kvl">Calendar</div>
                  <div className="kvr">{primaryCalendar}</div>
                </div>
                <div className="row">
                  <div className="kvl">Alerts</div>
                  <div className="kvr">{notifyChannel}</div>
                </div>
              </div>

              <div style={{ marginTop: 14 }} className="cardSoft">
                <div className="ct">Top {plan === "week197" ? "5 essentials" : "10 modules"}</div>
                <p className="csub">
                  {plan === "week197"
                    ? "Proof sprint includes the essentials only. That’s deliberate: tight scope = fast install."
                    : "Higher tiers add reporting, usage normalization, and monitoring layers."}
                </p>
                <div className="pillRow">
                  {(plan === "week197" ? moduleRowsForPlan.filter((m) => essentialsTop5.includes(m.key)) : moduleRowsForPlan)
                    .slice(0, plan === "week197" ? 5 : 10)
                    .map((m) => (
                      <Badge key={m.key} tone={essentialsTop5.includes(m.key) ? "gold" : "slate"}>
                        {m.name}
                      </Badge>
                    ))}
                </div>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a className={cx("btn", "btnPrimary")} href="tel:+14695008848">
                  Call 469-500-8848 ↗
                </a>
                <a className={cx("btn", "btnGhost")} href="mailto:info@allindigitalmktg.com">
                  Email info@allindigitalmktg.com ↗
                </a>
              </div>
            </div>
          </section>
        ) : null}

        {/* WORKSPACE */}
        {mode === "workspace" ? (
          <section className="revealWrap">
            <div className={cx("card", "side")}>
              <div className="ct">{businessName}</div>
              <p className="csub">
                Territory <span className="mono">{territoryKey}</span>
              </p>

              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Badge tone="gold">{meta.price}</Badge>
                <Badge tone="emerald">{meta.delivery}</Badge>
                <Badge>{meta.cadence}</Badge>
              </div>

              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                <button className={cx("navBtn", nav === "workflows" && "navActive")} onClick={() => setNav("workflows")}>
                  <span>Workflows</span>
                  <Badge tone="emerald">{kpis.ready}/{kpis.total}</Badge>
                </button>
                <button className={cx("navBtn", nav === "modules" && "navActive")} onClick={() => setNav("modules")}>
                  <span>Modules</span>
                  <Badge tone="gold">{moduleRowsForPlan.length}</Badge>
                </button>
                <button className={cx("navBtn", nav === "activity" && "navActive")} onClick={() => setNav("activity")}>
                  <span>Activity</span>
                  <Badge>{events.length}</Badge>
                </button>
                <button className={cx("navBtn", nav === "settings" && "navActive")} onClick={() => setNav("settings")}>
                  <span>Settings</span>
                  <Badge>Config</Badge>
                </button>
              </div>

              <div className="cardSoft" style={{ marginTop: 12 }}>
                <div className="ct">Health</div>
                <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                  <div className="row">
                    <div className="kvl">Avg success</div>
                    <div className="kvr">{kpis.avgSuccess}%</div>
                  </div>
                  <div className="row">
                    <div className="kvl">Errors</div>
                    <div className="kvr">{kpis.error}</div>
                  </div>
                  <div className="row">
                    <div className="kvl">Paused</div>
                    <div className="kvr">{kpis.paused}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                <button className={cx("btn", "btnGold")} onClick={simulateRun}>
                  Simulate run
                </button>
                <button
                  className={cx("btn", "btnGhost")}
                  onClick={() => {
                    setMode("configure");
                    setDrawerOpen(false);
                    setSelectedId(null);
                    showToast("Back to configure", "Edit configuration and reveal again", "warn");
                  }}
                >
                  Back to configure
                </button>
              </div>
            </div>

            <div>
              {/* WORKFLOWS */}
              {nav === "workflows" ? (
                <div className="gridShell">
                  <div className="gridTop">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                      <div>
                        <div className="ct" style={{ marginBottom: 0 }}>
                          Workflow Library
                        </div>
                        <div className="csub">Sorted + searchable grid with details drawer.</div>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        <Badge tone="emerald">Ready {kpis.ready}</Badge>
                        <Badge tone="gold">Avg {kpis.avgSuccess}%</Badge>
                        <Badge>Plan: {meta.title}</Badge>
                      </div>
                    </div>

                    <div className="search">
                      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search workflows, triggers, notes…" />
                      <button
                        className={cx("btn", "btnGhost")}
                        onClick={() => showToast("Export", "This would export JSON + runbook in production.", "ok")}
                        style={{ padding: "10px 12px" }}
                      >
                        Export
                      </button>
                    </div>
                  </div>

                  <div className="gridHead">
                    <div className="hcell" onClick={() => toggleSort("id")}>
                      ID {sortKey === "id" ? <span className="sortArrow">{sortDir === "asc" ? "▲" : "▼"}</span> : null}
                    </div>
                    <div className="hcell" onClick={() => toggleSort("name")}>
                      Name {sortKey === "name" ? <span className="sortArrow">{sortDir === "asc" ? "▲" : "▼"}</span> : null}
                    </div>
                    <div className="hcell" onClick={() => toggleSort("status")}>
                      Status {sortKey === "status" ? <span className="sortArrow">{sortDir === "asc" ? "▲" : "▼"}</span> : null}
                    </div>
                    <div className="hcell" onClick={() => toggleSort("lastRun")}>
                      Last run {sortKey === "lastRun" ? <span className="sortArrow">{sortDir === "asc" ? "▲" : "▼"}</span> : null}
                    </div>
                    <div className="hcell" onClick={() => toggleSort("runs7d")}>
                      Runs 7d {sortKey === "runs7d" ? <span className="sortArrow">{sortDir === "asc" ? "▲" : "▼"}</span> : null}
                    </div>
                    <div className="hcell" onClick={() => toggleSort("successRate")}>
                      Success {sortKey === "successRate" ? <span className="sortArrow">{sortDir === "asc" ? "▲" : "▼"}</span> : null}
                    </div>
                  </div>

                  <div className="gridBody">
                    {workflows.map((w) => {
                      const sel = w.id === selectedId;
                      const statusClass =
                        w.status === "Ready"
                          ? "statusReady"
                          : w.status === "Paused"
                          ? "statusPaused"
                          : w.status === "Running"
                          ? "statusRunning"
                          : "statusError";

                      const dotTone =
                        w.status === "Ready" ? "emerald" : w.status === "Running" ? "gold" : w.status === "Error" ? "red" : "slate";

                      return (
                        <div
                          key={w.id}
                          className={cx("rowGrid", sel && "rowSel")}
                          onClick={() => {
                            setSelectedId(w.id);
                            setDrawerOpen(true);
                          }}
                        >
                          <div className="mono cellMain">{w.id}</div>

                          <div>
                            <div className="cellMain">{w.name}</div>
                            <div className="cellSub">{w.trigger}</div>
                          </div>

                          <div>
                            <div className={cx("status", statusClass)}>
                              <IconDot tone={dotTone as any} />
                              {w.status}
                            </div>
                            <div className="cellSub" style={{ marginTop: 6 }}>
                              Tier: <span className="mono">{w.tier}</span>
                            </div>
                          </div>

                          <div>
                            <div className="cellMain">{formatDate(w.lastRun)}</div>
                            <div className="cellSub">
                              Next: {w.nextRun ? formatDate(w.nextRun) : "—"}
                            </div>
                          </div>

                          <div className="cellMain">{w.runs7d}</div>

                          <div className="cellMain">{w.successRate}%</div>
                        </div>
                      );
                    })}
                    {!workflows.length ? (
                      <div style={{ padding: 18, color: "rgba(203,213,225,.78)" }}>No results.</div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* MODULES */}
              {nav === "modules" ? (
                <div className="card">
                  <div className="ct">Modules you can plug in</div>
                  <p className="csub">
                    This is what makes your $5k setup feel justified: a modular system with clear expansion paths, not a one-off build.
                  </p>

                  <div className="cardSoft" style={{ marginTop: 12 }}>
                    <div className="ct">Top 10 (with Top 5 highlighted)</div>
                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {modules.map((m) => (
                        <Badge key={m.key} tone={essentialsTop5.includes(m.key) ? "gold" : "slate"}>
                          {m.key} • {m.name}
                        </Badge>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, color: "rgba(203,213,225,.78)", fontSize: ".88rem" }}>
                      Proof sprint ($197) includes: <span className="mono">{essentialsTop5.join(", ")}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                    {moduleRowsForPlan.map((m) => (
                      <div key={m.key} className="row" style={{ alignItems: "flex-start" }}>
                        <div style={{ display: "grid", gap: 4 }}>
                          <div className="kvr">
                            {m.name}{" "}
                            {essentialsTop5.includes(m.key) ? <Badge tone="gold">Top 5</Badge> : null}
                          </div>
                          <div className="csub">{m.value}</div>
                          <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <Badge tone="emerald">{m.category}</Badge>
                            <Badge>{m.complexity}</Badge>
                          </div>
                        </div>

                        <button
                          className={cx("btn", "btnGhost")}
                          style={{ padding: "10px 12px", borderRadius: 16, minWidth: 120 }}
                          onClick={() => showToast("Module added (demo)", `${m.name} staged for provisioning`, "ok")}
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* ACTIVITY */}
              {nav === "activity" ? (
                <div className="card">
                  <div className="ct">Activity / Audit trail</div>
                  <p className="csub">This is the “proof layer.” Without this, your offer looks like invisible automation.</p>

                  <div className="gridShell" style={{ marginTop: 12 }}>
                    <div className="gridHead" style={{ gridTemplateColumns: "110px 140px 150px minmax(220px, 1fr) 90px" }}>
                      <div>ID</div>
                      <div>Time</div>
                      <div>Source</div>
                      <div>Message</div>
                      <div>Outcome</div>
                    </div>

                    <div className="gridBody" style={{ maxHeight: 520 }}>
                      {events.map((e) => {
                        const tone = e.outcome === "ok" ? "emerald" : e.outcome === "warn" ? "gold" : "red";
                        return (
                          <div
                            key={e.id}
                            className="rowGrid"
                            style={{ gridTemplateColumns: "110px 140px 150px minmax(220px, 1fr) 90px" }}
                            onClick={() => showToast(e.type, e.message, e.outcome === "ok" ? "ok" : e.outcome === "warn" ? "warn" : "fail")}
                          >
                            <div className="mono cellMain">{e.id}</div>
                            <div className="cellMain">{formatDate(e.ts)}</div>
                            <div className="cellMain">{e.source}</div>
                            <div>
                              <div className="cellMain">{e.type}</div>
                              <div className="cellSub">{e.message}</div>
                            </div>
                            <div className={cx("status", tone === "emerald" ? "statusReady" : tone === "gold" ? "statusRunning" : "statusError")}>
                              <IconDot tone={tone as any} />
                              {e.outcome}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* SETTINGS */}
              {nav === "settings" ? (
                <div className="card">
                  <div className="ct">Workspace configuration</div>
                  <p className="csub">In production this would map to your client_config row + environment settings.</p>

                  <div className="grid2">
                    <div className="cardSoft">
                      <div className="ct">Core</div>
                      <div style={{ marginTop: 8, display: "grid", gap: 10 }}>
                        <div className="row">
                          <div className="kvl">Workspace</div>
                          <div className="kvr">{businessName}</div>
                        </div>
                        <div className="row">
                          <div className="kvl">Plan</div>
                          <div className="kvr">{meta.title}</div>
                        </div>
                        <div className="row">
                          <div className="kvl">Territory key</div>
                          <div className="kvr mono">{territoryKey}</div>
                        </div>
                      </div>
                    </div>

                    <div className="cardSoft">
                      <div className="ct">Integrations</div>
                      <div className="pillRow" style={{ marginTop: 8 }}>
                        {Object.entries(integrations).map(([k, v]) => (
                          <Badge key={k} tone={v ? "emerald" : "slate"}>
                            {k.toUpperCase()} {v ? "ON" : "OFF"}
                          </Badge>
                        ))}
                      </div>

                      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                        <div className="row">
                          <div className="kvl">Calendar</div>
                          <div className="kvr">{primaryCalendar}</div>
                        </div>
                        <div className="row">
                          <div className="kvl">Notify</div>
                          <div className="kvr">{notifyChannel}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      className={cx("btn", "btnGold")}
                      onClick={() => showToast("Saved (demo)", "Config would persist + trigger provisioning workflow.", "ok")}
                    >
                      Save
                    </button>
                    <button className={cx("btn", "btnGhost")} onClick={() => showToast("Export (demo)", "Would export runbook + config JSON.", "ok")}>
                      Export runbook
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Drawer */}
            {drawerOpen && selected ? (
              <>
                <div className="overlay" onClick={() => setDrawerOpen(false)} />
                <div className="drawer" onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div className="eyebrow">Workflow details</div>
                      <div className="ct" style={{ marginTop: -2 }}>
                        {selected.id} • {selected.name}
                      </div>
                      <div className="csub" style={{ marginTop: 6 }}>
                        Trigger: <span className="mono">{selected.trigger}</span>
                      </div>
                      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Badge tone={selected.status === "Ready" ? "emerald" : selected.status === "Running" ? "gold" : "slate"}>
                          {selected.status}
                        </Badge>
                        <Badge>Tier: {selected.tier}</Badge>
                        <Badge tone="gold">Success {selected.successRate}%</Badge>
                      </div>
                    </div>

                    <button className={cx("btn", "btnGhost")} style={{ padding: "10px 12px" }} onClick={() => setDrawerOpen(false)}>
                      Close
                    </button>
                  </div>

                  <div className="cardSoft" style={{ marginTop: 14 }}>
                    <div className="ct">Notes</div>
                    <p className="csub">{selected.notes}</p>
                  </div>

                  <div className="grid2" style={{ marginTop: 12 }}>
                    <div className="cardSoft">
                      <div className="ct">Runs</div>
                      <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                        <div className="row">
                          <div className="kvl">Last run</div>
                          <div className="kvr">{formatDate(selected.lastRun)}</div>
                        </div>
                        <div className="row">
                          <div className="kvl">Next run</div>
                          <div className="kvr">{selected.nextRun ? formatDate(selected.nextRun) : "—"}</div>
                        </div>
                        <div className="row">
                          <div className="kvl">Runs (7d)</div>
                          <div className="kvr">{selected.runs7d}</div>
                        </div>
                      </div>
                    </div>

                    <div className="cardSoft">
                      <div className="ct">Actions</div>
                      <div style={{ marginTop: 8, display: "grid", gap: 10 }}>
                        <button
                          className={cx("btn", "btnPrimary")}
                          onClick={() => showToast("Run (demo)", "Would execute the workflow with a safe test payload.", "ok")}
                        >
                          Run test
                        </button>
                        <button
                          className={cx("btn", "btnGhost")}
                          onClick={() => showToast("Export (demo)", "Would export JSON + dependency manifest.", "ok")}
                        >
                          Export JSON
                        </button>
                        <button
                          className={cx("btn", "btnGhost")}
                          onClick={() => showToast("Audit (demo)", "Would open node-level logs + payload snapshots.", "ok")}
                        >
                          View logs
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, color: "rgba(203,213,225,.78)", fontSize: ".88rem", lineHeight: 1.45 }}>
                    If you want this to feel even more “enterprise,” the next step is adding a **Runbook tab** (SOP + steps + failure handling)
                    inside the drawer. That’s what makes buyers stop arguing about price.
                  </div>
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {/* Toast */}
        {toast.on ? (
          <div
            className="toast"
            style={{
              borderColor:
                toast.tone === "ok"
                  ? "rgba(16,185,129,.35)"
                  : toast.tone === "warn"
                  ? "rgba(244,208,63,.35)"
                  : "rgba(239,68,68,.35)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 950, color: "#F9FAFB", fontSize: ".96rem" }}>{toast.title}</div>
                <div style={{ marginTop: 4, color: "rgba(203,213,225,.85)", fontSize: ".88rem", lineHeight: 1.35 }}>{toast.msg}</div>
              </div>
              <button className={cx("btn", "btnGhost")} style={{ padding: "8px 10px", borderRadius: 14 }} onClick={() => setToast((t) => ({ ...t, on: false }))}>
                ✕
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}