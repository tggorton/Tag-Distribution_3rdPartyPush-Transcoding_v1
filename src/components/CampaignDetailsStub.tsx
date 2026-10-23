import { Box, Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import type { ReactNode } from "react";

type Field = {
  label: string;
  value: string;
  /** Faint trailing descriptor (e.g. the Dynamic Product Updater note). */
  note?: string;
  decoration?: "edit" | "calendar" | "none";
};

// Mirrors the real platform's line-item detail block: a vertical label/value
// list in this order, with an edit pencil on the mutable fields.
const FIELDS: Field[] = [
  { label: "Line Item ID", value: "18", decoration: "none" },
  { label: "Status", value: "active", decoration: "edit" },
  { label: "Start Date", value: "2025/03/01", decoration: "calendar" },
  { label: "End Date", value: "2025/05/31", decoration: "calendar" },
  { label: "Rate", value: "$0 CPM", decoration: "edit" },
  { label: "Impressions Goal", value: "0", decoration: "edit" },
  { label: "Reverse Wrap Tag", value: "<not assigned>", decoration: "edit" },
  { label: "3rd Party Tag", value: "<not assigned>", decoration: "edit" },
  { label: "External Name", value: "<not assigned>", decoration: "edit" },
  { label: "Type", value: "video", decoration: "none" },
  { label: "Skippable", value: "No", decoration: "edit" },
  {
    label: "Default Creative",
    value: "Stratos_Hero_30s",
    decoration: "none",
  },
  { label: "Creative Playback Version", value: "Shop", decoration: "none" },
  {
    label: "Dynamic Product Updater Status",
    value: "N/A",
    note: "Creative is not using KERV Product Catalog",
    decoration: "none",
  },
];

const Decoration = ({ kind }: { kind?: Field["decoration"] }): ReactNode => {
  if (kind === "edit") {
    return (
      <EditIcon
        sx={{ fontSize: 15, color: "text.secondary", ml: 0.75, cursor: "pointer" }}
      />
    );
  }
  if (kind === "calendar") {
    return (
      <CalendarTodayIcon
        sx={{ fontSize: 14, color: "text.secondary", ml: 0.75, cursor: "pointer" }}
      />
    );
  }
  return null;
};

export const CampaignDetailsStub = () => (
  <Box>
    <Stack spacing={0.75} sx={{ mb: 2.5 }}>
      {FIELDS.map((f) => (
        <Stack key={f.label} direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, fontSize: 14, color: "text.primary" }}
          >
            {f.label}:
          </Typography>
          <Stack direction="row" alignItems="center">
            <Typography variant="body2" sx={{ fontSize: 14 }}>
              {f.value}
            </Typography>
            <Decoration kind={f.decoration} />
          </Stack>
          {f.note && (
            <Typography variant="caption" sx={{ color: "text.disabled", ml: 0.5 }}>
              {f.note}
            </Typography>
          )}
        </Stack>
      ))}
    </Stack>

    {/* Default-creative thumbnail — placeholder stand-in for the real preview frame. */}
    <Box
      sx={{
        width: 200,
        height: 112,
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
        backgroundColor: "background.sunken",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "text.disabled",
      }}
    >
      <ImageOutlinedIcon sx={{ fontSize: 34 }} />
    </Box>
  </Box>
);
