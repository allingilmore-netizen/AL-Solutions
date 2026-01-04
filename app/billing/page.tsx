```tsx
'use client';

import { useState, FormEvent } from 'react';

const BRAND = {
  emerald: '#047857',
  emeraldLight: '#10B981',
  gold: '#F4D03F',
  charcoal: '#0F172A',
  deepBg: '#020617',
  cardBg: 'rgba(15, 23, 42, 0.6)',
  cardBorder: 'rgba(148, 163, 184, 0.15)',
  muted: '#94A3B8',
  text: '#E2E8F0',
  white: '#F8FAFC',
  red: '#EF4444',
};

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: BRAND.cardBg, border: '1px solid ' + BRAND.cardBorder, borderRadius: 16, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontWeight: 600, color: BRAND.white, fontSize: '0.95rem' }}>{title}</span>
        <span style={{ color: BRAND.muted, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '0.8rem' }}>▼</span>
      </button>
      {open && <div style={{ padding: '0 20px 20px', color: BRAND.text, fontSize: '0.9rem', lineHeight: 1.7 }}>{children}</div>}
    </div>
  );
}

function Badge({ children, variant = 'emerald' }: { children: React.ReactNode; variant?: 'emerald' | 'gold' | 'muted' | 'red' }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    emerald: { bg: 'rgba(4, 120, 87, 0.2)', border: 'rgba(16, 185, 129, 0.4)', text: '#34D399' },
    gold: { bg: 'rgba(244, 208, 63, 0.15)', border: 'rgba(244, 208, 63, 0.4)', text: BRAND.gold },
    muted: { bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.3)', text: BRAND.muted },
    red: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#F87171' },
  };
  const c = colors[variant];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: 20, background: c.bg, border: '1px solid ' + c.border, color: c.text, fontSize: '0.8rem', fontWeight: 600 }}>
      {children}
    </span>
  );
}

function SectionHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        <Badge variant="gold">{tag}</Badge>
      </div>
      <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 700, color: BRAND.white, margin: 0, marginBottom: 8 }}>{title}</h2>
      <p style={{ color: BRAND.muted, fontSize: '1rem', margin: 0, maxWidth: 600 }}>{subtitle}</p>
    </div>
  );
}

function Card({ children, highlight = false, style = {} }: { children: React.ReactNode; highlight?: boolean; style?: React.CSSProperties }) {
  return (
    <div style={{ background: highlight ? 'linear-gradient(135deg, rgba(4, 120, 87, 0.15), rgba(15, 23, 42, 0.8))' : BRAND.cardBg, border: '1px solid ' + (highlight ? 'rgba(16, 185, 129, 0.4)' : BRAND.cardBorder), borderRadius: 20, padding: 28, position: 'relative' as const, ...style }}>
      {children}
    </div>
  );
}

function PrimaryButton({ children, href, type = 'button', fullWidth = false }: { children: React.ReactNode; href?: string; type?: 'button' | 'submit'; fullWidth?: boolean }) {
  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '14px 28px',
    background: 'linear-gradient(135deg, ' + BRAND.emerald + ', ' + BRAND.emeraldLight + ')',
    color: BRAND.white,
    fontWeight: 600,
    fontSize: '0.95rem',
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    width: fullWidth ? '100%' : 'auto',
    boxShadow: '0 4px 20px rgba(4, 120, 87, 0.4)',
  };
  if (href) return <a href={href} style={style}>{children}</a>;
  return <button type={type} style={style}>{children}</button>;
}

function SecondaryButton({ children, href }: { children: React.ReactNode; href?: string }) {
  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '14px 28px',
    background: 'transparent',
    color: BRAND.white,
    fontWeight: 600,
    fontSize: '0.95rem',
    borderRadius: 12,
    border: '1px solid ' + BRAND.cardBorder,
    cursor: 'pointer',
    textDecoration: 'none',
  };
  if (href) return <a href={href} style={style}>{children}</a>;
  return <button style={style}>{children}</button>;
}

function SliderInput({ label, value, onChange, min, max, step = 1, unit = '', prefix = '' }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string; prefix?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label style={{ color: BRAND.text, fontSize: '0.85rem', fontWeight: 500 }}>{label}</label>
        <span style={{ color: BRAND.white, fontSize: '0.95rem', fontWeight: 600 }}>{prefix}{value.toLocaleString()}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(148, 163, 184, 0.3)', appearance: 'none', cursor: 'pointer' }}
      />
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${BRAND.emeraldLight};
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${BRAND.emeraldLight};
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}

const problems = [
  { icon: '💸', title: 'Manual top-ups', desc: 'Clients run out of credits mid-campaign. You eat the overage or scramble to invoice.' },
  { icon: '📉', title: 'Postpaid exposure', desc: 'Usage happens before payment. Disputes and chargebacks leave you holding the bag.' },
  { icon: '🔁', title: 'Webhook retries gone wrong', desc: 'Duplicate events = double billing = angry clients = refunds.' },
  { icon: '⚠️', title: 'Disputes with no paper trail', desc: 'I never authorized that. Without a ledger, you cannot prove anything.' },
  { icon: '🔄', title: 'Refill loops that break', desc: 'Auto-refill triggers but Stripe fails. No alert. Client goes dark.' },
  { icon: '🛑', title: 'No payment-failed enforcement', desc: 'Card declines but services keep running. You find out weeks later.' },
];

const steps = [
  { step: '01', title: 'Authorize', desc: 'Before any call or message, credits are reserved. No balance? Service blocked.', color: BRAND.emerald },
  { step: '02', title: 'Settle', desc: 'After completion, actual usage is recorded and credits are deducted from the reservation.', color: BRAND.emeraldLight },
  { step: '03', title: 'Auto-Refill', desc: 'Balance drops below threshold? Stripe charges automatically. Webhook confirms or flags.', color: BRAND.gold },
  { step: '04', title: 'Pause on Failure', desc: 'Payment fails? Services pause immediately. 24/7 automated detection + escalation. Human response SLA depends on tier.', color: BRAND.muted },
];

const providers = ['Vapi (Voice)', 'Retell (Voice)', 'Twilio (SMS)', 'Telnyx (SMS)', 'Stripe (Billing)'];

export default function BillingLandingPage() {
  const [formData, setFormData] = useState({ name: '', email: '', website: '', monthlyUsage: '', providers: '' });

  // ROI Calculator State
  const [monthlySpend, setMonthlySpend] = useState(5000);
  const [leakagePercent, setLeakagePercent] = useState(8);
  const [adminHours, setAdminHours] = useState(8);
  const [hourlyRate, setHourlyRate] = useState(50);
  const [disputeIncidents, setDisputeIncidents] = useState(1);
  const [hoursPerIncident, setHoursPerIncident] = useState(1.5);

  // ROI Calculations
  const leakageCost = monthlySpend * (leakagePercent / 100);
  const adminCost = adminHours * hourlyRate;
  const disputeCost = disputeIncidents * hoursPerIncident * hourlyRate;
  const totalMonthlyLoss = leakageCost + adminCost + disputeCost;
  const annualLoss = totalMonthlyLoss * 12;

  const formatCurrency = (val: number) => '$' + val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Lead captured:', formData);
    alert('Application submitted! We will review and contact you.');
  };

  return (
    <main style={{ minHeight: '100vh', background: BRAND.deepBg, color: BRAND.text, fontFamily: 'system-ui, sans-serif' }}>
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 20px 100px' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '100%', background: 'radial-gradient(ellipse at top right, rgba(4, 120, 87, 0.15), transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <span style={{ width: 8, height: 8, background: BRAND.gold, borderRadius: '50%', boxShadow: '0 0 12px ' + BRAND.gold }} />
              <span style={{ color: BRAND.gold, fontSize: '0.9rem', fontWeight: 600 }}>Now accepting DFY applications</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, color: BRAND.white, lineHeight: 1.1, margin: 0, marginBottom: 24 }}>
              Stop Leaking Revenue.<br />
              <span style={{ color: BRAND.emeraldLight }}>Automate Usage Billing.</span>
            </h1>
            <p style={{ fontSize: '1.15rem', color: BRAND.muted, lineHeight: 1.7, marginBottom: 36, maxWidth: 600 }}>
              A ledger-grade billing engine for AI voice and SMS agencies. Authorize before spend, settle after completion, auto-refill wallets, and pause clients on payment failure—automatically.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <PrimaryButton href="#apply">Apply for DFY Setup →</PrimaryButton>
              <SecondaryButton href="/billing/offer">Buy DIY Blueprint — $2,997</SecondaryButton>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <section style={{ background: 'rgba(15, 23, 42, 0.5)', borderTop: '1px solid ' + BRAND.cardBorder, borderBottom: '1px solid ' + BRAND.cardBorder, padding: '20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: BRAND.muted, fontSize: '0.95rem', margin: 0 }}>
            Built for agencies selling minutes + messages. Supports <span style={{ color: BRAND.white }}>Vapi</span>, <span style={{ color: BRAND.white }}>Retell</span>, <span style={{ color: BRAND.white }}>Twilio</span>, <span style={{ color: BRAND.white }}>Telnyx</span>, and <span style={{ color: BRAND.white }}>Stripe</span>.
          </p>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader tag="The Problem" title="You Know This Pain" subtitle="If you are billing for AI minutes or SMS, you have probably lost money to at least one of these." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {problems.map((item, i) => (
              <Card key={i}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: 16 }}>{item.icon}</span>
                <h3 style={{ color: BRAND.white, fontSize: '1.05rem', fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: BRAND.muted, fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 20px', background: 'rgba(15, 23, 42, 0.3)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader tag="How It Works" title="Four-Step Flow" subtitle="Every transaction recorded. No revenue left on the table." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {steps.map((item, i) => (
              <div key={i} style={{ background: 'linear-gradient(135deg, ' + item.color + '22, ' + BRAND.cardBg + ')', border: '1px solid ' + item.color + '44', borderRadius: 20, padding: 28, position: 'relative', overflow: 'hidden' }}>
                <span style={{ position: 'absolute', top: 16, right: 16, fontSize: '3rem', fontWeight: 800, color: item.color, opacity: 0.15 }}>{item.step}</span>
                <h3 style={{ color: BRAND.white, fontSize: '1.15rem', fontWeight: 700, marginBottom: 10, position: 'relative' }}>{item.title}</h3>
                <p style={{ color: BRAND.muted, fontSize: '0.88rem', margin: 0, lineHeight: 1.6, position: 'relative' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPORTED STACK + COMPATIBILITY RULE */}
      <section style={{ padding: '60px 20px', borderTop: '1px solid ' + BRAND.cardBorder, borderBottom: '1px solid ' + BRAND.cardBorder }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: BRAND.muted, fontSize: '0.9rem', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 }}>Supported Providers (v1)</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            {providers.map((name) => (
              <Badge key={name} variant="emerald">{name}</Badge>
            ))}
          </div>
          <p style={{ color: BRAND.muted, fontSize: '0.85rem', marginTop: 20 }}>
            Custom meters supported only via our standard <code style={{ color: BRAND.emeraldLight }}>/authorize</code> + <code style={{ color: BRAND.emeraldLight }}>/usage/events</code> APIs.
          </p>

          {/* COMPATIBILITY RULE CALLOUT */}
          <div style={{ marginTop: 32, maxWidth: 800, marginLeft: 'auto', marginRight: 'auto' }}>
            <Card style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(239, 68, 68, 0.25)', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: '1.5rem' }}>⛔</span>
                <h3 style={{ color: '#F87171', fontSize: '1rem', fontWeight: 700, margin: 0 }}>Compatibility Rule — Read This</h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, color: BRAND.text, fontSize: '0.9rem', lineHeight: 1.8 }}>
                <li><strong style={{ color: BRAND.white }}>Pre-authorize or accept post-usage settle only.</strong> If your system cannot call <code style={{ color: BRAND.emeraldLight }}>/authorize</code> before usage starts, it will be settle-after only (no pre-blocking).</li>
                <li><strong style={{ color: BRAND.white }}>Deterministic signed events required.</strong> Your provider must send timestamped, HMAC-signed events to <code style={{ color: BRAND.emeraldLight }}>/usage/events</code> after each usage.</li>
                <li><strong style={{ color: BRAND.white }}>No bespoke integrations.</strong> We do not build custom connectors. If your provider cannot meet the standard event API, it is not compatible.</li>
              </ul>
              <p style={{ color: BRAND.muted, fontSize: '0.8rem', marginTop: 16, marginBottom: 0 }}>This protects both of us from scope creep. If unsure, ask before you apply.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* VALUE EXPLAINERS */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <SectionHeader tag="Learn" title="Not Technical? Start Here." subtitle="Click each to understand what these systems actually do for your business." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Accordion title="What is a ledger?">
              <p style={{ marginBottom: 12 }}>A ledger is like your agency financial memory. Every credit added, every minute used, every refund issued—recorded permanently with timestamps and IDs.</p>
              <p style={{ marginBottom: 12 }}><strong style={{ color: BRAND.white }}>Why it matters:</strong> When a client disputes a charge, you can show exactly what happened, when, and why. No guesswork.</p>
              <p style={{ color: BRAND.emeraldLight, fontWeight: 600 }}>Think of it as your bulletproof receipt book that writes itself.</p>
            </Accordion>
            <Accordion title="Why idempotency matters">
              <p style={{ marginBottom: 12 }}>Webhooks (the messages that tell your system a call happened) can fire multiple times due to retries. Without protection, you would bill the same call twice—or ten times.</p>
              <p style={{ marginBottom: 12 }}><strong style={{ color: BRAND.white }}>Idempotency</strong> means: no matter how many times the same event arrives, it is only processed once. We track event IDs, timestamps, and signatures.</p>
              <p style={{ color: BRAND.emeraldLight, fontWeight: 600 }}>Result: clients never get double-charged, and you never have to issue embarrassing refunds.</p>
            </Accordion>
            <Accordion title="What happens when a payment fails?">
              <p style={{ marginBottom: 12 }}>Card declines happen. With most setups, services keep running and you eat the cost—or worse, clients get free service for weeks before anyone notices.</p>
              <p style={{ marginBottom: 12 }}><strong style={{ color: BRAND.white }}>Our approach:</strong> The moment Stripe reports a failed charge, the client account is paused automatically. They cannot make calls or send messages until payment clears.</p>
              <p style={{ marginBottom: 12 }}>You get an alert via 24/7 automated detection. Human response SLA depends on your tier. Services resume automatically once payment succeeds.</p>
              <p style={{ color: BRAND.emeraldLight, fontWeight: 600 }}>Zero manual intervention for detection. Zero postpaid exposure.</p>
            </Accordion>
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section style={{ padding: '80px 20px', background: 'rgba(15, 23, 42, 0.3)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <SectionHeader tag="ROI Calculator" title="What Is This Costing You?" subtitle="Adjust the sliders to estimate your current monthly loss from billing inefficiencies." />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Inputs Card */}
            <Card>
              <h3 style={{ color: BRAND.white, fontSize: '1.1rem', fontWeight: 600, marginBottom: 24 }}>Your Current Situation</h3>
              
              <SliderInput
                label="Monthly provider spend"
                value={monthlySpend}
                onChange={setMonthlySpend}
                min={1000}
                max={50000}
                step={500}
                prefix="$"
              />
              
              <SliderInput
                label="Estimated leakage %"
                value={leakagePercent}
                onChange={setLeakagePercent}
                min={0}
                max={20}
                step={1}
                unit="%"
              />
              
              <SliderInput
                label="Manual billing/admin hours per month"
                value={adminHours}
                onChange={setAdminHours}
                min={0}
                max={40}
                step={1}
                unit=" hrs"
              />
              
              <SliderInput
                label="Hourly internal cost"
                value={hourlyRate}
                onChange={setHourlyRate}
                min={20}
                max={150}
                step={5}
                prefix="$"
                unit="/hr"
              />
              
              <SliderInput
                label="Chargeback/dispute incidents per month"
                value={disputeIncidents}
                onChange={setDisputeIncidents}
                min={0}
                max={10}
                step={1}
              />
              
              <SliderInput
                label="Avg hours lost per incident"
                value={hoursPerIncident}
                onChange={(v) => setHoursPerIncident(v)}
                min={0.5}
                max={8}
                step={0.5}
                unit=" hrs"
              />
            </Card>

            {/* Results Card */}
            <Card style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(15, 23, 42, 0.8))', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <h3 style={{ color: BRAND.white, fontSize: '1.1rem', fontWeight: 600, marginBottom: 24 }}>Estimated Monthly Loss</h3>
              
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <p style={{ color: '#F87171', fontSize: '3rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{formatCurrency(totalMonthlyLoss)}</p>
                <p style={{ color: BRAND.muted, fontSize: '0.85rem', marginTop: 8 }}>per month</p>
              </div>
              
              <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.15)', paddingTop: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: BRAND.muted, fontSize: '0.9rem' }}>Revenue leakage</span>
                  <span style={{ color: BRAND.text, fontSize: '0.9rem', fontWeight: 600 }}>{formatCurrency(leakageCost)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: BRAND.muted, fontSize: '0.9rem' }}>Admin labor cost</span>
                  <span style={{ color: BRAND.text, fontSize: '0.9rem', fontWeight: 600 }}>{formatCurrency(adminCost)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: BRAND.muted, fontSize: '0.9rem' }}>Dispute handling cost</span>
                  <span style={{ color: BRAND.text, fontSize: '0.9rem', fontWeight: 600 }}>{formatCurrency(disputeCost)}</span>
                </div>
              </div>
              
              <div style={{ background: 'rgba(244, 208, 63, 0.1)', border: '1px solid rgba(244, 208, 63, 0.3)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: BRAND.gold, fontSize: '0.95rem', fontWeight: 600 }}>Estimated annual loss</span>
                  <span style={{ color: BRAND.gold, fontSize: '1.5rem', fontWeight: 800 }}>{formatCurrency(annualLoss)}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <PrimaryButton href="#apply" fullWidth>Apply for DFY →</PrimaryButton>
                <SecondaryButton href="/billing/offer">See full deliverables</SecondaryButton>
              </div>
              
              <p style={{ color: BRAND.muted, fontSize: '0.75rem', marginTop: 16, textAlign: 'center', lineHeight: 1.5 }}>
                Estimates only. Conservative defaults. You control the assumptions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* DIY vs DFY CARDS */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader tag="Options" title="Two Ways to Get Started" subtitle="Choose based on your team technical capacity and timeline." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {/* DIY Card */}
            <Card>
              <Badge variant="muted">Self-Implement</Badge>
              <h3 style={{ color: BRAND.white, fontSize: '1.5rem', fontWeight: 700, marginTop: 16, marginBottom: 8 }}>DIY Blueprint</h3>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: BRAND.white }}>$2,997</span>
                <span style={{ color: BRAND.muted, marginLeft: 8 }}>one-time</span>
              </div>
              <p style={{ color: BRAND.muted, fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.6 }}>Complete technical specification. You build it on your own infrastructure.</p>
              <div style={{ marginBottom: 20 }}>
                <p style={{ color: BRAND.white, fontSize: '0.85rem', fontWeight: 600, marginBottom: 10 }}>Best for:</p>
                {['Teams with an in-house developer', 'Agencies who want full control', 'Those with existing n8n/Postgres setup'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ color: BRAND.emeraldLight }}>✓</span>
                    <span style={{ color: BRAND.text, fontSize: '0.88rem' }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: BRAND.muted, fontSize: '0.85rem', fontWeight: 600, marginBottom: 10 }}>Not for:</p>
                {['Non-technical founders', 'Teams who need it live this month'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ color: BRAND.muted }}>✗</span>
                    <span style={{ color: BRAND.muted, fontSize: '0.88rem' }}>{item}</span>
                  </div>
                ))}
              </div>
              <SecondaryButton href="/billing/offer">View Blueprint Details</SecondaryButton>
            </Card>

            {/* DFY Card */}
            <Card highlight>
              <div style={{ position: 'absolute', top: -1, right: 24, background: BRAND.gold, color: BRAND.charcoal, padding: '6px 14px', borderRadius: '0 0 8px 8px', fontSize: '0.75rem', fontWeight: 700 }}>RECOMMENDED</div>
              <Badge variant="emerald">We Build It</Badge>
              <h3 style={{ color: BRAND.white, fontSize: '1.5rem', fontWeight: 700, marginTop: 16, marginBottom: 8 }}>DFY Hosted</h3>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: BRAND.white }}>From $12,500</span>
                <span style={{ color: BRAND.muted, marginLeft: 8 }}>setup</span>
              </div>
              <p style={{ color: BRAND.muted, fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.6 }}>Dedicated stack on our infrastructure. We handle provisioning, monitoring, and maintenance.</p>
              <div style={{ marginBottom: 20 }}>
                <p style={{ color: BRAND.white, fontSize: '0.85rem', fontWeight: 600, marginBottom: 10 }}>Best for:</p>
                {['Agencies without dev resources', 'Teams who need it running fast', 'Those who want hands-off ops'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ color: BRAND.emeraldLight }}>✓</span>
                    <span style={{ color: BRAND.text, fontSize: '0.88rem' }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: BRAND.muted, fontSize: '0.85rem', fontWeight: 600, marginBottom: 10 }}>Not for:</p>
                {['Agencies needing unsupported providers', 'Clients requiring on-prem hosting'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ color: BRAND.muted }}>✗</span>
                    <span style={{ color: BRAND.muted, fontSize: '0.88rem' }}>{item}</span>
                  </div>
                ))}
              </div>
              <PrimaryButton href="#apply">Apply for DFY →</PrimaryButton>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 20px', background: 'rgba(15, 23, 42, 0.3)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <SectionHeader tag="FAQ" title="Frequently Asked Questions" subtitle="Quick answers to common questions." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Accordion title="Can this handle inbound calls/messages?" defaultOpen>
                <p style={{ marginBottom: 12 }}><strong style={{ color: BRAND.white }}>Yes, if you can map the caller to a wallet.</strong> The engine can enforce pre-authorization on inbound if your system identifies the caller (by phone number or account ID) and calls <code style={{ color: BRAND.emeraldLight }}>/authorize</code> before connecting or processing.</p>
                <p style={{ marginBottom: 12 }}><strong style={{ color: BRAND.white }}>Unknown callers or no wallet mapping?</strong> Then it is post-usage settle only—credits are deducted after the call ends, not blocked upfront. For these cases, you should require larger credit buffers on accounts or route unknown callers to a paused/limit behavior.</p>
                <p style={{ color: BRAND.muted, fontSize: '0.85rem' }}>Bottom line: pre-auth is possible on inbound if you control the caller lookup. If you cannot, plan for post-settle and buffer accordingly.</p>
              </Accordion>
              <Accordion title="Can I connect a provider you do not support?">
                <p><strong style={{ color: BRAND.white }}>Only through our standard APIs.</strong> If your provider can hit <code style={{ color: BRAND.emeraldLight }}>/authorize</code> before usage and send signed events to <code style={{ color: BRAND.emeraldLight }}>/usage/events</code> after, we can track it. We do not build bespoke integrations. If it cannot meet the event API spec, it is not compatible.</p>
              </Accordion>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Accordion title="Who owns the provider accounts?">
                <p><strong style={{ color: BRAND.white }}>You do.</strong> All provider accounts remain in your name. We connect via API keys you provide (stored encrypted). You maintain full control and can revoke access at any time.</p>
              </Accordion>
              <Accordion title="What does monitoring actually cover?">
                <p style={{ marginBottom: 12 }}><strong style={{ color: BRAND.white }}>Includes:</strong> 24/7 automated detection of workflow failures, webhook delivery issues, payment declines, and ledger inconsistencies. Alerts fire immediately to your configured channels.</p>
                <p style={{ marginBottom: 12 }}><strong style={{ color: BRAND.white }}>Human response SLA depends on tier:</strong> 48hr (Core), 24hr (Hardened), 4hr (Production). We do not have humans on-call 24/7 for all tiers.</p>
                <p><strong style={{ color: BRAND.muted }}>Excludes:</strong> Feature development, provider account management, custom meters, debugging your external systems.</p>
              </Accordion>
              <Accordion title="Is there 24/7 support?">
                <p style={{ marginBottom: 12 }}><strong style={{ color: BRAND.white }}>24/7 automated detection + escalation—yes.</strong> The system monitors continuously and alerts immediately when something breaks.</p>
                <p><strong style={{ color: BRAND.white }}>24/7 human response—no.</strong> Human response times are based on your tier SLA. If you need faster human response, choose a higher tier or discuss custom arrangements during scoping.</p>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* MONITORING OUTPUTS */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <SectionHeader tag="Deliverables" title="What You Get From Monitoring" subtitle="Tangible artifacts you receive, not just background chores." />
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>📊</span>
                <div>
                  <h4 style={{ color: BRAND.white, fontSize: '0.95rem', fontWeight: 600, margin: 0, marginBottom: 4 }}>Weekly health summary</h4>
                  <p style={{ color: BRAND.muted, fontSize: '0.85rem', margin: 0 }}>Workflow pass/fail rates, error counts, uptime metrics.</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>📒</span>
                <div>
                  <h4 style={{ color: BRAND.white, fontSize: '0.95rem', fontWeight: 600, margin: 0, marginBottom: 4 }}>Ledger integrity report</h4>
                  <p style={{ color: BRAND.muted, fontSize: '0.85rem', margin: 0 }}>Confirms ledger balances reconcile with Stripe transactions.</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>🚨</span>
                <div>
                  <h4 style={{ color: BRAND.white, fontSize: '0.95rem', fontWeight: 600, margin: 0, marginBottom: 4 }}>Refill/decline incident log</h4>
                  <p style={{ color: BRAND.muted, fontSize: '0.85rem', margin: 0 }}>Every auto-refill attempt and payment failure, timestamped.</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>💾</span>
                <div>
                  <h4 style={{ color: BRAND.white, fontSize: '0.95rem', fontWeight: 600, margin: 0, marginBottom: 4 }}>Monthly backup verification</h4>
                  <p style={{ color: BRAND.muted, fontSize: '0.85rem', margin: 0 }}>Evidence that backups completed and are restorable.</p>
                </div>
              </div>
            </div>
            <p style={{ color: BRAND.muted, fontSize: '0.8rem', marginTop: 24, marginBottom: 0, borderTop: '1px solid ' + BRAND.cardBorder, paddingTop: 16 }}>
              Monitoring is billing-engine-only, not your entire app. We monitor what we built; your other systems are your responsibility.
            </p>
          </Card>
        </div>
      </section>

      {/* LEAD CAPTURE FORM */}
      <section id="apply" style={{ padding: '80px 20px', background: 'rgba(4, 120, 87, 0.08)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Badge variant="gold">Apply</Badge>
            <h2 style={{ color: BRAND.white, fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Apply for DFY Setup</h2>
            <p style={{ color: BRAND.muted }}>We review every application to ensure fit. Expect a response within 2 business days.</p>
          </div>
          <Card>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', color: BRAND.text, fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Full Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Jane Smith" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid ' + BRAND.cardBorder, background: 'rgba(2, 6, 23, 0.6)', color: BRAND.white, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: BRAND.text, fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Work Email *</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="jane@agency.com" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid ' + BRAND.cardBorder, background: 'rgba(2, 6, 23, 0.6)', color: BRAND.white, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: BRAND.text, fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Agency Website</label>
                <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://youragency.com" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid ' + BRAND.cardBorder, background: 'rgba(2, 6, 23, 0.6)', color: BRAND.white, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: BRAND.text, fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Estimated Monthly Usage</label>
                <select value={formData.monthlyUsage} onChange={(e) => setFormData({ ...formData, monthlyUsage: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid ' + BRAND.cardBorder, background: 'rgba(2, 6, 23, 0.6)', color: formData.monthlyUsage ? BRAND.white : BRAND.muted, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">Select range</option>
                  <option value="under-1k">Under $1,000/mo</option>
                  <option value="1k-5k">$1,000 - $5,000/mo</option>
                  <option value="5k-20k">$5,000 - $20,000/mo</option>
                  <option value="20k-plus">$20,000+/mo</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: BRAND.text, fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Which providers do you currently use?</label>
                <input type="text" value={formData.providers} onChange={(e) => setFormData({ ...formData, providers: e.target.value })} placeholder="e.g., Vapi, Twilio, Stripe" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid ' + BRAND.cardBorder, background: 'rgba(2, 6, 23, 0.6)', color: BRAND.white, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <PrimaryButton type="submit" fullWidth>Submit Application →</PrimaryButton>
              <p style={{ textAlign: 'center', color: BRAND.muted, fontSize: '0.85rem' }}>Or <a href="/billing/offer" style={{ color: BRAND.emeraldLight }}>view full offer details</a> before applying.</p>
            </form>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '40px 20px', borderTop: '1px solid ' + BRAND.cardBorder, textAlign: 'center' }}>
        <p style={{ color: BRAND.muted, fontSize: '0.85rem', margin: 0 }}>© {new Date().getFullYear()} All In Digital. Billing Engine by AID.</p>
      </footer>

      {/* STICKY MOBILE CTA */}
      <div className="mobile-cta" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: BRAND.charcoal, borderTop: '1px solid ' + BRAND.cardBorder, padding: 16, display: 'flex', gap: 12, zIndex: 100 }}>
        <a href="#apply" style={{ flex: 1, textAlign: 'center', padding: '14px', background: BRAND.emerald, color: BRAND.white, fontWeight: 600, borderRadius: 10, textDecoration: 'none', fontSize: '0.9rem' }}>Apply for DFY</a>
        <a href="/billing/offer" style={{ flex: 1, textAlign: 'center', padding: '14px', background: 'transparent', color: BRAND.white, fontWeight: 600, borderRadius: 10, textDecoration: 'none', border: '1px solid ' + BRAND.cardBorder, fontSize: '0.9rem' }}>View Offer</a>
      </div>
      <div className="mobile-spacer" style={{ height: 80 }} />
      <style>{`
        @media (min-width: 768px) {
          .mobile-cta { display: none !important; }
          .mobile-spacer { display: none !important; }
        }
      `}</style>
    </main>
  );
}
```