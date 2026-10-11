import { Router, Request, Response } from 'express';
import { checkModelRunnerHealth } from '../services/modelService';
import { config } from '../config';

export const modelRouter = Router();

modelRouter.get('/status', async (_req: Request, res: Response) => {
  const health = await checkModelRunnerHealth();
  res.json({
    ...health,
    configuredEndpoint: config.modelRunnerBaseUrl,
    configuredModel: config.modelName,
    timeoutMs: config.modelTimeoutMs,
  });
});

modelRouter.post('/ping', async (_req: Request, res: Response) => {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.modelTimeoutMs);

  try {
    const health = await checkModelRunnerHealth();
    if (!health.available) {
      clearTimeout(timeoutId);
      res.status(503).json({
        success: false,
        latencyMs: Date.now() - startTime,
        error: health.error || 'Model runner is offline',
      });
      return;
    }

    const modelToUse = health.modelId || config.modelName;

    const compRes = await fetch(`${config.modelRunnerBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelToUse,
        messages: [{ role: 'user', content: 'Say "pong"' }],
        max_tokens: 5,
        temperature: 0.0,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!compRes.ok) {
      const txt = await compRes.text();
      res.status(502).json({
        success: false,
        latencyMs,
        error: `Model ping returned status ${compRes.status}: ${txt}`,
      });
      return;
    }

    const json = (await compRes.json()) as { choices?: Array<{ message?: { content?: string } }> };
    res.json({
      success: true,
      latencyMs,
      modelId: modelToUse,
      reply: json.choices?.[0]?.message?.content?.trim() || '',
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    const msg = err instanceof Error ? err.message : 'Unknown ping failure';
    res.status(500).json({
      success: false,
      latencyMs,
      error: msg,
    });
  }
});
