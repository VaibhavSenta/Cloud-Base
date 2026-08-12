/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import "@/utils/errorLogger";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/Providers/QueryProvider";
import DevToolsGuard from "@/components/Providers/DevToolsGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Nothing Box Chat",
  description: "Secure workspace messenger module.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    title: "Nothing Box Chat",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <DevToolsGuard>
            {children}
          </DevToolsGuard>
        </QueryProvider>
      </body>
    </html>
  );
}
