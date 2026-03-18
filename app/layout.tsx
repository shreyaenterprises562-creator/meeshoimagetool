import "./globals.css";
import type { ReactNode } from "react";
import Script from "next/script";

export const metadata = {
  title: "Free Meesho Shipping Image Generator | Optaimager",
  description:
    "Generate Meesho catalog images that reduce shipping charges. Free Meesho shipping image generator tool to create optimized product images instantly.",
  keywords: [
    "free meesho shipping image generator",
    "meesho low shipping image",
    "reduce meesho shipping charges image",
    "meesho catalog image generator",
    "meesho product image optimizer",
  ],

  openGraph: {
    title: "Free Meesho Shipping Image Generator",
    description:
      "Create optimized Meesho catalog images that help reduce shipping charges.",
    siteName: "Optaimager",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="DtFvLhIyCpaiJP9_ZS2WVeDsuWd15GsfJixU2V0lN4g"
        />
      </head>

      <body>
        {children}

        {/* Monetag Ad Script */}
        <Script
          src="https://quge5.com/88/tag.min.js"
          data-zone="217509"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}