"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  Phone, 
  Globe, 
  Server, 
  ShieldCheck 
} from "lucide-react";

// --- Types & Configuration ---

type TierKey = "landing" | "starter" | "os" | "enterprise";
type FunnelMode = "inbound" | "outbound";

interface VerticalPreset {
  id: string;
  label: string;
  leads: string;
  bookRate: string; // %
  showRate: string; // %
  closeRate: string; // %
  ticket: string; // $
}

const VERTICALS: VerticalPreset[] = [
  { id: "medspa", label: "Med Spa", leads: "150", bookRate: "45", showRate: "70", closeRate: "30", ticket: "1200" },
  { id: "solar", label: "Solar", leads: "300", bookRate: "15", showRate: "60", closeRate: "20", ticket: "6500" },
  { id: "roofing", label: "Roofing", leads: "100", bookRate: "35", showRate: "75", closeRate: "40", ticket: "12000" },
  { id: "dentist", label: "Dentist", leads: "200", bookRate: "50", showRate: "80", closeRate: "35", ticket: "800" },
  { id: "hvac", label: "HVAC", leads: "120", bookRate: "40", showRate: "85", closeRate: "45", ticket: "5500" },
  { id: "realestate", label: "Real Estate", leads: "400", bookRate: "10", showRate: "50", closeRate: "15", ticket: "15000" },
  { id: "law", label: "Legal / PI", leads: "80", bookRate: "25", showRate: "70", closeRate: "35", ticket: "25000" },
  { id: "gym", label: "Gym / Fitness", leads: "500", bookRate: "60", showRate: "55", closeRate: "30", ticket: "450" },
];

