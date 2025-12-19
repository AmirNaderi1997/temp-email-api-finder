import React, { useEffect, useState } from 'react';
import { TempMailApi } from './types';
import { fetchTempMailApis } from './services/geminiService';
import { DetailView } from './components/DetailView';
import { Mail, Search, RefreshCw, Zap, Shield, ArrowRight, Inbox, Hash, Filter } from 'lucide-react';

type FilterType = 'all' | 'inbox' | 'address';

const App: React.FC = () => {
  const [apis, setApis] = useState<TempMailApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApi, setSelectedApi] = useState<TempMailApi | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchTempMailApis();
    setApis(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredApis = apis.filter(api => {
    const matchesSearch = 
      api.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      api.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ? true :
      filterType === 'inbox' ? api.hasInboxAccess :
      !api.hasInboxAccess;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        
        {/* Header */}
        <header className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-medium text-slate-400 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Powered by Gemini AI
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
            TempMail <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">API Scout</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Discover and integrate free disposable email services. Filter by inbox capability to find the perfect tool for your testing needs.
          </p>
        </header>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-6 mb-10 justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search APIs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700 w-full sm:w-auto">
              <button 
                onClick={() => setFilterType('all')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'all' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Filter size={14} /> All
              </button>
              <button 
                onClick={() => setFilterType('inbox')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'inbox' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Inbox size={14} /> Inbox
              </button>
              <button 
                onClick={() => setFilterType('address')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'address' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Hash size={14} /> Address Only
              </button>
            </div>
          </div>

          <button 
            onClick={loadData} 
            disabled={loading}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all active:scale-95 disabled:opacity-50 text-sm font-medium whitespace-nowrap"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-800/30 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApis.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
                    <div className="bg-slate-800/50 p-4 rounded-full mb-4">
                      <Filter size={32} />
                    </div>
                    <p className="text-lg font-medium">No APIs found matching your criteria.</p>
                    <p className="text-sm mt-2">Try adjusting the filter or search term.</p>
                </div>
            ) : (
                filteredApis.map((api, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedApi(api)}
                    className="group relative bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl border transition-colors ${
                        api.hasInboxAccess 
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                          : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                      }`}>
                        {api.hasInboxAccess ? <Inbox size={24} /> : <Hash size={24} />}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${
                        api.authType === 'No Auth' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {api.authType}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {api.name}
                    </h3>
                    
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow">
                      {api.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-6">
                      <div className="flex items-center gap-1.5">
                        <Zap size={14} />
                        <span>{api.rateLimit}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Shield size={14} />
                        <span>{api.baseUrl.startsWith('https') ? 'HTTPS Secured' : 'HTTP'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm font-medium mt-auto pt-4 border-t border-slate-700/50">
                      <span className={api.hasInboxAccess ? "text-blue-400" : "text-purple-400"}>
                        {api.hasInboxAccess ? "Inbox Supported" : "Address Gen Only"}
                      </span>
                      <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform group-hover:text-white" />
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} TempMail API Scout. Images by Picsum.</p>
          <p className="mt-2">Generated with Google Gemini.</p>
        </footer>

      </div>

      {selectedApi && (
        <DetailView api={selectedApi} onClose={() => setSelectedApi(null)} />
      )}
    </div>
  );
};

export default App;
