import React, { useState } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CheckIcon from "@mui/icons-material/Check";
import { useAppStore } from "@cap/platform-store";
import { useShallow } from "zustand/shallow";

export const DashboardViewSelector: React.FC = () => {
  const activeViewName = useAppStore(
    (state) => state.activeViewName || "Default View",
  );
  const savedViews = useAppStore((state) => state.savedViews || {});

  const actions = useAppStore(
    useShallow((state) => ({
      saveView: state.saveView,
      loadView: state.loadView,
      deleteView: state.deleteView,
      exportLayoutsJson: state.exportLayoutsJson,
      importLayoutsJson: state.importLayoutsJson,
    })),
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [importError, setImportError] = useState(false);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSaveViewSubmit = () => {
    if (newViewName.trim()) {
      actions.saveView(newViewName.trim());
      setNewViewName("");
      setSaveDialogOpen(false);
    }
  };

  const handleExport = () => {
    const jsonStr = actions.exportLayoutsJson();
    navigator.clipboard.writeText(jsonStr);
    handleCloseMenu();
  };

  const handleImportSubmit = () => {
    const success = actions.importLayoutsJson(jsonInput);
    if (success) {
      setImportError(false);
      setJsonInput("");
      setImportDialogOpen(false);
    } else {
      setImportError(true);
    }
  };

  const savedNames = Object.keys(savedViews);

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<BookmarkBorderIcon fontSize="small" />}
        onClick={handleOpenMenu}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600,
        }}
      >
        {activeViewName}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: { sx: { minWidth: 260, borderRadius: 2.5, p: 0.5 } },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            textTransform="uppercase"
          >
            Saved Dashboard Views
          </Typography>
        </Box>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setSaveDialogOpen(true);
          }}
        >
          <ListItemIcon>
            <AddIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Save Current View As..." />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        {savedNames.length === 0 ? (
          <MenuItem disabled>
            <ListItemText secondary="No saved views yet" />
          </MenuItem>
        ) : (
          savedNames.map((name) => {
            const isActive = activeViewName === name;
            return (
              <MenuItem
                key={name}
                selected={isActive}
                onClick={() => {
                  actions.loadView(name);
                  handleCloseMenu();
                }}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {isActive ? (
                    <CheckIcon fontSize="small" color="primary" />
                  ) : (
                    <BookmarkIcon fontSize="small" color="action" />
                  )}
                  <Typography variant="body2" fontWeight={isActive ? 700 : 500}>
                    {name}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  aria-label={`Delete view ${name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.deleteView(name);
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" color="error" />
                </IconButton>
              </MenuItem>
            );
          })
        )}

        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={handleExport}>
          <ListItemIcon>
            <FileDownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Copy Layout JSON (Cloud Sync)" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setImportDialogOpen(true);
          }}
        >
          <ListItemIcon>
            <FileUploadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Import Layout JSON..." />
        </MenuItem>
      </Menu>

      {/* Save View Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={700}>Save Dashboard View</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter a template name to snapshot your current widget positions,
            sizes, and layout configurations.
          </Typography>
          <TextField
            autoFocus
            label="View Name"
            placeholder="e.g., Morning Routine"
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
            fullWidth
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveViewSubmit}
            disabled={!newViewName.trim()}
          >
            Save View
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Layout Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={700}>Import Layout JSON</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Paste a valid dashboard layout JSON string to restore saved canvas
            configurations.
          </Typography>
          <TextField
            multiline
            rows={6}
            label="JSON Layout Payload"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            error={importError}
            helperText={
              importError
                ? "Invalid JSON format. Please verify payload structure."
                : ""
            }
            fullWidth
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleImportSubmit}
            disabled={!jsonInput.trim()}
          >
            Restore Layout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DashboardViewSelector;
