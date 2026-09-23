import { defineConfig } from 'vitest/config';

/**
 * Vitest, because Astro is already Vite.
 *
 * The client modules under test are bundled by Vite at `astro build` and
 * transformed by Vite here, with the same resolver and the same TypeScript
 * handling. A separate test pipeline would be a second transform to keep in
 * step with the first, and the failure mode of that drifting is a test suite
 * that passes on code the build compiles differently.
 *
 * Two environments, because this project has two runtimes:
 *
 *   happy-dom   for `src/lib/*` — the form pipeline needs a DOM, events and a
 *               stubbable `fetch`, and happy-dom starts in milliseconds.
 *   node        for `src/worker.ts` — the Worker's entry point is a plain
 *               `fetch(request, env)` function, so it can be called directly
 *               with a real `Request` and a fake `env`. That covers request
 *               handling, which is where the decisions are. It does NOT cover
 *               the Workers runtime itself (bindings, `cf`, the asset
 *               fetcher); see TESTING.md for what that leaves unproven.
 */
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    /* The default. Files that need node instead say so in a
       `@vitest-environment node` docblock at the top — per-file rather than
       by glob, so moving a test file cannot silently change its runtime. */
    environment: 'happy-dom',
    restoreMocks: true,
  },
});
