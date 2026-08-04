import "./globals.css";
import AdminLayout from "@/components/AdminLayout/Component";
import QueryProvider from "@/components/admin/QueryProvider";
import DevToolsGuard from "@/components/Providers/DevToolsGuard";

export const metadata = {
  title: "CloudBase Admin Console",
  description: "Secure backend admin management portal",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: "CB Admin",
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  }
};

export const viewport = {
  themeColor: '#0f0f0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html data-scroll-behavior="smooth" lang="en" >
      <head>
        <link rel="apple-touch-icon" href="/icons/logo-dark.jpeg" />
        {/* head meta is handled automatically by Next.js metadata object */}
      </head>
      <body>
        <QueryProvider>
          <DevToolsGuard>
            <AdminLayout>
              {children}
            </AdminLayout>
          </DevToolsGuard>
        </QueryProvider>
      </body>
    </html>
  );
}
