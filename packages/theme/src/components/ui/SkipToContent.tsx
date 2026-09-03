import React from "react";
import { Button } from "@mui/material";

export const SkipToContent: React.FC = () => {
  return (
    <Button
      href="#main-content"
      variant="contained"
      color="primary"
      tabIndex={0}
      sx={{
        position: "fixed",
        top: 8,
        left: 8,
        zIndex: 9999,
        // Visually hidden but still in the focus tab order.
        // clip-rect technique keeps the element accessible to AT and keyboard.
        clipPath: "inset(50%)",
        overflow: "hidden",
        whiteSpace: "nowrap",
        width: 1,
        height: 1,
        "&:focus, &:focus-visible": {
          clipPath: "none",
          width: "auto",
          height: "auto",
          overflow: "visible",
        },
      }}
    >
      Skip to main content
    </Button>
  );
};

export default SkipToContent;
