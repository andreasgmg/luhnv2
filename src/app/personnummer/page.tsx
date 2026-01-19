import Generator from '../../components/Generator';

export const metadata = {
  title: 'Generera Personnummer | Luhn.se',
  description: 'Skapa giltiga, syntetiska personnummer för test och utveckling. Inklusive namn och adress.',
};

export default function Page() {
  return <Generator type="personnummer" />;
}
