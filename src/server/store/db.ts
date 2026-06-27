/**
 * IN-MEMORY DATA STORE
 * --------------------------------------------------------------
 * The default data source. Seeded once and kept in memory so the
 * portal runs with zero setup. Cached on `globalThis` so it survives
 * Next.js hot-reloads during development.
 *
 * SWAP POINT: when MONGODB_URI is set, the repositories in
 * `src/server/repositories` are where you switch reads/writes to
 * the Mongoose models in `src/server/models`. The rest of the app
 * never talks to the store directly — only through repositories.
 */

import { buildSeed, type SeedData } from "./seed";

const globalForStore = globalThis as unknown as { __empStore?: SeedData };

export function getStore(): SeedData {
  if (!globalForStore.__empStore) {
    globalForStore.__empStore = buildSeed();
  }
  return globalForStore.__empStore;
}
