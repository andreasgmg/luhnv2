import Generator from '../../components/Generator';

export const metadata = {
  title: 'Generera Registreringsnummer | Luhn.se',
  description: 'Skapa giltiga svenska registreringsnummer (bilnummer). Stödjer både gammalt och nytt format, exklusive förbjudna bokstavskombinationer.',
};

export default function Page() {
  return <Generator type="car-plate" />;
}
