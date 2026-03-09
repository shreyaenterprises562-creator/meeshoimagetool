import "./globals.css";
import type { ReactNode } from "react";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>

        {/* Monetag Ad Script */}
        <Script
          src="https://quge5.com/88/tag.min.js"
          data-zone="217509"
          strategy="afterInteractive"
        />

      </head>

      <body>{children}</body>
    </html>
  );
}