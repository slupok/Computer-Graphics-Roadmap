import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const subjects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/subjects' }),
  schema: z.object({
    id: z.number(),
    title: z.string(),
    image: z.string(),
    stage: z.string(),
    order: z.number(),
    description: z.string(),
    resources: z.array(z.object({
      level: z.enum(['easy', 'medium', 'hard']).optional(),
      language: z.enum(['ru', 'en', 'en/ru']).optional(),
      url: z.string().optional(),
      title: z.string(),
      description: z.string().optional(),
    })).default([]),
  }),
});

const stages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stages' }),
  schema: z.object({
    number: z.string(),
    title: z.string(),
    order: z.number(),
  }),
});

export const collections = { subjects, stages };
