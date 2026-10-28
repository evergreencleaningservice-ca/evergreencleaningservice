# Hreflang / International SEO — evergreencleaningservice.ca

Skill: claude-seo `seo-hreflang` (v2.5.0). Date: 2026-10-28.
Raw captures: `raw/i18n-images/` (eg-*.html + headers, janpro-*.html, og/).
Method: `curl --compressed` with a desktop UA; no Playwright needed (both sites serve full HTML server-side).

## 1. Current state on Evergreen (verified on 11 pages, 3 required)

| Page | `<html lang>` | hreflang `<link>` | `Content-Language` header | `og:locale` | canonical |
|---|---|---|---|---|---|
| `/` | `en-CA` | none | not sent | `en_CA` | self, matches |
| `/services/office-cleaning/` | `en-CA` | none | not sent | `en_CA` | self, matches |
| `/industries/medical-dental-clinics/` | `en-CA` | none | not sent | `en_CA` | self, matches |
| `/locations/mississauga/`, `/locations/toronto-downtown/` | `en-CA` | none | not sent | `en_CA` | self |
| `/benefits-of-commercial-deep-cleaning-services/` (blog) | `en-CA` | none | not sent | `en_CA` | self |
| `/about-us/`, `/insights/`, `/services/commercial-cleaning/`, `/industries/property-management/`, retail checklist post | `en-CA` | none | not sent | `en_CA` | self |

