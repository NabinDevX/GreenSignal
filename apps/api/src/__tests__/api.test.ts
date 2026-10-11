import { describe, expect, it } from 'bun:test';
import { createApp } from '../app';
import { ModelServiceError } from '../services/modelService';

describe('Express API Endpoints & Model Error Handling', () => {
  const app = createApp();

  describe('GET /api', () => {
    it('publishes the routes used by the web client', async () => {
      const server = app.listen(0);
      const port = (server.address() as { port: number }).port;

      try {
        const res = await fetch(`http://localhost:${port}/api`);
        expect(res.status).toBe(200);

        const data = (await res.json()) as {
          routes: Record<string, string>;
          persistence: string;
        };
        expect(data.routes.health).toBe('GET /api/health');
        expect(data.routes.modelStatus).toBe('GET /api/model/status');
        expect(data.routes.modelPing).toBe('POST /api/model/ping');
        expect(data.routes.generateReport).toBe('POST /api/reports/generate');
        expect(data.persistence).toContain('local SQLite');
      } finally {
        server.close();
      }
    });
  });

  describe('GET /api/health', () => {
    it('returns an API status response payload', async () => {
      const server = app.listen(0);
      const port = (server.address() as { port: number }).port;

      try {
        const res = await fetch(`http://localhost:${port}/api/health`);
        expect(res.status).toBe(200);

        const data = (await res.json()) as { status: string; modelRunner: { endpoint: string } };
        expect(['ok', 'degraded']).toContain(data.status);
        expect(data.modelRunner).toBeDefined();
        expect(data.modelRunner.endpoint).toBeDefined();
      } finally {
        server.close();
      }
    });
  });

  describe('SQLite report archive', () => {
    it('creates, lists, and removes a saved report', async () => {
      const server = app.listen(0);
      const port = (server.address() as { port: number }).port;
      const id = `test-${Date.now()}`;
      const report = {
        id,
        title: 'Test archive report',
        category: 'Accessibility',
        originalObservation: 'A test observation with enough detail.',
        description: 'A factual test description for the local archive.',
        potentialImpact: 'A potential test impact for archive validation.',
        suggestedAction: 'A constructive test action for archive validation.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        generatedWithAI: false,
        isEdited: false,
      };

      try {
        const saveResponse = await fetch(`http://localhost:${port}/api/archive/reports/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
        });
        expect(saveResponse.status).toBe(200);

        const listResponse = await fetch(`http://localhost:${port}/api/archive/reports`);
        const listData = (await listResponse.json()) as { reports: Array<{ id: string }> };
        expect(listData.reports.some((item) => item.id === id)).toBe(true);

        const deleteResponse = await fetch(`http://localhost:${port}/api/archive/reports/${id}`, {
          method: 'DELETE',
        });
        expect(deleteResponse.status).toBe(204);
      } finally {
        server.close();
      }
    });
  });

  describe('POST /api/reports/generate (Validation)', () => {
    it('rejects empty observation with HTTP 400 and clear error detail', async () => {
      const server = app.listen(0);
      const port = (server.address() as { port: number }).port;

      try {
        const res = await fetch(`http://localhost:${port}/api/reports/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            observation: '',
            category: 'Accessibility',
          }),
        });

        expect(res.status).toBe(400);
        const data = (await res.json()) as { error: string; details: Array<{ field: string; message: string }> };
        expect(data.error).toBe('Invalid observation request');
        expect(data.details.some((d) => d.field === 'observation')).toBe(true);
      } finally {
        server.close();
      }
    });

    it('rejects invalid category with HTTP 400', async () => {
      const server = app.listen(0);
      const port = (server.address() as { port: number }).port;

      try {
        const res = await fetch(`http://localhost:${port}/api/reports/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            observation: 'This is a sufficiently long observation text for testing.',
            category: 'InvalidNonExistentCategory',
          }),
        });

        expect(res.status).toBe(400);
        const data = (await res.json()) as { error: string; details: Array<{ field: string }> };
        expect(data.details.some((d) => d.field === 'category')).toBe(true);
      } finally {
        server.close();
      }
    });
  });

  describe('ModelServiceError Class & Error Mapping', () => {
    it('constructs correct error codes and properties', () => {
      const err = new ModelServiceError('Connection refused to port 12434', 'CONNECTION_REFUSED');
      expect(err.code).toBe('CONNECTION_REFUSED');
      expect(err.message).toContain('port 12434');

      const timeoutErr = new ModelServiceError('Request timed out after 60000ms', 'TIMEOUT');
      expect(timeoutErr.code).toBe('TIMEOUT');

      const malformedErr = new ModelServiceError('Invalid JSON returned', 'MALFORMED_OUTPUT', { raw: 'not json' });
      expect(malformedErr.code).toBe('MALFORMED_OUTPUT');
      expect(malformedErr.details).toBeDefined();
    });
  });
});
