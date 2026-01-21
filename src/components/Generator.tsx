'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { Identity, Person, Company, BankAccount, Bankgiro, Plusgiro, OCR, LicensePlate, SwishNumber, MobileNumber } from '../lib/data-provider';
import CodeBlock from './ui/CodeBlock';
import DotGridBackground from './ui/DotGridBackground';
import { Download, FileJson, FileSpreadsheet, FileCode, Filter, X } from 'lucide-react';

interface GeneratorProps {
  type: string;
}

// Fetcher function for SWR with better error handling
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    // Throw an error with the server message if available
    throw new Error(errorData.error || errorData.message || 'Kunde inte hämta data');
  }
  return res.json();
};

export default function Generator({ type }: GeneratorProps) {
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState<'json' | 'csv' | 'xml'>('json');
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [gender, setGender] = useState<'any' | 'male' | 'female'>('any');
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');

  const isPersonType = type === 'personnummer' || type === 'samordningsnummer';

  // Construct query params
  const getQueryParams = () => {
    const params = new URLSearchParams();
    params.set('type', type);
    
    if (count > 1) {
        params.set('count', count.toString());
        params.set('format', format);
    }

    if (isPersonType) {
        if (gender !== 'any') params.set('gender', gender);
        
        const currentYear = new Date().getFullYear();
        if (minAge) params.set('maxYear', (currentYear - parseInt(minAge)).toString());
        if (maxAge) params.set('minYear', (currentYear - parseInt(maxAge)).toString());
    }

    return params.toString();
  };

  const { data, error, isLoading, mutate } = useSWR<Identity>(
    count === 1 ? `/api/generate?${getQueryParams()}` : null, 
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      onError: (err) => {
          // Show the actual error message from the server (e.g. "Too many requests")
          toast.error(err.message || "Kunde inte generera data");
      }
    }
  );

  const handleGenerate = () => {
    if (count === 1) {
      mutate(); 
    } else {
      const url = `/api/generate?${getQueryParams()}`;
      window.location.href = url;
      toast.success(`Laddar ner ${count} ${type} i ${format.toUpperCase()}-format`);
    }
  };

  const getTitle = () => {
    switch(type) {
      case 'personnummer': return 'Personnummer';
      case 'samordningsnummer': return 'Samordningsnummer';
      case 'company': return 'Organisationsnummer';
      case 'bankgiro': return 'Bankgiro';
      case 'plusgiro': return 'Plusgiro';
      case 'bank_account': return 'Bankkonto';
      case 'ocr': return 'OCR-nummer';
      case 'car-plate': return 'Registreringsskylt';
      case 'swish': return 'Swish-nummer';
      case 'mobile': return 'Mobilnummer';
      default: return 'Generera';
    }
  };

  const getDescription = () => {
    switch(type) {
      case 'personnummer': return 'Testa dina kundflöden med kompletta profiler. Vi genererar giltiga personnummer parade med matchande namn och riktiga svenska adresser.';
      case 'samordningsnummer': return 'Validera stöd för individer som inte är folkbokförda i Sverige. Vi följer Skatteverkets standard (dag + 60) för korrekta KYC- och onboarding-tester.';
      case 'company': return 'Mocka B2B-flöden med realistiska bolag. Vi genererar matematiskt korrekta organisationsnummer och matchande SE-momsnummer (VAT).';
      case 'bankgiro': return 'Säkra dina betalningstester. Vi använder Bankgirots dedikerade testserie (998-xxxx) för att garantera att du aldrig råkar använda ett skarpt nummer.';
      case 'plusgiro': return 'Generera giltiga svenska plusgironummer för test av äldre betalsystem.';
      case 'bank_account': return 'Generera kontonummer som passerar bankernas validering. Vi stöder korrekta clearing-serier för SEB, Swedbank, Nordea, Handelsbanken m.fl.';
      case 'ocr': return 'Testa OCR-validering i dina betalflöden. Vi skapar giltiga referensnummer med Luhn-kontroll och valfri längdcheck (hård/mjuk kontroll).';
      case 'car-plate': return 'Generera giltiga svenska registreringsnummer (MLB-serien) för säker testning. Stödjer både gammalt (123) och nytt (12D) format.';
      case 'swish': return 'Testa betalflöden med giltiga 123-nummer för företag och föreningar.';
      case 'mobile': return 'Generera säkra mobilnummer från PTS reserverade testserie (070-174xxxx).';
      default: return 'Generera giltig, verifierbar testdata för svenska system.';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <DotGridBackground />
      
      <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-10 gap-8 text-left">
        <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">{getTitle()}</h1>
            <p className="text-gray-500 mb-6">{getDescription()}</p>
            
            {isPersonType && (
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                        <Filter size={16} />
                        <span>Filter</span>
                        {showFilters && <X size={14} className="ml-1 opacity-50" />}
                    </button>
                </div>
            )}

            <AnimatePresence>
                {showFilters && isPersonType && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Kön</label>
                                <select 
                                    value={gender} 
                                    onChange={(e) => setGender(e.target.value as any)}
                                    className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="any">Alla</option>
                                    <option value="male">Man</option>
                                    <option value="female">Kvinna</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Min Ålder</label>
                                <input 
                                    type="number" 
                                    placeholder="0"
                                    value={minAge}
                                    onChange={(e) => setMinAge(e.target.value)}
                                    className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Max Ålder</label>
                                <input 
                                    type="number" 
                                    placeholder="100"
                                    value={maxAge}
                                    onChange={(e) => setMaxAge(e.target.value)}
                                    className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        
        <div className="flex flex-col space-y-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm min-w-[300px]">
            {/* Controls */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Antal: <span className="text-blue-600 font-bold">{count}</span></span>
                <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={count} 
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
            </div>

            {count > 1 && (
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setFormat('json')} className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all ${format === 'json' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        <FileJson size={14} className="mr-1.5" /> JSON
                    </button>
                    <button onClick={() => setFormat('csv')} className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all ${format === 'csv' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        <FileSpreadsheet size={14} className="mr-1.5" /> CSV
                    </button>
                    <button onClick={() => setFormat('xml')} className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all ${format === 'xml' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        <FileCode size={14} className="mr-1.5" /> XML
                    </button>
                </div>
            )}

            <button 
                onClick={handleGenerate} 
                disabled={isLoading && count === 1} 
                className={`w-full inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-lg transition-all active:scale-95 whitespace-nowrap shadow-md ${count > 1 ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20' : 'bg-black hover:bg-gray-800 text-white'}`}
            >
                {count > 1 ? (
                    <>
                        <Download size={18} className="mr-2" />
                        Ladda ner {count} st
                    </>
                ) : (
                    isLoading ? 'Genererar...' : 'Generera ny'
                )}
            </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {count === 1 && (
            <motion.div 
                key={type + (data ? 'loaded' : 'loading')} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                transition={{ duration: 0.2 }} 
                className="space-y-8"
            >
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Resultat</span>
                        <span className="text-xs font-mono text-gray-400">JSON</span>
                    </div>
                    <div className="p-6">
                        {type === 'personnummer' || type === 'samordningsnummer' ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-6">
                            <CodeBlock label="Personnummer" value={(data as Person)?.ssn} />
                            <div className="grid grid-cols-2 gap-4"><CodeBlock label="Förnamn" value={(data as Person)?.firstName} /><CodeBlock label="Efternamn" value={(data as Person)?.lastName} /></div>
                            </div>
                            <div className="space-y-6">
                            <CodeBlock label="Gatuadress" value={(data as Person)?.address?.street} />
                            <div className="grid grid-cols-2 gap-4"><CodeBlock label="Postnummer" value={(data as Person)?.address?.zip} /><CodeBlock label="Postort" value={(data as Person)?.address?.city} /></div>
                            </div>
                        </div>
                        ) : type === 'company' ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-6"><CodeBlock label="Organisationsnummer" value={(data as Company)?.orgNumber} /><CodeBlock label="Företagsnamn" value={(data as Company)?.name} /></div>
                            <div className="space-y-6"><CodeBlock label="Momsnummer (VAT)" value={(data as Company)?.vatNumber} /></div>
                        </div>
                        ) : type === 'bankgiro' || type === 'plusgiro' ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-6">
                                <CodeBlock 
                                    label={type === 'bankgiro' ? "Bankgiro" : "Plusgiro"} 
                                    value={type === 'bankgiro' ? (data as Bankgiro)?.bankgiro : (data as Plusgiro)?.plusgiro} 
                                />
                            </div>
                            <div className="space-y-6">
                                <CodeBlock 
                                    label="Bank" 
                                    value={type === 'bankgiro' ? (data as Bankgiro)?.bank : (data as Plusgiro)?.bank} 
                                />
                            </div>
                        </div>
                        ) : type === 'ocr' ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-6"><CodeBlock label="OCR-nummer" value={(data as OCR)?.ocr} /></div>
                            <div className="space-y-6"><CodeBlock label="Längd" value={(data as OCR)?.length} /></div>
                        </div>
                        ) : type === 'car-plate' ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-6"><CodeBlock label="Registreringsnummer" value={(data as LicensePlate)?.plate} /></div>
                        </div>
                        ) : type === 'swish' ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-6"><CodeBlock label="Swish-nummer" value={(data as SwishNumber)?.swish} /></div>
                        </div>
                        ) : type === 'mobile' ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-6"><CodeBlock label="Mobilnummer (Test)" value={(data as MobileNumber)?.mobile} /></div>
                        </div>
                        ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-6"><CodeBlock label="Bank" value={(data as BankAccount)?.bank} /><CodeBlock label="Clearingnummer" value={(data as BankAccount)?.clearing} /></div>
                            <div className="space-y-6"><CodeBlock label="Kontonummer" value={(data as BankAccount)?.account} /></div>
                        </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg text-left">
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
                            {data ? JSON.stringify(data, null, 2) : error ? error.message : 'Loading...'}
                        </pre>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
