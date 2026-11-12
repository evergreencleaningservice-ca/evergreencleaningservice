# Action plan after the 11 Nov audit (84/100)

## Round 1: developer, in progress (started 12 Nov)

Three workstreams run in isolated worktrees. Each is reviewed by an adversarial agent before it is merged.

1. **Service copy**
   - Make `/services/janitorial-services/` the one page that defines janitorial service.
   - On the commercial cleaning page, cut its three janitorial H2s and the duplicate "difference" FAQ.
   - Merge the janitorial page's repeated definition, and its contract steps where the shared block already covers them.
   - Rewrite the two descriptions that echo their titles.
   - Add links:
     - the commercial page to the quote checklist;
     - a Related card from the janitorial page to the quote checklist;
     - the office-cleaning and property-management pages to the janitorial page.
   - Retitle the cost-guide Related cards to "What drives office cleaning costs in Toronto".
   - Fix the two generic hero alts.
2. **Blog links**
   - Link the quote checklist from the cost guide's quote-comparison section and from the how-to-decide post.
   - Point the "janitorial services" anchors at the janitorial page: the cost guide, the slips post, and the how-often post and About page (where the anchor is split).
   - In the quote checklist itself: fewer exact-match phrases, sentence-case H2s, and a link to the commercial page.
3. **Heroes and UI**
   - Add an AVIF `imagesrcset` preload for the service-page hero, and drop `decoding="async"` on it.
   - Add `fetchpriority="high"` to the location page's first photo.
   - Gate the video bubble on the taller hero.
   - Give the graffiti page an honest hero: no upscaling of a 645 px source.
   - Make the quote-page fallback links 44 px touch targets.

Then: merge, run the full tests and a drift check, deploy when you approve, and re-record the drift baseline.

## Round 2: developer, next

4. Extend `tests/llms-sync.test.ts` to cover `## Services` and `## Who we clean for` (geo N7).
5. Add `updatedDate: 2026-11-07` to the cost guide, and to any other post commit 6f4f4de changed in substance (geo N8).
6. Janitorial page:
   - question H2s;
   - name Armstrong ProSeries Green and ECOLOGO in "Products and safety";
   - a lead sentence before "What is included";
   - a reviews block using existing Google reviews, framed as on the office page (geo N9, SXO S1).
7. Type East York and York as places contained in Toronto, not as `City` (local L2).
8. Bring the service-page area links and breadcrumbs up to 44 px touch targets (critic R4).
9. One title rule in `src/lib/title.ts`: add " | Evergreen" when the title stays at 60 characters or fewer (onpage N4).
10. Lab-test `/lp/commercial-cleaning-quote/`, with and without `?gclid=`, with Google hits blocked (critic R2, performance P3).

## Client or account owner

11. **Pricing:** real price bands, or permission to show the Ads pages' "from $30/hr" on the cost guide (critic R3). This is the biggest single lever for the price-seeking searcher.
12. **People and proof:**
    - names and roles of the owner and account executive;
    - a photoshoot and 2–3 case studies;
    - one permissioned local fact each for Etobicoke and Markham;
    - confirm Durham coverage, or soften that page.
13. **Reviews:** a request routine after each contract start; the real GBP rating and count.
14. **Ads owner:**
    - decide whether the ad text should match the landing pages' qualified reply wording (critic R1);
    - compare call and form conversions before and after 6 Nov;
    - container hygiene.
15. **Cloudflare:** read a week of `csp-violation` lines in Workers Logs, then enforce the CSP.
16. **Search Console:** indexing of the two new pages; whether "janitorial services toronto" splits between the two pages.
17. **Off-site:** rename the social profiles; directory listings under the current name.

## Monitoring

- About 4 Dec: a 28-day field Core Web Vitals window, by page, with mobile LCP on the service pages.
- After each deploy: `npm run seo:drift`, then re-record the baseline after intended changes.
