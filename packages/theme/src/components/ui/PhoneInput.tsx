import PhoneInput from 'react-phone-input-2'
import { styled } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import React from 'react'

const PhoneInput2 = styled('div')(({ theme }) => ({
  '& .form-control': {
    width: '100%',
    height: '56px',
    background: 'transparent',
    border: `1px solid `,
    borderRadius: '8px',
    fontSize: '1rem',
    paddingLeft: '58px',
    color: theme.palette.text.primary,
    fontFamily: theme.typography.fontFamily,
    '&:focus': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 1px `,
    },
    '&.invalid-number': {
      borderColor: theme.palette.error.main,
      '&:focus': {
        boxShadow: `0 0 0 1px `,
      },
    },
  },
  '& .flag-dropdown': {
    position: 'absolute',
    top: 0,
    bottom: 0,
    padding: 0,
    borderRadius: '3px 0 0 3px',
    '&:hover, &:focus': {
      cursor: 'pointer',
    },
    '&.open': {
      zIndex: 2,
    },
  },
  '& input[disabled]+.flag-dropdown:hover': {
    cursor: 'default',
    borderColor: theme.palette.divider,
  },
  '& input[disabled]+.flag-dropdown:hover .selected-flag': {
    backgroundColor: 'transparent',
  },
  '& .selected-flag': {
    outline: 'none',
    position: 'relative',
    width: '52px',
    height: '100%',
    padding: '0 0 0 11px',
    borderRadius: '3px 0 0 3px',
    '&:focus .arrow': {
      borderLeftWidth: '4px',
      borderRightWidth: '4px',
      borderTop: `5px solid `,
    },
    '& .open': {
      backgroundColor: theme.palette.action.hover,
    },
    '& .flag': {
      position: 'absolute',
      top: '50%',
      marginTop: '-12px',
    },
    '& .arrow': {
      position: 'relative',
      top: '50%',
      marginTop: '-1px',
      left: '29px',
      width: 0,
      height: 0,
      borderLeft: '3px solid transparent',
      borderRight: '3px solid transparent',
      borderTop: `4px solid `,
    },
    '& .arrow.up': {
      borderTop: 'none',
      borderBottom: `4px solid `,
    },
  },
  '& .country-list ': {
    outline: 'none',
    zIndex: 1,
    listStyle: 'none',
    position: 'absolute',
    padding: 0,
    margin: '10px 0 10px -1px',
    boxShadow: theme.shadows[8],
    width: '300px',
    maxHeight: '220px',
    overflowY: 'scroll',
    borderRadius: '10px',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    opacity: 1,
    transform: 'none',
    minWidth: '339px',
    top: '80px',
    left: '40px',
    transformOrigin: '169.5px 28.6518px',
    transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    backgroundImage: 'none',
    '& .flag': {
      marginRight: '7px',
      marginTop: '2px',
      display: 'inline-block',
      position: 'absolute',
      left: '13px',
      top: '8px',
    },
    '& .divider': {
      paddingBottom: '5px',
      marginBottom: '5px',
      borderBottom: `1px solid `,
    },
    '& .country': {
      position: 'relative',
      padding: '12px 9px 13px 46px',
      '& .dial-code': {
        color: theme.palette.text.secondary,
      },
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      '&.highlight': {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        color: theme.palette.primary.main,
      },
    },
    '& .country-name': {
      marginRight: '6px',
    },
    '& .search': {
      zIndex: 2,
      position: 'sticky',
      top: 0,
      backgroundColor: theme.palette.background.paper,
      padding: '10px 0 6px 10px',
    },
    '& .search-emoji': {
      display: 'none',
      fontSize: '15px',
    },
    '& .search-box': {
      border: `1px solid `,
      borderRadius: '4px',
      fontSize: '15px',
      lineHeight: '15px',
      marginLeft: '6px',
      padding: '3px 8px 5px',
      outline: 'none',
      backgroundColor: 'transparent',
      color: theme.palette.text.primary,
      '&:hover': {
        borderColor: theme.palette.text.primary,
      },
    },
    '& .no-entries-message': {
      padding: '7px 10px 11px',
      opacity: '.7',
    },
  },
  '& .invalid-number-message': {
    position: 'absolute',
    zIndex: 1,
    fontSize: '13px',
    left: '25px',
    top: '-7px',
    background: theme.palette.background.paper,
    padding: '0 5px',
    color: theme.palette.error.main,
  },
  '& .special-label': {
    position: 'absolute',
    zIndex: 1,
    top: '-4px',
    left: '26px',
    display: 'block',
    background: 'transparent',
    padding: 0,
    fontSize: '1rem',
    whiteSpace: 'nowrap',
    color: theme.palette.text.secondary,
    fontWeight: 400,
    lineHeight: '1.4375em',
    letterSpacing: '0.00938em',
    transformOrigin: 'top left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 'calc(100% - 24px)',
    transform: 'translate(14px, 16px) scale(1)',
    transition:
      'color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,max-width 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
    pointerEvents: 'none',
  },
  '&:focus-within .special-label': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.background.paper,
    position: 'absolute',
    zIndex: 1,
    top: '0px',
    left: '0px',
    display: 'block',
    padding: '0 5px',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    transformOrigin: 'top left',
    transform: 'translateY(-10px)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 'calc(100% - 24px)',
  },
}))

// Wrapper component to pass through PhoneInput props
const PhoneInputWrapper: React.FC<any> = (props) => {
  const PhoneInputComponent = PhoneInput as any
  return (
    <PhoneInput2>
      <PhoneInputComponent {...props} />
    </PhoneInput2>
  )
}

export default PhoneInputWrapper
