import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { LoanProvider } from "@/context/LoanContext";
import { PortfolioSelector } from "@/components/PortfolioSelector";
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
  title: "LoanTracker Pro | Repayment & Forecast Tracker",
  description: "Track loan repayment, forecast variable interest rate changes, schedule prepayments (one-time, monthly, quarterly, yearly), and auto-calculate excess EMI principal reduction.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Loan Tracker",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <LoanProvider>
            <div className="bg-slate-950 border-b border-slate-800 text-slate-300 py-1.5 px-4 sm:px-6 lg:px-8 flex items-center justify-between z-50 relative">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">My Loan Portfolio</span>
              <PortfolioSelector />
            </div>
            {children}
          </LoanProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
