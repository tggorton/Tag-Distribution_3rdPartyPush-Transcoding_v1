import type {
  DistroStatus,
  TranscodePreset,
  TranscodeSettings,
  TranscodingConfig,
} from "../types";

export type { TranscodePreset } from "../types";

/**
 * Transcoding is modelled as one fixed set of fields shared by every preset —
 * the presets differ only in *values*, never in which fields exist. The field
 * set mirrors a publisher delivery spec (based on Hulu's). `select` fields carry
 * a superset of options across all presets so any preset's value is selectable
 * on any other; `select-custom` fields offer standard options plus a "Custom…"
 * entry that reveals a free-text input (Video Bitrate, Duration); `text` fields
 * hold free-form values the user reads and tweaks freely (audio bitrate, loudness).
 *
 * These numbers are illustrative prototype values, not authoritative encoding
 * specs — enough to show a preset filling the sheet and a manual override.
 */

export type TranscodeFieldType =
  | "select"
  | "text"
  | "select-custom"
  | "multiselect";
export type TranscodeFieldGroup = "video" | "audio";

export interface TranscodeField {
  id: string;
  label: string;
  type: TranscodeFieldType;
  group: TranscodeFieldGroup;
  options?: string[];
  /** Optional grouped display for a select / select-custom field (e.g. playback vs
   *  source bitrate tiers). `options` stays the flat union used for validation and
   *  custom-value detection; this only changes how the dropdown is rendered. */
  optionGroups?: { label: string; options: string[] }[];
  helperText?: string;
  /** Inline caution shown (in both the editable and read-only grid) when the
   *  field currently holds this exact value — e.g. duration "Original", which a
   *  publisher's delivery QA may flag. */
  warnWhen?: { value: string; message: string };
}

