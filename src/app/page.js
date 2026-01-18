import Generator from '../components/Generator';

export const metadata = {
  title: 'Generera Personnummer | Luhn.se',
  description: 'Gratis verktyg för att generera giltiga svenska personnummer, samordningsnummer och organisationsnummer för systemtestning. GDPR-säker testdata.',
};

export default function Home() {
  return <Generator />;
}