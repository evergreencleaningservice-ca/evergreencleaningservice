/**
 * The quote form's service list.
 *
 * NOT INVENTED HERE. These are the original site's own eight, in the
 * original's order, recovered from WPForms form **1381** — the checklist
 * headed "I'm interested a quote for these services". They are preserved
 * verbatim, including the client's own capitalisation and the spacing in
 * "Floor Services / Finishing", because these strings are what the business
 * has been receiving in its enquiries for years. Rewording them to match the
 * service pages' titles would quietly break comparison with every lead taken
 * before this port.
 *
 * WHAT CHANGED FROM THE ORIGINAL: it was a checklist of eight checkboxes and
 * is now a single select. The client asked for "the dropdown where the client
 * would select which cleaning service they want" — one answer, not a set.
 * The `services` column is TEXT and held a joined list before, so a single
 * value stores without a migration; rows written either way stay readable.
 *
 * "Other" IS THE EIGHTH AND IS NOT A FALLBACK. It was on the original list
 * too, and selecting it reveals a free-text box so the visitor can say what
 * they actually need. That box is the only reason the list can stay this
 * short without turning a mismatch into an abandoned form.
 */

/** The seven named services, in the original's order. */
export const QUOTE_SERVICES = [
  'Office Cleaning',
  'Commercial Cleaning',
  'Property Management and Building Maintenance',
  'Janitorial Services',
  'Commercial Carpet Cleaning',
  'Floor Services / Finishing',
  'Reno Construction Clean-up',
] as const;

/**
 * The eighth option, and the one with behaviour attached.
 *
 * Exported as a constant rather than written as a literal in each of the four
 * places that need it — the markup, the reveal script, the validator and the
 * tests. A string compared by value in four files is a string that gets
 * changed in three of them.
 */
export const SERVICE_OTHER = 'Other';

/** Every option the select offers, in order. */
export const SERVICE_OPTIONS = [...QUOTE_SERVICES, SERVICE_OTHER] as const;

export type ServiceOption = (typeof SERVICE_OPTIONS)[number];
