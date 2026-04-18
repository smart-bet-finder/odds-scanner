"use client";

import React, { useState, useEffect } from 'react';

const API_KEY = "8d79681b1e42354408fb13d12b34887d";

interface MatchData {
  id: string;
  teams: string;
  avg: string;
  best: number;
  bookie: string;
  edge: string;
  isValue: boolean;
}

export default function Page() {
  const [data, setData] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanMarket = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=${API_KEY}&regions=eu&markets=h2h`
      );

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const result = await response.json();
      if (!Array.isArray(result)) return;

      const processed: MatchData[] = result.map((match: any) => {
        const bookies = match.bookmakers || [];
        if (bookies.length === 0) return null;

        const homeOdds = bookies.map((b: any) => b.markets[0].outcomes[0].price);
        const avg = homeOdds.reduce((a: number, b: number) => a + b, 0) / homeOdds.length;

        const best = bookies.reduce((prev: any, curr: any) => {
          const currentPrice = curr.markets[0].outcomes[0].price;
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
          isValue: edgeValue > 3
        };
      }).filter((m): m is MatchData => m !== null);

      setData(processed.sort((a, b) => parseFloat(b.edge) - parseFloat(a.edge)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { scanMarket(); }, []);

  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-white/10 pb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
              Smart<span className="text-green-500">Scanner</span> <span className="text-xs bg-green-500 text-black px-2 py-1 rounded not-italic ml-2 tracking-widest font-bold">PRO</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Institutional Grade Value Betting Terminal</p>
          </div>
          <button 
            onClick={() => scanMarket()}
            disabled={loading}
            className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-black font-black py-4 px-10 rounded-2xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] active:scale-95 disabled:opacity-50"
          >
            {loading ? "SCANNING ENGINES..." : "RUN SMART ANALYTICS"}
          </button>
        </header>

        {error && <div className="p-4 bg-red-500/20 text-red-500 rounded-xl mb-6 border border-red-500/50 text-center font-bold font-mono">⚠️ {error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 shadow-xl">
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-2 text-center">Value Opportunities</p>
            <p className="text-4xl font-mono text-green-500 text-center font-bold tracking-tighter">{data.filter(m => m.isValue).length}</p>
          </div>
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 shadow-xl">
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-2 text-center">Market Status</p>
            <p className="text-4xl font-mono text-blue-400 text-center font-bold animate-pulse">LIVE</p>
          </div>
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 shadow-xl text-center">
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-2">Account Plan</p>
            <p className="text-4xl font-mono text-white font-bold tracking-tighter italic">Starter</p>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="p-6">Match Event</th>
                  <th className="p-6">Avg Market</th>
                  <th className="p-6 text-green-500">Best Odds</th>
                  <th className="p-6">Execution Point</th>
                  <th className="p-6 text-right">Edge Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.length > 0 ? data.map((m) => (
                  <tr key={m.id} className={`group hover:bg-white/[0.03] transition-colors ${m.isValue ? 'bg-green-500/5' : ''}`}>
                    <td className="p-6 font-extrabold text-white text-lg">{m.teams}</td>
                    <td className="p-6 text-slate-500 font-mono italic">{m.avg}</td>
                    <td className="p-6 font-mono text-3xl font-black text-white">{m.best}</td>
                    <td className="p-6"><span className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-white/5">{m.bookie}</span></td>
                    <td className={`p-6 text-right font-black text-3xl italic ${parseFloat(m.edge) > 3 ? 'text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'text-slate-700'}`}>+{m.edge}%</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="p-20 text-center text-slate-600 italic">No market discrepancies detected. Wait for the next scan cycle.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
