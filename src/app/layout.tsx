// app/layout.js
import "./globals.css";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import QueryProvider from '@/providers/QueryProvider';
import ClientProviders from "./ClientProviders";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider >
          <ClientProviders>{children}</ClientProviders>
        </QueryProvider>
      </body>
    </html>
  );
}
