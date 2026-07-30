/**
 * Push targets — the platforms a user can push distribution tags to.
 *
 * "Platform" deliberately spans both demand- and supply-side: today the list is
 * DSPs (Nexxen, The Trade Desk), but SSPs are expected to land here too, and
 * both are literally platforms. Don't narrow this to "DSP" in names or copy.
 *
 * Advertisers are scoped to a platform — each has its own set — so a platform
 * must be chosen before an advertiser can be. `fetchPlatformAdvertisers` is a
 * stand-in for the real per-platform API: it's async with a simulated latency
 * so the calling UI already handles the loading and re-fetch-on-change cases
 * correctly. Swapping in a real `fetch` should not require touching the dialog.
 */

export interface PushPlatform {
  id: string;
  name: string;
}

export interface PlatformAdvertiser {
  id: string;
  name: string;
}

export const PUSH_PLATFORMS: PushPlatform[] = [
  { id: "nexxen", name: "Nexxen" },
  { id: "ttd", name: "The Trade Desk" },
];

/**
 * A tag is built for one platform (its `family`) and can only be pushed there —
 * a Nexxen tag → Nexxen, a TTD tag → The Trade Desk. Platform ids are kept equal
 * to the `TemplateFamily` values so the mapping is a direct lookup; future
 * platforms come along for free as their family is added. Returns undefined for
 * a family with no matching platform (i.e. not pushable).
 */
export const platformForFamily = (family: string): PushPlatform | undefined =>
  PUSH_PLATFORMS.find((p) => p.id === family);

const MOCK_LATENCY_MS = 450;
const MOCK_ADVERTISER_COUNT = 10;

/** Deterministic per-platform ordering, so each DSP visibly returns its own list. */
const seededOrder = (platformId: string, count: number): number[] => {
  const seed = [...platformId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return Array.from({ length: count }, (_, i) => i + 1).sort(
    (a, b) => ((a * seed) % 13) - ((b * seed) % 13) || a - b,
  );
};

export const fetchPlatformAdvertisers = (
  platformId: string,
): Promise<PlatformAdvertiser[]> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        seededOrder(platformId, MOCK_ADVERTISER_COUNT).map((n) => ({
          id: `${platformId}-advertiser-${n}`,
          name: `Advertiser ${n}`,
        })),
      );
    }, MOCK_LATENCY_MS);
  });
