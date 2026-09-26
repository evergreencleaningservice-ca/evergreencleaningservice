/**
 * The quote form's service list.
 *
 * SUPPLIED BY THE CLIENT, and that supersedes the archaeology. The list was
 * first rebuilt from the original site's WPForms form **1381** — the
 * checklist headed "I'm interested a quote for these services", eight
 * options recovered verbatim. The client has since given their own list of
 * six plus "Other", and a list the business states today beats one recovered
 * from what its old website happened to be serving.
 *
 * The order is theirs too, not alphabetised and not reordered to match the
 * old one: Commercial Cleaning leads, where the original opened with Office
 * Cleaning.
 *
 * WHAT CHANGED AGAINST THE ORIGINAL EIGHT:
 *
 *   kept     Commercial Cleaning, Office Cleaning, Janitorial Services
 *   added    Industrial Cleaning, Warehouse Cleaning,
 *            Condo Common Area Cleaning
 *   dropped  Property Management and Building Maintenance,
 *            Commercial Carpet Cleaning, Floor Services / Finishing,
 *            Reno Construction Clean-up
 *
 * DROPPED FROM THE FORM IS NOT DROPPED FROM THE SITE. Building maintenance
 * still has its own service page, its navigation entry and its homepage
 * card, and carpet and floor work is still described inside the service
 * pages. This list is what a visitor can ASK FOR in one click; it is not the
 * catalogue of what the business does, and shortening it does not shorten
 * that.
 *
 * Leads already in the database carry the old strings — one row answers
 * "Commercial Carpet Cleaning". Nothing rewrites them: they are what those
 * visitors actually chose, and a value no longer offered is still a true
 * record of an enquiry.
 *
 * WHAT CHANGED FROM THE ORIGINAL'S SHAPE: it was a checklist of checkboxes
 * and is now a single select. The client asked for "the dropdown where the
 * client would select which cleaning service they want" — one answer, not a
 * set. The `services` column is TEXT and held a joined list before, so a
 * single value stores without a migration; rows written either way stay
 * readable.
 *
 * "Other" IS THE LAST OPTION AND IS NOT A FALLBACK. It was on the original
 * list too, and selecting it reveals a free-text box so the visitor can say
 * what they actually need. That box is the only reason the list can stay
 * this short without turning a mismatch into an abandoned form.
 */

/** The six named services, in the client's order. */
export const QUOTE_SERVICES = [
  'Commercial Cleaning',
  'Office Cleaning',
  'Industrial Cleaning',
  'Janitorial Services',
  'Warehouse Cleaning',
  'Condo Common Area Cleaning',
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
