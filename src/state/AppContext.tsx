import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  AppState,
  CustomKeyValue,
  Distro,
  DistroStatus,
  ParamDef,
  ParamFamilyKey,
  ParamsCatalog,
  RegionDef,
  Role,
  Template,
  TranscodePreset,
  TranscodingConfig,
} from "../types";
import { seedRegions, seedTemplates } from "./seedData";
import { SEED_PARAMS_CATALOG } from "../lib/paramCatalog";
import { DEFAULT_DISTRO_STATUS } from "../lib/distroStatus";
import {
  DEFAULT_TRANSCODING,
  SEED_TRANSCODE_PRESETS,
  ensureTranscoding,
  ensureTranscodePresets,
} from "../lib/transcodePresets";

const STORAGE_KEY = "radius.adtags.v1";

const initialState: AppState = {
  role: "user",
  templates: seedTemplates,
  distros: [],
  nextDistributionId: 12100,
  paramsCatalog: SEED_PARAMS_CATALOG,
  regions: seedRegions,
  transcoding: DEFAULT_TRANSCODING,
  transcodePresets: SEED_TRANSCODE_PRESETS,
};

type Action =
  | { type: "hydrate"; state: AppState }
  | { type: "setRole"; role: Role }
  | { type: "addDistro"; distro: Distro }
  | { type: "updateDistro"; distro: Distro }
  | { type: "removeDistro"; id: string }
  | { type: "setDistroStatus"; id: string; status: DistroStatus }
  | { type: "setAllDistrosStatus"; status: DistroStatus }
  | { type: "setTranscoding"; config: TranscodingConfig }
  | { type: "addTranscodePreset"; preset: TranscodePreset }
  | { type: "updateTranscodePreset"; preset: TranscodePreset }
  | { type: "deleteTranscodePreset"; id: string }
  | { type: "addTemplate"; template: Template }
  | { type: "updateTemplate"; template: Template }
  | { type: "deleteTemplates"; ids: string[] }
  | { type: "setTemplateDisabled"; id: string; disabled: boolean }
  | { type: "addParam"; family: ParamFamilyKey; param: ParamDef }
  | { type: "updateParam"; family: ParamFamilyKey; param: ParamDef }
  | { type: "deleteParam"; family: ParamFamilyKey; paramId: string }
  | { type: "addRegion"; region: RegionDef }
  | { type: "updateRegion"; region: RegionDef }
  | { type: "deleteRegion"; id: string };

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "setRole":
      return { ...state, role: action.role };
    case "addDistro":
      return {
        ...state,
        distros: [...state.distros, action.distro],
        nextDistributionId: Math.max(
          state.nextDistributionId,
          action.distro.distributionId + 1,
        ),
      };
    case "updateDistro":
      return {
        ...state,
        distros: state.distros.map((d) =>
          d.id === action.distro.id ? action.distro : d,
        ),
      };
    case "removeDistro":
      return {
        ...state,
        distros: state.distros.filter((d) => d.id !== action.id),
      };
    case "setDistroStatus":
      return {
        ...state,
        distros: state.distros.map((d) =>
          d.id === action.id ? { ...d, status: action.status } : d,
        ),
      };
    case "setAllDistrosStatus":
      return {
        ...state,
        distros: state.distros.map((d) => ({ ...d, status: action.status })),
      };
    case "setTranscoding":
      return { ...state, transcoding: action.config };
    case "addTranscodePreset":
      return {
        ...state,
        transcodePresets: [...state.transcodePresets, action.preset],
      };
    case "updateTranscodePreset":
      return {
        ...state,
        transcodePresets: state.transcodePresets.map((p) =>
          p.id === action.preset.id ? action.preset : p,
        ),
      };
    case "deleteTranscodePreset":
      return {
        ...state,
        transcodePresets: state.transcodePresets.filter(
          (p) => p.id !== action.id,
        ),
      };
    case "addTemplate":
      return { ...state, templates: [...state.templates, action.template] };
    case "updateTemplate":
      return {
        ...state,
        templates: state.templates.map((t) =>
          t.id === action.template.id ? action.template : t,
        ),
      };
    case "deleteTemplates": {
      const idSet = new Set(action.ids);
      return {
        ...state,
        templates: state.templates.filter((t) => !idSet.has(t.id)),
      };
    }
    case "setTemplateDisabled":
      return {
        ...state,
        templates: state.templates.map((t) =>
          t.id === action.id ? { ...t, disabled: action.disabled } : t,
        ),
      };
    case "addParam":
      return {
        ...state,
        paramsCatalog: {
          ...state.paramsCatalog,
          [action.family]: [
            ...state.paramsCatalog[action.family],
            action.param,
          ],
        },
      };
    case "updateParam":
      return {
        ...state,
        paramsCatalog: {
          ...state.paramsCatalog,
          [action.family]: state.paramsCatalog[action.family].map((p) =>
            p.id === action.param.id ? action.param : p,
          ),
        },
      };
    case "deleteParam":
      return {
        ...state,
        paramsCatalog: {
          ...state.paramsCatalog,
          [action.family]: state.paramsCatalog[action.family].filter(
            (p) => p.id !== action.paramId,
          ),
        },
      };
    case "addRegion":
      return { ...state, regions: [...state.regions, action.region] };
    case "updateRegion":
      return {
        ...state,
        regions: state.regions.map((r) =>
          r.id === action.region.id ? action.region : r,
        ),
      };
    case "deleteRegion":
      return {
        ...state,
        regions: state.regions.filter((r) => r.id !== action.id),
      };
    default:
      return state;
  }
};

