import dotenv from 'dotenv';
import path from 'path';

const repositoryRoot = path.resolve(import.meta.dir, '../../..');

dotenv.config({ path: path.join(repositoryRoot, '.env') });

const configuredDatabasePath = process.env.DATABASE_PATH;

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  modelRunnerBaseUrl: process.env.MODEL_RUNNER_BASE_URL || 'http://localhost:12434/engines/v1',
  modelName: process.env.MODEL_NAME || 'smollm2:135m',
  modelTimeoutMs: parseInt(process.env.MODEL_REQUEST_TIMEOUT_MS || '180000', 10),
  databasePath: configuredDatabasePath
    ? path.resolve(repositoryRoot, configuredDatabasePath)
    : path.join(repositoryRoot, 'apps/api/data/groundsignal.sqlite'),
};
