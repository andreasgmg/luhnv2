import Generator from '../../components/Generator';

export const metadata = {
  title: 'Generera Bankkonto | Luhn.se',
  description: 'Validerade kontonummer med korrekta clearingserier för svenska banker.',
};

export default function Page() {
  return <Generator type="bank_account" />;
}
