import "./globals.css";
import QueryProvider from "@/components/admin/QueryProvider";

export const metadata = {
  title: "CloudBase Admin Console",
  description: "Secure backend admin management portal",
};

export default function RootLayout({ children }) {
  return (
    <html data-scroll-behavior="smooth" lang="en" >
      <head>
        {/* 🚀 ULTIMATE BFCache KILLER: Forced Reload on Restore */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            function checkBFCache() {
              var entries = performance.getEntriesByType('navigation');
              if (entries.length > 0 && entries[0].type === 'back_forward') {
                window.location.reload();
              }
            }
            window.addEventListener('pageshow', function(event) {
              if (event.persisted) {
                window.location.reload();
              } else {
                checkBFCache();
              }
            });
            window.onunload = function() {};
          })();
        `}} />
      </head>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}