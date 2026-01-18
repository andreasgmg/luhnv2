import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Luhn.se | Svensk Testdata & Validering",
  description: "Sveriges mest kompletta verktyg för att generera och validera testdata. Personnummer, organisationsnummer, bankkonton och mer.",
  keywords: "personnummer, testdata, luhn, organisationsnummer, bankgiro, ocr, validering, utvecklare",
  authors: [{ name: "Luhn.se" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  alternates: {
    canonical: "https://luhn.se",
  },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: "https://luhn.se",
    title: "Luhn.se | Svensk Testdata & Validering",
    description: "Generera och validera svensk testdata programmatiskt.",
    siteName: "Luhn.se",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Luhn.se",
              "url": "https://luhn.se",
              "description": "Svensk testdata för utvecklare",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://luhn.se/validator?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
