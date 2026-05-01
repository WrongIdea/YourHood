import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "YourHood — Community Notice Board",
  description:
    "Stay informed about safety alerts, service outages, lost & found, and community announcements in your neighbourhood.",
  openGraph: {
    title: "YourHood — Community Notice Board",
    description: "Your digital neighbourhood watch and bulletin board.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-screen bg-[#09090b] text-zinc-200 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
