'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Terminal, Shield, Wallet, Database, Globe, Box, Copy, Check, ArrowRight, User, Briefcase, Building2, CreditCard } from 'lucide-react';
import { useState } from 'react';

// --- Shared Components ---

const DotGridBackground = () => (
  <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
);

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors">
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
};

const FeatureCard = ({ href, icon: Icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Link 
      href={href}
      className="group block h-full p-6 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl hover:border-gray-400 hover:bg-white transition-all duration-200"
    >
      <div className="mb-4">
        <Icon className="text-gray-900 group-hover:scale-110 transition-transform duration-300" size={24} strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        {desc}
      </p>
    </Link>
  </motion.div>
);

const TerminalWindow = () => (
  <div className="relative z-10 rounded-xl overflow-hidden bg-[#0d1117] border border-gray-800 shadow-2xl ring-1 ring-white/10">
    {/* Window Controls */}
    <div className="flex items-center px-4 py-3 bg-[#161b22] border-b border-gray-800">
      <div className="flex space-x-2">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
      </div>
      <div className="ml-4 flex-1 text-center pr-12">
        <span className="text-xs font-mono text-gray-500">api-client — bash</span>
      </div>
    </div>
    
    {/* Terminal Content */}
    <div className="p-6 font-mono text-sm leading-relaxed">
      <div className="flex items-start mb-4 group">
        <span className="text-gray-500 mr-3 select-none">$</span>
        <div className="flex-1">
          <span className="text-purple-400">curl</span>
          <span className="text-gray-300 ml-2">"https://luhn.se/api/generate?type=personnummer"</span>
        </div>
        <CopyButton text='curl "https://luhn.se/api/generate?type=personnummer"' />
      </div>
      
      <div className="text-gray-300">
        <span className="block text-gray-500 select-none mb-1"># Output</span>
        <span className="block text-[#e6edf3]">{`{`}</span>
        <span className="block text-[#e6edf3] ml-4">
          <span className="text-[#7ee787]">"ssn"</span>: <span className="text-[#a5d6ff]">"19900505-1234"</span>,
        </span>
        <span className="block text-[#e6edf3] ml-4">
          <span className="text-[#7ee787]">"firstName"</span>: <span className="text-[#a5d6ff]">"Johan"</span>,
        </span>
        <span className="block text-[#e6edf3] ml-4">
          <span className="text-[#7ee787]">"lastName"</span>: <span className="text-[#a5d6ff]">"Svensson"</span>,
        </span>
        <span className="block text-[#e6edf3] ml-4">
          <span className="text-[#7ee787]">"valid"</span>: <span className="text-[#79c0ff]">true</span>
        </span>
        <span className="block text-[#e6edf3]">{`}`}</span>
      </div>
    </div>
  </div>
);

// --- Main Page ---

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white relative overflow-hidden">
      
      <DotGridBackground />

      {/* Navigation */}
      <nav className="fixed w-full z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-lg tracking-tight">
            <div className="bg-black text-white p-1 rounded-md">
              <Terminal size={16} strokeWidth={3} />
            </div>
            <span>luhn.se</span>
          </div>
          <div className="flex items-center space-x-8 text-sm font-medium">
            <Link href="/api-docs" className="text-gray-600 hover:text-black transition-colors">API</Link>
            <Link href="/validator" className="text-gray-600 hover:text-black transition-colors">Validerare</Link>
            <Link 
              href="/personnummer"
              className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Kom igång
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 lg:pt-48 lg:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            
            <div className="col-span-7 mb-16 lg:mb-0 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                  Svensk testdata <br/>
                  <span className="text-slate-500">för utvecklare.</span>
                </h1>
                <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
                  Sluta använda slumpmässiga nummer. Generera matematiskt giltiga personnummer, bankgironummer och organisationsnummer för dina testsystem.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                  <Link 
                    href="/personnummer"
                    className="w-full sm:w-auto px-8 py-3.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center"
                  >
                    Börja generera <ArrowRight size={16} className="ml-2" />
                  </Link>
                  <Link 
                    href="/api-docs"
                    className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-200 text-slate-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center"
                  >
                    Se API-dokumentation
                  </Link>
                </div>
              </motion.div>
            </div>
            
            <div className="col-span-5 relative w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
              >
                {/* Glow effect BEHIND terminal */}
                <div className="absolute -inset-1 bg-gradient-to-tr from-gray-200 to-gray-100 rounded-2xl blur-2xl opacity-50 -z-10"></div>
                <TerminalWindow />
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              href="/personnummer"
              icon={User}
              title="Syntetiska identiteter"
              desc="Generera giltiga personnummer parade med realistiska namn och adresser. Helt GDPR-säkert."
              delay={0.1}
            />
            <FeatureCard 
              href="/organisation"
              icon={Building2}
              title="Företagsdata"
              desc="Skapa kompletta företagsprofiler inklusive organisationsnummer och momsnummer (VAT)."
              delay={0.2}
            />
            <FeatureCard 
              href="/bank-account"
              icon={Wallet}
              title="Bankinfrastruktur"
              desc="Validera clearingnummer och generera kontonummer för svenska storbanker (SEB, Swedbank, etc)."
              delay={0.3}
            />
            <FeatureCard 
              href="/bankgiro"
              icon={CreditCard}
              title="Betalningar"
              desc="Bankgironummer från den säkra 998-serien för riskfri integrationstestning av betalflöden."
              delay={0.4}
            />
            <FeatureCard 
              href="/validator"
              icon={Shield}
              title="Realtidsvalidering"
              desc="Verifiera format, checksumma (Luhn) och giltighet för alla typer av svenska identifierare."
              delay={0.5}
            />
            <FeatureCard 
              href="/api-docs"
              icon={Database}
              title="Öppet API"
              desc="Integrera direkt i din CI/CD-pipeline. Inga API-nycklar krävs. Fullt CORS-stöd."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-2 font-semibold text-gray-900 mb-4 md:mb-0">
            <div className="bg-black text-white p-1 rounded">
              <Terminal size={12} strokeWidth={3} />
            </div>
            <span>luhn.se</span>
          </div>
          <div className="flex space-x-6">
            <span>© {new Date().getFullYear()} Luhn.se</span>
            <Link href="https://github.com/yourusername/luhnv2" className="hover:text-black transition-colors">GitHub</Link>
            <Link href="/api-docs" className="hover:text-black transition-colors">API</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}