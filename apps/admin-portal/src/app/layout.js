import "./globals.css";
import QueryProvider from "@/components/admin/QueryProvider";

export const metadata = {
  title: "CloudBase Admin Console",
  description: "Secure backend admin management portal",
  manifest: '/manifest.json',
  themeColor: '#8ab4f8',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "CB Admin",
  },
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
