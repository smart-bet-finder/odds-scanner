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

          // Tražimo najbolju kvotu ali pratimo i koja je to kladionica
          const best = bookies.reduce((prev: any, curr: any) => {
            const currentPrice = curr.markets[0]?.outcomes[0]?.price || 0;
            return currentPrice > prev.price ? { price: currentPrice, title: curr.title } : prev;
          }, { price: 0, title: '' });

          const homeOdds = bookies.map((b: any) => b.markets[0]?.outcomes[0]?.price).filter(Boolean);
          const avg = homeOdds.reduce((a: number, b: number) => a + b, 0) / homeOdds.length;

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
    .filter((m: any) => parseFloat(m.best) >= 1.30 && parseFloat(m.best) <= 1.90)
    .sort((a: any, b: any) => parseFloat(b.edge) - parseFloat(a.edge))
    .slice(0, 3);

  const rocketCombo = data
    .sort((a: any, b: any) => parseFloat(b.edge) - parseFloat(a.edge))
    .slice(0, 3);

  const sOdds = steadyBuild.reduce((acc: number, curr: any) => acc * curr.best, 1).toFixed(2);
  const rOdds = rocketCombo.reduce((acc: number, curr: any) => acc * curr.best, 1).toFixed(2);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#f1f5f9', fontFamily: 'sans-serif', backgroundColor: '#020617', minHeight: '100vh' }}>
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #1e293b', paddingBottom: '15px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', fontStyle: 'italic', margin: 0 }}>
          Smart<span style={{ color: '#22c55e' }}>Scanner</span> PRO
        </h1>
        <p style={{ color: '#64748b', fontSize: '11px' }}>Entain & Global Market Sync Active</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* STEADY BUILD BOX */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '20px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#22c55e', fontSize: '12px', letterSpacing: '1px' }}>🛡️ STEADY BUILD</h3>
          {steadyBuild.map((m: any) => (
            <div key={m.id} style={{ fontSize: '13px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>{m.teams}</span>
                <b style={{ color: '#22c55e' }}>{m.best}</b>
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>📍 Kladionica: <span style={{ color: '#94a3b8' }}>{m.bookie}</span></div>
            </div>
          ))}
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Total Odds:</span>
            <strong style={{ fontSize: '1.4rem' }}>{sOdds}</strong>
          </div>
        </div>

        {/* ROCKET COMBO BOX */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#3b82f6', fontSize: '12px', letterSpacing: '1px' }}>🚀 ROCKET COMBO</h3>
          {rocketCombo.map((m: any) => (
            <div key={m.id} style={{ fontSize: '13px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>{m.teams}</span>
                <b style={{ color: '#3b82f6' }}>{m.best}</b>
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>📍 Kladionica: <span style={{ color: '#94a3b8' }}>{m.bookie}</span></div>
            </div>
          ))}
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Total Odds:</span>
            <strong style={{ fontSize: '1.4rem' }}>{rOdds}</strong>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: '#0f172a', borderRadius: '15px', overflow: 'hidden', border: '1px solid #1e293b' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>MATCH</th>
              <th style={{ padding: '12px' }}>AVG</th>
              <th style={{ padding: '12px' }}>BEST ODDS</th>
              <th style={{ padding: '12px' }}>BOOKIE</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>EDGE</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m: any) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px' }}>{m.teams}</td>
                <td style={{ padding: '12px', color: '#64748b' }}>{m.avg}</td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#22c55e' }}>{m.best}</td>
                <td style={{ padding: '12px' }}><span style={{ backgroundColor: '#1e293b', padding: '3px 8px', borderRadius: '5px', fontSize: '11px' }}>{m.bookie}</span></td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#22c55e', fontWeight: 'bold' }}>+{m.edge}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
