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
          This is a placeholder for your landing-offer content. Once the build
          passes, replace this block with the real section you meant to add.
        </p>
      </div>
    </main>
  );
}
