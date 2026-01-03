'use client';

import { useState } from 'react';

// ============ SMALL COMPONENTS ============

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-medium text-gray-800">{title}</span>
        <span className={`transform transition-transform ${open ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {open && <div className="p-4 bg-gray-50 border-t border-gray-200 text-gray-700">{children}</div>}
    </div>
  );
}

function CheckItem({ children, included = true }: { children: React.ReactNode; included?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      {included ? (
        <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-sm">✓</span>
      ) : (
        <span className="mt-0.5 w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0 text-sm">✗</span>
      )}
      <span className={included ? 'text-gray-700' : 'text-gray-400'}>{children}</span>
    </li>
  );
}

function PricingCard({
  tier,
  name,
  setup,
  monthly,
  description,
  features,
  highlighted = false
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
    <div className={`rounded-2xl p-6 ${highlighted ? 'border-2 border-emerald-500 bg-emerald-50/30 relative' : 'border-2 border-gray-200 bg-white'}`}>
      {highlighted && (
        <div className="absolute -top-3 right-6 px-3 py-1 bg-amber-400 text-gray-900 text-xs font-semibold rounded-full">Most Popular</div>
      )}
      <p className="text-sm font-medium text-emerald-600 mb-1">{tier}</p>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className="mb-4">
        <p className="text-3xl font-bold text-gray-900">{setup}</p>
        <p className="text-gray-500 text-sm">setup + {monthly}/mo monitoring</p>
      </div>
      <ul className="space-y-2 text-sm">
        {features.map((f, i) => <CheckItem key={i}>{f}</CheckItem>)}
      </ul>
    </div>
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
      options: ['Yes, in-house dev', 'We use contractors', 'No technical resources']
    },
    {
      q: 'Which providers do you currently use?',
      options: ['Only Vapi/Retell/Twilio/Telnyx', 'Mix of supported + others', 'Mostly unsupported providers']
    },
    {
      q: 'How soon do you need this running?',
      options: ['3+ months is fine', '1-2 months', 'ASAP (under 4 weeks)']
    },
    {
      q: 'How do you prefer to manage infrastructure?',
      options: ['I want full control', 'Flexible either way', 'I want it managed for me']
    }
  ];

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate result
      const score = newAnswers.reduce((sum, a) => sum + a, 0);
      if (score <= 3) {
        setResult('diy');
      } else if (score <= 6) {
        setResult('either');
      } else {
        setResult('dfy');
      }
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers([]);
    setResult(null);
  };

  if (result) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Recommendation</h3>
        {result === 'diy' && (
          <div>
            <p className="text-6xl mb-4">🛠️</p>
            <p className="text-lg font-semibold text-gray-800 mb-2">DIY Blueprint looks like a fit.</p>
            <p className="text-gray-600 mb-6">You have technical resources and time. The blueprint gives you everything you need to self-implement.</p>
            <a href="#diy-details" className="inline-block px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors">View DIY Details</a>
          </div>
        )}
        {result === 'dfy' && (
          <div>
            <p className="text-6xl mb-4">🚀</p>
            <p className="text-lg font-semibold text-gray-800 mb-2">DFY Hosted is your best path.</p>
            <p className="text-gray-600 mb-6">Limited dev resources + fast timeline = let us handle it. Apply and we'll scope your setup.</p>
            <a href="/billing#apply" className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">Apply for DFY</a>
          </div>
        )}
        {result === 'either' && (
          <div>
            <p className="text-6xl mb-4">⚖️</p>
            <p className="text-lg font-semibold text-gray-800 mb-2">Either option could work.</p>
            <p className="text-gray-600 mb-6">You're in the middle. DIY if you want control and can commit dev time. DFY if you'd rather move fast.</p>
            <div className="flex gap-4 justify-center">
              <a href="#diy-details" className="px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors">DIY Details</a>
              <a href="/billing#apply" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">Apply DFY</a>
            </div>
          </div>
        )}
        <button onClick={reset} className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline">Retake quiz</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Are You a Fit?</h3>
        <span className="text-sm text-gray-500">Question {step + 1} of {questions.length}</span>
      </div>
      <div className="mb-6">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
        </div>
      </div>
      <p className="text-lg text-gray-800 mb-6">{questions[step].q}</p>
      <div className="space-y-3">
        {questions[step].options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-gray-700"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============ MAIN PAGE ============

export default function BillingOfferPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* HEADER */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-16 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <a href="/billing" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Overview
          </a>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Offer Details & Pricing</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Complete breakdown of deliverables, pricing tiers, scope guardrails, and what's included in each option.
          </p>
        </div>
      </section>

      {/* FIT QUIZ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <FitQuiz />
        </div>
      </section>

      {/* DIY PRICING */}
      <section id="diy-details" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">DIY Blueprint</h2>
          <p className="text-gray-600 mb-10">For teams with technical resources who want to self-implement.</p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main DIY Card */}
            <div className="lg:col-span-2 border-2 border-gray-200 rounded-2xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-4xl font-bold text-gray-900">$2,997</p>
                  <p className="text-gray-500">one-time purchase</p>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">No support included</span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-4">What's Included:</h3>
              <ul className="space-y-3 mb-8">
                <CheckItem>Complete Postgres schema + ledger specification</CheckItem>
                <CheckItem>Workflow architecture maps (W1–W7)</CheckItem>
                <CheckItem>Webhook handling rules + idempotency logic</CheckItem>
                <CheckItem>Authorize + Usage Event API contracts</CheckItem>
                <CheckItem>HMAC signing + replay protection specs</CheckItem>
                <CheckItem>Test plan with edge case scenarios</CheckItem>
                <CheckItem>Operational runbook</CheckItem>
              </ul>

              <h3 className="font-semibold text-gray-900 mb-4">What's Excluded:</h3>
              <ul className="space-y-3">
                <CheckItem included={false}>Implementation assistance</CheckItem>
                <CheckItem included={false}>Environment setup or debugging</CheckItem>
                <CheckItem included={false}>Custom provider integrations</CheckItem>
                <CheckItem included={false}>Ongoing support or monitoring</CheckItem>
              </ul>
            </div>

            {/* AI Support Add-on */}
            <div className="border-2 border-amber-300 bg-amber-50/30 rounded-2xl p-6">
              <p className="text-sm font-medium text-amber-700 mb-2">Optional Add-on</p>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI IT Support</h3>
              <p className="text-gray-600 text-sm mb-6">
                Bounded support that ONLY answers from the blueprint documentation. If your question goes beyond scope, it will say "Not in scope" and point you to DFY.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-amber-200">
                  <span className="text-gray-700">15 minutes</span>
                  <span className="font-semibold text-gray-900">$44</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-amber-200">
                  <span className="text-gray-700">30 minutes</span>
                  <span className="font-semibold text-gray-900">$80</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">60 minutes</span>
                  <span className="font-semibold text-gray-900">$125</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">Purchased separately after blueprint delivery.</p>
            </div>
          </div>

          {/* Deliverable Examples */}
          <div className="mt-12 space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Deliverable Examples</h3>

            <Accordion title="See example: Ledger Entry JSON">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
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
              <p className="mt-3 text-sm text-gray-600">Every credit add, deduction, refund, and adjustment is logged with full traceability.</p>
            </Accordion>

            <Accordion title="See example: Workflow List (W1–W7)">
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-800">W1: Stripe Invoice Paid → Credit Grant</p>
                  <p className="text-sm text-gray-600">Listens for invoice.paid webhook, validates signature, grants credits to client wallet, logs ledger entry.</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-800">W2: Authorize Request Handler</p>
                  <p className="text-sm text-gray-600">Receives /authorize calls, checks balance, reserves credits, returns approval or denial with reason.</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-800">W3: Usage Event Settler</p>
                  <p className="text-sm text-gray-600">Processes /usage/events, validates HMAC, checks for replay, settles against reservation, logs to ledger.</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-800">W4: Auto-Refill Trigger</p>
                  <p className="text-sm text-gray-600">Monitors balances, triggers Stripe charge when threshold hit, handles success/failure states.</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-800">W5: Payment Failed Handler</p>
                  <p className="text-sm text-gray-600">Listens for charge.failed/payment_intent.failed, pauses client services, sends alerts.</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-800">W6: Dispute Handler</p>
                  <p className="text-sm text-gray-600">Listens for charge.dispute.created, pauses client, logs event, triggers review notification.</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-800">W7: Health Check + Alert Router</p>
                  <p className="text-sm text-gray-600">Scheduled workflow that verifies all other workflows ran, checks ledger consistency, routes alerts.</p>
                </div>
              </div>
            </Accordion>

            <Accordion title="See example: Alert Message">
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                <p className="text-amber-400">⚠️ PAYMENT FAILED ALERT</p>
                <p className="mt-2">Client: [REDACTED_CLIENT_NAME]</p>
                <p>Client ID: cli_xxxxxxxxxxxxx</p>
                <p>Event: charge.failed</p>
                <p>Amount: $250.00</p>
                <p>Failure Code: card_declined</p>
                <p>Timestamp: 2025-01-15T14:32:18Z</p>
                <p className="mt-2 text-gray-400">Action taken: Services paused. Client notified.</p>
                <p className="text-gray-400">Correlation ID: corr_xxxxxxxxxxxxx</p>
              </div>
              <p className="mt-3 text-sm text-gray-600">Alerts include all context needed to investigate without logging into multiple systems.</p>
            </Accordion>
          </div>
        </div>
      </section>

      {/* DFY PRICING */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">DFY Hosted Tiers</h2>
          <p className="text-gray-600 mb-10">We build and host your dedicated billing engine on our infrastructure.</p>

          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              tier="Tier 1"
              name="DFY Core"
              setup="$12,500"
              monthly="$1,250"
              description="Essential billing engine with standard configuration."
              features={[
                'Dedicated Postgres instance',
                'Core workflows (W1–W7)',
                'Supported providers only',
                'Basic alerting (Telegram/Email)',
                'Standard monitoring',
                '48hr response SLA'
              ]}
            />
            <PricingCard
              tier="Tier 2"
              name="DFY Hardened"
              setup="$25,000"
              monthly="$1,750"
              description="Enhanced security and resilience for higher volume."
              highlighted
              features={[
                'Everything in Core',
                'Database replication',
                'Enhanced retry logic',
                'Webhook signature verification',
                'Ledger audit reports',
                '24hr response SLA'
              ]}
            />
            <PricingCard
              tier="Tier 3"
              name="DFY Production"
              setup="$37,700"
              monthly="$2,500"
              description="Full production hardening for mission-critical operations."
              features={[
                'Everything in Hardened',
                'Multi-region failover',
                'Real-time dashboards',
                'Custom alert routing',
                'Quarterly business reviews',
                '4hr response SLA'
              ]}
            />
          </div>

          <p className="text-center text-gray-500 text-sm mt-8">
            All tiers include supported providers only. Custom meters via standard APIs quoted separately.
          </p>
        </div>
      </section>

      {/* SCOPE GUARDRAILS */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Scope Guardrails</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
              <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                Supported (v1)
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li><strong>Voice:</strong> Vapi, Retell</li>
                <li><strong>SMS:</strong> Twilio, Telnyx</li>
                <li><strong>Billing:</strong> Stripe</li>
                <li><strong>Custom Meters:</strong> Only via standard APIs</li>
              </ul>
            </div>

            <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm">✗</span>
                Not Supported
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li>Providers outside the supported list</li>
                <li>Meters that can't hit /authorize first</li>
                <li>Systems without deterministic usage events</li>
                <li>Bespoke "integrate anything" requests</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
            <h3 className="font-bold text-amber-800 mb-3">Custom Meter Rule</h3>
            <p className="text-gray-700">
              If your system can call <code className="bg-amber-100 px-1 rounded">/authorize</code> before usage starts AND emit signed events to <code className="bg-amber-100 px-1 rounded">/usage/events</code> after completion, we can track it. The integration must support:
            </p>
            <ul className="mt-3 space-y-1 text-gray-700 text-sm">
              <li>• HMAC-signed payloads (SHA-256)</li>
              <li>• Unique event IDs for replay protection</li>
              <li>• Deterministic, timestamped usage amounts</li>
            </ul>
            <p className="mt-3 text-gray-700 text-sm">
              If it can't do this, it's not compatible. We do not build bespoke integrations.
            </p>
          </div>
        </div>
      </section>

      {/* MONITORING INCLUDES/EXCLUDES */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">What Monitoring Covers</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Monitoring Includes:</h3>
              <ul className="space-y-3">
                <CheckItem>Workflow health checks (all W1–W7)</CheckItem>
                <CheckItem>Webhook delivery confirmation</CheckItem>
                <CheckItem>Failed payment alerts + escalation</CheckItem>
                <CheckItem>Refill trigger verification</CheckItem>
                <CheckItem>Ledger consistency audits</CheckItem>
                <CheckItem>Infrastructure uptime monitoring</CheckItem>
                <CheckItem>Error rate alerting</CheckItem>
                <CheckItem>Database backup verification</CheckItem>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Monitoring Excludes:</h3>
              <ul className="space-y-3">
                <CheckItem included={false}>Feature development or enhancements</CheckItem>
                <CheckItem included={false}>Provider account management</CheckItem>
                <CheckItem included={false}>Custom meter integrations</CheckItem>
                <CheckItem included={false}>Debugging your external systems</CheckItem>
                <CheckItem included={false}>Issues outside billing engine scope</CheckItem>
                <CheckItem included={false}>End-user support (your clients)</CheckItem>
                <CheckItem included={false}>Provider outage resolution</CheckItem>
                <CheckItem included={false}>Business logic changes</CheckItem>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* IMPLEMENTATION TIMELINE */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Implementation Phases</h2>
          <p className="text-gray-600 text-center mb-12">Timeline varies based on complexity. We don't promise specific dates—we commit to phases.</p>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 md:left-1/2 md:-translate-x-0.5" />

            {[
              { phase: 'Phase 1', title: 'Provision', desc: 'Spin up dedicated infrastructure. Configure database, n8n instance, and networking.' },
              { phase: 'Phase 2', title: 'Wire Providers', desc: 'Connect your Stripe, voice, and SMS accounts. Configure webhooks and API keys.' },
              { phase: 'Phase 3', title: 'Test', desc: 'End-to-end testing with your accounts. Verify authorize flow, settlement, refills, and failure handling.' },
              { phase: 'Phase 4', title: 'Go-Live', desc: 'Cutover to production. Monitor first billing cycle. Confirm all workflows firing correctly.' },
            ].map((item, i) => (
              <div key={i} className={`relative flex items-start gap-6 mb-8 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${i % 2 === 1 ? 'md:text-right' : ''}`}>
                  <div className={`bg-white border-2 border-gray-200 rounded-2xl p-6 ${i % 2 === 1 ? 'md:ml-auto' : ''} md:max-w-sm`}>
                    <span className="text-sm font-medium text-emerald-600">{item.phase}</span>
                    <h3 className="font-bold text-gray-900 text-lg mt-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm mt-2">{item.desc}</p>
                  </div>
                </div>
                <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow -translate-x-1/2 mt-6" />
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Stop Leaking Revenue?</h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Choose your path: grab the blueprint and self-implement, or apply for DFY and let us handle everything.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/billing#apply"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-700 font-semibold rounded-xl shadow-lg hover:bg-gray-50 transition-all"
            >
              Apply for DFY Setup
            </a>
            <a
              href="#diy-details"
              className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 text-white font-semibold rounded-xl border-2 border-emerald-400 hover:bg-emerald-400 transition-all"
            >
              Buy DIY Blueprint — $2,997
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 bg-gray-900 text-gray-400 text-sm text-center">
        <p>© {new Date().getFullYear()} All In Digital. Billing Engine by AID.</p>
        <p className="mt-2">
          <a href="/billing" className="hover:text-white transition-colors">Back to Overview</a>
        </p>
      </footer>
    </main>
  );
}