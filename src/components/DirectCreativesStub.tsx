import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { SectionHeader } from "./SectionHeader";

const creatives = [
  {
    name: "Stratos_CTV_Interactive",
    creativeId: "8430",
    target: "CTV",
    pixelName: "stratos_completion",
  },
  {
    name: "Stratos_Mobile_Shoppable",
    creativeId: "8431",
    target: "Mobile",
    pixelName: "stratos_clickthrough",
  },
];

export const DirectCreativesStub = () => (
  <Box>
    <SectionHeader
      title="Direct Creatives"
      actions={
        <Button variant="outlined" color="primary" size="small">
          DAI Template Upload
        </Button>
      }
    />
    <Box sx={{ overflowX: "auto", maxWidth: "100%" }}>
    <Table size="small" sx={{ minWidth: 640 }}>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Creative Id</TableCell>
          <TableCell>Target</TableCell>
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
              <Typography variant="body2">{c.target}</Typography>
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
