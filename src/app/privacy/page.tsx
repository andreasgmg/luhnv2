export const metadata = {
  title: 'Integritetspolicy | Luhn.se',
  description: 'Information om hur vi hanterar data och personuppgifter.',
};

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Integritetspolicy</h1>
      
      <div className="prose prose-blue max-w-none text-gray-600">
        <p className="lead text-lg">
          Luhn.se är en tjänst byggd för transparens och integritet. Här förklarar vi exakt vilken data vi hanterar och varför.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Ansvarig</h3>
        <p>
          Ansvarig för tjänsten och personuppgiftsansvarig är:<br/>
          <strong>Andreas Glans</strong><br/>
          Kontakt: <a href="mailto:andreas.glans91@gmail.com" className="text-blue-600 hover:underline">andreas.glans91@gmail.com</a>
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Vilken data samlar vi in?</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>IP-adresser:</strong> Vi loggar din IP-adress tillfälligt i systemets minne (RAM) för att skydda tjänsten mot överbelastning och missbruk (Rate Limiting).
          </li>
          <li>
            <strong>Serverloggar:</strong> Av tekniska skäl sparas anropsloggar (inklusive IP-adress och tidpunkt) på servern för felsökning. Dessa loggar roteras och raderas automatiskt med jämna mellanrum.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Vad gör vi INTE?</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Vi använder <strong>inga cookies</strong> för spårning eller marknadsföring.</li>
          <li>Vi sparar <strong>ingen data</strong> som du genererar eller validerar i en databas. Tjänsten är {"\"stateless\""}.</li>
          <li>Vi säljer eller delar <strong>aldrig</strong> din data till tredje part.</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Laglig grund</h3>
        <p>
          Behandlingen av din IP-adress för säkerhetsändamål sker med stöd av <strong>Berättigat Intresse</strong> (GDPR Art. 6.1.f) för att säkerställa tjänstens drift och säkerhet.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Dina rättigheter</h3>
        <p>
          Enligt GDPR har du rätt att begära information om vilka uppgifter vi har om dig, samt begära rättelse eller radering. Kontakta ansvarig via e-post för sådana ärenden.
        </p>
      </div>
    </div>
  );
}
