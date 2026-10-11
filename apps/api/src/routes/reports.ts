import { Router, Request, Response } from 'express';
import {
  GenerateReportRequestSchema,
  GenerateReportResponse,
} from '@groundsignal/shared';
import {
  generateReportDraft,
  ModelServiceError,
} from '../services/modelService';

export const reportsRouter = Router();

reportsRouter.post('/generate', async (req: Request, res: Response) => {
  const validation = GenerateReportRequestSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({
      error: 'Invalid observation request',
      details: validation.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    });
    return;
  }

  try {
    const { report, modelId, inferenceTimeMs } = await generateReportDraft(
      validation.data
    );

    const responsePayload: GenerateReportResponse = {
      success: true,
      report,
      metadata: {
        modelId,
        inferenceTimeMs,
        timestamp: new Date().toISOString(),
        generatedWithAI: true,
      },
    };

    res.json(responsePayload);
  } catch (err: unknown) {
    if (err instanceof ModelServiceError) {
      const statusCode =
        err.code === 'CONNECTION_REFUSED'
          ? 503
          : err.code === 'TIMEOUT'
          ? 504
          : err.code === 'MODEL_NOT_FOUND'
          ? 404
          : err.code === 'MALFORMED_OUTPUT' || err.code === 'EMPTY_RESPONSE'
          ? 502
          : 500;

      res.status(statusCode).json({
        error: err.message,
        code: err.code,
        details: err.details,
      });
      return;
    }

    const message = err instanceof Error ? err.message : 'Internal Server Error';
    res.status(500).json({
      error: message,
      code: 'INTERNAL_ERROR',
    });
  }
});
