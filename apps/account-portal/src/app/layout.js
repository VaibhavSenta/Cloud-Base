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
  title: "Cloud-Base Account",
  description: "Manage your security, privacy, and preferences to make Cloud-Base work better for you.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CB Account",
    startupImage: [
      {
        url: "/splash/iphone_splash.png",
        media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)", // iPhone 15 Pro, 15, 14 Pro
      },
      {
        url: "/splash/iphone_splash.png",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)", // iPhone 15 Pro Max, 15 Plus, 14 Pro Max
      },
      {
        url: "/splash/iphone_splash.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)", // iPhone SE, 8, 7
      }
    ]
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  }
};

export const viewport = {
  themeColor: "#000000",
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
