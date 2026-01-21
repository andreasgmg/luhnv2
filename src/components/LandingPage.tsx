'use client';
import React from 'react';
import Link from 'next/link';
import { 
  User, Briefcase, Building2, Wallet, Server, ShieldCheck, ArrowRight 
} from 'lucide-react';
import TerminalWindow from './ui/TerminalWindow';
import DotGridBackground from './ui/DotGridBackground';
import FeatureCard from './ui/FeatureCard';

export default function LandingPage() {
  return (
    <div className="py-8">
      <DotGridBackground />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center mb-20 text-center lg:text-left">
            <div className="col-span-7 mb-10 lg:mb-0">
                <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                Svensk testdata <br/>
                <span className="text-blue-600">för utvecklare.</span>
                </h1>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed font-light">
                Automatisera dina tester med vårt Open Source REST-API. Generera validerbara personnummer, organisationsnummer och bankuppgifter direkt i din kod.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <Link href="/api-docs" className="w-full sm:w-auto px-6 py-3 bg-black text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center">
                        Läs API Dokumentation <ArrowRight size={16} className="ml-2" />
                    </Link>
                    <Link href="/personnummer" className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-200 text-slate-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center">
                        Kom igång
                    </Link>
                </div>
            </div>
            <div className="col-span-5 relative w-full">
                <div className="absolute -inset-1 bg-gradient-to-tr from-gray-200 to-gray-100 rounded-2xl blur-2xl opacity-50 -z-10"></div>
                <TerminalWindow />
            </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard href="/personnummer" title="Personnummer" desc="Syntetiska identiteter som klarar alla kontroller. Korrekt Luhn-algoritm, datumkontroll och könssiffra." icon={User} />
            <FeatureCard href="/samordningsnummer" title="Samordningsnummer" desc="Redo för KYC-tester. Skapa giltiga nummer för individer som inte är folkbokförda i Sverige." icon={Briefcase} />
            <FeatureCard href="/organisation" title="Organisationsnummer" desc="Validerade bolag som uppfyller Bolagsverkets formkrav. Inklusive momsnummer (VAT)." icon={Building2} />
            <FeatureCard href="/bank-account" title="Bank & Betalning" desc="Testa betalflöden riskfritt med giltiga bankgironummer och clearingnummer för svenska storbanker." icon={Wallet} />
            <FeatureCard href="/api-docs" title="Automation & API" desc="Byggd för CI/CD. Integrera direkt i dina GitHub Actions eller testskript med ett enkelt curl-anrop." icon={Server} />
            <FeatureCard href="/validator" title="Validerare" desc="Universell validering. Felsök felaktig data direkt genom att kontrollera format och checksummor i realtid." icon={ShieldCheck} />
        </div>
        
        <div className="mt-12 grid md:grid-cols-3 gap-8 text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="p-2">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Gratis & Open Source</h3>
            <p className="text-sm text-gray-500">Inga betalväggar, inga dolda avgifter. Ett Open Source-projekt byggt för communityt. Använd det fritt i dina projekt (Fair Use).</p>
          </div>
          <div className="p-2">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ingen Auth</h3>
            <p className="text-sm text-gray-500">Slösa inte tid på registrering. Inga API-nycklar krävs. Anropa våra endpoints direkt från din lokala miljö eller CI/CD.</p>
          </div>
          <div className="p-2">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Helt Stateless</h3>
            <p className="text-sm text-gray-500">Vi sparar ingen data. Allt genereras &apos;on-the-fly&apos; för maximal integritet. Inga loggar av genererad data sparas.</p>
          </div>
        </div>

        <div className="mt-12 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
            <h4 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-2">Viktigt om testdatan</h4>
            <p className="text-sm text-red-700/80 font-medium">
                Tjänsten genererar endast syntetisk testdata. Använd aldrig riktiga personuppgifter. All data är fiktiv men tekniskt giltig.
            </p>
        </div>
      </div>
    </div>
  );
}
