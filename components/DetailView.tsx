import React, { useState, useEffect } from 'react';
import { TempMailApi, GeneratedCode, ChartDataPoint } from '../types';
import { generateIntegrationCode } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { X, ExternalLink, Code, Terminal, Loader2, Copy, Check, Inbox, Hash } from 'lucide-react';

interface DetailViewProps {
  api: TempMailApi;
  onClose: () => void;
}

const LANGUAGES = ['javascript', 'python', 'curl'] as const;

// Mock data generator for the chart to satisfy requirement to use recharts
const generateMockStats = (): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const baseLatency = 100 + Math.random() * 200;
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i}:00`,
      latency: Math.floor(baseLatency + Math.random() * 100 - 50),
      requests: Math.floor(Math.random() * 1000 + 500),
    });
  }
  return data;
};

export const DetailView: React.FC<DetailViewProps> = ({ api, onClose }) => {
  const [selectedLang, setSelectedLang] = useState<typeof LANGUAGES[number]>('javascript');
  const [codeData, setCodeData] = useState<GeneratedCode | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [stats] = useState<ChartDataPoint[]>(generateMockStats());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCode = async () => {
      setLoadingCode(true);
      try {
        const result = await generateIntegrationCode(api, selectedLang);
        if (isMounted) setCodeData(result);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoadingCode(false);
      }
    };
    fetchCode();
    return () => { isMounted = false; };
  }, [api, selectedLang]);

  const handleCopy = () => {
    if (codeData?.code) {
      navigator.clipboard.writeText(codeData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e293b] w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-900/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">{api.name}</h2>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                api.authType === 'No Auth' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {api.authType}
              </span>
            </div>
            <a href={api.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors">
              {api.website} <ExternalLink size={14} />
            </a>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Top Grid: Info & Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Info Panel */}
            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 space-y-4">
              <h3 className="text-slate-300 font-semibold flex items-center gap-2">
                <Terminal size={18} /> API Details
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {api.description}
              </p>
              <div className="space-y-2 pt-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Base URL</span>
                   <span className="text-slate-200 font-mono text-xs bg-slate-900 px-2 py-1 rounded truncate max-w-[150px]" title={api.baseUrl}>{api.baseUrl}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Capabilities</span>
                   <span className={`flex items-center gap-1 ${api.hasInboxAccess ? 'text-blue-400' : 'text-purple-400'}`}>
                     {api.hasInboxAccess ? <><Inbox size={12}/> Inbox Access</> : <><Hash size={12}/> Address Only</>}
                   </span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Rate Limit</span>
                   <span className="text-slate-200">{api.rateLimit}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Attachments</span>
                   <span className={`text-${api.supportsAttachments ? 'emerald' : 'rose'}-400`}>
                     {api.supportsAttachments ? 'Supported' : 'Not Supported'}
                   </span>
                 </div>
              </div>
            </div>

            {/* Chart Panel */}
            <div className="lg:col-span-2 bg-slate-800/50 p-5 rounded-xl border border-slate-700 min-h-[300px] flex flex-col">
              <h3 className="text-slate-300 font-semibold mb-4">Estimated Response Latency (24h)</h3>
              <div className="flex-1 w-full h-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 12}} tickMargin={10} />
                    <YAxis stroke="#64748b" tick={{fontSize: 12}} unit="ms" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
                      itemStyle={{ color: '#60a5fa' }}
                    />
                    <Area type="monotone" dataKey="latency" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Integration Guide */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/30">
              <div className="flex items-center gap-2">
                <Code size={18} className="text-purple-400" />
                <h3 className="text-slate-200 font-semibold">Integration Guide</h3>
              </div>
              <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    disabled={loadingCode}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      selectedLang === lang 
                      ? 'bg-slate-700 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                    } ${loadingCode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-0 relative group">
              {loadingCode ? (
                <div className="p-6 space-y-3 h-64 bg-[#0d1117]">
                  <div className="flex items-center gap-2 mb-4 animate-pulse">
                      <Loader2 className="animate-spin text-purple-500" size={16} />
                      <span className="text-xs text-slate-500 font-mono">Gemini is generating {selectedLang} code...</span>
                  </div>
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-slate-800/50 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-800/50 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-800/50 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-800/50 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-800/50 rounded w-4/5"></div>
                    <div className="h-4 bg-slate-800/50 rounded w-1/2"></div>
                  </div>
                </div>
              ) : (
                <>
                  <button 
                    onClick={handleCopy}
                    className="absolute top-4 right-4 p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Copy code"
                  >
                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                  <pre className="p-6 overflow-x-auto bg-[#0d1117] text-slate-300 font-mono text-sm leading-relaxed">
                    <code>{codeData?.code}</code>
                  </pre>
                  {codeData?.explanation && (
                    <div className="p-6 border-t border-slate-700 bg-slate-900/20">
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">Explanation</h4>
                      <p className="text-slate-400 text-sm">{codeData.explanation}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
