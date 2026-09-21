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
} from "@mui/material";
import PublishRounded from "@mui/icons-material/PublishRounded";
import GridViewRounded from "@mui/icons-material/GridViewRounded";
import type { WidgetDefinition } from "@cap/shared-types";
import {
  RADIUS,
  hairline,
  iconTile,
  panelCard,
  primaryAction,
} from "../theme/studioStyles";

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
      PaperProps={{ sx: { borderRadius: RADIUS.card } }}
    >
      <DialogTitle sx={{ px: 6, pt: 6, pb: 3 }}>
        <Stack direction="row" alignItems="flex-start" spacing={3}>
          <Box sx={(theme) => iconTile(theme, 40)}>
            <PublishRounded sx={{ color: "primary.main", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: "1.0625rem",
                fontWeight: 700,
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
              }}
            >
              Publish widget
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.8125rem" }}
            >
              It is added to your dashboard as a new slot.
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 6 }}>
        <Box
          sx={(theme) => ({
            ...panelCard(theme),
            backgroundColor: theme.palette.background.default,
            p: 3.5,
          })}
        >
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              gap={3}
            >
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                {dsl.name}
              </Typography>
              <Box
                sx={(theme) => ({
                  flexShrink: 0,
                  px: 2,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: RADIUS.tag,
                  border: `1px solid ${hairline(theme)}`,
                  color: theme.palette.text.secondary,
                  fontSize: "0.65625rem",
                  fontWeight: 600,
                })}
              >
                {dsl.version}
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <GridViewRounded sx={{ fontSize: 15, color: "text.secondary" }} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                {dsl.layout.width} columns · {dsl.layout.height}px tall
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontFamily:
                  "var(--font-mono, 'JetBrains Mono', Consolas, monospace)",
                fontSize: "0.6875rem",
              }}
            >
              {dsl.component}
            </Typography>
          </Stack>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: "block", mt: 3, fontSize: "0.8125rem" }}
        >
          You can drag it somewhere else, or remove it, once it is there.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 6, pb: 6, pt: 4, gap: 2 }}>
        <Button
          onClick={onCancel}
          color="inherit"
          disabled={isPublishing}
          sx={{ ...primaryAction, color: "text.secondary" }}
        >
          Cancel
        </Button>
        <Button
          id="widget-studio-publish-confirm-btn"
          onClick={onConfirm}
          variant="contained"
          disabled={isPublishing}
          startIcon={<PublishRounded />}
          sx={primaryAction}
        >
          {isPublishing ? "Publishing…" : "Publish"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PublishConfirmDialog;
