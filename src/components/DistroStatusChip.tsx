import { Box, Stack, Tooltip, Typography } from "@mui/material";
import type { DistroStatus } from "../types";
import { STATUS_META } from "../lib/distroStatus";

interface Props {
  status: DistroStatus;
  /** Publisher this distro is transcoded for, e.g. "Live: Hulu (Disney)".
   *  `full` shows at wide widths, `short` below the `lg` breakpoint. Omitted on
   *  the Default baseline, where there's no publisher to name. */
  pub?: { full: string; short: string } | null;
}

/**
 * Colored dot + label. The dot alone would encode meaning in color only, which
 * fails for color-blind users — the label is what makes it readable.
 */
export const DistroStatusChip = ({ status, pub }: Props) => {
  const meta = STATUS_META[status];
  // Show the full publisher name where there's room, the short form below `lg`.
  // Skip the responsive split when the two are identical (no qualifier to trim).
  const responsivePub = pub && pub.full !== pub.short;
  return (
    <Tooltip title={meta.description}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ display: "inline-flex" }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            // `outlined` statuses (Default) render as a ring so they read apart
            // from a same-colored solid dot (Live) without changing hue.
            backgroundColor: meta.outlined ? "transparent" : meta.color,
            border: meta.outlined ? "1.5px solid" : "none",
            borderColor: meta.color,
            flexShrink: 0,
          }}
        />
        <Typography variant="body2" color="text.secondary" noWrap>
          {meta.label}
          {pub &&
            (responsivePub ? (
              <>
                {": "}
                <Box
                  component="span"
                  sx={{ display: { xs: "none", lg: "inline" } }}
                >
                  {pub.full}
                </Box>
                <Box
                  component="span"
                  sx={{ display: { xs: "inline", lg: "none" } }}
                >
                  {pub.short}
                </Box>
              </>
            ) : (
              `: ${pub.full}`
            ))}
        </Typography>
      </Stack>
    </Tooltip>
  );
};
