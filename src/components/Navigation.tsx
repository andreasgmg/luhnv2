'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, X, Terminal, Briefcase, User, Building2, 
  CreditCard, ShieldCheck, Wallet, Code2, Home, 
  Heart, ScanLine, LucideIcon
} from 'lucide-react';
import NavItem from './ui/NavItem';

interface NavGroup {
  group: string;
  items: { href: string; id: string; label: string; icon: LucideIcon }[];
}

const NAV_ITEMS: NavGroup[] = [
  { group: 'Start', items: [{ href: '/', id: 'home', label: 'Översikt', icon: Home }] },
  { group: 'Identiteter', items: [
    { href: '/personnummer', id: 'personnummer', label: 'Personnummer', icon: User },
    { href: '/samordningsnummer', id: 'samordningsnummer', label: 'Samordningsnummer', icon: Briefcase }
  ]},
  { group: 'Företag & Bank', items: [
    { href: '/organisation', id: 'company', label: 'Organisationsnr', icon: Building2 },
    { href: '/bankgiro', id: 'bankgiro', label: 'Bankgiro', icon: CreditCard },
    { href: '/plusgiro', id: 'plusgiro', label: 'Plusgiro', icon: CreditCard },
    { href: '/bank-account', id: 'bank_account', label: 'Bankkonto', icon: Wallet },
    { href: '/ocr', id: 'ocr', label: 'OCR-nummer', icon: ScanLine }
  ]},
  { group: 'Verktyg', items: [{ href: '/validator', id: 'validator', label: 'Validerare', icon: ShieldCheck }] },
  { group: 'Utvecklare', items: [{ href: '/api-docs', id: 'api', label: 'API Dokumentation', icon: Code2 }] }
];

export default function Navigation() {
  const pathname = usePathname() || '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper to determine active state
  // We check if the pathname starts with the href, but handle the root '/' specially
  const isActive = (href: string) => {
      if (href === '/') return pathname === '/';
      return pathname.startsWith(href);
  };

  return (
    <>
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
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-200 ease-in-out lg:translate-x-0 
        lg:static lg:inset-auto lg:h-full flex-shrink-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <Link href="/" className="hidden lg:flex items-center space-x-2 px-6 py-6 border-b border-gray-100 flex-shrink-0">
            <div className="bg-blue-600 p-1.5 rounded-lg"><Terminal size={20} className="text-white" /></div>
            <span className="text-lg font-bold text-gray-900">luhn.se</span>
          </Link>

          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {NAV_ITEMS.map((group, idx) => (
              <React.Fragment key={idx}>
                <div className={`px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left ${idx > 0 ? 'mt-8' : ''}`}>
                  {group.group}
                </div>
                {group.items.map(item => (
                  <NavItem 
                    key={item.id} 
                    {...item} 
                    isActive={isActive(item.href)} 
                    onMobileClick={() => setMobileMenuOpen(false)} 
                  />
                ))}
              </React.Fragment>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100">
            <Link 
              href="https://github.com/sponsors/andreasgmg" 
              target="_blank"
              className="flex items-center justify-center space-x-2 w-full py-2 px-4 bg-white border border-red-100 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors shadow-sm shadow-red-500/5"
            >
              <Heart size={14} className="fill-red-500" />
              <span>Stöd projektet</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
