import express from 'express';
import cors, { CorsOptions } from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware';
import routes from './routes';
import { prisma } from './prisma';
import { connection } from './queue';

if (env.enableInlineWorker) {
  void import('./worker');
}

const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes('*') || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin not allowed: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));

// Mount all routes under /api
app.use('/api', routes);

// Root health check (for Render's health check pings)
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`NexusIndexer backend running on http://localhost:${env.port}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  await connection.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  await connection.quit();
  process.exit(0);
});