export const TRANSCODE_FIELDS: TranscodeField[] = [
  {
    id: "container",
    label: "Container",
    type: "select",
    group: "video",
    options: ["MP4", "MOV", "WebM", "MXF", "MPEG-TS", "HLS", "DASH"],
  },
  {
    id: "videoCodec",
    label: "Video Codec",
    type: "select",
    group: "video",
    options: [
      "H.264 (AVC)",
      "H.265 (HEVC)",
      "AV1",
      "VP9",
      "VP8",
      "MPEG-2",
      "Apple ProRes",
    ],
  },
  {
    id: "resolution",
    label: "Resolution",
    type: "select",
    group: "video",
    options: [
      "3840×2160 (2160p)",
      "1920×1080 (1080p)",
      "1280×720 (720p)",
      "720×480 (480p SD)",
      "1080×1080 (1:1)",
      "1080×1920 (9:16)",
      "Adaptive",
    ],
  },
  {
    id: "aspectRatio",
    label: "Aspect Ratio",
    type: "select",
    group: "video",
    options: ["16:9", "4:3", "1:1", "9:16", "3:4"],
  },
  {
    id: "duration",
    label: "Duration",
    type: "select-custom",
    group: "video",
    // "Original" keeps the source runtime intact (e.g. 30.89s stays 30.89s); a
    // fixed value (15s/30s/45s/60s) trims to exactly that length. Custom lets the
    // user set an exact non-standard duration.
    options: ["15s", "30s", "45s", "60s", "Original"],
    helperText: "Exact duration, e.g. :45 or 22.5s",
    warnWhen: {
      value: "Original",
      message:
        "“Original” keeps the source runtime — a non-standard length may be flagged during publisher testing.",
    },
  },
  {
    id: "bitrate",
    label: "Video Bitrate",
    type: "multiselect",
    group: "video",
    // SINGLE rates only — the platform transcodes one rendition per selected rate
    // (no ranges, no averaging). The operator can select one or more. The ladder is
    // chosen so at least one rate falls inside every known publisher / DSP spec
    // range (IAB 2026, The Trade Desk, Disney/Hulu, Amazon & Prime, Peacock, Roku,
    // FreeWheel, DV360), while also allowing a multi-rate rendition set.
    options: [
      "1 Mbps",
      "2 Mbps",
      "3 Mbps",
      "4 Mbps",
      "5 Mbps",
      "6 Mbps",
      "8 Mbps",
      "10 Mbps",
      "12 Mbps",
      "15 Mbps",
      "20 Mbps",
      "25 Mbps",
      "30 Mbps",
      "40 Mbps",
      "50 Mbps",
    ],
    helperText: "Pick one or more single rates, or type a custom rate (e.g. 18 Mbps).",
  },
  {
    id: "frameRate",
    label: "Frame Rate",
    type: "select",
    group: "video",
    options: [
      "23.976",
      "24",
      "25",
      "29.97",
      "30",
      "50",
      "59.94",
      "60",
      "Preserve source",
    ],
  },
  {
    id: "scanType",
    label: "Scan Type",
    type: "select",
    group: "video",
    options: ["Progressive", "Interlaced", "Progressive segmented (PsF)"],
  },
  {
    id: "chroma",
    label: "Chroma Subsampling",
    type: "select",
    group: "video",
    options: ["4:2:0", "4:2:2", "4:4:4", "4:1:1"],
  },
  {
    id: "color",
    label: "Color",
    type: "select",
    group: "video",
    options: [
      "Rec.709",
      "Rec.601 (SD)",
      "Rec.2020",
      "Rec.2100 (HDR)",
      "DCI-P3",
      "sRGB",
    ],
  },
  {
    id: "audioCodec",
    label: "Audio Codec",
    type: "select",
    group: "audio",
    options: [
      "AAC",
      "HE-AAC",
      "AC-3 (Dolby Digital)",
      "E-AC-3 (Dolby Digital Plus)",
      "AC-4",
      "Opus",
      "MP3",
      "PCM (LPCM)",
    ],
  },
  {
    id: "audioSampleRate",
    label: "Audio Sample Rate",
    type: "select",
    group: "audio",
    options: ["32 kHz", "44.1 kHz", "48 kHz", "96 kHz"],
  },
  {
    id: "audioBitrate",
    label: "Audio Bitrate",
    type: "text",
    group: "audio",
    helperText: "e.g. ≥192 kbps",
  },
  {
    id: "audioChannels",
    label: "Audio Channels",
    type: "select",
    group: "audio",
    options: ["Mono", "Stereo", "5.1", "7.1", "Dolby Atmos"],
  },
  {
    id: "loudness",
    label: "Loudness",
    type: "text",
    group: "audio",
    helperText: "e.g. -24 LKFS",
  },
];

/** Drop a trailing "(...)" qualifier: "Hulu (Disney)" → "Hulu". Used to derive a
 *  preset's `shortName` (compact form for tight UI like the status chip). */
export const shortenName = (name: string): string =>
  name.replace(/\s*\([^)]*\)\s*$/, "").trim();

// Presets are *publisher* delivery specs (Hulu is a pub). DSPs like Nexxen / The
// Trade Desk are push targets, not transcode presets — they live in the
// Push-to-Platform flow, not here.
const HULU_SETTINGS: TranscodeSettings = {
  container: "MP4",
  videoCodec: "H.264 (AVC)",
  resolution: "1920×1080 (1080p)",
  aspectRatio: "16:9",
  duration: "Original",
  bitrate: "30 Mbps",
  frameRate: "29.97",
  scanType: "Progressive",
  chroma: "4:2:0",
  color: "Rec.709",
  audioCodec: "AAC",
  audioSampleRate: "48 kHz",
  audioBitrate: "≥192 kbps",
  audioChannels: "Stereo",
  loudness: "-24 LKFS",
};

// The video's own baseline — deliberately a little lighter/more generic than any
// platform spec, so picking a platform preset visibly overrides it.
const DEFAULT_SETTINGS: TranscodeSettings = {
  ...HULU_SETTINGS,
  resolution: "1280×720 (720p)",
  duration: "Original",
  bitrate: "4 Mbps",
  frameRate: "29.97",
  audioBitrate: "128 kbps",
  loudness: "-23 LKFS",
};

export const DEFAULT_PRESET_ID = "default";

