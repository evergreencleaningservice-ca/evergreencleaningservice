# Benchmark competitors for evergreencleaningservice.ca

*12 Nov 2026. Raw data: `data/competitor-candidates.json`.*

## Read this first: no Moz metrics were collected

The Moz API refused both `url_metrics` calls with **403 "The account does not have enough quota remaining for current period."** The first call covered 16 targets and the second covered 1. Moz `usage_data` read **75 rows before** this step and **127 rows after**. Both of my calls were refused, so the 52-row increase most likely came from other steps of this analysis running at the same time.

**Domain Authority, linking root domains and spam score are therefore blank for every competitor.** I have not estimated them. Until the quota resets, nothing in this file measures link strength. When it does, one `url_metrics` call for the 16 targets listed in the JSON (about 16 rows) fills the table.

## How the candidates were found

I ran eight WebSearch queries:
- office cleaning Toronto
- commercial cleaning Toronto
- janitorial services Toronto
- commercial cleaning company Toronto
- office cleaning Mississauga
- commercial cleaning Vaughan
- office cleaning North York
- office cleaning company Toronto GTA janitorial contract

I then confirmed each company's real domain with read-only `curl`, checking the HTTP status, the `<title>` and the canonical URL.

The search tool is a US-based engine, not google.ca, so it cannot stand in for Toronto rankings. Its results were also unusually noisy:
- **HomeStars pages filled almost every North York result.**
- **Local companies rarely appeared on their own domains.** They showed up through a directory profile, a careers microsite, or a mirror or satellite page they had published themselves.

"Appearances" below counts the queries, out of 8, in which a company showed up in any form.

## Candidate table

| Company | Domain | Type | Appearances (of 8) | How it showed up | DA | Linking root domains | Spam score |
|---|---|---|---|---|---|---|---|
| Coverall | coverall.com | National franchise | 6 | Own domain, Toronto/GTA location article | n/a | n/a | n/a |
| Stratus Building Solutions | stratusclean.com | National franchise | 5 | Own domain, Toronto Central, Toronto North and Mississauga pages | n/a | n/a | n/a |
| TitanEdge Commercial Cleaning | titanedgecleaning.com | Local GTA commercial | 5 | `titanedge-cleaning.pages.dev` mirror (canonical = titanedgecleaning.com): services page, Mississauga and Vaughan city pages, blog | n/a | n/a | n/a |
| Enviro-Master | enviro-master.com | National franchise (hygiene led) | 4 | Own domain, Peel and Mississauga pages | n/a | n/a | n/a |
| Nova Building Maintenance | novabuildingmaintenance.com | Local GTA commercial | 4 | Only via self-published Notion and Google Sites pages that link back to its domain | n/a | n/a | n/a |
| We Clean It | wecleanit.ca | Local Toronto commercial | 4 | Directory profile (blocal) | n/a | n/a | n/a |
| Swift Janitorial | swiftjanitorial.ca | Local GTA (Markham) | 4 | websites.ca listing | n/a | n/a | n/a |
| CleanSpace Co. | cleanspaceco.com | Toronto, mostly home cleaning | 4 | Self-made Squarespace satellite site linking only to cleanspaceco.com | n/a | n/a | n/a |
| Cancore Building Services | cancore.com | Local Toronto/Etobicoke commercial, since 1984 | 3 | CareerPlug careers microsite linking to cancore.com | n/a | n/a | n/a |
| Hellamaid | hellamaid.ca | Residential-led platform | 3 | Own domain, Toronto commercial page | n/a | n/a | n/a |
| Gemini Janitorial (Ajax) | not resolved | Local GTA janitorial | 3 | Yellow Pages listing only | n/a | n/a | n/a |
| Generations Cleaning | generationscleaning.ca | GTA commercial, 100 to 500 staff | 2 | Green Building Canada listing | n/a | n/a | n/a |
| Hestia Co. | hestiaco.ca | Local GTA commercial | 2 | `hestia-co.pages.dev` mirror | n/a | n/a | n/a |
| Master Building Services | masterbuildingservices.ca | Local GTA building services | 2 | `.pages.dev` mirror that redirects to masterbuildingservices.ca | n/a | n/a | n/a |
| MCA Group | mcagroup.ca | Local Toronto commercial | 1 | Named in a summary | n/a | n/a | n/a |
| Auraclean | auraclean.ca | Local Toronto office cleaning | 1 | Named in a summary | n/a | n/a | n/a |

