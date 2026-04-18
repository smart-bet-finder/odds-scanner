"use client";
import React, { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`./data.json?t=${timestamp}`);
        if (!response.ok) throw new Error("No data");
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
        console.error("Sync...");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const steadyBuild = data
    .filter((m: any) => parseFloat(m.best) >= 1.30 && parseFloat(m.best) <= 1.85)
    .sort((a: any, b: any) => parseFloat(b.edge) - parseFloat(a.edge))
    .slice(0, 4);

  const rocketCombo = data
    .sort((a: any, b: any) => parseFloat(b.edge) - parseFloat(a.edge))
    .slice(0, 3);

  const sOdds = steadyBuild.reduce((acc: number, curr: any) => acc * curr.best, 1).toFixed(2);
  const rOdds = rocketCombo.reduce((acc: number, curr: any) => acc * curr.best, 1).toFixed(2);

  // KORISTIMO OBIČAN DIV UMESTO MAIN I ČISTU SINTAKSU
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#f1f5f9', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '40px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', fontStyle: 'italic', margin: 0 }}>
          Smart<span style={{ color: '#22c55e' }}>Scanner</span> PRO
        </h1>
        <p style={{ color: '#64748b', fontSize: '12px' }}>🛡️ Shield Mode: Safe API Usage</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: '#1e293b', padding: '25px', borderRadius: '24px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#22c55e', fontSize: '14px' }}>🛡️ STEADY BUILD</h3>
          {steadyBuild.map((m: any) => (
            <div key={m.id} style={{ fontSize: '13px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{m.teams}</span><b>{m.best}</b>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #334155', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Total Odds:</span><strong>{sOdds === "1.00" ? "---" : sOdds}</strong>
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '25px', borderRadius: '24px', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#60a5fa', fontSize: '14px' }}>🚀 ROCKET COMBO</h3>
          {rocketCombo.map((m: any) => (
            <div key={m.id} style={{ fontSize: '13px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{m.teams}</span><b>{m.best}</b>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #334155', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Total Odds:</span><strong>{rOdds === "1.00" ? "---" : rOdds}</strong>
          </div>
        </div>
      </div>

      <div style={{ background: '#0f172a', borderRadius: '20px', overflowX: 'auto', border: '1px solid #1e293b' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#64748b', fontSize: '11px', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>MATCH</th>
              <th style={{ padding: '15px' }}>AVG</th>
              <th style={{ padding: '15px', color: '#22c55e' }}>BEST</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>EDGE</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map((m: any) => (
              <tr key={m.id} style={{ borderTop: '1px solid #1e293b' }}>
                <td style={{ padding: '15px', fontSize: '14px' }}>{m.teams}</td>
                <td style={{ padding: '15px', color: '#64748b' }}>{m.avg}</td>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{m.best}</td>
                <td style={{ padding: '15px', textAlign: 'right', color: '#22c55e' }}>+{m.edge}%</td>
              </tr>
            )) : (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Syncing data...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
