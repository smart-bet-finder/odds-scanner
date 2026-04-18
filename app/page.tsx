"use client";
import React, { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('RS'); 
  const [systemPicks, setSystemPicks] = useState<{ steady: any, rocket: any }>({ steady: null, rocket: null });

  // Mapiranje država na API regije (Tehničko ograničenje API-ja)
  const countryToRegion: { [key: string]: string } = {
    'RS': 'eu', 'HR': 'eu', 'ME': 'eu', 'BA': 'eu', // Balkan -> EU regija (bwin, Unibet...)
    'DE': 'eu', 'IT': 'eu', 'FR': 'eu', 'ES': 'eu', // Evropa -> EU regija
    'GB': 'uk', 'IE': 'uk',                         // UK/Irsko -> UK regija
    'US': 'us', 'CA': 'us',                         // S. Amerika -> US regija
    'AU': 'au'                                      // Australija -> AU regija
  };

  const loadData = async (selectedCountry: string) => {
    setLoading(true);
    const region = countryToRegion[selectedCountry] || 'eu';
    
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=8d79681b1e42354408fb13d12b34887d&regions=${region}&markets=h2h`);
      
      if (!response.ok) throw new Error("API Limit");
      const result = await response.json();
      
      const allMatches = result.map((match: any) => {
        const bookies = match.bookmakers || [];
        const homeOdds = bookies.map((b: any) => b.markets[0]?.outcomes[0]?.price).filter(Boolean);
        const avg = homeOdds.length > 0 ? homeOdds.reduce((a: number, b: number) => a + b, 0) / homeOdds.length : 0;
        return { ...match, avg };
      });

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

      let bestSteady: any = { odds: 0, matches: [], bookie: '' };
      let bestRocket: any = { odds: 0, matches: [], bookie: '' };

      Object.keys(bookiePortfolios).forEach(bookieName => {
        const matches = bookiePortfolios[bookieName];
        const steadyMatches = matches
          .filter((m: any) => m.price >= 1.30 && m.price <= 2.00)
          .sort((a: any, b: any) => (b.price / b.avg) - (a.price / a.avg))
          .slice(0, 3);
        
        const steadyTotal = steadyMatches.reduce((acc: number, curr: any) => acc * curr.price, 1);
        if (steadyMatches.length === 3 && steadyTotal > bestSteady.odds) {
          bestSteady = { odds: steadyTotal.toFixed(2), matches: steadyMatches, bookie: bookieName };
        }

        const rocketMatches = matches
          .sort((a: any, b: any) => (b.price / b.avg) - (a.price / a.avg))
          .slice(0, 3);
        
        const rocketTotal = rocketMatches.reduce((acc: number, curr: any) => acc * curr.price, 1);
        if (rocketMatches.length === 3 && rocketTotal > bestRocket.odds) {
          bestRocket = { odds: rocketTotal.toFixed(2), matches: rocketMatches, bookie: bookieName };
        }
      });

      setSystemPicks({ steady: bestSteady, rocket: bestRocket });
      
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
      console.error("Fetch error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(country); }, [country]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#f1f5f9', fontFamily: 'sans-serif', backgroundColor: '#020617', minHeight: '100vh' }}>
      <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '15px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', fontStyle: 'italic', margin: 0 }}>
          Smart<span style={{ color: '#22c55e' }}>Scanner</span> PRO
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>YOUR COUNTRY:</span>
          <select 
            value={country} 
            onChange={(e) => setCountry(e.target.value)}
            style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '8px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <option value="RS">Serbia 🇷🇸</option>
            <option value="HR">Croatia 🇭🇷</option>
            <option value="BA">Bosnia 🇧🇦</option>
            <option value="ME">Montenegro 🇲🇪</option>
            <option value="DE">Germany 🇩🇪</option>
            <option value="GB">United Kingdom 🇬🇧</option>
            <option value="US">USA 🇺🇸</option>
          </select>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginBottom: '35px' }}>
        
        {/* STEADY BUILD */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '24px', border: '1px solid rgba(34, 197, 94, 0.2)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '20px', background: '#22c55e', color: '#000', fontSize: '9px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '12px' }}>ACCUMULATOR</div>
          <h3 style={{ margin: '0 0 15px 0', color: '#22c55e', fontSize: '12px', letterSpacing: '1px' }}>🛡️ STEADY BUILD</h3>
          <p style={{ fontSize: '10px', color: '#64748b', marginBottom: '15px' }}>Bookmaker: <b style={{ color: '#f1f5f9' }}>{systemPicks.steady?.bookie || 'Scanning...'}</b></p>
          {systemPicks.steady?.matches.map((m: any, i: number) => (
            <div key={i} style={{ fontSize: '13px', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{m.teams}</span>
              <b style={{ color: '#22c55e' }}>{m.price}</b>
            </div>
          ))}
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>TOTAL ODDS:</span>
            <strong style={{ fontSize: '1.6rem', color: '#fff' }}>{systemPicks.steady?.odds || '---'}</strong>
          </div>
        </div>

        {/* ROCKET COMBO */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '24px', border: '1px solid rgba(59, 130, 246, 0.2)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '20px', background: '#3b82f6', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '12px' }}>SYSTEM (3/3)</div>
          <h3 style={{ margin: '0 0 15px 0', color: '#3b82f6', fontSize: '12px', letterSpacing: '1px' }}>🚀 ROCKET COMBO</h3>
          <p style={{ fontSize: '10px', color: '#64748b', marginBottom: '15px' }}>Bookmaker: <b style={{ color: '#f1f5f9' }}>{systemPicks.rocket?.bookie || 'Scanning...'}</b></p>
          {systemPicks.rocket?.matches.map((m: any, i: number) => (
            <div key={i} style={{ fontSize: '13px', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{m.teams}</span>
              <b style={{ color: '#3b82f6' }}>{m.price}</b>
            </div>
          ))}
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>TOTAL ODDS:</span>
            <strong style={{ fontSize: '1.6rem', color: '#fff' }}>{systemPicks.rocket?.odds || '---'}</strong>
          </div>
        </div>
      </div>

      <div style={{ background: '#0f172a', borderRadius: '20px', overflow: 'hidden', border: '1px solid #1e293b' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ color: '#64748b', textAlign: 'left', fontSize: '11px' }}>
              <th style={{ padding: '15px' }}>MATCH</th>
              <th style={{ padding: '15px' }}>AVG</th>
              <th style={{ padding: '15px' }}>BEST ODDS</th>
              <th style={{ padding: '15px' }}>BOOKMAKER</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>EDGE</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Loading local market data...</td></tr>
            ) : data.map((m: any) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '15px' }}>{m.teams}</td>
                <td style={{ padding: '15px', color: '#64748b' }}>{m.avg}</td>
                <td style={{ padding: '15px', fontWeight: 'bold', color: '#22c55e' }}>{m.best}</td>
                <td style={{ padding: '15px' }}><span style={{ backgroundColor: '#1e293b', padding: '4px 10px', borderRadius: '6px', fontSize: '11px' }}>{m.bookie}</span></td>
                <td style={{ padding: '15px', textAlign: 'right', color: '#22c55e', fontWeight: 'bold' }}>+{m.edge}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
