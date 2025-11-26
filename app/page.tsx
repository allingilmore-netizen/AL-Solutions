"use client";

import { useEffect, useState } from "react";

type Track = "generic" | "sales" | "service";

export default function HomePage() {
  const [showBottomCta, setShowBottomCta] = useState(false);
  const [showRoi, setShowRoi] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [industryTrack, setIndustryTrack] = useState<Track>("generic");

  const [leads, setLeads] = useState<number | "">("");
  const [ticket, setTicket] = useState<number | "">("");
  const [missed, setMissed] = useState<number | "">("");
  const [recovery, setRecovery] = useState<number | "">("");
  const [closeRate, setCloseRate] = useState<number | "">("");
  const [monthlyRoi, setMonthlyRoi] = useState<number | null>(null);
  const [annualRoi, setAnnualRoi] = useState<number | null>(null);

  useEffect(() => {
    const revealElements = document.querySelectorAll(".fade-3d, .fade-3d-slow");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.18 }
    );

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const nearBottom = y + winHeight > docHeight - 350;
      setShowBottomCta(y > 500 && !nearBottom);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openRoi = () => setShowRoi(true);
  const closeRoi = () => setShowRoi(false);

  const currency = (n: number | null) => (n === null ? "" : `$${n.toLocaleString()}`);

  const calcRoi = () => {
    if (leads === "" || ticket === "" || missed === "" || recovery === "" || closeRate === "") {
      setMonthlyRoi(null);
      setAnnualRoi(null);
      return;
    }

    const L = Number(leads);
    const T = Number(ticket);
    const M = Number(missed) / 100;
    const R = Number(recovery) / 100;
    const C = Number(closeRate) / 100;

    const recoveredLeads = L * M * R;
    const closedDeals = recoveredLeads * C;
    const monthly = closedDeals * T;
    const annual = monthly * 12;

    setMonthlyRoi(monthly);
    setAnnualRoi(annual);
  };

  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const data = {
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement)?.value,
      email: (form.elements.namedItem("email") as HTMLInputElement)?.value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement)?.value,
      fccConsent: (form.elements.namedItem("fccConsent") as HTMLInputElement)?.checked,
    };

    try {
      await fetch("https://api.thoughtly.com/webhook/automation/Oqf6FbI5nD04", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      alert("Thank you! Our team will reach out shortly!");
      form.reset();
    } catch (err) {
      console.error("Lead submit failed", err);
      alert("Something went wrong. Please try again in a moment.");
    }
  };

  return (
    <div className="page-root" data-ai-track={industryTrack}>
      <header className="sticky-header">
        <div className="header-title">All In Digital</div>
        <a href="#demo" className="header-cta">Book Demo</a>
      </header>

      <section className="hero">
        <div className="hero-inner fade-3d">
          <span className="eyebrow">AI Workforce • Speed to Lead • 24/7 Coverage</span>
          <h1>Turn Missed Calls & Slow Follow-Up into a 24/7 AI Workforce</h1>
          <p className="hero-sub">
            Your AI agents answer instantly, qualify leads, book calendars, recover no-shows, and handle dispatch — so you stop bleeding revenue.
          </p>

          <div className="hero-ctas">
            <a href="#demo" className="primary-cta">Hear the AI in Action</a>
            <button className="secondary-cta" onClick={openRoi}>Run ROI Calculator</button>
          </div>
        </div>
      </section>

      <section id="industry-selector" className="py-16 bg-gray-50 fade-3d">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">Who Are You Improving Results For?</h2>
          <p className="text-gray-700 mb-8">Pick your focus — everything else will adjust itself.</p>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIndustryTrack("sales")}
              className={`px-6 py-3 rounded-full text-sm font-semibold border transition shadow-sm hover:shadow-md ${industryTrack === "sales" ? "bg-emerald-600 text-white border-emerald-700" : "bg-white text-gray-800 border-gray-300"}`}
            >
              Sales Teams
            </button>

            <button
              type="button"
              onClick={() => setIndustryTrack("service")}
              className={`px-6 py-3 rounded-full text-sm font-semibold border transition shadow-sm hover:shadow-md ${industryTrack === "service" ? "bg-emerald-600 text-white border-emerald-700" : "bg-white text-gray-800 border-gray-300"}`}
            >
              Local Businesses
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">All features apply to both — this just adjusts examples.</p>
        </div>
      </section>

      {/* Add your remaining sections below — flow, features, packages, ROI, footer, etc. */}
    </div>
  );
}

function AdvancedSalesPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-3xl mx-auto">
      <button type="button" onClick={() => setOpen(!open)} className="w-full px-4 py-3 border rounded-lg bg-white">
        <span className="font-semibold text-gray-900">See how teams add 20–40% more conversions</span>
      </button>
      {open && <div className="mt-3 p-4 border rounded-lg bg-white text-sm">Advanced Details…</div>}
    </div>
  );
}
