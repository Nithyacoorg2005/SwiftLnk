import React, { useState } from "react";
import axios from "axios";
import { Link2, Copy, CheckCircle, ExternalLink, Sparkles } from "lucide-react";

function App() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState(""); // New State
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sending both longUrl and the optional alias
      const response = await axios.post(`${API_URL}/shorten`, {
        longUrl: url,
        alias: alias || undefined,
      });
      setShortUrl(response.data.shortUrl);
    } catch (err: any) {
      alert(err.response?.data?.error || "Server Error");
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
      <div className="max-w-3xl w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/20 animate-bounce-slow">
            <Link2 size={48} strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-6xl font-black tracking-tight italic uppercase">
          SWIFT<span className="text-blue-500">LNK</span>
        </h1>
        <p className="text-slate-400 text-xl font-medium">
          Custom aliases. Sub-millisecond redirects.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="url"
              placeholder="Paste your long link here..."
              className="flex-[3] bg-slate-900 border-2 border-slate-800 p-6 rounded-2xl outline-none focus:border-blue-500 transition-all text-lg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <div className="flex-[1] relative">
              <input
                type="text"
                placeholder="Alias (opt)"
                className="w-full bg-slate-900 border-2 border-slate-800 p-6 rounded-2xl outline-none focus:border-blue-500 transition-all text-lg pl-12"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
              <Sparkles
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={20}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-2xl uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-blue-600/20"
          >
            {loading ? "Processing..." : "Generate SwiftLink"}
          </button>
        </form>

        {shortUrl && (
          <div className="mt-12 p-8 bg-slate-900/50 border-2 border-blue-500/30 rounded-3xl backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-6 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-start overflow-hidden w-full text-left">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
                Your Short Link
              </span>
              <span className="text-blue-400 text-3xl font-bold truncate w-full">
                {shortUrl}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all border border-slate-700"
              >
                {copied ? (
                  <CheckCircle size={28} className="text-green-500" />
                ) : (
                  <Copy size={28} />
                )}
              </button>
              <a
                href={shortUrl}
                target="_blank"
                className="p-4 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-2xl transition-all border border-blue-500/20"
              >
                <ExternalLink size={28} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
