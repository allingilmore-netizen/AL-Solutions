
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type IndustryTrack = "sales" | "local" | null;

/**
 * Helper to send lead data to your Next.js API route,
 * which then calls Thoughtly.
 */
async function sendLeadToThoughtly(payload: {
  firstName: string;
  email: string;
  phone: string;
  consent: boolean;
  source: string;
  companyType?: string;
  track?: string;
}) {
  console.log("Sending payload to Thoughtly:", payload);

  const res = await fetch("/api/thoughtly-webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    // response may not be JSON; that's OK
  }

  return { ok: res.ok && (data?.ok ?? true), data };
}

export default function Page() {
  const [industryTrack, setIndustryTrack] = useState<IndustryTrack>(null);
  const [hasContinued, setHasContinued] = useState(false);

  const [isRoiOpen, setIsRoiOpen] = useState(false);
  const [isExitIntentOpen, setIsExitIntentOpen] = useState(false);
  const [hasExitIntentShown, setHasExitIntentShown] = useState(false);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [exitFormSubmitted, setExitFormSubmitted] = useState(false);

  // Form UX state for main lead form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Exit form UX
  const [isExitSubmitting, setIsExitSubmitting] = useState(false);
  const [exitSubmitError, setExitSubmitError] = useState<string | null>(null);

  // Simple ROI state
  const [monthlyLeads, setMonthlyLeads] = useState("200");
  const [closeRate, setCloseRate] = useState("25");
  const [avgDealSize, setAvgDealSize] = useState("1500");
  const [liftPercent, setLiftPercent] = useState("20");

  // Refs for exit-intent logic (not for scrolling)
  const hasEngagedRef = useRef(false);
  const hasExitIntentRef = useRef(false);
  const isExitOpenRef = useRef(false);
  const lastScrollYRef = useRef(0);

  // Helper: hash jump for scroll-to-section
  const jumpToId = (id: string) => {
    if (typeof window === "undefined") return;
    const hash = `#${id}`;
    if (window.location.hash === hash) window.location.hash = "";
    window.location.hash = hash;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Engagement threshold: 7 seconds OR scroll 250px
    const engagementTimer = window.setTimeout(() => {
      if (!hasEngagedRef.current) hasEngagedRef.current = true;
    }, 7000);

    const handleScroll = () => {
      const y = window.scrollY || window.pageYOffset || 0;

      if (!hasEngagedRef.current && y > 250) {
        hasEngagedRef.current = true;
      }

      const previousY = lastScrollYRef.current;
      const delta = previousY - y;
      const scrollingUp = y < previousY;
      const isMobile = window.innerWidth < 1024;

      // Mobile exit-intent: upward scroll near top after engagement
      if (
        isMobile &&
        hasEngagedRef.current &&
        scrollingUp &&
        delta > 30 &&
        y < 300 &&
        !hasExitIntentRef.current &&
        !isExitOpenRef.current
      ) {
        hasExitIntentRef.current = true;
        isExitOpenRef.current = true;
        setHasExitIntentShown(true);
        setIsExitIntentOpen(true);
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
        !isExitOpenRef.current
      ) {
        hasExitIntentRef.current = true;
        isExitOpenRef.current = true;
        setHasExitIntentShown(true);
        setIsExitIntentOpen(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.clearTimeout(engagementTimer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Scroll-based fade-in for elements
  useEffect(() => {
    if (typeof window === "undefined") return;

    const elements = document.querySelectorAll<HTMLElement>(".fade-on-scroll");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            target.classList.add("is-visible");
            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.18 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [hasContinued]);

  const handleTrackSelect = (track: IndustryTrack) => {
    setIndustryTrack(track);
  };

  const handleContinue = () => {
    if (!industryTrack) return;
    setHasContinued(true);
    if (typeof window !== "undefined") {
      setTimeout(() => jumpToId("system-blueprint-block"), 80);
    }
  };

  /**
   * Main lead form submission
   */
  const handleLeadSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData(form);
    const firstName = (formData.get("firstName") as string | null) ?? "";
    const email = (formData.get("email") as string | null) ?? "";
    const phone = (formData.get("phone") as string | null) ?? "";
    const companyType = (formData.get("companyType") as string | null) ?? "";
    const consent = formData.get("consent") === "on";

    try {
      const result = await sendLeadToThoughtly({
        firstName,
        email,
        phone,
        consent,
        companyType,
        track: industryTrack ?? "",
        source: "Landing Page – Strategy-First Web Form",
      });

      if (!result.ok) {
        console.error("Webhook error", result.data);
        setSubmitError("Something went wrong. Please try again.");
      } else {
        setFormSubmitted(true);
      }
    } catch (err) {
      console.error("Error calling /api/thoughtly-webhook", err);
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Exit-intent form submission (also sends to Thoughtly)
   */
  const handleExitLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;

    setIsExitSubmitting(true);
    setExitSubmitError(null);

    const formData = new FormData(form);
    const firstName = (formData.get("exitName") as string | null) ?? "";
    const phone = (formData.get("exitPhone") as string | null) ?? "";
    const consent = formData.get("exitConsent") === "on";

    // Exit form keeps it minimal; we pass a placeholder email (keeps payload shape stable)
    const email = "unknown@no-email-provided.local";

    try {
      const result = await sendLeadToThoughtly({
        firstName,
        email,
        phone,
        consent,
        track: industryTrack ?? "",
        source: "Landing Page – Exit Intent",
      });

      if (!result.ok) {
        console.error("Exit webhook error", result.data);
        setExitSubmitError("Something went wrong. Please try again.");
      } else {
        setExitFormSubmitted(true);
      }
    } catch (err) {
      console.error("Error calling /api/thoughtly-webhook (exit)", err);
      setExitSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsExitSubmitting(false);
    }
  };

  const openRoi = () => setIsRoiOpen(true);
  const closeRoi = () => setIsRoiOpen(false);

  const closeExitIntent = () => {
    setIsExitIntentOpen(false);
    isExitOpenRef.current = false;
  };

  const selectedLabel =
    industryTrack === "sales"
      ? "Sales Teams"
      : industryTrack === "local"
      ? "Local Businesses"
      : "";

  const isSales = industryTrack === "sales";

  const parsedMonthlyLeads = Number(monthlyLeads) || 0;
  const parsedCloseRate = Number(closeRate) || 0;
  const parsedAvgDealSize = Number(avgDealSize) || 0;
  const parsedLiftPercent = Number(liftPercent) || 0;

  const baselineClosed = parsedMonthlyLeads * (parsedCloseRate / 100);
  const extraClosed = baselineClosed * (parsedLiftPercent / 100);
  const extraRevenue = extraClosed * parsedAvgDealSize;

  return (
    <main className="aid-page">
      <style>{`
        :root {
          --emerald: #047857;
          --emerald-dark: #065f46;
          --gold: #F4D03F;
          --charcoal: #0F172A;
          --offwhite: #F9FAFB;
          --text-muted: #9CA3AF;
        }

        body {
          margin: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
          background: radial-gradient(circle at top, #022c22 0, #020617 55%, #000000 100%);
          color: #E5E7EB;
          font-size: 23px;
        }

        .aid-page {
          min-height: 100vh;
        }

        .aid-wrapper {
          max-width: 1120px;
          margin: 0 auto;
          padding: 32px 16px 112px;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 32px;
        }

        .brand-mark {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .brand-logo {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: radial-gradient(circle at 30% 20%, #6EE7B7 0, #047857 45%, #022c22 100%);
          box-shadow: 0 12px 28px rgba(5, 150, 105, 0.45);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-weight: 700;
          letter-spacing: 0.09em;
          font-size: 0.98rem;
          text-transform: uppercase;
        }

        .brand-tagline {
          font-size: 0.86rem;
          color: var(--text-muted);
        }

        .header-pill {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          padding: 8px 18px;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(12px);
          color: #E5E7EB;
        }

        .header-pill-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 20%, #BBF7D0 0, #22C55E 40%, #166534 100%);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.7);
        }

        .hero-section {
          border-radius: 24px;
          padding: 32px 24px 28px;
          background: radial-gradient(circle at top left, rgba(4, 120, 87, 0.4), rgba(15, 23, 42, 0.95));
          border: 1px solid rgba(148, 163, 184, 0.35);
          box-shadow:
            0 24px 80px rgba(15, 23, 42, 0.85),
            0 0 0 1px rgba(15, 23, 42, 0.7);
        }

        .aid-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.95fr;
          gap: 32px;
          align-items: flex-start;
        }

        @media (max-width: 900px) {
          .aid-grid {
            grid-template-columns: 1fr;
          }

          .hero-section {
            padding: 24px 18px 22px;
          }
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.5);
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .hero-eyebrow span {
          padding: 2px 9px;
          border-radius: 999px;
          background: rgba(4, 120, 87, 0.18);
          color: #A7F3D0;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .hero-title {
          font-size: clamp(2.3rem, 3.6vw, 3.1rem);
          line-height: 1.08;
          letter-spacing: -0.04em;
          margin: 0 0 16px;
        }

        .hero-highlight {
          background: linear-gradient(120deg, #F4D03F, #F9A826);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-subtitle {
          font-size: 1.1rem;
          line-height: 1.65;
          color: #CBD5F5;
          max-width: 560px;
          margin-bottom: 22px;
        }

        .hero-ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          margin-bottom: 18px;
        }

        .primary-cta,
        .secondary-cta {
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          padding: 11px 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, color 0.15s ease;
        }

        .primary-cta {
          background: linear-gradient(135deg, #047857, #22C55E);
          color: #ECFDF5;
          box-shadow: 0 14px 40px rgba(16, 185, 129, 0.45);
        }

        .primary-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 52px rgba(16, 185, 129, 0.65);
        }

        .secondary-cta {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.7);
          color: #E5E7EB;
        }

        .secondary-cta:hover {
          background: rgba(15, 23, 42, 1);
          transform: translateY(-1px);
        }

        .hero-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 0.9rem;
        }

        .hero-badge {
          padding: 5px 11px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.5);
          color: var(--text-muted);
        }

        .hero-note {
          margin-top: 10px;
          font-size: 0.86rem;
          color: var(--text-muted);
        }

        .hero-note span {
          color: #FBBF24;
          font-weight: 600;
        }

        .hero-side {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .lead-form {
          background: #FFFFFF;
          border-radius: 18px;
          padding: 20px 18px 18px;
          color: #0F172A;
          box-shadow:
            0 20px 60px rgba(15, 23, 42, 0.45),
            0 0 0 1px rgba(148, 163, 184, 0.35);
          scroll-margin-top: 120px;
        }

        .lead-form h2 {
          margin: 0 0 6px;
          font-size: 1.2rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #111827;
        }

        .lead-form p {
          margin: 0 0 12px;
          font-size: 0.96rem;
          color: #4B5563;
        }

        .lead-form label {
          display: block;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 3px;
        }

        .lead-form input,
        .lead-form select {
          width: 100%;
          padding: 9px 10px;
          border-radius: 9px;
          border: 1px solid #D1D5DB;
          font-size: 0.96rem;
          margin-bottom: 10px;
          outline: none;
          transition: border-color 0.14s ease, box-shadow 0.14s ease;
        }

        .lead-form input:focus,
        .lead-form select:focus {
          border-color: #047857;
          box-shadow: 0 0 0 1px rgba(4, 120, 87, 0.35);
        }

        .lead-form .consent-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin: 6px 0 10px;
          padding: 10px 10px;
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(248, 113, 113, 0.85);
          box-shadow: 0 0 0 1px rgba(127, 29, 29, 0.18);
        }

        .lead-form .consent-row input[type="checkbox"] {
          margin-top: 4px;
          width: auto;
          accent-color: #ef4444;
        }

        .lead-form .consent-row span {
          font-size: 0.82rem;
          color: #7F1D1D;
        }

        .lead-submit-btn {
          width: 100%;
          border-radius: 999px;
          border: none;
          padding: 10px 12px;
          font-size: 0.98rem;
          font-weight: 600;
          cursor: pointer;
          background: linear-gradient(135deg, #047857, #059669);
          color: #ECFDF5;
          box-shadow: 0 16px 40px rgba(5, 150, 105, 0.4);
          transition: transform 0.16s ease, box-shadow 0.16s ease;
          margin-top: 2px;
        }

        .lead-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 20px 52px rgba(5, 150, 105, 0.55);
        }

        .lead-thankyou {
          margin-top: 8px;
          font-size: 0.86rem;
          color: #047857;
          font-weight: 500;
        }

        .lead-sms-tip {
          margin-top: 8px;
          font-size: 0.78rem;
          color: #B91C1C;
        }

        .selector-card {
          background: rgba(15, 23, 42, 0.98);
          border-radius: 16px;
          padding: 16px 15px 13px;
          border: 1px solid rgba(148, 163, 184, 0.55);
        }

        .selector-title {
          font-size: 0.96rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .selector-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .selector-buttons {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 10px;
        }

        .selector-button {
          position: relative;
          border-radius: 14px;
          border: 2px solid rgba(148, 163, 184, 0.7);
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.9));
          color: #E5E7EB;
          padding: 10px 12px 9px;
          text-align: left;
          font-size: 0.9rem;
          cursor: pointer;
          transition:
            border-color 0.15s ease,
            background 0.15s ease,
            transform 0.12s ease,
            box-shadow 0.12s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.95);
        }

        .selector-button strong {
          display: block;
          font-size: 0.96rem;
          margin-bottom: 3px;
        }

        .selector-button span {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .selector-button::after {
          content: "Tap to select";
          margin-top: 4px;
          font-size: 0.76rem;
          color: var(--text-muted);
          opacity: 0.9;
        }

        .selector-button--active {
          border-color: #F4D03F;
          background: linear-gradient(145deg, rgba(4, 120, 87, 1), rgba(15, 23, 42, 0.98));
          box-shadow: 0 18px 40px rgba(4, 120, 87, 0.7);
          transform: translateY(-2px);
        }

        .selector-button--active::after {
          content: "Selected";
          color: #F4D03F;
          font-weight: 600;
        }

        .selector-button:hover {
          box-shadow: 0 16px 34px rgba(15, 23, 42, 0.9);
          transform: translateY(-1px);
        }

        .selector-button:active {
          transform: translateY(0);
          box-shadow: 0 8px 16px rgba(15, 23, 42, 0.85);
        }

        .selector-continue {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .continue-btn {
          border-radius: 999px;
          border: none;
          padding: 9px 15px;
          font-size: 0.9rem;
          font-weight: 600;
          background: var(--gold);
          color: #111827;
          cursor: pointer;
          box-shadow: 0 10px 26px rgba(180, 83, 9, 0.45);
          transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .continue-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 34px rgba(180, 83, 9, 0.65);
        }

        .continue-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          box-shadow: none;
        }

        .selector-helper {
          margin-top: 6px;
          font-size: 0.84rem;
          color: var(--text-muted);
        }

        /* Reveal block */

        .reveal-wrapper {
          margin-top: 36px;
          scroll-margin-top: 120px;
        }

        .reveal-intro {
          text-align: center;
          margin-bottom: 20px;
        }

        .reveal-kicker {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .reveal-heading {
          font-size: 1.7rem;
          margin-bottom: 8px;
        }

        .reveal-sub {
          font-size: 1.05rem;
          color: #CBD5F5;
          max-width: 760px;
          margin: 0 auto;
        }

        .pill-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 11px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .pill-tag span {
          font-weight: 600;
          color: #E5E7EB;
        }

        .reveal-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
          gap: 22px;
          align-items: flex-start;
        }

        @media (max-width: 900px) {
          .reveal-grid {
            grid-template-columns: 1fr;
          }
        }

        .panel {
          border-radius: 18px;
          padding: 18px 16px 14px;
          background: radial-gradient(circle at top, rgba(15, 118, 110, 0.35), rgba(15, 23, 42, 0.98));
          border: 1px solid rgba(148, 163, 184, 0.55);
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.75);
        }

        .panel-alt {
          background: radial-gradient(circle at top, rgba(24, 24, 27, 0.9), rgba(15, 23, 42, 0.98));
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 10px;
        }

        .panel-title {
          font-size: 1.05rem;
          font-weight: 600;
        }

        .panel-label {
          font-size: 0.84rem;
          padding: 3px 9px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.55);
          color: var(--text-muted);
        }

        .flow-section {
          margin-bottom: 14px;
        }

        .flow-section h4 {
          font-size: 0.94rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          margin-bottom: 4px;
          color: #A5B4FC;
        }

        .flow-section p {
          margin: 0 0 6px;
          font-size: 0.98rem;
          color: #E5E7EB;
        }

        .flow-steps {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 8px;
        }

        .flow-step {
          padding: 9px 11px;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.5);
        }

        .flow-step-title {
          font-size: 0.98rem;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .flow-step-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .arrow-down {
          text-align: center;
          font-size: 0.86rem;
          color: #64748B;
          padding: 2px 0;
        }

        .panel-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 6px;
        }

        .panel-list li {
          padding-left: 18px;
          position: relative;
          font-size: 0.98rem;
          color: #E5E7EB;
        }

        .panel-list li::before {
          content: "•";
          position: absolute;
          left: 4px;
          top: 0;
          color: #F4D03F;
        }

        .section-row {
          margin-top: 24px;
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
          gap: 22px;
          align-items: flex-start;
        }

        @media (max-width: 900px) {
          .section-row {
            grid-template-columns: 1fr;
          }
        }

        .phase-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        @media (max-width: 900px) {
          .phase-grid {
            grid-template-columns: 1fr;
          }
        }

        .phase-card {
          border-radius: 16px;
          padding: 13px 12px 10px;
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.6);
        }

        .phase-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .phase-chip {
          font-size: 0.84rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #A5B4FC;
          margin-bottom: 3px;
        }

        .phase-list {
          margin: 0;
          padding-left: 18px;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .phase-list li {
          margin-bottom: 3px;
        }

        .roi-card {
          border-radius: 18px;
          padding: 16px;
          background: radial-gradient(circle at top, rgba(250, 250, 250, 0.06), rgba(15, 23, 42, 0.96));
          border: 1px solid rgba(148, 163, 184, 0.65);
        }

        .roi-card h3 {
          margin: 0 0 4px;
          font-size: 1.05rem;
        }

        .roi-card p {
          margin: 0 0 10px;
          font-size: 0.94rem;
          color: var(--text-muted);
        }

        .roi-cta-btn {
          border-radius: 999px;
          border: none;
          padding: 9px 15px;
          font-size: 0.96rem;
          font-weight: 600;
          background: var(--gold);
          color: #111827;
          cursor: pointer;
          box-shadow: 0 12px 32px rgba(180, 83, 9, 0.45);
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }

        .roi-cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 40px rgba(180, 83, 9, 0.6);
        }

        .advanced-card {
          border-radius: 18px;
          padding: 16px;
          background: radial-gradient(circle at top, rgba(4, 120, 87, 0.22), rgba(15, 23, 42, 0.98));
          border: 1px solid rgba(148, 163, 184, 0.7);
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.55);
        }

        .advanced-card h3 {
          margin: 0 0 6px;
          font-size: 1.05rem;
        }

        .advanced-card p {
          margin: 0 0 8px;
          font-size: 0.94rem;
          color: #E5E7EB;
        }

        .advanced-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          font-size: 0.88rem;
          color: #CBD5F5;
          margin-bottom: 8px;
        }

        .advanced-chip span {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #4ADE80;
          box-shadow: 0 0 10px rgba(74, 222, 128, 0.85);
        }

        /* Modals */

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.86);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 40;
          backdrop-filter: blur(10px);
        }

        .modal-card {
          width: 100%;
          max-width: 520px;
          margin: 0 16px;
          background: #020617;
          border-radius: 18px;
          border: 1px solid rgba(148, 163, 184, 0.75);
          box-shadow: 0 28px 80px rgba(15, 23, 42, 0.95);
          padding: 20px 18px 16px;
          color: #E5E7EB;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.14rem;
        }

        .modal-close {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          background: transparent;
          color: #9CA3AF;
          padding: 4px 10px;
          font-size: 0.82rem;
          cursor: pointer;
        }

        .modal-body {
          font-size: 0.94rem;
        }

        .modal-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 12px;
          margin-top: 12px;
        }

        @media (max-width: 640px) {
          .modal-grid {
            grid-template-columns: 1fr;
          }
        }

        .modal-field label {
          display: block;
          font-size: 0.88rem;
          margin-bottom: 3px;
          color: #CBD5F5;
        }

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
          border-color: #047857;
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

        .modal-metric strong {
          font-size: 1.08rem;
          display: block;
          margin-top: 2px;
        }

        .modal-footnote {
          margin-top: 8px;
          font-size: 0.86rem;
          color: var(--text-muted);
        }

        .exit-highlight {
          color: #FBBF24;
          font-weight: 600;
        }

        /* Exit-intent inline form */

        .exit-form {
          margin-top: 14px;
          padding: 12px 10px 10px;
          border-radius: 14px;
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.7);
        }

        .exit-form label {
          display: block;
          font-size: 0.85rem;
          margin-bottom: 2px;
          color: #CBD5F5;
        }

        .exit-form input {
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

        .exit-form input:focus {
          border-color: #047857;
          box-shadow: 0 0 0 1px rgba(4, 120, 87, 0.45);
        }

        .exit-form small {
          font-size: 0.75rem;
          color: #9CA3AF;
        }

        .exit-consent-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin: 6px 0 8px;
        }

        .exit-consent-row input[type="checkbox"] {
          margin-top: 3px;
          width: auto;
          accent-color: #ef4444;
        }

        .exit-consent-row span {
          font-size: 0.78rem;
          color: #9CA3AF;
        }

        .exit-submit-btn {
          margin-top: 8px;
          width: 100%;
          border-radius: 999px;
          border: none;
          padding: 8px 10px;
          font-size: 0.9rem;
          font-weight: 600;
          background: linear-gradient(135deg, #047857, #22C55E);
          color: #ECFDF5;
          cursor: pointer;
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.55);
          opacity: 1;
        }

        .exit-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .exit-thankyou {
          margin-top: 6px;
          font-size: 0.8rem;
          color: #A7F3D0;
        }

        /* Sticky CTA */

        .sticky-cta {
          position: fixed;
          inset-inline: 0;
          bottom: 0;
          z-index: 30;
          padding: 10px 16px 12px;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }

        .sticky-inner {
          pointer-events: auto;
          max-width: 840px;
          width: 100%;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.7);
          box-shadow: 0 -10px 40px rgba(15, 23, 42, 0.85);
          padding: 9px 13px;
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: space-between;
        }

        .sticky-text {
          font-size: 0.9rem;
          color: #E5E7EB;
        }

        .sticky-text span {
          color: #F4D03F;
          font-weight: 600;
        }

        .sticky-btn {
          border-radius: 999px;
          border: none;
          padding: 8px 15px;
          font-size: 0.96rem;
          font-weight: 600;
          background: linear-gradient(135deg, #047857, #22C55E);
          color: #ECFDF5;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.55);
          white-space: nowrap;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 640px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .sticky-inner {
            flex-direction: column;
            align-items: flex-start;
          }

          .sticky-btn {
            width: 100%;
            text-align: center;
            justify-content: center;
          }
        }

        /* Base fade-up for hero & modals */

        .fade-up {
          opacity: 0;
          transform: translateY(18px);
          animation: fadeUp 0.6s ease-out forwards;
        }

        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Scroll-triggered fade */

        .fade-on-scroll {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .fade-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Tiny footer legal links */
        .footer-legal {
          margin-top: 32px;
          font-size: 0.7rem;
          color: #6B7280;
          text-align: center;
          opacity: 0.8;
        }

        .footer-legal a {
          color: inherit;
          text-decoration: none;
          border-bottom: 1px solid rgba(107, 114, 128, 0.3);
          padding-bottom: 1px;
        }

        .footer-legal a:hover {
          opacity: 1;
          border-bottom-color: rgba(148, 163, 184, 0.8);
        }
      `}</style>

      <div className="aid-wrapper">
        <header className="page-header fade-on-scroll">
          <div className="brand-mark">
            <div className="brand-logo" />
            <div className="brand-text">
              <div className="brand-name">ALL IN DIGITAL</div>
              <div className="brand-tagline">Revenue Systems &amp; Speed-to-Lead Strategy</div>
            </div>
          </div>
          <div className="header-pill">
            <div className="header-pill-dot" />
            <span>Fix speed-to-lead, booking, and follow-up—then automate if you want</span>
          </div>
        </header>

        <section className="hero-section fade-up fade-on-scroll">
          <div className="aid-grid">
            <div className="fade-on-scroll">
              <div className="hero-eyebrow">
                <span>Live System Demo</span>
                <div>Under 60 seconds from form → first follow-up</div>
              </div>

              <h1 className="hero-title">
                Turn missed calls into{" "}
                <span className="hero-highlight">booked revenue</span>{" "}
                with a proven Speed-to-Lead system.
              </h1>

              <p className="hero-subtitle">
                We install the exact operating system that stops leads from leaking:
                instant follow-up, booking-first scripts, no-show recovery, and pipeline clean-up.
                You can run it with humans… or automate parts of it once you’re ready.
              </p>

              <div className="hero-ctas">
                <button
                  className="primary-cta"
                  type="button"
                  onClick={() => jumpToId("leadForm")}
                >
                  See the System in Action
                </button>

                <button className="secondary-cta" type="button" onClick={openRoi}>
                  Run ROI Calculator
                </button>

                <a
                  href="tel:+12396880201"
                  className="secondary-cta"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    textDecoration: "none",
                    background: "rgba(4,120,87,0.18)",
                    border: "1px solid rgba(4,120,87,0.45)",
                    color: "#A7F3D0",
                    fontWeight: 600,
                  }}
                >
                  📞 Call Now
                </a>
              </div>

              <div className="hero-badges">
                <div className="hero-badge">Follow-up in 5–30 seconds</div>
                <div className="hero-badge">Booking-first scripts (no pitch-first)</div>
                <div className="hero-badge">
                  Built for {selectedLabel || "growing teams"} that hate missed calls
                </div>
              </div>

              <p className="hero-note">
                <span>Strategy-first.</span> The system works manually. Automation is optional—and only added when it makes sense.
              </p>
            </div>

            <div className="hero-side fade-on-scroll">
              <form id="leadForm" className="lead-form" onSubmit={handleLeadSubmit}>
                <h2>FREE SYSTEM WALKTHROUGH</h2>
                <p>
                  Drop your details and we&apos;ll show a real Speed-to-Lead flow tailored to{" "}
                  your {selectedLabel || "business"}.
                </p>

                <label htmlFor="firstName">First Name *</label>
                <input id="firstName" name="firstName" required />

                <label htmlFor="email">Email *</label>
                <input id="email" name="email" type="email" required />

                <label htmlFor="phone">Mobile Number *</label>
                <input id="phone" name="phone" type="tel" required />

                <label htmlFor="companyType">Business / Team Type</label>
                <input
                  id="companyType"
                  name="companyType"
                  placeholder={selectedLabel || "Med spa, HVAC, inside sales team..."}
                />

                <div className="consent-row">
                  <input id="consent" name="consent" type="checkbox" required />
                  <span>
                    I agree to receive SMS updates related to my inquiry from All In Digital.
                    By providing your phone number and opting in, you agree to receive SMS
                    updates related to your inquiry (such as demo links, confirmations, and
                    follow-up info you requested). Message frequency may vary. Message &amp;
                    data rates may apply. Reply STOP to opt out and HELP for help. Consent
                    is not a condition of purchase. We do not sell or share your mobile
                    number with third parties for marketing or promotional purposes.
                  </span>
                </div>

                <button type="submit" className="lead-submit-btn" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Sending..."
                    : formSubmitted
                    ? "Submitted – check your texts"
                    : "Show Me the System"}
                </button>

                <div className="lead-sms-tip">
                  We text the demo link + a quick “what to fix first” summary. (SMS opt-in required to deliver it.)
                </div>

                {submitError && (
                  <div style={{ marginTop: 6, fontSize: "0.82rem", color: "#f87171" }}>
                    {submitError}
                  </div>
                )}

                {formSubmitted && (
                  <div className="lead-thankyou">
                    Thanks! We&apos;ll text you the walkthrough link shortly.
                  </div>
                )}
              </form>

              <div className="selector-card">
                <div className="selector-title">Which are you?</div>
                <div className="selector-sub">
                  We’ll tailor examples and scripts to match your world.
                </div>

                <div className="selector-buttons">
                  <button
                    type="button"
                    className={
                      "selector-button" +
                      (industryTrack === "sales" ? " selector-button--active" : "")
                    }
                    onClick={() => handleTrackSelect("sales")}
                  >
                    <strong>Sales Teams</strong>
                    <span>Demos, discovery calls, consults, pipelines.</span>
                  </button>
                  <button
                    type="button"
                    className={
                      "selector-button" +
                      (industryTrack === "local" ? " selector-button--active" : "")
                    }
                    onClick={() => handleTrackSelect("local")}
                  >
                    <strong>Local Businesses</strong>
                    <span>Med spa, dental, home services, showrooms.</span>
                  </button>
                </div>

                <div className="selector-continue">
                  <div className="selector-helper">
                    {industryTrack
                      ? `Perfect — here’s the blueprint for a ${selectedLabel.toLowerCase()}.`
                      : "Tap one above, then continue."}
                  </div>
                  {industryTrack && (
                    <button type="button" className="continue-btn" onClick={handleContinue}>
                      Continue <span>↗</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {hasContinued && (
          <section id="system-blueprint-block" className="reveal-wrapper fade-on-scroll">
            <div className="reveal-intro fade-on-scroll">
              <div className="pill-tag">
                Built for <span>{selectedLabel || "growing teams"}</span>
              </div>
              <div className="reveal-kicker">Strategy First → Implementation Second</div>
              <h2 className="reveal-heading">
                Your Revenue System Blueprint (manual or automated)
              </h2>
              <p className="reveal-sub">
                This is the same system whether a human runs it or software runs it:
                speed-to-lead, booking-first scripts, follow-up sequences, and recovery.
                Once it works manually, you can automate parts for consistency and scale.
              </p>
            </div>

            <div className="reveal-grid">
              <div className="panel fade-on-scroll">
                <div className="panel-header">
                  <div className="panel-title">🧩 The System Spine</div>
                  <div className="panel-label">
                    {isSales ? "Lead → booked meeting" : "Call → booked job"}
                  </div>
                </div>

                <div className="flow-section">
                  <h4>Step 1</h4>
                  <p>
                    Stop the bleed: respond instantly and drive to a clean booking (not a pitch).
                  </p>
                  <div className="flow-steps">
                    <div className="flow-step">
                      <div className="flow-step-title">
                        {isSales ? "Inbound Lead Intake" : "Front Desk Intake"}
                      </div>
                      <div className="flow-step-desc">
                        Capture name + intent fast and route correctly (sales, support, estimate, scheduling).
                      </div>
                    </div>
                    <div className="arrow-down">↓</div>
                    <div className="flow-step">
                      <div className="flow-step-title">Booking-First Script</div>
                      <div className="flow-step-desc">
                        Book the next step with clear A/B time options and a simple commitment.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flow-section">
                  <h4>Step 2</h4>
                  <p>
                    Follow-up is where most teams lose. This keeps leads alive without burning out staff.
                  </p>
                  <div className="flow-steps">
                    <div className="flow-step">
                      <div className="flow-step-title">Speed-to-Lead Sequence</div>
                      <div className="flow-step-desc">
                        SMS in seconds, first call within ~15–20 seconds, backup attempts + 4-minute follow-up text.
                      </div>
                    </div>
                    <div className="arrow-down">↓</div>
                    <div className="flow-step">
                      <div className="flow-step-title">Long-Tail Follow-Up</div>
                      <div className="flow-step-desc">
                        30 calls + 15 texts over 30–60 days (for “not now”, missed calls, and cold leads).
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flow-section">
                  <h4>Step 3</h4>
                  <p>
                    Protect calendar time and rescue revenue when people no-show or go dark.
                  </p>
                  <div className="flow-steps">
                    <div className="flow-step">
                      <div className="flow-step-title">No-Show / “Not Here” Recovery</div>
                      <div className="flow-step-desc">
                        Reschedules missed appointments and recovers “not home / not on call” outcomes.
                      </div>
                    </div>
                    <div className="arrow-down">↓</div>
                    <div className="flow-step">
                      <div className="flow-step-title">Pre-Call Training Layer</div>
                      <div className="flow-step-desc">
                        A short video that sets expectations, anchors policies, and increases conversion before the call.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel panel-alt fade-on-scroll">
                <div className="panel-header">
                  <div className="panel-title">🛠️ 3 Ways To Deploy It</div>
                  <div className="panel-label">Choose your lane</div>
                </div>

                <ul className="panel-list">
                  <li>
                    <strong>DIY (Blueprint)</strong> — you run it with your team. You get scripts, timing, templates, and a clear SOP.
                  </li>
                  <li>
                    <strong>Done-With-You</strong> — we implement the system with your team for 60 days so it runs consistently.
                  </li>
                  <li>
                    <strong>Done-For-You</strong> — we implement + automate the heavy lifting so it runs without staff discipline.
                  </li>
                </ul>

                <p className="hero-note" style={{ marginTop: 10 }}>
                  You don’t “buy AI.” You install a <span>revenue system</span>. Automation is optional.
                </p>
              </div>
            </div>

            <div className="section-row">
              <div className="panel panel-alt fade-on-scroll">
                <div className="panel-header">
                  <div className="panel-title">✅ What This Replaces (Quiet Leaks)</div>
                  <div className="panel-label">Where the ROI hides</div>
                </div>
                <ul className="panel-list">
                  <li>
                    <strong>Missed calls &amp; slow responses.</strong> The lead goes to whoever answers first.
                  </li>
                  <li>
                    <strong>Pitch-first calls.</strong> You’re selling before the prospect is emotionally committed.
                  </li>
                  <li>
                    <strong>No-show waste.</strong> Empty slots = lost time + lost ad spend.
                  </li>
                  <li>
                    <strong>Forgotten follow-up.</strong> “Call them later” becomes “never.”
                  </li>
                  <li>
                    <strong>Operational phone-churn.</strong> Staff stuck on confirmations and ETAs instead of revenue work.
                  </li>
                </ul>
              </div>

              <div className="roi-card fade-on-scroll">
                <h3>📈 Quick ROI Estimate</h3>
                <p>
                  Back-of-napkin math to show what plugging the leaks can do—before we talk build-out.
                </p>
                <button className="roi-cta-btn" type="button" onClick={openRoi}>
                  Open ROI Calculator
                </button>
              </div>
            </div>

            <div className="section-row">
              <div className="fade-on-scroll">
                <div className="panel panel-alt">
                  <div className="panel-header">
                    <div className="panel-title">📦 Rollout Plan</div>
                    <div className="panel-label">Low-risk phases</div>
                  </div>
                  <p style={{ fontSize: "0.98rem", color: "#CBD5F5", marginBottom: 10 }}>
                    We start with the smallest version that creates wins, then expand:
                    faster booking, tighter follow-up, then automation where it’s actually useful.
                  </p>

                  <div className="phase-grid">
                    <div className="phase-card fade-on-scroll">
                      <div className="phase-chip">Phase 1</div>
                      <div className="phase-title">Foundation</div>
                      <ul className="phase-list">
                        <li>Compliant landing / intake.</li>
                        <li>Immediate follow-up wiring.</li>
                        <li>Booking-first script.</li>
                        <li>Basic reporting (booked / missed / recovered).</li>
                      </ul>
                    </div>

                    <div className="phase-card fade-on-scroll">
                      <div className="phase-chip">Phase 2</div>
                      <div className="phase-title">Follow-Up &amp; Recovery</div>
                      <ul className="phase-list">
                        <li>30/60-day nurture sequence.</li>
                        <li>No-show and “not here” recovery.</li>
                        <li>Better show-rate policy + reminders.</li>
                        <li>Continuous tweaks from real outcomes.</li>
                      </ul>
                    </div>

                    <div className="phase-card fade-on-scroll">
                      <div className="phase-chip">Phase 3</div>
                      <div className="phase-title">Automation Layer (Optional)</div>
                      <ul className="phase-list">
                        <li>Automate the parts humans won’t run consistently.</li>
                        <li>After-hours coverage.</li>
                        <li>Dispatch / routing assistance.</li>
                        <li>Advanced: quotes, email workflows, custom ops.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="advanced-card fade-on-scroll">
                <div className="advanced-chip">
                  <span />
                  Advanced (optional)
                </div>
                <h3>Want the “Full Stack” Later?</h3>
                <p>
                  Once the SOP is installed, we can add higher-level systems like automated quotes,
                  email response handling, sales enablement, and custom ops automations.
                </p>
                <p style={{ fontSize: "0.94rem", color: "#CBD5F5" }}>
                  The point is simple: <strong>system first</strong>, then scale it.
                </p>
              </div>
            </div>
          </section>
        )}

        <footer className="footer-legal">
          <span>© {new Date().getFullYear()} All In Digital. </span>
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>
          {" · "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
        </footer>
      </div>

      {/* ROI Modal */}
      {isRoiOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card fade-up">
            <div className="modal-header">
              <h2>ROI Calculator</h2>
              <button className="modal-close" type="button" onClick={closeRoi}>
                Close
              </button>
            </div>

            <div className="modal-body">
              <p>
                Quick estimate. We’ll run a deeper version on a call.
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
                  <label htmlFor="lift">Expected lift (%)</label>
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
                This doesn&apos;t include time saved, higher show rates, or upsells—just direct revenue from closing more of what you already generate.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit Intent Modal (desktop + mobile) */}
      {isExitIntentOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card fade-up">
            <div className="modal-header">
              <h2>Before you bounce...</h2>
              <button className="modal-close" type="button" onClick={closeExitIntent}>
                Close
              </button>
            </div>

            <div className="modal-body">
              <p>
                Most teams lose revenue quietly through voicemail, slow follow-up, and no-shows.
              </p>

              <p style={{ marginTop: 8 }}>
                Want a{" "}
                <span className="exit-highlight">
                  60-second breakdown of what to fix first
                </span>{" "}
                for your {selectedLabel || "business"}?
              </p>

              <form className="exit-form" onSubmit={handleExitLeadSubmit}>
                <label htmlFor="exitName">First name</label>
                <input id="exitName" name="exitName" required />

                <label htmlFor="exitPhone">Mobile number</label>
                <input id="exitPhone" name="exitPhone" type="tel" required />

                <div className="exit-consent-row">
                  <input id="exitConsent" name="exitConsent" type="checkbox" required />
                  <span>Yes, text me the walkthrough link and summary.</span>
                </div>

                <small>
                  By providing your phone number and opting in, you agree to receive SMS
                  updates related to your inquiry (such as demo links, confirmations, and
                  follow-up info you requested). Message frequency may vary. Message &amp;
                  data rates may apply. Reply STOP to opt out and HELP for help. Consent
                  is not a condition of purchase. We do not sell or share your mobile
                  number with third parties for marketing or promotional purposes.
                </small>

                <button type="submit" className="exit-submit-btn" disabled={isExitSubmitting}>
                  {isExitSubmitting ? "Sending..." : "Send it to me"}
                </button>

                {exitSubmitError && (
                  <div style={{ marginTop: 6, fontSize: "0.82rem", color: "#f87171" }}>
                    {exitSubmitError}
                  </div>
                )}

                {exitFormSubmitted && (
                  <div className="exit-thankyou">
                    Thanks! We&apos;ll text you shortly.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sticky bottom CTA */}
      <div className="sticky-cta">
        <div className="sticky-inner fade-on-scroll">
          <div className="sticky-text">
            Want the Speed-to-Lead blueprint for{" "}
            <span>{selectedLabel || "your business"}</span>?
          </div>
          <button className="sticky-btn" type="button" onClick={() => jumpToId("leadForm")}>
            Get the walkthrough
          </button>
        </div>
      </div>
    </main>
  );
}