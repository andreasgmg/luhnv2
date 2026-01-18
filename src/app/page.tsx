import Generator from '../components/Generator';

export const metadata = {
  title: 'Luhn.se | Svensk Testdata & Validering för Utvecklare',
  description: 'Det kompletta verktyget för att generera och validera svenska personnummer, organisationsnummer och bankuppgifter. Gratis API och GDPR-säkert.',
  alternates: {
    canonical: 'https://luhn.se',
  },
};

export default function Home() {
  return <Generator />;
}