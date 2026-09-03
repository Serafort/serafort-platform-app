import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  Chip,
} from "@mui/material";
import PublishRounded from "@mui/icons-material/PublishRounded";
import GridViewRounded from "@mui/icons-material/GridViewRounded";
import type { WidgetDefinition } from "@cap/shared-types";

interface PublishConfirmDialogProps {
  open: boolean;
  dsl: WidgetDefinition | null;
  onConfirm: () => void;
  onCancel: () => void;
  isPublishing?: boolean;
}

const PublishConfirmDialog: React.FC<PublishConfirmDialogProps> = ({
  open,
  dsl,
  onConfirm,
  onCancel,
  isPublishing,
}) => {
  if (!dsl) return null;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      id="widget-studio-publish-dialog"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PublishRounded sx={{ color: "white", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              Publish Widget
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Add this widget to your dashboard
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack spacing={1}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2" fontWeight={600}>
                {dsl.name}
              </Typography>
              <Chip label={dsl.version} size="small" />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <GridViewRounded sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {dsl.layout.width}-column · {dsl.layout.height}px height
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              fontFamily="monospace"
              sx={{ fontSize: "0.65rem" }}
            >
              {dsl.component}
            </Typography>
          </Stack>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1.5 }}
        >
          This widget will be added as a new slot in your dashboard layout. You
          can rearrange or remove it using drag-and-drop.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onCancel} color="inherit" disabled={isPublishing}>
          Cancel
        </Button>
        <Button
          id="widget-studio-publish-confirm-btn"
          onClick={onConfirm}
          variant="contained"
          disabled={isPublishing}
          startIcon={<PublishRounded />}
          sx={{ borderRadius: 2 }}
        >
          {isPublishing ? "Publishing…" : "Publish to Dashboard"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PublishConfirmDialog;
