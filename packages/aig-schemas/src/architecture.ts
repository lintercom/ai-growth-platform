import { z } from 'zod';

export const SystemArchitectureSchema = z.object({
  type: z.literal('system'),
  designedAt: z.string().datetime(),
  overview: z.string(),
  layers: z.array(z.object({
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()).optional(),
    responsibilities: z.array(z.string()).optional(),
  })).optional(),
  components: z.array(z.object({
    name: z.string(),
    description: z.string(),
    type: z.string(),
    dependencies: z.array(z.string()).optional(),
  })).optional(),
  dataFlow: z.string().optional(),
  scalability: z.string().optional(),
  security: z.string().optional(),
});

export const UIArchitectureSchema = z.object({
  type: z.literal('ui'),
  designedAt: z.string().datetime(),
  overview: z.string(),
  designSystem: z.object({
    tokens: z.record(z.unknown()).optional(),
    components: z.array(z.string()).optional(),
  }).optional(),
  pageStructure: z.array(z.object({
    name: z.string(),
    sections: z.array(z.string()).optional(),
  })).optional(),
  navigation: z.object({
    structure: z.string().optional(),
    patterns: z.array(z.string()).optional(),
  }).optional(),
  responsiveness: z.string().optional(),
});

export type SystemArchitecture = z.infer<typeof SystemArchitectureSchema>;
export type UIArchitecture = z.infer<typeof UIArchitectureSchema>;
