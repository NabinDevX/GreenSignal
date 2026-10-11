import { Router, Request, Response } from 'express';
import { checkModelRunnerHealth } from '../services/modelService';
import { HealthResponse } from '@groundsignal/shared';
import { config } from '../config';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  const runnerHealth = await checkModelRunnerHealth();

  const healthData: HealthResponse = {
    status: runnerHealth.available ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    apiVersion: '1.0.0',
    modelRunner: {
      status: runnerHealth.available ? 'connected' : 'disconnected',
      endpoint: config.modelRunnerBaseUrl,
      modelId: runnerHealth.modelId,
      availableModels: runnerHealth.availableModels,
      error: runnerHealth.error,
    },
  };

  res.status(runnerHealth.available ? 200 : 200).json(healthData);
});
