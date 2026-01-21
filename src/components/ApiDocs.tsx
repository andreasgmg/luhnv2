'use client';
import React from 'react';
import { Server, ShieldCheck, Download, AlertTriangle, Code, Activity } from 'lucide-react';
import EndpointExample from './ui/EndpointExample';

export default function ApiDocs() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-8 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 pb-8 border-b border-gray-100 gap-4">
          <div className="prose max-w-none text-gray-600 text-sm leading-relaxed flex-1">
              <p>Ett REST-API byggt för utvecklare. Inga nycklar, ingen auth, generösa gränser (Fair Use). Anropa våra endpoints direkt från din frontend, backend eller testsvit med fullt CORS-stöd. För att skydda tjänsten tillämpar vi en rate-limit på 60 anrop per minut.</p>
          </div>
          <a href="/swagger.json" target="_blank" className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-slate-100 hover:text-gray-900 transition-all shrink-0">
              <Download size={14} />
              <span>OpenAPI Spec</span>
          </a>
      </div>

      <div className="space-y-12">
        
        {/* Generering */}
        <section>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Server size={24} className="mr-3 text-blue-600" />Generering
            </h3>
            
            <div className="space-y-6">
                <EndpointExample method="GET" url="/api/generate?type=personnummer" desc="Generera en slumpmässig syntetisk person med ett giltigt Personnummer." />
                <EndpointExample method="GET" url="/api/generate?type=company" desc="Generera ett slumpmässigt företag med giltigt Organisationsnummer och Momsnummer." />
                
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-500 uppercase">Tillgängliga Typer</span>
                        <div className="mt-2 text-sm font-mono text-slate-700 leading-relaxed">
                            personnummer, samordningsnummer, company, bankgiro, plusgiro, bank_account, ocr, license-plate, swish, mobile
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-500 uppercase">Parametrar</span>
                        <ul className="mt-2 text-sm text-slate-600 space-y-1">
                            <li><code className="font-bold">count</code> (1-100) - Antal poster</li>
                            <li><code className="font-bold">format</code> (json, csv, xml) - Utdataformat</li>
                            <li><code className="font-bold">minYear/maxYear</code> - För personnummer</li>
                            <li><code className="font-bold">gender</code> (male, female) - För personnummer</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        {/* Validering */}
        <section>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <ShieldCheck size={24} className="mr-3 text-green-600" />Validering
            </h3>
            <div className="space-y-6">
                <EndpointExample method="GET" url="/api/validate/personnummer?id=199001011234" desc="Validera ett Personnummer (Längd, Luhn, Datum)." />
                <EndpointExample method="GET" url="/api/validate/bank-account?clearing=8105&account=123456789" desc="Validera ett Bankkonto mot bankens regler." />
                <EndpointExample method="GET" url="/api/validate/license-plate?id=MLB123" desc="Validera ett Registreringsnummer (Format & Spärrar)." />
            </div>
        </section>

        {/* Felhantering */}
        <section>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <AlertTriangle size={24} className="mr-3 text-orange-600" />Felhantering
            </h3>
            <p className="text-sm text-gray-600 mb-4">API:et använder konventionella HTTP-statuskoder för att indikera framgång eller misslyckande.</p>
            
            <div className="overflow-hidden border border-gray-200 rounded-xl mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statuskod</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beskrivning</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        <tr><td className="px-6 py-4 font-mono text-green-600">200 OK</td><td className="px-6 py-4 text-gray-600">Allt gick bra.</td></tr>
                        <tr><td className="px-6 py-4 font-mono text-orange-600">400 Bad Request</td><td className="px-6 py-4 text-gray-600">Saknad parameter eller felaktigt format (t.ex. ogiltig &apos;type&apos;).</td></tr>
                        <tr><td className="px-6 py-4 font-mono text-red-600">429 Too Many Requests</td><td className="px-6 py-4 text-gray-600">Du har överskridit rate-limit (60 req/min).</td></tr>
                        <tr><td className="px-6 py-4 font-mono text-red-600">500 Internal Server Error</td><td className="px-6 py-4 text-gray-600">Något gick fel på servern. Försök igen senare.</td></tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl overflow-x-auto">
                <p className="text-xs text-slate-400 mb-2 uppercase font-bold">Standard Felrespons (JSON)</p>
                <pre className="font-mono text-sm text-slate-300">
{`{
  "error": "Missing required parameter: clearing",
  "code": "MISSING_CLEARING",
  "valid": false
}`}
                </pre>
            </div>
        </section>

        {/* Rate Limiting & Typer */}
        <div className="grid md:grid-cols-2 gap-8">
            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Activity size={20} className="mr-2" />Rate Limiting
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Vi tillämpar en gräns på 60 förfrågningar per minut per IP-adress. Svaren inkluderar headers som hjälper dig att hålla koll på din kvot.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-sm font-mono text-slate-700">
                    <div className="flex justify-between"><span>X-RateLimit-Limit:</span><span>60</span></div>
                    <div className="flex justify-between"><span>X-RateLimit-Remaining:</span><span>59</span></div>
                    <div className="flex justify-between"><span>X-RateLimit-Reset:</span><span>1678900000</span></div>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Code size={20} className="mr-2" />TypeScript Definitioner
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Använder du TypeScript? Här är grundinterface för svaren.
                </p>
                <div className="bg-slate-900 p-4 rounded-xl overflow-x-auto">
                    <pre className="font-mono text-xs text-blue-300 leading-relaxed">
{`interface Person {
  ssn: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  address: {
    street: string;
    zip: string;
    city: string;
  };
}`}
                    </pre>
                </div>
            </section>
        </div>

      </div>
    </div>
  );
}
