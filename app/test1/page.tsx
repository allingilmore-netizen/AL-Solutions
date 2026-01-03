'use client';

import { useState } from 'react';

// ============ STYLES ============
const BRAND = {
  emerald: '#047857',
  emeraldLight: '#10B981',
  gold: '#F4D03F',
  goldDark: '#D4AC0D',
  charcoal: '#0F172A',
  deepBg: '#020617',
  cardBg: 'rgba(15, 23, 42, 0.6)',
  cardBorder: 'rgba(148, 163, 184, 0.15)',
  muted: '#94A3B8',
  text: '#E2E8F0',
  white: '#F8FAFC',
};

// ============ COMPONENTS ============

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        background: BRAND.cardBg,
        border: `1px solid ${BRAND.cardBorder}`,
        borderRadius: 16,
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontWeight: 600, color: BRAND.white, fontSize: '0.95rem' }}>{title}</span>
        <span
          style={{
            color: BRAND.muted,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            fontSize: '0.8rem',
          }}
        >
          ▼
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 20px', color: BRAND.text, fontSize: '0.9rem', lineHeight: 1.7 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Badge({ children, variant = 'emerald' }: { children: React.ReactNode; variant?: 'emerald' | 'gold' | 'muted' }) {
  const colors = {
    emerald: { bg: 'rgba(4, 120, 87, 0.2)', border: 'rgba(16, 185, 129, 0.4)', text: '#34D399' },
    gold: { bg: 'rgba(244, 208, 63, 0.15)', border: 'rgba(244, 208, 63, 0.4)', text: BRAND.gold },
    muted: { bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.3)', text: BRAND.muted },
  };
  const c = colors[variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 14px',
        borderRadius: 20,
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        fontSize: '0.8rem',
        fontWeight: 600,
      }}
    >
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
      <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 700, color: BRAND.white, margin: 0, marginBottom: 8 }}>
        {title}
      </h2>
      <p style={{ color: BRAND.muted, fontSize: '1rem', margin: 0, maxWidth: 600 }}>{subtitle}</p>
    </div>
  );
}

