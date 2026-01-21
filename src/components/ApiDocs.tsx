'use client';
import React from 'react';
import { Server, ShieldCheck, Download } from 'lucide-react';
import EndpointExample from './ui/EndpointExample';

export default function ApiDocs() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-8 text-left">
      <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-100 text-left">
          <div className="prose max-w-none text-gray-600 text-sm leading-relaxed">
              <p>Ett REST-API byggt för utvecklare. Inga nycklar, ingen auth, generösa gränser (Fair Use). Anropa våra endpoints direkt från din frontend, backend eller testsvit med fullt CORS-stöd. För att skydda tjänsten tillämpar vi en rate-limit på 60 anrop per minut.</p>
          </div>
          <a href="/swagger.json" target="_blank" className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-slate-100 hover:text-gray-900 transition-all ml-4 shrink-0">
              <Download size={14} />
              <span>OpenAPI Spec</span>
          </a>
      </div>
      <div className="prose max-w-none text-gray-600 text-left">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Server size={20} className="mr-2" />Generering
        </h3>
        <EndpointExample method="GET" url="/api/generate?type=personnummer" desc="Generera en slumpmässig syntetisk person med ett giltigt Personnummer." />
        <EndpointExample method="GET" url="/api/generate?type=company" desc="Generera ett slumpmässigt företag med giltigt Organisationsnummer och Momsnummer." />
        <EndpointExample method="GET" url="/api/generate?type=car-plate" desc="Generera ett giltigt registreringsnummer (bilnummer)." />
        <EndpointExample method="GET" url="/api/generate?type=personnummer&count=5" desc="Batch-generering: Hämta 5 personnummer i en lista." />
        <EndpointExample method="GET" url="/api/generate?type=personnummer&minYear=1990&maxYear=2000" desc="Filtrera: Hämta personnummer för personer födda mellan 1990 och 2000." />
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-left">
            <strong>Typer:</strong> <code>personnummer</code>, <code>samordningsnummer</code>, <code>company</code>, <code>bankgiro</code>, <code>bank_account</code>, <code>ocr</code>, <code>plusgiro</code>, <code>car-plate</code>, <code>swish</code>, <code>mobile</code>.
        </div>
        
        <hr className="my-8 border-gray-100"/>
        
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <ShieldCheck size={20} className="mr-2" />Validering
        </h3>
        <p className="text-sm text-gray-500 mb-4">Använd våra RESTful endpoints för att validera data.</p>
        <EndpointExample method="GET" url="/api/validate/personnummer?id=199001011234" desc="Validera ett Personnummer (Längd, Luhn, Datum)." />
        <EndpointExample method="GET" url="/api/validate/bank-account?clearing=8105&account=123456789" desc="Validera ett Bankkonto (Clearing + Kontonummer)." />
        <EndpointExample method="GET" url="/api/validate/car-plate?id=ABC123" desc="Validera ett Registreringsnummer (Gammalt eller nytt format)." />
      </div>
    </div>
  );
}