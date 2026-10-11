import { createApp } from './app';
import { config } from './config';

const app = createApp();

app.listen(config.port, () => {
  console.log(`[GroundSignal API] Listening on port ${config.port}`);
  console.log(`[GroundSignal API] Model Runner endpoint: ${config.modelRunnerBaseUrl}`);
  console.log(`[GroundSignal API] Configured model: ${config.modelName}`);
});
