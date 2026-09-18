import React from "react";
import PhoneInput from "react-phone-input-2";
import { styled, alpha } from "@mui/material/styles";
import { Tooltip, Typography, Box } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const PhoneInput2 = styled("div")(({ theme }) => ({
  "& .form-control": {
    width: "100%",
    height: "var(--form-input-height, 48px)",
    minHeight: "48px",
    background: "transparent",
    border: `1px solid var(--sf-border, ${theme.palette.divider})`,
    borderRadius: "var(--sf-radius-md, 8px)",
    fontSize: "var(--sf-text-base, 0.875rem)",
    paddingLeft: "58px",
    color: theme.palette.text.primary,
    fontFamily: theme.typography.fontFamily,
    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
    "&:focus": {
      borderColor: theme.palette.primary.main,
      boxShadow: "var(--sf-shadow-glow, 0 0 0 3px rgba(6, 203, 253, 0.18))",
      outline: "none",
    },
    "&.invalid-number": {
      borderColor: theme.palette.error.main,
      "&:focus": {
        boxShadow: "var(--state-error-focus-ring, 0 0 0 3px rgba(220, 38, 38, 0.25))",
      },
    },
  },
  "& .flag-dropdown": {
    position: "absolute",
    top: 0,
    bottom: 0,
    padding: 0,
    borderRadius: "var(--sf-radius-md, 8px) 0 0 var(--sf-radius-md, 8px)",
    border: `1px solid var(--sf-border, ${theme.palette.divider})`,
    borderRight: "none",
    "&:hover, &:focus": {
      cursor: "pointer",
    },
    "&.open": {
      zIndex: 2,
    },
  },
  "& input[disabled]+.flag-dropdown:hover": {
    cursor: "default",
    borderColor: theme.palette.divider,
  },
  "& input[disabled]+.flag-dropdown:hover .selected-flag": {
    backgroundColor: "transparent",
  },
  "& .selected-flag": {
    outline: "none",
    position: "relative",
    width: "52px",
    height: "100%",
    padding: "0 0 0 11px",
    borderRadius: "var(--sf-radius-md, 8px) 0 0 var(--sf-radius-md, 8px)",
    "&:focus .arrow": {
      borderLeftWidth: "4px",
      borderRightWidth: "4px",
      borderTop: `5px solid var(--sf-text-secondary, ${theme.palette.text.secondary})`,
    },
    "& .open": {
      backgroundColor: theme.palette.action.hover,
    },
    "& .flag": {
      position: "absolute",
      top: "50%",
      marginTop: "-12px",
    },
    "& .arrow": {
      position: "relative",
      top: "50%",
      marginTop: "-1px",
      left: "29px",
      width: 0,
      height: 0,
      borderLeft: "3px solid transparent",
      borderRight: "3px solid transparent",
      borderTop: `4px solid var(--sf-text-secondary, ${theme.palette.text.secondary})`,
    },
    "& .arrow.up": {
      borderTop: "none",
      borderBottom: `4px solid var(--sf-text-secondary, ${theme.palette.text.secondary})`,
    },
  },
  "& .country-list ": {
    outline: "none",
    zIndex: 1,
    listStyle: "none",
    position: "absolute",
    padding: 0,
    margin: "10px 0 10px -1px",
    boxShadow: theme.shadows[8],
    width: "300px",
    maxHeight: "220px",
    overflowY: "scroll",
    borderRadius: "10px",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    opacity: 1,
    transform: "none",
    minWidth: "339px",
    top: "80px",
    left: "40px",
    transformOrigin: "169.5px 28.6518px",
    transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
    backgroundImage: "none",
    "& .flag": {
      marginRight: "7px",
      marginTop: "2px",
      display: "inline-block",
      position: "absolute",
      left: "13px",
      top: "8px",
    },
    "& .divider": {
      paddingBottom: "5px",
      marginBottom: "5px",
      borderBottom: `1px solid var(--sf-border, ${theme.palette.divider})`,
    },
    "& .country": {
      position: "relative",
      padding: "12px 9px 13px 46px",
      "& .dial-code": {
        color: theme.palette.text.secondary,
      },
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
      "&.highlight": {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        color: theme.palette.primary.main,
      },
    },
    "& .country-name": {
      marginRight: "6px",
    },
    "& .search": {
      zIndex: 2,
      position: "sticky",
      top: 0,
      backgroundColor: theme.palette.background.paper,
      padding: "10px 0 6px 10px",
    },
    "& .search-emoji": {
      display: "none",
      fontSize: "15px",
    },
    "& .search-box": {
      border: `1px solid var(--sf-border, ${theme.palette.divider})`,
      borderRadius: "4px",
      fontSize: "15px",
      lineHeight: "15px",
      marginLeft: "6px",
      padding: "3px 8px 5px",
      outline: "none",
      backgroundColor: "transparent",
      color: theme.palette.text.primary,
      "&:hover": {
        borderColor: theme.palette.text.primary,
      },
    },
    "& .no-entries-message": {
      padding: "7px 10px 11px",
      opacity: ".7",
    },
  },
  "& .invalid-number-message": {
    position: "absolute",
    zIndex: 1,
    fontSize: "13px",
    left: "25px",
    top: "-7px",
    background: theme.palette.background.paper,
    padding: "0 5px",
    color: "var(--sf-error-text, #B42121)",
  },
  "& .special-label": {
    position: "absolute",
    zIndex: 1,
    top: "-4px",
    left: "26px",
    display: "block",
    background: "transparent",
    padding: 0,
    fontSize: "1rem",
    whiteSpace: "nowrap",
    color: theme.palette.text.secondary,
    fontWeight: 400,
    lineHeight: "1.4375em",
    letterSpacing: "0.00938em",
    transformOrigin: "top left",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "calc(100% - 24px)",
    transform: "translate(14px, 16px) scale(1)",
    transition:
      "color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,max-width 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
    pointerEvents: "none",
  },
  "&:focus-within .special-label": {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.background.paper,
    position: "absolute",
    zIndex: 1,
    top: "0px",
    left: "0px",
    display: "block",
    padding: "0 5px",
    fontSize: "13px",
    whiteSpace: "nowrap",
    transformOrigin: "top left",
    transform: "translateY(-10px)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "calc(100% - 24px)",
  },
}));

