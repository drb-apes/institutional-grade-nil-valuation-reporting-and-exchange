-- Athletes
CREATE TABLE IF NOT EXISTS athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team TEXT,
  position TEXT,
  base_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  performance_score NUMERIC(3, 2) DEFAULT 0.85,
  sponsorship_fit NUMERIC(3, 2) DEFAULT 0.75,
  media_velocity NUMERIC(4, 2) DEFAULT 1.0,
  social_demand NUMERIC(3, 2) DEFAULT 0.80,
  biometric_stability NUMERIC(3, 2) DEFAULT 0.90,
  fatigue_penalty NUMERIC(3, 2) DEFAULT 0.05,
  risk_discount NUMERIC(3, 2) DEFAULT 0.05,
  volatility_penalty NUMERIC(3, 2) DEFAULT 0.03,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Athlete telemetry snapshots
CREATE TABLE IF NOT EXISTS athlete_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  heart_rate_variability NUMERIC(5, 2),
  readiness NUMERIC(5, 2),
  explosive_output NUMERIC(5, 2),
  fatigue NUMERIC(5, 2),
  recovery NUMERIC(5, 2),
  engagement_velocity NUMERIC(5, 2),
  latency_ms INTEGER,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  quality_score NUMERIC(3, 2) DEFAULT 0.95,
  CONSTRAINT chk_timestamp CHECK (timestamp <= CURRENT_TIMESTAMP)
);
CREATE INDEX idx_athlete_telemetry_athlete_id_timestamp ON athlete_telemetry(athlete_id, timestamp DESC);

-- Market quotes cache
CREATE TABLE IF NOT EXISTS market_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  model_nil NUMERIC(12, 2) NOT NULL,
  market_nil NUMERIC(12, 2) NOT NULL,
  divergence NUMERIC(12, 2) NOT NULL,
  spread_percent NUMERIC(5, 2) NOT NULL,
  bid_price NUMERIC(12, 2),
  ask_price NUMERIC(12, 2),
  volume_24h NUMERIC(15, 4),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_market_quotes_athlete_id ON market_quotes(athlete_id);
CREATE INDEX idx_market_quotes_timestamp ON market_quotes(timestamp DESC);

-- Orders (Track A)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity INTEGER NOT NULL,
  price_per_unit NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'partial', 'cancelled')),
  filled_quantity INTEGER DEFAULT 0,
  executed_price NUMERIC(12, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_quantity CHECK (quantity > 0),
  CONSTRAINT chk_filled CHECK (filled_quantity >= 0 AND filled_quantity <= quantity)
);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_athlete_id ON orders(athlete_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Campaigns (Track B)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL,
  sponsor_name TEXT NOT NULL,
  principal NUMERIC(15, 2) NOT NULL,
  revenue_sweep_percent NUMERIC(5, 2) NOT NULL DEFAULT 10.0,
  risk_profile TEXT NOT NULL DEFAULT 'CRS-0' CHECK (risk_profile IN ('CRS-0', 'CRS-1', 'CRS-2', 'CRS-3')),
  active_tranches INTEGER DEFAULT 3,
  capital_secured NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_principal CHECK (principal > 0)
);
CREATE INDEX idx_campaigns_sponsor_id ON campaigns(sponsor_id);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- Tranches
CREATE TABLE IF NOT EXISTS tranches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL CHECK (class_name IN ('senior', 'mezzanine', 'junior')),
  apy NUMERIC(5, 2) NOT NULL,
  principal NUMERIC(15, 2) NOT NULL,
  risk_band TEXT NOT NULL CHECK (risk_band IN ('CRS-0', 'CRS-1', 'CRS-2', 'CRS-3')),
  units_outstanding NUMERIC(15, 4) NOT NULL,
  unit_price NUMERIC(12, 2) DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_apy CHECK (apy >= 0),
  CONSTRAINT chk_principal CHECK (principal > 0)
);
CREATE INDEX idx_tranches_campaign_id ON tranches(campaign_id);

-- Investor positions
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tranche_id UUID NOT NULL REFERENCES tranches(id) ON DELETE CASCADE,
  units NUMERIC(15, 4) NOT NULL,
  cost_basis NUMERIC(15, 2) NOT NULL,
  current_value NUMERIC(15, 2),
  accrued_yield NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_units CHECK (units > 0),
  CONSTRAINT chk_cost_basis CHECK (cost_basis > 0)
);
CREATE INDEX idx_positions_user_id ON positions(user_id);
CREATE INDEX idx_positions_tranche_id ON positions(tranche_id);

-- Hedge events
CREATE TABLE IF NOT EXISTS hedge_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('CRS-0', 'CRS-1', 'CRS-2', 'CRS-3')),
  trigger_reason TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);
CREATE INDEX idx_hedge_events_campaign_id ON hedge_events(campaign_id);
CREATE INDEX idx_hedge_events_timestamp ON hedge_events(timestamp DESC);

-- Risk snapshots (for analytics)
CREATE TABLE IF NOT EXISTS risk_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  latency_ms INTEGER NOT NULL,
  dwell_time NUMERIC(3, 2) NOT NULL,
  engagement_velocity NUMERIC(5, 2) NOT NULL,
  spend_shock NUMERIC(3, 2) NOT NULL,
  athlete_output_shock NUMERIC(3, 2) NOT NULL,
  risk_score NUMERIC(5, 4) NOT NULL,
  crs_state TEXT NOT NULL CHECK (crs_state IN ('CRS-0', 'CRS-1', 'CRS-2', 'CRS-3')),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_risk_snapshots_campaign_id_timestamp ON risk_snapshots(campaign_id, timestamp DESC);

-- Metrics (telemetry ingestion)
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  source_device TEXT NOT NULL,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  value NUMERIC(15, 4) NOT NULL,
  unit TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  quality_score NUMERIC(3, 2) DEFAULT 0.90,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_metrics_athlete_id_timestamp ON metrics(athlete_id, timestamp DESC);
CREATE INDEX idx_metrics_source_device ON metrics(source, source_device);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  changes JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_user_id_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id);
