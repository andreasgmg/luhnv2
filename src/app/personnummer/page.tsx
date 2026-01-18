import Generator from '../../components/Generator';

export const metadata = {
  title: 'Generera Svenska Personnummer | Luhn.se',
  description: 'Skapa giltiga, syntetiska svenska personnummer (SSN) med namn och adresser för testning. Validerade kontrollsiffror.',
  alternates: {
    canonical: 'https://luhn.se/personnummer',
  },
};

export default function Page() {
  return <Generator />;
}