import type { Theme } from '@mui/material/styles'
import { getHorizontalMenuRootItemSpacing } from '@cap/theme'

const menuRootStyles = (theme: Theme) => {
  return {
    '& > ul > li:not(:last-of-type)': {
      marginInlineEnd: getHorizontalMenuRootItemSpacing(theme),
    },
  }
}

export default menuRootStyles
