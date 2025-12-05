// app/landing-offer/page.tsx

"use client"; // keep if you use hooks, forms, etc. If it's 100% static you can delete this line.

export default function LandingOfferPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="max-w-3xl px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4">
          Your Landing Offer Headline
        </h1>
        <p className="text-base md:text-lg opacity-80">
"use client";

export default function Page() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #022c22 0, #020617 55%, #000000 100%)",
        color: "#E5E7EB",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "40px 16px 80px",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background:
                  "radial-gradient(circle at 30% 20%, #6EE7B7 0, #047857 45%, #022c22 100%)",
                boxShadow: "0 12px 28px rgba(5,150,105,0.45)",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  fontSize: "0.9rem",
                }}
              >
                ALL IN DIGITAL
              </div>
              <div
                style={{ fontSize: "0.85rem", color: "#9CA3AF" }}
              >
                AI-Ready Landing Systems
              </div>
            </div>
          </div>
          <div
            style={{
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.6)",
              padding: "6px 14px",
              fontSize: "0.9rem",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(15,23,42,0.7)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 999,
                background:
                  "radial-gradient(circle at 30% 20%, #BBF7D0 0, #22C55E 40%, #166534 100%)",
                boxShadow: "0 0 10px rgba(34,197,94,0.7)",
              }}
            />
            <span>AI-ready, done-for-you landing system</span>
          </div>
        </header>

        {/* Hero */}
        <section
          style={{
            borderRadius: 24,
            padding: "28px 22px 24px",
            background:
              "radial-gradient(circle at top left, rgba(4,120,87,0.4), rgba(15,23,42,0.95))",
            border: "1px solid rgba(148,163,184,0.35)",
            boxShadow:
              "0 24px 80px rgba(15,23,42,0.85), 0 0 0 1px rgba(15,23,42,0.7)",
            marginBottom: 28,
          }}
        >
          <h1
            style={{
              fontSize: "2.1rem",
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
              margin: "0 0 10px",
            }}
          >
            AI-Ready Landing System
          </h1>
          <p
            style={{
              fontSize: "1.02rem",
              color: "#CBD5F5",
              maxWidth: 640,
              marginBottom: 8,
            }}
          >
            High-converting pages + instant lead delivery + optional AI call
            follow-up. You get a small, focused system that turns traffic into
            clean, usable leads—and can plug directly into AI callers when
            you&apos;re ready.
          </p>
          <p
            style={{
              fontSize: "0.92rem",
              color: "#9CA3AF",
            }}
          >
            Built in your brand, using conversion-focused layouts and FCC/TCPA
            conscious consent language so you can attach AI safely later.
          </p>
        </section>

        {/* Main content */}
        <section
          style={{
            display: "grid",
            gap: 22,
          }}
        >
          {/* What You Get */}
          <div
            style={{
              borderRadius: 18,
              padding: 18,
              background:
                "radial-gradient(circle at top, rgba(15,118,110,0.35), rgba(15,23,42,0.98))",
              border: "1px solid rgba(148,163,184,0.55)",
              boxShadow: "0 20px 60px rgba(15,23,42,0.75)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "1.1rem" }}>
              What You&apos;re Getting
            </h2>
            <p
              style={{
                fontSize: "0.96rem",
                color: "#E5E7EB",
                marginTop: 0,
                marginBottom: 10,
              }}
            >
              Each page is built to do one job really well: turn traffic into
              clean, usable leads you can act on immediately.
            </p>
            <ul
              style={{
                listStyle: "disc",
                paddingLeft: 20,
                fontSize: "0.94rem",
                color: "#E5E7EB",
                display: "grid",
                gap: 6,
              }}
            >
              <li>
                <strong>Conversion-focused layout</strong> with simple,
                focused messaging and clear calls-to-action.
              </li>
              <li>
                <strong>Interactive elements</strong> that encourage visitors
                to engage instead of skim and leave.
              </li>
              <li>
                <strong>FCC/TCPA-conscious consent text</strong> on forms so
                you&apos;re covered if/when we attach AI calling or SMS.
              </li>
              <li>
                <strong>Speed-to-lead friendly form</strong> that captures
                name, phone, email, and segmentation fields.
              </li>
              <li>
                <strong>Real-time Google Sheet feed</strong> with every lead,
                ready for your team—or AI—to follow up.
              </li>
              <li>
                <strong>Hosting &amp; reliability handled for you</strong> so
                you don&apos;t need to manage servers or SSL.
              </li>
            </ul>
          </div>

          {/* Pricing & Structure */}
          <div
            style={{
              borderRadius: 18,
              padding: 18,
              background:
                "radial-gradient(circle at top, rgba(24,24,27,0.9), rgba(15,23,42,0.98))",
              border: "1px solid rgba(148,163,184,0.6)",
              boxShadow: "0 20px 60px rgba(15,23,42,0.75)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "1.1rem" }}>
              The Offer: Buy 1, Get 3 Pages
            </h2>
            <p
              style={{
                fontSize: "0.96rem",
                color: "#E5E7EB",
                marginTop: 0,
                marginBottom: 10,
              }}
            >
              You&apos;re not just buying a single page. You&apos;re getting a
              small landing system.
            </p>
            <div
              style={{
                borderRadius: 14,
                padding: 12,
                background:
                  "linear-gradient(135deg, rgba(244,208,63,0.12), rgba(4,120,87,0.4))",
                border: "1px solid rgba(244,208,63,0.5)",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#F4D03F",
                  marginBottom: 4,
                }}
              >
                One-time build fee
              </div>
              <div
                style={{
                  fontSize: "1.08rem",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                $2,600 total – buy 1, get 3 pages
              </div>
              <div style={{ fontSize: "0.9rem", color: "#E5E7EB" }}>
                Up to three coordinated landing pages for the same brand/offer:
                a main page, an alternate angle, and/or a retargeting page.
              </div>
            </div>

            <div
              style={{
                borderRadius: 14,
                padding: 12,
                background: "rgba(15,23,42,0.96)",
                border: "1px solid rgba(148,163,184,0.7)",
              }}
            >
              <div
                style={{
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#9CA3AF",
                  marginBottom: 4,
                }}
              >
                Ongoing support & management
              </div>
              <div
                style={{
                  fontSize: "0.98rem",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                $197/month for your first page  
                <br />
                +$98/month per additional page
              </div>
              <div
                style={{ fontSize: "0.9rem", color: "#E5E7EB" }}
              >
                Covers hosting, uptime, minor copy tweaks, technical
                maintenance, consent language updates, and maintaining your
                Google Sheet lead feed.
              </div>
            </div>
          </div>

          {/* Option A vs B */}
          <div
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            <div
              style={{
                borderRadius: 18,
                padding: 16,
                background: "rgba(15,23,42,0.96)",
                border: "1px solid rgba(148,163,184,0.7)",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: 6,
                  fontSize: "1.02rem",
                }}
              >
                Option A – Landing System Only
              </h3>
              <p
                style={{
                  fontSize: "0.94rem",
                  color: "#E5E7EB",
                  marginTop: 0,
                }}
              >
                Use your own team and tools to work the leads.
              </p>
              <ul
                style={{
                  listStyle: "disc",
                  paddingLeft: 20,
                  fontSize: "0.9rem",
                  color: "#E5E7EB",
                  display: "grid",
                  gap: 4,
                }}
              >
                <li>
                  You get the 3-page landing system, live Google Sheet feed, and
                  full hosting/maintenance.
                </li>
                <li>
                  Your team or existing agency handles calling, texting, and
                  sales using your current CRM or dialer.
                </li>
                <li>No AI minutes or SMS usage required.</li>
              </ul>
            </div>

            <div
              style={{
                borderRadius: 18,
                padding: 16,
                background:
                  "radial-gradient(circle at top, rgba(30,64,175,0.3), rgba(15,23,42,0.98))",
                border: "1px solid rgba(129,140,248,0.7)",
                boxShadow: "0 20px 60px rgba(30,64,175,0.55)",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: 6,
                  fontSize: "1.02rem",
                }}
              >
                Option B – Landing + AI Call System
              </h3>
              <p
                style={{
                  fontSize: "0.94rem",
                  color: "#E5E7EB",
                  marginTop: 0,
                  marginBottom: 6,
                }}
              >
                Everything in Option A, plus an AI agent that can call or
                answer leads for you.
              </p>
              <ul
                style={{
                  listStyle: "disc",
                  paddingLeft: 20,
                  fontSize: "0.9rem",
                  color: "#E5E7EB",
                  display: "grid",
                  gap: 4,
                }}
              >
                <li>
                  AI demo/booking agent (Thoughtly) wired into your landing
                  system.
                </li>
                <li>
                  Speed-to-lead: new form submissions can trigger outbound AI
                  calls (once configured).
                </li>
                <li>
                  Google Sheet upgraded with call outcomes: called, no answer,
                  booked, not qualified, etc.
                </li>
                <li>
                  AI voice minutes & SMS billed separately based on usage
                  (starter voice & SMS plans available, or connect your own
                  Twilio/Telnyx).
                </li>
              </ul>
            </div>
          </div>

          {/* Code ownership & next steps */}
          <div
            style={{
              borderRadius: 18,
              padding: 16,
              background: "rgba(15,23,42,0.96)",
              border: "1px solid rgba(148,163,184,0.7)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: 6,
                fontSize: "1.02rem",
              }}
            >
              Code Ownership & Next Steps
            </h3>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#E5E7EB",
                marginTop: 0,
                marginBottom: 6,
              }}
            >
              By default, I host and manage everything for you. If you ever
              want the full codebase:
            </p>
            <ul
              style={{
                listStyle: "disc",
                paddingLeft: 20,
                fontSize: "0.9rem",
                color: "#E5E7EB",
                marginBottom: 8,
                display: "grid",
                gap: 4,
              }}
            >
              <li>$1,250 per page for a full code handoff.</li>
              <li>
                Or $800 per page if you&apos;ve been on the monthly plan for 6+
                months.
              </li>
            </ul>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#9CA3AF",
                marginTop: 0,
              }}
            >
              From there you can bring it all in-house or hand it to your own
              dev team whenever you&apos;re ready.
            </p>
          </div>

          <div
            style={{
              borderRadius: 18,
              padding: 16,
              background:
                "radial-gradient(circle at top, rgba(4,120,87,0.4), rgba(15,23,42,0.98))",
              border: "1px solid rgba(148,163,184,0.7)",
              textAlign: "left",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: 6,
                fontSize: "1.02rem",
              }}
            >
              What Happens Next
            </h3>
            <ol
              style={{
                paddingLeft: 20,
                fontSize: "0.9rem",
                color: "#E5E7EB",
                display: "grid",
                gap: 4,
              }}
            >
              <li>
                We map your offer, audiences, and what &quot;success&quot;
                means (bookings, visits, consults, etc.).
              </li>
              <li>
                I build and launch up to three coordinated landing pages, wired
                into a shared Google Sheet with live test submissions.
              </li>
              <li>
                You choose: keep it as a clean lead engine (Option A) or attach
                AI calling and no-show recovery when you&apos;re ready
                (Option B).
              </li>
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}

        </p>
      </div>
    </main>
  );
}
