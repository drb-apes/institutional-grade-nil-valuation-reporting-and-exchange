import { useEffect, useState } from 'react';
import { fetchTrackA, fetchTrackB } from './lib/api';

export default function App() {
  const [trackA, setTrackA] = useState<any>(null);
  const [trackB, setTrackB] = useState<any>(null);

  useEffect(() => {
    fetchTrackA(1).then(setTrackA).catch(console.error);
    fetchTrackB(42).then(setTrackB).catch(console.error);
  }, []);

  return (
    <div className="shell">
      <header className="topbar">
        <h1>Institutional Grade NIL</h1>
        <div className="badge">Dual-Track Exchange</div>
      </header>

      <main className="grid">
        <section className="panel">
          <h2>Track A — Model NIL</h2>
          {trackA ? (
            <>
              <div className="stat">Model: ${trackA.modelNil.toLocaleString()}</div>
              <div className="stat">Market: ${trackA.marketNil.toLocaleString()}</div>
              <div className="stat">Divergence: ${trackA.divergence.toLocaleString()}</div>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </section>

        <section className="panel">
          <h2>Track B — Yield Tranches</h2>
          {trackB ? (
            <>
              <div className="stat">Sponsor: {trackB.sponsor}</div>
              <div className="stat">APY: {trackB.apy}%</div>
              <div className="stat">CRS: {trackB.crs}</div>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </section>
      </main>
    </div>
  );
}
