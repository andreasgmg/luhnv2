import Generator from '../../components/Generator';

export const metadata = {
  title: 'Svensk Testdata API | Luhn.se',
  description: 'Gratis API för utvecklare för att generera personnummer, bankgiro och organisationsnummer. Integrationsguide och exempel.',
  alternates: {
    canonical: 'https://luhn.se/api-docs',
  },
};

export default function Page() {
  return <Generator />;
}