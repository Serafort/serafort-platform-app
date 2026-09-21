import React from "react";
import { Link } from "react-router-dom";
import { Typography, TypographyProps } from "@mui/material";

export function Copyright(props?: TypographyProps) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" to="https://www.serafort.com/">
        {" "}
        Serafort
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default Copyright;
