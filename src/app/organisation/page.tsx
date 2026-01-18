import Generator from '../../components/Generator';

export const metadata = {
  title: 'Generera Organisationsnummer | Luhn.se',
  description: 'Skapa giltiga svenska organisationsnummer och momsnummer (VAT) för företag. Syntetiska företagsnamn för säker testning.',
  alternates: {
    canonical: 'https://luhn.se/organisation',
  },
};

export default function Page() {
  return <Generator />;
}