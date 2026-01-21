import Generator from '../../components/Generator';

export const metadata = {
  title: 'Generera Swish-nummer | Luhn.se',
  description: 'Skapa giltiga Swish-nummer för företag och föreningar (123-serien). Perfekt för integrationstester mot Swish Commerce.',
};

export default function Page() {
  return <Generator type="swish" />;
}
