/**
 * The quote form's service list.
 *
 * THE ORIGINAL SITE'S OWN EIGHT, back again (2026-10-22). The client asked for
 * the form to look and work exactly like the original WPForms form **1381** —
 * the checklist headed "I'm interested a quote for these services" — matching
 * the notification email they were used to receiving from it. That supersedes
 * the six-plus-Other list the client supplied earlier, which had added
 * Industrial, Warehouse and Condo Common Area Cleaning and dropped four of
 * these.
 *
 * It is a set of CHECKBOXES again, not a select: a visitor can ask about
 * office cleaning and carpet cleaning in one enquiry, which is exactly what
 * real leads did. The `services` column is TEXT and stores the ticked options
 * joined with ", ", the same shape it held before the select.
 *
 * Leads already in the database carry whatever list was live when they were
 * sent. Nothing rewrites them.
 */

/** The original's seven named services, in its order. */
export const QUOTE_SERVICES = [
  'Office Cleaning',
  'Commercial Cleaning',
  'Property Management and Building Maintenance',
  'Janitorial Services',
  'Commercial Carpet Cleaning',
  'Floor Services / Finishing',
  'Reno Construction Clean-up',
] as const;

/** The eighth option. Anything it stands for goes in "Additional comments". */
export const SERVICE_OTHER = 'Other';

/** Every checkbox the form offers, in order. */
export const SERVICE_OPTIONS = [...QUOTE_SERVICES, SERVICE_OTHER] as const;

export type ServiceOption = (typeof SERVICE_OPTIONS)[number];
