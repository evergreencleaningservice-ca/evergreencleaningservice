/**
 * IndexNow (SEO audit ACTION-PLAN item 28, 6 Nov 2026).
 *
 * IndexNow lets a site tell Bing, Yandex, Seznam, Naver and the other engines
 * that share submissions that a URL has changed, instead of waiting for their
 * next crawl. Bing's index also feeds Copilot and is one of the sources
 * ChatGPT search draws on, so a page changed on deploy can reach those sooner
 * too. Google does not take part; the sitemap is still how Google hears
 * about changes.
 *
 * THE KEY IS PUBLIC BY DESIGN. It is not a secret: an engine proves a
 * submission came from the site's owner by fetching `/<key>.txt` from the
 * same host and finding the key in it. The file is
 * `public/05031d78747205e65eb1ec4a04cc568d.txt`, holding the key and nothing
 * else (no trailing newline), and the asset layer serves it at the site root
 * like robots.txt. tests/indexnow.test.ts fails if the two drift apart, or if
 * a `run_worker_first` path in wrangler.jsonc would send it to the Worker.
 *
 * Generated 2026-11-06 with 16 random bytes as hex. To rotate it, generate a
 * new one, rename the file to match, deploy, and only then submit with it:
 * an engine that fetches the key file before the deploy lands sees a 404 and
 * refuses the batch.
 */
export const INDEXNOW_KEY = '05031d78747205e65eb1ec4a04cc568d';

/**
 * The shared endpoint. A submission to it is passed on to every participating
 * engine, so there is no need to post to Bing and Yandex separately.
 */
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
