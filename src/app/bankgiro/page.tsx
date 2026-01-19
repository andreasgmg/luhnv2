import Generator from '../../components/Generator';

export const metadata = {
  title: 'Generera Bankgiro | Luhn.se',
  description: 'Testa betalningar med giltiga bankgironummer (testserien 998-xxxx).',
};

export default function Page() {
  return <Generator type="bankgiro" />;
}
