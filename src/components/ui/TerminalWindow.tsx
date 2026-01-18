import React from 'react';
import CopyButton from './CopyButton';

const TerminalWindow: React.FC = () => (
  <div className="relative z-10 rounded-xl overflow-hidden bg-[#0d1117] border border-gray-800 shadow-2xl ring-1 ring-white/10 text-left">
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
    <div className="p-6 font-mono text-sm leading-relaxed text-gray-300">
      <div className="flex items-start mb-4 group">
        <span className="text-gray-500 mr-3 select-none">$</span>
        <div className="flex-1">
          <span className="text-purple-400">curl</span>
          <span className="text-gray-300 ml-2">{`"https://luhn.se/api/generate?type=personnummer"`}</span>
        </div>
        <CopyButton text='curl "https://luhn.se/api/generate?type=personnummer"' />
      </div>
      <div>
        <span className="block text-gray-500 select-none mb-1"># Output</span>
        <span className="block text-[#e6edf3]">{`{`}</span>
        <span className="block text-[#e6edf3] ml-4">
          <span className="text-[#7ee787]">{`"ssn"`}</span>: <span className="text-[#a5d6ff]">{`"19900505-1234"`}</span>,
        </span>
        <span className="block text-[#e6edf3] ml-4">
          <span className="text-[#7ee787]">{`"firstName"`}</span>: <span className="text-[#a5d6ff]">{`"Johan"`}</span>,
        </span>
        <span className="block text-[#e6edf3] ml-4">
          <span className="text-[#7ee787]">{`"valid"`}</span>: <span className="text-[#79c0ff]">true</span>
        </span>
        <span className="block text-[#e6edf3]">{`}`}</span>
      </div>
    </div>
  </div>
);

export default TerminalWindow;
