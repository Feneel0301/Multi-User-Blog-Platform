import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";

// Configure the headline typography
const headingFont = Montserrat({ 
  subsets: ["latin"], 
  variable: "--font-heading",
  weight: ["600", "700", "800"]
});

// Configure the clean body typography
const bodyFont = Poppins({ 
  subsets: ["latin"], 
  variable: "--font-body",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "Corporate Engineering Hub",
  description: "Premium technical insights and architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} font-sans antialiased bg-[#0A1F44] text-slate-50 min-h-screen selection:bg-white/20`}>
        <main className="relative z-10">
          {children}
        </main>
        {/* Cinematic gradient overlay for depth */}
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/40 via-[#0A1F44]/80 to-[#0A1F44]"></div>
      </body>
    </html>
  );
}