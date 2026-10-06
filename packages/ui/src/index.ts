import type { YieldCampaign } from '@nil-exchange/types';

export function MetricCard({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div style={{ minWidth: 150, background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: 14, padding: '0.85rem 1rem' }}>
      <div style={{ color: '#94a3b8', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{value}</div>
      <div style={{ color: '#86efac', fontSize: 12, marginTop: '0.25rem' }}>{change}</div>
    </div>
  );
}

export function SectionShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section style={{ background: '#0b1320', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '18px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', gap: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{title}</h2>
        {subtitle ? <span style={{ color: '#94a3b8', fontSize: 12 }}>{subtitle}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function TrancheCard({ campaign }: { campaign: YieldCampaign }) {
  return (
    <div style={{ background: '#101b2b', border: '1px solid rgba(125, 211, 252, 0.2)', borderRadius: '16px', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>{campaign.name}</strong>
        <span style={{ color: '#7dd3fc', fontSize: 12 }}>{campaign.riskState}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
        <div>
          <div style={{ color: '#94a3b8', fontSize: 12 }}>APY</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 700 }}>{campaign.apy}%</div>
        </div>
        <div>
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Capital</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>${campaign.capitalSecured.toLocaleString()}</div>
        </div>
      </div>
      <div style={{ marginTop: '0.9rem', color: '#cbd5e1', fontSize: 14 }}>Tranche units: {campaign.trancheUnits}</div>
    </div>
  );
}
