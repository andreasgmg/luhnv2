export const metadata = {
  title: 'Integritetspolicy | Luhn.se',
  description: 'Information om hur vi hanterar data och personuppgifter enligt GDPR.',
};

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Integritetspolicy</h1>
      <p className="text-sm text-gray-500 mb-8 font-mono">Senast uppdaterad: 2026-01-21</p>
      
      <div className="prose prose-blue max-w-none text-gray-600 space-y-8">
        <p className="text-lg leading-relaxed">
          Luhn.se är en tjänst byggd för transparens och integritet. Vi värnar om din data och följer dataskyddsförordningen (GDPR).
        </p>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Personuppgiftsansvarig</h2>
          <p>
            Ansvarig för behandlingen av personuppgifter på denna webbplats är:
          </p>
          <p className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <strong>Andreas Glans</strong><br/>
            Kontakt: <a href="mailto:andreas.glans91@gmail.com" className="text-blue-600 hover:underline">andreas.glans91@gmail.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Vilken data samlar vi in och varför?</h2>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-100 rounded-xl">
              <h3 className="font-bold text-gray-800 mb-2">A. IP-adresser (Rate Limiting)</h3>
              <p>Vi lagrar din IP-adress tillfälligt i serverns primärminne (RAM).</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li><strong>Syfte:</strong> Att skydda tjänsten mot överbelastning, DDOS-attacker och missbruk.</li>
                <li><strong>Laglig grund:</strong> Berättigat intresse (GDPR Art 6.1.f) för att upprätthålla säkerhet och driftstabilitet.</li>
                <li><strong>Lagringstid:</strong> Datan raderas automatiskt när tidsfönstret för begränsningen löper ut (vanligtvis inom 1-5 minuter) eller vid omstart av servern.</li>
              </ul>
            </div>

            <div className="p-4 border border-gray-100 rounded-xl">
              <h3 className="font-bold text-gray-800 mb-2">B. Serverloggar</h3>
              <p>Av tekniska skäl loggas anrop till API:et (inklusive IP-adress, tidpunkt och anropad resurs) av vår servermjukvara.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li><strong>Syfte:</strong> Felsökning av tekniska problem och analys av intrångsförsök.</li>
                <li><strong>Notering:</strong> Vi loggar inte de fullständiga värdena du skickar in (t.ex. personnumret i en validering), utan endast vilken typ av anrop som gjordes.</li>
                <li><strong>Lagringstid:</strong> Loggar roteras och raderas automatiskt efter maximalt 14 dagar.</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Mottagare av data (Tredje part)</h2>
          <p>
            Vi säljer aldrig din data. Däremot anlitar vi underleverantörer (Personuppgiftsbiträden) för drift av tjänsten:
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li><strong>Hetzner Online GmbH (Tyskland):</strong> Hosting-leverantör där vår server och infrastruktur finns placerad. All data stannar inom EU/EES.</li>
          </ul>
        </section>

        <section className="bg-red-50 p-6 rounded-2xl border border-red-100">
          <h2 className="text-xl font-bold text-red-900 mb-3">4. Användning av riktiga personuppgifter</h2>
          <p className="text-red-800">
            Denna tjänst är endast avsedd för generering och validering av syntetisk testdata.
          </p>
          <ul className="list-disc pl-5 mt-2 text-red-800 text-sm space-y-2">
            <li>Det är strängt förbjudet att mata in riktiga personuppgifter som tillhör levande personer i systemet.</li>
            <li>Även om vi aktivt undviker att logga inmatad data, tar vi inget ansvar för behandling av riktiga personuppgifter som användare matar in i strid med dessa villkor.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Cookies</h2>
          <p>
            Vi använder inga cookies för spårning, analys eller marknadsföring. Tjänsten är helt &quot;stateless&quot;.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Dina rättigheter</h2>
          <p>Enligt GDPR har du rätt att:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Begära ett utdrag av de personuppgifter vi behandlar om dig.</li>
            <li>Begära rättelse eller radering av dina uppgifter.</li>
            <li>Invända mot behandling som stödjer sig på berättigat intresse.</li>
          </ul>
          <p className="mt-4 italic text-sm">
            Eftersom vi rensar data löpande (ofta inom minuter) kan vi i de flesta fall inte återskapa eller identifiera data kopplad till en specifik person i efterhand.
          </p>
          <p className="mt-4">
            Om du anser att vi hanterar dina personuppgifter felaktigt har du rätt att lämna klagomål till tillsynsmyndigheten, Integritetsskyddsmyndigheten (IMY).
          </p>
        </section>
      </div>
    </div>
  );
}