import React from "react";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
    src: [
        { path: "../../public/fonts/geist-sans/Geist-Regular.woff2", weight: "400", style: "normal" },
        { path: "../../public/fonts/geist-sans/Geist-Bold.woff2", weight: "700", style: "normal" },
    ],
    variable: "--font-geist-sans",
    display: "swap",
});

const geistMono = localFont({
    src: [
        { path: "../../public/fonts/geist-mono/GeistMono-Regular.woff2", weight: "400", style: "normal" },
        { path: "../../public/fonts/geist-mono/GeistMono-Bold.woff2", weight: "700", style: "normal" },
    ],
    variable: "--font-geist-mono",
    display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
            <body className="antialiased min-h-screen flex flex-col font-sans">
                {children}
            </body>
        </html>
    );
}
