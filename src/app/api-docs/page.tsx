import ApiDocs from '../../components/ApiDocs';

export const metadata = {
  title: 'API Dokumentation | Luhn.se',
  description: 'Integrera svensk testdata i dina applikationer. REST-API för personnummer, organisationsnummer och bankvalidering.',
};

export default function Page() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">API Dokumentation</h1>
        <p className="text-gray-500 mb-10">Integration och referens för utvecklare.</p>
        <ApiDocs />
    </div>
  );
}
