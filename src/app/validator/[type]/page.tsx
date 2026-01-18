import Generator from '../../../components/Generator';

export async function generateMetadata({ params }: { params: { type: string } }) {
  const titles: Record<string, string> = {
    personnummer: 'Validera Personnummer',
    organisation: 'Validera Organisationsnummer',
    moms: 'Validera Momsnummer (VAT)',
    bankgiro: 'Validera Bankgiro',
    plusgiro: 'Validera Plusgiro',
    bankkonto: 'Validera Bankkonto',
    adress: 'Validera Postnummer & Adress'
  };

  return {
    title: `${titles[params.type] || 'Validerare'} | Luhn.se`,
    description: `Kontrollera format och checksumma för svenska ${params.type}. Snabb och korrekt validering direkt i webbläsaren.`,
  };
}

export default function Page() {
  return <Generator />;
}