/**
 * Publisher presets. Only Hulu's numbers came from a real spec sheet; the rest
 * are ILLUSTRATIVE prototype values built on standard CTV ad-delivery
 * conventions and varied by platform tier (premium SVOD-with-ads run higher
 * bitrate / 5.1 audio; FAST channels run lighter). They are NOT verified
 * per-publisher specs — swap in real numbers when a partner sheet is available.
 * Each seed lists only what differs from the Hulu baseline.
 */
interface PresetSeed {
  id: string;
  name: string;
  overrides?: Partial<TranscodeSettings>;
}

const PUBLISHER_SEEDS: PresetSeed[] = [
  // Each preset pre-selects a single representative rate inside that publisher's
  // spec; the operator can add more (the backend transcodes one rendition per
  // selected rate). Figures reflect published specs where available (2026-10-14):
  // Disney+/Hulu, Prime Video, Peacock, Roku, etc. Audio/codec unchanged.
  { id: "hulu", name: "Hulu (Disney)" }, // 30 Mbps (within Disney/Hulu programmatic 15–60) via base
  {
    id: "disney-plus",
    name: "Disney+ (Ads)",
    overrides: { bitrate: "30 Mbps", audioBitrate: "≥256 kbps", audioChannels: "5.1" },
  },
  { id: "espn", name: "ESPN", overrides: { bitrate: "30 Mbps" } },
  { id: "abc", name: "ABC", overrides: { bitrate: "30 Mbps" } },
  { id: "peacock", name: "Peacock", overrides: { bitrate: "25 Mbps", audioBitrate: "≥256 kbps" } },
  {
    id: "paramount-plus",
    name: "Paramount+",
    overrides: { bitrate: "25 Mbps", audioChannels: "5.1" },
  },
  { id: "pluto-tv", name: "Pluto TV", overrides: { bitrate: "6 Mbps", audioBitrate: "128 kbps" } },
  {
    id: "netflix",
    name: "Netflix (Ads)",
    overrides: {
      videoCodec: "H.265 (HEVC)",
      bitrate: "25 Mbps",
      audioBitrate: "≥256 kbps",
      audioChannels: "5.1",
      loudness: "-27 LKFS",
    },
  },
  {
    id: "amazon-prime",
    name: "Amazon Prime Video",
    overrides: { bitrate: "50 Mbps", audioBitrate: "≥256 kbps", audioChannels: "5.1" },
  },
  { id: "freevee", name: "Freevee (legacy)", overrides: { bitrate: "6 Mbps" } },
  { id: "roku-channel", name: "Roku Channel", overrides: { bitrate: "6 Mbps" } },
  { id: "tubi", name: "Tubi", overrides: { bitrate: "6 Mbps" } },
  { id: "max", name: "Max", overrides: { bitrate: "25 Mbps", audioChannels: "5.1" } },
  { id: "discovery-plus", name: "Discovery+", overrides: { bitrate: "25 Mbps" } },
  { id: "sling", name: "Sling TV", overrides: { bitrate: "25 Mbps" } },
  { id: "fubo", name: "Fubo", overrides: { bitrate: "25 Mbps" } },
  { id: "philo", name: "Philo", overrides: { bitrate: "6 Mbps" } },
  { id: "crackle", name: "Crackle", overrides: { bitrate: "6 Mbps", audioBitrate: "128 kbps" } },
  { id: "xumo", name: "Xumo Play", overrides: { bitrate: "6 Mbps" } },
  { id: "plex", name: "Plex", overrides: { bitrate: "6 Mbps" } },
  { id: "samsung-tv-plus", name: "Samsung TV Plus", overrides: { bitrate: "6 Mbps" } },
  { id: "lg-channels", name: "LG Channels", overrides: { bitrate: "6 Mbps" } },
  { id: "vizio-watchfree", name: "Vizio WatchFree+", overrides: { bitrate: "6 Mbps" } },
];

/**
 * The built-in preset list used to seed `AppState.transcodePresets`. Presets are
 * mutable admin-managed state from there on; this constant is only the seed and
 * the reset fallback. The `default` baseline is always first and is protected in
 * the admin UI (see `isProtectedPreset`).
 */
