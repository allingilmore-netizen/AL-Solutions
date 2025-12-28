"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type IndustryTrack = "sales" | "local" | null;

/**
 * Helper to send lead data to your Next.js API route,
 * which then calls Thoughtly.
 */
async function sendLeadToThoughtly(formData: FormData) {
  const firstName = formData.get("firstName") as string | null;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;

  const payload = {
    name: firstName,
    firstName,
    email,
    phone,
    consent: formData.get("consent") === "on",
    source: "Landing Page – Web Form",
  };

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
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /**
   * ROI Calculator (Upgraded to match your new claims)
   * Baseline:
   * Leads -> Booked -> Shows -> Closed -> Revenue
   * Scenario:
   * - Speed-to-lead: up to 800% increase in booked appts (modeled as up to 8x total)
   * - Speed + Follow-up: up to 1500% increase (modeled as up to 15x total)
   * - Show rate uplift: +20 to +60 percentage points
   * - Close rate uplift: +20 to +40 percentage points
   */
  const [monthlyLeads, setMonthlyLeads] = useState("200");
  const [bookRate, setBookRate] = useState("10");
  const [showRate, setShowRate] = useState("30");
  const [closeRate, setCloseRate] = useState("14");
  const [avgDealSize, setAvgDealSize] = useState("1500");

  const [bookingLiftMode, setBookingLiftMode] = useState<"none" | "800" | "1500">(
    "800"
  );
  const [showUpliftPts, setShowUpliftPts] = useState("20"); // 0–60
  const [closeUpliftPts, setCloseUpliftPts] = useState("20"); // 0–40

  // Refs for exit-intent logic (not for scrolling)
  const hasEngagedRef = useRef(false);
  const hasExitIntentRef = useRef(false);
  const isExitOpenRef = useRef(false);
  const lastScrollYRef = useRef(0);

  // Helper: hash jump for scroll-to-section
  const jumpToId = (id: string) => {
    if (typeof window === "undefined") return;
    const hash = `#${id}`;
    if (window.location.hash === hash) {
      window.location.hash = "";
    }
    window.location.hash = hash;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Engagement threshold: 7 seconds OR scroll 250px
    const engagementTimer = window.setTimeout(() => {
      if (!hasEngagedRef.current) {
        hasEngagedRef.current = true;
      }
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
      setTimeout(() => {
        jumpToId("ai-workforce-block");
      }, 80);
    }
  };

  /**
   * UPDATED: main lead form submission
   * - No reset() call at all (prevents null reset error)
   * - Calls sendLeadToThoughtly (your API route)
   * - Handles loading + error
   */
  const handleLeadSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const formData = new FormData(form);

    try {
      const result = await sendLeadToThoughtly(formData);

      if (!result.ok) {
        console.error("Webhook error", result.data);
        setSubmitError("Something went wrong. Please try again.");
      } else {
        setSubmitSuccess(true);
        setFormSubmitted(true);
      }
    } catch (err) {
      console.error("Error calling /api/thoughtly-webhook", err);
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExitLeadSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setExitFormSubmitted(true);
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

  // ROI math
  const parsedMonthlyLeads = Number(monthlyLeads) || 0;
  const parsedBookRate = Number(bookRate) || 0;
  const parsedShowRate = Number(showRate) || 0;
  const parsedCloseRate = Number(closeRate) || 0;
  const parsedAvgDealSize = Number(avgDealSize) || 0;

  const parsedShowUpliftPts = Math.max(0, Math.min(60, Number(showUpliftPts) || 0));
  const parsedCloseUpliftPts = Math.max(0, Math.min(40, Number(closeUpliftPts) || 0));

  const bookingMultiplier =
    bookingLiftMode === "none" ? 1 : bookingLiftMode === "800" ? 8 : 15;

  const baselineBooked = parsedMonthlyLeads * (parsedBookRate / 100);
  const baselineShows = baselineBooked * (parsedShowRate / 100);
  const baselineClosed = baselineShows * (parsedCloseRate / 100);
  const baselineRevenue = baselineClosed * parsedAvgDealSize;

  const projectedBooked = baselineBooked * bookingMultiplier;

  const projectedShowRate = Math.max(
    0,
    Math.min(100, parsedShowRate + parsedShowUpliftPts)
  );
  const projectedCloseRate = Math.max(
    0,
    Math.min(100, parsedCloseRate + parsedCloseUpliftPts)
  );

  const projectedShows = projectedBooked * (projectedShowRate / 100);
  const projectedClosed = projectedShows * (projectedCloseRate / 100);
  const projectedRevenue = projectedClosed * parsedAvgDealSize;

  const extraRevenue = projectedRevenue - baselineRevenue;

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
          margin-bottom: 18px;
        }

        /* NEW: Metrics strip (your 800% / 1500% / show / close claims) */
        .metric-strip {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin: 14px 0 18px;
        }

        @media (max-width: 700px) {
          .metric-strip {
            grid-template-columns: 1fr;
          }
        }

        .metric-card {
          border-radius: 16px;
          padding: 12px 12px 10px;
          border: 1px solid rgba(148, 163, 184, 0.55);
          background: rgba(15, 23, 42, 0.85);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.65);
        }

        .metric-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 6px;
        }

        .metric-value {
          font-weight: 800;
          letter-spacing: -0.03em;
          font-size: 1.15rem;
          color: #F4D03F;
        }

        .metric-title {
          font-size: 0.92rem;
          font-weight: 650;
          color: #E5E7EB;
        }

        .metric-desc {
          font-size: 0.86rem;
          color: var(--text-muted);
          line-height: 1.45;
        }

        .metric-note {
          margin-top: 6px;
          font-size: 0.78rem;
          color: rgba(156, 163, 175, 0.95);
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
          border: 1px solid rgba(248, 113, 113, 0.9);
          box-shadow: 0 0 0 1px rgba(127, 29, 29, 0.25);
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
          max-width: 660px;
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

        /* NEW: performance cards under reveal intro */
        .performance-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 18px 0 18px;
        }

        @media (max-width: 900px) {
          .performance-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 560px) {
          .performance-grid {
            grid-template-columns: 1fr;
          }
        }

        .performance-card {
          border-radius: 16px;
          padding: 12px 12px 10px;
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.6);
        }

        .performance-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.8rem;
          border: 1px solid rgba(148, 163, 184, 0.55);
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .performance-tag b {
          color: #F4D03F;
        }

        .performance-title {
          font-size: 0.96rem;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .performance-desc {
          font-size: 0.86rem;
          color: var(--text-muted);
          line-height: 1.45;
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
          background: radial-gradient(circle at top, rgba(250, 204, 21, 0.14), rgba(15, 23, 42, 0.98));
          border: 1px solid rgba(250, 204, 21, 0.35);
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
          border: 1px solid rgba(250, 204, 21, 0.5);
          font-size: 0.88rem;
          color: #FDE68A;
          margin-bottom: 8px;
        }

        .advanced-chip span {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #34D399;
          box-shadow: 0 0 10px rgba(52, 211, 153, 0.85);
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
          max-width: 560px;
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

        .modal-field input, .modal-field select {
          width: 100%;
          padding: 7px 9px;
          border-radius: 8px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          background: rgba(15, 23, 42, 0.9);
          color: #E5E7EB;
          font-size: 0.9rem;
          outline: none;
        }

        .modal-field input:focus, .modal-field select:focus {
          border-color: #047857;
          box-shadow: 0 0 0 1px rgba(4, 120, 87, 0.45);
        }

        .modal-metric {
          margin-top: 12px;
          padding: 10px 12px;
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

        /* IMPORTANT FIX:
           Do NOT mix fade-up and fade-on-scroll on the same element.
           Fade-up is reserved for above-the-fold only (and used alone).
        */

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

        .fade-on-scroll {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .fade-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

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
        {/* Header: fade-up only (above fold), no fade-on-scroll */}
        <header className="page-header fade-up">
          <div className="brand-mark">
            <div className="brand-logo" />
            <div className="brand-text">
              <div className="brand-name">ALL IN DIGITAL</div>
              <div className="brand-tagline">AI Phone &amp; SMS Systems</div>
            </div>
          </div>
          <div className="header-pill">
            <div className="header-pill-dot" />
            <span>Speed-to-lead, booking, and recovery on autopilot</span>
          </div>
        </header>

        {/* Hero: fade-up only (above fold), no fade-on-scroll */}
        <section className="hero-section fade-up">
          <div className="aid-grid">
            <div>
              <div className="hero-eyebrow">
                <span>Live AI Call Demo</span>
                <div>Under 60 seconds from form to ringing phone</div>
              </div>
              <h1 className="hero-title">
                Turn missed calls into{" "}
                <span className="hero-highlight">booked revenue</span>{" "}
                with always-on agents.
              </h1>
              <p className="hero-subtitle">
                Your workforce answers every call, qualifies, books calendars,
                recovers no-shows, and handles dispatch — so you stop bleeding
                revenue to voicemail, delays, and &ldquo;we&apos;ll call them later.&rdquo;
              </p>

              {/* NEW: Your exact performance claims */}
              <div className="metric-strip">
                <div className="metric-card">
                  <div className="metric-top">
                    <div className="metric-title">Speed-to-lead (first 5 minutes)</div>
                    <div className="metric-value">Up to 800%</div>
                  </div>
                  <div className="metric-desc">
                    Increase in booked appointments when leads hear from you in seconds/minutes instead of hours/days.
                  </div>
                  <div className="metric-note">
                    Biggest gains when you’re currently slow or inconsistent. (“Up to” depends on your starting point.)
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <div className="metric-title">Follow-up sequence (same day + day 1/2)</div>
                    <div className="metric-value">Up to 1500%</div>
                  </div>
                  <div className="metric-desc">
                    Increase in booked appointments when follow-up is consistent instead of “one call and done.”
                  </div>
                  <div className="metric-note">
                    Includes evenings + next-morning attempts with smart stop conditions once they book or respond.
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <div className="metric-title">No-show anchoring + pre-call training</div>
                    <div className="metric-value">+20 to +60 pts</div>
                  </div>
                  <div className="metric-desc">
                    Lift in show ratio when expectations are anchored in booking, then reinforced before the appointment.
                  </div>
                  <div className="metric-note">
                    Example: 30% show rate → 50–90% depending on offer + execution.
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <div className="metric-title">Pre-call training + consistent sales process</div>
                    <div className="metric-value">+20 to +40 pts</div>
                  </div>
                  <div className="metric-desc">
                    Close-rate lift plus easier scaling because performance variance between reps drops.
                  </div>
                  <div className="metric-note">
                    Example: 14% close rate → 34–54% depending on lead quality + offer + execution.
                  </div>
                </div>
              </div>

              <div className="hero-ctas">
                <button
                  className="primary-cta"
                  type="button"
                  onClick={() => jumpToId("leadForm")}
                >
                  Hear the AI in Action
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
                <div className="hero-badge">SMS in ~5 seconds • Call in ~15–20 seconds</div>
                <div className="hero-badge">Back-to-back attempts • Evening + next-day follow-up</div>
                <div className="hero-badge">Booking + no-show recovery + dispatch support</div>
                <div className="hero-badge">
                  Built for {selectedLabel || "growing teams"} that hate missed calls
                </div>
              </div>

              <p className="hero-note">
                <span>No lock-in.</span> Start with inbound calls and expand into a full workforce
                as you see it perform.
              </p>
            </div>

            <div className="hero-side">
              <form id="leadForm" className="lead-form" onSubmit={handleLeadSubmit}>
                <h2>FREE LIVE DEMO CALL</h2>
                <p>
                  Drop in your details and we&apos;ll spin up a live call demo
                  tailored to your {selectedLabel || "business"}.
                </p>

                <label htmlFor="firstName">First Name *</label>
                <input id="firstName" name="firstName" required />

                <label htmlFor="email">Email *</label>
                <input id="email" name="email" type="email" required />

                <label htmlFor="phone">Phone *</label>
                <input id="phone" name="phone" type="tel" required />

                <label htmlFor="companyType">Business / Team Type</label>
                <input
                  id="companyType"
                  name="companyType"
                  placeholder={selectedLabel || "Med spa, HVAC, inside sales team..."}
                />

                <div className="consent-row">
                  <input id="consent" name="consent" type="checkbox" />
                  <span>
                    I agree to receive SMS updates related to my inquiry from All In Digital.
                    By providing your phone number and opting in, you agree to receive SMS
                    updates related to your inquiry from All In Digital (such as demo links,
                    confirmations, and follow-up information you requested). Message
                    frequency may vary. Message &amp; data rates may apply. Reply STOP to
                    opt out and HELP for help. Consent is not a condition of purchase. We do
                    not sell or share your mobile number with third parties for marketing or
                    promotional purposes.
                  </span>
                </div>

                <button type="submit" className="lead-submit-btn" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Sending..."
                    : formSubmitted
                    ? "Submitted – we’ll be in touch shortly"
                    : "Get My Live AI Demo"}
                </button>

                <div className="lead-sms-tip">
                  Tip: Our live demo and follow-up support are delivered by SMS. If you
                  don&apos;t allow SMS updates, we won&apos;t be able to proceed with this
                  request.
                </div>

                {submitError && (
                  <div style={{ marginTop: 6, fontSize: "0.82rem", color: "#f87171" }}>
                    {submitError}
                  </div>
                )}

                {formSubmitted && (
                  <div className="lead-thankyou">
                    Thanks! We&apos;ll confirm by email/text and share a live call link.
                  </div>
                )}
              </form>

              <div className="selector-card">
                <div className="selector-title">Who do you want this built around?</div>
                <div className="selector-sub">
                  Choose one so we can tailor the workflow &amp; examples you&apos;re about to
                  see.
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
                    <span>Inbound demos, discovery calls, consults, and pipelines.</span>
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
                    <span>Med spa, dental, home services, showrooms, and more.</span>
                  </button>
                </div>

                <div className="selector-continue">
                  <div className="selector-helper">
                    {industryTrack
                      ? `Great — we’ll show you how a workforce fits a ${selectedLabel.toLowerCase()}.`
                      : "Tap a box above to select your type, then continue."}
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
          <section id="ai-workforce-block" className="reveal-wrapper fade-on-scroll">
            <div className="reveal-intro fade-on-scroll">
              <div className="pill-tag">
                Built for <span>{selectedLabel || "growing teams"}</span>
              </div>
              <div className="reveal-kicker">Your Workforce, Not “Just a Bot”</div>
              <h2 className="reveal-heading">
                We roll out a small team around your{" "}
                {isSales ? "sales operation" : "front desk & field team"}.
              </h2>
              <p className="reveal-sub">
                Think of this like hiring a full small team — booking, recovering,
                dispatching, and cleaning up your pipeline — but always on for your{" "}
                {isSales ? "closers & reps" : "locations & crews"}.
              </p>

              {/* NEW: performance cards in reveal area too */}
              <div className="performance-grid">
                <div className="performance-card">
                  <div className="performance-tag">
                    <b>Up to 800%</b> bookings
                  </div>
                  <div className="performance-title">Speed-to-lead</div>
                  <div className="performance-desc">
                    If leads hear from you inside 5 minutes, bookings can jump dramatically compared to slow response.
                  </div>
                </div>
                <div className="performance-card">
                  <div className="performance-tag">
                    <b>Up to 1500%</b> bookings
                  </div>
                  <div className="performance-title">Follow-up sequence</div>
                  <div className="performance-desc">
                    Smart evening + next-day follow-up turns “missed” into “booked,” instead of slipping away.
                  </div>
                </div>
                <div className="performance-card">
                  <div className="performance-tag">
                    <b>+20 to +60 pts</b> show rate
                  </div>
                  <div className="performance-title">No-show prevention</div>
                  <div className="performance-desc">
                    Anchoring expectations in booking + reinforcing pre-call makes people actually show up prepared.
                  </div>
                </div>
                <div className="performance-card">
                  <div className="performance-tag">
                    <b>+20 to +40 pts</b> close rate
                  </div>
                  <div className="performance-title">Pre-call training</div>
                  <div className="performance-desc">
                    Prospects arrive “sold” on the process, and sales performance becomes more predictable across reps.
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal-grid">
              <div className="panel fade-on-scroll">
                <div className="panel-header">
                  <div className="panel-title">🧠 Your Workforce Flow</div>
                  <div className="panel-label">
                    {isSales ? "Lead → Meeting" : "Call → Job"}
                  </div>
                </div>

                <div className="flow-section">
                  <h4>Top of Funnel</h4>
                  <p>
                    Instant response + structured booking. This is where the biggest
                    appointment lift typically comes from.
                  </p>
                  <div className="flow-steps">
                    <div className="flow-step">
                      <div className="flow-step-title">
                        {isSales ? "Inbound SDR" : "Inbound Agent"}
                      </div>
                      <div className="flow-step-desc">
                        Answers every call, captures name + intent, routes intelligently
                        {isSales ? " to demos, discovery, or support queues." : "."}
                      </div>
                    </div>
                    <div className="arrow-down">↓</div>
                    <div className="flow-step">
                      <div className="flow-step-title">
                        {isSales ? "Meeting Booker" : "Booking Agent"}
                      </div>
                      <div className="flow-step-desc">
                        Qualifies fast, anchors expectations, and books on your calendar in real time.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flow-section">
                  <h4>Recovery &amp; Follow-Up</h4>
                  <p>
                    This is the “quiet money.” Most teams leak after the first attempt.
                    The follow-up engine keeps leads from slipping away.
                  </p>
                  <div className="flow-steps">
                    <div className="flow-step">
                      <div className="flow-step-title">No-Show Recovery Agent</div>
                      <div className="flow-step-desc">
                        Calls &amp; texts missed appointments to reschedule and fill gaps so
                        your {isSales ? "calendar" : "schedule"} stays full.
                      </div>
                    </div>
                    <div className="arrow-down">↓</div>
                    <div className="flow-step">
                      <div className="flow-step-title">Follow-Up &amp; Nurture Agent</div>
                      <div className="flow-step-desc">
                        Runs timed call/SMS attempts (same day + next day) and long-tail nurture so “not now” doesn’t become “never.”
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flow-section">
                  <h4>Operations</h4>
                  <p>
                    Operational chatter that eats your team’s time gets handled, so humans
                    stay on revenue + fulfillment work.
                  </p>
                  <div className="flow-steps">
                    <div className="flow-step">
                      <div className="flow-step-title">
                        {isSales ? "Pipeline &amp; Calendar Coordinator" : "Dispatcher Agent"}
                      </div>
                      <div className="flow-step-desc">
                        Handles ETAs, delays, confirmations, and “where are you” calls so{" "}
                        {isSales ? "reps and closers" : "field teams"} keep moving.
                      </div>
                    </div>
                    <div className="arrow-down">↓</div>
                    <div className="flow-step">
                      <div className="flow-step-title">Handoff / Finance Agent</div>
                      <div className="flow-step-desc">
                        Collects payment links, sends agreements, and pushes clean handoffs into your CRM and tools.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel panel-alt fade-on-scroll">
                <div className="panel-header">
                  <div className="panel-title">🚀 What This Team Can Handle</div>
                  <div className="panel-label">Day-to-day job description</div>
                </div>
                <ul className="panel-list">
                  <li>
                    <strong>Speed-to-lead.</strong> SMS in ~5 seconds and calls in ~15–20 seconds to maximize bookings.
                  </li>
                  <li>
                    <strong>Book Revenue Time.</strong>{" "}
                    {isSales
                      ? "Pushes serious prospects into booked demos and consults."
                      : "Pushes serious prospects into booked calendar slots."}
                  </li>
                  <li>
                    <strong>No-Show Prevention.</strong> Anchors expectations in booking and reinforces them pre-call.
                  </li>
                  <li>
                    <strong>Recovery.</strong> Reschedules no-shows and fills gaps automatically.
                  </li>
                  <li>
                    <strong>Ops Support.</strong> ETAs, confirmations, and client updates without staff juggling phones.
                  </li>
                  <li>
                    <strong>Optional done-for-you sales.</strong> If you want to focus on fulfillment, we can handle follow-up + selling + scheduling.
                  </li>
                  <li>
                    <strong>Optional quoting help.</strong> Generate draft estimates/bids so you stop losing hours writing quotes.
                  </li>
                  <li>
                    <strong>Email + outreach support.</strong> Inbox responses + B2B outreach with human alerts when needed.
                  </li>
                </ul>
              </div>
            </div>

            <div className="section-row">
              <div className="panel panel-alt fade-on-scroll">
                <div className="panel-header">
                  <div className="panel-title">💵 What This Quietly Replaces</div>
                  <div className="panel-label">Where the hidden ROI lives</div>
                </div>
                <ul className="panel-list">
                  <li>
                    <strong>Missed &amp; Abandoned Calls.</strong> Calls that hit voicemail are often lost deals.
                  </li>
                  <li>
                    <strong>Slow Follow-Up.</strong> Leads drift to whoever answers first.
                  </li>
                  <li>
                    <strong>No-Show Waste.</strong> Empty slots = lost production time &amp; ad spend.
                  </li>
                  <li>
                    <strong>Manual Dispatch + Inbox Load.</strong> Teams stuck updating clients instead of doing revenue work.
                  </li>
                  <li>
                    <strong>Quote/Bid Time Sink.</strong> Hours per day writing estimates when it can be templated + drafted.
                  </li>
                </ul>
                <p className="hero-note" style={{ marginTop: 10 }}>
                  Most growing {isSales ? "sales teams" : "service businesses"} leak huge money
                  through these gaps. This exists to plug them.
                </p>
              </div>

              <div className="roi-card fade-on-scroll">
                <h3>📈 See Your Potential ROI</h3>
                <p>
                  Use this calculator to estimate what faster response, follow-up, improved show rates,
                  and higher close rates could recover — before you ever discuss pricing.
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
                    <div className="panel-title">📦 How We Roll This Out</div>
                    <div className="panel-label">Phased, low-risk rollout</div>
                  </div>
                  <p style={{ fontSize: "0.98rem", color: "#CBD5F5", marginBottom: 10 }}>
                    We phase this in to match where your operation is today — fast wins first,
                    then deeper automation.
                  </p>
                  <div className="phase-grid">
                    <div className="phase-card fade-on-scroll">
                      <div className="phase-chip">Phase 1</div>
                      <div className="phase-title">Speed-to-Lead + Booking</div>
                      <ul className="phase-list">
                        <li>Instant response for inbound calls + form leads.</li>
                        <li>Booking flow + calendar integration.</li>
                        <li>Expectation anchoring to reduce no-shows.</li>
                        <li>Basic reporting on calls &amp; bookings.</li>
                      </ul>
                    </div>
                    <div className="phase-card fade-on-scroll">
                      <div className="phase-chip">Phase 2</div>
                      <div className="phase-title">Follow-Up + Recovery</div>
                      <ul className="phase-list">
                        <li>No-show recovery (call + SMS).</li>
                        <li>Evening + next-day follow-up sequences.</li>
                        <li>Long-tail nurture for “not now” leads.</li>
                        <li>Routing improvements based on real results.</li>
                      </ul>
                    </div>
                    <div className="phase-card fade-on-scroll">
                      <div className="phase-chip">Phase 3</div>
                      <div className="phase-title">Ops + Done-For-You Options</div>
                      <ul className="phase-list">
                        <li>Dispatch updates, confirmations, and scheduling support.</li>
                        <li>Quote/bid drafting support to save hours/day.</li>
                        <li>Inbox response support + outreach workflows.</li>
                        <li>Optional done-for-you sales so you focus on fulfillment.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="advanced-card fade-on-scroll">
                <div className="advanced-chip">
                  <span />
                  Optional: Done-for-you selling + ops
                </div>
                <h3>Want to Focus Only on Fulfillment?</h3>
                <p>
                  If you’re a one-person shop (or you just hate selling), we can structure this so you mostly see:
                  jobs scheduled on your calendar + clear notes on what the client wants.
                </p>
                <p style={{ fontSize: "0.94rem", color: "#FDE68A" }}>
                  Includes optional support like quote drafting (bids/estimates), inbox responses, and B2B outreach —
                  with human alerts when needed.
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
                Plug in your real numbers. This models potential upside from faster response + consistent follow-up + improved show & close rates.
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
                  <label htmlFor="bookRate">Lead → booked appt rate (%)</label>
                  <input
                    id="bookRate"
                    type="number"
                    min={0}
                    max={100}
                    value={bookRate}
                    onChange={(e) => setBookRate(e.target.value)}
                  />
                </div>

                <div className="modal-field">
                  <label htmlFor="showRate">Show rate (%)</label>
                  <input
                    id="showRate"
                    type="number"
                    min={0}
                    max={100}
                    value={showRate}
                    onChange={(e) => setShowRate(e.target.value)}
                  />
                </div>

                <div className="modal-field">
                  <label htmlFor="closeRate">Close rate (of shows) (%)</label>
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
                  <label htmlFor="bookingLift">Booking lift scenario</label>
                  <select
                    id="bookingLift"
                    value={bookingLiftMode}
                    onChange={(e) => setBookingLiftMode(e.target.value as any)}
                  >
                    <option value="none">No booking lift</option>
                    <option value="800">Speed-to-lead (Up to 800%)</option>
                    <option value="1500">Speed + follow-up (Up to 1500%)</option>
                  </select>
                </div>

                <div className="modal-field">
                  <label htmlFor="showUplift">Show-rate uplift (+ pts, 0–60)</label>
                  <input
                    id="showUplift"
                    type="number"
                    min={0}
                    max={60}
                    value={showUpliftPts}
                    onChange={(e) => setShowUpliftPts(e.target.value)}
                  />
                </div>

                <div className="modal-field">
                  <label htmlFor="closeUplift">Close-rate uplift (+ pts, 0–40)</label>
                  <input
                    id="closeUplift"
                    type="number"
                    min={0}
                    max={40}
                    value={closeUpliftPts}
                    onChange={(e) => setCloseUpliftPts(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-metric">
                Baseline revenue / month:
                <strong>
                  ${baselineRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </strong>

                <div style={{ marginTop: 8 }}>
                  Projected revenue / month:
                  <strong>
                    ${projectedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </strong>
                </div>

                <div style={{ marginTop: 8 }}>
                  Estimated lift / month:
                  <strong>
                    ${extraRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </strong>
                </div>
              </div>

              <div className="modal-footnote">
                This is “math on your inputs,” not a promise. “Up to” results depend on your starting response time,
                lead quality, offer, and consistent execution.
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
                Most teams don&apos;t realize how much revenue quietly leaks through
                voicemail, slow follow-up, and no-shows.
              </p>
              <p style={{ marginTop: 8 }}>
                Want a{" "}
                <span className="exit-highlight">
                  quick look at what a workforce could recover
                </span>{" "}
                for your {selectedLabel || "business"}?
              </p>

              <form className="exit-form" onSubmit={handleExitLeadSubmit}>
                <label htmlFor="exitName">First name</label>
                <input id="exitName" name="exitName" required />

                <label htmlFor="exitPhone">Mobile number</label>
                <input id="exitPhone" name="exitPhone" type="tel" required />

                <div className="exit-consent-row">
                  <input id="exitConsent" name="exitConsent" type="checkbox" />
                  <span>Yes, I want SMS updates related to this inquiry.</span>
                </div>

                <small>
                  I agree to receive SMS updates related to my inquiry from All In Digital.
                  We’ll send you a text with a link to a live call demo and a brief
                  summary of how a workforce could help. Message frequency may vary.
                  Message &amp; data rates may apply. Reply STOP to opt out and HELP for help.
                  Consent is not a condition of purchase. We do not sell or share your mobile
                  number with third parties for marketing or promotional purposes.
                </small>

                <button type="submit" className="exit-submit-btn">
                  Book my live call
                </button>

                {exitFormSubmitted && (
                  <div className="exit-thankyou">
                    Thanks! We&apos;ll text you a live demo link shortly.
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
            Ready to see what a workforce could recover for{" "}
            <span>{selectedLabel || "your business"}</span>?
          </div>
          <button className="sticky-btn" type="button" onClick={() => jumpToId("leadForm")}>
            Get a live call demo
          </button>
        </div>
      </div>
    </main>
  );
}