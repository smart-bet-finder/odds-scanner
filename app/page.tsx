"use client";
import React, { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const response = await fetch('./data.json');
      if (!response.ok) throw new Error("Waiting for data...");
      const result = await response.json();
      
      const processed = result.map((match: any) => {
        const bookies = match.bookmakers || [];
        if (bookies.length === 0) return null;

        const homeOdds = bookies.map((b: any) => b.markets[0]?.outcomes[0]?.price).filter(Boolean);
        const avg = homeOdds.reduce((a: number, b: number) => a + b, 0) / homeOdds.length;
        const best = bookies.reduce((prev: any, curr: any) => {
          const currentPrice = curr.markets[0]?.outcomes[0]?.price || 0;
          return currentPrice > prev.price ? { price: currentPrice, title: curr.title } : prev;
        }, { price: 0, title: '' });

        return {
          id: match.id,
          teams: `${match.home_team} vs ${match.away_team}`,
          avg: avg.toFixed(2),
          best: best.price,
          bookie: best.title,
          edge: (((best.price - avg) / avg) * 100).toFixed(1)
        };
      }).filter((m: any) => m !== null);

      setData(processed);
    } catch (err) {
      console.error("Data syncing...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // LOGIKA ZA GENERISANJE TIKETA
  
  // 1. STEADY BUILD: Favoriti (1.30 - 1.85) sa najboljim Edge-om
  const steadyBuild = data
    .filter(m => m.best >= 1.30 && m.best <= 1.85)
    .sort((a, b) => parseFloat(b.edge) - parseFloat(a.edge))
    .slice(0, 4);

  const steadyTotalOdds = steadyBuild.reduce((acc, curr) => acc * curr.best, 1).toFixed(2);

  // 2. ROCKET COMBO: Top 3 meča sa apsolutno najvećim Edge-om
  const rocketCombo = data
    .sort((a, b) => parseFloat(b.edge) - parseFloat(a.edge))
    .slice(0, 3);

  const rocketTotalOdds = rocketCombo.reduce((acc, curr) => acc * curr.best, 1).toFixed(2);

  return (
    <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#f1f5f9' }}>
      <header style={{ marginBottom: '40px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', fontStyle: 'italic', margin: 0 }}>
          Smart<span style={{ color: '#22c55e' }}>Scanner</span> PRO
        </h1>
        <p style={{ color: '#64748b', fontSize: '12px' }}>Automated Daily Analysis Mode</p>
      </header>

      {/* SECTION: SMART COMBOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        {/* STEADY BUILD BOX */}
        <div style={{ background: 'linear-gradient(145deg, #0f172a, #1e293b)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#22c55e', textTransform: 'uppercase', fontSize: '14px' }}>🛡️ Steady Build</h3>
            <span style={{ fontSize: '10px', background: '#22c55e', color: '#000', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>SAFE ACCUMULATOR</span>
          </div>
          <div style={{ marginBottom: '15px' }}>
            {steadyBuild.map(m => (
              <div key={m.id} style={{ fontSize: '13px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{m.teams}</span>
                <span style={{ fontWeight: 'bold' }}>{m.best}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '12px' }}>Total Odds:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>{steadyTotalOdds}</span>
          </div>
        </div>

        {/* ROCKET COMBO BOX */}
        <div style={{ background: 'linear-gradient(145deg, #0f172a, #1e293b)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#60a5fa', textTransform: 'uppercase', fontSize: '14px' }}>🚀 Rocket Combo</h3>
            <span style={{ fontSize: '10px', background: '#60a5fa', color: '#000', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>HIGH VALUE</span>
          </div>
          <div style={{ marginBottom: '15px' }}>
            {rocketCombo.map(m => (
              <div key={m.id} style={{ fontSize: '13px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{m.teams}</span>
                <span style={{ fontWeight: 'bold' }}>{m.best}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '12px' }}>Total Odds:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>{rocketTotalOdds}</span>
          </div>
        </div>

      </div>

      {/* MAIN DATA TABLE */}
      <div className="table-container" style={{ background: '#0f172a', borderRadius: '20px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontSize: '11px' }}>MATCH</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontSize: '11px' }}>AVG</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#22c55e', fontSize: '11px' }}>BEST</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontSize: '11px' }}>BOOKIE</th>
              <th style={{ padding: '15px', textAlign: 'right', color: '#64748b', fontSize: '11px' }}>EDGE</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '15px', fontWeight: '600' }}>{m.teams}</td>
                <td style={{ padding: '15px', color: '#64748b' }}>{m.avg}</td>
                <td style={{ padding: '15px', fontWeight: '900', fontSize: '1.1rem' }}>{m.best}</td>
                <td style={{ padding: '15px' }}><span style={{ background: '#1e293b', padding: '4px 8px', borderRadius: '6px', fontSize: '11px' }}>{m.bookie}</span></td>
                <td style={{ padding: '15px', textAlign: 'right', color: '#22c55e', fontWeight: '900' }}>+{m.edge}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
