import dotenv from 'dotenv';
import path from 'path';

const repositoryRoot = path.resolve(import.meta.dir, '../../..');

dotenv.config({ path: path.join(repositoryRoot, '.env') });

const configuredDatabasePath = process.env.DATABASE_PATH;

const configuredModelRunnerBaseUrl =
  process.env.MODEL_RUNNER_BASE_URL || 'http://127.0.0.1:11434/v1';
const modelRunnerBaseUrl =
  process.env.NODE_ENV === 'production' &&
  /localhost:12434|127\.0\.0\.1:12434/.test(configuredModelRunnerBaseUrl)
    ? 'http://127.0.0.1:11434/v1'
    : configuredModelRunnerBaseUrl;

const configuredModelName = process.env.MODEL_NAME || 'smollm2:135m';
const modelName = configuredModelName.startsWith('docker.io/ai/')
  ? configuredModelName.slice('docker.io/ai/'.length)
  : configuredModelName;

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  modelRunnerBaseUrl,
  modelName,
  modelTimeoutMs: parseInt(process.env.MODEL_REQUEST_TIMEOUT_MS || '180000', 10),
  databasePath: configuredDatabasePath
    ? path.resolve(repositoryRoot, configuredDatabasePath)
    : path.join(repositoryRoot, 'apps/api/data/groundsignal.sqlite'),
};
