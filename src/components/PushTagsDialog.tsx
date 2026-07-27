import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { DialogHeader } from "./DialogHeader";
import { useApp } from "../state/AppContext";
import { PLATFORM_STATUS_META } from "../lib/platformStatus";
import {
  PUSH_PLATFORMS,
  fetchPlatformAdvertisers,
  type PlatformAdvertiser,
  type PushPlatform,
} from "../lib/pushTargets";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Fires the push: the selected distro ids plus the chosen destination. */
  onPush: (ids: string[], platformName: string, advertiserName: string) => void;
}

export const PushTagsDialog = ({ open, onClose, onPush }: Props) => {
  const { state } = useApp();
  const distros = state.distros;

  const [platform, setPlatform] = useState<PushPlatform | null>(null);
  const [advertiser, setAdvertiser] = useState<PlatformAdvertiser | null>(null);
  const [advertisers, setAdvertisers] = useState<PlatformAdvertiser[]>([]);
  const [loadingAdvertisers, setLoadingAdvertisers] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setPlatform(null);
    setAdvertiser(null);
    setAdvertisers([]);
    setLoadingAdvertisers(false);
    // Default to pushing everything; the user deselects what they want to hold back.
    setSelectedIds(distros.map((d) => d.id));
  }, [open, distros]);

  // Advertisers are platform-scoped, so re-fetch whenever the platform changes.
  // `stale` guards against a slow response for a platform the user has already
  // switched away from landing after a faster one.
  useEffect(() => {
    if (!platform) {
      setAdvertisers([]);
      return;
    }
    let stale = false;
    setLoadingAdvertisers(true);
    fetchPlatformAdvertisers(platform.id).then((result) => {
      if (stale) return;
      setAdvertisers(result);
      setLoadingAdvertisers(false);
    });
    return () => {
      stale = true;
    };
  }, [platform]);

  const handlePlatformChange = (next: PushPlatform | null) => {
    setPlatform(next);
    // The old advertiser belongs to the old platform — never carry it across.
    setAdvertiser(null);
  };

  const selectedCount = selectedIds.length;
  const allSelected = distros.length > 0 && selectedCount === distros.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const toggle = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleAll = () =>
    setSelectedIds(allSelected ? [] : distros.map((d) => d.id));

  const canPush = Boolean(platform && advertiser && selectedCount > 0);

  const pushLabel = useMemo(
    () =>
      selectedCount > 0
        ? `Push ${selectedCount} Tag${selectedCount === 1 ? "" : "s"}`
        : "Push Tags",
    [selectedCount],
  );

  const handlePush = () => {
    if (!platform || !advertiser || selectedCount === 0) return;
    onPush(selectedIds, platform.name, advertiser.name);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "background.paper",
          backgroundImage: "none",
          borderRadius: 1,
        },
      }}
    >
      <DialogHeader title="Push Tags to Platform" onClose={onClose} />
      <Divider />
      <DialogContent sx={{ px: 4, py: 3 }}>
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary">
            Pick the platform and advertiser, then choose which distribution tags
            to push. Advertisers are specific to each platform, so pick the
            platform first.
          </Typography>

          <Autocomplete
            value={platform}
            onChange={(_, newValue) => handlePlatformChange(newValue)}
            options={PUSH_PLATFORMS}
            getOptionLabel={(opt) => opt.name}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Platform"
                placeholder="Select a platform — start typing to search"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />

          <Autocomplete
            value={advertiser}
            onChange={(_, newValue) => setAdvertiser(newValue)}
            options={advertisers}
            getOptionLabel={(opt) => opt.name}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            disabled={!platform || loadingAdvertisers}
            loading={loadingAdvertisers}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Advertiser"
                placeholder={
                  platform
                    ? "Select an advertiser — start typing to search"
                    : "Select a platform first"
                }
                InputLabelProps={{ shrink: true }}
                helperText={
                  platform
                    ? `Advertisers available on ${platform.name}`
                    : "Enabled once a platform is selected"
                }
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingAdvertisers && (
                        <CircularProgress color="inherit" size={16} />
                      )}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 0.5 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                  />
                }
                label={<Typography variant="body2">Select all</Typography>}
              />
              <Typography variant="caption" color="text.secondary">
                {selectedCount} of {distros.length} selected
              </Typography>
            </Stack>
            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                maxHeight: 240,
                overflowY: "auto",
                px: 1.5,
                py: 1,
              }}
            >
              <Stack spacing={0.5}>
                {distros.map((d) => (
                  <Stack
                    key={d.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedIds.includes(d.id)}
                          onChange={() => toggle(d.id)}
                        />
                      }
                      label={<Typography variant="body2">{d.name}</Typography>}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ pl: 1, whiteSpace: "nowrap" }}
                    >
                      {PLATFORM_STATUS_META[d.platformStatus].label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={handlePush}
          disabled={!canPush}
          sx={{ color: canPush ? "primary.main" : "text.disabled" }}
        >
          {pushLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
