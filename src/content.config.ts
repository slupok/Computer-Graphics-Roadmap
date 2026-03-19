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
  }),
});

export const collections = { subjects };
