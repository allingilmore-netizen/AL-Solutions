"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

type Track = "sales" | "local" | null;
type Step = "pick" | "details";
type DemoPhase =
  | "idle"
  | "submitted"
  | "sms_countdown"
  | "sms_sent"
  | "call_countdown"
  | "call_now";

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
 * Sends lead data to your existing Next.js API route:
 * /api/thoughtly-webhook
 *
 * (Keeps your current integration intact — add/remove fields as needed.)
 */
async function sendLeadToThoughtly(formData: FormData) {
  const firstName = String(formData.get("firstName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const businessType = String(formData.get("businessType") || "").trim();
  const website = String(formData.get("website") || "").trim();
  const track = String(formData.get("track") || "").trim();
  const consent = formData.get("consent") === "on";

  const payload = {
    name: firstName,
    firstName,
    email,
    phone,
    businessType,
    website,
    track,
    consent,
    source: "Landing Page – Web Form",
    createdAt: new Date().toISOString(),
  };

  const res = await fetch("/api/thoughtly-webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    // non-JSON is ok
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

function Accordion(props: {
  title: string;
  children: any;
  defaultOpen?: boolean;
  subtle?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(props.defaultOpen));
  return (
    <div className={cx("acc", open && "accOpen", props.subtle && "accSubtle")}>
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

function Modal(props: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: any;
}) {
  if (!props.open) return null;
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card fade-up">
        <div className="modal-header">
          <h2>{props.title}</h2>
          <button className="modal-close" type="button" onClick={props.onClose}>
            Close
          </button>
        </div>
        <div className="modal-body">{props.children}</div>
      </div>
    </div>
  );
}

export default function Page() {
  const [track, setTrack] = useState<Track>(null);
  const [step, setStep] = useState<Step>("pick");

  // form UX
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // “less is more” toggles
  const [showFullCadence, setShowFullCadence] = useState(false);
  const [showScriptOutline, setShowScriptOutline] = useState(true);
  const [showPersonalization, setShowPersonalization] = useState(false);

  // options dropdowns
  const [openOption, setOpenOption] = useState<"diy" | "dwy" | "dfy" | null>(null);

  // ROI modal
  const [isRoiOpen, setIsRoiOpen] = useState(false);
  const [monthlyLeads, setMonthlyLeads] = useState("200");
  const [closeRate, setCloseRate] = useState("25");
  const [avgDealSize, setAvgDealSize] = useState("1500");
  const [liftPercent, setLiftPercent] = useState("20");

  // Demo countdown UX
  const [demoPhase, setDemoPhase] = useState<DemoPhase>("idle");
  const [smsSeconds, setSmsSeconds] = useState<number>(5);
  const [callSeconds, setCallSeconds] = useState<number>(20);

  // Exit intent
  const [isExitOpen, setIsExitOpen] = useState(false);
  const [exitSubmitting, setExitSubmitting] = useState(false);
  const [exitSubmitted, setExitSubmitted] = useState(false);
  const [exitError, setExitError] = useState<string | null>(null);

  const hasEngagedRef = useRef(false);
  const hasExitIntentRef = useRef(false);
  const isExitOpenRef = useRef(false);
  const lastScrollYRef = useRef(0);

  // Fade-in observer (no script tag — reduces flicker/hydration weirdness)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const elements = document.querySelectorAll<HTMLElement>(".fade-on-scroll");
    if (!elements.length) return;

    // Make anything above the fold visible quickly
    window.requestAnimationFrame(() => {
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) el.classList.add("is-visible");
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [step, showFullCadence, showPersonalization, openOption]);

  // Exit intent logic (desktop + mobile)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const engagementTimer = window.setTimeout(() => {
      if (!hasEngagedRef.current) hasEngagedRef.current = true;
    }, 7000);

    const handleScroll = () => {
      const y = window.scrollY || window.pageYOffset || 0;

      if (!hasEngagedRef.current && y > 250) hasEngagedRef.current = true;

      const previousY = lastScrollYRef.current;
      const delta = previousY - y;
      const scrollingUp = y < previousY;
      const isMobile = window.innerWidth < 1024;

      if (
        isMobile &&
        hasEngagedRef.current &&
        scrollingUp &&
        delta > 30 &&
        y < 300 &&
        !hasExitIntentRef.current &&
        !isExitOpenRef.current &&
        !isRoiOpen
      ) {
        hasExitIntentRef.current = true;
        isExitOpenRef.current = true;
        setIsExitOpen(true);
      }

      lastScrollYRef.current = y;
    };

    const handleMouseLeave = (event: MouseEvent) => {
      const isDesktop = window.innerWidth >= 1024;
      if (
        isDesktop &&
        event.clientY <= 0 &&
        hasEngagedRef.current &&
        !hasExitIntentRef.current &&
        !isExitOpenRef.current &&
        !isRoiOpen
      ) {
        hasExitIntentRef.current = true;
        isExitOpenRef.current = true;
        setIsExitOpen(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.clearTimeout(engagementTimer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isRoiOpen]);

  // countdown state machine
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

  const isSales = track === "sales";

  const jumpTo = (id: string) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleContinue = () => {
    if (!track) return;
    setStep("details");
    setTimeout(() => jumpTo("leadForm"), 60);
  };

  const demoStatus = useMemo(() => {
    if (!submitted) return null;

    if (demoPhase === "sms_countdown") {
      return {
        title: "Demo running…",
        line1: `You’ll get a text in ${smsSeconds}s`,
        line2: `Then a call ~15–20s after the text.`,
        accent: "emerald",
      };
    }
    if (demoPhase === "sms_sent") {
      return {
        title: "Text sent ✅",
        line1: "Now triggering the call…",
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
        line1: "Answer the call to route into the booking flow.",
        line2: "If you miss it, you’ll still see the next touches fire.",
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

      const result = await sendLeadToThoughtly(fd);

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

  const handleExitSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setExitSubmitting(true);
    setExitError(null);

    try {
      const form = e.currentTarget;
      const fd = new FormData(form);

      // normalize into the same expected keys
      fd.set("track", track ?? "");
      const name = String(fd.get("exitName") || "").trim();
      const phone = String(fd.get("exitPhone") || "").trim();
      const consent = fd.get("exitConsent") === "on";

      const proxy = new FormData();
      proxy.set("firstName", name);
      proxy.set("email", "");
      proxy.set("phone", phone);
      proxy.set("businessType", "");
      proxy.set("website", "");
      proxy.set("track", track ?? "");
      if (consent) proxy.set("consent", "on");

      const result = await sendLeadToThoughtly(proxy);

      if (!result.ok) {
        setExitError("Something went wrong. Please try again.");
        setExitSubmitted(false);
      } else {
        setExitSubmitted(true);
      }
    } catch (err) {
      console.error(err);
      setExitError("Something went wrong. Please try again.");
      setExitSubmitted(false);
    } finally {
      setExitSubmitting(false);
    }
  };

  const closeExit = () => {
    setIsExitOpen(false);
    isExitOpenRef.current = false;
  };

  // ROI math
  const parsedMonthlyLeads = Number(monthlyLeads) || 0;
  const parsedCloseRate = Number(closeRate) || 0;
  const parsedAvgDealSize = Number(avgDealSize) || 0;
  const parsedLiftPercent = Number(liftPercent) || 0;

  const baselineClosed = parsedMonthlyLeads * (parsedCloseRate / 100);
  const extraClosed = baselineClosed * (parsedLiftPercent / 100);
  const extraRevenue = extraClosed * parsedAvgDealSize;

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
        .wrap { max-width: 1120px; margin: 0 auto; padding: 28px 16px 110px; }

        .header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 14px; margin-bottom: 22px;
        }
        .brand { display: inline-flex; align-items: center; gap: 10px; }
        .logo {
          width: 36px; height: 36px; border-radius: 12px;
          background: radial-gradient(circle at 30% 20%, #6EE7B7 0, var(--emerald) 45%, #022c22 100%);
          box-shadow: 0 12px 28px rgba(5, 150, 105, 0.45);
        }
        .brandText { display: flex; flex-direction: column; }
        .brandName { font-weight: 900; letter-spacing: 0.10em; font-size: 0.98rem; text-transform: uppercase; }
        .brandTag { font-size: 0.86rem; color: var(--muted); }

        .pillTop {
          border-radius: 999px; border: 1px solid rgba(148,163,184,0.6);
          padding: 8px 14px; font-size: 0.9rem;
          background: rgba(15,23,42,0.7); backdrop-filter: blur(12px);
          display: inline-flex; align-items: center; gap: 8px;
        }
        .dot {
          width: 9px; height: 9px; border-radius: 999px;
          background: radial-gradient(circle at 30% 20%, #BBF7D0 0, #22C55E 40%, #166534 100%);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.7);
        }

        @media (max-width: 780px) {
          .header { flex-direction: column; align-items: flex-start; }
        }

        .hero {
          border-radius: 24px; padding: 26px 22px;
          background: radial-gradient(circle at top left, rgba(4, 120, 87, 0.40), rgba(15, 23, 42, 0.95));
          border: 1px solid rgba(148, 163, 184, 0.35);
          box-shadow: 0 24px 80px rgba(15, 23, 42, 0.85), 0 0 0 1px rgba(15, 23, 42, 0.7);
        }

        .grid {
          display: grid; grid-template-columns: 1.15fr 0.95fr;
          gap: 22px; align-items: start;
        }
        @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }

        .eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 12px; border-radius: 999px;
          background: rgba(15,23,42,0.8); border: 1px solid rgba(148,163,184,0.5);
          font-size: 0.9rem; color: var(--muted); margin-bottom: 12px;
        }
        .eyebrow span {
          padding: 2px 9px; border-radius: 999px;
          background: rgba(4, 120, 87, 0.18);
          color: #A7F3D0; font-weight: 900; font-size: 0.85rem;
        }

        .h1 {
          margin: 0 0 12px;
          font-size: clamp(2.1rem, 3.3vw, 3.0rem);
          line-height: 1.06; letter-spacing: -0.04em;
        }
        .hl {
          background: linear-gradient(120deg, var(--gold), #F9A826);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .p {
          margin: 0 0 14px;
          font-size: 1.05rem; line-height: 1.65; color: #CBD5F5;
          max-width: 650px;
        }

        .ctaRow { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; align-items: center; }

        .btnPrimary, .btnGhost {
          border-radius: 999px; border: none; cursor: pointer;
          font-weight: 1000; font-size: 1rem; padding: 11px 18px;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
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
          background: rgba(15,23,42,0.8); border: 1px solid rgba(148,163,184,0.7);
          color: #E5E7EB;
        }
        .btnGhost:hover { background: rgba(15,23,42,1); transform: translateY(-1px); }

        .badges { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; font-size: 0.9rem; }
        .badge {
          padding: 5px 11px; border-radius: 999px;
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
        .trackTitle { font-size: 1rem; font-weight: 1000; margin-bottom: 2px; }
        .trackSub { font-size: 0.9rem; color: var(--muted); margin-bottom: 10px; }
        .pillRow { display: flex; flex-wrap: wrap; gap: 8px; }

        .pill {
          padding: 7px 12px; border-radius: 999px;
          border: 1px solid rgba(148,163,184,0.8);
          font-size: 0.9rem; background: rgba(15,23,42,0.95);
          color: #E5E7EB; cursor: pointer; font-weight: 1000;
        }
        .pillActive {
          background: rgba(4, 120, 87, 0.9);
          border-color: var(--gold);
          color: #ECFDF5;
        }

        .continueRow { display: flex; gap: 10px; margin-top: 12px; align-items: center; flex-wrap: wrap; }
        .continueNote { font-size: 0.86rem; color: rgba(203, 213, 245, 0.85); }

        .formCard {
          background: #FFFFFF; color: #0F172A;
          border-radius: 18px; padding: 18px 16px 16px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(148, 163, 184, 0.35);
          scroll-margin-top: 120px;
        }
        .formCard h3 {
          margin: 0 0 6px; font-size: 1.1rem;
          letter-spacing: 0.08em; text-transform: uppercase; color: #111827;
        }
        .formCard p { margin: 0 0 12px; font-size: 0.95rem; color: #4B5563; }

        label { display: block; font-size: 0.9rem; font-weight: 900; margin-bottom: 3px; }
        input {
          width: 100%;
          padding: 9px 10px; border-radius: 10px;
          border: 1px solid #D1D5DB;
          font-size: 0.96rem; margin-bottom: 10px; outline: none;
        }
        input:focus { border-color: var(--emerald); box-shadow: 0 0 0 1px rgba(4, 120, 87, 0.35); }

        .consentRow {
          display: flex; align-items: flex-start; gap: 10px;
          margin: 8px 0 10px; padding: 10px 10px;
          border-radius: 12px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(248, 113, 113, 0.9);
          box-shadow: 0 0 0 1px rgba(127, 29, 29, 0.20);
        }
        .consentRow input[type="checkbox"] { margin-top: 4px; width: auto; accent-color: #ef4444; }
        .consentText { font-size: 0.82rem; color: #7F1D1D; line-height: 1.35; }

        .submitBtn {
          width: 100%; border-radius: 999px; border: none;
          padding: 10px 12px; font-size: 1rem; font-weight: 1000;
          cursor: pointer;
          background: linear-gradient(135deg, var(--emerald), #059669);
          color: #ECFDF5;
          box-shadow: 0 16px 40px rgba(5, 150, 105, 0.4);
          transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
        }
        .submitBtn:hover { transform: translateY(-1px); box-shadow: 0 20px 52px rgba(5, 150, 105, 0.55); }
        .submitBtn:disabled { opacity: 0.65; cursor: not-allowed; }

        .formNote { margin-top: 10px; font-size: 0.78rem; color: #B91C1C; }
        .success { margin-top: 10px; font-size: 0.86rem; color: var(--emerald); font-weight: 1000; }
        .error { margin-top: 10px; font-size: 0.86rem; color: #ef4444; font-weight: 1000; }

        .demoPanel {
          margin-top: 12px;
          border-radius: 14px;
          padding: 10px 12px;
          border: 1px solid rgba(15,23,42,0.15);
          background: rgba(15,23,42,0.04);
        }
        .demoTop { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
        .demoTitle { font-weight: 1000; font-size: 0.95rem; color: #0F172A; }
        .demoBadge {
          padding: 4px 10px; border-radius: 999px;
          font-size: 0.78rem; font-weight: 1000;
          letter-spacing: 0.06em; text-transform: uppercase;
          border: 1px solid rgba(15,23,42,0.12);
        }
        .demoBadge.emerald { background: rgba(4, 120, 87, 0.14); color: #065F46; }
        .demoBadge.gold { background: rgba(244, 208, 63, 0.50); color: #92400E; }
        .demoLine { font-size: 0.88rem; color: #334155; line-height: 1.35; }

        .section { margin-top: 34px; }
        .secHead { margin-bottom: 14px; }
        .kicker { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--muted); margin-bottom: 6px; }
        .h2 { margin: 0 0 8px; font-size: 1.65rem; letter-spacing: -0.02em; }
        .sub { margin: 0; color: #CBD5F5; font-size: 1.02rem; line-height: 1.6; max-width: 860px; }

        .cards2 { display: grid; grid-template-columns: 1.2fr 1fr; gap: 14px; align-items: start; }
        @media (max-width: 900px) { .cards2 { grid-template-columns: 1fr; } }

        .cards3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; align-items: start; }
        @media (max-width: 900px) { .cards3 { grid-template-columns: 1fr; } }

        .card {
          border-radius: 18px; padding: 14px 14px 12px;
          background: rgba(15,23,42,0.97);
          border: 1px solid rgba(148,163,184,0.65);
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.80);
        }
        .cardAlt { background: radial-gradient(circle at top, rgba(24,24,27,0.96), rgba(15,23,42,0.98)); }
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
          border-radius: 14px; padding: 10px 12px;
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
          margin-bottom: 10px;
        }
        .accSubtle { border-color: rgba(148,163,184,0.45); background: rgba(15,23,42,0.92); }
        .accBtn {
          width: 100%;
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; padding: 12px 12px;
          border: none; background: transparent; cursor: pointer;
          color: #E5E7EB;
        }
        .accTitle { font-weight: 1000; font-size: 1rem; text-align: left; }
        .accIcon {
          width: 28px; height: 28px; border-radius: 999px;
          border: 1px solid rgba(148,163,184,0.65);
          display: inline-flex; align-items: center; justify-content: center;
          color: var(--muted); font-weight: 1000;
        }
        .accBody {
          padding: 0 12px 12px;
          color: #CBD5F5;
          font-size: 0.95rem;
          line-height: 1.65;
          white-space: pre-wrap;
        }

        .tiny { font-size: 0.86rem; color: var(--muted); margin-top: 6px; line-height: 1.45; }
        .divider { height: 1px; background: rgba(148,163,184,0.25); margin: 10px 0; }

        /* Modals */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(15, 23, 42, 0.86);
          display: flex; align-items: center; justify-content: center;
          z-index: 50; backdrop-filter: blur(10px);
        }
        .modal-card {
          width: 100%; max-width: 560px;
          margin: 0 16px;
          background: #020617;
          border-radius: 18px;
          border: 1px solid rgba(148, 163, 184, 0.75);
          box-shadow: 0 28px 80px rgba(15, 23, 42, 0.95);
          padding: 20px 18px 16px;
          color: #E5E7EB;
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          gap: 10px; margin-bottom: 10px;
        }
        .modal-header h2 { margin: 0; font-size: 1.14rem; }
        .modal-close {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          background: transparent;
          color: #9CA3AF;
          padding: 4px 10px;
          font-size: 0.82rem;
          cursor: pointer;
        }
        .modal-body { font-size: 0.94rem; }
        .modal-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 12px; margin-top: 12px;
        }
        @media (max-width: 640px) {
          .modal-grid { grid-template-columns: 1fr; }
        }
        .modal-field label { display: block; font-size: 0.88rem; margin-bottom: 3px; color: #CBD5F5; }
        .modal-field input {
          width: 100%;
          padding: 7px 9px;
          border-radius: 8px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          background: rgba(15, 23, 42, 0.9);
          color: #E5E7EB;
          font-size: 0.9rem;
          outline: none;
        }
        .modal-field input:focus {
          border-color: var(--emerald);
          box-shadow: 0 0 0 1px rgba(4, 120, 87, 0.45);
        }
        .modal-metric {
          margin-top: 10px;
          padding: 9px 11px;
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.65);
          font-size: 0.9rem;
        }
        .modal-metric strong { font-size: 1.08rem; display: block; margin-top: 2px; }
        .modal-footnote { margin-top: 8px; font-size: 0.86rem; color: var(--muted); }

        /* Exit form inside modal */
        .exitForm { margin-top: 14px; padding: 12px 10px 10px; border-radius: 14px;
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.7);
        }
        .exitForm label { display: block; font-size: 0.85rem; margin-bottom: 2px; color: #CBD5F5; }
        .exitForm input {
          width: 100%;
          padding: 7px 9px;
          border-radius: 8px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          background: rgba(15, 23, 42, 0.9);
          color: #E5E7EB;
          font-size: 0.88rem;
          margin-bottom: 6px;
          outline: none;
        }
        .exitForm input:focus { border-color: var(--emerald); box-shadow: 0 0 0 1px rgba(4, 120, 87, 0.45); }
        .exitConsentRow { display: flex; align-items: flex-start; gap: 8px; margin: 6px 0 8px; }
        .exitConsentRow input[type="checkbox"] { margin-top: 3px; width: auto; accent-color: #ef4444; }
        .exitConsentRow span { font-size: 0.78rem; color: #9CA3AF; }
        .exitSubmitBtn {
          margin-top: 8px;
          width: 100%;
          border-radius: 999px;
          border: none;
          padding: 8px 10px;
          font-size: 0.9rem;
          font-weight: 1000;
          background: linear-gradient(135deg, var(--emerald), #22C55E);
          color: #ECFDF5;
          cursor: pointer;
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.55);
        }
        .exitSmall { font-size: 0.75rem; color: #9CA3AF; line-height: 1.45; margin-top: 6px; }
        .exitThank { margin-top: 8px; font-size: 0.82rem; color: #A7F3D0; font-weight: 900; }

        /* Sticky */
        .sticky {
          position: fixed; inset-inline: 0; bottom: 0;
          z-index: 30; padding: 10px 16px 12px;
          display: flex; justify-content: center; pointer-events: none;
        }
        .stickyInner {
          pointer-events: auto;
          max-width: 860px; width: 100%;
          border-radius: 999px;
          background: rgba(15,23,42,0.96);
          border: 1px solid rgba(148,163,184,0.7);
          box-shadow: 0 -10px 40px rgba(15,23,42,0.85);
          padding: 9px 13px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px;
        }
        .stickyText { font-size: 0.95rem; color: #E5E7EB; }
        .stickyText span { color: var(--gold); font-weight: 1000; }
        .stickyBtn {
          border-radius: 999px; border: none;
          padding: 9px 16px;
          font-size: 0.98rem; font-weight: 1000;
          background: linear-gradient(135deg, var(--emerald), #22C55E);
          color: #ECFDF5; cursor: pointer;
          box-shadow: 0 10px 30px rgba(16,185,129,0.55);
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .stickyInner { flex-direction: column; align-items: flex-start; border-radius: 20px; }
          .stickyBtn { width: 100%; }
        }

        /* Fade */
        .fade-on-scroll { opacity: 0; transform: translateY(18px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
        .fade-on-scroll.is-visible { opacity: 1; transform: translateY(0); }
        .fade-up { opacity: 0; transform: translateY(18px); animation: fadeUp 0.6s ease-out forwards; }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

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
        <header className="header fade-on-scroll">
          <div className="brand">
            <div className="logo" />
            <div className="brandText">
              <div className="brandName">ALL IN DIGITAL</div>
              <div className="brandTag">Business Strategy • AI Phone • SMS • Ops Systems</div>
            </div>
          </div>
          <div className="pillTop">
            <div className="dot" />
            <span>Speed-to-lead → Booking → Show-rate protection</span>
          </div>
        </header>

        <section className="hero fade-on-scroll">
          <div className="grid">
            <div className="fade-on-scroll">
              <div className="eyebrow">
                <span>Live Demo</span>
                <div>Text in ~5s → Call in ~15–20s</div>
              </div>

              <h1 className="h1">
                More booked calls. <span className="hl">Higher show rates.</span> Cleaner closes.
              </h1>

              <p className="p">
                I’m not here to “run ads” or position as a marketing agency. This is business strategy:
                we install a response + booking system that contacts leads immediately, routes answered calls
                into a structured booking flow, and protects your calendar with pre-call preparation so time
                doesn’t get wasted.
              </p>

              <div className="badges">
                <div className="badge">Text in ~5 seconds</div>
                <div className="badge">Call in ~15–20 seconds</div>
                <div className="badge">Books your calendar</div>
                <div className="badge">Follow-up runs automatically</div>
              </div>

              <div className="ctaRow">
                <button className="btnPrimary" type="button" onClick={() => jumpTo("leadForm")}>
                  Run the live demo →
                </button>
                <button className="btnGhost" type="button" onClick={() => setIsRoiOpen(true)}>
                  ROI calculator
                </button>
                <button className="btnGhost" type="button" onClick={() => jumpTo("options")}>
                  DIY / DWY / DFY
                </button>
              </div>

              <div className="trackCard fade-on-scroll">
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
                    This unlocks the sequence + live demo form for <strong>{trackLabel}</strong>.
                  </div>
                </div>
              </div>
            </div>

            <div className="fade-on-scroll">
              {step === "details" ? (
                <form id="leadForm" className="formCard" onSubmit={handleSubmit}>
                  <h3>RUN THE LIVE DEMO</h3>
                  <p>
                    You’ll receive a text first, then a call right after to experience the{" "}
                    {isSales ? "discovery → booking" : "intake → booking"} flow.
                  </p>

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
                    placeholder={isSales ? "SaaS, high-ticket, inside sales..." : "Med spa, HVAC, dental, showroom..."}
                  />

                  <label htmlFor="website">Website (optional)</label>
                  <input id="website" name="website" placeholder="https://..." />

                  <input type="hidden" name="track" value={track ?? ""} />

                  <div className="consentRow">
                    <input id="consent" name="consent" type="checkbox" required />
                    <div className="consentText">
                      <strong>Required:</strong> I agree to receive SMS updates related to my inquiry
                      (demo link, confirmations, follow-up I requested). Message frequency may vary.
                      Message &amp; data rates may apply. Reply STOP to opt out and HELP for help.
                      Consent is not a condition of purchase. We do not sell or share your mobile number
                      with third parties for marketing/promotional purposes.
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
                  <div className="cardSub">Less is more — expand only if you want details.</div>
                  <ul className="list">
                    <li>Speed-to-lead sequence (short view + expanded view)</li>
                    <li>How answered calls route into booking</li>
                    <li>How missed calls trigger automated follow-up</li>
                    <li>How the pre-call video protects show rate</li>
                    <li>DIY vs Done-With-You vs Done-For-You paths</li>
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
                <div className="card fade-on-scroll">
                  <div className="cardTitle">The short version</div>
                  <div className="cardSub">This is what a decision-maker actually needs.</div>
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

                <div className="card cardAlt fade-on-scroll">
                  <div className="cardTitle">What happens when they answer</div>
                  <div className="cardSub">Not a “chatbot.” A structured conversation that ends in a calendar.</div>
                  <ul className="list">
                    <li>Discovery that pulls pain point → deeper pain → impact → desired outcome.</li>
                    <li>Then routes into booking on your calendar.</li>
                    <li>Then triggers pre-call preparation so they show up ready.</li>
                  </ul>
                </div>
              </div>

              {showFullCadence ? (
                <div className="cards2" style={{ marginTop: 14 }}>
                  <div className="card fade-on-scroll">
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
                          <div className="tLabel">Back-to-back attempt</div>
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

                  <div className="card cardAlt fade-on-scroll">
                    <div className="cardTitle">Long-tail follow-up (expanded)</div>
                    <div className="cardSub">Where most pipelines die — unless it’s automated.</div>

                    <ul className="list">
                      <li>Evening attempt if still uncontacted.</li>
                      <li>Next-day morning call + text touches.</li>
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
                sub="Short on purpose. The goal is clarity + boundaries + preparedness — not a wall of text."
              />

              <div className="cards2">
                <div className="card fade-on-scroll">
                  <div className="cardTitle">What the pre-call video does</div>
                  <div className="cardSub">Sets expectations, filters non-serious prospects, protects your calendar.</div>
                  <ul className="list">
                    <li>Clarifies who this is for (high-intent leads, real demand).</li>
                    <li>Frames “why you” and how you solve the problem.</li>
                    <li>Protects the slot (no-show / reschedule boundaries).</li>
                    <li>Preps them for the consult so calls are faster and more productive.</li>
                  </ul>

                  <div className="ctaRow" style={{ marginTop: 12 }}>
                    <button
                      className="btnPrimary"
                      type="button"
                      onClick={() => setShowScriptOutline((v) => !v)}
                    >
                      {showScriptOutline ? "Hide outline" : "Show outline"}
                    </button>
                    <button
                      className="btnGhost"
                      type="button"
                      onClick={() => setShowPersonalization((v) => !v)}
                    >
                      {showPersonalization ? "Hide personalized layer" : "Optional: personalized video"}
                    </button>
                  </div>
                </div>

                <div className="card cardAlt fade-on-scroll">
                  <div className="cardTitle">Outline (simple + proven)</div>
                  <div className="cardSub">Use this even before you have case studies — then add proof as you earn it.</div>

                  {showScriptOutline ? (
                    <>
                      <Accordion title="Part 1 — Quick intro + who it’s for" defaultOpen>
{`• Quick intro (what this call is and is not)
• Who this is for (what qualifies someone to take the consult)
• What they’ll get out of showing up prepared`}
                      </Accordion>

                      <Accordion title="Part 2 — Boundaries that protect the slot">
{`• Why the slot is protected
• What happens if someone no-shows or reschedules last second
• How this prevents wasted time on both sides`}
                      </Accordion>

                      <Accordion title="Part 3 — Credibility / proof (as you build it)">
{`• Best project / best result
• “What we did” and “what changed”
• Screenshots / short clips / before & after (as you earn them)`}
                      </Accordion>

                      <Accordion title="Part 4 — The implementation paths (DIY / DWY / DFY)">
{`• What DIY really costs (time + people + inconsistency)
• Why an installed system compresses time-to-consistency
• What happens next after the call`}
                      </Accordion>

                      <Accordion title="Part 5 — Quick recap + next step">
{`• Re-anchor boundaries one more time
• Clear next step for the consult / visit
• Gratitude + confirmation they’re in the right place`}
                      </Accordion>
                    </>
                  ) : (
                    <div className="tiny">Outline hidden — click “Show outline” to expand.</div>
                  )}
                </div>
              </div>

              {showPersonalization ? (
                <div className="card fade-on-scroll" style={{ marginTop: 14 }}>
                  <div className="cardTitle">Optional: Personalized pre-call video</div>
                  <div className="cardSub">High-end experience that increases trust and preparedness.</div>
                  <ul className="list">
                    <li>During booking, we capture 4 variables: pain point, deeper pain, impact, desired outcome.</li>
                    <li>Those are used to personalize the video so it reflects the prospect’s exact words.</li>
                    <li>We can nudge them 30 minutes before the call/visit to watch (or re-watch) the key section.</li>
                  </ul>
                  <div className="tiny">
                    Kept short on purpose — this is a “wow” feature you expand verbally, not with a giant web page.
                  </div>
                </div>
              ) : null}
            </section>

            {/* OPTIONS */}
            <section className="section" id="options">
              <SectionHeading
                kicker="Implementation paths"
                title="DIY • Done-With-You • Done-For-You"
                sub="No pricing here. Fit comes first — then we recommend the simplest path that gets consistent execution."
              />

              <div className="cards3">
                <div className="card fade-on-scroll">
                  <div className="cardTitle">Option 1 — Do It Yourself</div>
                  <div className="cardSub">I give you the blueprint. Your team builds it.</div>
                  <ul className="list">
                    <li>System outline + scripts customized to your business.</li>
                    <li>Routing + outcomes defined (booked, not now, no answer, stop, etc.).</li>
                    <li>Best if you already have a capable builder/operator.</li>
                  </ul>

                  <div className="divider" />

                  <button
                    className="btnGhost"
                    type="button"
                    onClick={() => setOpenOption((v) => (v === "diy" ? null : "diy"))}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {openOption === "diy" ? "Hide what you get" : "See what you get"}
                  </button>

                  {openOption === "diy" ? (
                    <div style={{ marginTop: 10 }}>
                      <Accordion title="DIY deliverables (collapsed by default)" defaultOpen subtle>
{`• Call flow map + scripts (intake → discovery → booking)
• Speed-to-lead cadence (short + expanded)
• CRM outcome definitions + tagging
• Pre-call video outline + “less is more” structure
• Handoff checklist so your operator can implement cleanly`}
                      </Accordion>
                    </div>
                  ) : null}
                </div>

                <div className="card cardAlt fade-on-scroll">
                  <div className="cardTitle">Option 2 — Done-With-You</div>
                  <div className="cardSub">We build it together. Your team owns it.</div>
                  <ul className="list">
                    <li>We install with your tools + constraints.</li>
                    <li>Training so your team can maintain and iterate.</li>
                    <li>Great for speed + internal ownership.</li>
                  </ul>

                  <div className="divider" />

                  <button
                    className="btnGhost"
                    type="button"
                    onClick={() => setOpenOption((v) => (v === "dwy" ? null : "dwy"))}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {openOption === "dwy" ? "Hide the rollout" : "See the 60-day rollout"}
                  </button>

                  {openOption === "dwy" ? (
                    <div style={{ marginTop: 10 }}>
                      <Accordion title="DWY rollout (60 days)" defaultOpen>
{`Week 1–2:
• Map outcomes + scripts + routing
• Stand up speed-to-lead + booking flow

Week 3–4:
• Tighten qualification + objections
• Add no-show protection + recovery

Week 5–8:
• Add follow-up/nurture logic
• Improve based on real call outcomes + recordings
• Document + train your team so ownership stays internal`}
                      </Accordion>
                    </div>
                  ) : null}
                </div>

                <div className="card fade-on-scroll">
                  <div className="cardTitle">Option 3 — Do It For You</div>
                  <div className="cardSub">We install the operating system end-to-end.</div>
                  <ul className="list">
                    <li>Speed-to-lead → booking → follow-up → show-rate protection.</li>
                    <li>Optional: personalized pre-call video layer.</li>
                    <li>Minimal lift on your team.</li>
                  </ul>

                  <div className="divider" />

                  <button
                    className="btnGhost"
                    type="button"
                    onClick={() => setOpenOption((v) => (v === "dfy" ? null : "dfy"))}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {openOption === "dfy" ? "Hide phases" : "See phases"}
                  </button>

                  {openOption === "dfy" ? (
                    <div style={{ marginTop: 10 }}>
                      <Accordion title="Phase 1 — Inbound + booking (foundation)" defaultOpen>
{`• 24/7 inbound answering
• Booking flow into your calendar
• Basic routing + live transfer (if desired)
• Reporting on calls + bookings`}
                      </Accordion>
                      <Accordion title="Phase 2 — No-show recovery + nurture">
{`• No-show reschedule sequences (call + SMS)
• “Not now / call later” nurture
• Outcome-based logic that changes based on what happened`}
                      </Accordion>
                      <Accordion title="Phase 3 — Ops automations (optional)">
{`• Dispatch / confirmations / ETAs
• Post-appointment follow-up (reviews, reactivation)
• CRM hygiene + tagging + handoffs
• Optional finance layer (links, agreements, onboarding)`} 
                      </Accordion>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="ctaRow" style={{ marginTop: 14 }}>
                <button className="btnPrimary" type="button" onClick={() => jumpTo("leadForm")}>
                  Run the live demo
                </button>
                <button className="btnGhost" type="button" onClick={() => setIsRoiOpen(true)}>
                  ROI calculator
                </button>
                <button className="btnGhost" type="button" onClick={() => jumpTo("precall")}>
                  Pre-call framework
                </button>
              </div>

              <div className="cards2" style={{ marginTop: 14 }}>
                <div className="card cardAlt fade-on-scroll">
                  <div className="cardTitle">Optional layer: Sales enablement</div>
                  <div className="cardSub">If you want it, we can go beyond booking into better closes.</div>
                  <ul className="list">
                    <li>Call structure + discovery framework your reps can follow.</li>
                    <li>Objection handling + follow-up rules (so it’s consistent).</li>
                    <li>Cleaner handoff from “booked” → “showed” → “closed”.</li>
                  </ul>
                </div>

                <div className="card fade-on-scroll">
                  <div className="cardTitle">Optional layer: Ops automations</div>
                  <div className="cardSub">Reduce admin chaos so humans stay on revenue work.</div>
                  <ul className="list">
                    <li>Dispatch and schedule confirmations.</li>
                    <li>Status updates that prevent “where are you” calls.</li>
                    <li>CRM cleanup, tagging, and follow-up triggers.</li>
                  </ul>
                </div>
              </div>
            </section>

            <footer className="footer">
              <span>© {new Date().getFullYear()} All In Digital. </span>
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                Terms
              </a>
              {" · "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                Privacy
              </a>
            </footer>
          </>
        ) : null}
      </div>

      {/* Sticky (only after continue) */}
      {step === "details" ? (
        <div className="sticky">
          <div className="stickyInner fade-on-scroll">
            <div className="stickyText">
              Ready to run the demo for <span>{trackLabel}</span>?
            </div>
            <button className="stickyBtn" type="button" onClick={() => jumpTo("leadForm")}>
              Start demo
            </button>
          </div>
        </div>
      ) : null}

      {/* ROI Modal */}
      <Modal open={isRoiOpen} title="ROI Calculator" onClose={() => setIsRoiOpen(false)}>
        <p>
          Adjust the numbers to match your pipeline. This is a simple back-of-napkin model — we’ll run a deeper
          version together on a call.
        </p>

        <div className="modal-grid">
          <div className="modal-field">
            <label htmlFor="leads">Monthly leads / inbound calls</label>
            <input
              id="leads"
              type="number"
              min={0}
              value={monthlyLeads}
              onChange={(e) => setMonthlyLeads(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label htmlFor="closeRate">Current close rate (%)</label>
            <input
              id="closeRate"
              type="number"
              min={0}
              max={100}
              value={closeRate}
              onChange={(e) => setCloseRate(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label htmlFor="dealSize">Average ticket / deal size ($)</label>
            <input
              id="dealSize"
              type="number"
              min={0}
              value={avgDealSize}
              onChange={(e) => setAvgDealSize(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label htmlFor="lift">Expected lift with better execution (%)</label>
            <input
              id="lift"
              type="number"
              min={0}
              max={200}
              value={liftPercent}
              onChange={(e) => setLiftPercent(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-metric">
          Extra closed deals / month:
          <strong>{extraClosed.toFixed(1)}</strong>
          <div style={{ marginTop: 4 }}>
            Estimated extra revenue / month:
            <strong>
              {" "}
              $
              {extraRevenue.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </strong>
          </div>
        </div>

        <div className="modal-footnote">
          This doesn’t include time saved, fewer no-shows, or downstream upsells. It’s just the direct revenue from
          closing more of what you already pay to generate.
        </div>
      </Modal>

      {/* Exit Intent Modal */}
      <Modal open={isExitOpen} title="Before you bounce…" onClose={closeExit}>
        <p>
          Most teams don’t realize how much revenue quietly leaks through voicemail, slow follow-up, and no-shows.
        </p>
        <p style={{ marginTop: 8 }}>
          Want a quick look at what this system could recover for{" "}
          <strong>{trackLabel}</strong>?
        </p>

        <form className="exitForm" onSubmit={handleExitSubmit}>
          <label htmlFor="exitName">First name</label>
          <input id="exitName" name="exitName" required />

          <label htmlFor="exitPhone">Mobile number</label>
          <input id="exitPhone" name="exitPhone" type="tel" required />

          <div className="exitConsentRow">
            <input id="exitConsent" name="exitConsent" type="checkbox" required />
            <span>Yes, send me the live demo link and updates related to this inquiry.</span>
          </div>

          <button className="exitSubmitBtn" type="submit" disabled={exitSubmitting || exitSubmitted}>
            {exitSubmitting ? "Sending…" : exitSubmitted ? "Submitted ✅" : "Send it to me"}
          </button>

          <div className="exitSmall">
            Message frequency may vary. Message &amp; data rates may apply. Reply STOP to opt out and HELP for help.
            Consent is not a condition of purchase. We do not sell or share your mobile number with third parties for
            marketing/promotional purposes.
          </div>

          {exitError ? <div className="error" style={{ marginTop: 8 }}>{exitError}</div> : null}

          {exitSubmitted ? (
            <div className="exitThank">Thanks — you’ll get a text shortly.</div>
          ) : null}
        </form>
      </Modal>
    </main>
  );
}