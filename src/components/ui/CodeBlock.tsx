'use client';
import React from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface CodeBlockProps {
  label: string;
  value: string | number | undefined;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ label, value }) => {
  const displayValue = String(value || '...');

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(String(value));
    toast.success('Kopierad till urklipp');
  };

  return (
    <div className="group relative text-left">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </label>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Kopiera ${label}: ${displayValue}`}
        className="w-full relative flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 text-left cursor-pointer hover:border-blue-500 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <code className="font-mono text-sm text-gray-900 break-all">
          {displayValue}
        </code>
        <div className="ml-4 p-1.5 bg-gray-50 rounded-md text-gray-400 group-hover:text-blue-500 transition-colors shrink-0">
          <Copy size={14} />
        </div>
      </button>
    </div>
  );
};

export default CodeBlock;