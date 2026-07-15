import {
  Divider,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useState, type MouseEvent } from "react";
import type { Distro, DistroStatus } from "../types";
import { buildDistroUrl } from "../lib/tagBuilder";
import {
  STATUS_ORDER,
  isRestartable,
  restartActionLabel,
  restartDisabledReason,
} from "../lib/distroStatus";
import { activePublisher } from "../lib/transcodePresets";
import { useApp } from "../state/AppContext";
import { DistroStatusChip } from "./DistroStatusChip";

interface Props {
  distros: Distro[];
  onCopy: (distro: Distro) => void;
  onEdit: (distro: Distro) => void;
  onDelete: (distro: Distro) => void;
  onRestart: (distro: Distro) => void;
  /**
   * Prototype-only affordance: lets a status be forced from the ⋯ menu so the
   * restart flow is demoable. The backend owns status in production.
   */
  onSetStatus: (distro: Distro, status: DistroStatus) => void;
}

export const DistroTable = ({
  distros,
  onCopy,
  onEdit,
  onDelete,
  onRestart,
  onSetStatus,
}: Props) => {
  const { state } = useApp();
  const catalog = state.paramsCatalog;
  const regions = state.regions;
  // All distros share the line-item's transcoding config, so the publisher is
  // the same for every row. Null on the Default baseline (no publisher to name).
  const pub = activePublisher(state.transcoding, state.transcodePresets);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [activeDistro, setActiveDistro] = useState<Distro | null>(null);

  const openMenu = (event: MouseEvent<HTMLButtonElement>, distro: Distro) => {
    setMenuAnchor(event.currentTarget);
    setActiveDistro(distro);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setActiveDistro(null);
  };

  const handleEdit = () => {
    if (activeDistro) onEdit(activeDistro);
    closeMenu();
  };

  const handleDelete = () => {
    if (activeDistro) onDelete(activeDistro);
    closeMenu();
  };

  const handleSetStatus = (status: DistroStatus) => {
    if (activeDistro) onSetStatus(activeDistro, status);
    closeMenu();
  };

  if (distros.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ py: 6, textAlign: "center" }}
      >
        No distributions yet — click <strong>+ Add Distribution Tag</strong> to
        create one.
      </Typography>
    );
  }

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell sx={{ minWidth: 180 }}>Status</TableCell>
            <TableCell>Distribution Tag</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {distros.map((d) => {
            const url = buildDistroUrl(d, catalog, regions);
            const restartable = isRestartable(d.status);
            return (
              <TableRow key={d.id} hover>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Typography variant="body2" noWrap>
                    {d.name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <DistroStatusChip status={d.status} pub={pub} />
                </TableCell>
                <TableCell sx={{ maxWidth: 540 }}>
                  <Typography
                    variant="body2"
                    title={url}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {url}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                    <Tooltip title="Copy tag URL">
                      <IconButton
                        size="small"
                        onClick={() => onCopy(d)}
                        sx={{ color: "text.secondary" }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={
                        restartable
                          ? restartActionLabel(d.status)
                          : restartDisabledReason(d.status)
                      }
                    >
                      {/* span: a disabled button emits no events, so the Tooltip
                          needs a wrapper to stay hoverable. */}
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => onRestart(d)}
                          disabled={!restartable}
                          sx={{ color: "text.secondary" }}
                        >
                          <RestartAltIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="More actions">
                      <IconButton
                        size="small"
                        onClick={(e) => openMenu(e, d)}
                        sx={{ color: "text.secondary" }}
                      >
                        <MoreHorizIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: { minWidth: 220, mt: 0.5 },
          },
        }}
      >
        <MenuItem onClick={handleEdit}>Edit Tag</MenuItem>
        <MenuItem onClick={closeMenu}>Launch Test Page</MenuItem>
        <MenuItem onClick={closeMenu}>Launch Test Page (3rd Party Tag)</MenuItem>
        <MenuItem onClick={closeMenu}>View Report</MenuItem>
        <Divider />
        <ListItemText
          sx={{ px: 2, py: 0.5, m: 0 }}
          primary="Set status (prototype)"
          primaryTypographyProps={{
            variant: "overline",
            color: "text.secondary",
          }}
        />
        {STATUS_ORDER.map((status) => (
          <MenuItem
            key={status}
            selected={activeDistro?.status === status}
            onClick={() => handleSetStatus(status)}
          >
            <DistroStatusChip status={status} />
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={handleDelete}
          sx={{ color: "primary.main" }}
        >
          Delete Tag
        </MenuItem>
      </Menu>
    </>
  );
};
