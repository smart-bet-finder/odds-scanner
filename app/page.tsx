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
    <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', margin: 0 }}>
            Smart<span style={{ color: '#22c55e' }}>Scanner</span> PRO
          </h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Real-time Arbitrage & Value Detection</p>
        </div>
        <button onClick={scanMarket} disabled={loading} className="btn-primary">
          {loading ? "SCANNING..." : "Run Smart Analytics"}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#0f172a', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Opportunities Found</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#22c55e', margin: '10px 0 0 0' }}>{data.length}</p>
        </div>
        <div style={{ background: '#0f172a', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Market Status</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#60a5fa', margin: '10px 0 0 0' }}>LIVE</p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Match Event</th>
              <th>Avg Mkt</th>
              <th style={{ color: '#22c55e' }}>Best Odds</th>
              <th>Bookmaker</th>
              <th style={{ textAlign: 'right' }}>Edge Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.id}>
                <td className="match-name">{m.teams}</td>
                <td style={{ color: '#64748b' }}>{m.avg}</td>
                <td className="odds-value">{m.best}</td>
                <td><span className="bookie-tag">{m.bookie}</span></td>
                <td className="edge-badge" style={{ textAlign: 'right' }}>+{m.edge}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
