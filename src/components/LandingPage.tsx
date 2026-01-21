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
                <span className="text-slate-500 font-medium">för utvecklare.</span>
                </h1>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed font-light">
                Automatisera dina testflöden. Generera matematiskt korrekta personnummer, bankgiron och organisationsnummer programmatiskt. Gratis, öppet och helt stateless.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <Link href="/api-docs" className="w-full sm:w-auto px-6 py-3 bg-black text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center">
                        Läs API Dokumentation <ArrowRight size={16} className="ml-2" />
                    </Link>
                    <Link href="/personnummer" className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-200 text-slate-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center">
                        Öppna Appen
                    </Link>
                </div>
            </div>
            <div className="col-span-5 relative w-full">
                <div className="absolute -inset-1 bg-gradient-to-tr from-gray-200 to-gray-100 rounded-2xl blur-2xl opacity-50 -z-10"></div>
                <TerminalWindow />
            </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard href="/personnummer" title="Personnummer" desc="Matematiskt korrekta identiteter som passerar alla checksummor (Luhn), datumvalidering och könsregler." icon={User} />
            <FeatureCard href="/samordningsnummer" title="Samordningsnummer" desc="Redo för KYC-tester. Skapa giltiga nummer för onboarding av utländska medborgare." icon={Briefcase} />
            <FeatureCard href="/organisation" title="Organisationsnummer" desc="Validerade bolag som uppfyller Bolagsverkets formkrav. Inklusive momsnummer (VAT)." icon={Building2} />
            <FeatureCard href="/bank-account" title="Bank & Betalning" desc="Testa betalflöden riskfritt med giltiga bankgironummer och clearingnummer för svenska storbanker." icon={Wallet} />
            <FeatureCard href="/api-docs" title="Automation & API" desc="Byggd för CI/CD. Integrera direkt i dina GitHub Actions eller testskript med en enkel curl." icon={Server} />
            <FeatureCard href="/validator" title="Validerare" desc="Universal validering. Felsök felaktig data direkt genom att kontrollera format och checksummor i realtid." icon={ShieldCheck} />
        </div>
        
        <div className="mt-12 grid md:grid-cols-3 gap-8 text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="p-2">
            <h3 className="text-lg font-bold text-gray-900 mb-2">100% Stateless</h3>
            <p className="text-sm text-gray-500">Vi sparar ingen data om dina genereringar. Ingen databas, ingen historik.</p>
          </div>
          <div className="p-2">
            <h3 className="text-lg font-bold text-gray-900 mb-2">GDPR & Integritet</h3>
            <p className="text-sm text-gray-500">All testdata är syntetisk. Vi loggar din IP tillfälligt för rate-limiting (säkerhet), men den raderas automatiskt.</p>
          </div>
          <div className="p-2">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Öppen Källkod</h3>
            <p className="text-sm text-gray-500">Granska koden på GitHub. Kör tjänsten lokalt med Docker för maximal kontroll.</p>
          </div>
        </div>
      </div>
    </div>
  );
}