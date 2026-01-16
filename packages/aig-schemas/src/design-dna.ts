import { z } from 'zod';

export const DesignDNASchema = z.object({
  url: z.string().url(),
  analyzedAt: z.string().datetime(),
  colorPalette: z.object({
    primary: z.array(z.string()).optional(),
    secondary: z.array(z.string()).optional(),
    neutral: z.array(z.string()).optional(),
  }).optional(),
  typography: z.object({
    fontFamilies: z.array(z.string()).optional(),
    headingStyles: z.array(z.string()).optional(),
    bodyStyles: z.array(z.string()).optional(),
  }).optional(),
  spacing: z.object({
    rhythm: z.string().optional(),
    scale: z.string().optional(),
  }).optional(),
  components: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    principles: z.array(z.string()).optional(),
  })).optional(),
  patterns: z.array(z.string()).optional(),
  principles: z.array(z.string()),
});

export type DesignDNA = z.infer<typeof DesignDNASchema>;
