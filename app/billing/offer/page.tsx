```tsx
'use client';

import { useState } from 'react';

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

function Badge({ children, variant = 'emerald' }: { children: React.ReactNode; variant?: 'emerald' | 'gold' | 'muted' }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    emerald: { bg: 'rgba(4, 120, 87, 0.2)', border: 'rgba(16, 185, 129, 0.4)', text: '#34D399' },
    gold: { bg: 'rgba(244, 208, 63, 0.15)', border: 'rgba(244, 208, 63, 0.4)', text: BRAND.gold },
    muted: { bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.3)', text: BRAND.muted },
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

function CheckItem({ children, included = true }: { children: React.ReactNode; included?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
      <span style={{ width: 20, height: 20, borderRadius: '50%', background: included ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.1)', color: included ? BRAND.emeraldLight : BRAND.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0, marginTop: 2 }}>
        {included ? '✓' : '✗'}
      </span>
      <span style={{ color: included ? BRAND.text : BRAND.muted, fontSize: '0.9rem' }}>{children}</span>
    </div>
  );
}

function TierCard({ tier, name, setup, monthly, description, buildDeliverables, monitoringDeliverables, evidencePack, responseSla, highlighted = false }: {
  tier: string;
  name: string;
  setup: string;
  monthly: string;
  description: string;
  buildDeliverables: string[];
  monitoringDeliverables: string[];
  evidencePack: string[];
  responseSla: string;
  highlighted?: boolean;
}) {
  return (
    <Card highlight={highlighted}>
      {highlighted && (
        <div style={{ position: 'absolute', top: -1, right: 24, background: BRAND.gold, color: BRAND.charcoal, padding: '6px 14px', borderRadius: '0 0 8px 8px', fontSize: '0.7rem', fontWeight: 700 }}>MOST COMMON</div>
      )}
      <p style={{ color: BRAND.emeraldLight, fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>{tier}</p>
      <h3 style={{ color: BRAND.white, fontSize: '1.35rem', fontWeight: 700, marginBottom: 8 }}>{name}</h3>
      <p style={{ color: BRAND.muted, fontSize: '0.85rem', marginBottom: 20 }}>{description}</p>
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: '2rem', fontWeight: 800, color: BRAND.white }}>{setup}</span>
        <p style={{ color: BRAND.muted, fontSize: '0.8rem', marginTop: 4 }}>setup + {monthly}/mo monitoring</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ color: BRAND.white, fontSize: '0.8rem', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Build Deliverables</p>
        {buildDeliverables.map((item, i) => <CheckItem key={i}>{item}</CheckItem>)}
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ color: BRAND.white, fontSize: '0.8rem', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Monitoring Deliverables</p>
        {monitoringDeliverables.map((item, i) => <CheckItem key={i}>{item}</CheckItem>)}
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ color: BRAND.white, fontSize: '0.8rem', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Evidence Pack at Go-Live</p>
        {evidencePack.map((item, i) => <CheckItem key={i}>{item}</CheckItem>)}
      </div>

      <div style={{ background: 'rgba(148, 163, 184, 0.1)', borderRadius: 10, padding: '12px 16px', marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: BRAND.muted, fontSize: '0.85rem' }}>Human Response SLA</span>
          <span style={{ color: BRAND.emeraldLight, fontSize: '0.95rem', fontWeight: 700 }}>{responseSla}</span>
        </div>
      </div>
    </Card>
  );
}

function FitQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const questions = [
    { q: 'Do you have a developer on your team who can implement complex integrations?', options: ['Yes, in-house dev', 'We use contractors', 'No technical resources'] },
    { q: 'Which providers do you currently use?', options: ['Only Vapi/Retell/Twilio/Telnyx', 'Mix of supported + others', 'Mostly unsupported providers'] },
    { q: 'How soon do you need this running?', options: ['3+ months is fine', '1-2 months', 'ASAP (under 4 weeks)'] },
    { q: 'How do you prefer to manage infrastructure?', options: ['I want full control', 'Flexible either way', 'I want it managed for me'] },
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

  const reset = () => { setStep(0); setAnswers([]); setResult(null); };

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
              <a href="#diy-details" style={{ display: 'inline-block', padding: '14px 28px', background: BRAND.charcoal, color: BRAND.white, borderRadius: 12, textDecoration: 'none', fontWeight: 600, border: '1px solid ' + BRAND.cardBorder }}>View DIY Details</a>
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
              <p style={{ color: BRAND.muted, marginBottom: 24 }}>DIY if you want control. DFY if you would rather move fast.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="#diy-details" style={{ padding: '14px 24px', background: BRAND.charcoal, color: BRAND.white, borderRadius: 12, textDecoration: 'none', fontWeight: 600, border: '1px solid ' + BRAND.cardBorder }}>DIY Details</a>
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
        <div style={{ width: ((step + 1) / questions.length) * 100 + '%', height: '100%', background: BRAND.emeraldLight, transition: 'width 0.3s' }} />
      </div>
      <p style={{ color: BRAND.text, fontSize: '1.05rem', marginBottom: 24 }}>{questions[step].q}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {questions[step].options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(i)} style={{ width: '100%', textAlign: 'left', padding: '14px 18px', borderRadius: 12, border: '1px solid ' + BRAND.cardBorder, background: 'rgba(2, 6, 23, 0.5)', color: BRAND.text, fontSize: '0.95rem', cursor: 'pointer' }}>
            {opt}
          </button>
        ))}
      </div>
    </Card>
  );
}

export default function BillingOfferPage() {
  return (
    <main style={{ minHeight: '100vh', background: BRAND.deepBg, color: BRAND.text, fontFamily: 'system-ui, sans-serif' }}>

      {/* HEADER */}
      <section style={{ padding: '40px 20px 60px', borderBottom: '1px solid ' + BRAND.cardBorder }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <a href="/billing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: BRAND.emeraldLight, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, marginBottom: 24 }}>← Back to Overview</a>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: BRAND.white, margin: 0, marginBottom: 12 }}>Offer Details & Pricing</h1>
          <p style={{ color: BRAND.muted, fontSize: '1.1rem', maxWidth: 600, margin: 0 }}>Complete breakdown of deliverables, pricing tiers, acceptance criteria, and scope guardrails.</p>
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
                    <h4 style={{ color: BRAND.white, fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>What You Get:</h4>
                    <CheckItem>Complete Postgres schema + ledger specification</CheckItem>
                    <CheckItem>Workflow architecture maps (W1-W7)</CheckItem>
                    <CheckItem>Webhook handling rules + idempotency logic</CheckItem>
                    <CheckItem>Authorize + Usage Event API contracts</CheckItem>
                    <CheckItem>HMAC signing + replay protection specs</CheckItem>
                    <CheckItem>Test plan with edge case scenarios</CheckItem>
                    <CheckItem>Operational runbook</CheckItem>
                  </div>
                  <div>
                    <h4 style={{ color: BRAND.muted, fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>What You Do Not Get:</h4>
                    <CheckItem included={false}>Implementation assistance</CheckItem>
                    <CheckItem included={false}>Environment setup or debugging</CheckItem>
                    <CheckItem included={false}>Custom provider integrations</CheckItem>
                    <CheckItem included={false}>Ongoing support or monitoring</CheckItem>
                  </div>
                </div>
              </Card>
            </div>

            <Card style={{ background: 'linear-gradient(135deg, rgba(244, 208, 63, 0.08), rgba(15, 23, 42, 0.6))', borderColor: 'rgba(244, 208, 63, 0.3)' }}>
              <Badge variant="gold">Optional Add-on</Badge>
              <h3 style={{ color: BRAND.white, fontSize: '1.25rem', fontWeight: 700, marginTop: 12, marginBottom: 8 }}>AI IT Support</h3>
              <p style={{ color: BRAND.muted, fontSize: '0.85rem', marginBottom: 24, lineHeight: 1.6 }}>Bounded support that ONLY answers from the blueprint. Goes beyond scope? It says "Not in scope" and points to DFY.</p>
              <div style={{ borderTop: '1px solid rgba(244, 208, 63, 0.2)', paddingTop: 16 }}>
                {[{ time: '15 minutes', price: '$44' }, { time: '30 minutes', price: '$80' }, { time: '60 minutes', price: '$125' }].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(244, 208, 63, 0.1)' : 'none' }}>
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

              <Accordion title="See example: Workflow List (W1-W7)">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { name: 'W1: Stripe Invoice Paid -> Credit Grant', desc: 'Listens for invoice.paid webhook, validates Stripe signature, grants credits exactly once (idempotent), logs ledger entry.' },
                    { name: 'W2: Authorize Request Handler', desc: 'Receives /authorize calls, checks balance, reserves credits or denies with reason, logs attempt.' },
                    { name: 'W3: Usage Event Settler', desc: 'Processes /usage/events, validates HMAC, rejects replayed event_ids, settles against reservation, logs to ledger.' },
                    { name: 'W4: Auto-Refill Trigger', desc: 'Monitors balances, triggers Stripe charge at threshold, enforces cooldown window, records single top-up per window.' },
                    { name: 'W5: Payment Failed Handler', desc: 'Listens for charge.failed / payment_intent.payment_failed, pauses client services, fires alert.' },
                    { name: 'W6: Dispute Handler', desc: 'Listens for charge.dispute.created, pauses client, logs ledger marker, triggers alert.' },
                    { name: 'W7: Health Check + Alert Router', desc: 'Scheduled job that verifies all workflows ran, checks ledger invariants, reports failures.' },
                  ].map((w, i) => (
                    <div key={i} style={{ background: 'rgba(2, 6, 23, 0.5)', padding: 14, borderRadius: 10, border: '1px solid ' + BRAND.cardBorder }}>
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
          <SectionHeader tag="DFY" title="DFY Hosted Tiers" subtitle="We build and host your dedicated billing engine. Pricing includes setup + required monthly monitoring." />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
            <TierCard
              tier="Tier 1"
              name="DFY Core"
              setup="$12,500"
              monthly="$1,250"
              description="Single-tenant billing engine with essential automation and standard monitoring."
              buildDeliverables={[
                'Dedicated stack: n8n + Postgres + secrets (hosted by us)',
                'Core workflows W1-W7: Stripe webhooks, wallet credits, auto-refill, failure/dispute routing, health checks',
                'Security: Stripe signature verify, HMAC on /usage/events, replay protection (event_id + TTL), idempotency keys',
                'Alerting: Email + Telegram notifications',
              ]}
              monitoringDeliverables={[
                'Weekly health summary (automated)',
                'Alert on workflow failures',
                '24/7 automated detection + escalation',
              ]}
              evidencePack={[
                'End-to-end test run screenshots or logs',
                'Sample ledger export',
                'Webhook verification proof',
              ]}
              responseSla="48 hours"
            />

            <TierCard
              tier="Tier 2"
              name="DFY Hardened"
              setup="$25,000"
              monthly="$1,750"
              description="Enhanced reliability controls, integrity checks, and backup verification for higher-volume operations."
              highlighted
              buildDeliverables={[
                'Everything in Core, plus:',
                'Retry policies with exponential backoff',
                'Dead-letter queue handling for failed events',
                'Reconciliation job (daily ledger vs Stripe check)',
                'Key rotation procedure documented in runbook',
              ]}
              monitoringDeliverables={[
                'Everything in Core, plus:',
                'Daily ledger invariant checks',
                'Monthly ledger integrity report',
                'Monthly backup verification + restore drill evidence',
                'Change log of billing-engine modifications',
              ]}
              evidencePack={[
                'Everything in Core, plus:',
                'Reconciliation job output sample',
                'First backup restore drill evidence',
              ]}
              responseSla="24 hours"
            />

            <TierCard
              tier="Tier 3"
              name="DFY Production"
              setup="$37,700"
              monthly="$2,500"
              description="High-availability posture with on-call escalation and priority change windows for mission-critical billing."
              buildDeliverables={[
                'Everything in Hardened, plus:',
                'High-availability configuration (redundant services + automated recovery)',
                'On-call escalation routing for critical billing incidents',
                'Priority change window for urgent billing hotfixes',
              ]}
              monitoringDeliverables={[
                'Everything in Hardened, plus:',
                'Incident timeline report for critical events',
                'Exportable ledger reports (dashboard add-on quoted separately)',
              ]}
              evidencePack={[
                'Everything in Hardened, plus:',
                'HA configuration verification',
                'Escalation routing test evidence',
              ]}
              responseSla="4 hours"
            />
          </div>

          <div style={{ marginTop: 24, padding: 20, background: 'rgba(148, 163, 184, 0.08)', borderRadius: 12, border: '1px solid ' + BRAND.cardBorder }}>
            <p style={{ color: BRAND.muted, fontSize: '0.85rem', margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: BRAND.white }}>Note on availability:</strong> RPO/RTO targets are best-effort unless separately contracted. All tiers include 24/7 automated detection and alerting. Human response times are governed by the SLA column above—we do not have humans on-call around the clock for all tiers.
            </p>
          </div>
        </div>
      </section>

      {/* ACCEPTANCE CRITERIA */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionHeader tag="Acceptance" title="What 'Done' Means" subtitle="These are the testable conditions we verify before handoff. If any fail, we fix them before go-live." />

          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              <div>
                <h4 style={{ color: BRAND.white, fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>Credit & Ledger</h4>
                <CheckItem>Stripe invoice.paid creates credit grant ledger entry exactly once (idempotent)</CheckItem>
                <CheckItem>Ledger balance equals sum(credits - debits +/- adjustments) — invariant check passes</CheckItem>
                <CheckItem>Duplicate webhook delivery does not create duplicate ledger entries</CheckItem>
              </div>
              <div>
                <h4 style={{ color: BRAND.white, fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>Authorization</h4>
                <CheckItem>/authorize denies request when insufficient balance and logs the attempt</CheckItem>
                <CheckItem>/authorize reserves credits and returns approval with reservation ID</CheckItem>
                <CheckItem>/usage/events requires valid HMAC signature</CheckItem>
                <CheckItem>/usage/events rejects replayed event_ids (replay protection)</CheckItem>
              </div>
              <div>
                <h4 style={{ color: BRAND.white, fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>Refill & Failures</h4>
                <CheckItem>Auto-refill triggers at threshold and records single top-up per cooldown window</CheckItem>
                <CheckItem>charge.failed or payment_intent.payment_failed triggers client pause + alert</CheckItem>
                <CheckItem>Dispute event (charge.dispute.created) triggers pause + alert + ledger marker</CheckItem>
              </div>
              <div>
                <h4 style={{ color: BRAND.white, fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>Health & Monitoring</h4>
                <CheckItem>Daily/weekly health check job runs and reports failures</CheckItem>
                <CheckItem>Alerts fire to configured channels within 5 minutes of detection</CheckItem>
                <CheckItem>Test run evidence documented before handoff</CheckItem>
              </div>
            </div>
            <p style={{ color: BRAND.muted, fontSize: '0.8rem', marginTop: 24, marginBottom: 0, borderTop: '1px solid ' + BRAND.cardBorder, paddingTop: 16 }}>
              If you find a bug against any acceptance criterion within 30 days of go-live, we fix it at no additional charge.
            </p>
          </Card>
        </div>
      </section>

      {/* SCOPE GUARDRAILS */}
      <section style={{ padding: '80px 20px', background: 'rgba(15, 23, 42, 0.3)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionHeader tag="Scope" title="Scope Guardrails" subtitle="Hard boundaries to prevent misunderstandings. Read before you apply." />

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
                <p>Meters that cannot hit /authorize first</p>
                <p>Systems without deterministic usage events</p>
                <p>Bespoke "integrate anything" requests</p>
              </div>
            </Card>
          </div>

          {/* HARD SCOPE STATEMENT */}
          <Card style={{ marginTop: 20, background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
            <h3 style={{ color: '#F87171', fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Hard Scope Rules — No Exceptions</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: BRAND.text, fontSize: '0.9rem', lineHeight: 1.9 }}>
              <li><strong style={{ color: BRAND.white }}>Supported providers list is hard-scoped.</strong> If your provider is not listed, we cannot support it.</li>
              <li><strong style={{ color: BRAND.white }}>Custom meters only via standard /authorize + /usage/events.</strong> Your system must call our APIs with signed payloads.</li>
              <li><strong style={{ color: BRAND.white }}>If you cannot pre-authorize, you accept post-usage settlement.</strong> You must maintain credit buffers to cover usage before billing settles.</li>
              <li><strong style={{ color: BRAND.white }}>We do not build bespoke integrations.</strong> If it cannot meet the standard event API, it is not compatible.</li>
            </ul>
            <p style={{ color: BRAND.muted, fontSize: '0.8rem', marginTop: 16, marginBottom: 0 }}>These rules exist to protect delivery timelines and prevent scope creep. If you are unsure whether your setup qualifies, ask before you apply.</p>
          </Card>

          <Card style={{ marginTop: 20, background: 'linear-gradient(135deg, rgba(244, 208, 63, 0.08), rgba(15, 23, 42, 0.6))', borderColor: 'rgba(244, 208, 63, 0.25)' }}>
            <h3 style={{ color: BRAND.gold, fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>Custom Meter Rule</h3>
            <p style={{ color: BRAND.text, fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 12 }}>
              If your system can call <code style={{ background: 'rgba(244, 208, 63, 0.15)', padding: '2px 6px', borderRadius: 4, color: BRAND.gold }}>/authorize</code> before usage starts AND emit signed events to <code style={{ background: 'rgba(244, 208, 63, 0.15)', padding: '2px 6px', borderRadius: 4, color: BRAND.gold }}>/usage/events</code> after completion, we can track it.
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, color: BRAND.muted, fontSize: '0.85rem' }}>
              <li>HMAC-signed payloads (SHA-256)</li>
              <li>Unique event IDs for replay protection</li>
              <li>Deterministic, timestamped usage amounts</li>
            </ul>
            <p style={{ color: BRAND.muted, fontSize: '0.85rem', marginTop: 12 }}>If it cannot do this, it is not compatible.</p>
          </Card>
        </div>
      </section>

      {/* MONITORING */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionHeader tag="Monitoring" title="What Monitoring Covers" subtitle="Explicit list of what is included, what is excluded, and what you actually receive." />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <Card>
              <h3 style={{ color: BRAND.white, fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Monitoring Includes:</h3>
              <CheckItem>Workflow health checks (all W1-W7)</CheckItem>
              <CheckItem>24/7 automated detection + escalation</CheckItem>
              <CheckItem>Webhook delivery confirmation</CheckItem>
              <CheckItem>Failed payment alerts</CheckItem>
              <CheckItem>Refill trigger verification</CheckItem>
              <CheckItem>Ledger consistency checks</CheckItem>
              <CheckItem>Infrastructure uptime monitoring</CheckItem>
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

          {/* MONITORING DELIVERABLES */}
          <Card style={{ marginTop: 24 }}>
            <h3 style={{ color: BRAND.white, fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>Monitoring Deliverables You Will Actually Receive</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>📊</span>
                <div>
                  <h4 style={{ color: BRAND.white, fontSize: '0.9rem', fontWeight: 600, margin: 0, marginBottom: 4 }}>Weekly health summary</h4>
                  <p style={{ color: BRAND.muted, fontSize: '0.8rem', margin: 0 }}>Automated report: workflow pass/fail rates, error counts, uptime.</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>🚨</span>
                <div>
                  <h4 style={{ color: BRAND.white, fontSize: '0.9rem', fontWeight: 600, margin: 0, marginBottom: 4 }}>Refill/decline incident log</h4>
                  <p style={{ color: BRAND.muted, fontSize: '0.8rem', margin: 0 }}>Monthly report: every auto-refill attempt and payment failure.</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>📒</span>
                <div>
                  <h4 style={{ color: BRAND.white, fontSize: '0.9rem', fontWeight: 600, margin: 0, marginBottom: 4 }}>Ledger integrity report</h4>
                  <p style={{ color: BRAND.muted, fontSize: '0.8rem', margin: 0 }}>Monthly: confirms ledger balances reconcile with Stripe.</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>💾</span>
                <div>
                  <h4 style={{ color: BRAND.white, fontSize: '0.9rem', fontWeight: 600, margin: 0, marginBottom: 4 }}>Backup verification evidence</h4>
                  <p style={{ color: BRAND.muted, fontSize: '0.8rem', margin: 0 }}>Monthly: proof that backups completed and are restorable.</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>📝</span>
                <div>
                  <h4 style={{ color: BRAND.white, fontSize: '0.9rem', fontWeight: 600, margin: 0, marginBottom: 4 }}>Change log</h4>
                  <p style={{ color: BRAND.muted, fontSize: '0.8rem', margin: 0 }}>Monthly: list of billing-engine modifications made.</p>
                </div>
              </div>
            </div>
            <p style={{ color: BRAND.muted, fontSize: '0.8rem', marginTop: 20, marginBottom: 0, borderTop: '1px solid ' + BRAND.cardBorder, paddingTop: 16 }}>
              Monitoring is billing-engine-only, not your entire product. We monitor what we built; your other systems are your responsibility.
            </p>
          </Card>
        </div>
      </section>

      {/* IMPLEMENTATION TIMELINE */}
      <section style={{ padding: '80px 20px', background: 'rgba(15, 23, 42, 0.3)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <SectionHeader tag="Timeline" title="Implementation Phases" subtitle="We do not promise specific dates. We commit to phases with defined exit criteria." />

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, background: BRAND.cardBorder }} />
            {[
              { phase: 'Phase 1', title: 'Provision', desc: 'Spin up dedicated infrastructure. Configure database, n8n instance, and networking. Exit: you can access test environment.' },
              { phase: 'Phase 2', title: 'Wire Providers', desc: 'Connect your Stripe, voice, and SMS accounts. Configure webhooks and API keys. Exit: webhooks verified in test.' },
              { phase: 'Phase 3', title: 'Test', desc: 'End-to-end testing with your accounts. Verify authorize flow, settlement, refills, and failure handling. Exit: acceptance criteria pass.' },
              { phase: 'Phase 4', title: 'Go-Live', desc: 'Cutover to production. Monitor first billing cycle. Confirm all workflows firing. Exit: evidence pack delivered.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 24, marginBottom: 32, position: 'relative' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: BRAND.emerald, border: '4px solid ' + BRAND.deepBg, flexShrink: 0, zIndex: 1 }} />
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
      <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, ' + BRAND.emerald + ', ' + BRAND.emeraldLight + ')' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: BRAND.white, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: 16 }}>Ready to Stop Leaking Revenue?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: 32 }}>Grab the blueprint and self-implement, or apply for DFY and let us handle everything.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/billing#apply" style={{ padding: '16px 32px', background: BRAND.white, color: BRAND.emerald, fontWeight: 700, borderRadius: 12, textDecoration: 'none', fontSize: '1rem' }}>Apply for DFY Setup</a>
            <a href="#diy-details" style={{ padding: '16px 32px', background: 'rgba(255,255,255,0.15)', color: BRAND.white, fontWeight: 700, borderRadius: 12, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)', fontSize: '1rem' }}>Buy DIY Blueprint — $2,997</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '40px 20px', borderTop: '1px solid ' + BRAND.cardBorder, textAlign: 'center' }}>
        <p style={{ color: BRAND.muted, fontSize: '0.85rem', margin: 0 }}>© {new Date().getFullYear()} All In Digital. Billing Engine by AID.</p>
        <a href="/billing" style={{ color: BRAND.emeraldLight, fontSize: '0.85rem', marginTop: 8, display: 'inline-block' }}>Back to Overview</a>
      </footer>
    </main>
  );
}
```