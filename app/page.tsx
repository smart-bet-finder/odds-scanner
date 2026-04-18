"use client";

import React, { useState, useEffect } from 'react';

const API_KEY = "8d79681b1e42354408fb13d12b34887d";

export default function Page() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanMarket = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=${API_KEY}&regions=eu&markets=h2h`
      );

      if (!response.ok) throw new Error("API Limit reached or invalid key");
      
      const result = await response.json();
      if (!Array.isArray(result)) return;

      const processed = result.map((match: any) => {
        const bookies = match.bookmakers || [];
        if (bookies.length === 0) return null;

        const homeOdds = bookies.map((b: any) => b.markets[0]?.outcomes[0]?.price).filter(Boolean);
        if (homeOdds.length === 0) return null;

        const avg = homeOdds.reduce((a: number, b: number) => a + b, 0) / homeOdds.length;
        const best = bookies.reduce((prev: any, curr: any) => {
          const currentPrice = curr.markets[0]?.outcomes[0]?.price || 0;
          return currentPrice > prev.price ? { price: currentPrice, title: curr.title } : prev;
        }, { price: 0, title: '' });

        const edgeValue = ((best.price - avg) / avg) * 100;

        return {
          id: match.id,
          teams: `${match.home_team} vs ${match.away_team}`,
          avg: avg.toFixed(2),
          best: best.price,
          bookie: best.title,
          edge: edgeValue.toFixed(1),
          isValue: edgeValue > 2
        };
      }).filter((m: any) => m !== null);

      setData(processed.sort((a: any, b: any) => parseFloat(b.edge) - parseFloat(a.edge)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { scanMarket(); }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-white/10 pb-8 gap-4">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Smart<span className="text-green-500">Scanner</span> <span className="text-xs bg-green-500 text-black px-2 py-1 rounded not-italic ml-2">PRO</span>
          </h1>
          <button 
            onClick={() => scanMarket()}
            disabled={loading}
            className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-black font-black py-4 px-10 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "SCANNING..." : "RUN SMART ANALYTICS"}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-xl text-center">
            <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Found Opportunities</p>
            <p className="text-3xl font-mono text-green-500 font-bold">{data.length}</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-xl text-center">
            <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Market Status</p>
            <p className="text-3xl font-mono text-blue-400 font-bold animate-pulse">LIVE</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-xl text-center text-white/40">
            <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Plan</p>
            <p className="text-3xl font-mono font-bold italic">Starter</p>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-white/10 rounded-3xl overflow-hidden shadow-2xl overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-400 text-[10px] uppercase font-bold">
              <tr>
                <th className="p-6">Match</th>
                <th className="p-6">Avg</th>
                <th className="p-6 text-green-500">Best</th>
                <th className="p-6">Bookmaker</th>
                <th className="p-6 text-right">Edge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((m) => (
                <tr key={m.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-6 font-bold">{m.teams}</td>
                  <td className="p-6 text-slate-500 font-mono">{m.avg}</td>
                  <td className="p-6 font-mono text-2xl font-black">{m.best}</td>
                  <td className="p-6"><span className="bg-white/10 px-3 py-1 rounded text-xs">{m.bookie}</span></td>
                  <td className="p-6 text-right font-black text-2xl text-green-500">+{m.edge}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
