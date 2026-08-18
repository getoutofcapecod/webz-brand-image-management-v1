import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brand Image Management | Webz.io News Search API",
  description:
    "Track negative news coverage for companies, brands, products, and topics with the Webz.io News Search API.",
};

export const viewport: Viewport = {
  themeColor: "#dc2626",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {children}
        <footer className="border-t border-zinc-200 py-6 dark:border-zinc-800">
          <div className="mx-auto max-w-4xl px-4 text-xs text-zinc-500 sm:px-6 dark:text-zinc-400">
            Demo app for the{" "}
            <a
              href="https://webz.io/products/news-api/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-zinc-300 underline-offset-2 transition hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:decoration-zinc-700 dark:hover:text-red-400 dark:focus-visible:ring-offset-zinc-950"
            >
              Webz.io News Search API
            </a>
            . Code is an example only; not affiliated with or endorsed by Webz.io.
          </div>
        </footer>
      </body>
    </html>
  );
}
