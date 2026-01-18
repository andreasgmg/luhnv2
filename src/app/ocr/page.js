import Generator from '../../components/Generator';

export const metadata = {
  title: 'Generera OCR-nummer | Luhn.se',
  description: 'Skapa giltiga OCR-referensnummer för fakturering och betalningar. Stöd för Luhn-algoritm och längdcheck.',
  alternates: {
    canonical: 'https://luhn.se/ocr',
  },
};

export default function Page() {
  return <Generator />;
}