"use client";

export default function LandingOfferPage() {
  return (
    <main className="aid-offer-page">
      <style>{`
        :root {
          --emerald: #047857;
          --gold: #F4D03F;
          --charcoal: #0F172A;
          --bg-dark: #020617;
          --text-muted: #9CA3AF;
        }

        body {
          margin: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
          background: radial-gradient(circle at top, #022c22 0, #020617 55%, #000000 100%);
          color: #E5E7EB;
        }

        .aid-offer-page {
          min-height: 100vh;
        }

        .offer-wrapper {
          max-width: 960px;
          margin: 0 auto;
          padding: 40px 16px 80px;
        }

        .offer-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.6);
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 14px;
        }

        .offer-pill span {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 20%, #BBF7D0 0, #22C55E 40%, #166534 100%);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.7);
        }

        .offer-title {
          font-size: clamp(2.1rem, 3vw, 2.6rem);
          letter-spacing: -0.04em;
          margin: 0 0 10px;
        }

        .offer-highlight {
          background: linear-gradient(120deg, #F4D03F, #F9A826);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .offer-sub {
          max-width: 640px;
          font-size: 1rem;
          line-height: 1.6;
          color: #CBD5F5;
          margin-bottom: 20px;
        }

        .offer-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
          gap: 24px;
          margin-top: 24px;
        }

        @media (max-width: 900px) {
          .offer-grid {
            grid-template-columns: 1fr;
          }
        }

        .offer-card {
          border-radius: 18px;
          padding: 18px 16px 16px;
          background: radial-gradient(circle at top, rgba(15, 118, 110, 0.36), rgba(15, 23, 42, 0.96));
          border: 1px solid rgba(148, 163, 184, 0.6);
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.8);
        }

        .offer-card--light {
          background: radial-gradient(circle at top, rgba(24, 24, 27, 0.9), rgba(15, 23, 42, 0.98));
        }

        .section-label {
          font-size: 0.82rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .section-text {
          font-size: 0.96rem;
          color: #E5E7EB;
          margin-bottom: 10px;
        }

        .bullet-list {
          margin: 0;
          padding-left: 18px;
          font-size: 0.95rem;
          color: #E5E7EB;
        }

        .bullet-list li {
          margin-bottom: 4px;
        }

        .bullet-list li span {
          color: var(--text-muted);
        }

        .tag-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
          margin-bottom: 2px;
        }

        .tag {
          font-size: 0.78rem;
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          color: var(--text-muted);
        }

        .pricing-callout {
          margin-top: 10px;
          padding: 10px 11px;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.7);
          font-size: 0.95rem;
        }

        .pricing-callout strong {
          color: #F4D03F;
        }

        .two-column-list {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 10px;
          margin-top: 8px;
        }

        @media (max-width: 640px) {
          .two-column-list {
            grid-template-columns: 1fr;
          }
        }

        .mini-box {
          border-radius: 12px;
          padding: 9px 10px;
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.7);
          font-size: 0.9rem;
          color: #E5E7EB;
        }

        .mini-box strong {
          display: block;
          margin-bottom: 2px;
        }

        .note-text {
          font-size: 0.84rem;
          color: var(--text-muted);
          margin-top: 6px;
        }

        .footer-note {
          margin-top: 28px;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .footer-note span {
          color: #F4D03F;
        }
      `}</style>

      <div className="offer-wrapper">
        {/* Header / Hero */}
        <div className="offer-pill">
          <span />
          <div>All In Digital · AI Landing & Call Systems</div>
        </div>

        <h1 className="offer-title">
          Conversion-Optimized <span className="offer-highlight">AI Landing System</span>{" "}
          for Local & Service Businesses
        </h1>

        <p className="offer-sub">
          Simple, high-converting landing pages wired into live AI call flows. You get
          the leads, the tracked outcomes, and a system that can grow into advanced
          AI booking and sales — without having to touch the tech.
        </p>

        {/* Main Grid */}
        <div className="offer-grid">
          {/* Left: What you get */}
          <div className="offer-card">
            <div className="section-label">What you get</div>
            <div className="section-title">Your AI-Ready Landing Stack</div>
            <p className="section-text">
              This isn’t just a “pretty page.” It’s a lean, interactive landing system
              designed to:
            </p>
            <ul className="bullet-list">
              <li>Capture leads with clean, frictionless forms.</li>
              <li>
                Collect TCPA/FCC-compliant consent so you&apos;re protected when using AI
                or SMS.
              </li>
              <li>
                Push every lead into a live Google Sheet (shared with you) for visibility.
              </li>
              <li>
                Plug directly into AI call flows when you&apos;re ready — no redesign needed.
              </li>
            </ul>

            <div className="section-title" style={{ marginTop: 16 }}>
              Two ways to use it
            </div>

            <div className="two-column-list">
              <div className="mini-box">
                <strong>1. Leads Only</strong>
                <div>
                  We send all new leads straight into a shared Google Sheet in real time.
                  You (or your team) call, text, or plug it into your own system.
                </div>
              </div>
              <div className="mini-box">
                <strong>2. Leads + AI Calling</strong>
                <div>
                  Our AI calls new leads for you, updates outcomes in the same Google
                  Sheet, and can text calendar links to book appointments automatically.
                </div>
              </div>
            </div>

            <p className="note-text">
              If you only want the landing pages (no AI calling), you still keep the same
              tracking sheet — just without AI outcome updates.
            </p>
          </div>

          {/* Right: Pricing & structure */}
          <div className="offer-card offer-card--light">
            <div className="section-label">Investment</div>
            <div className="section-title">Landing Pages & Ongoing Support</div>

            <div className="pricing-callout">
              <strong>Setup: $2,600 (Buy 1, Get 3)</strong>
              <div>
                Up to 3 custom, on-brand landing pages built on the same AI-ready
                framework. Simple, fast, and wired for future automation.
              </div>
            </div>

            <div className="pricing-callout" style={{ marginTop: 10 }}>
              <strong>Ongoing: $197/mo for the first page</strong>
              <div>+ $98/mo for each additional page.</div>
              <div style={{ marginTop: 4 }}>
                Includes hosting, uptime, minor copy tweaks, basic maintenance, and
                keeping pages aligned with your current offers.
              </div>
            </div>

            <div className="section-title" style={{ marginTop: 14 }}>
              Optional AI Voice & SMS
            </div>
            <ul className="bullet-list">
              <li>
                AI minutes start at <strong>$53/mo</strong> (Starter Lite) for 160 minutes.
              </li>
              <li>
                SMS add-on starts at <strong>$8/mo</strong> for 50 SMS.
              </li>
              <li>
                You can also connect your own Twilio/Telnyx to control SMS costs.
              </li>
            </ul>

            <div className="tag-row">
              <div className="tag">AI calling optional</div>
              <div className="tag">TCPA/FCC-minded setup</div>
              <div className="tag">Lead + outcome tracking</div>
            </div>

            <div className="section-title" style={{ marginTop: 14 }}>
              Code Ownership (Optional)
            </div>
            <p className="section-text">
              If you ever want the full codebase for the pages:
            </p>
            <ul className="bullet-list">
              <li>$1,250 per page, or</li>
              <li>
                <span>
                  $800 per page if you&apos;ve stayed on the monthly plan for at least 6
                  months.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer note */}
        <div className="footer-note">
          Once this is live, you can layer in{" "}
          <span>advanced booking, no-show recovery, call-back agents, and full AI sales
          flows</span> on top of the same landing system — without starting over.
        </div>
      </div>
    </main>
  );
}
