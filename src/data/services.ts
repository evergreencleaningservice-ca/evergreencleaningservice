/**
 * The quote form's service list.
 *
 * THE ORIGINAL SITE'S OWN EIGHT, back again (2026-10-22). The client asked for
 * the form to look and work exactly like the original WPForms form **1381** —
 * the checklist headed "I'm interested in a quote for these services" — matching
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

/**
 * Seven named services, in the site's own words (30 Oct 2026, SEO audit M13).
 *
 * The 22 Oct list was the original WordPress form's: "Reno Construction
 * Clean-up", "Floor Services / Finishing" and "Commercial Carpet Cleaning"
 * named no page on this site, and Industrial & Warehouse and Post-Construction
 * were missing. The client asked for whatever serves the site's SEO best, so
 * each box now uses the name of the service page it maps to; carpet and
 * floor work, which share one page, share one box. Still eight boxes, so the
 * form keeps its height. The column stays free text, so earlier leads keep
 * the names they were sent with.
 */
export const QUOTE_SERVICES = [
  'Office Cleaning',
  'Commercial Cleaning',
  'Janitorial Services',
  'Industrial & Warehouse Cleaning',
  'Post-Construction Cleaning',
  'Property Management and Building Maintenance',
  'Carpet & Floor Care',
] as const;

/** The eighth option. Anything it stands for goes in "Additional comments". */
export const SERVICE_OTHER = 'Other';

/** Every checkbox the form offers, in order. */
export const SERVICE_OPTIONS = [...QUOTE_SERVICES, SERVICE_OTHER] as const;

export type ServiceOption = (typeof SERVICE_OPTIONS)[number];

/**
 * What each box SAYS on screen (31 Oct 2026, "the forms are too long"). In a
 * sidebar's two narrow columns the full names wrapped onto two to four lines
 * each; under the legend "a quote for these services" the short form reads
 * the same. Each must fit one line of the 318px service-page sidebar, about
 * 130px of text at 14px, hence "Industrial" and "Maintenance". The box's
 * value, and so the lead email and the database, keeps the full name above.
 */
export const SERVICE_LABELS: Record<ServiceOption, string> = {
  'Office Cleaning': 'Office',
  'Commercial Cleaning': 'Commercial',
  'Janitorial Services': 'Janitorial',
  'Industrial & Warehouse Cleaning': 'Industrial',
  'Post-Construction Cleaning': 'Post-Construction',
  'Property Management and Building Maintenance': 'Maintenance',
  'Carpet & Floor Care': 'Carpet & Floor Care',
  Other: 'Other',
};
