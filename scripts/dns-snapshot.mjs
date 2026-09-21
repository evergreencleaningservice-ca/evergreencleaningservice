/**
 * A DNS snapshot of the production domain, taken from public resolvers.
 *
 * WHY NOT THE REGISTRAR'S PANEL. Because a panel shows what was typed into
 * it, and a cutover is judged by what resolvers answer. Three domains on this
 * estate were reported migrated on the strength of a registrar UI that had
 * accepted the input and not persisted it; the nameservers had never changed.
 * So this queries dns.google and Cloudflare over DoH — two independent
 * resolvers — and reports a disagreement as a finding rather than picking one.
 *
 * READ-ONLY. It asks questions. It changes no record, and Phase 12 does not
 * authorise a DNS change of any kind.
 *
 * Usage: node scripts/dns-snapshot.mjs [domain ...]
 */
import { PREVIEW_HOST, PRODUCTION_HOSTS } from '../src/data/site.ts';

const RESOLVERS = [
  { name: 'dns.google', url: 'https://dns.google/resolve' },
  { name: 'cloudflare-dns', url: 'https://cloudflare-dns.com/dns-query' },
];

const TYPES = ['NS', 'A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SOA', 'CAA'];

const names =
  process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : [PRODUCTION_HOSTS[1], PRODUCTION_HOSTS[0], PREVIEW_HOST];

/**
 * Normalise a record's data before anything compares it.
 *
 * TWO REAL FALSE POSITIVES THIS EXISTS TO KILL, both found by hand-checking a
 * "disagreement" this script had reported:
 *
 *   TXT QUOTING. dns.google returns the SPF string bare; Cloudflare returns it
 *   wrapped in double quotes. Byte-compared, every TXT record on every domain
 *   reads as a disagreement between resolvers. It is a serialisation
 *   difference in the DoH JSON and nothing else.
 *
 *   A-RECORD POOLS. SiteGround's CDN answers from a rotating pool and hands
 *   back four addresses out of a larger set. Consecutive queries to the SAME
 *   resolver return different fours. Compared as fixed sets, that reads as the
 *   two resolvers disagreeing when in fact neither has a stable answer to
 *   disagree about — see `pooled` below.
 */
const normalise = (type, data) =>
  type === 'TXT' ? data.replace(/^"|"$/g, '').replace(/"\s*"/g, '') : data.toLowerCase();

const query = async (resolver, name, type) => {
  const url = new URL(resolver.url);
  url.searchParams.set('name', name);
  url.searchParams.set('type', type);
  const res = await fetch(url, { headers: { Accept: 'application/dns-json' } });
  if (!res.ok) return { error: `HTTP ${res.status}`, answers: [] };
  const body = await res.json();
  return {
    /* Only answers of the type asked for. A CNAME chain returns the CNAME plus
       the resolved A records, and counting those as A records for the name
       would misreport a CNAMEd host as having its own address. */
    answers: (body.Answer ?? []).map((a) => normalise(type, a.data)),
    ttls: (body.Answer ?? []).map((a) => a.TTL),
    status: body.Status,
  };
};

/**
 * Address types are served from a rotating pool, so one query is a sample of
 * the pool rather than the pool. Sampling each resolver several times and
 * taking the union is the only way to ask whether the two are pointing at the
 * same infrastructure — which is the question a cutover actually cares about.
 */
const POOLED = new Set(['A', 'AAAA']);
const SAMPLES = 4;

const sample = async (resolver, name, type) => {
  const runs = POOLED.has(type) ? SAMPLES : 1;
  const seen = new Set();
  let ttl;
  for (let i = 0; i < runs; i++) {
    const r = await query(resolver, name, type);
    r.answers.forEach((a) => seen.add(a));
    if (ttl === undefined) ttl = r.ttls?.[0];
  }
  return { answers: [...seen].sort(), ttl };
};

/**
 * RDAP is the registry's own answer — the one record neither resolver caches,
 * and the only place the registrar, the expiry and the transfer locks are
 * stated by the authority rather than by a reseller's dashboard.
 *
 * CIRA's own endpoint is tried first for `.ca`. The rdap.org redirector
 * answers 403 to this network, which looks exactly like "the registry is
 * unavailable" and is not — so the fallback exists to keep a proxy refusal
 * from being reported as a missing registry record.
 */
const RDAP_ENDPOINTS = (domain) =>
  domain.endsWith('.ca')
    ? [`https://rdap.ca.fury.ca/rdap/domain/${domain}`, `https://rdap.org/domain/${domain}`]
    : [`https://rdap.org/domain/${domain}`];

