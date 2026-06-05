import "./globals.css";
import Navbar from "@/components/common/Navbar";

export const metadata = {
  title: "CloudBase | Your Digital Universe",
  description: "One-stop hub for Movies, Music, Apps, and Games.",
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
         {/* No external fonts or SVGs as per Senta's request */}
      </head>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
