import { z } from 'zod';

export const OBSERVATION_CATEGORIES = [
  'Accessibility',
  'Footpath',
  'Litter',
  'Public Safety',
  'Green Space',
  'Other',
] as const;

export type ObservationCategory = (typeof OBSERVATION_CATEGORIES)[number];

export const ObservationCategorySchema = z.enum(OBSERVATION_CATEGORIES);

export const GenerateReportRequestSchema = z.object({
  observation: z
    .string()
    .trim()
    .min(10, 'Observation must be at least 10 characters')
    .max(2000, 'Observation must not exceed 2000 characters'),
  category: ObservationCategorySchema,
  neighbourhood: z
    .string()
    .trim()
    .max(120, 'Neighbourhood must not exceed 120 characters')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .trim()
    .max(600, 'Notes must not exceed 600 characters')
    .optional()
    .or(z.literal('')),
});

export type GenerateReportRequest = z.infer<typeof GenerateReportRequestSchema>;

export const ModelReportOutputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title is too short')
    .max(150, 'Title is too long'),
  category: ObservationCategorySchema,
  description: z
    .string()
    .trim()
    .min(10, 'Description is too short'),
  potentialImpact: z
    .string()
    .trim()
    .min(10, 'Potential impact is too short'),
  suggestedAction: z
    .string()
    .trim()
    .min(10, 'Suggested action is too short'),
});

export type ModelReportOutput = z.infer<typeof ModelReportOutputSchema>;

export const GenerateReportResponseSchema = z.object({
  success: z.literal(true),
  report: ModelReportOutputSchema,
  metadata: z.object({
    modelId: z.string(),
    inferenceTimeMs: z.number().nonnegative(),
    timestamp: z.string(),
    generatedWithAI: z.literal(true),
  }),
});

export type GenerateReportResponse = z.infer<typeof GenerateReportResponseSchema>;

export const SavedReportSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: ObservationCategorySchema,
  originalObservation: z.string(),
  description: z.string(),
  potentialImpact: z.string(),
  suggestedAction: z.string(),
  neighbourhood: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  generatedWithAI: z.boolean(),
  modelId: z.string().optional(),
  isEdited: z.boolean().default(false),
});

export type SavedReport = z.infer<typeof SavedReportSchema>;

export const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'error']),
  timestamp: z.string(),
  apiVersion: z.string(),
  modelRunner: z.object({
    status: z.enum(['connected', 'disconnected', 'unverified']),
    endpoint: z.string(),
    modelId: z.string().optional(),
    availableModels: z.array(z.string()).optional(),
    error: z.string().optional(),
  }),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const ModelStatusResponseSchema = z.object({
  available: z.boolean(),
  modelId: z.string().optional(),
  availableModels: z.array(z.string()),
  configuredEndpoint: z.string(),
  configuredModel: z.string(),
  timeoutMs: z.number(),
  error: z.string().optional(),
});

export type ModelStatusResponse = z.infer<typeof ModelStatusResponseSchema>;

export const ModelPingResponseSchema = z.object({
  success: z.boolean(),
  latencyMs: z.number().nonnegative(),
  modelId: z.string().optional(),
  reply: z.string().optional(),
  error: z.string().optional(),
});

export type ModelPingResponse = z.infer<typeof ModelPingResponseSchema>;

export const ReportsResponseSchema = z.object({
  reports: z.array(SavedReportSchema),
});

export type ReportsResponse = z.infer<typeof ReportsResponseSchema>;

export const ReportResponseSchema = z.object({
  report: SavedReportSchema,
});

export type ReportResponse = z.infer<typeof ReportResponseSchema>;
