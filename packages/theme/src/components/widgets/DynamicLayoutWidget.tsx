import React from "react";
import {
  Box,
  Stack,
  Typography,
  Paper,
  Divider,
  Button,
  Avatar,
  Chip,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import { resolveDynamicIcon } from "./dynamicIconRegistry";
import type { WidgetRenderNode, WidgetAction } from "@cap/shared-types";

export interface DynamicLayoutWidgetProps {
  nodes?: WidgetRenderNode[];
  [key: string]: unknown;
}

const DynamicLayoutWidget: React.FC<DynamicLayoutWidgetProps> = ({ nodes }) => {
  const [feedback, setFeedback] = React.useState<string | null>(null);

  if (!nodes || nodes.length === 0) {
    return <Box p={2}>No nodes provided for custom layout.</Box>;
  }

  const handleAction = (action?: WidgetAction) => {
    if (!action) return;
    const message =
      typeof action.payload === "string"
        ? action.payload
        : action.payload?.message
          ? String(action.payload.message)
          : `Action triggered: ${action.type}`;

    if (action.type === "OPEN_LINK" && typeof action.payload === "string") {
      window.open(action.payload, "_blank");
    } else if (
      action.type === "NAVIGATE" &&
      typeof action.payload === "string"
    ) {
      window.location.href = action.payload;
    } else {
      setFeedback(message);
    }
  };

  const renderNode = (
    node: WidgetRenderNode,
    index: number,
  ): React.ReactNode => {
    const key = `node-${index}`;
    const { type, props = {}, children, action } = node;

    const actionProps = action
      ? {
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            handleAction(action);
          },
          style: {
            cursor: "pointer",
            ...((props.style as React.CSSProperties) || {}),
          },
        }
      : {};

    const combinedProps = { ...props, ...actionProps };

    const renderChildren = () => {
      if (!children) return null;
      if (typeof children === "string") return children;
      return children.map((child: WidgetRenderNode, i: number) =>
        renderNode(child, i),
      );
    };

    switch (type) {
      case "box":
        return (
          <Box key={key} {...combinedProps}>
            {renderChildren()}
          </Box>
        );
      case "stack":
        return (
          <Stack key={key} {...combinedProps}>
            {renderChildren()}
          </Stack>
        );
      case "paper":
        return (
          <Paper key={key} {...combinedProps}>
            {renderChildren()}
          </Paper>
        );
      case "typography":
        return (
          <Typography key={key} {...combinedProps}>
            {renderChildren()}
          </Typography>
        );
      case "divider":
        return <Divider key={key} {...combinedProps} />;
      case "button":
        return (
          <Button key={key} {...combinedProps}>
            {renderChildren()}
          </Button>
        );
      case "avatar":
        return (
          <Avatar key={key} {...combinedProps}>
            {renderChildren()}
          </Avatar>
        );
      case "chip":
        return <Chip key={key} {...combinedProps} />;
      case "card":
        return (
          <Card key={key} {...combinedProps}>
            {children ? <CardContent>{renderChildren()}</CardContent> : null}
          </Card>
        );
      case "grid":
        return (
          <Grid key={key} {...combinedProps}>
            {renderChildren()}
          </Grid>
        );
      case "icon": {
        const { name: iconName, ...restProps } = props;
        const iconCombinedProps = { ...restProps, ...actionProps };
        const IconComponent =
          resolveDynamicIcon(iconName as string | undefined) ?? CircleIcon;
        return <IconComponent key={key} {...iconCombinedProps} />;
      }
      case "image":
        return <Box key={key} component="img" {...combinedProps} />;
      default:
        return (
          <Box key={key} p={1} bgcolor="error.main">
            Unknown node type: {type}
          </Box>
        );
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        position: "relative",
      }}
    >
      {nodes.map((node, i) => renderNode(node, i))}
      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={3000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setFeedback(null)}
          severity="info"
          sx={{ width: "100%" }}
        >
          {feedback}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DynamicLayoutWidget;
