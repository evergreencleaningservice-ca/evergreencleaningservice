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
    /**
     * Set on pages whose copy was written for this build rather than taken from
     * the client's own site. Pressure washing, post-construction and graffiti
     * removal are in the overhaul specification's service tree but had no page
     * to port, so the copy is plausible and unverified — it needs the client's
     * sign-off before it describes what they will actually do.
     */
    needsClientCopy: z.boolean().optional(),
  }),
});

export const collections = { blog, pages, services };