export interface PhoneInputWrapperProps {
  value?: string;
  onChange?: (
    value: string,
    countryData?: any,
    e?: any,
    formattedValue?: string,
  ) => void;
  tooltip?: string;
  helperText?: string;
  error?: boolean;
  [key: string]: any;
}

// Wrapper component to pass through PhoneInput props with Postel's Law resilience
const PhoneInputWrapper: React.FC<PhoneInputWrapperProps> = ({
  value,
  onChange,
  tooltip,
  helperText,
  error,
  ...restProps
}) => {
  const PhoneInputComponent = PhoneInput as any;

  const handleChange = (
    val: string,
    country: any,
    e: any,
    formattedVal: string,
  ) => {
    // Postel's Law: normalize phone input to ensure consistent digits / formatting
    const rawDigits = val ? val.replace(/\D/g, "") : "";
    if (onChange) {
      onChange(
        rawDigits ? (val.startsWith("+") ? `+${rawDigits}` : rawDigits) : "",
        country,
        e,
        formattedVal,
      );
    }
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <PhoneInput2>
        <PhoneInputComponent
          value={value}
          onChange={handleChange}
          inputProps={{
            className: error ? "form-control invalid-number" : "form-control",
            ...restProps.inputProps,
          }}
          {...restProps}
        />
      </PhoneInput2>

      {(tooltip || helperText) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mt: 0.5,
            px: 1,
          }}
        >
          {tooltip && (
            <Tooltip title={tooltip} arrow placement="top">
              <InfoOutlinedIcon
                sx={{
                  fontSize: "0.875rem",
                  color: "text.secondary",
                  cursor: "help",
                }}
              />
            </Tooltip>
          )}
          {helperText && (
            <Typography
              variant="caption"
              sx={{ color: error ? "error.main" : "text.secondary" }}
            >
              {helperText}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PhoneInputWrapper;
