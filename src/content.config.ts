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
    /** When the post was last materially revised, e.g. when other posts were
        merged into it (SEO audit H7). Omitted when it never was. */
    updatedDate: z.coerce.date().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    /** A shorter headline for the <title> only, when `title` would push the
        brand suffix past 60 characters. Both layouts honour it and pass it
        through pageTitle(). */
    seoTitle: z.string().optional(),
    /** Opt-in editorial guide layout; legacy posts retain PostLayout. */
    guide: z.object({
      category: z.string(),
      breadcrumb: z.string(),
      intro: z.string(),
      ctaHeading: z.string().optional(),
      ctaText: z.string().optional(),
      ctaResponse: z.string().optional(),
      /** An article may place its own CTA before a closing FAQ section. */
      showCta: z.boolean().default(true),
      /** The featured photo's source, kept as a record; not shown on the page
          (credits removed 2026-11-04; the Premium licence needs none —
          docs/stock-photos/). */
      imageCredit: z.object({ name: z.string(), url: z.string().url() }).optional(),
      contents: z.array(z.object({ label: z.string(), id: z.string() })),
      related: z.array(z.object({ slug: z.string(), label: z.string() })),
    }).optional(),
    /**
     * Tag slugs, as the original's WordPress assigns them. Every slug must be
     * one of `src/data/tags.ts` — `tests/build/tags.test.ts` enforces that, so
     * a typo becomes a failing test rather than an archive page nobody links
     * to. Three posts genuinely carry none and simply omit the key.
     */
    tags: z.array(z.string()).default([]),
  }),
});

/** Standalone pages: about-us, contact-us, privacy, testimonials, etc. */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    /** A captioned photo grid, rendered by the page after its body. Only
        /cleaning-demo-gallery/ carries one. */
    photos: z
      .array(z.object({ src: z.string(), alt: z.string(), caption: z.string() }))
      .default([]),
  }),
});

/**
 * The structured sections a service or industry page can carry (2026-10-15).
 *
 * Every field is optional, so a page with only its original Markdown still
 * renders exactly as before; a page that fills them in gets the full
 * template — who it is for, what is included, scope notes, scheduling,
 * process, pricing factors, proof, FAQs and related links. A section with
 * no content is simply not rendered, so a missing fact never becomes an
 * empty heading or a placeholder.
 */
const offerFields = {
  /** Visible H1, when it should differ from the short `title`. */
  h1: z.string().optional(),
  /** The <title> text, when the default would be weak or too long. Written
      without the brand: pageTitle() adds " | Evergreen" when it fits
      (13 Nov 2026, SEO audit 11 Nov N4). */
  seoTitle: z.string().optional(),
  /** One or two sentences under the H1. */
  summary: z.string().optional(),
  fitHeading: z.string().optional(),
  fit: z.array(z.string()).default([]),
  included: z.array(z.object({ heading: z.string(), items: z.array(z.string()) })).default([]),
  /** Scope limits and what is confirmed at the walkthrough. */
  scope: z.array(z.string()).default([]),
  scheduling: z.array(z.string()).default([]),
  showProcess: z.boolean().default(false),
  showPricing: z.boolean().default(false),
  /** Names from src/data/reviews.ts. */
  reviews: z.array(z.string()).default([]),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  related: z.array(z.object({ title: z.string(), href: z.string(), text: z.string().optional() })).default([]),
  /** Show the service-area block. */
  showAreas: z.boolean().default(false),
  ctaHeading: z.string().optional(),
  ctaText: z.string().optional(),
};

/** Service pages, served under /services/<slug>/. */
const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    ...offerFields,
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
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

/** Industry pages, served under /industries/<slug>/. Same template fields. */
const industries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/industries' }),
  schema: z.object({
    ...offerFields,
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

/**
 * Case studies, served under /projects/<slug>/ — ONLY when `status` is
 * `published` and the evidence fields say the client approved it.
 *
 * The model asks for what a buyer needs to believe a case study and what the
 * business must be able to stand behind: the facility, roughly where, what
 * they needed, what was done, how, and what changed — plus approval for the
 * photographs and the quotation. A draft can exist with any of them missing;
 * it renders nowhere, is in no sitemap and links from nowhere. The build
 * refuses to publish one whose approvals are not recorded (see
 * src/lib/projects.ts).
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['draft', 'published']).default('draft'),
    description: z.string(),
    facilityType: z.string(),
    /** Municipality or neighbourhood only — never a street address or a
        client name unless the client has approved naming it. */
    location: z.string(),
    clientName: z.string().optional(),
    clientNameApproved: z.boolean().default(false),
    initialNeeds: z.array(z.string()).default([]),
    scope: z.array(z.string()).default([]),
    process: z.array(z.string()).default([]),
    /** Only outcomes the client has confirmed. No estimates, no invented metrics. */
    outcomes: z.array(z.string()).default([]),
    outcomeVerifiedBy: z.string().optional(),
    photos: z
      .array(z.object({ src: z.string(), alt: z.string(), approved: z.boolean().default(false) }))
      .default([]),
    testimonial: z
      .object({ quote: z.string(), attribution: z.string(), approved: z.boolean().default(false) })
      .optional(),
    services: z.array(z.string()).default([]),
    /** What is still missing, for the intake list. Not rendered. */
    evidenceNeeded: z.array(z.string()).default([]),
    completed: z.string().optional(),
  }),
});

export const collections = { blog, pages, services, industries, projects };
