'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, ShieldCheck, Loader2 } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { 
    validatePersonnummer, 
    validateOrgNumber, 
    validateVAT, 
    validateBankgiro, 
    validatePlusgiro,
    validateBankAccount,
    validateCarPlate,
    validateSwish,
    ValidationResult
} from '../lib/validators';

const VALIDATOR_TABS = [
  { id: 'ssn', label: 'Personnummer', href: '/validator/personnummer' },
  { id: 'org', label: 'Organisation', href: '/validator/organisation' },
  { id: 'vat', label: 'Moms (VAT)', href: '/validator/moms' },
  { id: 'zip', label: 'Postnummer', href: '/validator/postnummer' },
  { id: 'swish', label: 'Swish', href: '/validator/swish' },
  { id: 'bg', label: 'Bankgiro', href: '/validator/bankgiro' },
  { id: 'pg', label: 'Plusgiro', href: '/validator/plusgiro' },
  { id: 'account', label: 'Bankkonto', href: '/validator/bankkonto' },
  { id: 'license-plate', label: 'Registreringsnr', href: '/validator/license-plate' }
];

export default function Validator() {
  const pathname = usePathname() || '';
  const [valInput, setValInput] = useState('');
  const [valInput2, setValInput2] = useState(''); 
  const [valResult, setValResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const activeType = VALIDATOR_TABS.find(t => pathname.includes(t.href))?.id || 'ssn';
  const debouncedInput = useDebounce(valInput, 300);
  const debouncedInput2 = useDebounce(valInput2, 300);

  useEffect(() => {
    setValInput('');
    setValInput2('');
    setValResult(null);
  }, [activeType]);

  useEffect(() => {
    const performVal = async () => {
        if (!debouncedInput && activeType !== 'account') { setValResult(null); return; }
        if (activeType === 'account' && (!debouncedInput || !debouncedInput2)) { setValResult(null); return; }
        
        setLoading(true);
        let res: ValidationResult = { valid: false };
        
        try {
            if (activeType === 'zip') {
                const apiRes = await fetch(`/api/validate/zip?zip=${debouncedInput}`);
                res = await apiRes.json();
            } else if (activeType === 'ssn') res = validatePersonnummer(debouncedInput);
            else if (activeType === 'org') res = validateOrgNumber(debouncedInput);
            else if (activeType === 'vat') res = validateVAT(debouncedInput);
            else if (activeType === 'bg') res = validateBankgiro(debouncedInput);
            else if (activeType === 'pg') res = validatePlusgiro(debouncedInput);
            else if (activeType === 'account') res = validateBankAccount(debouncedInput, debouncedInput2);
            else if (activeType === 'license-plate') res = validateCarPlate(debouncedInput);
            else if (activeType === 'swish') res = validateSwish(debouncedInput);
        } catch (e) {
            res = { valid: false, error: 'Valideringsfel' };
        } finally {
            setValResult(res);
            setLoading(false);
        }
    };
    performVal();
  }, [activeType, debouncedInput, debouncedInput2]);

  const getLabels = (type: string) => {
      switch(type) {
          case 'ssn': return { label: 'Personnummer', placeholder: 'ÅÅMMDD-XXXX' };
          case 'org': return { label: 'Organisationsnummer', placeholder: '556XXX-XXXX' };
          case 'vat': return { label: 'Momsnummer', placeholder: 'SE556XXXXXXXX01' };
          case 'zip': return { label: 'Postnummer', placeholder: '111 22' };
          case 'swish': return { label: 'Swish-nummer', placeholder: '123 XXX XXXX' };
          case 'bg': return { label: 'Bankgiro', placeholder: '5XXX-XXXX' };
          case 'pg': return { label: 'Plusgiro', placeholder: '28 65 43-4' };
          case 'license-plate': return { label: 'Registreringsnummer', placeholder: 'ABC 123' };
          case 'account': return { label: 'Kontonummer', placeholder: '' };
          default: return { label: 'Nummer', placeholder: 'Nummer' };
      }
  };

  const { label, placeholder } = getLabels(activeType);

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
            <div className="space-y-6">
                {activeType === 'account' ? (
                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Clearingnummer</label><input type="text" value={valInput} onChange={(e) => setValInput(e.target.value)} placeholder="8105" className="w-full text-xl font-mono p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                        <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kontonummer</label><input type="text" value={valInput2} onChange={(e) => setValInput2(e.target.value)} placeholder="993422324" className="w-full text-xl font-mono p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                    </div>
                ) : (
                    <div className="text-left">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
                        <input type="text" value={valInput} onChange={(e) => setValInput(e.target.value)} placeholder={placeholder} className="w-full text-xl font-mono p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                )}
                <div className={`p-4 rounded-xl border flex items-center space-x-4 transition-colors ${loading ? 'bg-gray-50 border-gray-200 text-gray-500' : valResult?.valid ? 'bg-green-50 border-green-200 text-green-800' : !valInput && activeType !== 'account' ? 'bg-gray-50 border-gray-200 text-gray-500' : (!valInput || !valInput2) && activeType === 'account' ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {loading ? <Loader2 size={20} className="animate-spin" /> : valResult?.valid ? <Check size={20} /> : <ShieldCheck size={20} />}
                    <span className="font-medium text-base">{loading ? 'Validerar...' : !valResult && !valInput ? `Ange ett ${label.toLowerCase()} för att validera` : valResult?.valid ? 'Giltigt' : 'Ogiltigt'}</span>
                    {valResult?.error && <span className="text-xs opacity-80">({valResult.error})</span>}
                    {valResult?.bankName && <span className="ml-auto font-bold bg-white/50 px-3 py-1 rounded-md text-xs border border-green-100">{valResult.bankName}</span>}
                    {valResult?.city && <span className="ml-auto font-bold bg-white/50 px-3 py-1 rounded-md text-xs border border-green-100">{valResult.city}</span>}
                    {valResult?.format && <span className="ml-auto font-bold bg-white/50 px-3 py-1 rounded-md text-xs border border-green-100">{valResult.format === 'old' ? 'Gammalt format (123)' : 'Nytt format (12D)'}</span>}
                </div>
            </div>
        </div>
    </div>
  );
}