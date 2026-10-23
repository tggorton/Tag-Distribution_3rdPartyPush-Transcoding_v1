import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EditIcon from "@mui/icons-material/Edit";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface Props {
  name: string;
  /** 1-based position of this line item within its result set (prototype: 1 of 1). */
  position?: number;
  total?: number;
}

export const LineItemHeader = ({ name, position = 1, total = 1 }: Props) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    sx={{ mb: 3, gap: 2, flexWrap: "wrap" }}
  >
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
      <IconButton size="small" sx={{ color: "text.secondary" }}>
        <KeyboardArrowDownIcon fontSize="small" />
      </IconButton>
      <NavigateNextIcon sx={{ color: "text.secondary", fontSize: 18 }} />
      <Typography variant="h6" sx={{ ml: 1, fontWeight: 500 }} noWrap>
        {name}
      </Typography>
      <IconButton size="small" sx={{ color: "text.secondary", ml: 0.5 }}>
        <EditIcon fontSize="small" />
      </IconButton>
    </Stack>

    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<ChevronLeftIcon />}
          disabled={position <= 1}
        >
          Prev
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          endIcon={<ChevronRightIcon />}
          disabled={position >= total}
        >
          Next
        </Button>
      </Stack>
      <Box
        sx={{
          px: 1.5,
          py: 0.75,
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          fontSize: 13,
          color: "text.secondary",
          whiteSpace: "nowrap",
        }}
      >
        {position} of {total}
      </Box>
      <Button
        variant="contained"
        color="primary"
        sx={{
          backgroundColor: "primary.main",
          "&:hover": { backgroundColor: "primary.dark" },
          px: 2.5,
          py: 1,
        }}
      >
        Set Default Creative
      </Button>
      <Button
        variant="contained"
        color="primary"
        sx={{
          backgroundColor: "primary.main",
          "&:hover": { backgroundColor: "primary.dark" },
          px: 2.5,
          py: 1,
        }}
      >
        Clone This Line Item
      </Button>
    </Stack>
  </Stack>
);
