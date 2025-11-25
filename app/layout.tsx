// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All In Digital – AI Workforce Automation",
  description:
    "AI agents for speed-to-lead, booking, no-show recovery, dispatch, and sales automation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
