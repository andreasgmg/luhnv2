'use client';
import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

const EndpointExample: React.FC<{ method: string, url: string, desc: string }> = ({ method, url, desc }) => {
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{code: number | string, time: number} | null>(null);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Kopierad till urklipp');
  };

  const runRequest = async () => {
    setIsLoading(true);
    try {
      const start = Date.now();
      const res = await fetch(url);
      const data = await res.json();
      const duration = Date.now() - start;
      setStatus({ code: res.status, time: duration });
      setResponse(data);
    } catch (err) {
      setStatus({ code: 'ERR', time: 0 });
      setResponse({ error: 'Kunde inte nå servern' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-8 border border-gray-200 rounded-xl overflow-hidden bg-white text-left">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-bold px-2 py-1 rounded ${method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{method}</span>
            <code className="text-sm font-mono text-gray-700 break-all">{url}</code>
          </div>
          <button onClick={runRequest} disabled={isLoading} className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 disabled:opacity-50">
            {isLoading ? <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <div className="w-0 h-0 border-l-[6px] border-l-gray-600 border-y-[4px] border-y-transparent ml-0.5" />}
            <span>Kör</span>
          </button>
        </div>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
      <div className="bg-slate-900 p-4 font-mono text-xs text-blue-300 overflow-x-auto relative group">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={() => copyToClipboard(`curl "https://luhn.se${url}"`)} className="p-1.5 bg-slate-800 text-slate-400 rounded hover:text-white"><Copy size={12} /></button>
        </div>
        <div>{`curl "https://luhn.se${url}"`}</div>
      </div>
      {response && (
        <div className="border-t border-gray-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Response</span>
            {status && <div className="flex space-x-3 text-xs font-mono"><span className={status.code === 200 ? 'text-green-600' : 'text-red-600'}>{String(status.code)} OK</span><span className="text-gray-400">{status.time}ms</span></div>}
          </div>
          <pre className="font-mono text-xs text-gray-800 overflow-x-auto bg-white p-3 rounded-lg border border-gray-200">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default EndpointExample;
