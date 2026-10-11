import { config } from '../config';
import {
  GenerateReportRequest,
  ModelReportOutput,
  ModelReportOutputSchema,
} from '@groundsignal/shared';

export class ModelServiceError extends Error {
  constructor(
    message: string,
    public code:
      | 'CONNECTION_REFUSED'
      | 'TIMEOUT'
      | 'MODEL_NOT_FOUND'
      | 'MALFORMED_OUTPUT'
      | 'EMPTY_RESPONSE'
      | 'SERVICE_ERROR',
    public details?: unknown
  ) {
    super(message);
    this.name = 'ModelServiceError';
  }
}

export interface ModelDiscoveryResult {
  available: boolean;
  modelId?: string;
  availableModels: string[];
  error?: string;
}

export async function checkModelRunnerHealth(): Promise<ModelDiscoveryResult> {
  const url = `${config.modelRunnerBaseUrl}/models`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        available: false,
        availableModels: [],
        error: `Model runner responded with HTTP ${response.status}`,
      };
    }

    const data = (await response.json()) as { data?: Array<{ id: string }> };
    const availableModels = (data.data || []).map((m) => m.id);

    let resolvedModel = config.modelName;
    if (!availableModels.includes(resolvedModel) && availableModels.length > 0) {
      resolvedModel = availableModels[0];
    }

    return {
      available: availableModels.length > 0,
      modelId: resolvedModel,
      availableModels,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const errorMsg =
      err instanceof Error
        ? err.name === 'AbortError'
          ? 'Connection to Docker Model Runner timed out'
          : err.message
        : 'Unknown connection failure';

    return {
      available: false,
      availableModels: [],
      error: `Docker Model Runner unreachable on ${config.modelRunnerBaseUrl} (${errorMsg})`,
    };
  }
}

function extractAndParseJson(text: string): unknown {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
  }

  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch {}
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {}
  }

  throw new Error('Could not parse valid JSON from model response');
}

export async function generateReportDraft(
  input: GenerateReportRequest
): Promise<{ report: ModelReportOutput; modelId: string; inferenceTimeMs: number }> {
  const health = await checkModelRunnerHealth();
  if (!health.available) {
    throw new ModelServiceError(
      health.error || 'Docker Desktop Model Runner is not running or has no models loaded.',
      'CONNECTION_REFUSED'
    );
  }

  const targetModel = health.modelId || config.modelName;

  const systemPrompt =
    'You generate concise, factual, constructive community reports based solely on user-provided observations. ' +
    'Do not invent locations, dates, identities, legal violations, witnesses, official submissions, authority contacts, or resolutions. ' +
    'Clearly distinguish supplied facts from possible impacts and recommendations. Use respectful, non-accusatory language. ' +
    'Return a single JSON object containing the required fields. If information is unknown, state that it is unknown rather than guessing.';

  const userPrompt = [
    `Category: ${input.category}`,
    input.neighbourhood ? `Neighbourhood / Location: ${input.neighbourhood}` : null,
    `Observation: ${input.observation}`,
    input.notes ? `Additional Notes: ${input.notes}` : null,
    '',
    'Produce a structured community report strictly as a JSON object adhering to this schema:',
    '{',
    '  "title": "A concise, objective summary title (5-10 words)",',
    `  "category": "${input.category}",`,
    '  "description": "Factual description of the reported public space issue",',
    '  "potentialImpact": "Potential practical impact on pedestrian safety, accessibility, or neighbourhood quality",',
    '  "suggestedAction": "Constructive civic suggestion or maintenance request"',
    '}',
  ]
    .filter(Boolean)
    .join('\n');

  const controller = new AbortController();
  const timeoutMs = config.modelTimeoutMs;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = Date.now();

  try {
    const response = await fetch(`${config.modelRunnerBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 500,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404) {
        throw new ModelServiceError(
          `Model "${targetModel}" not found in local runner. Ensure it is pulled in Docker Desktop.`,
          'MODEL_NOT_FOUND',
          errorText
        );
      }
      throw new ModelServiceError(
        `Model runner returned HTTP ${response.status}: ${errorText}`,
        'SERVICE_ERROR',
        errorText
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new ModelServiceError(
        'Model runner returned an empty completion.',
        'EMPTY_RESPONSE'
      );
    }

    let parsed: unknown;
    try {
      parsed = extractAndParseJson(content);
    } catch (parseErr) {
      throw new ModelServiceError(
        `Model output was not valid JSON: ${(parseErr as Error).message}. Raw content: ${content.substring(0, 200)}...`,
        'MALFORMED_OUTPUT',
        { raw: content }
      );
    }

    const validationResult = ModelReportOutputSchema.safeParse(parsed);
    if (!validationResult.success) {
      throw new ModelServiceError(
        `Model output did not match expected report schema: ${validationResult.error.message}`,
        'MALFORMED_OUTPUT',
        validationResult.error.format()
      );
    }

    const inferenceTimeMs = Date.now() - startTime;

    return {
      report: validationResult.data,
      modelId: targetModel,
      inferenceTimeMs,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof ModelServiceError) {
      throw err;
    }

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new ModelServiceError(
          `Model request timed out after ${timeoutMs}ms.`,
          'TIMEOUT'
        );
      }
      if ('code' in err && (err as { code: string }).code === 'ECONNREFUSED') {
        throw new ModelServiceError(
          `Cannot connect to Docker Model Runner at ${config.modelRunnerBaseUrl}. Ensure Docker Desktop Model Runner is active.`,
          'CONNECTION_REFUSED'
        );
      }
      throw new ModelServiceError(err.message, 'SERVICE_ERROR');
    }

    throw new ModelServiceError('Unknown error during model inference', 'SERVICE_ERROR');
  }
}
