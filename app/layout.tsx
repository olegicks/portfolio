import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const description =
  "Computer science student at the University of Vienna building ML apps, cloud tooling and security pipelines.";

export const metadata: Metadata = {
  title: "Oleh Shynkaryk | Portfolio",
  description,
  authors: [{ name: "Oleh Shynkaryk", url: "https://github.com/olegicks" }],
  openGraph: {
    type: "website",
    title: "Oleh Shynkaryk | Portfolio",
    description,
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1b2e",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a
          href="#projects"
          className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-full bg-signal px-4 py-2 text-sm font-medium text-night transition-transform focus-visible:translate-y-0"
        >
          Skip to projects
        </a>
        {/* The hero waits for its intro script; without JavaScript, show it as is */}
        <noscript>
          <style>{"#hero{visibility:visible!important}"}</style>
        </noscript>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
