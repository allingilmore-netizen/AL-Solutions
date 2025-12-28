"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

type Track = "sales" | "local" | null;
type Step = "pick" | "details";

const BRAND = {
  emerald: "#047857",
  emeraldDark: "#065f46",
  gold: "#F4D03F",
  charcoal: "#0F172A",
  muted: "#9CA3AF",
  deepBg: "#020617",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Lead submit:
 * - If NEXT_PUBLIC_LEAD_WEBHOOK_URL is set, POSTs to that endpoint.
 * - Otherwise POSTs to /api/lead (placeholder).
 *
 * No vendor/tool names are mentioned on-page. This is just the front door.
 */
async function sendLead(formData: FormData) {
  const firstName = String(formData.get("firstName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const businessType = String(formData.get("businessType") || "").trim();
  const website = String(formData.get("website") || "").trim();
  const track = String(formData.get("track") || "").trim();
  const consent = formData.get("consent") === "on";

  const payload = {
    firstName,
    name: firstName,
    email,
    phone,
    businessType,
    website,
    track, // "sales" | "local"
    consent,
    source: "Landing Page – Web Form",
    createdAt: new Date().toISOString(),
  };

  const directWebhook = process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL;
  const url = directWebhook && directWebhook.length > 10 ? directWebhook : "/api/lead";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    // non-JSON ok
  }

  return { ok: res.ok && (data?.ok ?? true), data };
}

function SectionHeading(props: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="secHead fade-on-scroll">
      <div className="kicker">{props.kicker}</div>
      <h2 className="h2">{props.title}</h2>
      {props.sub ? <p className="sub">{props.sub}</p> : null}
    </div>
  );
}

function Pill(props: { active?: boolean; onClick?: () => void; children: any }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cx("pill", props.active && "pillActive")}
    >
      {props.children}
    </button>
  );
}

function Accordion(props: { title: string; children: any; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(props.defaultOpen));
  return (
    <div className={cx("acc", open && "accOpen")}>
      <button
        type="button"
        className="accBtn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="accTitle">{props.title}</div>
        <div className="accIcon">{open ? "–" : "+"}</div>
      </button>
      {open ? <div className="accBody">{props.children}</div> : null}
    </div>
  );
}

type DemoPhase =
  | "idle"
  | "submitted"
  | "sms_countdown"
  | "sms_sent"
  | "call_countdown"
  | "call_now";

