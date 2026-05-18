import "./globals.css";
import QueryProvider from "@/components/admin/QueryProvider";

export const metadata = {
  title: "CloudBase Admin Console",
  description: "Secure backend admin management portal",
};

export default function RootLayout({ children }) {
  return (
    <html data-scroll-behavior="smooth" lang="en" >
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}