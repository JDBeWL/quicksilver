import type { Metadata } from "next";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import { PluginProvider } from "@/lib/plugins";
import { PluginSlot } from "@/components/PluginSlot";
import "../globals.css";
import { i18n, type Locale } from "@/i18n-config";

const geistSans = localFont({
  src: [
    { path: "../../../public/fonts/geist-sans/Geist-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../../public/fonts/geist-sans/Geist-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: [
    { path: "../../../public/fonts/geist-mono/GeistMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../../public/fonts/geist-mono/GeistMono-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quicksilver",
  description: "Shape your story, your way.",
};

// Force dynamic rendering for root layout due to auth session usage in Navbar
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  // Return empty array to disable static generation since we're using force-dynamic
  return [];
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <PluginProvider>
          <Navbar lang={lang as Locale} />
          <main className="container mx-auto flex-1 flex flex-col">
            {children}
          </main>
          <PluginSlot name="footer-main" />
        </PluginProvider>
      </body>
    </html>
  );
}
