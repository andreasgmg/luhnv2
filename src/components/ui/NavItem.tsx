import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

const NavItem: React.FC<{ 
  href: string, 
  id: string, 
  label: string, 
  icon: LucideIcon, 
  isActive: boolean, 
  onMobileClick: () => void 
}> = ({ href, label, icon: Icon, isActive, onMobileClick }) => (
  <Link
    href={href}
    onClick={onMobileClick}
    className={`relative w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </Link>
);

export default NavItem;