export const SEED_TRANSCODE_PRESETS: TranscodePreset[] = [
  {
    id: DEFAULT_PRESET_ID,
    name: "Default (video baseline)",
    shortName: "Default",
    settings: DEFAULT_SETTINGS,
  },
  ...PUBLISHER_SEEDS.map(
    (seed): TranscodePreset => ({
      id: seed.id,
      name: seed.name,
      shortName: shortenName(seed.name),
      settings: { ...HULU_SETTINGS, ...seed.overrides } as TranscodeSettings,
    }),
  ),
];

/** The "default" baseline is not editable/deletable in the admin preset manager. */
export const isProtectedPreset = (id: string): boolean => id === DEFAULT_PRESET_ID;

export const findPreset = (
  presets: TranscodePreset[],
  id: string,
): TranscodePreset | undefined => presets.find((p) => p.id === id);

/** The config a fresh line-item starts with: the default baseline, untouched. */
export const DEFAULT_TRANSCODING: TranscodingConfig = {
  presetId: DEFAULT_PRESET_ID,
  settings: { ...DEFAULT_SETTINGS },
};

/** A fresh line-item applies a single config — the default baseline. */
export const DEFAULT_TRANSCODINGS: TranscodingConfig[] = [DEFAULT_TRANSCODING];

export const settingsEqual = (
  a: TranscodeSettings,
  b: TranscodeSettings,
): boolean => TRANSCODE_FIELDS.every((f) => a[f.id] === b[f.id]);

/**
 * True when a config's snapshot settings differ from its preset — e.g. a preset
 * that was deleted. Presets are no longer overridden per line-item (and an admin
 * preset update re-syncs every config), so this is normally false.
 */
export const isCustomTranscoding = (
  config: TranscodingConfig,
  presets: TranscodePreset[],
): boolean => {
  const preset = findPreset(presets, config.presetId);
  if (!preset) return true;
  return !settingsEqual(config.settings, preset.settings);
};

/**
 * The distro status a re-transcode lands on for a given config:
 *   - the Default baseline → `default` (green, not officially set)
 *   - any other preset     → `live`    (green, conformed)
 * Presets can't be overridden, so a config never lands out of spec.
 */
export const transcodeLandingStatus = (
  config: TranscodingConfig,
): DistroStatus =>
  config.presetId === DEFAULT_PRESET_ID ? "default" : "live";

/**
 * The publisher a transcode names, for the status chip suffix ("Live: Hulu
 * (Disney)"). Returns both the full and compact form so the chip can pick by
 * available width. Null on the Default baseline — no publisher to name, so the
 * chip stays a plain "Default".
 */
export const transcodePublisher = (
  presetId: string,
  presets: TranscodePreset[],
): { full: string; short: string } | null => {
  if (presetId === DEFAULT_PRESET_ID) return null;
  const preset = findPreset(presets, presetId);
  if (!preset) return null;
  return { full: preset.name, short: preset.shortName };
};

/**
 * Short human summary of a config for the modal ("Hulu (modified)"). */
export const describeConfig = (
  config: TranscodingConfig,
  presets: TranscodePreset[],
): string => {
  const preset = findPreset(presets, config.presetId);
  const name = preset?.name ?? "Custom";
  return isCustomTranscoding(config, presets) ? `${name} (modified)` : name;
};

/** Comma-joined summary of the applied configs for the section subheading. */
export const describeTranscodings = (
  configs: TranscodingConfig[],
  presets: TranscodePreset[],
): string =>
  configs.length === 0
    ? "None"
    : configs.map((c) => describeConfig(c, presets)).join(", ");

/**
 * Backfill any missing fields so a settings sheet always matches the schema, and
 * heal `select` values that are no longer valid options (e.g. after an option
 * was renamed — "Rec.709 / YUV" → "Rec.709") back to the baseline, so a stale
 * value can't render as a blank dropdown.
 */