n/a = Moz refused the call (quota exhausted).

**Excluded:**
- **Directories:** HomeStars, Clutch, RenovationFind, Yellow Pages, Bark, websites.ca, blocal and Yabsta.
- **Content and job sites:** CleanLink, Green Building Canada, Job Bank and Indeed.
- **rbmservicesinc.com:** a US firm whose Blogspot doorway page targets Toronto while linking to Atlanta and San Antonio pages.
- **Impact Commercial Cleaning:** Vancouver.
- **Residential or window-only firms.**
- **GitBook and Yolasite pages with only a phone number:** spam doorways with no identifiable company.

## The six benchmark competitors

The set holds two franchises, as the limit allows, and four local or regional GTA commercial cleaners. All of them target Evergreen's money queries. Moz figures are missing, so the spread of link strength is an **expectation only**: franchise domains at the top, established local firms in the middle, newer local sites at the bottom. Check it once the quota resets.

1. **coverall.com (Coverall).** It appeared in more queries than anyone (6 of 8), with a dedicated Toronto and GTA commercial-cleaning page aimed at the same office buyers. It is the strong upper benchmark. Most of its links will come from the national brand, so treat it as the ceiling, not a target.
2. **stratusclean.com (Stratus Building Solutions).** It appeared in 5 of 8 queries, with separate Toronto Central, Toronto North/Vaughan and Mississauga franchise pages. This is the clearest example of location pages ranking across the GTA cities Evergreen serves. It is the second franchise.
3. **titanedgecleaning.com (TitanEdge Commercial Cleaning).** It was the most visible local competitor (5 of 8), with city pages for Mississauga and Vaughan and a blog on contracts and checklists. This is the closest like-for-like rival for the commercial cleaning keywords. Note that it ranked through a `pages.dev` copy of its site, which is a duplicate-content risk and not a tactic to copy.
4. **novabuildingmaintenance.com (Nova Building Maintenance).** It is a GTA office cleaner that appeared in 4 of 8 queries, every time through **Notion and Google Sites pages it published itself**, titled "Top Tier Toronto Office Cleaning", "Reliable Toronto Janitorial Services" and similar. The Google Sites page links straight back to novabuildingmaintenance.com. These are self-made links on user-generated-content platforms, and **they look manipulative**: Google's spam policies treat links you create yourself to manipulate rankings as link spam. Nova is in the set to show what not to copy. Expect its link counts to be padded with low-value links.
5. **cancore.com (Cancore Building Services).** Toronto and Etobicoke commercial property maintenance since 1984, close to Evergreen's own history (since 1989), and it appeared in 3 of 8 queries. It is the best "established local firm" comparison. Its age-earned links (associations, suppliers, local press) are the type of links Evergreen can realistically match.
6. **wecleanit.ca (We Clean It).** Its homepage title is literally "Commercial Office Cleaning Services Toronto", an exact match for Evergreen's main query. It claims 20+ years in Toronto and appeared in 4 of 8 queries through directory profiles. That makes it a good mid-sized, directory-driven benchmark.

**Alternates if one of the six turns out unsuitable after the Moz pull:**
- swiftjanitorial.ca (Markham)
- generationscleaning.ca (a larger GTA firm)
- enviro-master.com (franchise, hygiene led)
- hestiaco.ca

## What this step already shows

- **Visibility on these queries runs through other platforms, not companies' own domains.** Local competitors were seen through directory listings, careers microsites and satellite pages. Clean, accurate profiles on the genuine directories (HomeStars, Clutch, Yellow Pages, Green Building Canada, RenovationFind) look like a cheap, legitimate gap to close.
- **Several competitors use self-published satellite pages:** Nova on Notion and Google Sites, CleanSpace Co. on Squarespace, rbmservicesinc on Blogspot. These links are weak and risky. Evergreen should not copy them.
