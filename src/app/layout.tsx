// app/layout.js
import "./globals.css";
import { SessionProvider } from "../components/SessionProvider";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import QueryProvider from '@/providers/QueryProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider >
          <SessionProvider>
           {children}
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
