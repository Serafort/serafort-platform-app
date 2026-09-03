import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Stack,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UpgradeIcon from "@mui/icons-material/RocketLaunch";

export interface FeatureLockedModalProps {
  open: boolean;
  onClose: () => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
  onUpgrade?: () => void;
  upgradeLabel?: string;
  featureName: string;
  featureDescription?: string;
  benefits?: string[];
}

/**
 * Feature Locked Modal
 *
 * Appears when accessing tier-restricted or authentication-required features.
 * Highlights key enterprise benefits and isolates the upgrade/sign-up call-to-action (Von Restorff Effect).
 */
export const FeatureLockedModal: React.FC<FeatureLockedModalProps> = ({
  open,
  onClose,
  onSignIn,
  onSignUp,
  onUpgrade,
  upgradeLabel,
  featureName,
  featureDescription,
  benefits,
}) => {
  const theme = useTheme();

  const defaultBenefits = [
    "Role-Based Access Control (RBAC) and granular permission sets",
    "Enterprise Single Sign-On (SSO) with SAML and OIDC integration",
    "Comprehensive audit logging and real-time security telemetry",
    "Automated machine identity and API token management",
    "Zero-trust policy enforcement and session controls",
  ];

  const displayBenefits = benefits || defaultBenefits;

  const handlePrimaryAction = () => {
    onClose();
    if (onUpgrade) {
      onUpgrade();
    } else if (onSignUp) {
      onSignUp();
    }
  };

  const handleSecondaryAction = () => {
    onClose();
    if (onSignIn) {
      onSignIn();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: `0 24px 48px ${alpha("#000000", 0.2)}`,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.5, px: 3, pt: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.main, 0.12),
                color: theme.palette.warning.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LockIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Feature Access Restricted
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Stack spacing={2.5}>
          {/* Feature Info */}
          <Box>
            <Chip
              label={featureName}
              color="primary"
              size="small"
              sx={{ mb: 1.5, fontWeight: 700, borderRadius: "50px" }}
            />
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ lineHeight: 1.6 }}
            >
              {featureDescription ||
                `The ${featureName} capability requires an upgraded tenant plan or elevated organization privileges.`}
            </Typography>
          </Box>

          <Divider />

          {/* Benefits List */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
              What This Feature Includes:
            </Typography>
            <List dense disablePadding>
              {displayBenefits.map((benefit, index) => (
                <ListItem key={index} disableGutters sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircleIcon
                      color="success"
                      sx={{ fontSize: "1.1rem" }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={benefit}
                    primaryTypographyProps={{
                      variant: "body2",
                      color: "text.primary",
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Call to Action Highlight */}
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              p: 2,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <UpgradeIcon sx={{ color: "primary.main", fontSize: "1.5rem" }} />
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "primary.main" }}
            >
              Upgrade your workspace or contact your tenant administrator for
              access.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="text"
          color="inherit"
          sx={{ fontWeight: 700, textTransform: "none" }}
        >
          Dismiss
        </Button>
        {onSignIn && (
          <Button
            onClick={handleSecondaryAction}
            variant="outlined"
            color="inherit"
            sx={{ fontWeight: 700, textTransform: "none" }}
          >
            Sign In
          </Button>
        )}
        <Button
          onClick={handlePrimaryAction}
          variant="contained"
          color="primary"
          startIcon={<UpgradeIcon />}
          sx={{
            fontWeight: 800,
            textTransform: "none",
            px: 3,
            borderRadius: 2,
            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
          }}
        >
          {upgradeLabel || (onUpgrade ? "Upgrade Plan" : "Get Started")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeatureLockedModal;
