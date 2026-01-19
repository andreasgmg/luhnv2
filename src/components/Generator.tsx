'use client';
import React from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { Identity, Person, Company, BankAccount, Bankgiro, Plusgiro, OCR } from '../lib/data-provider';
import CodeBlock from './ui/CodeBlock';
import DotGridBackground from './ui/DotGridBackground';

interface GeneratorProps {
  type: string;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Kunde inte hämta data');
  }
  return res.json();
};

export default function Generator({ type }: GeneratorProps) {
  // useSWR handles loading, error, and caching automatically
  // We use revalidateOnFocus: false because this is random static data
  const { data, error, isLoading, mutate } = useSWR<Identity>(
    `/api/generate?type=${type}`, 
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      onError: () => toast.error("Kunde inte generera data")
    }
  );

  const handleGenerate = () => {
    // mutate() triggers a re-fetch and updates the cache
    mutate(); 
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
      default: return 'Generera';
    }
  };

  const getDescription = () => {
    switch(type) {
      case 'personnummer': return 'Testa dina kundflöden med kompletta profiler. Vi genererar giltiga personnummer parade med matchande namn och riktiga svenska adresser.';
      case 'samordningsnummer': return 'Validera stöd för individer utan personnummer. Vi följer Skatteverkets standard (dag + 60) för korrekta KYC- och onboarding-tester.';
      case 'company': return 'Mocka B2B-flöden med realistiska bolag. Vi genererar matematiskt korrekta organisationsnummer och matchande SE-momsnummer (VAT).';
      case 'bankgiro': return 'Säkra dina betalningstester. Vi använder Bankgirots dedikerade testserie (998-xxxx) för att garantera att du aldrig råkar använda ett skarpt nummer.';
      case 'plusgiro': return 'Generera giltiga svenska plusgironummer för test av äldre betalsystem.';
      case 'bank_account': return 'Generera kontonummer som passerar bankernas validering. Vi stöder korrekta clearing-serier för SEB, Swedbank, Nordea, Handelsbanken m.fl.';
      case 'ocr': return 'Testa OCR-validering i dina betalflöden. Vi skapar giltiga referensnummer med Luhn-kontroll och valfri längdcheck (hård/mjuk kontroll).';
      default: return 'Generera giltig, verifierbar testdata för svenska system.';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <DotGridBackground />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4 text-left">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">{getTitle()}</h1>
            <p className="text-gray-500">{getDescription()}</p>
        </div>
        <button 
            onClick={handleGenerate} 
            disabled={isLoading} 
            className="inline-flex items-center justify-center px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 active:scale-95 whitespace-nowrap"
        >
            {isLoading ? 'Genererar...' : 'Generera ny'}
        </button>
      </div>

      <AnimatePresence mode="wait">
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
                        {data ? JSON.stringify(data, null, 2) : error ? 'Error fetching data' : 'Loading...'}
                    </pre>
                </div>
            </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
