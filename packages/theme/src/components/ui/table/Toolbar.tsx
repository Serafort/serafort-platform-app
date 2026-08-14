import React from 'react';
import { Box, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, Tab, Tabs, TextField } from '@mui/material';
import type { IFilter, IHandleChange, ITabsHeader } from './types';
// 
// 

// interface ToolbarProps {
//     button: any
//     loading?: boolean
//     rowsPerPage?: number
//     page?: number
//     // hideActionMode?: boolean
//   }

export default function Toolbar({
  button,
  tabs = [],
  hideAddMode = false,
  hideTab = false,
  hideSearchbar = false,
  setHandleChange,
}: {
  button?: React.JSX.Element
  tabs?: Array<ITabsHeader>
  hideAddMode?: boolean
  hideTab?: boolean
  hideSearchbar?: boolean
  setHandleChange?: React.Dispatch<React.SetStateAction<IHandleChange>>
}) {
  // const { t } = useTranslation('common')
  // const button = props?.button ?? null
  // const hideAddMode = props?.hideAddMode ?? false
  // const hideSearchbar = props?.hideSearchbar ?? false
  // const hideTab = props?.hideTab ?? false
  // const tabs = props?.tabs ?? []

  //   const hideAutoComplete = props.hideAutoComplete
  // ? props.hideAutoComplete
  // : false

  //   const options = props.options ? props.options : []
  //   const setHandleChange = props.setHandleChange
  // ? props.setHandleChange
  // : () => {}
  //   const rest = props.rest ? props.rest : {}
  const [value, _] = React.useState<number>(0)
  const onChange = (
    event:
      | object
      | React.SyntheticEvent
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent,
    newValue: string | number,
  ) => {
    console.log(newValue)
    console.log(typeof newValue)
    console.log(typeof newValue === 'string')

    if (setHandleChange === undefined) return

    // if (newValue === undefined)
    //   setHandleChange({ event, value: event?.target?.value })
    // else {
    if (typeof newValue === 'string') setHandleChange({ event, value: newValue })

    // if (typeof newValue === 'number') {
    //   setValue(newValue)
    //   setHandleChange({ event, value: tabs[newValue] })
    // }
    // if (typeof newValue === 'object') {
    //   setHandleChange({ event, values: newValue })
    // }
    // }
  }
  const filters: Array<IFilter> = [
    { key: 'name', label: 'Nom', values: [{ key: 'baba', label: 'BABA' }] },
  ]

  return (
    <Stack direction='column'>
      <Box>
        <Grid container spacing={3} my='30px'>
          {filters.map((filter) => (
            <Grid key={filter.key} size={{ xs: 12, sm: Math.round(12 / filters.length) }}>
              <FormControl fullWidth>
                <InputLabel>{filter.label}</InputLabel>
                <Select
                  label={filter.label}
                  onChange={(event: SelectChangeEvent, _: React.ReactNode) =>
                    onChange(event, event.target.value)
                  }
                >
                  {filter.values?.map((value) => (
                    <MenuItem key={value.key} value={value.key}>
                      {value.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>
        {/* {!hideAutoComplete && (
          <Autocomplete
            multiple
            id='tags-standard'
            options={options}
            getOptionLabel={(option) => option.value}
            // onChange={onChange}
            renderInput={(params) => (
              <TextField
                {...params}
                hiddenLabel
                placeholder='Filtré (Ex: département, commune, ...)'
                fullWidth
              />
            )}
          />
        )} */}
        {!hideSearchbar && (
          <Stack direction='row'>
            <TextField
              // placeholder={t('App.search')}
              placeholder='search'
              type='search'
              fullWidth
              onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onChange(event, event.target?.value)
              }

              // InputProps={{
              //   startAdornment: (
              //     <InputAdornment position='start'>
              //       <IconButton
              //         aria-label='toggle search'
              //         // onClick={onChange}
              //       >
              //         <SearchIcon />
              //       </IconButton>
              //     </InputAdornment>
              //   ),
              // }}
            />
            {/* <IconButton onClick={() => {}}>
              <QrCodeScannerIcon />
            </IconButton> */}
          </Stack>
        )}
      </Box>
      <Stack direction='row' spacing={0}>
        {!hideTab && (
          <Tabs
            value={value}
            onChange={onChange}
            variant='scrollable'
            scrollButtons={false}
            aria-label='scrollable filter'
          >
            {tabs.map((tab: ITabsHeader) => (
              <Tab key={tab.key} label={tab.label} />
            ))}
          </Tabs>
        )}
        {!hideAddMode && (
          <Box sx={{ ml: 'auto ! important', padding: '12px 16px', pr: 0 }}>{button}</Box>
        )}
      </Stack>
    </Stack>
  )
}
