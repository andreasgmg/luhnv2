import Generator from '../../components/Generator';

export const metadata = {
  title: 'Generera OCR-nummer | Luhn.se',
  description: 'Referensnummer med längd- och luhn-kontroll för fakturor.',
};

export default function Page() {
  return <Generator type="ocr" />;
}
