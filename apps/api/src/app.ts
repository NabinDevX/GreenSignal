import express, { Express } from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { reportsRouter } from './routes/reports';
import { modelRouter } from './routes/model';
import { config } from './config';
import { listReports, removeReport, upsertReport } from './services/reportStore';
import { SavedReportSchema } from '@groundsignal/shared';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/api', (_req, res) => {
    res.json({
      name: 'GroundSignal API',
      version: '1.0.0',
      modelRunnerEndpoint: config.modelRunnerBaseUrl,
      routes: {
        health: 'GET /api/health',
        modelStatus: 'GET /api/model/status',
        modelPing: 'POST /api/model/ping',
        generateReport: 'POST /api/reports/generate',
      },
      persistence: 'Reports are stored in the local SQLite archive.',
    });
  });

  app.use('/api/health', healthRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/model', modelRouter);

  app.get('/api/archive/reports', (_req, res) => {
    res.json({ reports: listReports() });
  });

  app.put('/api/archive/reports/:id', (req, res) => {
    const validation = SavedReportSchema.safeParse({ ...req.body, id: req.params.id });
    if (!validation.success) {
      res.status(400).json({ error: 'Invalid saved report', details: validation.error.issues });
      return;
    }
    res.json({ report: upsertReport(validation.data) });
  });

  app.delete('/api/archive/reports/:id', (req, res) => {
    res.status(removeReport(req.params.id) ? 204 : 404).send();
  });

  return app;
}
