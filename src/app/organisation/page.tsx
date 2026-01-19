import Generator from '../../components/Generator';

export const metadata = {
  title: 'Generera Organisationsnummer | Luhn.se',
  description: 'Skapa giltiga organisationsnummer och momsnummer för företagstester.',
};

export default function Page() {
  return <Generator type="company" />;
}
