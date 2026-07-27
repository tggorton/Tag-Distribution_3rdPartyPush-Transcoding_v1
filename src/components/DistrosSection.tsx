import { Box, Button, Snackbar, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../state/AppContext";
import type {
  Distro,
  DistroStatus,
  PlatformStatus,
  TranscodingConfig,
} from "../types";
import { buildDistroUrl } from "../lib/tagBuilder";
import { downloadCsv } from "../lib/csvExport";
import { RESTART_SIMULATION_MS, STATUS_META } from "../lib/distroStatus";
import { PLATFORM_STATUS_META } from "../lib/platformStatus";
import {
  describeTranscoding,
  transcodeLandingStatus,
} from "../lib/transcodePresets";
import { DistroTable } from "./DistroTable";
import { TagEditorDialog } from "./TagEditorDialog";
import { PushTagsDialog } from "./PushTagsDialog";
import { TranscodingSettingsDialog } from "./TranscodingSettingsDialog";
import { SectionHeader } from "./SectionHeader";
import { useConfirm } from "./ConfirmDialog";

export const DistrosSection = () => {
  const {
    state,
    removeDistro,
    setDistroStatus,
    setAllDistrosStatus,
    setDistrosPlatformStatus,
    setTranscoding,
  } = useApp();
  const { confirm, confirmDialog } = useConfirm();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Distro | null>(null);
  const [pushOpen, setPushOpen] = useState(false);
  const [transcodeOpen, setTranscodeOpen] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  const hasDistros = state.distros.length > 0;

  const handleCopy = async (distro: Distro) => {
    await navigator.clipboard.writeText(
      buildDistroUrl(distro, state.paramsCatalog, state.regions),
    );
    setSnack(`Copied tag URL for "${distro.name}"`);
  };

  const handleDelete = async (distro: Distro) => {
    const ok = await confirm({
      title: "Delete distribution?",
      message: `"${distro.name}" will be removed. This cannot be undone.`,
    });
    if (!ok) return;
    removeDistro(distro.id);
    setSnack(`Deleted "${distro.name}"`);
  };

  // Prototype stand-in for the backend's transcode lifecycle: a restarted distro
  // sits in Processing, then reports Live. Tracked so a pending timer can't fire
  // a status write after unmount.
  const restartTimers = useRef<number[]>([]);
  useEffect(
    () => () => restartTimers.current.forEach((t) => window.clearTimeout(t)),
    [],
  );

  const handleRestart = (distro: Distro) => {
    const retrying = distro.status === "error";
    setDistroStatus(distro.id, "processing");
    setSnack(
      retrying
        ? `Retrying transcode for "${distro.name}"…`
        : `Restarting creatives for "${distro.name}"…`,
    );
    const timer = window.setTimeout(() => {
      setDistroStatus(distro.id, "live");
      setSnack(`"${distro.name}" is live`);
    }, RESTART_SIMULATION_MS);
    restartTimers.current.push(timer);
  };

  const handleSetStatus = (distro: Distro, status: DistroStatus) => {
    setDistroStatus(distro.id, status);
    setSnack(`"${distro.name}" set to ${STATUS_META[status].label}`);
  };

  // Push the selected distros: they go Pushing, then land Success (optimistic —
  // the backend reports the real outcome once the push API is live; use the ⋯
  // "Set platform status" affordance to demo an Error/rejection meanwhile).
  const handlePush = (
    ids: string[],
    platformName: string,
    advertiserName: string,
  ) => {
    const target = { platform: platformName, advertiser: advertiserName };
    setDistrosPlatformStatus(ids, "pushing", target);
    setSnack(`Pushing ${ids.length} tag(s) to ${platformName}…`);
    const timer = window.setTimeout(() => {
      setDistrosPlatformStatus(ids, "success");
      setSnack(
        `Pushed ${ids.length} tag(s) to ${platformName} — ${advertiserName}`,
      );
    }, RESTART_SIMULATION_MS);
    restartTimers.current.push(timer);
  };

  const handleSetPlatformStatus = (distro: Distro, status: PlatformStatus) => {
    setDistrosPlatformStatus([distro.id], status);
    setSnack(
      `"${distro.name}" platform status set to ${PLATFORM_STATUS_META[status].label}`,
    );
  };

  const handleApplyTranscoding = (config: TranscodingConfig) => {
    setTranscoding(config);
    const label = describeTranscoding(config, state.transcodePresets);
    if (!hasDistros) {
      setSnack(`Transcoding settings saved — ${label}`);
      return;
    }
    // Re-transcode every distro: all go Processing, then land on the status the
    // config implies — Out of Spec (edited), Default (baseline), or Live (preset).
    const landing = transcodeLandingStatus(config, state.transcodePresets);
    setAllDistrosStatus("processing");
    setSnack(`Re-transcoding ${state.distros.length} distribution(s) — ${label}…`);
    const doneMessage =
      landing === "outOfSpec"
        ? "Transcode complete — settings are a custom override (Out of Spec)"
        : landing === "default"
          ? "Transcode complete — all distributions on the video baseline (Default)"
          : `Transcode complete — all distributions live on ${label}`;
    const timer = window.setTimeout(() => {
      setAllDistrosStatus(landing);
      setSnack(doneMessage);
    }, RESTART_SIMULATION_MS);
    restartTimers.current.push(timer);
  };

  const handleExport = () => {
    if (!hasDistros) {
      setSnack("No distributions to export");
      return;
    }
    downloadCsv(state.distros, state.paramsCatalog, state.regions);
    setSnack(`Exported ${state.distros.length} distribution(s) to CSV`);
  };

  return (
    <Box>
      <SectionHeader
        title="Distributions"
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => setAddOpen(true)}
            >
              + Add Distribution Tag
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => setTranscodeOpen(true)}
            >
              Transcoding Settings
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => setPushOpen(true)}
              disabled={!hasDistros}
            >
              Push Tags to Platform
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={handleExport}
              disabled={!hasDistros}
            >
              Export Tags
            </Button>
          </Stack>
        }
      />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: -0.5, mb: 1.5 }}
      >
        Transcoding: {describeTranscoding(state.transcoding, state.transcodePresets)}
      </Typography>
      <DistroTable
        distros={state.distros}
        onCopy={handleCopy}
        onEdit={(d) => setEditing(d)}
        onDelete={handleDelete}
        onRestart={handleRestart}
        onSetStatus={handleSetStatus}
        onSetPlatformStatus={handleSetPlatformStatus}
      />
      <TagEditorDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={(message) => setSnack(message)}
      />
      <TagEditorDialog
        open={Boolean(editing)}
        editingDistro={editing}
        onClose={() => setEditing(null)}
        onSaved={(message) => setSnack(message)}
      />
      <PushTagsDialog
        open={pushOpen}
        onClose={() => setPushOpen(false)}
        onPush={handlePush}
      />
      <TranscodingSettingsDialog
        open={transcodeOpen}
        onClose={() => setTranscodeOpen(false)}
        onApply={handleApplyTranscoding}
        onSaved={(message) => setSnack(message)}
      />
      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={2000}
        onClose={() => setSnack(null)}
        message={snack ?? ""}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
      {confirmDialog}
    </Box>
  );
};
