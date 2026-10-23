import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  createFilterOptions,
  ListSubheader,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { TranscodeSettings } from "../types";
import {
  canonicalizeRates,
  TRANSCODE_FIELDS,
  type TranscodeField,
  type TranscodeFieldGroup,
} from "../lib/transcodePresets";

const GROUP_TITLES: Record<TranscodeFieldGroup, string> = {
  video: "Video",
  audio: "Audio",
};

const GROUPS: TranscodeFieldGroup[] = ["video", "audio"];

/** Sentinel for the "Custom…" entry in a select-custom dropdown. */
const CUSTOM_VALUE = "__custom__";

/** Badge marking a value that isn't one of the standard options. */
const CustomTag = () => (
  <Chip
    label="Custom"
    size="small"
    variant="outlined"
    sx={{
      height: 18,
      fontSize: 11,
      fontWeight: 600,
      color: "primary.main",
      borderColor: "primary.main",
      "& .MuiChip-label": { px: 0.75 },
    }}
  />
);

/**
 * A single dropdown field with a "Custom…" entry. Picking a standard option just
 * stores it; picking "Custom…" turns the control into a text input (in place) so
 * the user types their own value — once entered, the dropdown shows that value as
 * the selection. The stored value is always the literal string, so nothing
 * downstream needs to know whether it's custom (and `normalizeSettings` leaves
 * non-option values alone for these fields).
 */
const SelectWithCustom = ({
  field,
  value,
  onChange,
}: {
  field: TranscodeField;
  value: string;
  onChange: (value: string) => void;
}) => {
  const options = field.options ?? [];
  const isCustomValue = value !== "" && !options.includes(value);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    const trimmed = draft.trim();
    // Only apply a non-empty custom entry. Backing out (left blank) keeps the
    // value as it was before "Custom…" — the previously selected option, or unset
    // if nothing was selected — rather than clearing it to blank.
    if (trimmed !== "") onChange(trimmed);
    setEditing(false);
  };

  // While entering a custom value, the field IS a text input (same slot — never a
  // second field). Enter / blur commit; Escape backs out without changing it.
  if (editing) {
    return (
      <TextField
        label={field.label}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            setEditing(false);
          }
        }}
        autoFocus
        size="small"
        fullWidth
        placeholder={field.helperText}
        InputLabelProps={{ shrink: true }}
        helperText={field.helperText}
      />
    );
  }

  return (
    <TextField
      select
      label={field.label}
      value={value}
      onChange={(e) => {
        const next = e.target.value;
        if (next === CUSTOM_VALUE) {
          // Always start blank so the user types fresh — never inherit the prior
          // selection as pre-filled text to delete.
          setDraft("");
          setEditing(true);
        } else {
          onChange(next);
        }
      }}
      size="small"
      fullWidth
      InputLabelProps={{ shrink: true }}
      SelectProps={{
        // Flag a non-standard value right in the closed field with a "Custom" badge.
        renderValue: (selected) => {
          const v = (selected as string) ?? "";
          if (v === "") return "";
          return (
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
              <span>{v}</span>
              {!options.includes(v) && <CustomTag />}
            </Box>
          );
        },
      }}
    >
      {field.optionGroups
        ? field.optionGroups.flatMap((g) => [
            <ListSubheader
              key={`sub-${g.label}`}
              sx={{ bgcolor: "background.paper", lineHeight: 2.4, fontWeight: 600 }}
            >
              {g.label}
            </ListSubheader>,
            ...g.options.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            )),
          ])
        : options.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
      {/* A custom value shows as the current selection (badged), with Custom… to re-edit. */}
      {isCustomValue && (
        <MenuItem value={value}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
            <span>{value}</span>
            <CustomTag />
          </Box>
        </MenuItem>
      )}
      <MenuItem value={CUSTOM_VALUE}>Custom…</MenuItem>
    </TextField>
  );
};

/** Comma-joined list ⇄ array helper for multiselect fields. */
const parseRates = (v: string): string[] =>
  v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];

const rateFilter = createFilterOptions<string>();
/** Sentinel prefix marking the dropdown's "Add custom rate…" entry. */
const ADD_PREFIX = "__add__:";

/**
 * A multi-select of standard single values (Video Bitrate): the operator picks
 * one or more, shown as chips, and the backend produces one rendition per
 * selected value. A typed value that normalizes to a valid single rate surfaces
 * an explicit "Add custom rate…" option (the discoverable way to enter a specific
 * number) — ranges are rejected, so only single rates stick. Stored as a
 * comma-joined list in canonical option order.
 */
