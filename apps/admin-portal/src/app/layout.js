import "./globals.css";
import QueryProvider from "@/components/admin/QueryProvider";

export const metadata = {
  title: "CloudBase Admin Console",
  description: "Secure backend admin management portal",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "CB Admin",
  },
};

export const viewport = {
  themeColor: '#8ab4f8',
};

export default function RootLayout({ children }) {
  return (
    <html data-scroll-behavior="smooth" lang="en" >
      <head>
        {/* head meta is handled automatically by Next.js metadata object */}
      </head>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
