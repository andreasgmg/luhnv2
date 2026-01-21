import Validator from '../../../components/Validator';

export async function generateMetadata() {
  return {
    title: 'Validera Registreringsnummer | Luhn.se',
    description: 'Kontrollera om ett registreringsnummer är giltigt enligt Transportstyrelsens regler. Kollar format och förbjudna kombinationer.',
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