export default function PricingPage() {
  // --- State ---
  const [openTier, setOpenTier] = useState<TierKey>("os");
  const [funnelMode, setFunnelMode] = useState<FunnelMode>("inbound");
  const [activeVertical, setActiveVertical] = useState<string>("medspa");

  // ROI Inputs
  const [leads, setLeads] = useState("150");
  const [bookRate, setBookRate] = useState("45");
  const [showRate, setShowRate] = useState("70");
  const [closeRate, setCloseRate] = useState("30");
  const [avgTicket, setAvgTicket] = useState("1200");

  // Lift Assumptions (Dynamic based on mode)
  const [bookLift, setBookLift] = useState("35"); // 35% improvement
  const [showLift, setShowLift] = useState("20");
  const [closeLift, setCloseLift] = useState("15");

  // --- Effects ---

  // When vertical changes, load presets
  useEffect(() => {
    const preset = VERTICALS.find((v) => v.id === activeVertical);
    if (preset) {
      setLeads(preset.leads);
      setBookRate(preset.bookRate);
      setShowRate(preset.showRate);
      setCloseRate(preset.closeRate);
      setAvgTicket(preset.ticket);
    }
  }, [activeVertical]);

  // When mode changes, adjust lift assumptions
  useEffect(() => {
    if (funnelMode === "outbound") {
      setBookLift("50"); // Outbound AI typically lifts booking volume heavily via dial volume
      setShowLift("10"); 
    } else {
      setBookLift("35"); // Inbound speed-to-lead lift
      setShowLift("20");
    }
  }, [funnelMode]);

  // --- Calculations ---

  const metrics = useMemo(() => {
    const pLeads = Number(leads) || 0;
    const pBook = Number(bookRate) || 0;
    const pShow = Number(showRate) || 0;
    const pClose = Number(closeRate) || 0;
    const pTicket = Number(avgTicket) || 0;

    const pBookLift = Number(bookLift) || 0;
    const pShowLift = Number(showLift) || 0;
    const pCloseLift = Number(closeLift) || 0;

    // Baseline
    const baseBooked = pLeads * (pBook / 100);
    const baseShown = baseBooked * (pShow / 100);
    const baseSales = baseShown * (pClose / 100);
    const baseRev = baseSales * pTicket;

    // New System
    // We apply lift as a percentage increase to the RATE (e.g. 20% rate * 1.5 lift = 30% rate)
    // Capped at 95% to be realistic
    const newBookRate = Math.min(95, pBook * (1 + pBookLift / 100));
    const newShowRate = Math.min(95, pShow * (1 + pShowLift / 100));
    const newCloseRate = Math.min(95, pClose * (1 + pCloseLift / 100));

    const newBooked = pLeads * (newBookRate / 100);
    const newShown = newBooked * (newShowRate / 100);
    const newSales = newShown * (newCloseRate / 100);
    const newRev = newSales * pTicket;

    const extraRev = newRev - baseRev;
    const roiMultiplier = extraRev > 0 ? (extraRev / 2000).toFixed(1) : "0"; // Assuming ~$2k/mo cost for ROI math

    return {
      baseRev,
      newRev,
      extraRev,
      roiMultiplier,
      newBooked,
      newSales
    };
  }, [leads, bookRate, showRate, closeRate, avgTicket, bookLift, showLift, closeLift]);

  const formatCurrency = (val: number) =>
    val.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <main className="aid-pricing-page">
      {/* --- CSS STYLES --- 
         In a real Next.js app, ideally move this to a module.css or Tailwind. 
         Kept here for single-file portability as requested.
      */}
      <style>{`
        :root {
          --emerald: #10B981;
          --emerald-dim: rgba(16, 185, 129, 0.1);
          --emerald-dark: #064E3B;
          --gold: #FACC15;
          --bg-dark: #020617;
          --bg-card: #0F172A;
          --text-main: #F8FAFC;
          --text-muted: #94A3B8;
          --border: rgba(148, 163, 184, 0.2);
        }

        * { box-sizing: border-box; }

        body {
          margin: 0;
          font-family: 'Inter', system-ui, sans-serif;
          background: #000;
          color: var(--text-main);
          overflow-x: hidden;
        }

        .aid-pricing-page {
          background: radial-gradient(circle at 50% 0%, #064e3b 0%, #020617 40%, #000000 100%);
          min-height: 100vh;
          padding-bottom: 120px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* --- Vertical Selector --- */
        .vertical-scroller {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 20px 0;
          scrollbar-width: none;
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
        .vertical-scroller::-webkit-scrollbar { display: none; }

        .vertical-pill {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 8px 20px;
          border-radius: 100px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .vertical-pill:hover { border-color: var(--emerald); color: white; }
        .vertical-pill.active {
          background: var(--emerald);
          color: #020617;
          border-color: var(--emerald);
          font-weight: 700;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
        }

        /* --- ROI Calculator --- */
        .roi-section {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
          margin: 40px 0;
          backdrop-filter: blur(10px);
        }
        
        .roi-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 16px;
        }
        
        .toggle-group {
            background: #1e293b;
            padding: 4px;
            border-radius: 99px;
            display: inline-flex;
        }
        
        .toggle-btn {
            padding: 8px 24px;
            border-radius: 99px;
            border: none;
            background: transparent;
            color: var(--text-muted);
            cursor: pointer;
            font-weight: 600;
            transition: 0.2s;
        }
        .toggle-btn.active {
            background: var(--emerald);
            color: #020617;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }

        .roi-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        @media(max-width: 900px) { .roi-grid { grid-template-columns: 1fr; } }

        .input-group { margin-bottom: 16px; }
        .input-label { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem; color: var(--text-muted); }
        .range-slider {
            width: 100%;
            height: 6px;
            background: #334155;
            border-radius: 3px;
            outline: none;
            -webkit-appearance: none;
        }
        .range-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            background: var(--emerald);
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid #020617;
        }
        .input-field {
            background: #0f172a;
            border: 1px solid var(--border);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            width: 100%;
            margin-top: 8px;
            font-family: monospace;
        }

        .results-card {
            background: linear-gradient(145deg, #065f46 0%, #020617 100%);
            border: 1px solid #047857;
            border-radius: 16px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        
        .results-glow {
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(250, 204, 21, 0.2) 0%, transparent 70%);
            filter: blur(40px);
        }

        .stat-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .stat-row:last-child { border: none; margin: 0; padding: 0; }
        
        .stat-label { color: var(--text-muted); font-size: 0.9rem; }
        .stat-val { font-size: 1.2rem; font-weight: 600; }
        .stat-val.gold { color: var(--gold); }
        .stat-val.dim { color: var(--text-muted); text-decoration: line-through; font-size: 1rem; }

        .big-rev {
            font-size: 3rem;
            font-weight: 800;
            color: var(--emerald);
            line-height: 1;
            margin-top: 4px;
            text-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
        }

        /* --- Tiers --- */
        .tier-nav {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            background: rgba(15, 23, 42, 0.8);
            padding: 6px;
            border-radius: 16px;
            margin-bottom: 32px;
            border: 1px solid var(--border);
        }
        @media(max-width: 640px) { .tier-nav { grid-template-columns: 1fr 1fr; } }
        
        .tier-tab {
            background: transparent;
            border: none;
            color: var(--text-muted);
            padding: 12px;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            transition: 0.2s;
        }
        .tier-tab:hover { background: rgba(255,255,255,0.05); color: white; }
        .tier-tab.active {
            background: #1e293b;
            color: var(--emerald);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .pricing-card {
            background: #0f172a;
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 32px;
            position: relative;
        }
        .pricing-card.highlight {
            border-color: var(--emerald);
            box-shadow: 0 0 40px rgba(16, 185, 129, 0.15);
        }
        
        .badge {
            display: inline-block;
            background: var(--emerald);
            color: #020617;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 99px;
            margin-bottom: 12px;
        }

        .feature-list { list-style: none; padding: 0; margin: 24px 0; }
        .feature-list li {
            display: flex;
            gap: 12px;
            margin-bottom: 14px;
            color: #cbd5e1;
            font-size: 0.95rem;
        }
        .icon-check { color: var(--emerald); flex-shrink: 0; }

        /* Flow Diagram CSS (Visual fallback) */
        .flow-diagram {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 20px;
            padding: 20px;
            background: rgba(0,0,0,0.3);
            border-radius: 12px;
        }
        .flow-step {
            background: #1e293b;
            border: 1px solid var(--border);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.8rem;
            color: #e2e8f0;
        }
        .flow-arrow { color: var(--text-muted); }

      `}</style>

      <div className="container">
        {/* Header */}
        <header style={{ padding: '60px 0 40px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 16px', borderRadius: '99px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <span style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%', boxShadow: '0 0 10px #10B981' }}></span>
            <span style={{ color: '#10B981', fontSize: '0.9rem', fontWeight: 600 }}>End-to-End AI Systems</span>
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px', lineHeight: 1.1 }}>
            Pricing that pays for <br />
            <span style={{ background: 'linear-gradient(to right, #FACC15, #10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>itself in 30 days.</span>
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Select your industry below to see how our AI Operating System models revenue for your specific vertical.
          </p>
        </header>

        {/* Vertical Selector */}
        <div className="vertical-scroller">
          {VERTICALS.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveVertical(v.id)}
              className={`vertical-pill ${activeVertical === v.id ? "active" : ""}`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* ROI Calculator */}
        <section className="roi-section">
          <div className="roi-header">
            <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calculator size={24} color="#10B981" />
              ROI Simulator
            </h2>
            <div className="toggle-group">
              <button 
                className={`toggle-btn ${funnelMode === 'inbound' ? 'active' : ''}`}
                onClick={() => setFunnelMode('inbound')}
              >
                Inbound Lead Response
              </button>
              <button 
                className={`toggle-btn ${funnelMode === 'outbound' ? 'active' : ''}`}
                onClick={() => setFunnelMode('outbound')}
              >
                Outbound Database Reactivation
              </button>
            </div>
          </div>

          <div className="roi-grid">
            {/* Inputs */}
            <div>
               <div className="input-group">
                  <div className="input-label">
                    <span>Monthly Leads / Records</span>
                    <span style={{color: 'white'}}>{leads}</span>
                  </div>
                  <input type="range" min="50" max="5000" step="10" value={leads} onChange={(e) => setLeads(e.target.value)} className="range-slider" />
               </div>

               <div className="input-group">
                  <div className="input-label">
                    <span>Avg. Ticket Price ($)</span>
                    <span style={{color: 'white'}}>${avgTicket}</span>
                  </div>
                  <input type="number" value={avgTicket} onChange={(e) => setAvgTicket(e.target.value)} className="input-field" />
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
                 <div className="input-group">
                    <div className="input-label"><span>Current Booking %</span></div>
                    <input type="number" value={bookRate} onChange={(e) => setBookRate(e.target.value)} className="input-field" />
                 </div>
                 <div className="input-group">
                    <div className="input-label"><span>Current Show %</span></div>
                    <input type="number" value={showRate} onChange={(e) => setShowRate(e.target.value)} className="input-field" />
                 </div>
               </div>
               
               <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '20px', fontStyle: 'italic' }}>
                 *System assumes a conservative {bookLift}% lift in booking rate and {showLift}% lift in show rate due to sub-1-minute speed-to-lead.
               </p>
            </div>

            {/* Results */}
            <div className="results-card">
              <div className="results-glow" />
              <div style={{ position: 'relative', zIndex: 10 }}>
                <div className="stat-row">
                  <div>
                    <div className="stat-label">Baseline Revenue</div>
                    <div className="stat-val dim">{formatCurrency(metrics.baseRev)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="stat-label">Projected Lift</div>
                    <div className="stat-val gold">+{formatCurrency(metrics.extraRev)}</div>
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <div className="stat-label" style={{ color: '#10B981', fontWeight: 600 }}>NEW MONTHLY REVENUE</div>
                  <div className="big-rev">{formatCurrency(metrics.newRev)}</div>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px' }}>
                  <TrendingUp color="#FACC15" />
                  <span style={{ fontSize: '0.95rem', color: '#e2e8f0' }}>
                    At <strong>{metrics.roiMultiplier}x ROI</strong>, this system pays for the setup fee in the first month from extra revenue alone.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tier Selector */}
        <nav className="tier-nav">
          <button onClick={() => setOpenTier("landing")} className={`tier-tab ${openTier === "landing" ? "active" : ""}`}>Landing</button>
          <button onClick={() => setOpenTier("starter")} className={`tier-tab ${openTier === "starter" ? "active" : ""}`}>Starter AI</button>
          <button onClick={() => setOpenTier("os")} className={`tier-tab ${openTier === "os" ? "active" : ""}`}>Full OS</button>
          <button onClick={() => setOpenTier("enterprise")} className={`tier-tab ${openTier === "enterprise" ? "active" : ""}`}>Enterprise</button>
        </nav>

        {/* Tier Content */}
        <div className="pricing-content">
          
          {/* LANDING TIER */}
          {openTier === "landing" && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="pricing-card">
                 <h3 style={{fontSize: '1.5rem', marginTop: 0}}>Funnel Foundation</h3>
                 <div style={{fontSize: '2rem', fontWeight: 700, margin: '16px 0', color: '#FACC15'}}>$2,600</div>
                 <p style={{color: '#94A3B8'}}>Perfect for paid traffic. Includes compliance, speed wiring, and high-conversion design.</p>
                 <ul className="feature-list">
                    <li><CheckCircle2 size={18} className="icon-check"/> Buy 1, Get 2 Variants</li>
                    <li><CheckCircle2 size={18} className="icon-check"/> FCC/TCPA Compliant Forms</li>
                    <li><CheckCircle2 size={18} className="icon-check"/> Speed-to-lead Webhook Ready</li>
                 </ul>
                 <button style={{width:'100%', padding:'14px', borderRadius:'12px', background: '#334155', color: 'white', border:'none', cursor:'pointer', fontWeight: 600}}>Get Started</button>
              </div>
              <div className="pricing-card">
                

[Image of Landing Page Optimization Diagram]

                <div style={{marginTop: '20px'}}>
                   <h4 style={{margin: '0 0 10px'}}>Why this works</h4>
                   <p style={{fontSize: '0.9rem', color: '#94A3B8'}}>
                     Most landing pages fail because they aren't wired for the <strong style={{color:'white'}}>5-minute window</strong>. Ours trigger the call immediately.
                   </p>
                </div>
              </div>
            </div>
          )}

          {/* STARTER TIER */}
          {openTier === "starter" && (
            <div className="pricing-card highlight">
              <span className="badge">Best for Testing</span>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <h3 style={{fontSize: '1.8rem', margin: 0}}>AI Agent Starter</h3>
                  <p style={{color: '#94A3B8'}}>Voice & SMS handling for small volume.</p>
                </div>
                <div style={{textAlign:'right'}}>
                   <div style={{fontSize: '1.2rem', color: '#FACC15', fontWeight: 700}}>$35 Setup</div>
                   <div style={{fontSize: '0.9rem', color: '#94A3B8'}}>+ Usage / Mo</div>
                </div>
              </div>
              
              <div style={{marginTop: '30px', background: '#020617', padding: '20px', borderRadius: '12px'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8'}}>
                    <span>PLAN</span>
                    <span>MINUTES</span>
                    <span>RATE</span>
                </div>
                {[
                    {name: 'Starter', min: '280', rate: '$0.28'},
                    {name: 'Growth', min: '710', rate: '$0.22'},
                    {name: 'Pro', min: '1,700', rate: '$0.17'}
                ].map((plan, i) => (
                    <div key={i} style={{display:'flex', justifyContent:'space-between', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                        <span style={{color: 'white'}}>{plan.name}</span>
                        <span style={{color: '#10B981'}}>{plan.min}</span>
                        <span style={{color: 'white'}}>{plan.rate}/min</span>
                    </div>
                ))}
              </div>
            </div>
          )}

          {/* OS TIER (MAIN) */}
          {openTier === "os" && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                <div className="pricing-card highlight">
                    <span className="badge">Most Popular</span>
                    <h3 style={{fontSize: '2rem', margin: 0}}>Full Operating System</h3>
                    <p style={{color: '#94A3B8', fontSize: '1.1rem'}}>The complete "Lead-to-Close" infrastructure.</p>
                    
                    <div style={{margin: '30px 0'}}>
                        <div style={{display:'flex', alignItems: 'baseline', gap: '10px'}}>
                            <span style={{fontSize: '2.5rem', fontWeight: 700, color: 'white'}}>$6,200</span>
                            <span style={{color: '#94A3B8'}}>one-time build</span>
                        </div>
                        <div style={{fontSize: '1.1rem', color: '#10B981', marginTop: '4px'}}>+ $1,250 / mo maintenance & optimization</div>
                    </div>

                    <ul className="feature-list">
                        <li><CheckCircle2 size={18} className="icon-check"/> <strong>Everything in Landing + Starter</strong></li>
                        <li><Zap size={18} className="icon-check"/> <strong>Full CRM Setup</strong> (GHL Snapshot)</li>
                        <li><Phone size={18} className="icon-check"/> <strong>Custom AI Voice Agent</strong> (Sales trained)</li>
                        <li><Server size={18} className="icon-check"/> <strong>Workflow Automation</strong> (Calendar/Booking)</li>
                        <li><ShieldCheck size={18} className="icon-check"/> <strong>Live Transfer</strong> & Voicemail Drops</li>
                    </ul>

                    <button style={{width:'100%', padding:'18px', borderRadius:'12px', background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', color: 'white', border:'none', cursor:'pointer', fontWeight: 700, fontSize: '1.1rem', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'}}>
                        Apply for OS Implementation <ArrowRight size={18} style={{verticalAlign: 'middle', marginLeft: '8px'}}/>
                    </button>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap: '20px'}}>
                    <div className="pricing-card">
                        <h4 style={{marginTop:0, display:'flex', alignItems:'center', gap:'10px'}}>
                            <Globe size={18} color="#10B981"/> speed-to-lead flow
                        </h4>
                        
                        <div className="flow-diagram">
                           <div className="flow-step">Lead</div>
                           <div className="flow-arrow">→</div>
                           <div className="flow-step" style={{borderColor: '#10B981', color: '#10B981'}}>AI Call (30s)</div>
                           <div className="flow-arrow">→</div>
                           <div className="flow-step">Booking</div>
                        </div>
                    </div>
                    <div className="pricing-card" style={{background: 'rgba(250, 204, 21, 0.05)', borderColor: 'rgba(250, 204, 21, 0.2)'}}>
                        <h4 style={{marginTop:0, color: '#FACC15'}}>ROI Guarantee</h4>
                        <p style={{fontSize: '0.9rem', color: '#cbd5e1'}}>
                            If the system doesn't generate {formatCurrency(metrics.extraRev)} in extra pipeline value within 90 days, we work for free until it does.
                        </p>
                    </div>
                </div>
            </div>
          )}

           {/* ENTERPRISE TIER */}
           {openTier === "enterprise" && (
             <div className="pricing-card" style={{textAlign:'center', padding: '60px 20px'}}>
                <h3 style={{fontSize: '2rem'}}>Franchise & Multi-Location</h3>
                <p style={{color: '#94A3B8', maxWidth: '500px', margin: '20px auto'}}>
                    Unified reporting, master snapshots, and AI training for 10+ locations.
                </p>
                <button style={{padding:'14px 30px', borderRadius:'99px', background: 'transparent', border: '1px solid white', color: 'white', cursor: 'pointer'}}>
                    Contact Sales
                </button>
             </div>
           )}

        </div>
      </div>
    </main>
  );
}
