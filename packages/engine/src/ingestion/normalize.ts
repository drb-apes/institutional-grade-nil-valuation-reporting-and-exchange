export function normalizeMetricRecord(input: Record<string, unknown>) {
  return {
    source: String(input.source ?? 'unknown'),
    sourceDevice: String(input.sourceDevice ?? 'unknown'),
    athleteId: Number(input.athleteId ?? 0),
    timestamp: String(input.timestamp ?? new Date().toISOString()),
    type: String(input.type ?? 'unknown'),
    value: Number(input.value ?? 0),
    unit: String(input.unit ?? 'raw'),
    qualityScore: Number(input.qualityScore ?? 0.8),
    metadata: input.metadata ?? {},
  };
}
