import { Box, Stack, Typography, type StackProps } from "@mui/material";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  spacing?: StackProps["spacing"];
}

export const SectionHeader = ({ title, subtitle, actions, spacing = 1 }: Props) => (
  <Box sx={{ mb: spacing }}>
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ flexWrap: "wrap", gap: 1 }}
    >
      <Typography variant="h6" sx={{ fontWeight: 400 }}>
        {title}
      </Typography>
      {actions && <Box>{actions}</Box>}
    </Stack>
    {subtitle && (
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
        {subtitle}
      </Typography>
    )}
  </Box>
);
