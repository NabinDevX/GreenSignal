import {
  GenerateReportRequest,
  GenerateReportResponse,
  HealthResponse,
  ModelPingResponse,
  ModelStatusResponse,
  ReportResponse,
  ReportsResponse,
  SavedReport,
} from '@groundsignal/shared';

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
const apiBaseUrl = configuredApiBaseUrl.replace(/\/$/, '');
const apiUrl = (path: string) => `${apiBaseUrl}${path}`;

function ensureProductionApiConfiguration(): void {
  if (import.meta.env.PROD && !apiBaseUrl) {
    throw new Error(
      'The production API URL is not configured. Set VITE_API_BASE_URL in the Vercel project and redeploy.'
    );
  }
}

async function readJson<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(text || `API returned a non-JSON response (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function fetchHealth(): Promise<HealthResponse> {
  ensureProductionApiConfiguration();
  const res = await fetch(apiUrl('/api/health'), {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`API health check failed with status ${res.status}`);
  }
  return readJson<HealthResponse>(res);
}

export async function generateReportApi(
  payload: GenerateReportRequest
): Promise<GenerateReportResponse> {
  ensureProductionApiConfiguration();
  const res = await fetch(apiUrl('/api/reports/generate'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data: unknown;
  try {
    data = await readJson<unknown>(res);
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : `API request failed with status ${res.status}`
    );
  }

  if (!res.ok) {
    const errorData = data as ApiError;
    const error = new Error(errorData.error || 'Failed to generate report');
    (error as Error & { code?: string; details?: unknown }).code = errorData.code;
    (error as Error & { code?: string; details?: unknown }).details = errorData.details;
    throw error;
  }

  return data as GenerateReportResponse;
}

export async function pingModel(): Promise<ModelPingResponse> {
  ensureProductionApiConfiguration();
  const res = await fetch(apiUrl('/api/model/ping'), {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });
  return readJson<ModelPingResponse>(res);
}

export async function fetchModelStatus(): Promise<ModelStatusResponse> {
  ensureProductionApiConfiguration();
  const res = await fetch(apiUrl('/api/model/status'));
  if (!res.ok) {
    throw new Error(`Failed to fetch model status: ${res.status}`);
  }
  return readJson<ModelStatusResponse>(res);
}

export async function fetchSavedReports(): Promise<SavedReport[]> {
  ensureProductionApiConfiguration();
  const res = await fetch(apiUrl('/api/archive/reports'), {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch saved reports: ${res.status}`);
  }
  const data = await readJson<ReportsResponse>(res);
  return data.reports;
}

export async function saveReportApi(report: SavedReport): Promise<SavedReport> {
  ensureProductionApiConfiguration();
  const res = await fetch(apiUrl(`/api/archive/reports/${encodeURIComponent(report.id)}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(report),
  });
  if (!res.ok) {
    const data = await readJson<ApiError>(res);
    throw new Error(data.error || `Failed to save report: ${res.status}`);
  }
  return (await readJson<ReportResponse>(res)).report;
}

export async function deleteReportApi(id: string): Promise<void> {
  ensureProductionApiConfiguration();
  const res = await fetch(apiUrl(`/api/archive/reports/${encodeURIComponent(id)}`), {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete report: ${res.status}`);
  }
}