export default function Page() {
  const [track, setTrack] = useState<Track>(null);
  const [step, setStep] = useState<Step>("pick");

  // form UX
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // script expand
  const [showScriptOutline, setShowScriptOutline] = useState(true);
  const [showPersonalization, setShowPersonalization] = useState(false);

  // cadence toggle (NEW)
  const [showFullCadence, setShowFullCadence] = useState(false);

  // Demo countdown UX
  const [demoPhase, setDemoPhase] = useState<DemoPhase>("idle");
  const [smsSeconds, setSmsSeconds] = useState<number>(5);
  const [callSeconds, setCallSeconds] = useState<number>(20);

  const trackLabel = useMemo(() => {
    if (track === "sales") return "Sales Teams";
    if (track === "local") return "Local Businesses";
    return "your business";
  }, [track]);

  const trackSub = useMemo(() => {
    if (track === "sales") return "Demos, discovery calls, consults, pipelines.";
    if (track === "local") return "Med spa, dental, home services, showrooms, etc.";
    return "Pick one so the examples match your world.";
  }, [track]);

  const jumpTo = (id: string) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleContinue = () => {
    if (!track) return;
    setStep("details");
    setTimeout(() => jumpTo("leadForm"), 50);
  };

  useEffect(() => {
    if (!submitted) return;

    if (demoPhase === "submitted") {
      setSmsSeconds(5);
      setCallSeconds(20);
      setDemoPhase("sms_countdown");
      return;
    }

    if (demoPhase === "sms_countdown") {
      const t = window.setInterval(() => {
        setSmsSeconds((s) => {
          if (s <= 1) {
            window.clearInterval(t);
            setDemoPhase("sms_sent");
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return () => window.clearInterval(t);
    }

    if (demoPhase === "sms_sent") {
      const t = window.setTimeout(() => setDemoPhase("call_countdown"), 700);
      return () => window.clearTimeout(t);
    }

    if (demoPhase === "call_countdown") {
      const t = window.setInterval(() => {
        setCallSeconds((s) => {
          if (s <= 1) {
            window.clearInterval(t);
            setDemoPhase("call_now");
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return () => window.clearInterval(t);
    }
  }, [submitted, demoPhase]);

  const demoStatus = useMemo(() => {
    if (!submitted) return null;

    if (demoPhase === "sms_countdown") {
      return {
        title: "Demo running…",
        line1: `Text in ${smsSeconds}s`,
        line2: `Then a call ~15–20s after the text.`,
        accent: "emerald",
      };
    }
    if (demoPhase === "sms_sent") {
      return {
        title: "Text sent ✅",
        line1: "Now triggering your call…",
        line2: "Answer to experience the booking flow.",
        accent: "gold",
      };
    }
    if (demoPhase === "call_countdown") {
      return {
        title: "Call on the way…",
        line1: `Call in ${callSeconds}s`,
        line2: "If missed, the follow-up cadence continues automatically.",
        accent: "emerald",
      };
    }
    if (demoPhase === "call_now") {
      return {
        title: "Call should be coming in now 📞",
        line1: "Answer the call to route into the AI booking flow.",
        line2: "If you miss it, you’ll see the next touches fire.",
        accent: "gold",
      };
    }

    return {
      title: "Submitted ✅",
      line1: "Watch for the text first.",
      line2: "Then the call comes right after.",
      accent: "emerald",
    };
  }, [submitted, demoPhase, smsSeconds, callSeconds]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      fd.set("track", track ?? "");

      const result = await sendLead(fd);

      if (!result.ok) {
        setSubmitError("Something went wrong. Please try again.");
        setSubmitted(false);
        setDemoPhase("idle");
      } else {
        setSubmitted(true);
        setDemoPhase("submitted");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Something went wrong. Please try again.");
      setSubmitted(false);
      setDemoPhase("idle");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page">
      <style>{`
        :root {
          --emerald: ${BRAND.emerald};
          --emeraldDark: ${BRAND.emeraldDark};
          --gold: ${BRAND.gold};
          --charcoal: ${BRAND.charcoal};
          --muted: ${BRAND.muted};
          --deepBg: ${BRAND.deepBg};
        }

        body {
          margin: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
          background: radial-gradient(circle at top, #022c22 0, #020617 55%, #000000 100%);
          color: #E5E7EB;
          font-size: 20px;
        }

        .page { min-height: 100vh; }

        .wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 28px 16px 110px;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 22px;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .logo {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: radial-gradient(circle at 30% 20%, #6EE7B7 0, var(--emerald) 45%, #022c22 100%);
          box-shadow: 0 12px 28px rgba(5, 150, 105, 0.45);
        }

        .brandText { display: flex; flex-direction: column; }
        .brandName {
          font-weight: 800;
          letter-spacing: 0.10em;
          font-size: 0.98rem;
          text-transform: uppercase;
        }
        .brandTag {
          font-size: 0.86rem;
          color: var(--muted);
        }

        .pillTop {
          border-radius: 999px;
          border: 1px solid rgba(148,163,184,0.6);
          padding: 8px 14px;
          font-size: 0.9rem;
          background: rgba(15,23,42,0.7);
          backdrop-filter: blur(12px);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 20%, #BBF7D0 0, #22C55E 40%, #166534 100%);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.7);
        }

        @media (max-width: 780px) {
          .header { flex-direction: column; align-items: flex-start; }
        }

        .hero {
          border-radius: 24px;
          padding: 26px 22px;
          background: radial-gradient(circle at top left, rgba(4, 120, 87, 0.40), rgba(15, 23, 42, 0.95));
          border: 1px solid rgba(148, 163, 184, 0.35);
          box-shadow: 0 24px 80px rgba(15, 23, 42, 0.85), 0 0 0 1px rgba(15, 23, 42, 0.7);
        }

        .grid {
          display: grid;
          grid-template-columns: 1.15fr 0.95fr;
          gap: 22px;
          align-items: start;
        }
        @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(15,23,42,0.8);
          border: 1px solid rgba(148,163,184,0.5);
          font-size: 0.9rem;
          color: var(--muted);
          margin-bottom: 12px;
        }

        .eyebrow span {
          padding: 2px 9px;
          border-radius: 999px;
          background: rgba(4, 120, 87, 0.18);
          color: #A7F3D0;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .h1 {
          margin: 0 0 12px;
          font-size: clamp(2.1rem, 3.3vw, 3.0rem);
          line-height: 1.06;
          letter-spacing: -0.04em;
        }

        .hl {
          background: linear-gradient(120deg, var(--gold), #F9A826);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .p {
          margin: 0 0 14px;
          font-size: 1.05rem;
          line-height: 1.65;
          color: #CBD5F5;
          max-width: 650px;
        }

        .ctaRow {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
          align-items: center;
        }

        .btnPrimary, .btnGhost {
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-weight: 800;
          font-size: 1rem;
          padding: 11px 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, opacity 0.15s ease;
        }

        .btnPrimary {
          background: linear-gradient(135deg, var(--emerald), #22C55E);
          color: #ECFDF5;
          box-shadow: 0 14px 40px rgba(16, 185, 129, 0.45);
        }
        .btnPrimary:hover { transform: translateY(-1px); box-shadow: 0 18px 52px rgba(16, 185, 129, 0.65); }

        .btnGhost {
          background: rgba(15,23,42,0.8);
          border: 1px solid rgba(148,163,184,0.7);
          color: #E5E7EB;
          font-weight: 800;
        }
        .btnGhost:hover { background: rgba(15,23,42,1); transform: translateY(-1px); }

        .badges { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; font-size: 0.9rem; }
        .badge {
          padding: 5px 11px;
          border-radius: 999px;
          background: rgba(15,23,42,0.85);
          border: 1px solid rgba(148,163,184,0.5);
          color: var(--muted);
        }

        .trackCard {
          background: rgba(15,23,42,0.98);
          border-radius: 18px;
          padding: 14px 14px 12px;
          border: 1px solid rgba(148,163,184,0.55);
          box-shadow: 0 12px 30px rgba(15,23,42,0.95);
          margin-top: 12px;
        }
        .trackTitle { font-size: 1rem; font-weight: 900; margin-bottom: 2px; }
        .trackSub { font-size: 0.9rem; color: var(--muted); margin-bottom: 10px; }
        .pillRow { display: flex; flex-wrap: wrap; gap: 8px; }

        .pill {
          padding: 7px 12px;
          border-radius: 999px;
          border: 1px solid rgba(148,163,184,0.8);
          font-size: 0.9rem;
          background: rgba(15,23,42,0.95);
          color: #E5E7EB;
          cursor: pointer;
          font-weight: 800;
        }
        .pillActive {
          background: rgba(4, 120, 87, 0.9);
          border-color: var(--gold);
          color: #ECFDF5;
        }

        .continueRow {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .continueNote {
          font-size: 0.86rem;
          color: rgba(203, 213, 245, 0.85);
        }

        .formCard {
          background: #FFFFFF;
          color: #0F172A;
          border-radius: 18px;
          padding: 18px 16px 16px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(148, 163, 184, 0.35);
        }
        .formCard h3 {
          margin: 0 0 6px;
          font-size: 1.1rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #111827;
        }
        .formCard p { margin: 0 0 12px; font-size: 0.95rem; color: #4B5563; }

        label { display: block; font-size: 0.9rem; font-weight: 700; margin-bottom: 3px; }
        input {
          width: 100%;
          padding: 9px 10px;
          border-radius: 10px;
          border: 1px solid #D1D5DB;
          font-size: 0.96rem;
          margin-bottom: 10px;
          outline: none;
        }
        input:focus { border-color: var(--emerald); box-shadow: 0 0 0 1px rgba(4, 120, 87, 0.35); }

        .consentRow {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 8px 0 10px;
          padding: 10px 10px;
          border-radius: 12px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(248, 113, 113, 0.9);
          box-shadow: 0 0 0 1px rgba(127, 29, 29, 0.20);
        }
        .consentRow input[type="checkbox"] {
          margin-top: 4px;
          width: auto;
          accent-color: #ef4444;
        }
        .consentText {
          font-size: 0.82rem;
          color: #7F1D1D;
          line-height: 1.35;
        }

        .submitBtn {
          width: 100%;
          border-radius: 999px;
          border: none;
          padding: 10px 12px;
          font-size: 1rem;
          font-weight: 900;
          cursor: pointer;
          background: linear-gradient(135deg, var(--emerald), #059669);
          color: #ECFDF5;
          box-shadow: 0 16px 40px rgba(5, 150, 105, 0.4);
          transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
        }
        .submitBtn:hover { transform: translateY(-1px); box-shadow: 0 20px 52px rgba(5, 150, 105, 0.55); }
        .submitBtn:disabled { opacity: 0.65; cursor: not-allowed; }

        .formNote { margin-top: 10px; font-size: 0.78rem; color: #B91C1C; }
        .success { margin-top: 10px; font-size: 0.86rem; color: var(--emerald); font-weight: 800; }
        .error { margin-top: 10px; font-size: 0.86rem; color: #ef4444; font-weight: 800; }

        .demoPanel {
          margin-top: 12px;
          border-radius: 14px;
          padding: 10px 12px;
          border: 1px solid rgba(15,23,42,0.15);
          background: rgba(15,23,42,0.04);
        }
        .demoTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 6px;
        }
        .demoTitle { font-weight: 900; font-size: 0.95rem; color: #0F172A; }
        .demoBadge {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 1000;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #0F172A;
          border: 1px solid rgba(15,23,42,0.12);
          background: rgba(244, 208, 63, 0.40);
        }
        .demoBadge.emerald { background: rgba(4, 120, 87, 0.14); color: #065F46; }
        .demoBadge.gold { background: rgba(244, 208, 63, 0.50); color: #92400E; }
        .demoLine { font-size: 0.88rem; color: #334155; line-height: 1.35; }

        .section { margin-top: 34px; }
        .secHead { margin-bottom: 14px; }
        .kicker {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--muted);
          margin-bottom: 6px;
        }
        .h2 { margin: 0 0 8px; font-size: 1.65rem; letter-spacing: -0.02em; }
        .sub {
          margin: 0;
          color: #CBD5F5;
          font-size: 1.02rem;
          line-height: 1.6;
          max-width: 860px;
        }

        .cards2 {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 14px;
          align-items: start;
        }
        @media (max-width: 900px) { .cards2 { grid-template-columns: 1fr; } }

        .cards3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          align-items: start;
        }
        @media (max-width: 900px) { .cards3 { grid-template-columns: 1fr; } }

        .card {
          border-radius: 18px;
          padding: 14px 14px 12px;
          background: rgba(15,23,42,0.97);
          border: 1px solid rgba(148,163,184,0.65);
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.80);
        }
        .cardAlt {
          background: radial-gradient(circle at top, rgba(24,24,27,0.96), rgba(15,23,42,0.98));
        }
        .cardTitle { font-size: 1.08rem; font-weight: 1000; margin-bottom: 4px; }
        .cardSub { color: var(--muted); font-size: 0.94rem; margin-bottom: 10px; }

        .list {
          margin: 0;
          padding-left: 18px;
          color: #E5E7EB;
          font-size: 0.98rem;
          line-height: 1.55;
        }
        .list li { margin-bottom: 6px; }

        .timeline { display: grid; gap: 10px; margin-top: 10px; }
        .tItem {
          border-radius: 14px;
          padding: 10px 12px;
          background: rgba(15,23,42,0.92);
          border: 1px solid rgba(148,163,184,0.5);
        }
        .tTop { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; }
        .tLabel { font-weight: 1000; }
        .tTime { color: var(--gold); font-weight: 1000; font-size: 0.95rem; }
        .tDesc { color: var(--muted); font-size: 0.92rem; margin-top: 4px; }

        .acc {
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.65);
          background: rgba(15,23,42,0.96);
          overflow: hidden;
        }
        .accBtn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #E5E7EB;
        }
        .accTitle { font-weight: 1000; font-size: 1rem; text-align: left; }
        .accIcon {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          border: 1px solid rgba(148,163,184,0.65);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          font-weight: 1000;
        }
        .accBody {
          padding: 0 12px 12px;
          color: #CBD5F5;
          font-size: 0.95rem;
          line-height: 1.65;
          white-space: pre-wrap;
        }

        .tiny { font-size: 0.86rem; color: var(--muted); margin-top: 6px; line-height: 1.45; }

        .sticky {
          position: fixed;
          inset-inline: 0;
          bottom: 0;
          z-index: 30;
          padding: 10px 16px 12px;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }
        .stickyInner {
          pointer-events: auto;
          max-width: 860px;
          width: 100%;
          border-radius: 999px;
          background: rgba(15,23,42,0.96);
          border: 1px solid rgba(148,163,184,0.7);
          box-shadow: 0 -10px 40px rgba(15,23,42,0.85);
          padding: 9px 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .stickyText { font-size: 0.95rem; color: #E5E7EB; }
        .stickyText span { color: var(--gold); font-weight: 1000; }
        .stickyBtn {
          border-radius: 999px;
          border: none;
          padding: 9px 16px;
          font-size: 0.98rem;
          font-weight: 1000;
          background: linear-gradient(135deg, var(--emerald), #22C55E);
          color: #ECFDF5;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(16,185,129,0.55);
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .stickyInner { flex-direction: column; align-items: flex-start; border-radius: 20px; }
          .stickyBtn { width: 100%; }
        }

        .fade-on-scroll {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-on-scroll.is-visible { opacity: 1; transform: translateY(0); }

        .footer {
          margin-top: 30px;
          font-size: 0.72rem;
          color: #6B7280;
          text-align: center;
          opacity: 0.85;
        }
        .footer a {
          color: inherit;
          text-decoration: none;
          border-bottom: 1px solid rgba(107,114,128,0.3);
          padding-bottom: 1px;
        }
      `}</style>

      <div className="wrap">
        <header className="header">
          <div className="brand">
            <div className="logo" />
            <div className="brandText">
              <div className="brandName">ALL IN DIGITAL</div>
              <div className="brandTag">AI Phone • SMS • Sales Operating System</div>
            </div>
          </div>
          <div className="pillTop">
            <div className="dot" />
            <span>Speed-to-lead → Booking → Show-rate protection</span>
          </div>
        </header>

        <section className="hero">
          <div className="grid">
            <div>
              <div className="eyebrow">
                <span>Live Demo</span>
                <div>Text in ~5s → Call in ~15–20s</div>
              </div>

              <h1 className="h1">
                More booked calls. <span className="hl">Higher show rates.</span> Cleaner closes.
              </h1>

              <p className="p">
                We install a fast, structured response system that contacts leads immediately,
                routes answered calls into a booking flow, and protects your calendar with
                pre-call training so time doesn’t get wasted.
              </p>

              <div className="badges">
                <div className="badge">Text in ~5 seconds</div>
                <div className="badge">Call in ~15–20 seconds</div>
                <div className="badge">Books your calendar</div>
                <div className="badge">Follow-up runs automatically</div>
              </div>

              <div className="trackCard">
                <div className="trackTitle">Pick your track</div>
                <div className="trackSub">{trackSub}</div>

                <div className="pillRow">
                  <Pill active={track === "sales"} onClick={() => setTrack("sales")}>
                    Sales Teams
                  </Pill>
                  <Pill active={track === "local"} onClick={() => setTrack("local")}>
                    Local Businesses
                  </Pill>
                </div>

                <div className="continueRow">
                  <button
                    type="button"
                    className="btnPrimary"
                    onClick={handleContinue}
                    disabled={!track}
                    style={{ opacity: track ? 1 : 0.7 }}
                  >
                    Continue →
                  </button>
                  <div className="continueNote">
                    This unlocks the sequence + the live demo form for <strong>{trackLabel}</strong>.
                  </div>
                </div>
              </div>
            </div>

            <div>
              {step === "details" ? (
                <form id="leadForm" className="formCard" onSubmit={handleSubmit}>
                  <h3>RUN THE LIVE DEMO</h3>
                  <p>You’ll receive a text first, then a call right after to experience the booking flow.</p>

                  <label htmlFor="firstName">First Name *</label>
                  <input id="firstName" name="firstName" required />

                  <label htmlFor="email">Email *</label>
                  <input id="email" name="email" type="email" required />

                  <label htmlFor="phone">Mobile Number *</label>
                  <input id="phone" name="phone" type="tel" required />

                  <label htmlFor="businessType">Business / Team Type</label>
                  <input
                    id="businessType"
                    name="businessType"
                    placeholder={track === "sales" ? "SaaS, high-ticket, inside sales..." : "Med spa, HVAC, dental, showroom..."}
                  />

                  <label htmlFor="website">Website (optional)</label>
                  <input id="website" name="website" placeholder="https://..." />

                  <input type="hidden" name="track" value={track ?? ""} />

                  <div className="consentRow">
                    <input id="consent" name="consent" type="checkbox" required />
                    <div className="consentText">
                      <strong>Required:</strong> I agree to receive SMS updates related to my inquiry from
                      All In Digital (demo link, confirmations, follow-up I requested). Message
                      frequency may vary. Message &amp; data rates may apply. Reply STOP to opt out
                      and HELP for help. Consent is not a condition of purchase. We do not sell
                      or share your mobile number with third parties for marketing/promotional purposes.
                    </div>
                  </div>

                  <button className="submitBtn" type="submit" disabled={isSubmitting || submitted}>
                    {isSubmitting ? "Sending..." : submitted ? "Submitted — demo running" : "Start the live demo"}
                  </button>

                  <div className="formNote">
                    Heads up: the demo is delivered by SMS. If SMS consent isn’t checked, we can’t run it.
                  </div>

                  {submitError ? <div className="error">{submitError}</div> : null}

                  {submitted ? (
                    <>
                      <div className="success">✅ Submitted. Watch your phone.</div>

                      {demoStatus ? (
                        <div className="demoPanel">
                          <div className="demoTop">
                            <div className="demoTitle">{demoStatus.title}</div>
                            <div className={cx("demoBadge", demoStatus.accent)}>
                              {demoPhase === "call_now" ? "INCOMING" : "LIVE"}
                            </div>
                          </div>
                          <div className="demoLine">{demoStatus.line1}</div>
                          <div className="demoLine">{demoStatus.line2}</div>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </form>
              ) : (
                <div className="card cardAlt">
                  <div className="cardTitle">What you’ll see after you continue</div>
                  <div className="cardSub">Simple. Fast. High-intent.</div>
                  <ul className="list">
                    <li>Speed-to-lead sequence (collapsed view + full view)</li>
                    <li>How answered calls route into booking</li>
                    <li>How missed calls trigger automated follow-up</li>
                    <li>How the pre-call video protects show rate</li>
                  </ul>
                  <div className="tiny">Choose your track on the left, then hit Continue.</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {step === "details" ? (
          <>
            {/* WHAT HAPPENS */}
            <section className="section" id="what-happens">
              <SectionHeading
                kicker="What happens after the form"
                title="Your Speed-to-Lead Sequence"
                sub="Kept short by default. Expand it if you want the full cadence details."
              />

              <div className="cards2">
                <div className="card">
                  <div className="cardTitle">The “short version”</div>
                  <div className="cardSub">This is what matters to a decision-maker.</div>
                  <ul className="list">
                    <li>Lead gets a text in ~5 seconds.</li>
                    <li>Then a call in ~15–20 seconds.</li>
                    <li>If missed, follow-up continues automatically until contact or stop.</li>
                  </ul>

                  <div className="ctaRow" style={{ marginTop: 12 }}>
                    <button
                      className="btnPrimary"
                      type="button"
                      onClick={() => setShowFullCadence((v) => !v)}
                    >
                      {showFullCadence ? "Hide full cadence" : "Show full cadence"}
                    </button>

                    <button className="btnGhost" type="button" onClick={() => jumpTo("leadForm")}>
                      Run the live demo
                    </button>
                  </div>

                  <div className="tiny">
                    If they answer, they route into booking. If they don’t, the cadence keeps working.
                  </div>
                </div>

                <div className="card cardAlt">
                  <div className="cardTitle">What happens when they answer</div>
                  <div className="cardSub">It’s not a “chatbot.” It’s a structured booking flow.</div>
                  <ul className="list">
                    <li>Discovery that pulls pain point → deeper pain → impact → desired outcome.</li>
                    <li>Then routes into booking on your calendar.</li>
                    <li>Then triggers pre-call preparation so they show up ready.</li>
                  </ul>
                </div>
              </div>

              {showFullCadence ? (
                <div className="cards2" style={{ marginTop: 14 }}>
                  <div className="card">
                    <div className="cardTitle">First 5 minutes (expanded)</div>
                    <div className="cardSub">Immediate and structured — without relying on humans remembering.</div>

                    <div className="timeline">
                      <div className="tItem">
                        <div className="tTop">
                          <div className="tLabel">Text goes out</div>
                          <div className="tTime">~5 sec</div>
                        </div>
                        <div className="tDesc">Confirms they reached the right place and primes them to answer.</div>
                      </div>

                      <div className="tItem">
                        <div className="tTop">
                          <div className="tLabel">Call attempt #1</div>
                          <div className="tTime">~15–20 sec</div>
                        </div>
                        <div className="tDesc">If answered → routes into booking immediately.</div>
                      </div>

                      <div className="tItem">
                        <div className="tTop">
                          <div className="tLabel">Back-to-back call attempt</div>
                          <div className="tTime">if no answer</div>
                        </div>
                        <div className="tDesc">Second attempt quickly to catch “missed it / phone in pocket.”</div>
                      </div>

                      <div className="tItem">
                        <div className="tTop">
                          <div className="tLabel">Text follow-up</div>
                          <div className="tTime">~4 min</div>
                        </div>
                        <div className="tDesc">Reinforces next step and keeps momentum while intent is high.</div>
                      </div>
                    </div>
                  </div>

                  <div className="card cardAlt">
                    <div className="cardTitle">Long-tail follow-up (expanded)</div>
                    <div className="cardSub">This is where most pipelines die — unless it’s automated.</div>

                    <ul className="list">
                      <li>Evening attempt (example: ~7:55pm) if still uncontacted.</li>
                      <li>Next-day morning call + text touches (example: ~8:15am + ~9:15am).</li>
                      <li>Outcome routing: booked, not now, no answer, wrong number, stop, etc.</li>
                      <li>Stops or changes paths based on what actually happened.</li>
                    </ul>

                    <div className="tiny">You’re not buying “messages.” You’re buying consistent execution.</div>
                  </div>
                </div>
              ) : null}
            </section>

            {/* PRE-CALL VIDEO */}
            <section className="section" id="precall">
              <SectionHeading
                kicker="Show-rate protection"
                title="Pre-Call Training Video Framework"
                sub="If you don’t have reviews/case studies yet, you can still run a strong pre-call video using a clean structure like this."
              />

              <div className="cards2">
                <div className="card">
                  <div className="cardTitle">What the pre-call video does</div>
                  <div className="cardSub">Sets expectations, filters non-serious prospects, and protects your calendar.</div>
                  <ul className="list">
                    <li>Clarifies who this is for (high-intent leads, real demand).</li>
                    <li>Frames “why you” and how you solve the problem.</li>
                    <li>Protects the slot (no-show / reschedule boundaries).</li>
                    <li>Preps them for the consult so the call is faster and more productive.</li>
                  </ul>

                  <div className="ctaRow" style={{ marginTop: 12 }}>
                    <button className="btnPrimary" type="button" onClick={() => setShowScriptOutline((v) => !v)}>
                      {showScriptOutline ? "Hide outline" : "Show outline"}
                    </button>
                    <button className="btnGhost" type="button" onClick={() => setShowPersonalization((v) => !v)}>
                      {showPersonalization ? "Hide personalization" : "Optional: Personalized video"}
                    </button>
                  </div>
                </div>

                <div className="card cardAlt">
                  <div className="cardTitle">Outline (simple + proven)</div>
                  <div className="cardSub">Use this even if you don’t have proof yet — then add proof as you earn it.</div>

                  {showScriptOutline ? (
                    <>
                      <Accordion title="Part 1 — Quick intro + who it’s for" defaultOpen>
{`• Quick intro (what this call is and is not)
• Who this is for (what qualifies someone to take the consult)
• What they’ll get out of showing up prepared`}
                      </Accordion>

                      <Accordion title="Part 2 — Reframe no-show / reschedule boundaries">
{`• Why the slot is protected
• What happens if someone no-shows or tries to move last second
• How watching the video prevents it from ever being an issue`}
                      </Accordion>

                      <Accordion title="Part 3 — Credibility / proof (when you have it)">
{`• Best project / best result
• “What we did” and “what changed”
• Screenshots / short clips / before & after (as you earn them)`}
                      </Accordion>

                      <Accordion title="Part 4 — DIY vs done-with-you / done-for-you framing">
{`• Teach them what DIY really costs (time + people + inconsistency)
• Show why an expert-installed system compresses time-to-results
• Explain next steps for the consultation`}
                      </Accordion>

                      <Accordion title="Part 5 — More proof + outro">
{`• Add more reviews/case studies over time (2–4 pages is fine)
• Re-anchor boundaries one more time
• Close with clear expectations + gratitude`}
                      </Accordion>
                    </>
                  ) : (
                    <div className="tiny">Outline hidden — click “Show outline” to expand.</div>
                  )}
                </div>
              </div>

              {showPersonalization ? (
                <div className="card" style={{ marginTop: 14 }}>
                  <div className="cardTitle">Optional: Personalized pre-call video</div>
                  <div className="cardSub">High-end experience that increases trust and preparedness.</div>
                  <ul className="list">
                    <li>During booking, we capture 4 core variables: pain point, deeper pain, impact, desired outcome.</li>
                    <li>Those are used to personalize the pre-call video so it reflects the prospect’s exact words.</li>
                    <li>We can nudge them 30 minutes before the call/visit to watch (or re-watch) the key section.</li>
                  </ul>
                  <div className="tiny">
                    Kept short on purpose — this is a “wow” feature you can expand verbally, not a wall of text on the landing page.
                  </div>
                </div>
              ) : null}
            </section>

            {/* OPTIONS (NO PRICES) */}
            <section className="section" id="options">
              <SectionHeading
                kicker="How we can help"
                title="Three ways to implement"
                sub="No pricing on this page — we map fit first, then recommend the simplest path that gets results."
              />

              <div className="cards3">
                <div className="card">
                  <div className="cardTitle">Option 1 — DIY</div>
                  <div className="cardSub">Your team builds it internally.</div>
                  <ul className="list">
                    <li>Clear blueprint for the speed-to-lead sequence + booking flow.</li>
                    <li>Outcome routing and follow-up logic defined.</li>
                    <li>Best if you already have a technical operator/dev.</li>
                  </ul>
                </div>

                <div className="card cardAlt">
                  <div className="cardTitle">Option 2 — Done-With-You</div>
                  <div className="cardSub">We guide implementation with your team.</div>
                  <ul className="list">
                    <li>We install the logic with your tools and your constraints.</li>
                    <li>Your team learns the system and owns it.</li>
                    <li>Best if you want speed + internal ownership.</li>
                  </ul>
                </div>

                <div className="card">
                  <div className="cardTitle">Option 3 — Done-For-You</div>
                  <div className="cardSub">We install the full operating system.</div>
                  <ul className="list">
                    <li>Speed-to-lead → booking → follow-up → show-rate protection.</li>
                    <li>Optional: personalized pre-call video layer.</li>
                    <li>Best if you want outcomes and minimal lift.</li>
                  </ul>
                </div>
              </div>

              <div className="ctaRow" style={{ marginTop: 14 }}>
                <button className="btnPrimary" type="button" onClick={() => jumpTo("leadForm")}>
                  Run the live demo
                </button>
                <button className="btnGhost" type="button" onClick={() => jumpTo("precall")}>
                  See pre-call framework
                </button>
              </div>
            </section>

            <footer className="footer">
              <span>© {new Date().getFullYear()} All In Digital. </span>
              <a href="/terms" target="_blank" rel="noopener noreferrer">Terms</a>
              {" · "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy</a>
            </footer>
          </>
        ) : null}
      </div>

      {step === "details" ? (
        <div className="sticky">
          <div className="stickyInner">
            <div className="stickyText">
              Ready to run the demo for <span>{trackLabel}</span>?
            </div>
            <button className="stickyBtn" type="button" onClick={() => jumpTo("leadForm")}>
              Start demo
            </button>
          </div>
        </div>
      ) : null}

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              try {
                const els = document.querySelectorAll('.fade-on-scroll');
                if (!('IntersectionObserver' in window) || !els.length) return;
                const io = new IntersectionObserver((entries) => {
                  entries.forEach((e) => {
                    if (e.isIntersecting) {
                      e.target.classList.add('is-visible');
                      io.unobserve(e.target);
                    }
                  });
                }, { threshold: 0.14 });
                els.forEach((el) => io.observe(el));
              } catch {}
            })();
          `,
        }}
      />
    </main>
  );
}