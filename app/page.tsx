"use client";
import React, { useState, useEffect } from 'react';

const API_KEY = "8d79681b1e42354408fb13d12b34887d";

export default function SmartBetDashboard() {
  // POPRAVKA: Dodajemo <any[]> da TypeScript ne misli da je lista prazna
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanMarket = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=${API_KEY}&regions=eu&markets=h2h`);
      const result = await response.json();

      if (!Array.isArray(result)) throw new Error("Invalid API response");

      const processed = result.map((match: any) => {
        const bookies = match.bookmakers;
        if (!bookies || !bookies.length) return null;

        const homeOdds = bookies.map((b: any) => b.markets[0].outcomes[0].price);
        const avg = homeOdds.reduce((a: number, b: number) => a + b, 0) / homeOdds.length;

        const best = bookies.reduce((prev: any, curr: any) => {
          return (curr.markets[0].outcomes[0].price > prev.price) 
            ? { price: curr.markets[0].outcomes[0].price, title: curr.title } 
            : prev;
        }, { price: 0, title: '' });

        const edge = ((best.price - avg) / avg) * 100;

        return {
          id: match.id,
          teams: `${match.home_team} vs ${match.away_team}`,
          avg: avg.toFixed(2),
          best: best.price,
          bookie: best.title,
          edge: edge.toFixed(1),
          isValue: edge > 3 
        };
      }).filter((m: any) => m !== null);

      setData(processed.sort((a: any, b: any) => b.edge - a.edge));
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { scanMarket(); }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              Smart<span className="text-green-500">Scanner</span> <span className="text-xs bg-green-500/20 text-green-400 py-1 px-2 rounded ml-2 font-normal not-italic">PRO</span>
            </h1>
            <p className="text-slate-500 text-sm">Real-time Arbitrage & Value Detection</p>
          </div>
          <button 
            onClick={scanMarket}
            className="bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            {loading ? "SCANNING ENGINES..." : "RUN ANALYTICS"}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
              <p className="text-slate-500 text-xs uppercase font-bold mb-2">API Credits</p>
              <p className="text-2xl font-mono">Starter: 500/mo</p>
           </div>
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
              <p className="text-slate-500 text-xs uppercase font-bold mb-2">Detected Opportunities</p>
              {/* POPRAVKA: Koristimo optional chaining m?.isValue za svaki slučaj */}
              <p className="text-2xl font-mono text-green-500">{data.filter((m: any) => m?.isValue).length}</p>
           </div>
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
              <p className="text-slate-500 text-xs uppercase font-bold mb-2">Market Status</p>
              <p className="text-2xl font-mono text-blue-400 font-bold uppercase tracking-widest animate-pulse">Live</p>
           </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="p-5">Match Event</th>
                <th className="p-5">Avg Market</th>
                <th className="p-5">Best Odds</th>
                <th className="p-5">Bookmaker</th>
                <th className="p-5 text-right">Edge %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {data.map((m: any) => (
                <tr key={m.id} className={`hover:bg-white/5 transition-colors ${m.isValue ? 'bg-green-500/5' : ''}`}>
                  <td className="p-5 font-bold text-white">{m.teams}</td>
                  <td className="p-5 text-slate-500 font-mono">{m.avg}</td>
                  <td className="p-5 font-mono text-xl text-white font-bold">{m.best}</td>
                  <td className="p-5">
                    <span className="bg-slate-800 px-3 py-1 rounded-full text-xs border border-slate-700">{m.bookie}</span>
                  </td>
                  <td className="p-5 text-right">
                    <span className={`text-xl font-black ${parseFloat(m.edge) > 5 ? 'text-green-500' : 'text-slate-400'}`}>
                      +{m.edge}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && <div className="mt-4 text-red-500 text-center">{error}</div>}
      </div>
    </div>
  );
}