/** Parse a bitrate string to Mbps for ordering: "18 Mbps" → 18, "750 kbps" → 0.75. */
export const rateToMbps = (s: string): number => {
  const n = parseFloat(s);
  if (Number.isNaN(n)) return Number.POSITIVE_INFINITY;
  return /kbps/i.test(s) ? n / 1000 : n;
};

/** A single bitrate like "8 Mbps" or "750 kbps" — not a range or other text. */
export const isSingleRate = (s: string): boolean =>
  /^\s*\d+(?:\.\d+)?\s*(?:kbps|mbps)\s*$/i.test(s);

/**
 * Canonicalize a comma-joined bitrate list for the multiselect field: a bare
 * number becomes Mbps, only single rates are kept (standard *or* custom — any
 * range from before single-rate mode is dropped), deduped and ordered ascending.
 */
export const canonicalizeRates = (raw: string): string[] =>
  [
    ...new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .map((s) => (/^\d+(?:\.\d+)?$/.test(s) ? `${s} Mbps` : s))
        .filter(isSingleRate),
    ),
  ].sort((a, b) => rateToMbps(a) - rateToMbps(b));

/**
 * Collapse legacy duration formats onto the current option set so an old stored
 * value doesn't render as a near-duplicate "custom" entry — ":30" / "30" → "30s".
 * Non-integer or ranged values (":15 / :30", "22.5s", "Original") are left alone.
 */
const canonicalizeDuration = (v: string): string => {
  const m = /^:?(\d+)s?$/.exec(v.trim());
  return m ? `${m[1]}s` : v;
};

const normalizeSettings = (
  raw: TranscodeSettings | undefined,
): TranscodeSettings => {
  const settings: TranscodeSettings = {};
  for (const f of TRANSCODE_FIELDS) {
    const stored = raw?.[f.id];
    if (f.type === "multiselect") {
      // A comma-joined list of single rates (standard or custom). Keep single-rate
      // values, drop any stale range from before single-rate mode, dedupe + order.
      // Fall back to the baseline if nothing valid remains.
      const picked = canonicalizeRates(stored ?? "");
      settings[f.id] = picked.length ? picked.join(", ") : DEFAULT_SETTINGS[f.id];
      continue;
    }
    const invalidSelect =
      f.type === "select" && (stored === undefined || !f.options?.includes(stored));
    let resolved =
      stored === undefined || invalidSelect ? DEFAULT_SETTINGS[f.id] : stored;
    if (f.id === "duration") resolved = canonicalizeDuration(resolved);
    settings[f.id] = resolved;
  }
  return settings;
};

const normalizeConfig = (raw: TranscodingConfig): TranscodingConfig => ({
  presetId: raw.presetId || DEFAULT_PRESET_ID,
  settings: normalizeSettings(raw.settings),
});

/**
 * Coerce persisted transcoding into the current list shape. Handles the pre-
 * multi single-config object (wraps it), an empty/missing value (default), and
 * normalizes each config's settings to the field schema.
 */
export const ensureTranscodings = (raw: unknown): TranscodingConfig[] => {
  const list: TranscodingConfig[] = Array.isArray(raw)
    ? (raw as TranscodingConfig[])
    : raw && typeof raw === "object" && "settings" in raw
      ? [raw as TranscodingConfig]
      : [];
  const valid = list.filter((c) => c && c.settings);
  if (valid.length === 0) return DEFAULT_TRANSCODINGS;
  return valid.map(normalizeConfig);
};

/**
 * Validate the persisted preset catalog: fall back to the seed when empty, keep
 * the protected `default` baseline present (prepended if a stored list dropped
 * it), and normalize every preset's settings to the current field schema.
 */
export const ensureTranscodePresets = (
  raw: TranscodePreset[] | undefined,
): TranscodePreset[] => {
  if (!raw || raw.length === 0) return SEED_TRANSCODE_PRESETS;
  const normalized = raw.map((p) => ({
    ...p,
    shortName: p.shortName || shortenName(p.name),
    settings: normalizeSettings(p.settings),
  }));
  if (!normalized.some((p) => p.id === DEFAULT_PRESET_ID)) {
    return [SEED_TRANSCODE_PRESETS[0], ...normalized];
  }
  return normalized;
};
