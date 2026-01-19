import Generator from '../../components/Generator';

export const metadata = {
  title: 'Generera Samordningsnummer | Luhn.se',
  description: 'Testdata för individer med samordningsnummer (Dag + 60).',
};

export default function Page() {
  return <Generator type="samordningsnummer" />;
}