- No `rel="alternate" hreflang` anywhere (HTML, HTTP `Link` header, or `sitemap-0.xml`). The only `Link:` headers are none; Cloudflare serves `content-type: text/html` with no `Content-Language`.
- Sitemap index -> `sitemap-0.xml` has no `xmlns:xhtml` namespace and no `xhtml:link` entries.
- **Verdict: correct for a single-language site.** With exactly one language there is nothing to annotate; adding a lone self-referencing `en-CA` tag is harmless but pointless. `lang="en-CA"` + `og:locale="en_CA"` are already consistent and are the right regional signal. No issues to fix. Sending `Content-Language: en-CA` from Cloudflare is optional polish, not an SEO lever.
- Other i18n signals: `.ca` ccTLD (strongest geo signal per the skill's heuristic), Toronto addresses/phone, CAD pricing context. Nothing else needed for Canada targeting; the GSC country-targeting setting no longer exists (removed 2022).

## 2. How jan-pro.ca implements EN/FR (competitor audit)

Platform: WordPress (Sage 10 theme, W3 Total Cache, Yoast) + **WPML 5.1.0** (`<meta name="generator" content="WPML ver:5.1.0">`). Server-rendered: `<h1>`, hreflang and canonical are all in the raw HTML (5 `<script>` tags only). **No Playwright/JS rendering required.**

URL pattern: `https://jan-pro.ca/` -> 301 -> `/en/`. Sub-folders `/en/...` and `/fr/...` with **translated slugs** (`/en/office/toronto-west/` <-> `/fr/bureau/toronto-ouest/`; `/en/commercial-cleaning-services-tailored-to-your-business/` <-> `/fr/services-de-nettoyage-commercial-sur-mesure/`).

Method: HTML `<link>` tags only. `/sitemap.xml` (google-sitemap-generator 4.1.25) contains 0 `xhtml:link` entries; `/sitemap_index.xml` returns the homepage HTML (no Yoast sitemap). Language switcher: WPML `a.wpml-ls-link` with `hreflang`/`lang` attributes.

Validation (3 pairs checked both directions):

| Page | Self-ref | Return tag | x-default | Status |
|---|---|---|---|---|
| `/en/` <-> `/fr/` | yes / yes | yes / yes | `/en/` on both | pass |
| `/en/commercial-cleaning-services-tailored-to-your-business/` <-> `/fr/services-de-nettoyage-commercial-sur-mesure/` | yes / yes | yes / yes | `/en/...` on both | pass |
| `/en/office/toronto-west/` <-> `/fr/bureau/toronto-ouest/` | yes / yes | yes / yes | `/en/office/toronto-west/` on both | pass |

Tag set is identical on both sides of each pair (full mesh, 3 tags, canonical = self = hreflang href, all HTTPS, trailing slashes consistent). Technically clean.

Weaknesses worth noting (do not copy these):
- Codes are bare `en` / `fr` (language only), yet `<html lang="en-US">` / `lang="fr-FR"` and `og:locale="en_US"` / `fr_FR` on a Canadian-only business. `fr-FR` is European French; Quebec/Ontario French is `fr-CA`. These are hint-level inconsistencies, not errors Google penalises, but they weaken the Canada signal that the `.ca` TLD provides.
- x-default points to `/en/` (English fallback, not a selector) — acceptable per the skill.
- Hreflang only in HTML; for 2 languages x ~100 pages that is fine.
- FR Toronto page (`/fr/bureau/toronto-ouest/`) is a full translation (~1,345 words, one English "Learn more" string leaked on the FR home). Title: "Entretien ménager commercial à Toronto Ouest | JAN-PRO".

## 3. Should Evergreen (one Toronto office) add French?

**Recommendation: not now.** Evidence:

**Demand / SERP (WebSearch, 2026-10-28):**
- `nettoyage de bureaux toronto`: results are directories (threebestrated.ca FR, canpages.ca FR, soumissionrenovation.ca), Job Bank / Guichet-Emplois job postings, and a scattering of small operators. JAN-PRO appears only via a directory mention; `jan-pro.ca/fr/` itself does not surface in the top results.
- `entretien ménager commercial toronto`: dominated by Guichet-Emplois job postings and Quebec companies (Brossard, Montréal, Lévis) — i.e. the phrase is mostly a *Quebec* and *job-seeker* query, not a Toronto buyer query.
- `"service de nettoyage commercial" toronto`: directories (threebestrated, pagesjaunes, canpages, trustanalytica), MNP transaction notices. No commercial-cleaning company owns these SERPs with a real FR landing page, which confirms low competition *because* there is little demand, not an open opportunity.
- No search-volume API available in this environment; the SERP composition (jobs + directories + out-of-province) is the standard signature of a query with negligible local commercial intent.

**Population (2021 Census):**
- Ontario Francophones (inclusive definition): 652,540 = 4.6% of the province; French mother tongue ~3.3–3.4% (ontario.ca profile; StatCan).
- City of Toronto: 77,145 Francophones = 2.8% (City of Toronto profile); provincial table 65,925 / 2.4% for the Toronto census division; ~49,005 French mother tongue.
- Those residents overwhelmingly work and buy in English. B2B facility/office managers in the GTA issue RFQs in English; Ontario has no language-of-commerce law equivalent to Quebec's Bill 96. The only realistic FR-speaking B2B buyers (federal offices, Franco-Ontarian school boards, francophone health centres) are a handful of accounts best reached by direct sales, not SEO.

**Cost (from the existing crawl, `raw/sitemap/maintext.json`):**
- Core commercial pages: 30 pages / ~17,100 words. Blog: 38 posts / ~29,500 words. Total ~46,600 words.
- Professional fr-CA translation at CAD 0.20–0.30/word: core only ~CAD 3,400–5,100; full site ~CAD 9,300–14,000. Plus: translated slugs, FR meta/schema/OG images, a bilingual quote form and someone who can answer a French enquiry, and re-translation every time EN pages change. Machine translation without review would risk Google's scaled-content-abuse policy (see skill `references/machine-translation-qa.md`) and dilute crawl budget on a ~70-page site.
- JAN-PRO needs FR because it has Quebec, Gatineau and Moncton franchises; that is not Evergreen's footprint.

**What to do instead (cheap, keeps the door open):** keep `lang="en-CA"` / `og:locale="en_CA"`; mention "service available in French on request" on `/contact-us/` only if the owner can actually deliver it; revisit if (a) a francophone institutional client lands, or (b) GSC shows French-language impressions for Toronto queries.

## 4. If French is added later — exact implementation (en-CA / fr-CA)

Architecture: keep English at the root (no URL change, no redirect risk); add `/fr/` sub-folder with translated slugs. Use regional codes because the business targets Canada only; x-default = English root (the page most non-EN/FR visitors should land on).

HTML `<head>` on **every** page in the set (both languages carry the identical 3 tags; hreflang hrefs must equal each page's canonical exactly, trailing slash included):

```html
<!-- on https://www.evergreencleaningservice.ca/services/office-cleaning/ -->
<link rel="canonical" href="https://www.evergreencleaningservice.ca/services/office-cleaning/">
<link rel="alternate" hreflang="en-CA" href="https://www.evergreencleaningservice.ca/services/office-cleaning/">
<link rel="alternate" hreflang="fr-CA" href="https://www.evergreencleaningservice.ca/fr/services/nettoyage-de-bureaux/">
<link rel="alternate" hreflang="x-default" href="https://www.evergreencleaningservice.ca/services/office-cleaning/">

<!-- on https://www.evergreencleaningservice.ca/fr/services/nettoyage-de-bureaux/ -->
<html lang="fr-CA">
<link rel="canonical" href="https://www.evergreencleaningservice.ca/fr/services/nettoyage-de-bureaux/">
<link rel="alternate" hreflang="en-CA" href="https://www.evergreencleaningservice.ca/services/office-cleaning/">
<link rel="alternate" hreflang="fr-CA" href="https://www.evergreencleaningservice.ca/fr/services/nettoyage-de-bureaux/">
<link rel="alternate" hreflang="x-default" href="https://www.evergreencleaningservice.ca/services/office-cleaning/">
<meta property="og:locale" content="fr_CA">
<meta property="og:locale:alternate" content="en_CA">
```

Sitemap equivalent (Astro `@astrojs/sitemap` `i18n` option generates this; add `xmlns:xhtml`):

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://www.evergreencleaningservice.ca/services/office-cleaning/</loc>
    <xhtml:link rel="alternate" hreflang="en-CA" href="https://www.evergreencleaningservice.ca/services/office-cleaning/"/>
    <xhtml:link rel="alternate" hreflang="fr-CA" href="https://www.evergreencleaningservice.ca/fr/services/nettoyage-de-bureaux/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.evergreencleaningservice.ca/services/office-cleaning/"/>
  </url>
  <url>
    <loc>https://www.evergreencleaningservice.ca/fr/services/nettoyage-de-bureaux/</loc>
    <!-- identical 3 xhtml:link lines -->
  </url>
</urlset>
```

Rules to enforce (from the skill's checklist):
1. Pick one method (HTML or sitemap), not both; HTML is fine at this size.
2. Only translated pages enter a set; an EN page with no FR twin carries no hreflang at all (never point `fr-CA` at the EN URL or at `/fr/`).
3. Self-reference + return tag on every page; `x-default` once per set, same URL on both sides.
4. `<html lang>` must match: `en-CA` / `fr-CA` (not `fr-FR`, JAN-PRO's mistake). `og:locale` `en_CA` / `fr_CA`.
5. Localise titles, meta, schema (`inLanguage: "fr-CA"`, `LocalBusiness` name stays), OG images (FR text overlay if any), the quote form and phone CTA. Numbers/currency: `1 500 $` style, dates `28 octobre 2026`.
6. Human-reviewed translation; add a `/fr/` crawl check to the sitemap test.