interface AppContextValue {
  state: AppState;
  setRole: (role: Role) => void;
  addDistro: (distro: Distro) => void;
  updateDistro: (distro: Distro) => void;
  removeDistro: (id: string) => void;
  setDistroStatus: (id: string, status: DistroStatus) => void;
  setAllDistrosStatus: (status: DistroStatus) => void;
  setTranscoding: (config: TranscodingConfig) => void;
  addTranscodePreset: (preset: TranscodePreset) => void;
  updateTranscodePreset: (preset: TranscodePreset) => void;
  deleteTranscodePreset: (id: string) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (template: Template) => void;
  deleteTemplates: (ids: string[]) => void;
  setTemplateDisabled: (id: string, disabled: boolean) => void;
  addParam: (family: ParamFamilyKey, param: ParamDef) => void;
  updateParam: (family: ParamFamilyKey, param: ParamDef) => void;
  deleteParam: (family: ParamFamilyKey, paramId: string) => void;
  addRegion: (region: RegionDef) => void;
  updateRegion: (region: RegionDef) => void;
  deleteRegion: (id: string) => void;
  nextDistributionId: () => number;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * Migrate legacy entities that had `customMacros` (now consolidated into
 * `customKeyValues`). The macro `{ macro, token }` shape is mapped to
 * `{ key: macro, value: token }` and merged into `customKeyValues`.
 */
const migrateCustomFields = <T extends { customKeyValues: CustomKeyValue[] }>(
  entity: T,
): T => {
  const legacyMacros = (
    entity as unknown as {
      customMacros?: Array<{ id: string; macro: string; token: string }>;
    }
  ).customMacros;
  if (!legacyMacros || legacyMacros.length === 0) return entity;
  return {
    ...entity,
    customKeyValues: [
      ...entity.customKeyValues,
      ...legacyMacros.map((m) => ({ id: m.id, key: m.macro, value: m.token })),
    ],
  };
};

/**
 * Distros persisted before the status column existed have no `status` — treat
 * them as Live, matching the default for newly-created distros. The `cold`
 * status was also renamed to `inactive`; map the legacy value across so a stored
 * distro doesn't come back with a status that's no longer in the union.
 */
const migrateDistroStatus = (distro: Distro): Distro => {
  if (!distro.status) return { ...distro, status: DEFAULT_DISTRO_STATUS };
  if ((distro.status as string) === "cold") {
    return { ...distro, status: "inactive" };
  }
  return distro;
};

const ensureCatalog = (raw: ParamsCatalog | undefined): ParamsCatalog => {
  if (!raw || !raw.nexxen || !raw.ttd || !raw.creative) {
    return SEED_PARAMS_CATALOG;
  }
  return raw;
};

/**
 * Map legacy region ids ("us-east-1" / "europe") onto their post-migration
 * equivalents ("usa" / "uk-europe"). Australia keeps its id.
 */
const LEGACY_REGION_ID_MAP: Record<string, string> = {
  "us-east-1": "usa",
  europe: "uk-europe",
};

const migrateRegionId = (id: string): string =>
  LEGACY_REGION_ID_MAP[id] ?? id;

const migrateEntityRegion = <T extends { region: string }>(entity: T): T => {
  const next = migrateRegionId(entity.region);
  if (next === entity.region) return entity;
  return { ...entity, region: next };
};

/**
 * If localStorage carries the original 3-region seed (us-east-1, australia,
 * europe) with default names, replace with the new 5-region seed so existing
 * users see the expanded catalog. Customized region lists are left alone.
 */
const LEGACY_SEED_IDS = new Set(["us-east-1", "australia", "europe"]);
const isLegacyRegionSeed = (regions: RegionDef[]): boolean =>
  regions.length === 3 && regions.every((r) => LEGACY_SEED_IDS.has(r.id));

const ensureRegions = (raw: RegionDef[] | undefined): RegionDef[] => {
  if (!raw || raw.length === 0) return seedRegions;
  if (isLegacyRegionSeed(raw)) return seedRegions;
  return raw;
};

const loadFromStorage = (): AppState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.templates || !parsed.distros) return null;
    // We intentionally do NOT re-merge missing built-in templates here so that
    // admin deletions persist across reloads. New users (no localStorage yet)
    // still get the full seed set via `initialState`.
    return {
      ...initialState,
      ...parsed,
      templates: parsed.templates
        .map(migrateCustomFields)
        .map(migrateEntityRegion),
      distros: parsed.distros
        .map(migrateCustomFields)
        .map(migrateEntityRegion)
        .map(migrateDistroStatus),
      paramsCatalog: ensureCatalog(parsed.paramsCatalog),
      regions: ensureRegions(parsed.regions),
      transcoding: ensureTranscoding(parsed.transcoding),
      transcodePresets: ensureTranscodePresets(parsed.transcodePresets),
    };
  } catch {
    return null;
  }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    const fromStorage = loadFromStorage();
    return fromStorage ?? init;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      setRole: (role) => dispatch({ type: "setRole", role }),
      addDistro: (distro) => dispatch({ type: "addDistro", distro }),
      updateDistro: (distro) => dispatch({ type: "updateDistro", distro }),
      removeDistro: (id) => dispatch({ type: "removeDistro", id }),
      setDistroStatus: (id, status) =>
        dispatch({ type: "setDistroStatus", id, status }),
      setAllDistrosStatus: (status) =>
        dispatch({ type: "setAllDistrosStatus", status }),
      setTranscoding: (config) => dispatch({ type: "setTranscoding", config }),
      addTranscodePreset: (preset) =>
        dispatch({ type: "addTranscodePreset", preset }),
      updateTranscodePreset: (preset) =>
        dispatch({ type: "updateTranscodePreset", preset }),
      deleteTranscodePreset: (id) =>
        dispatch({ type: "deleteTranscodePreset", id }),
      addTemplate: (template) => dispatch({ type: "addTemplate", template }),
      updateTemplate: (template) =>
        dispatch({ type: "updateTemplate", template }),
      deleteTemplates: (ids) => dispatch({ type: "deleteTemplates", ids }),
      setTemplateDisabled: (id, disabled) =>
        dispatch({ type: "setTemplateDisabled", id, disabled }),
      addParam: (family, param) => dispatch({ type: "addParam", family, param }),
      updateParam: (family, param) =>
        dispatch({ type: "updateParam", family, param }),
      deleteParam: (family, paramId) =>
        dispatch({ type: "deleteParam", family, paramId }),
      addRegion: (region) => dispatch({ type: "addRegion", region }),
      updateRegion: (region) => dispatch({ type: "updateRegion", region }),
      deleteRegion: (id) => dispatch({ type: "deleteRegion", id }),
      nextDistributionId: () => state.nextDistributionId,
    }),
    [state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
