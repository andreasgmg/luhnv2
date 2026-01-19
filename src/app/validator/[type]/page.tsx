import Validator from '../../../components/Validator';

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
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">Validerare</h1>
        <p className="text-gray-500 mb-10">Felsök och kontrollera data i realtid.</p>
        <Validator />
    </div>
  );
}