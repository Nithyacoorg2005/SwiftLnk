import React, { useState } from 'react';
import axios from 'axios';
import { Link2, Copy, CheckCircle, ExternalLink, BarChart3 } from 'lucide-react';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {

      const response = await axios.post('http://localhost:3000/shorten', { longUrl: url });
      setShortUrl(response.data.shortUrl);
    } catch (err) {
      alert("CORS Error or Server Offline. Check if backend is running!");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/20">
            <Link2 size={48} strokeWidth={2.5} />
          </div>
        </div>
        
        <h1 className="text-6xl font-black tracking-tight italic">
          SWIFT<span className="text-blue-500">LNK</span>
        </h1>
        <p className="text-slate-400 text-xl font-medium">Production-grade URL shortening. Powered by Redis.</p>

        <form onSubmit={handleSubmit} className="relative mt-10">
          <input
            type="url"
            placeholder="Paste your long link here..."
            className="w-full bg-slate-900 border-2 border-slate-800 p-6 rounded-2xl outline-none focus:border-blue-500 transition-all text-lg pr-40"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-3 bottom-3 px-8 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? '...' : 'Shorten'}
          </button>
        </form>

        {shortUrl && (
          <div className="mt-12 p-8 bg-slate-900/50 border-2 border-blue-500/30 rounded-3xl backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-6 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-start overflow-hidden w-full">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Your Short Link</span>
              <span className="text-blue-400 text-2xl font-bold truncate w-full text-left">{shortUrl}</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={copyToClipboard}
                className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all"
              >
                {copied ? <CheckCircle size={24} className="text-green-500" /> : <Copy size={24} />}
              </button>
              <a 
                href={shortUrl} 
                target="_blank" 
                className="p-4 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-2xl transition-all border border-blue-500/20"
              >
                <ExternalLink size={24} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
