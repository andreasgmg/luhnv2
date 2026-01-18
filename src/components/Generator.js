'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { Copy, Check, Menu, X, Terminal, Briefcase, User, Building2, CreditCard, ShieldCheck, Wallet, Code2, Server, Home, ArrowRight, Database, Heart, ScanLine, Download } from 'lucide-react';
import { 
    validatePersonnummer, 
    validateOrgNumber, 
    validateVAT, 
    validateBankgiro, 
    validatePlusgiro,
    validateBankAccount 
} from '../lib/utils';

// --- Shared Components for Home Tab ---

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

const TerminalWindow = () => (
  <div className="relative z-10 rounded-xl overflow-hidden bg-[#0d1117] border border-gray-800 shadow-2xl ring-1 ring-white/10">
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
    <div className="p-6 font-mono text-sm leading-relaxed text-left">
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
          <span className="text-[#7ee787]">"valid"</span>: <span className="text-[#79c0ff]">true</span>
        </span>
        <span className="block text-[#e6edf3]">{`}`}</span>
      </div>
    </div>
  </div>
);

export default function Generator() {
  const pathname = usePathname();
  
  const getTabFromPath = (path) => {
    if (path.startsWith('/validator')) return 'validator';
    if (path.startsWith('/api-docs')) return 'api';
    switch(path) {
      case '/': return 'home';
      case '/personnummer': return 'personnummer';
      case '/samordningsnummer': return 'samordningsnummer';
      case '/organisation': return 'company';
      case '/bankgiro': return 'bankgiro';
      case '/plusgiro': return 'plusgiro';
      case '/bank-account': return 'bank_account';
      case '/ocr': return 'ocr';
      default: return 'personnummer';
    }
  };

  const getValidatorTypeFromPath = (path) => {
    if (path.includes('/validator/personnummer')) return 'ssn';
    if (path.includes('/validator/organisation')) return 'org';
    if (path.includes('/validator/moms')) return 'vat';
    if (path.includes('/validator/bankgiro')) return 'bg';
    if (path.includes('/validator/plusgiro')) return 'pg';
    if (path.includes('/validator/bankkonto')) return 'account';
    return 'ssn';
  };

  const activeTab = getTabFromPath(pathname);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [validatorType, setValidatorType] = useState(getValidatorTypeFromPath(pathname));
  const [valInput, setValInput] = useState('');
  const [valInput2, setValInput2] = useState(''); 
  const [valResult, setValResult] = useState(null);

  useEffect(() => {
    setValidatorType(getValidatorTypeFromPath(pathname));
    setValInput('');
    setValInput2('');
    setValResult(null);
  }, [pathname]);

  const fetchData = async (type) => {
    if (type === 'validator' || type === 'api' || type === 'home') return;
    setLoading(true);
    try {
      const res = await fetch(`/api/generate?type=${type}`);
      const result = await res.json();
      setData(result);
    } catch (e) {
      toast.error("Kunde inte generera data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(activeTab); }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'validator') return;
    if (!valInput && validatorType !== 'account') { setValResult(null); return; }
    if (validatorType === 'account' && (!valInput || !valInput2)) { setValResult(null); return; }
    let res = { valid: false };
    if (validatorType === 'ssn') res = validatePersonnummer(valInput);
    else if (validatorType === 'org') res = validateOrgNumber(valInput);
    else if (validatorType === 'vat') res = validateVAT(valInput);
    else if (validatorType === 'bg') res = validateBankgiro(valInput);
    else if (validatorType === 'pg') res = validatePlusgiro(valInput);
    else if (validatorType === 'account') res = validateBankAccount(valInput, valInput2);
    setValResult(res);
  }, [validatorType, valInput, valInput2, activeTab]);

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Kopierad till urklipp');
  };

  const NavItem = ({ href, id, label, icon: Icon }) => {
    const isActive = activeTab === id;
    return (
      <Link
        href={href}
        onClick={() => setMobileMenuOpen(false)}
        className={`relative w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <span className="relative z-10 flex items-center space-x-3">
          <Icon size={18} />
          <span>{label}</span>
        </span>
      </Link>
    );
  };

  const CodeBlock = ({ label, value }) => (
    <div className="group relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <div 
        onClick={() => copyToClipboard(value)}
        className="relative bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-500 hover:shadow-sm transition-all"
      >
        <code className="font-mono text-sm text-gray-900 break-all">{value || '...'}</code>
        <div className="absolute top-3.5 right-3 p-1.5 bg-gray-50 rounded-md text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <Copy size={14} />
        </div>
      </div>
    </div>
  );

  const EndpointExample = ({ method, url, desc }) => {
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const runRequest = async () => {
      setIsLoading(true);
      try {
        const start = Date.now();
        const res = await fetch(url);
        const data = await res.json();
        const duration = Date.now() - start;
        setStatus({ code: res.status, time: duration });
        setResponse(data);
      } catch (err) {
        setStatus({ code: 'ERR', time: 0 });
        setResponse({ error: 'Kunde inte nå servern' });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="mb-8 border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{method}</span>
              <code className="text-sm font-mono text-gray-700 break-all">{url}</code>
            </div>
            <button onClick={runRequest} disabled={isLoading} className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 disabled:opacity-50">
              {isLoading ? <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <div className="w-0 h-0 border-l-[6px] border-l-gray-600 border-y-[4px] border-y-transparent ml-0.5" />}
              <span>Kör</span>
            </button>
          </div>
          <p className="text-sm text-gray-600">{desc}</p>
        </div>
        <div className="bg-slate-900 p-4 font-mono text-xs text-blue-300 overflow-x-auto relative group">
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={() => copyToClipboard(`curl "https://luhn.se${url}"`)} className="p-1.5 bg-slate-800 text-slate-400 rounded hover:text-white"><Copy size={12} /></button>
          </div>
          <div>curl "https://luhn.se{url}"</div>
        </div>
        {response && (
          <div className="border-t border-gray-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Response</span>
              {status && <div className="flex space-x-3 text-xs font-mono"><span className={status.code === 200 ? 'text-green-600' : 'text-red-600'}>{status.code} OK</span><span className="text-gray-400">{status.time}ms</span></div>}
            </div>
            <pre className="font-mono text-xs text-gray-800 overflow-x-auto bg-white p-3 rounded-lg border border-gray-200">{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  };

  const FeatureCard = ({ href, title, desc, icon: Icon }) => (
    <Link href={href} className="group h-full p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all flex flex-col text-left">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="text-blue-600" size={20} />
        </div>
        <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed flex-1">{desc}</p>
    </Link>
  );

  const getTitle = () => {
    if (activeTab === 'home') return 'Översikt';
    if (activeTab === 'validator') return 'Validerare';
    if (activeTab === 'api') return 'API-referens';
    if (activeTab === 'company') return 'Organisationsnummer';
    if (activeTab === 'bank_account') return 'Bankkonto';
    if (activeTab === 'plusgiro') return 'Plusgiro';
    if (activeTab === 'ocr') return 'OCR-nummer';
    return activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
  };

  const getDescription = () => {
    switch(activeTab) {
      case 'home': return 'Välkommen till Luhn.se - Din kompletta verktygslåda för svensk testdata.';
      case 'personnummer': return 'Testa dina kundflöden med kompletta profiler. Vi genererar giltiga personnummer parade med matchande namn och riktiga svenska adresser.';
      case 'samordningsnummer': return 'Validera stöd för individer utan personnummer. Vi följer Skatteverkets standard (dag + 60) för korrekta KYC- och onboarding-tester.';
      case 'company': return 'Mocka B2B-flöden med realistiska bolag. Vi genererar matematiskt korrekta organisationsnummer och matchande SE-momsnummer (VAT).';
      case 'bankgiro': return 'Säkra dina betalningstester. Vi använder Bankgirots dedikerade testserie (998-xxxx) för att garantera att du aldrig råkar använda ett skarpt nummer.';
      case 'plusgiro': return 'Generera giltiga svenska plusgironummer för test av äldre betalsystem.';
      case 'bank_account': return 'Generera kontonummer som passerar bankernas validering. Vi stöder korrekta clearing-serier för SEB, Swedbank, Nordea, Handelsbanken m.fl.';
      case 'ocr': return 'Testa OCR-validering i dina betalflöden. Vi skapar giltiga referensnummer med Luhn-kontroll och valfri längdcheck (hård/mjuk kontroll).';
      case 'validator': return 'Felsök felaktig data direkt. Klistra in ett nummer och se omedelbart om längd, datumformat och Luhn-checksumma stämmer.';
      case 'api': return 'Automatisera din testdata. Integrera våra generatorer direkt i din CI/CD-pipeline helt utan API-nycklar eller begränsningar.';
      default: return 'Generera giltig, verifierbar testdata för svenska system.';
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 font-bold text-gray-900">
          <Terminal size={20} className="text-blue-600" />
          <span>luhn.se</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Static Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:h-full flex-shrink-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <Link href="/" className="hidden lg:flex items-center space-x-2 px-6 py-6 border-b border-gray-100 flex-shrink-0">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Terminal size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">luhn.se</span>
          </Link>

          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Start</div>
            <NavItem href="/" id="home" label="Översikt" icon={Home} />
            <div className="px-3 mt-8 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Identiteter</div>
            <NavItem href="/personnummer" id="personnummer" label="Personnummer" icon={User} />
            <NavItem href="/samordningsnummer" id="samordningsnummer" label="Samordningsnummer" icon={Briefcase} />
            <div className="px-3 mt-8 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Företag & Bank</div>
            <NavItem href="/organisation" id="company" label="Organisationsnr" icon={Building2} />
            <NavItem href="/bankgiro" id="bankgiro" label="Bankgiro" icon={CreditCard} />
            <NavItem href="/plusgiro" id="plusgiro" label="Plusgiro" icon={CreditCard} />
            <NavItem href="/bank-account" id="bank_account" label="Bankkonto" icon={Wallet} />
            <NavItem href="/ocr" id="ocr" label="OCR-nummer" icon={ScanLine} />
            <div className="px-3 mt-8 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Verktyg</div>
            <NavItem href="/validator" id="validator" label="Validerare" icon={ShieldCheck} />
            <div className="px-3 mt-8 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Utvecklare</div>
            <NavItem href="/api-docs" id="api" label="API Dokumentation" icon={Code2} />
          </div>

          <div className="p-4 border-t border-gray-100 space-y-3">
            <Link 
              href="https://github.com/sponsors/ditt-användarnamn" 
              target="_blank"
              className="flex items-center justify-center space-x-2 w-full py-2 px-4 bg-white border border-red-100 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors shadow-sm shadow-red-500/5"
            >
              <Heart size={14} className="fill-red-500" />
              <span>Stöd projektet</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 h-full overflow-y-auto pt-16 lg:pt-0 relative scroll-smooth">
        {activeTab === 'home' && <DotGridBackground />}
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {activeTab !== 'home' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4 text-left">
                <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
                    {activeTab === 'api' ? 'API-referens' : activeTab === 'company' ? 'Organisationsnummer' : activeTab === 'bank_account' ? 'Bankkonto' : activeTab === 'validator' ? 'Validerare' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <p className="text-gray-500">
                    {getDescription()}
                </p>
                </div>
                {activeTab !== 'validator' && activeTab !== 'api' && (
                    <button onClick={() => fetchData(activeTab)} disabled={loading} className="inline-flex items-center justify-center px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 active:scale-95 whitespace-nowrap">
                    {loading ? 'Genererar...' : 'Generera ny'}
                    </button>
                )}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
            >
            
            {activeTab === 'home' ? (
              <div className="py-8">
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
                    <p className="text-sm text-gray-500">Vi sparar ingen data.</p>
                  </div>
                  <div className="p-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">GDPR-säker</h3>
                    <p className="text-sm text-gray-500">All data är syntetisk.</p>
                  </div>
                  <div className="p-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Öppen Källkod</h3>
                    <p className="text-sm text-gray-500">Granska koden på GitHub.</p>
                  </div>
                </div>
              </div>
            ) : activeTab === 'api' ? (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-8">
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
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Server size={20} className="mr-2" />Generering</h3>
                  <EndpointExample method="GET" url="/api/generate?type=personnummer" desc="Generera en slumpmässig syntetisk person med ett giltigt Personnummer." />
                  <EndpointExample method="GET" url="/api/generate?type=company" desc="Generera ett slumpmässigt företag med giltigt Organisationsnummer och Momsnummer." />
                  <EndpointExample method="GET" url="/api/generate?type=personnummer&count=5" desc="Batch-generering: Hämta 5 personnummer i en lista." />
                  <EndpointExample method="GET" url="/api/generate?type=personnummer&minYear=1990&maxYear=2000" desc="Filtrera: Hämta personnummer för personer födda mellan 1990 och 2000." />
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm"><strong>Typer:</strong> <code>personnummer</code>, <code>samordningsnummer</code>, <code>company</code>, <code>bankgiro</code>, <code>bank_account</code>, <code>ocr</code>, <code>plusgiro</code>.</div>
                  <hr className="my-8 border-gray-100"/><h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><ShieldCheck size={20} className="mr-2" />Validering</h3>
                  <EndpointExample method="GET" url="/api/validate?type=ssn&value=199001011234" desc="Validera ett Personnummer (Längd, Luhn, Datum)." />
                  <EndpointExample method="GET" url="/api/validate?type=account&value=8105&value2=123456789" desc="Validera ett Bankkonto (Clearing + Kontonummer)." />
                </div>
              </div>
            ) : activeTab === 'validator' ? (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Validering</span>
                        <span className="text-xs font-mono text-gray-400">INPUT</span>
                    </div>
                    <div className="p-6">
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8 overflow-x-auto">
                            {[
                                {id: 'ssn', label: 'Personnummer', href: '/validator/personnummer'},
                                {id: 'org', label: 'Organisation', href: '/validator/organisation'},
                                {id: 'vat', label: 'Moms (VAT)', href: '/validator/moms'},
                                {id: 'bg', label: 'Bankgiro', href: '/validator/bankgiro'},
                                {id: 'pg', label: 'Plusgiro', href: '/validator/plusgiro'},
                                {id: 'account', label: 'Bankkonto', href: '/validator/bankkonto'}
                            ].map(t => (
                                <Link key={t.id} href={t.href} className={`flex-1 flex items-center justify-center py-2 px-3 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${validatorType === t.id ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t.label}</Link>
                            ))}
                        </div>
                        <div className="space-y-6">
                            {validatorType === 'account' ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Clearingnummer</label>
                                        <input type="text" value={valInput} onChange={(e) => setValInput(e.target.value)} placeholder="8105" className="w-full text-xl font-mono p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kontonummer</label>
                                        <input type="text" value={valInput2} onChange={(e) => setValInput2(e.target.value)} placeholder="993422324" className="w-full text-xl font-mono p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nummer</label>
                                    <input type="text" value={valInput} onChange={(e) => setValInput(e.target.value)} placeholder={validatorType === 'ssn' ? "ÅÅMMDD-XXXX" : "Nummer"} className="w-full text-xl font-mono p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                            )}
                            <div className={`p-4 rounded-xl border flex items-center space-x-4 transition-colors ${valResult?.valid ? 'bg-green-50 border-green-200 text-green-800' : !valInput && validatorType !== 'account' ? 'bg-gray-50 border-gray-200 text-gray-500' : (!valInput || !valInput2) && validatorType === 'account' ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                {valResult?.valid ? <Check size={20} /> : <ShieldCheck size={20} />}
                                <span className="font-medium text-base">{!valResult && !valInput ? 'Ange ett nummer för att validera' : valResult?.valid ? 'Giltigt' : 'Ogiltigt'}</span>
                                {valResult?.error && <span className="text-xs opacity-80">({valResult.error})</span>}
                                {valResult?.bankName && <span className="ml-auto font-bold bg-white/50 px-3 py-1 rounded-md text-xs border border-green-100">{valResult.bankName}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Resultat</span>
                    <span className="text-xs font-mono text-gray-400">JSON</span>
                </div>
                <div className="p-6">
                    {activeTab === 'personnummer' || activeTab === 'samordningsnummer' ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6">
                        <CodeBlock label="Personnummer" value={data?.ssn} />
                        <div className="grid grid-cols-2 gap-4"><CodeBlock label="Förnamn" value={data?.firstName} /><CodeBlock label="Efternamn" value={data?.lastName} /></div>
                        </div>
                        <div className="space-y-6">
                        <CodeBlock label="Gatuadress" value={data?.address?.street} />
                        <div className="grid grid-cols-2 gap-4"><CodeBlock label="Postnummer" value={data?.address?.zip} /><CodeBlock label="Postort" value={data?.address?.city} /></div>
                        </div>
                    </div>
                    ) : activeTab === 'company' ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6"><CodeBlock label="Organisationsnummer" value={data?.orgNumber} /><CodeBlock label="Företagsnamn" value={data?.name} /></div>
                        <div className="space-y-6"><CodeBlock label="Momsnummer (VAT)" value={data?.vatNumber} /></div>
                    </div>
                    ) : activeTab === 'bankgiro' ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6"><CodeBlock label="Bankgiro" value={data?.bankgiro} /></div>
                        <div className="space-y-6"><CodeBlock label="Bank" value={data?.bank} /></div>
                    </div>
                    ) : activeTab === 'plusgiro' ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6"><CodeBlock label="Plusgiro" value={data?.plusgiro} /></div>
                        <div className="space-y-6"><CodeBlock label="Bank" value={data?.bank} /></div>
                    </div>
                    ) : activeTab === 'ocr' ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6"><CodeBlock label="OCR-nummer" value={data?.ocr} /></div>
                        <div className="space-y-6">
                            <CodeBlock label="Längd" value={data?.length} />
                            <CodeBlock label="Längdcheck (Hård)" value={data?.lengthCheck ? 'Ja' : 'Nej'} />
                        </div>
                    </div>
                    ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6"><CodeBlock label="Bank" value={data?.bank} /><CodeBlock label="Clearingnummer" value={data?.clearing} /></div>
                        <div className="space-y-6"><CodeBlock label="Kontonummer" value={data?.account} /></div>
                    </div>
                    )}
                </div>
                </div>
            )}

            {activeTab !== 'validator' && activeTab !== 'api' && activeTab !== 'home' && (
                <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg text-left">
                <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-700/50 flex items-center">
                    <div className="flex space-x-2"><div className="w-3 h-3 rounded-full bg-red-500/20"></div><div className="w-3 h-3 rounded-full bg-yellow-500/20"></div><div className="w-3 h-3 rounded-full bg-green-500/20"></div></div>
                    <span className="ml-4 text-xs font-mono text-slate-500">api response</span>
                </div>
                <div className="p-6 overflow-x-auto"><pre className="font-mono text-sm text-slate-300 leading-relaxed">{JSON.stringify(data, null, 2)}</pre></div>
                </div>
            )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}