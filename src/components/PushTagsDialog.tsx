import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { DialogHeader } from "./DialogHeader";
import {
  PUSH_PLATFORMS,
  fetchPlatformAdvertisers,
  type PlatformAdvertiser,
  type PushPlatform,
} from "../lib/pushTargets";

interface Props {
  open: boolean;
  /** How many distribution tags will be pushed — the whole list, for now. */
  tagCount: number;
  onClose: () => void;
  onSaved?: (message: string) => void;
}

export const PushTagsDialog = ({
  open,
  tagCount,
  onClose,
  onSaved,
}: Props) => {
  const [platform, setPlatform] = useState<PushPlatform | null>(null);
  const [advertiser, setAdvertiser] = useState<PlatformAdvertiser | null>(null);
  const [advertisers, setAdvertisers] = useState<PlatformAdvertiser[]>([]);
  const [loadingAdvertisers, setLoadingAdvertisers] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPlatform(null);
    setAdvertiser(null);
    setAdvertisers([]);
    setLoadingAdvertisers(false);
  }, [open]);

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

  const canPush = Boolean(platform && advertiser);

  const handlePush = () => {
    if (!platform || !advertiser) return;
    onSaved?.(
      `Pushed ${tagCount} tag${tagCount === 1 ? "" : "s"} to ${platform.name} — ${advertiser.name}`,
    );
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
            Pushing <strong>{tagCount}</strong> distribution tag
            {tagCount === 1 ? "" : "s"} to the selected platform. Advertisers are
            specific to each platform, so pick the platform first.
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
          Push Tags
        </Button>
      </DialogActions>
    </Dialog>
  );
};
