import { MetricCard, SectionShell, TrancheCard } from '@nil-exchange/ui';
import type { NILMarket, YieldCampaign } from '@nil-exchange/types';

const nilBoards: NILMarket[] = [
  { id: 'athlete-001', name: 'Ari Kade', modelNil: 65, marketNil: 40, spread: 25, sentiment: 'recovery' },
  { id: 'athlete-002', name: 'Jalen Cross', modelNil: 72, marketNil: 61, spread: 11, sentiment: 'stable' },
  { id: 'athlete-003', name: 'Mila Stone', modelNil: 48, marketNil: 52, spread: -4, sentiment: 'risk-on' },
];

const campaigns: YieldCampaign[] = [
  { id: 'camp-101', name: 'League Launch Week', apy: 14.2, riskState: 'CRS-1', capitalSecured: 520000, trancheUnits: 1000 },
  { id: 'camp-102', name: 'Creator Merch Drop', apy: 11.6, riskState: 'CRS-0', capitalSecured: 310000, trancheUnits: 860 },
  { id: 'camp-103', name: 'Regional Fan Activations', apy: 17.3, riskState: 'CRS-2', capitalSecured: 430000, trancheUnits: 1250 },
];

export default function Page() {
  return (
    <main style={{ padding: '2rem', background: '#08111d', minHeight: '100vh', color: '#edf5ff', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '1rem' }}>
          <div>
            <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#7dd3fc', fontSize: 12 }}>NIL Exchange</p>
            <h1 style={{ margin: '0.35rem 0 0', fontSize: '2.2rem' }}>Institutional Dashboard</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <MetricCard label="Net liquidity" value="$4.8M" change="+5.2%" />
            <MetricCard label="Live spread" value="$18.4M" change="+2.1%" />
            <MetricCard label="Yield secured" value="$1.3M" change="+9.7%" />
          </div>
        </header>

        <SectionShell title="NIL Arbitrage Board" subtitle="Model value vs market price.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {nilBoards.map((item) => (
              <div key={item.id} style={{ background: '#101b2b', border: '1px solid rgba(125, 211, 252, 0.2)', borderRadius: '16px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{item.name}</strong>
                  <span style={{ color: '#86efac', fontSize: 12 }}>{item.sentiment}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Model-NIL</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>${item.modelNil}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Market-NIL</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>${item.marketNil}</div>
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem', color: '#cbd5e1', fontSize: 14 }}>Spread: ${item.spread}</div>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell title="Sponsor Yield Tranche Board" subtitle="Campaign performance, APY, and risk guardrails.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {campaigns.map((campaign) => (
              <TrancheCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </SectionShell>
      </div>
    </main>
  );
}
