"use client";
import React, { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      // Čitamo fajl koji GitHub Actions stalno ažurira
      const response = await fetch('./data.json');
      if (!response.ok) throw new Error("Fajl još nije kreiran");
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
      console.error("Podaci se još uvek generišu od strane GitHub-a.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', fontStyle: 'italic', margin: 0 }}>
          Smart<span style={{ color: '#22c55e' }}>Scanner</span> PRO
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          <span style={{ color: '#22c55e' }}>●</span> Shield Mode Active: No API costs for visitors
        </p>
      </header>

      <div className="table-container">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Učitavanje stabilizovanih podataka...</p>
        ) : (
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
        )}
      </div>
    </main>
  );
}
