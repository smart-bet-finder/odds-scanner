"use client";
import React, { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemPicks, setSystemPicks] = useState<{ steady: any, rocket: any }>({ steady: null, rocket: null });

  useEffect(() => {
    const loadData = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`./data.json?t=${timestamp}`);
        if (!response.ok) throw new Error("No data");
        const result = await response.json();
        
        // 1. Obrada svih mečeva
        const allMatches = result.map((match: any) => {
          const bookies = match.bookmakers || [];
          const homeOdds = bookies.map((b: any) => b.markets[0]?.outcomes[0]?.price).filter(Boolean);
          const avg = homeOdds.length > 0 ? homeOdds.reduce((a: number, b: number) => a + b, 0) / homeOdds.length : 0;
          
          return { ...match, avg };
        });

        // 2. LOGIKA ZA SISTEM (Mora biti ista kladionica)
        // Grupišemo sve dostupne kvote po Bookmakeru
        const bookiePortfolios: any = {};

        result.forEach((match: any) => {
          match.bookmakers.forEach((b: any) => {
            if (!bookiePortfolios[b.title]) bookiePortfolios[b.title] = [];
            const price = b.markets[0]?.outcomes[0]?.price;
            if (price) {
              bookiePortfolios[b.title].push({
                teams: `${match.home_team} vs ${match.away_team}`,
                price: price,
                avg: allMatches.find((m: any) => m.id === match.id)?.avg || price
              });
            }
          });
        });

        // Pronalazimo najbolji "Steady" i "Rocket" unutar svakog Bookmaker-a
        let bestSteady: any = { odds: 0, matches: [], bookie: '' };
        let bestRocket: any = { odds: 0, matches: [], bookie: '' };

        Object.keys(bookiePortfolios).forEach(bookieName => {
          const matches = bookiePortfolios[bookieName];
          
          // Steady: 3 meča sa kvotom 1.30-1.90 kod istog bookie-ja
          const steadyMatches = matches
            .filter((m: any) => m.price >= 1.30 && m.price <= 1.90)
            .sort((a: any, b: any) => (b.price / b.avg) - (a.price / a.avg))
            .slice(0, 3);
          
          const steadyTotal = steadyMatches.reduce((acc: number, curr: any) => acc * curr.price, 1);
          if (steadyMatches.length === 3 && steadyTotal > bestSteady.odds) {
            bestSteady = { odds: steadyTotal.toFixed(2), matches: steadyMatches, bookie: bookieName };
          }

          // Rocket: 3 meča sa najvećim edge-om kod istog bookie-ja
          const rocketMatches = matches
            .sort((a: any, b: any) => (b.price / b.avg) - (a.price / a.avg))
            .slice(0, 3);
          
          const rocketTotal = rocketMatches.reduce((acc: number, curr: any) => acc * curr.price, 1);
          if (rocketMatches.length === 3 && rocketTotal > bestRocket.odds) {
            bestRocket = { odds: rocketTotal.toFixed(2), matches: rocketMatches, bookie: bookieName };
          }
        });

        setSystemPicks({ steady: bestSteady, rocket: bestRocket });
        
        // Prikaz tabele (Best odds overall)
        const tableData = allMatches.map((match: any) => {
          const best = match.bookmakers.reduce((prev: any, curr: any) => {
            const currentPrice = curr.markets[0]?.outcomes[0]?.price || 0;
            return currentPrice > prev.price ? { price: currentPrice, title: curr.title } : prev;
          }, { price: 0, title: '' });

          return {
            id: match.id,
            teams: `${match.home_team} vs ${match.away_team}`,
            avg: match.avg.toFixed(2),
            best: best.price,
            bookie: best.title,
            edge: (((best.price - match.avg) / match.avg) * 100).toFixed(1)
          };
        });

        setData(tableData);
      } catch (err) {
        console.error("Sync...");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#f1f5f9', fontFamily: 'sans-serif', backgroundColor: '#020617', minHeight: '100vh' }}>
      <header style={{ marginBottom: '30px', borderBottom: '1px solid #1e293b', paddingBottom: '15px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', fontStyle: 'italic', margin: 0 }}>
          Smart<span style={{ color: '#22c55e' }}>Scanner</span> PRO
        </h1>
        <p style={{ color: '#64748b', fontSize: '11px' }}>Automated Daily Analysis Mode</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* STEADY BUILD - SAME BOOKIE */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '20px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#22c55e', fontSize: '12px', letterSpacing: '1px' }}>🛡️ STEADY BUILD</h3>
            {systemPicks.steady?.bookie && <span style={{ fontSize: '10px', background: '#22c55e', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{systemPicks.steady.bookie}</span>}
          </div>
          {systemPicks.steady?.matches.map((m: any, i: number) => (
            <div key={i} style={{ fontSize: '13px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between' }}>
              <span>{m.teams}</span>
              <b style={{ color: '#22c55e' }}>{m.price}</b>
            </div>
          ))}
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>System Total Odds:</span>
            <strong style={{ fontSize: '1.4rem' }}>{systemPicks.steady?.odds || '---'}</strong>
          </div>
        </div>

        {/* ROCKET COMBO - SAME BOOKIE */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#3b82f6', fontSize: '12px', letterSpacing: '1px' }}>🚀 ROCKET COMBO</h3>
            {systemPicks.rocket?.bookie && <span style={{ fontSize: '10px', background: '#3b82f6', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{systemPicks.rocket.bookie}</span>}
          </div>
          {systemPicks.rocket?.matches.map((m: any, i: number) => (
            <div key={i} style={{ fontSize: '13px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between' }}>
              <span>{m.teams}</span>
              <b style={{ color: '#3b82f6' }}>{m.price}</b>
            </div>
          ))}
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>System Total Odds:</span>
            <strong style={{ fontSize: '1.4rem' }}>{systemPicks.rocket?.odds || '---'}</strong>
          </div>
        </div>
      </div>

      <div style={{ background: '#0f172a', borderRadius: '15px', overflow: 'hidden', border: '1px solid #1e293b' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>MATCH</th>
              <th style={{ padding: '12px' }}>AVG</th>
              <th style={{ padding: '12px' }}>BEST ODDS</th>
              <th style={{ padding: '12px' }}>BOOKMAKER</th>
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
