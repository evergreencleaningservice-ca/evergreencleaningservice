# Page inventory: sitemap after this change

The sitemap has **73 URLs** (69 before). Every one is canonical, indexable and returns 200. Noindexed pages are excluded, and so are drafts, which build nothing at all. No existing URL was changed or removed, so no new redirects were needed. All 154 existing redirect rules are unchanged.

## New pages (indexable, in the sitemap)

| URL | Search intent | Audience | Unique value | Primary action | Key internal links | Source of claims |
|---|---|---|---|---|---|---|
| `/industries/` | "commercial cleaning for [type of building]" | Facility, office and property managers | Every facility type the business names, grouped, each pointing to the page that covers it | Quote band | All services; 2 industry pages | `src/data/industries.ts` (sourced per entry) |
| `/industries/medical-dental-clinics/` | "dental office cleaning toronto", "medical clinic cleaning" | Clinic managers and owners | Clinic-specific scope by area, protocol boundaries (what stays with clinical staff), products | Side quote form (`industry-medical-dental-clinics`) | Disinfection, office, dental checklist post, green products | /about-us/, service lists, Mississauga client copy, green products page |
| `/industries/property-management/` | "condo cleaning", "property management cleaning toronto" | Property managers, condo boards | Recurring common areas plus one-off work at short notice; one contact across buildings | Side quote form | Building maintenance, emergency, office, pressure washing | Quote-form service list, Michael Katchen review, Mississauga copy |
| `/our-process/` | "how commercial cleaning works", brand evaluation | Buyers comparing providers | Five steps from first call to inspections; how quality is kept; pricing factors | Quote band | 4 core services | `src/data/process.ts` (sourced per line) |

## Substantially improved (same URL)

| URL | What changed |
|---|---|
| `/` | New hero (what, where, for whom, two actions). Sections for all services, industries, why Evergreen, process, service areas and reviews. The rotating brandmark, dot navigation and the long About essay (with its unverifiable superlatives) were removed. New title and description. |
| `/services/office-cleaning/` | **Highest-priority service page.** Who it's for, what's included (every visit / periodic), scheduling, scope and limits, process, pricing factors, 2 reviews, 7 FAQs (FAQPage schema), related links, service areas, side quote form. The client's original copy is kept. |
| `/services/commercial-cleaning/` | Same template. Facility list kept, unverifiable claims removed ("80% referrals", "certified"). |
| `/services/building-maintenance/` | **Was a one-paragraph placeholder ending in "…".** It now covers floors, carpets, high surfaces, glass, exteriors, a maintenance programme, scope limits and FAQs. |
| `/services/post-construction-cleaning/` | Restructured: who it's for, during/after build, before handover, scheduling, scope limits, FAQs. Still flagged `needsClientCopy` for sign-off. |
| `/services/industrial-cleaning/`, `/disinfection-cleaning/`, `/emergency-cleaning/`, `/pressure-washing/`, `/graffiti-removal/` | Now on the shared template: summary, trust strip, side quote form, related links. Weak titles and descriptions replaced. Body copy unchanged. |
| `/locations/*` (7) | City map embed removed, because it implied a local office. Each now says where crews come from, has a quote form, service links, process, reviews, a local FAQ and nearby areas. Unverified local specifics on Downtown, Brampton and Oakville were replaced with the client's own facility list. |
| `/locations/` | The claim "each area has its own crews" was removed. Full verified coverage list added. |
| `/about-us/`, `/request-a-quote/` | Meta descriptions rewritten ("Visit our website…" and a typo). |
| Every page | Header with hubs, phone and quote action. Footer with address, phone, email, hours, quote button and key links. |

## Campaign pages (noindex, not in the sitemap, self-canonical)

| URL | Status | Shadows (organic) | Why noindex |
|---|---|---|---|
| `/lp/commercial-cleaning/` | existing | `/services/commercial-cleaning/` | Duplicates the organic intent; exists for paid traffic |
| `/lp/commercial-cleaning-quote/` | existing | same | same |
| `/lp/office-cleaning/` | **new** | `/services/office-cleaning/` | same |
| `/lp/post-construction-cleaning/` | **new** | `/services/post-construction-cleaning/` | same |
| `/thank-you/` | existing | — | Confirmation page |

A paid page carries `noindex, nofollow` and a self-referencing canonical. It does **not** canonicalise to the organic page, because a noindex page that names another page as canonical sends two conflicting signals.

## Unpublished (builds nothing)

| Item | What is needed to publish |
|---|---|
| `src/content/projects/warehouse-floor-clean-and-wax.md` (draft case study) | Intake B4: photo approval, municipality, needs, scope detail, an outcome the client confirms. The build refuses `status: published` until the approvals are recorded. |
| `/projects/` hub | Builds automatically when the first case study is published. |

## Considered and not built

| Candidate | Why not |
|---|---|
| Service × city pages (e.g. "office cleaning Mississauga") | Same intent as the location and service pages. No local evidence to make them distinct. |
| Separate industry pages for offices, industrial, retail, education, hospitality | The matching service page already covers them. A separate page would duplicate it with the noun swapped. |
| New location pages (North York, Scarborough, Richmond Hill, Durham) | No local evidence or priorities (intake C5). They are listed on the hub and in coverage text instead. |
