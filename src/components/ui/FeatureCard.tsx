import React from 'react';
import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';

const FeatureCard: React.FC<{ href: string, title: string, desc: string, icon: LucideIcon }> = ({ href, title, desc, icon: Icon }) => (
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

export default FeatureCard;
