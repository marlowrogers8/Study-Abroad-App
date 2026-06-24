import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Abroadly — Honest reviews for study abroad programs",
  description:
    "Abroadly is the transparent way to choose a study abroad program. Real, verified student reviews — never paid placements, never sponsored funnels. Compare programs on cost, safety, academics and outcomes.",
  keywords: [
    "study abroad",
    "study abroad reviews",
    "study abroad programs",
    "honest reviews",
    "compare study abroad",
  ],
  openGraph: {
    title: "Abroadly — Honest reviews for study abroad programs",
    description:
      "Real, verified student reviews. Never paid placements. Compare study abroad programs on what actually matters.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