function Card({ children, highlight = false, style = {} }: { children: React.ReactNode; highlight?: boolean; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: highlight ? 'linear-gradient(135deg, rgba(4, 120, 87, 0.15), rgba(15, 23, 42, 0.8))' : BRAND.cardBg,
        border: `1px solid ${highlight ? 'rgba(16, 185, 129, 0.4)' : BRAND.cardBorder}`,
        borderRadius: 20,
        padding: 28,
        backdropFilter: 'blur(12px)',
        position: 'relative',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CheckItem({ children, included = true }: { children: React.ReactNode; included?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: included ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.1)',
          color: included ? BRAND.emeraldLight : BRAND.muted,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {included ? '✓' : '✗'}
      </span>
      <span style={{ color: included ? BRAND.text : BRAND.muted, fontSize: '0.9rem' }}>{children}</span>
    </div>
  );
}

function PricingCard({
  tier,
  name,
  setup,
  monthly,
  description,
  features,
  highlighted = false,
}: {
  tier: string;
  name: string;
  setup: string;
  monthly: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <Card highlight={highlighted}>
      {highlighted && (
        <div
          style={{
            position: 'absolute',
            top: -1,
            right: 24,
            background: BRAND.gold,
            color: BRAND.charcoal,
            padding: '6px 14px',
            borderRadius: '0 0 8px 8px',
            fontSize: '0.7rem',
            fontWeight: 700,
          }}
        >
          MOST POPULAR
        </div>
      )}
      <p style={{ color: BRAND.emeraldLight, fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>{tier}</p>
      <h3 style={{ color: BRAND.white, fontSize: '1.35rem', fontWeight: 700, marginBottom: 8 }}>{name}</h3>
      <p style={{ color: BRAND.muted, fontSize: '0.85rem', marginBottom: 20 }}>{description}</p>
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: '2rem', fontWeight: 800, color: BRAND.white }}>{setup}</span>
        <p style={{ color: BRAND.muted, fontSize: '0.8rem', marginTop: 4 }}>setup + {monthly}/mo monitoring</p>
      </div>
      <div>
        {features.map((f, i) => (
          <CheckItem key={i}>{f}</CheckItem>
        ))}
      </div>
    </Card>
  );
}

// ============ FIT QUIZ ============

function FitQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const questions = [
    {
      q: 'Do you have a developer on your team who can implement complex integrations?',
      options: ['Yes, in-house dev', 'We use contractors', 'No technical resources'],
    },
    {
      q: 'Which providers do you currently use?',
      options: ['Only Vapi/Retell/Twilio/Telnyx', 'Mix of supported + others', 'Mostly unsupported providers'],
    },
    {
      q: 'How soon do you need this running?',
      options: ['3+ months is fine', '1-2 months', 'ASAP (under 4 weeks)'],
    },
    {
      q: 'How do you prefer to manage infrastructure?',
      options: ['I want full control', 'Flexible either way', 'I want it managed for me'],
    },
  ];

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      const score = newAnswers.reduce((sum, a) => sum + a, 0);
      if (score <= 3) setResult('diy');
      else if (score <= 6) setResult('either');
      else setResult('dfy');
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers([]);
    setResult(null);
  };

  if (result) {
    return (
      <Card>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: BRAND.white, fontSize: '1.5rem', fontWeight: 700, marginBottom: 20 }}>Your Recommendation</h3>
          {result === 'diy' && (
            <>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🛠️</div>
              <p style={{ color: BRAND.white, fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>DIY Blueprint looks like a fit.</p>
              <p style={{ color: BRAND.muted, marginBottom: 24 }}>You have technical resources and time. The blueprint gives you everything you need to self-implement.</p>
              <a href="#diy-details" style={{ display: 'inline-block', padding: '14px 28px', background: BRAND.charcoal, color: BRAND.white, borderRadius: 12, textDecoration: 'none', fontWeight: 600, border: `1px solid ${BRAND.cardBorder}` }}>View DIY Details</a>
            </>
          )}
          {result === 'dfy' && (
            <>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🚀</div>
              <p style={{ color: BRAND.white, fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>DFY Hosted is your best path.</p>
              <p style={{ color: BRAND.muted, marginBottom: 24 }}>Limited dev resources + fast timeline = let us handle it.</p>
              <a href="/billing#apply" style={{ display: 'inline-block', padding: '14px 28px', background: BRAND.emerald, color: BRAND.white, borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>Apply for DFY</a>
            </>
          )}
          {result === 'either' && (
            <>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>⚖️</div>
              <p style={{ color: BRAND.white, fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Either option could work.</p>
              <p style={{ color: BRAND.muted, marginBottom: 24 }}>DIY if you want control. DFY if you'd rather move fast.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="#diy-details" style={{ padding: '14px 24px', background: BRAND.charcoal, color: BRAND.white, borderRadius: 12, textDecoration: 'none', fontWeight: 600, border: `1px solid ${BRAND.cardBorder}` }}>DIY Details</a>
                <a href="/billing#apply" style={{ padding: '14px 24px', background: BRAND.emerald, color: BRAND.white, borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>Apply DFY</a>
              </div>
            </>
          )}
          <button onClick={reset} style={{ marginTop: 24, color: BRAND.muted, background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}>Retake quiz</button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ color: BRAND.white, fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Are You a Fit?</h3>
        <span style={{ color: BRAND.muted, fontSize: '0.85rem' }}>Question {step + 1} of {questions.length}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(148, 163, 184, 0.2)', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ width: `${((step + 1) / questions.length) * 100}%`, height: '100%', background: BRAND.emeraldLight, transition: 'width 0.3s' }} />
      </div>
      <p style={{ color: BRAND.text, fontSize: '1.05rem', marginBottom: 24 }}>{questions[step].q}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {questions[step].options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '14px 18px',
              borderRadius: 12,
              border: `1px solid ${BRAND.cardBorder}`,
              background: 'rgba(2, 6, 23, 0.5)',
              color: BRAND.text,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = BRAND.emeraldLight;
              e.currentTarget.style.background = 'rgba(4, 120, 87, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = BRAND.cardBorder;
              e.currentTarget.style.background = 'rgba(2, 6, 23, 0.5)';
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </Card>
  );
}

// ============ MAIN PAGE ============

export default function BillingOfferPage() {
  return (
    <main style={{ minHeight: '100vh', background: BRAND.deepBg, color: BRAND.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* HEADER */}
      <section style={{ padding: '40px 20px 60px', borderBottom: `1px solid ${BRAND.cardBorder}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <a href="/billing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: BRAND.emeraldLight, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, marginBottom: 24 }}>
            ← Back to Overview
          </a>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: BRAND.white, margin: 0, marginBottom: 12 }}>
            Offer Details & Pricing
          </h1>
          <p style={{ color: BRAND.muted, fontSize: '1.1rem', maxWidth: 600, margin: 0 }}>
            Complete breakdown of deliverables, pricing tiers, scope guardrails, and what's included in each option.
          </p>
        </div>
      </section>

      {/* FIT QUIZ */}
      <section style={{ padding: '60px 20px', background: 'rgba(15, 23, 42, 0.3)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <FitQuiz />
        </div>
      </section>

      {/* DIY PRICING */}
      <section id="diy-details" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader tag="DIY" title="DIY Blueprint" subtitle="For teams with technical resources who want to self-implement." />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {/* Main DIY Card */}
            <div style={{ gridColumn: 'span 2' }}>
              <Card style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                  <div>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: BRAND.white }}>$2,997</span>
                    <p style={{ color: BRAND.muted, fontSize: '0.9rem', marginTop: 4 }}>one-time purchase</p>
                  </div>
                  <Badge variant="muted">No support included</Badge>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 32 }}>
                  <div>
                    <h4 style={{ color: BRAND.white, fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>What's Included:</h4>
                    <CheckItem>Complete Postgres schema + ledger specification</CheckItem>
                    <CheckItem>Workflow architecture maps (W1–W7)</CheckItem>
                    <CheckItem>Webhook handling rules + idempotency logic</CheckItem>
                    <CheckItem>Authorize + Usage Event API contracts</CheckItem>
                    <CheckItem>HMAC signing + replay protection specs</CheckItem>
                    <CheckItem>Test plan with edge case scenarios</CheckItem>
                    <CheckItem>Operational runbook</CheckItem>
                  </div>
                  <div>
                    <h4 style={{ color: BRAND.muted, fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>What's Excluded:</h4>
                    <CheckItem included={false}>Implementation assistance</CheckItem>
                    <CheckItem included={false}>Environment setup or debugging</CheckItem>
                    <CheckItem included={false}>Custom provider integrations</CheckItem>
                    <CheckItem included={false}>Ongoing support or monitoring</CheckItem>
                  </div>
                </div>
              </Card>
            </div>

            {/* AI Support Add-on */}
            <Card style={{ background: 'linear-gradient(135deg, rgba(244, 208, 63, 0.08), rgba(15, 23, 42, 0.6))', borderColor: 'rgba(244, 208, 63, 0.3)' }}>
              <Badge variant="gold">Optional Add-on</Badge>
              <h3 style={{ color: BRAND.white, fontSize: '1.25rem', fontWeight: 700, marginTop: 12, marginBottom: 8 }}>AI IT Support</h3>
              <p style={{ color: BRAND.muted, fontSize: '0.85rem', marginBottom: 24, lineHeight: 1.6 }}>
                Bounded support that ONLY answers from the blueprint. Goes beyond scope? It says "Not in scope" and points to DFY.
              </p>
              <div style={{ borderTop: `1px solid rgba(244, 208, 63, 0.2)`, paddingTop: 16 }}>
                {[
                  { time: '15 minutes', price: '$44' },
                  { time: '30 minutes', price: '$80' },
                  { time: '60 minutes', price: '$125' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? `1px solid rgba(244, 208, 63, 0.1)` : 'none' }}>
                    <span style={{ color: BRAND.text }}>{item.time}</span>
                    <span style={{ color: BRAND.gold, fontWeight: 600 }}>{item.price}</span>
                  </div>
                ))}
              </div>
              <p style={{ color: BRAND.muted, fontSize: '0.75rem', marginTop: 16 }}>Purchased separately after blueprint delivery.</p>
            </Card>
          </div>

          {/* Deliverable Examples */}
          <div style={{ marginTop: 40 }}>
            <h3 style={{ color: BRAND.white, fontSize: '1.15rem', fontWeight: 600, marginBottom: 16 }}>Deliverable Examples</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Accordion title="See example: Ledger Entry JSON">
                <pre style={{ background: 'rgba(2, 6, 23, 0.8)', padding: 16, borderRadius: 12, overflow: 'auto', fontSize: '0.8rem', color: BRAND.text }}>
{`{
  "entry_id": "led_xxxxxxxxxxxxx",
  "client_id": "cli_xxxxxxxxxxxxx",
  "type": "DEBIT",
  "amount": 125,
  "currency": "credits",
  "balance_before": 500,
  "balance_after": 375,
  "reference_type": "VOICE_USAGE",
  "reference_id": "call_xxxxxxxxxxxxx",
  "provider": "vapi",
  "idempotency_key": "vapi_call_xxxxxxxxxxxxx_settle",
  "created_at": "2025-01-15T14:32:18.000Z",
  "metadata": {
    "duration_seconds": 125,
    "cost_per_minute": 0.12,
    "workflow_run_id": "wf_xxxxxxxxxxxxx"
  }
}`}
                </pre>
                <p style={{ marginTop: 12, color: BRAND.muted, fontSize: '0.85rem' }}>Every credit add, deduction, refund, and adjustment is logged with full traceability.</p>
              </Accordion>

              <Accordion title="See example: Workflow List (W1–W7)">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { name: 'W1: Stripe Invoice Paid → Credit Grant', desc: 'Listens for invoice.paid webhook, validates signature, grants credits, logs ledger entry.' },
                    { name: 'W2: Authorize Request Handler', desc: 'Receives /authorize calls, checks balance, reserves credits, returns approval/denial.' },
                    { name: 'W3: Usage Event Settler', desc: 'Processes /usage/events, validates HMAC, checks replay, settles against reservation.' },
                    { name: 'W4: Auto-Refill Trigger', desc: 'Monitors balances, triggers Stripe charge at threshold, handles success/failure.' },
                    { name: 'W5: Payment Failed Handler', desc: 'Listens for charge.failed, pauses client services, sends alerts.' },
                    { name: 'W6: Dispute Handler', desc: 'Listens for charge.dispute.created, pauses client, logs event, triggers notification.' },
                    { name: 'W7: Health Check + Alert Router', desc: 'Scheduled check that verifies workflows ran, checks ledger consistency, routes alerts.' },
                  ].map((w, i) => (
                    <div key={i} style={{ background: 'rgba(2, 6, 23, 0.5)', padding: 14, borderRadius: 10, border: `1px solid ${BRAND.cardBorder}` }}>
                      <p style={{ color: BRAND.white, fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{w.name}</p>
                      <p style={{ color: BRAND.muted, fontSize: '0.8rem', margin: 0 }}>{w.desc}</p>
                    </div>
                  ))}
                </div>
              </Accordion>

              <Accordion title="See example: Alert Message">
                <div style={{ background: 'rgba(2, 6, 23, 0.8)', padding: 16, borderRadius: 12, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  <p style={{ color: BRAND.gold, marginBottom: 8 }}>⚠️ PAYMENT FAILED ALERT</p>
                  <p style={{ color: BRAND.text, margin: '4px 0' }}>Client: [REDACTED_CLIENT_NAME]</p>
                  <p style={{ color: BRAND.text, margin: '4px 0' }}>Client ID: cli_xxxxxxxxxxxxx</p>
                  <p style={{ color: BRAND.text, margin: '4px 0' }}>Event: charge.failed</p>
                  <p style={{ color: BRAND.text, margin: '4px 0' }}>Amount: $250.00</p>
                  <p style={{ color: BRAND.text, margin: '4px 0' }}>Failure Code: card_declined</p>
                  <p style={{ color: BRAND.text, margin: '4px 0' }}>Timestamp: 2025-01-15T14:32:18Z</p>
                  <p style={{ color: BRAND.muted, margin: '12px 0 4px' }}>Action taken: Services paused. Client notified.</p>
                  <p style={{ color: BRAND.muted, margin: '4px 0' }}>Correlation ID: corr_xxxxxxxxxxxxx</p>
                </div>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* DFY PRICING */}
      <section style={{ padding: '80px 20px', background: 'rgba(15, 23, 42, 0.3)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader tag="DFY" title="DFY Hosted Tiers" subtitle="We build and host your dedicated billing engine on our infrastructure." />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <PricingCard
              tier="Tier 1"
              name="DFY Core"
              setup="$12,500"
              monthly="$1,250"
              description="Essential billing engine with standard configuration."
              features={['Dedicated Postgres instance', 'Core workflows (W1–W7)', 'Supported providers only', 'Basic alerting (Telegram/Email)', 'Standard monitoring', '48hr response SLA']}
            />
            <PricingCard
              tier="Tier 2"
              name="DFY Hardened"
              setup="$25,000"
              monthly="$1,750"
              description="Enhanced security and resilience for higher volume."
              highlighted
              features={['Everything in Core', 'Database replication', 'Enhanced retry logic', 'Webhook signature verification', 'Ledger audit reports', '24hr response SLA']}
            />
            <PricingCard
              tier="Tier 3"
              name="DFY Production"
              setup="$37,700"
              monthly="$2,500"
              description="Full production hardening for mission-critical operations."
              features={['Everything in Hardened', 'Multi-region failover', 'Real-time dashboards', 'Custom alert routing', 'Quarterly business reviews', '4hr response SLA']}
            />
          </div>

          <p style={{ textAlign: 'center', color: BRAND.muted, fontSize: '0.85rem', marginTop: 24 }}>
            All tiers include supported providers only. Custom meters via standard APIs quoted separately.
          </p>
        </div>
      </section>

      {/* SCOPE GUARDRAILS */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionHeader tag="Scope" title="Scope Guardrails" subtitle="What we support and what we don't." />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <Card style={{ background: 'linear-gradient(135deg, rgba(4, 120, 87, 0.1), rgba(15, 23, 42, 0.6))', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: BRAND.emerald, color: BRAND.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>✓</span>
                <h3 style={{ color: BRAND.white, fontSize: '1rem', fontWeight: 600, margin: 0 }}>Supported (v1)</h3>
              </div>
              <div style={{ color: BRAND.text, fontSize: '0.9rem', lineHeight: 1.8 }}>
                <p><strong>Voice:</strong> Vapi, Retell</p>
                <p><strong>SMS:</strong> Twilio, Telnyx</p>
                <p><strong>Billing:</strong> Stripe</p>
                <p><strong>Custom Meters:</strong> Only via standard APIs</p>
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(148, 163, 184, 0.3)', color: BRAND.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>✗</span>
                <h3 style={{ color: BRAND.muted, fontSize: '1rem', fontWeight: 600, margin: 0 }}>Not Supported</h3>
              </div>
              <div style={{ color: BRAND.muted, fontSize: '0.9rem', lineHeight: 1.8 }}>
                <p>Providers outside the supported list</p>
                <p>Meters that can't hit /authorize first</p>
                <p>Systems without deterministic usage events</p>
                <p>Bespoke "integrate anything" requests</p>
              </div>
            </Card>
          </div>

          <Card style={{ marginTop: 20, background: 'linear-gradient(135deg, rgba(244, 208, 63, 0.08), rgba(15, 23, 42, 0.6))', borderColor: 'rgba(244, 208, 63, 0.25)' }}>
            <h3 style={{ color: BRAND.gold, fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>Custom Meter Rule</h3>
            <p style={{ color: BRAND.text, fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 12 }}>
              If your system can call <code style={{ background: 'rgba(244, 208, 63, 0.15)', padding: '2px 6px', borderRadius: 4, color: BRAND.gold }}>/authorize</code> before usage starts AND emit signed events to <code style={{ background: 'rgba(244, 208, 63, 0.15)', padding: '2px 6px', borderRadius: 4, color: BRAND.gold }}>/usage/events</code> after completion, we can track it.
            </p>
            <ul style={{ color: BRAND.muted, fontSize: '0.85rem', paddingLeft: 20, margin: 0 }}>
              <li>HMAC-signed payloads (SHA-256)</li>
              <li>Unique event IDs for replay protection</li>
              <li>Deterministic, timestamped usage amounts</li>
            </ul>
            <p style={{ color: BRAND.muted, fontSize: '0.85rem', marginTop: 12 }}>If it can't do this, it's not compatible. We do not build bespoke integrations.</p>
          </Card>
        </div>
      </section>

      {/* MONITORING */}
      <section style={{ padding: '80px 20px', background: 'rgba(15, 23, 42, 0.3)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionHeader tag="Monitoring" title="What Monitoring Covers" subtitle="Explicit list of what's included and excluded." />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <Card>
              <h3 style={{ color: BRAND.white, fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Monitoring Includes:</h3>
              <CheckItem>Workflow health checks (all W1–W7)</CheckItem>
              <CheckItem>Webhook delivery confirmation</CheckItem>
              <CheckItem>Failed payment alerts + escalation</CheckItem>
              <CheckItem>Refill trigger verification</CheckItem>
              <CheckItem>Ledger consistency audits</CheckItem>
              <CheckItem>Infrastructure uptime monitoring</CheckItem>
              <CheckItem>Error rate alerting</CheckItem>
              <CheckItem>Database backup verification</CheckItem>
            </Card>

            <Card>
              <h3 style={{ color: BRAND.muted, fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Monitoring Excludes:</h3>
              <CheckItem included={false}>Feature development or enhancements</CheckItem>
              <CheckItem included={false}>Provider account management</CheckItem>
              <CheckItem included={false}>Custom meter integrations</CheckItem>
              <CheckItem included={false}>Debugging your external systems</CheckItem>
              <CheckItem included={false}>Issues outside billing engine scope</CheckItem>
              <CheckItem included={false}>End-user support (your clients)</CheckItem>
              <CheckItem included={false}>Provider outage resolution</CheckItem>
              <CheckItem included={false}>Business logic changes</CheckItem>
            </Card>
          </div>
        </div>
      </section>

      {/* IMPLEMENTATION TIMELINE */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <SectionHeader tag="Timeline" title="Implementation Phases" subtitle="We don't promise specific dates—we commit to phases." />
          
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, background: BRAND.cardBorder }} />
            {[
              { phase: 'Phase 1', title: 'Provision', desc: 'Spin up dedicated infrastructure. Configure database, n8n instance, and networking.' },
              { phase: 'Phase 2', title: 'Wire Providers', desc: 'Connect your Stripe, voice, and SMS accounts. Configure webhooks and API keys.' },
              { phase: 'Phase 3', title: 'Test', desc: 'End-to-end testing with your accounts. Verify authorize flow, settlement, refills, and failure handling.' },
              { phase: 'Phase 4', title: 'Go-Live', desc: 'Cutover to production. Monitor first billing cycle. Confirm all workflows firing correctly.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 24, marginBottom: 32, position: 'relative' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: BRAND.emerald, border: `4px solid ${BRAND.deepBg}`, flexShrink: 0, zIndex: 1 }} />
                <Card style={{ flex: 1 }}>
                  <p style={{ color: BRAND.emeraldLight, fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>{item.phase}</p>
                  <h3 style={{ color: BRAND.white, fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ color: BRAND.muted, fontSize: '0.9rem', margin: 0 }}>{item.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '80px 20px', background: `linear-gradient(135deg, ${BRAND.emerald}, ${BRAND.emeraldLight})` }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: BRAND.white, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: 16 }}>
            Ready to Stop Leaking Revenue?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: 32 }}>
            Grab the blueprint and self-implement, or apply for DFY and let us handle everything.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/billing#apply" style={{ padding: '16px 32px', background: BRAND.white, color: BRAND.emerald, fontWeight: 700, borderRadius: 12, textDecoration: 'none', fontSize: '1rem' }}>
              Apply for DFY Setup
            </a>
            <a href="#diy-details" style={{ padding: '16px 32px', background: 'rgba(255,255,255,0.15)', color: BRAND.white, fontWeight: 700, borderRadius: 12, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)', fontSize: '1rem' }}>
              Buy DIY Blueprint — $2,997
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '40px 20px', borderTop: `1px solid ${BRAND.cardBorder}`, textAlign: 'center' }}>
        <p style={{ color: BRAND.muted, fontSize: '0.85rem', margin: 0 }}>
          © {new Date().getFullYear()} All In Digital. Billing Engine by AID.
        </p>
        <a href="/billing" style={{ color: BRAND.emeraldLight, fontSize: '0.85rem', marginTop: 8, display: 'inline-block' }}>Back to Overview</a>
      </footer>
    </main>
  );
}