import Generator from '../../components/Generator';

export const metadata = {
  title: 'Generera Bankgironummer | Luhn.se',
  description: 'Skapa giltiga svenska bankgironummer för test av betalsystem. Använder säkra testserier (998-xxxx).',
  alternates: {
    canonical: 'https://luhn.se/bankgiro',
  },
};

export default function Page() {
  return <Generator />;
}