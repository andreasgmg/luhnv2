'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { Copy, Check, Menu, X, Terminal, Briefcase, User, Building2, CreditCard, ShieldCheck, Wallet, Code2, Server } from 'lucide-react';
import { 
    validatePersonnummer, 
    validateOrgNumber, 
    validateVAT, 
    validateBankgiro, 
    validateBankAccount 
} from '../lib/utils';

export default function Generator() {
  const pathname = usePathname();
  
  // Map route paths to internal data types
  const getTabFromPath = (path) => {
    if (path.startsWith('/validator')) return 'validator';
    if (path.startsWith('/api-docs')) return 'api';
    
    switch(path) {
      case '/': return 'personnummer';
      case '/personnummer': return 'personnummer';
      case '/samordningsnummer': return 'samordningsnummer';
      case '/organisation': return 'company';
      case '/bankgiro': return 'bankgiro';
      case '/bank-account': return 'bank_account';
      default: return 'personnummer';
    }
  };

  // Map validator URL slug to internal state type
  const getValidatorTypeFromPath = (path) => {
    if (path.includes('/validator/personnummer')) return 'ssn';
    if (path.includes('/validator/organisation')) return 'org';
    if (path.includes('/validator/moms')) return 'vat';
    if (path.includes('/validator/bankgiro')) return 'bg';
    if (path.includes('/validator/bankkonto')) return 'account';
    return 'ssn'; // Default
  };

  const activeTab = getTabFromPath(pathname);
  const initialValidatorType = getValidatorTypeFromPath(pathname);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Validator State
  const [validatorType, setValidatorType] = useState(initialValidatorType);
  const [valInput, setValInput] = useState('');
  const [valInput2, setValInput2] = useState(''); 
  const [valResult, setValResult] = useState(null);

  // Sync validator type if URL changes
  useEffect(() => {
    setValidatorType(getValidatorTypeFromPath(pathname));
    setValInput(''); // Clear input on switch
    setValInput2('');
    setValResult(null);
  }, [pathname]);

  const fetchData = async (type) => {
    if (type === 'validator' || type === 'api') return;
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

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'validator') return;

    let res = { valid: false };
    
    // Only validate if input is present
    if (!valInput && validatorType !== 'account') {
        setValResult(null);
        return;
    }
    if (validatorType === 'account' && (!valInput || !valInput2)) {
        setValResult(null);
        return;
    }
    
    if (validatorType === 'ssn') {
        res = validatePersonnummer(valInput);
    } else if (validatorType === 'org') {
        res = validateOrgNumber(valInput);
    } else if (validatorType === 'vat') {
        res = validateVAT(valInput);
    } else if (validatorType === 'bg') {
        res = validateBankgiro(valInput);
    } else if (validatorType === 'account') {
        res = validateBankAccount(valInput, valInput2);
    }

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
          isActive 
            ? 'text-blue-700' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-blue-50 rounded-lg"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
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

  const EndpointExample = ({ method, url, desc }) => (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-2">
        <span className={`text-xs font-bold px-2 py-1 rounded ${method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{method}</span>
        <code className="text-sm font-mono text-gray-700">{url}</code>
      </div>
      <p className="text-sm text-gray-600 mb-3">{desc}</p>
      <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-blue-300 overflow-x-auto">
        curl "https://luhn.se{url}"
      </div>
    </div>
  );

  const getTitle = () => {
    if (activeTab === 'validator') return 'Validerare';
    if (activeTab === 'api') return 'API-referens';
    if (activeTab === 'company') return 'Organisationsnummer';
    if (activeTab === 'bank_account') return 'Bankkonto';
    return activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
  };

  const getDescription = () => {
    switch(activeTab) {
      case 'validator': return 'Validera svenska personnummer, organisationsnummer och bankkonton.';
      case 'api': return 'Integrera våra generatorer direkt i dina testsviter.';
      default: return 'Generera giltig, verifierbar testdata för svenska system.';
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
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

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <Link href="/" className="hidden lg:flex items-center space-x-2 px-6 py-6 border-b border-gray-100">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Terminal size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">luhn.se</span>
          </Link>

          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Identiteter</div>
            <NavItem href="/" id="personnummer" label="Personnummer" icon={User} />
            <NavItem href="/samordningsnummer" id="samordningsnummer" label="Samordningsnummer" icon={Briefcase} />
            
            <div className="px-3 mt-8 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Företag & Bank</div>
            <NavItem href="/organisation" id="company" label="Organisationsnr" icon={Building2} />
            <NavItem href="/bankgiro" id="bankgiro" label="Bankgiro" icon={CreditCard} />
            <NavItem href="/bank-account" id="bank_account" label="Bankkonto" icon={Wallet} />

            <div className="px-3 mt-8 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Verktyg</div>
            <NavItem href="/validator" id="validator" label="Validerare" icon={ShieldCheck} />
            
            <div className="px-3 mt-8 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Utvecklare</div>
            <NavItem href="/api-docs" id="api" label="API Dokumentation" icon={Code2} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full lg:pt-0 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
                {getTitle()}
              </h1>
              <p className="text-gray-500">
                  {getDescription()}
              </p>
            </div>
            {activeTab !== 'validator' && activeTab !== 'api' && (
                <button 
                onClick={() => fetchData(activeTab)}
                disabled={loading}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 active:scale-95"
                >
                {loading ? 'Genererar...' : 'Generera ny'}
                </button>
            )}
          </div>

          {/* Dynamic Content */}
          <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
            >
            
            {activeTab === 'api' ? (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-8">
                <div className="prose max-w-none text-gray-600">
                  <p className="mb-8">
                    Vårt API är gratis, öppet och CORS-aktiverat. Använd det för att generera testdata programmatiskt i dina CI/CD-pipelines.
                  </p>

                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Server size={20} className="mr-2" />
                    Generering
                  </h3>
                  <EndpointExample 
                    method="GET" 
                    url="/api/generate?type=personnummer" 
                    desc="Generera en slumpmässig syntetisk person med ett giltigt Personnummer."
                  />
                  <EndpointExample 
                    method="GET" 
                    url="/api/generate?type=company" 
                    desc="Generera ett slumpmässigt företag med giltigt Organisationsnummer och Momsnummer."
                  />
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
                    <strong>Typer:</strong> <code>personnummer</code>, <code>samordningsnummer</code>, <code>company</code>, <code>bankgiro</code>, <code>bank_account</code>.
                  </div>

                  <hr className="my-8 border-gray-100"/>

                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <ShieldCheck size={20} className="mr-2" />
                    Validering
                  </h3>
                  <EndpointExample 
                    method="GET" 
                    url="/api/validate?type=ssn&value=199001011234" 
                    desc="Validera ett Personnummer (Längd, Luhn, Datum)."
                  />
                  <EndpointExample 
                    method="GET" 
                    url="/api/validate?type=account&value=8105&value2=123456789" 
                    desc="Validera ett Bankkonto (Clearing + Kontonummer)."
                  />
                </div>
              </div>
            ) : activeTab === 'validator' ? (
                /* Validator Card - Standardized Look */
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Validering</span>
                        <span className="text-xs font-mono text-gray-400">INPUT</span>
                    </div>
                    
                    <div className="p-6">
                        {/* Validator Tabs as Links */}
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8 overflow-x-auto">
                            {[
                                {id: 'ssn', label: 'Personnummer', href: '/validator/personnummer'},
                                {id: 'org', label: 'Organisation', href: '/validator/organisation'},
                                {id: 'vat', label: 'Moms (VAT)', href: '/validator/moms'},
                                {id: 'bg', label: 'Bankgiro', href: '/validator/bankgiro'},
                                {id: 'account', label: 'Bankkonto', href: '/validator/bankkonto'}
                            ].map(t => (
                                <Link
                                    key={t.id}
                                    href={t.href}
                                    className={`flex-1 flex items-center justify-center py-2 px-3 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                                        validatorType === t.id ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {t.label}
                                </Link>
                            ))}
                        </div>

                        <div className="space-y-6">
                            {validatorType === 'account' ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Clearingnummer</label>
                                        <input 
                                            type="text" 
                                            value={valInput}
                                            onChange={(e) => setValInput(e.target.value)}
                                            placeholder="8105"
                                            className="w-full text-xl font-mono p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kontonummer</label>
                                        <input 
                                            type="text" 
                                            value={valInput2}
                                            onChange={(e) => setValInput2(e.target.value)}
                                            placeholder="993422324"
                                            className="w-full text-xl font-mono p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nummer</label>
                                    <input 
                                        type="text" 
                                        value={valInput}
                                        onChange={(e) => setValInput(e.target.value)}
                                        placeholder={validatorType === 'ssn' ? "ÅÅMMDD-XXXX" : "Nummer"}
                                        className="w-full text-xl font-mono p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            )}

                            {/* Result Display */}
                            <div className={`p-4 rounded-xl border flex items-center space-x-4 transition-colors ${
                                valResult?.valid 
                                    ? 'bg-green-50 border-green-200 text-green-800' 
                                    : !valInput && validatorType !== 'account'
                                        ? 'bg-gray-50 border-gray-200 text-gray-500'
                                        : (!valInput || !valInput2) && validatorType === 'account'
                                            ? 'bg-gray-50 border-gray-200 text-gray-500'
                                            : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                                {valResult?.valid ? <Check size={20} /> : <ShieldCheck size={20} />}
                                <span className="font-medium text-base">
                                    {!valResult && !valInput ? 'Ange ett nummer för att validera' : valResult?.valid ? 'Giltigt' : 'Ogiltigt'}
                                </span>
                                {valResult?.error && <span className="text-xs opacity-80">({valResult.error})</span>}
                                {valResult?.bankName && <span className="ml-auto font-bold bg-white/50 px-3 py-1 rounded-md text-xs border border-green-100">{valResult.bankName}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Primary Data Card */
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Resultat</span>
                    <span className="text-xs font-mono text-gray-400">JSON</span>
                </div>
                <div className="p-6">
                    {activeTab === 'personnummer' || activeTab === 'samordningsnummer' ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6">
                        <CodeBlock label="Personnummer" value={data?.ssn} />
                        <div className="grid grid-cols-2 gap-4">
                            <CodeBlock label="Förnamn" value={data?.firstName} />
                            <CodeBlock label="Efternamn" value={data?.lastName} />
                        </div>
                        </div>
                        <div className="space-y-6">
                        <CodeBlock label="Gatuadress" value={data?.address?.street} />
                        <div className="grid grid-cols-2 gap-4">
                            <CodeBlock label="Postnummer" value={data?.address?.zip} />
                            <CodeBlock label="Postort" value={data?.address?.city} />
                        </div>
                        </div>
                    </div>
                    ) : activeTab === 'company' ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6">
                        <CodeBlock label="Organisationsnummer" value={data?.orgNumber} />
                        <CodeBlock label="Företagsnamn" value={data?.name} />
                        </div>
                        <div className="space-y-6">
                        <CodeBlock label="Momsnummer (VAT)" value={data?.vatNumber} />
                        </div>
                    </div>
                    ) : activeTab === 'bankgiro' ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6">
                        <CodeBlock label="Bankgiro" value={data?.bankgiro} />
                        </div>
                        <div className="space-y-6">
                        <CodeBlock label="Bank" value={data?.bank} />
                        </div>
                    </div>
                    ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6">
                        <CodeBlock label="Bank" value={data?.bank} />
                        <CodeBlock label="Clearingnummer" value={data?.clearing} />
                        </div>
                        <div className="space-y-6">
                        <CodeBlock label="Kontonummer" value={data?.account} />
                        </div>
                    </div>
                    )}
                </div>
                </div>
            )}

            {/* Raw JSON View (Hidden for Validator/API) */}
            {activeTab !== 'validator' && activeTab !== 'api' && (
                <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg">
                <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-700/50 flex items-center">
                    <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                    </div>
                    <span className="ml-4 text-xs font-mono text-slate-500">api response</span>
                </div>
                <div className="p-6 overflow-x-auto">
                    <pre className="font-mono text-sm text-slate-300 leading-relaxed">
                    {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
                </div>
            )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}