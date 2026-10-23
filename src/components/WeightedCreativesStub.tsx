import {
  Box,
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { SectionHeader } from "./SectionHeader";

const creatives = [
  {
    name: "Stratos_Hero_30s",
    creativeId: "8421",
    weighting: "60%",
    pixelName: "stratos_completion",
  },
  {
    name: "Stratos_Cutdown_15s",
    creativeId: "8422",
    weighting: "40%",
    pixelName: "stratos_clickthrough",
  },
];

export const WeightedCreativesStub = () => (
  <Box>
    <SectionHeader
      title="Weighted Creatives"
      subtitle="Used as fallback when no target type provided or targeting doesn't match"
      actions={
        <Button variant="outlined" color="primary" size="small">
          Add Weighted Creatives
        </Button>
      }
    />
    <Box sx={{ overflowX: "auto", maxWidth: "100%" }}>
    <Table size="small" sx={{ minWidth: 640 }}>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Creative Id</TableCell>
          <TableCell>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <span>Weighting</span>
              <Tooltip title="Recalculate weights (visual only)">
                <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
                  <RefreshIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </TableCell>
          <TableCell>Pixel Name</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {creatives.map((c) => (
          <TableRow key={c.creativeId} hover>
            <TableCell>
              <Typography variant="body2">{c.name}</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" color="text.secondary">
                {c.creativeId}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{c.weighting}</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" color="text.secondary">
                {c.pixelName}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <IconButton size="small" sx={{ color: "text.secondary" }}>
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </Box>
  </Box>
);