const MultiSelectField = ({
  field,
  value,
  onChange,
}: {
  field: TranscodeField;
  value: string;
  onChange: (value: string) => void;
}) => {
  const options = field.options ?? [];
  const selected = parseRates(value);
  // Strip the "Add custom rate…" sentinel to its raw value, then keep single
  // rates only (standard or custom), drop ranges, order ascending.
  const commit = (next: string[]) => {
    const raw = next.map((v) =>
      v.startsWith(ADD_PREFIX) ? v.slice(ADD_PREFIX.length) : v,
    );
    onChange(canonicalizeRates(raw.join(",")).join(", "));
  };
  return (
    <Autocomplete
      multiple
      freeSolo
      disableCloseOnSelect
      clearOnBlur
      handleHomeEndKeys
      options={options}
      value={selected}
      onChange={(_, next) => commit(next as string[])}
      size="small"
      fullWidth
      filterOptions={(opts, params) => {
        const filtered = rateFilter(opts, params);
        // Offer an explicit custom entry only when the typed text normalizes to a
        // single rate that isn't already a standard option or selected. A range
        // normalizes to nothing, so it never appears — "specific number, not a range".
        const normalized = canonicalizeRates(params.inputValue);
        if (
          normalized.length === 1 &&
          !options.includes(normalized[0]) &&
          !selected.includes(normalized[0])
        ) {
          filtered.push(`${ADD_PREFIX}${normalized[0]}`);
        }
        return filtered;
      }}
      getOptionLabel={(opt) =>
        opt.startsWith(ADD_PREFIX) ? opt.slice(ADD_PREFIX.length) : opt
      }
      renderOption={(props, option, { selected: isSel }) => {
        const { key, ...liProps } = props as typeof props & { key?: string };
        if (option.startsWith(ADD_PREFIX)) {
          return (
            <li {...liProps} key={option}>
              <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600 }}>
                Add custom rate “{option.slice(ADD_PREFIX.length)}”
              </Typography>
            </li>
          );
        }
        return (
          <li {...liProps} key={option}>
            <Checkbox size="small" checked={isSel} sx={{ mr: 1, p: 0.5 }} />
            {option}
          </li>
        );
      }}
      renderTags={(vals, getTagProps) =>
        vals.map((opt, i) => {
          const { key, ...tagProps } = getTagProps({ index: i });
          const custom = !options.includes(opt);
          return (
            <Chip
              key={key}
              size="small"
              label={custom ? `${opt} · Custom` : opt}
              variant={custom ? "outlined" : "filled"}
              sx={
                custom
                  ? { borderColor: "primary.main", color: "primary.main" }
                  : undefined
              }
              {...tagProps}
            />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={field.label}
          placeholder={selected.length ? "" : "Select rate(s) or type a custom number"}
          InputLabelProps={{ shrink: true }}
          helperText={field.helperText}
        />
      )}
    />
  );
};

const FieldInput = ({
  field,
  value,
  onChange,
  readOnly,
}: {
  field: TranscodeField;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}) => {
  if (readOnly) {
    // A plain, non-editable display of the preset's value for this field.
    return (
      <TextField
        label={field.label}
        value={value || "—"}
        size="small"
        fullWidth
        InputProps={{ readOnly: true }}
        InputLabelProps={{ shrink: true }}
      />
    );
  }
  if (field.type === "multiselect") {
    return <MultiSelectField field={field} value={value} onChange={onChange} />;
  }
  if (field.type === "select-custom") {
    return <SelectWithCustom field={field} value={value} onChange={onChange} />;
  }
  return (
    <TextField
      select={field.type === "select"}
      label={field.label}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      fullWidth
      InputLabelProps={{ shrink: true }}
      helperText={field.type === "text" ? field.helperText : undefined}
    >
      {field.type === "select" &&
        field.options?.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
    </TextField>
  );
};

interface Props {
  settings: TranscodeSettings;
  onChange: (id: string, value: string) => void;
  /** Read-only view (the user's Transcoding Settings dialog): fields show the
   *  preset's values but can't be edited. Editing happens only in the admin preset
   *  manager, where the grid is interactive (and custom entry is available). */
  readOnly?: boolean;
}

/**
 * The Video / Audio transcode field grid, shared by the user's Transcoding
 * Settings dialog and the admin preset manager so both render an identical sheet.
 */
export const TranscodeFieldsGrid = ({
  settings,
  onChange,
  readOnly = false,
}: Props) => (
  <Stack spacing={3}>
    {GROUPS.map((group) => (
      <Box key={group}>
        <Typography
          variant="h6"
          sx={{ color: "primary.main", fontWeight: 500, fontSize: 20, mb: 1.5 }}
        >
          {GROUP_TITLES[group]}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            columnGap: 2,
            rowGap: 2,
            alignItems: "start",
          }}
        >
          {TRANSCODE_FIELDS.filter((f) => f.group === group).map((f) => (
            <FieldInput
              key={f.id}
              field={f}
              value={settings[f.id]}
              onChange={(value) => onChange(f.id, value)}
              readOnly={readOnly}
            />
          ))}
        </Box>
      </Box>
    ))}
  </Stack>
);
