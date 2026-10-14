import {
  Box,
  Chip,
  ListSubheader,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { TranscodeSettings } from "../types";
import {
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

const FieldInput = ({
  field,
  value,
  onChange,
}: {
  field: TranscodeField;
  value: string;
  onChange: (value: string) => void;
}) => {
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
}

/**
 * The Video / Audio transcode field grid, shared by the user's Transcoding
 * Settings dialog and the admin preset manager so both render an identical sheet.
 */
export const TranscodeFieldsGrid = ({ settings, onChange }: Props) => (
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
            />
          ))}
        </Box>
      </Box>
    ))}
  </Stack>
);
