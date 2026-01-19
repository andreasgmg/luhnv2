'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, ShieldCheck } from 'lucide-react';
import { ValidationResult } from '../lib/validators';

const VALIDATOR_TABS = [
  { id: 'ssn', label: 'Personnummer', href: '/validator/personnummer' },
  { id: 'org', label: 'Organisation', href: '/validator/organisation' },
  { id: 'vat', label: 'Moms (VAT)', href: '/validator/moms' },
  { id: 'zip', label: 'Adress', href: '/validator/adress' },
  { id: 'bg', label: 'Bankgiro', href: '/validator/bankgiro' },
  { id: 'pg', label: 'Plusgiro', href: '/validator/plusgiro' },
  { id: 'account', label: 'Bankkonto', href: '/validator/bankkonto' }
];

export default function Validator() {
  const pathname = usePathname() || '';
  const [valInput, setValInput] = useState('');
  const [valInput2, setValInput2] = useState(''); 
  const [valResult, setValResult] = useState<ValidationResult | null>(null);

  const activeType = VALIDATOR_TABS.find(t => pathname.includes(t.href))?.id || 'ssn';

  useEffect(() => {
    setValInput('');
    setValInput2('');
    setValResult(null);
  }, [activeType]);

  useEffect(() => {
    const performVal = async () => {
        if (!valInput && activeType !== 'account') { setValResult(null); return; }
        if (activeType === 'account' && (!valInput || !valInput2)) { setValResult(null); return; }
        
        try {
            let url = '';
            if (activeType === 'zip') url = `/api/validate/zip?zip=${valInput}`;
            else if (activeType === 'ssn') url = `/api/validate/personnummer?id=${valInput}`;
            else if (activeType === 'org') url = `/api/validate/organisation?id=${valInput}`;
            else if (activeType === 'vat') url = `/api/validate/vat?id=${valInput}`;
            else if (activeType === 'bg') url = `/api/validate/bankgiro?id=${valInput}`;
            else if (activeType === 'pg') url = `/api/validate/plusgiro?id=${valInput}`;
            else if (activeType === 'account') url = `/api/validate/bank-account?clearing=${valInput}&account=${valInput2}`;

            if (url) {
                const res = await fetch(url);
                const data = await res.json();
                setValResult(data);
            }
        } catch (e) {
            setValResult({ valid: false, error: 'Kunde inte nå servern' });
        }
    };
    
    const timer = setTimeout(performVal, 300);
    return () => clearTimeout(timer);
  }, [activeType, valInput, valInput2]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Validering</span>
            <span className="text-xs font-mono text-gray-400">INPUT</span>
        </div>
        <div className="p-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8 overflow-x-auto">
                {VALIDATOR_TABS.map(t => (
                    <Link key={t.id} href={t.href} className={`flex-1 flex items-center justify-center py-2 px-3 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${activeType === t.id ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t.label}</Link>
                ))}
            </div>
            <div className="space-y-6 text-left">
                {activeType === 'account' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Clearingnummer</label><input type="text" value={valInput} onChange={(e) => setValInput(e.target.value)} placeholder="8105" className="w-full text-xl font-mono p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                        <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kontonummer</label><input type="text" value={valInput2} onChange={(e) => setValInput2(e.target.value)} placeholder="993422324" className="w-full text-xl font-mono p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                    </div>
                ) : (
                    <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{activeType === 'zip' ? 'Postnummer' : 'Nummer'}</label><input type="text" value={valInput} onChange={(e) => setValInput(e.target.value)} placeholder={activeType === 'ssn' ? "ÅÅMMDD-XXXX" : activeType === 'zip' ? "111 22" : "Nummer"} className="w-full text-xl font-mono p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                )}
                <div className={`p-4 rounded-xl border flex items-center space-x-4 transition-colors ${valResult?.valid ? 'bg-green-50 border-green-200 text-green-800' : !valInput && activeType !== 'account' ? 'bg-gray-50 border-gray-200 text-gray-500' : (!valInput || !valInput2) && activeType === 'account' ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {valResult?.valid ? <Check size={20} /> : <ShieldCheck size={20} />}
                    <span className="font-medium text-base">{!valResult && !valInput ? 'Ange ett nummer för att validera' : valResult?.valid ? 'Giltigt' : 'Ogiltigt'}</span>
                    {valResult?.error && <span className="text-xs opacity-80">({valResult.error})</span>}
                    {valResult?.bankName && <span className="ml-auto font-bold bg-white/50 px-3 py-1 rounded-md text-xs border border-green-100">{valResult.bankName}</span>}
                </div>
            </div>
        </div>
    </div>
  );
}
