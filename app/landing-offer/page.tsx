export default function LandingOfferPage() {
  return (
    <main className="offer-page">
      <style>{`
        :root {
          --emerald: #047857;
          --gold: #F4D03F;
          --charcoal: #0F172A;
          --offwhite: #F9FAFB;
        }

        body {
          margin: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
          background: radial-gradient(circle at top, #022c22 0, #020617 55%, #000000 100%);
          color: #E5E7EB;
        }

        .offer-page {
          min-height: 100vh;
        }

        .offer-wrapper {
          max-width: 960px;
          margin: 0 auto;
          padding: 40px 16px 72px;
        }

        .offer-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          margin-bottom: 28px;
        }

        .offer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .offer-logo {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: radial-gradient(circle at 30% 20%, #6EE7B7 0, #047857 45%, #022c22 100%);
          box-shadow: 0 12px 28px rgba(5, 150, 105, 0.45);
        }

        .offer-brand-text {
          display: flex;
          flex-direction: column;
        }

        .offer-brand-name {
          font-weight: 700;
          letter-spacing: 0.08em;
          font-size: 0.95rem;
          text-transform: uppercase;
        }

        .offer-brand-tagline {
          font-size: 0.85rem;
          color: #9CA3AF;
        }

        .offer-pill {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          padding: 7px 16px;
          font-size: 0.86rem;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
        }

        .offer-card {
          border-radius: 22px;
          background: radial-gradient(circle at top left, rgba(4, 120, 87, 0.35), rgba(15, 23, 42, 0.96));
          border: 1px solid rgba(148, 163, 184, 0.4);
          box-shadow:
            0 26px 80px rgba(15, 23, 42, 0.9),
            0 0 0 1px rgba(15, 23, 42, 0.7);
          padding: 26px 22px 22px;
        }

        .offer-hero-title {
          font-size: clamp(2.1rem, 3vw, 2.6rem);
          line-height: 1.1;
          letter-spacing: -0.04em;
          margin: 0 0 10px;
        }

        .offer-highlight {
          background: linear-gradient(120deg, #F4D03F, #F9A826);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .offer-subtitle {
          font-size: 1rem;
          color: #CBD5F5;
          max-width: 680px;
          margin-bottom: 18px;
        }

        .offer-section {
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid rgba(148, 163, 184, 0.35);
        }

        .offer-section h2 {
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #9CA3AF;
          margin: 0 0 6px;
        }

        .offer-section h3 {
          font-size: 1.2rem;
          margin: 0 0 6px;
          color: #E5E7EB;
        }

        .offer-section p {
          font-size: 0.97rem;
          color: #CBD5F5;
          margin: 0 0 10px;
        }

        .offer-columns {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
          gap: 20px;
          margin-top: 8px;
        }

        @media (max-width: 840px) {
          .offer-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .offer-columns {
            grid-template-columns: 1fr;
          }

          .offer-card {
            padding: 20px 18px 18px;
          }
        }

        .offer-list {
          margin: 0;
          padding-left: 18px;
          font-size: 0.96rem;
          color: #E5E7EB;
        }

        .offer-list li {
          margin-bottom: 4px;
        }

        .offer-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 6px 0 10px;
        }

        .offer-chip {
          font-size: 0.8rem;
          border-radius: 999px;
          padding: 4px 9px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          color: #9CA3AF;
          background: rgba(15, 23, 42, 0.8);
        }

        .price-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 10px;
          margin-top: 10px;
        }

        @media (max-width: 640px) {
          .price-grid {
            grid-template-columns: 1fr;
          }
        }

        .price-card {
          border-radius: 14px;
          padding: 10px 12px 9px;
          background: rgba(15, 23, 42, 0.98);
          border: 1px solid rgba(148, 163, 184, 0.6);
          font-size: 0.94rem;
        }

        .price-card strong {
          display: block;
          font-size: 1rem;
          margin-bottom: 4px;
          color: #F4F4F5;
        }

        .price-note {
          font-size: 0.84rem;
          color: #9CA3AF;
          margin-top: 6px;
        }

        .callout {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px dashed rgba(148, 163, 184, 0.7);
          font-size: 0.9rem;
        }

        .callout span {
          color: #FBBF24;
          font-weight: 600;
        }

        .steps-list {
          margin: 8px 0 0;
          padding-left: 18px;
          font-size: 0.95rem;
        }

        .steps-list li {
          margin-bottom: 4px;
        }

        .footer-note {
          margin-top: 16px;
          font-size: 0.86rem;
          color: #9CA3AF;
        }
      `}</style>

      <div className="offer-wrapper">
        <header className="offer-header">
          <div className="offer-brand">
            <div className="offer-logo" />
            <div className="offer-brand-text">
              <div className="offer-brand-name">ALL IN DIGITAL</div>
              <div className="offer-brand-tagline">
                Conversion-Optimized AI Landing & Call Systems
              </div>
            </div>
          </div>
          <div className="offer-pill">
            Simple landing pages that plug into AI calls, SMS, and your existing marketing.
          </div>
        </header>

        <section className="offer-card">
          {/* Hero */}
          <h1 className="offer-hero-title">
            <span className="offer-highlight">
              Conversion-Optimized AI Landing System
            </span>
          </h1>
          <p className="offer-subtitle">
            A done-for-you landing + lead system designed to turn traffic into{" "}
            booked revenue — with or without AI calling attached on day one.
          </p>

          {/* Section 1 */}
          <div className="offer-section">
            <h2>01 · What you get</h2>
            <h3>
              A clean, interactive landing page system built for speed-to-lead and bookings.
            </h3>
            <div className="offer-columns">
              <div>
                <p>
                  This isn&apos;t a generic website. It&apos;s a focused, conversion-first
                  landing system built around the way you actually take calls and book
                  clients.
                </p>
                <ul className="offer-list">
                  <li>Conversion-optimized, mobile-first layout.</li>
                  <li>Clear, simple copy tailored to your offers.</li>
                  <li>Interactive elements that encourage engagement (not a dead brochure).</li>
                  <li>Lead capture form wired into a shared Google Sheet.</li>
                  <li>Optional demo / explainer section for AI calling.</li>
                </ul>
                <p className="price-note">
                  You can use these pages with your current team, your current follow-up
                  system, or with AI calling layered in when you&apos;re ready.
                </p>
              </div>
              <div>
                <div className="callout">
                  <span>Less noise, more signal.</span>  
                  Every element on the page exists to do one job: turn traffic into
                  qualified leads you can actually contact and close.
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="offer-section">
            <h2>02 · Lead flow & tracking</h2>
            <h3>Every lead flows into a live, shared Google Sheet.</h3>
            <div className="offer-columns">
              <div>
                <p>
                  When someone submits the form, their details are captured and routed into
                  a Google Sheet that we maintain for you.
                </p>
                <div className="offer-chip-row">
                  <div className="offer-chip">Name, email, phone</div>
                  <div className="offer-chip">Source & timestamp</div>
                  <div className="offer-chip">Notes / context fields</div>
                </div>
                <p>
                  From there, you or your team can call, text, or drop the lead into your
                  own CRM or follow-up system.
                </p>
              </div>
              <div>
                <p><strong>If AI is calling the leads for you:</strong></p>
                <ul className="offer-list">
                  <li>
                    You get the same live Google Sheet, <em>plus</em> outcome updates
                    (contacted, booked, bad fit, no answer, etc.).
                  </li>
                  <li>
                    That&apos;s part of what the monthly management fee covers when we&apos;re
                    running the AI side.
                  </li>
                </ul>
                <p className="price-note">
                  If you only want the landing + leads, you still get the shared sheet — just
                  without the AI outcome tracking.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="offer-section">
            <h2>03 · Investment & options</h2>
            <h3>Simple pricing that keeps ownership and flexibility in your hands.</h3>

            <div className="price-grid">
              <div className="price-card">
                <strong>Landing System Build · $2,600</strong>
                <ul className="offer-list">
                  <li>Buy one, get up to three focused landing pages.</li>
                  <li>Each page tuned for a specific offer, location, or audience.</li>
                  <li>Designed, built, and wired into your lead sheet.</li>
                </ul>
                <p className="price-note">
                  Perfect if you want a serious upgrade from &quot;generic website&quot; but
                  don&apos;t want to rebuild your entire brand.
                </p>
              </div>

              <div className="price-card">
                <strong>Hosting & Management · $197 + $98/page monthly</strong>
                <ul className="offer-list">
                  <li>Hosting and uptime included.</li>
                  <li>Minor copy tweaks and adjustments as your offer evolves.</li>
                  <li>Basic technical maintenance and small layout updates.</li>
                  <li>
                    Lead flow monitoring and live Google Sheet access (always up to date).
                  </li>
                </ul>
              </div>
            </div>

            <p className="price-note">
              Want full code ownership later? You can buy out the full codebase for a per-page fee.
              I&apos;ll package the entire GitHub setup for you when/if that makes sense.
            </p>

            <div className="callout">
              <span>AI calling & SMS are optional upsells.</span>  
              You can start with landing + leads only, and add AI booking, no-show recovery,
              or call-back flows once you&apos;ve seen the landing pages perform.
            </div>
          </div>

          {/* Section 4 */}
          <div className="offer-section">
            <h2>04 · Who this is a fit for</h2>
            <h3>Owners who care about speed, tracking, and real follow-up.</h3>
            <p>
              This system is built for local and service businesses that want clean, simple
              pages that actually convert — and a clear path to layer in AI when it&apos;s
              time:
            </p>
            <ul className="offer-list">
              <li>Med spas, dental, and health & wellness.</li>
              <li>Home services (HVAC, plumbing, electrical, roofing, etc.).</li>
              <li>Showrooms, retail, and appointment-driven businesses.</li>
              <li>Teams that already have ad traffic, but need better &quot;catch&quot; on the back end.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="offer-section">
            <h2>05 · Next steps</h2>
            <h3>We start simple and build from there.</h3>
            <p>
              I don&apos;t push full AI systems on day one. We start with a landing system
              that you can plug into your existing marketing and follow-up, then layer in AI
              where it clearly makes financial sense.
            </p>
            <ol className="steps-list">
              <li>Quick call to understand your offers, traffic sources, and booking flow.</li>
              <li>We map your first 1–3 landing pages and the lead sheet fields.</li>
              <li>I build and host the pages, wire the sheet, and send you a preview.</li>
              <li>
                You start sending traffic. When you&apos;re ready, we can discuss AI calling,
                SMS, and no-show recovery on top.
              </li>
            </ol>
            <p className="footer-note">
              Whether we end up using AI calling or not, you walk away with a clean,
              conversion-focused landing system and clear visibility on every lead that
              comes through it.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
