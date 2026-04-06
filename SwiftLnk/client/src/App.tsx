import React, { useState } from "react";
import axios from "axios";
import { Link2, Copy, CheckCircle, ExternalLink, Sparkles } from "lucide-react";

function App() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. Point to your Railway URL (Set this in Vercel Env Vars)
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShortUrl(""); // Clear previous link on new attempt

    try {
      // 2. Clean Request with Optional Alias
      const { data } = await axios.post(`${API_BASE}/shorten`, {
        longUrl: url,
        alias: alias?.trim() || undefined,
      });

      // 3. Handle the response (Backend returns the full short URL)
      setShortUrl(data.shortUrl);
    } catch (err: any) {
      console.error("Deployment Debug:", err);
      // If 502/500 occurs, this alert will show the backend's failure message
      alert(err.response?.data?.error || "Server Error: Check Backend Logs");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-3xl w-full space-y-8 text-center">
        {/* Animated Logo */}
        <div className="flex justify-center">
          <div className="p-4 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/20 animate-bounce-slow">
            <Link2 size={48} strokeWidth={2.5} />
          </div>
        </div>

        {/* Hero Section */}
        <h1 className="text-6xl font-black tracking-tight italic uppercase">
          SWIFT<span className="text-blue-500">LNK</span>
        </h1>
        <p className="text-slate-400 text-xl font-medium">
          Custom aliases. Sub-millisecond redirects.
        </p>

        {/* Input Form */}
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

        {/* Result Area */}
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
                rel="noopener noreferrer"
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