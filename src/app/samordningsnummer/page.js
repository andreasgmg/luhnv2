import Generator from '../../components/Generator';

export const metadata = {
  title: 'Generera Samordningsnummer | Luhn.se',
  description: 'Generera giltiga samordningsnummer för testning. Följer Skatteverkets format för individer utan personnummer.',
  alternates: {
    canonical: 'https://luhn.se/samordningsnummer',
  },
};

export default function Page() {
  return <Generator />;
}