import Generator from '../../components/Generator';

export const metadata = {
  title: 'Validera Svenska Nummer & Konton | Luhn.se',
  description: 'Validera personnummer, organisationsnummer, momsnummer, bankgironummer och clearingnummer. Kontrollera checksummor och format.',
  alternates: {
    canonical: 'https://luhn.se/validator',
  },
};

export default function Page() {
  return <Generator />;
}