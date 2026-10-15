import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { Kafka } from 'kafkajs';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const kafka = new Kafka({
  clientId: 'blei-e-dashboard',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const consumer = kafka.consumer({ groupId: 'blei-e-dashboard-group' });

let allCRSData: Map<string, any> = new Map();
let allHedgeActions: any[] = [];
let allContagionPaths: any[] = [];
let systemMetrics = {
  latency_p99_ms: 0,
  throughput_hz: 0,
  cache_hit_rate: 100,
  active_connections: 0,
};

// REST API endpoints
app.get('/api/athletes', (req, res) => {
  const athletes = Array.from(allCRSData.values());
  res.json(athletes);
});

app.get('/api/athletes/:id', (req, res) => {
  const athlete = allCRSData.get(req.params.id);
  if (!athlete) return res.status(404).json({ error: 'Athlete not found' });
  res.json(athlete);
});

app.get('/api/hedge-queue', (req, res) => {
  res.json(allHedgeActions);
});

app.get('/api/contagion-paths', (req, res) => {
  res.json(allContagionPaths);
});

app.get('/api/metrics/latency', (req, res) => {
  res.json({ latency_p99_ms: systemMetrics.latency_p99_ms });
});

// WebSocket connection
wss.on('connection', (ws) => {
  systemMetrics.active_connections++;
  console.log(`[WebSocket] Client connected. Total: ${systemMetrics.active_connections}`);

  // Send initial snapshot
  const snapshot = {
    type: 'snapshot',
    athletes: Array.from(allCRSData.values()),
    hedge_actions: allHedgeActions,
    contagion_paths: allContagionPaths,
    metrics: systemMetrics,
  };
  ws.send(JSON.stringify(snapshot));

  ws.on('close', () => {
    systemMetrics.active_connections--;
    console.log(`[WebSocket] Client disconnected. Total: ${systemMetrics.active_connections}`);
  });
});

// Kafka consumer
const startKafkaConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'blei-e-crs-output', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const crsUpdate = JSON.parse(message.value?.toString() || '{}');
      allCRSData.set(crsUpdate.athlete_id, crsUpdate);

      // Update hedge actions and contagion paths
      if (crsUpdate.hedge_actions) {
        allHedgeActions = crsUpdate.hedge_actions;
      }
      if (crsUpdate.contagion_paths) {
        allContagionPaths = crsUpdate.contagion_paths;
      }

      // Broadcast to all WebSocket clients
      const update = {
        type: 'dashboard_update',
        athlete_id: crsUpdate.athlete_id,
        data: crsUpdate,
        hedge_actions: allHedgeActions,
        contagion_paths: allContagionPaths,
        metrics: systemMetrics,
      };

      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify(update));
        }
      });
    },
  });
};

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`);
  startKafkaConsumer().catch(console.error);
});

process.on('SIGINT', async () => {
  await consumer.disconnect();
  process.exit(0);
});
