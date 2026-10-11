import { describe, expect, it } from 'bun:test';
import {
  GenerateReportRequestSchema,
  ModelReportOutputSchema,
  SavedReportSchema,
  OBSERVATION_CATEGORIES,
} from '../index';

describe('Shared Schemas & Validation', () => {
  describe('GenerateReportRequestSchema', () => {
    it('accepts valid observation requests', () => {
      const valid = {
        observation: 'A delivery truck is parked over the curb ramp on 4th street.',
        category: 'Accessibility',
        neighbourhood: 'Downtown',
        notes: 'Observed at 8:30am',
      };
      const result = GenerateReportRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects observations that are too short (< 10 chars)', () => {
      const invalid = {
        observation: 'Too short',
        category: 'Footpath',
      };
      const result = GenerateReportRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 10 characters');
      }
    });

    it('rejects empty observation strings', () => {
      const invalid = {
        observation: '   ',
        category: 'Litter',
      };
      const result = GenerateReportRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects invalid categories not in permitted set', () => {
      const invalid = {
        observation: 'There is excessive garbage near the bus shelter.',
        category: 'CommercialZoning',
      };
      const result = GenerateReportRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('accepts all 6 permitted categories', () => {
      for (const cat of OBSERVATION_CATEGORIES) {
        const payload = {
          observation: 'Valid test observation text for testing category parsing.',
          category: cat,
        };
        const result = GenerateReportRequestSchema.safeParse(payload);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('ModelReportOutputSchema', () => {
    it('validates a complete, structured report output', () => {
      const validOutput = {
        title: 'Obstructed curb ramp at 4th Ave transit crossing',
        category: 'Accessibility',
        description:
          'Commercial delivery vehicle parked directly across sidewalk ramp zone.',
        potentialImpact:
          'Forces wheelchair users and strollers into active vehicle traffic lane.',
        suggestedAction:
          'Request traffic enforcement monitoring during peak morning delivery window.',
      };
      const res = ModelReportOutputSchema.safeParse(validOutput);
      expect(res.success).toBe(true);
    });

    it('rejects output missing required fields (e.g. missing suggestedAction)', () => {
      const missingField = {
        title: 'Obstructed curb ramp',
        category: 'Accessibility',
        description: 'Commercial delivery vehicle parked.',
        potentialImpact: 'Forces wheelchair users into traffic.',
      };
      const res = ModelReportOutputSchema.safeParse(missingField);
      expect(res.success).toBe(false);
    });

    it('rejects empty or whitespace-only title or description', () => {
      const emptyDesc = {
        title: 'Valid title',
        category: 'Footpath',
        description: '   ',
        potentialImpact: 'Moderate hazard',
        suggestedAction: 'Repair sidewalk',
      };
      const res = ModelReportOutputSchema.safeParse(emptyDesc);
      expect(res.success).toBe(false);
    });
  });

  describe('SavedReportSchema', () => {
    it('validates a persisted report with edit status', () => {
      const saved = {
        id: 'rep-test-01',
        title: 'Pavement crack',
        category: 'Footpath',
        originalObservation: 'A crack in the sidewalk is tripping joggers.',
        description: 'Displaced flagstone along sidewalk corridor.',
        potentialImpact: 'Pedestrian trip hazard.',
        suggestedAction: 'Fill crack with cold asphalt patch.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        generatedWithAI: true,
        modelId: 'docker.io/ai/llama3.2:latest',
        isEdited: true,
      };
      const res = SavedReportSchema.safeParse(saved);
      expect(res.success).toBe(true);
    });
  });
});
