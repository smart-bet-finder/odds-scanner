"use client";
import React, { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemPicks, setSystemPicks] = useState<{ steady: any, rocket: any }>({ steady: null, rocket: null });

  // Funkcija za generisanje linkova ka sajtovima
  const getBookieLink = (name: string) => {
    const links: { [key: string]: string } = {
      'bwin': 'https://www.bwin.com',
      'Unibet': 'https://www.unibet.com',
      '888sport': 'https://www.888sport.com',
      'William Hill': 'https://www.williamhill.com',
      'Betfair': 'https://www.betfair.com',
      'Pinnacle': 'https://www.pinnacle.com',
      'Betclic': 'https://www.betclic.com'
    };
    // Ako kladionica nije na listi, vodi na Google pretragu te kladionice
    return links[name] || `https://www.google.com/search?q=${name}+betting+site`;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=8d79681b1e42354408fb13d12b34887d&regions=eu&markets=h2h`);
        if (!response.ok) throw new Error("API limit");
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

        Object.keys(bookiePortfolios).forEach(name => {
          const portfolio = bookiePortfolios[name];
          const steady = portfolio.filter((m: any) => m.price >= 1.30 && m.price <= 2.00).slice(0, 3);
          const rocket = portfolio.sort((a: any, b: any) => (b.price/b.avg) - (a.price/a.avg)).slice(0, 3);

          const sTotal = steady.reduce((acc: number, curr: any) => acc * curr.price, 1);
          if (steady.length === 3 && sTotal > bestSteady.odds) bestSteady = { odds: sTotal.toFixed(2), matches: steady, bookie: name };

          const rTotal = rocket.reduce((acc: number, curr: any) => acc * curr.price, 1);
          if (rocket.length === 3 && rTotal > bestRocket.odds) bestRocket = { odds: rTotal.toFixed(2), matches: rocket, bookie: name };
        });

        setSystemPicks({ steady: bestSteady, rocket: bestRocket });

        const tableData = allMatches.map((match: any) => {
          const best = match.bookmakers.reduce((prev: any, curr: any) => {
            const price = curr.markets[0]?.outcomes[0]?.price || 0;
            return price > prev.price ? { price, title: curr.title } : prev;
          }, { price: 0, title: '' });

          return {
            id: match.id,
            teams: `${match.home_team} vs ${match.away_team}`,
            avg: match.avg.toFixed(2),
            best: best.price,
            bookie: best.title,
            edge: (((best.price - match.avg) / match.avg) * 100).toFixed(1)
          };
        }).sort((a: any, b: any) => parseFloat(b.edge) - parseFloat(a.edge));

        setData(tableData);
      } catch (err) {
        console.error("Syncing...");
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
        <p style={{ color: '#64748b', fontSize: '11px' }}>Sorted by Market Edge (Highest Advantage First)</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginBottom: '35px' }}>
        
        {/* STEADY BUILD */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '24px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#22c55e', fontSize: '12px' }}>🛡️ STEADY BUILD</h3>
          <a href={getBookieLink(systemPicks.steady?.bookie)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px
