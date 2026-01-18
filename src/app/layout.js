import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL('https://luhn.se'),
  title: {
    default: 'Luhn.se | Officiell Generator för Svensk Testdata',
    template: '%s | Luhn.se'
  },
  description: 'Generera giltiga, GDPR-säkra svenska personnummer, samordningsnummer, organisationsnummer och bankgironummer för systemtestning. Validera clearingnummer och bankkonton.',
  keywords: [
    'Personnummer', 'Samordningsnummer', 'Organisationsnummer', 'Bankgiro', 
    'Svensk Testdata', 'Mock Data', 'GDPR', 'Luhn-algoritm', 
    'Validerare', 'Clearingnummer', 'Testpersonnummer', 'Skatteverket'
  ],
  authors: [{ name: 'Luhn.se' }],
  creator: 'Luhn.se',
  publisher: 'Luhn.se',
  openGraph: {
    title: 'Luhn.se - Officiell Svensk Testdata',
    description: 'Utvecklarverktyget för att generera och validera svenska identitets- och finansiella nummer.',
    url: 'https://luhn.se',
    siteName: 'Luhn.se',
    locale: 'sv_SE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luhn.se - Svensk Testdata',
    description: 'Generera och validera svenska personnummer, organisationsnummer och mer.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Luhn.se',
    'applicationCategory': 'DeveloperApplication',
    'operatingSystem': 'Web',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'SEK'
    },
    'description': 'Ett verktyg för att generera och validera svenska personnummer och finansiell data (Bankgiro, Plusgiro).',
    'featureList': 'Generera Personnummer, Validera Organisationsnummer, Kontrollera Bankgiro'
  };

  return (
    <html lang='sv' className="h-full w-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} h-full w-full bg-white text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}