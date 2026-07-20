import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";

export const metadata: Metadata = {
  title: "TrustLens AI — Analyze Before You Trust",
  description:
    "AI-powered cyber safety platform to detect scams, phishing links, dangerous QR codes, and digital arrest scams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-20 pt-10">{children}</main>
      </body>
    </html>
  );
}
