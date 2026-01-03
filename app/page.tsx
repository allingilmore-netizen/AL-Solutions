"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

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
async function sendLead(payload: Record<string, any>) {
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

type DemoPhase =
  | "idle"
  | "submitted"
  | "sms_countdown"
  | "sms_sent"
  | "call_countdown"
  | "call_now";

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

function StatPill(props: { title: string; sub: string }) {
  return (
    <div className="pillStat">
      <div className="pillStatTop">{props.title}</div>
      <div className="pillStatSub">{props.sub}</div>
    </div>
  );
}

export default function Page() {
  // form UX
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // demo countdown UX
  const [demoPhase, setDemoPhase] = useState<DemoPhase>("idle");
  const [smsSeconds, setSmsSeconds] = useState<number>(5);
  const [callSeconds, setCallSeconds] = useState<number>(15);

  // attribution capture
  const [attrib, setAttrib] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);

    const keys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "gclid",
      "fbclid",
    ];

    const captured: Record<string, string> = {};
    keys.forEach((k) => {
      const v = p.get(k);
      if (v) captured[k] = v;
    });

    setAttrib(captured);
  }, []);

  // demo countdown sequence
  useEffect(() => {
    if (!submitted) return;

    if (demoPhase === "submitted") {
      setSmsSeconds(5);
      setCallSeconds(15);
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
      const t = window.setTimeout(() => setDemoPhase("call_countdown"), 650);
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
        title: "Running the demo…",
        line1: `Text in ${smsSeconds}s`,
        line2: `Then a call ~15s after the text.`,
        accent: "emerald" as const,
        progress: (5 - smsSeconds) / 5,
      };
    }
    if (demoPhase === "sms_sent") {
      return {
        title: "Text sent ✅",
        line1: "Now triggering your call…",
        line2: "Stay on this page and answer to experience the booking flow.",
        accent: "gold" as const,
        progress: 1,
      };
    }
    if (demoPhase === "call_countdown") {
      return {
        title: "Call on the way…",
        line1: `Call in ${callSeconds}s`,
        line2: "If missed, the re-engagement cadence continues automatically.",
        accent: "emerald" as const,
        progress: (15 - callSeconds) / 15,
      };
    }
    if (demoPhase === "call_now") {
      return {
        title: "Your phone should be ringing now 📞",
        line1: "Answer the call to route into the booking flow.",
        line2: "If you miss it, you’ll see the next touches fire.",
        accent: "gold" as const,
        progress: 1,
      };
    }

    return {
      title: "Submitted ✅",
      line1: "Watch for the text first.",
      line2: "Then the call comes right after.",
      accent: "emerald" as const,
      progress: 0,
    };
  }, [submitted, demoPhase, smsSeconds, callSeconds]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const form = e.currentTarget;
      const fd = new FormData(form);

      const firstName = String(fd.get("firstName") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const phone = String(fd.get("phone") || "").trim();
      const businessType = String(fd.get("businessType") || "").trim();
      const website = String(fd.get("website") || "").trim();
      const consent = fd.get("consent") === "on";

      // minimal sanity
      if (!consent) {
        setSubmitError("Consent is required to run the demo via SMS/call.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        firstName,
        name: firstName,
        email,
        phone,
        businessType,
        website,
        consent,
        source: "Landing Page – Ads Demo Form",
        createdAt: new Date().toISOString(),
        attribution: attrib,
      };

      const result = await sendLead(payload);

      if (!result.ok) {
        setSubmitError("Something went wrong. Please try again.");
        setSubmitted(false);
        setDemoPhase("idle");
      } else {
        setSubmitted(true);
        setDemoPhase("submitted");
        // keep them anchored where the status panel is
        try {
          const el = document.getElementById("demoStatus");
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch {}
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
          padding: 26px 16px 110px;
        }

        /* Header */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .logo {
          width: 38px;
          height: 38px;
          border-radius: 14px;
          background: radial-gradient(circle at 30% 20%, #6EE7B7 0, var(--emerald) 45%, #022c22 100%);
          box-shadow: 0 12px 28px rgba(5, 150, 105, 0.45);
        }
        .brandText { display: flex; flex-direction: column; }
        .brandName {
          font-weight: 900;
          letter-spacing: 0.10em;
          font-size: 0.95rem;
          text-transform: uppercase;
        }
        .brandTag {
          font-size: 0.86rem;
          color: rgba(156,163,175,0.95);
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
          white-space: nowrap;
        }
        .dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 20%, #BBF7D0 0, #22C55E 40%, #166534 100%);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.7);
        }

        @media (max-width: 860px) {
          .header { flex-direction: column; align-items: flex-start; }
          .pillTop { white-space: normal; }
        }

        /* Hero */
        .hero {
          border-radius: 24px;
          padding: 22px 18px;
          background: radial-gradient(circle at top left, rgba(4, 120, 87, 0.38), rgba(15, 23, 42, 0.95));
          border: 1px solid rgba(148, 163, 184, 0.35);
          box-shadow: 0 24px 80px rgba(15, 23, 42, 0.85), 0 0 0 1px rgba(15, 23, 42, 0.7);
        }

        .grid {
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          gap: 18px;
          align-items: start;
        }
        @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(15,23,42,0.8);
          border: 1px solid rgba(148,163,184,0.5);
          font-size: 0.9rem;
          color: rgba(203,213,245,0.9);
          margin-bottom: 12px;
        }
        .eyebrow span {
          padding: 2px 9px;
          border-radius: 999px;
          background: rgba(244, 208, 63, 0.14);
          color: var(--gold);
          font-weight: 900;
          font-size: 0.85rem;
        }

        .h1 {
          margin: 0 0 10px;
          font-size: clamp(2.0rem, 3.1vw, 2.85rem);
          line-height: 1.06;
          letter-spacing: -0.04em;
        }

        /* headline readability (no 3D / no blending) */
        .h1Plain {
          color: #F9FAFB !important;
          text-shadow: none !important;
          opacity: 1 !important;
          filter: none !important;
          mix-blend-mode: normal !important;
        }
        .h1Accent {
          color: #10B981 !important;
          text-shadow: none !important;
          opacity: 1 !important;
          filter: none !important;
          mix-blend-mode: normal !important;
        }
        .h1Gold {
          color: var(--gold) !important;
          text-shadow: none !important;
          opacity: 1 !important;
          filter: none !important;
          mix-blend-mode: normal !important;
        }

        .p {
          margin: 0 0 14px;
          font-size: 1.03rem;
          line-height: 1.65;
          color: rgba(203,213,245,0.95);
          max-width: 720px;
        }

        .bullets {
          margin: 10px 0 0;
          padding-left: 18px;
          color: rgba(229,231,235,0.98);
          font-size: 0.98rem;
          line-height: 1.55;
        }
        .bullets li { margin-bottom: 6px; }

        .pillStatRow {
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }
        @media (max-width: 960px) { .pillStatRow { grid-template-columns: 1fr; } }

        .pillStat {
          border-radius: 16px;
          padding: 10px 12px;
          background: rgba(15,23,42,0.92);
          border: 1px solid rgba(148,163,184,0.55);
          box-shadow: 0 14px 40px rgba(15, 23, 42, 0.55);
        }
        .pillStatTop { font-weight: 1000; }
        .pillStatSub { margin-top: 4px; font-size: 0.9rem; color: rgba(203,213,245,0.9); line-height: 1.45; }

        /* Form */
        .formCard {
          background: #FFFFFF;
          color: #0F172A;
          border-radius: 18px;
          padding: 18px 16px 16px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(148, 163, 184, 0.35);
          position: sticky;
          top: 14px;
        }
        @media (max-width: 960px) {
          .formCard { position: static; }
        }

        .formCard h3 {
          margin: 0 0 6px;
          font-size: 1.06rem;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: #111827;
          font-weight: 1000;
        }
        .formCard p { margin: 0 0 12px; font-size: 0.95rem; color: #4B5563; }

        label { display: block; font-size: 0.9rem; font-weight: 900; margin-bottom: 3px; }
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
          background: rgba(239, 68, 68, 0.07);
          border: 1px solid rgba(248, 113, 113, 0.9);
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
          font-weight: 1000;
          cursor: pointer;
          background: linear-gradient(135deg, var(--emerald), #22C55E);
          color: #ECFDF5;
          box-shadow: 0 16px 40px rgba(5, 150, 105, 0.4);
          transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
        }
        .submitBtn:hover { transform: translateY(-1px); box-shadow: 0 20px 52px rgba(5, 150, 105, 0.55); }
        .submitBtn:disabled { opacity: 0.65; cursor: not-allowed; }

        .error { margin-top: 10px; font-size: 0.9rem; color: #ef4444; font-weight: 1000; }
        .success { margin-top: 10px; font-size: 0.9rem; color: #065F46; font-weight: 1000; }

        /* Demo status panel (post-submit) */
        .demoPanel {
          margin-top: 12px;
          border-radius: 14px;
          padding: 12px 12px;
          border: 1px solid rgba(15,23,42,0.15);
          background: rgba(15,23,42,0.04);
        }
        .demoTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }
        .demoTitle { font-weight: 1000; font-size: 0.95rem; color: #0F172A; }
        .demoBadge {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 1000;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border: 1px solid rgba(15,23,42,0.12);
        }
        .demoBadge.emerald { background: rgba(4, 120, 87, 0.14); color: #065F46; }
        .demoBadge.gold { background: rgba(244, 208, 63, 0.50); color: #92400E; }
        .demoLine { font-size: 0.9rem; color: #334155; line-height: 1.35; }

        .progressWrap {
          margin-top: 10px;
          height: 8px;
          border-radius: 999px;
          background: rgba(15,23,42,0.08);
          overflow: hidden;
          border: 1px solid rgba(15,23,42,0.10);
        }
        .progressBar {
          height: 100%;
          width: var(--w);
          background: linear-gradient(90deg, rgba(4,120,87,0.85), rgba(244,208,63,0.95));
          border-radius: 999px;
          transition: width 0.35s ease;
        }

        /* Sections */
        .section {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .howGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 960px) { .howGrid { grid-template-columns: 1fr; } }

        .card {
          border-radius: 18px;
          padding: 14px 14px 12px;
          background: rgba(15,23,42,0.97);
          border: 1px solid rgba(148,163,184,0.60);
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.75);
        }
        .cardTitle { font-size: 1.05rem; font-weight: 1000; margin-bottom: 4px; }
        .cardSub { color: rgba(156,163,175,0.95); font-size: 0.95rem; line-height: 1.55; margin: 0; }

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
          color: rgba(156,163,175,0.95);
          font-weight: 1000;
        }
        .accBody {
          padding: 0 12px 12px;
          color: rgba(203,213,245,0.95);
          font-size: 0.95rem;
          line-height: 1.65;
          white-space: pre-wrap;
        }

        .footer {
          margin-top: 18px;
          font-size: 0.72rem;
          color: rgba(107,114,128,0.95);
          text-align: center;
          opacity: 0.9;
        }
        .footer a {
          color: inherit;
          text-decoration: none;
          border-bottom: 1px solid rgba(107,114,128,0.3);
          padding-bottom: 1px;
        }

        /* Sticky CTA */
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
          max-width: 980px;
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
      `}</style>

      <div className="wrap">
        <header className="header">
          <div className="brand">
            <div className="logo" />
            <div className="brandText">
              <div className="brandName">ALL IN DIGITAL</div>
              <div className="brandTag">Speed-to-lead • Booking • Show-rate protection</div>
            </div>
          </div>

          <div className="pillTop">
            <div className="dot" />
            <span>Free Business Strategy Consultation (live demo)</span>
          </div>
        </header>

        <section className="hero">
          <div className="grid">
            <div>
              <div className="eyebrow">
                <span>Live Demo</span>
                <div>Text in ~5s → Call in ~15s</div>
              </div>

              <h1 className="h1">
                <span className="h1Plain">Stop losing money to </span>
                <span className="h1Accent">missed calls</span>
                <span className="h1Plain">, slow follow-up, and </span>
                <span className="h1Gold">no-shows</span>
                <span className="h1Plain">.</span>
              </h1>

              <p className="p">
                Submit the form to experience the exact speed-to-lead sequence your prospects will get:
                a text first, then a call that routes into booking — plus automatic re-engagement if they don’t answer.
              </p>

              <ul className="bullets">
                <li><strong>Books your calendar</strong> instead of “leaving leads hanging.”</li>
                <li><strong>Protects show rate</strong> with a pre-call prep layer (so fewer wasted slots).</li>
                <li><strong>Runs consistently</strong> without relying on humans to remember.</li>
              </ul>

              <div className="pillStatRow">
                <StatPill title="Step 1" sub="Text goes out in ~5 seconds" />
                <StatPill title="Step 2" sub="Call in ~15 seconds (booking flow)" />
                <StatPill title="Step 3" sub="If missed: back-to-back + re-engagement cadence" />
              </div>

              <div className="section">
                <div className="howGrid">
                  <div className="card">
                    <div className="cardTitle">What you’re testing</div>
                    <p className="cardSub">
                      The real customer experience: speed-to-lead → answered call routes into booking → missed calls get recovered.
                    </p>
                  </div>
                  <div className="card">
                    <div className="cardTitle">What you get today</div>
                    <p className="cardSub">
                      A free strategy consult focused on fixing the leak: response speed, booking structure, and show-rate protection.
                    </p>
                  </div>
                  <div className="card">
                    <div className="cardTitle">What happens after</div>
                    <p className="cardSub">
                      If it’s a fit, we map the simplest install path that matches your tools and volume. No pressure, no weird surprises.
                    </p>
                  </div>
                </div>

                <Accordion title="FAQ: What if I miss the call?" defaultOpen={false}>
{`No problem. The system is designed for missed calls.
It will continue with a short re-engagement cadence (text + additional attempts) until contact or a clear stop request.

Tip: if your phone is on Do Not Disturb, turn it off for the next minute so you can experience the flow.`}
                </Accordion>

                <Accordion title="FAQ: Do I need new tools to use this?" defaultOpen={false}>
{`Not automatically.
This can be installed on top of what you already use — we match your current stack and constraints.

The whole point is speed + consistency, not “more software.”`}
                </Accordion>
              </div>

              <footer className="footer">
                <span>© {new Date().getFullYear()} All In Digital. </span>
                <a href="/terms" target="_blank" rel="noopener noreferrer">Terms</a>
                {" · "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy</a>
              </footer>
            </div>

            <div>
              <form className="formCard" onSubmit={handleSubmit}>
                <h3>Run the live demo</h3>
                <p>Text first, then a call. Answer to experience the booking flow.</p>

                <label htmlFor="firstName">First Name *</label>
                <input id="firstName" name="firstName" required autoComplete="given-name" />

                <label htmlFor="email">Email *</label>
                <input id="email" name="email" type="email" required autoComplete="email" />

                <label htmlFor="phone">Mobile Number *</label>
                <input id="phone" name="phone" type="tel" required autoComplete="tel" />

                <label htmlFor="businessType">Business / Team Type</label>
                <input id="businessType" name="businessType" placeholder="HVAC, med spa, sales team, etc." />

                <label htmlFor="website">Website (optional)</label>
                <input id="website" name="website" placeholder="https://..." />

                <div className="consentRow">
                  <input id="consent" name="consent" type="checkbox" required />
                  <div className="consentText">
                    <strong>Required:</strong> I agree to receive SMS and calls related to my inquiry from All In Digital
                    (demo link, confirmations, follow-up I requested). Message frequency may vary. Message &amp; data rates
                    may apply. Reply STOP to opt out and HELP for help. Consent is not a condition of purchase.
                    We do not sell or share your mobile number with third parties for marketing/promotional purposes.
                  </div>
                </div>

                <button className="submitBtn" type="submit" disabled={isSubmitting || submitted}>
                  {isSubmitting ? "Starting demo…" : submitted ? "Submitted — demo running" : "Start the demo now"}
                </button>

                {submitError ? <div className="error">{submitError}</div> : null}

                {submitted ? (
                  <>
                    <div className="success" id="demoStatus">✅ Submitted. Stay here — your phone will ring.</div>

                    {demoStatus ? (
                      <div className="demoPanel" aria-live="polite">
                        <div className="demoTop">
                          <div className="demoTitle">{demoStatus.title}</div>
                          <div className={cx("demoBadge", demoStatus.accent)}>
                            {demoPhase === "call_now" ? "INCOMING" : "LIVE"}
                          </div>
                        </div>

                        <div className="demoLine">{demoStatus.line1}</div>
                        <div className="demoLine">{demoStatus.line2}</div>

                        <div className="progressWrap" aria-hidden="true">
                          <div
                            className="progressBar"
                            style={
                              {
                                ["--w" as any]: `${Math.max(0, Math.min(1, demoStatus.progress)) * 100}%`,
                              } as any
                            }
                          />
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </form>
            </div>
          </div>
        </section>
      </div>

      <div className="sticky" role="region" aria-label="Sticky call to action">
        <div className="stickyInner">
          <div className="stickyText">
            Want to see it live? <span>Text in ~5s → Call in ~15s</span>
          </div>
          <button
            className="stickyBtn"
            type="button"
            onClick={() => {
              try {
                const el = document.querySelector("form");
                (el as any)?.scrollIntoView?.({ behavior: "smooth", block: "start" });
              } catch {}
            }}
          >
            Start the demo
          </button>
        </div>
      </div>
    </main>
  );
}
