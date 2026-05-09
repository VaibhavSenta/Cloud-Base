import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "../components/common/NavbarWrapper"; // Ek chota wrapper banayenge

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cloud-Base | Your Space",
  description: "Secure and fast cloud management",
};

export default function RootLayout({ children }) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Humne Navbar ko ek wrapper mein daal diya jo path check karega */}
        <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}