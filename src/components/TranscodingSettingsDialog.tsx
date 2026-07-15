import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useEffect, useMemo, useState } from "react";
import { DialogHeader } from "./DialogHeader";
import { TranscodeFieldsGrid } from "./TranscodeFieldsGrid";
import { ManageTranscodePresetsDialog } from "./ManageTranscodePresetsDialog";
import { useApp } from "../state/AppContext";
import type { TranscodeSettings, TranscodingConfig } from "../types";
import {
  findPreset,
  settingsEqual,
  transcodeLandingStatus,
} from "../lib/transcodePresets";
import { STATUS_META } from "../lib/distroStatus";

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (config: TranscodingConfig) => void;
  /** Surfaces admin preset-catalog changes to the top-level Snackbar. */
  onSaved?: (message: string) => void;
}

export const TranscodingSettingsDialog = ({
  open,
  onClose,
  onApply,
  onSaved,
}: Props) => {
  const { state } = useApp();
  const config = state.transcoding;
  const presets = state.transcodePresets;
  const isAdmin = state.role === "admin";
  const distroCount = state.distros.length;

  const [presetId, setPresetId] = useState(config.presetId);
  const [settings, setSettings] = useState<TranscodeSettings>(config.settings);
  const [managePresetsOpen, setManagePresetsOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPresetId(config.presetId);
    setSettings(config.settings);
  }, [open, config]);

  // Picking a preset overwrites the sheet with its values. It does NOT mutate
  // the preset — `settings` is local, and applying persists only to the
  // line-item.
  const handlePresetChange = (nextPresetId: string) => {
    const preset = findPreset(presets, nextPresetId);
    if (!preset) return;
    setPresetId(nextPresetId);
    setSettings({ ...preset.settings });
  };

  const updateField = (id: string, value: string) =>
    setSettings((prev) => ({ ...prev, [id]: value }));

  const preset = findPreset(presets, presetId);
  const modified = useMemo(
    () => !preset || !settingsEqual(settings, preset.settings),
    [settings, preset],
  );

  // Nothing to apply until the sheet differs from what's already saved.
  const hasChanges = useMemo(
    () =>
      presetId !== config.presetId ||
      !settingsEqual(settings, config.settings),
    [presetId, settings, config],
  );

  const handleApply = () => {
    onApply({ presetId, settings });
    onClose();
  };

  const landingLabel =
    STATUS_META[transcodeLandingStatus({ presetId, settings }, presets)].label;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "background.paper",
          backgroundImage: "none",
          borderRadius: 1,
        },
      }}
    >
      <DialogHeader title="Transcoding Settings" onClose={onClose} />
      <Divider />
      <DialogContent sx={{ px: 4, py: 3 }}>
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary">
            Pick a preset to fill the sheet, then adjust any field as needed.
            Edits apply to this line-item only — the preset is never changed.
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Autocomplete
              value={preset ?? null}
              onChange={(_, next) => next && handlePresetChange(next.id)}
              options={presets}
              getOptionLabel={(opt) => opt.name}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              sx={{ minWidth: 300 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Preset"
                  placeholder="Select a publisher preset — start typing to search"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            {isAdmin && (
              <Tooltip title="Add, edit, or remove presets (admin)">
                <IconButton
                  size="small"
                  onClick={() => setManagePresetsOpen(true)}
                  sx={{ color: "text.primary" }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {modified && (
              <Chip
                label="Modified — one-off override"
                size="small"
                sx={{
                  backgroundColor: "outOfSpec.main",
                  color: "outOfSpec.contrastText",
                  fontWeight: 600,
                }}
              />
            )}
          </Stack>

          <TranscodeFieldsGrid settings={settings} onChange={updateField} />

          <Typography variant="caption" color="text.secondary">
            {distroCount === 0
              ? "No distributions yet — settings are saved for this line-item."
              : `Applying re-transcodes ${distroCount} distribution${distroCount === 1 ? "" : "s"} (Processing → ${landingLabel}).`}
          </Typography>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={handleApply}
          disabled={!hasChanges}
          sx={{ color: hasChanges ? "primary.main" : "text.disabled" }}
        >
          Apply Settings
        </Button>
      </DialogActions>
      <ManageTranscodePresetsDialog
        open={managePresetsOpen}
        onClose={() => setManagePresetsOpen(false)}
        onSaved={onSaved}
      />
    </Dialog>
  );
};
