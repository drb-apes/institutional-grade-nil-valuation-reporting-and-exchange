import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface CRSData {
  athlete_id: string;
  timestamp: number;
  crs: number;
  state: 0 | 1 | 2 | 3 | 4;
  factors: {
    PMF_E_zscore: number;
    SEF_E_zscore: number;
    VVE_E_zscore: number;
    FBR_E_zscore: number;
    CSE_E_zscore: number;
  };
  sponsor_exposures: Record<string, number>;
}

interface HedgeAction {
  asset: string;
  action_type: string;
  notional_usd: number;
  urgency: 'immediate' | 'queue' | 'monitor';
  rationale: string;
}

interface ContagionPath {
  source_asset: string;
  destination_asset: string;
  decay_multiplier: number;
  estimated_impact_pct: number;
}

interface Metrics {
  latency_p99_ms: number;
  throughput_hz: number;
  cache_hit_rate: number;
  active_connections: number;
}

export const useDashboardData = (refreshInterval: number = 500) => {
  const [crsData, setCrsData] = useState<CRSData[]>([]);
  const [exposures, setExposures] = useState<Record<string, number>>({});
  const [hedgeActions, setHedgeActions] = useState<HedgeAction[]>([]);
  const [contagionPaths, setContagionPaths] = useState<ContagionPath[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    latency_p99_ms: 0,
    throughput_hz: 0,
    cache_hit_rate: 100,
    active_connections: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { isConnected, lastMessage } = useWebSocket('ws://localhost:3001/ws');

  // Process incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    try {
      const update = JSON.parse(lastMessage);

      if (update.type === 'dashboard_update') {
        setCrsData((prev) => {
          const idx = prev.findIndex((d) => d.athlete_id === update.athlete_id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = update.data;
            return updated;
          }
          return [...prev, update.data];
        });

        if (update.hedge_actions) {
          setHedgeActions(update.hedge_actions);
        }

        if (update.contagion_paths) {
          setContagionPaths(update.contagion_paths);
        }

        if (update.metrics) {
          setMetrics(update.metrics);
        }
      }

      setIsLoading(false);
    } catch (err) {
      setError(new Error(`Failed to parse WebSocket message: ${err}`));
    }
  }, [lastMessage]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [crsRes, exposuresRes, hedgeRes, contagionRes] = await Promise.all([
          fetch('http://localhost:3001/api/athletes'),
          fetch('http://localhost:3001/api/exposures'),
          fetch('http://localhost:3001/api/hedge-queue'),
          fetch('http://localhost:3001/api/contagion-paths'),
        ]);

        if (!crsRes.ok) throw new Error('Failed to fetch CRS data');
        if (!exposuresRes.ok) throw new Error('Failed to fetch exposures');
        if (!hedgeRes.ok) throw new Error('Failed to fetch hedge queue');
        if (!contagionRes.ok) throw new Error('Failed to fetch contagion paths');

        const [crsJson, exposuresJson, hedgeJson, contagionJson] = await Promise.all([
          crsRes.json(),
          exposuresRes.json(),
          hedgeRes.json(),
          contagionRes.json(),
        ]);

        setCrsData(crsJson);
        setExposures(exposuresJson);
        setHedgeActions(hedgeJson);
        setContagionPaths(contagionJson);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    crsData,
    exposures,
    hedgeActions,
    contagionPaths,
    metrics,
    isLoading,
    error,
  };
};
