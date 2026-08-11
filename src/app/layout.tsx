import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  // Only 3 of 8 templates use font-mono, and always for small labels/badges,
  // never LCP text — not worth preloading on every page load like the body
  // font. Still self-hosted with display:swap, just fetched on-demand.
  preload: false,
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://webbinaja.com'),
  title: {
    template: '%s',
    default: 'Jasa Web 1 Hari',
  },
  description: 'SaaS Platform by Jasa Web 1 Hari',
  icons: {
    icon: '/logos.png',
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
