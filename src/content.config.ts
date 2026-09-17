import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

/**
 * Blog posts. These live at the root of the site in the original WordPress
 * install (e.g. /ask-the-office-cleaners-cleaning-break-rooms/), so the entry
 * id is the public slug.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    image: z.string().optional(),
  }),
});

/** Standalone pages: about-us, contact-us, privacy, testimonials, etc. */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
  }),
});

/** Service pages, served under /services/<slug>/. */
const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const collections = { blog, pages, services };
