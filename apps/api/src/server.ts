import express from 'express';
import cors from 'cors';
import trackA from './routes/track-a.js';
import trackB from './routes/track-b.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'ig-nil-api' });
});

app.use('/api/v1/track-a', trackA);
app.use('/api/v1/track-b', trackB);

app.listen(port, () => {
  console.log(`Institutional Grade NIL API listening on http://localhost:${port}`);
});
