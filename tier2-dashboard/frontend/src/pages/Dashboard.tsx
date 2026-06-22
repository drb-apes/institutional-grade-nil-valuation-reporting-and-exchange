import React, { useEffect, useState } from 'react';
import { CRSHeatmap } from '../components/CRSHeatmap';
import { RiskStateChart } from '../components/RiskStateChart';
import { HedgeActionQueue } from '../components/HedgeActionQueue';
import { ContagionPath } from '../components/ContagionPath';
import { LiveMetrics } from '../components/LiveMetrics';
import { useDashboardData } from '../hooks/useDashboardData';
import '../styles/dashboard.css';

interface DashboardProps {
  refreshInterval?: number;  // ms
}

const Dashboard: React.FC<DashboardProps> = ({ refreshInterval = 500 }) => {
  const { crsData, exposures, hedgeActions, contagionPaths, metrics, isLoading, error } =
    useDashboardData(refreshInterval);

  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  if (error) {
    return (
      <div className="error-container">
        <h1>Dashboard Error</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  const riskStateDistribution = {
    state_0: crsData.filter((d) => d.state === 0).length,
    state_1: crsData.filter((d) => d.state === 1).length,
    state_2: crsData.filter((d) => d.state === 2).length,
    state_3: crsData.filter((d) => d.state === 3).length,
    state_4: crsData.filter((d) => d.state === 4).length,
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>BLEI-E Multi-Asset Risk Dashboard</h1>
        <div className="header-metrics">
          <span>Active Athletes: {crsData.length}</span>
          <span>State 3-4: {riskStateDistribution.state_3 + riskStateDistribution.state_4}</span>
          <span>Pending Hedge Actions: {hedgeActions.filter((h) => h.urgency === 'immediate').length}</span>
          <LiveMetrics metrics={metrics} />
        </div>
      </header>

      {/* Main grid */}
      <div className="dashboard-grid">
        {/* Left: CRS Heatmap */}
        <section className="section heatmap-section">
          <h2>Athlete Cohort CRS Heatmap</h2>
          <CRSHeatmap
            data={crsData}
            onAthleteSelect={setSelectedAthleteId}
            selectedAthleteId={selectedAthleteId}
            isLoading={isLoading}
          />
        </section>

        {/* Right top: Risk State Distribution */}
        <section className="section chart-section">
          <h2>Risk State Distribution</h2>
          <RiskStateChart distribution={riskStateDistribution} />
        </section>

        {/* Right bottom: Live Hedge Queue */}
        <section className="section hedge-section">
          <h2>Hedge Action Queue</h2>
          <HedgeActionQueue actions={hedgeActions} />
        </section>

        {/* Bottom: Contagion Paths */}
        <section className="section contagion-section full-width">
          <h2>Cross-Asset Contagion Cascade</h2>
          <ContagionPath paths={contagionPaths} />
        </section>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>Last update: {new Date().toISOString()}</p>
        <p>Latency (p99): {metrics.latency_p99_ms}ms | Throughput: {metrics.throughput_hz}Hz</p>
      </footer>
    </div>
  );
};

export default Dashboard;