const rdap = async (domain) => {
  const tried = [];
  for (const endpoint of RDAP_ENDPOINTS(domain)) {
    try {
      const res = await fetch(endpoint, {
        headers: { Accept: 'application/rdap+json' },
        redirect: 'follow',
      });
      if (!res.ok) {
        tried.push(`${new URL(endpoint).host} HTTP ${res.status}`);
        continue;
      }
      const b = await res.json();
      const role = (name) =>
        (b.entities ?? [])
          .filter((e) => (e.roles ?? []).includes(name))
          .flatMap((e) => (e.vcardArray?.[1] ?? []).filter((f) => f[0] === 'fn').map((f) => f[3]))
          .filter(Boolean);
      return {
        source: new URL(endpoint).host,
        nameservers: (b.nameservers ?? []).map((n) => n.ldhName?.toLowerCase()).sort(),
        status: b.status ?? [],
        registrar: role('registrar').join(', '),
        events: (b.events ?? []).map((e) => `${e.eventAction}=${e.eventDate?.slice(0, 10)}`),
      };
    } catch (err) {
      tried.push(`${new URL(endpoint).host} ${err.message ?? err}`);
    }
  }
  return { error: tried.join('; ') };
};

console.log('\nDNS snapshot — public resolvers and the registry, never a registrar panel.\n');

const disagreements = [];

for (const name of names) {
  console.log(`\n=== ${name}`);
  for (const type of TYPES) {
    const results = await Promise.all(RESOLVERS.map((r) => sample(r, name, type)));
    const sets = results.map((r) => r.answers);

    /* For a pooled type the question is whether the two resolvers are pointing
       at the same infrastructure, so overlapping samples agree and only
       DISJOINT ones are a split. For everything else — nameservers, MX, SPF,
       the records a cutover is actually judged on — the answer is supposed to
       be identical, and any difference at all is the finding. */
    const pooled = POOLED.has(type);
    const both = sets.every((s) => s.length > 0);
    const overlap = both && sets[0].some((a) => sets[1].includes(a));
    const agree = pooled
      ? sets.every((s) => s.length === 0) || overlap
      : new Set(sets.map((s) => s.join(' | '))).size === 1;

    const ttl = results[0].ttl;
    if (!agree) {
      disagreements.push({ name, type, sets });
      console.log(`  ${type.padEnd(6)} *** RESOLVERS DISAGREE ***`);
      RESOLVERS.forEach((r, i) => console.log(`         ${r.name}: ${sets[i].join(' | ') || '(none)'}`));
    } else if (pooled && sets[0].length) {
      const union = [...new Set([...sets[0], ...sets[1]])].sort();
      console.log(
        `  ${type.padEnd(6)} ${union.join(' | ')}   ttl=${ttl}s` +
          (union.length > sets[0].length ? `   [rotating pool, ${union.length} seen over ${SAMPLES} samples each]` : '')
      );
    } else {
      console.log(`  ${type.padEnd(6)} ${sets[0].join(' | ') || '(none)'}${ttl !== undefined ? `   ttl=${ttl}s` : ''}`);
    }
  }
}

/* The apex is the only name a registry knows about — and it is the SHORTEST
   name queried, not a name with a particular label count. `.ca` puts the apex
   at two labels, which an earlier version of this line mistook for a
   subdomain and so asked RDAP about `www.`, getting a 403 that looked like the
   registry being unavailable. */
const apex = names.slice().sort((a, b) => a.split('.').length - b.split('.').length)[0];
console.log(`\n=== registry (RDAP) — ${apex}`);
const reg = await rdap(apex);
if (reg.error) console.log(`  unavailable: ${reg.error}`);
else {
  console.log(`  source:      ${reg.source}`);
  console.log(`  registrar:   ${reg.registrar || '(not published)'}`);
  console.log(`  nameservers: ${reg.nameservers.join(', ') || '(none)'}`);
  console.log(`  status:      ${reg.status.join(', ') || '(none)'}`);
  console.log(`  events:      ${reg.events.join(', ')}`);

  /* The registry and the resolvers are asked the same question by design. A
     delegation that differs between them is a zone that has been changed and
     not yet propagated — or one changed at the wrong level — and at cutover
     that is the difference between a five-minute switch and a six-hour one. */
  const resolverNs = (await sample(RESOLVERS[0], apex, 'NS')).answers.map((n) => n.replace(/\.$/, ''));
  const registryNs = reg.nameservers.map((n) => n.replace(/\.$/, ''));
  const same =
    resolverNs.length === registryNs.length && registryNs.every((n) => resolverNs.includes(n));
  console.log(
    `  delegation:  ${same ? 'registry and resolvers agree' : `*** MISMATCH — registry ${registryNs.join(', ')} vs resolvers ${resolverNs.join(', ')}`}`
  );
  if (!same) disagreements.push({ name: apex, type: 'NS (registry vs resolver)' });
}

if (disagreements.length) {
  console.log(`\n*** ${disagreements.length} resolver disagreement(s) — the disagreement is the finding.\n`);
} else {
  console.log('\nresolvers agree on every record queried.\n');
}
