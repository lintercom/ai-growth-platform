import { z } from 'zod';

export const AnalysisSchema = z.object({
  url: z.string().url(),
  analyzedAt: z.string().datetime(),
  summary: z.string(),
  seo: z.object({
    title: z.string().optional(),
    metaDescription: z.string().optional(),
    headings: z.array(z.string()).optional(),
    issues: z.array(z.string()).optional(),
    recommendations: z.array(z.string()).optional(),
  }).optional(),
  ux: z.object({
    structure: z.string().optional(),
    navigation: z.string().optional(),
    issues: z.array(z.string()).optional(),
    recommendations: z.array(z.string()).optional(),
  }).optional(),
  performance: z.object({
    issues: z.array(z.string()).optional(),
    recommendations: z.array(z.string()).optional(),
  }).optional(),
  accessibility: z.object({
    issues: z.array(z.string()).optional(),
    recommendations: z.array(z.string()).optional(),
  }).optional(),
});

export type Analysis = z.infer<typeof AnalysisSchema>;
