/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import type { IPerson, UsersTypeWithAction } from './types'
import { Box, Chip, CircularProgress, FormControlLabel, Switch, Typography } from '@mui/material'

const columnHelper = createColumnHelper<UsersTypeWithAction>()

export const columns1: Array<ColumnDef<UsersTypeWithAction, any>> = [
  columnHelper.accessor('firstName', {
    header: 'User',
    cell: ({ row }) => (
      <div className='flex items-center gap-4'>
        {/* {getAvatar({ profile_image: row.original.profile_image, first_name: row.original.first_name, last_name: row.original.last_name })} */}
        <div className='flex flex-col'>
          <Typography color='text.primary' className='font-medium'>
            {row.original.firstName} {row.original.lastName}
          </Typography>
        </div>
      </div>
    ),
  }),
  // columnHelper.accessor('user_type', {
  //   header: 'Role',
  //   cell: ({ row }) => (
  //     <div className='flex items-center gap-2'>
  //       <Icon
  //         className={userRoleObj[row.original.user_type].icon}
  //         sx={{
  //           color is resolved from the active MUI palette
  //             userRoleObj[row.original.user_type].color
  //           }-main)`,
  //         }}
  //       />
  //       <Typography className='capitalize' color='text.primary'>
  //         {row.original.user_type}
  //       </Typography>
  //     </div>
  //   ),
  // }),
  // columnHelper.accessor('currentPlan', {
  //   header: 'Plan',
  //   cell: ({ row }) => (
  //     <Typography className='capitalize' color='text.primary'>
  //       {row.original.currentPlan}
  //     </Typography>
  //   )
  // }),
  // columnHelper.accessor('billing', {
  //   header: 'Billing',
  //   cell: ({ row }) => <Typography>{row.original.billing}</Typography>
  // }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ getValue, row, column }) => {
      const initialValue = getValue()
      const [loading, setLoading] = React.useState<boolean>(false)
      const [_, setValue] = React.useState(initialValue)

      // const onBlur = () => {
      //   table.options.meta?.updateData(row.index, column.id, value)
      // }
      const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // const checked = event.target.checked
        console.log(`row ${row.original.firstName} event.target.checked ${event.target.checked}`)
        console.log(`row.index: ${row.index} column.id: ${column.id}`)

        try {
          setLoading(!loading)
          // setLoading(true)
          // const response = await handleUpdateStatus({
          //   status: newStatus ? 1 : 0,
          //   admin_ids: [row.original.id]
          // })
          // if (response.response_code === DEFAULT_STATUS_UPDATE_200.response_code) {
          //   toast.success('Update status sucess')
          // table.options.meta?.updateData(row.index, column.id, checked)
          // }
          // if (response.response_code === DEFAULT_400.response_code) {
          //   response.errors.forEach(error => {
          //     toast.error(`${error.message}`)
          //   })
          // }
        } catch (error) {
          console.log(error)
        } finally {
          // setLoading(false)
        }
      }
      React.useEffect(() => {
        setValue(initialValue)
      }, [initialValue])

      return (
        <Box display='flex'>
          <Chip
            variant='outlined'
            className='capitalize'
            label={row.original.status}
            // color={userStatusObj[row.original.is_active ? 'active' : 'inactive']}
            // size='small'
          />
          <FormControlLabel
            control={
              <Switch
                // defaultChecked
                // color={
                //   userStatusObj[row.original.is_active ? 'active' : 'inactive']
                // }
                // checked={row.original.is_active}
                // onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                //   handleChange(row, event.target.checked)
                // }
                // checked={checked}
                onChange={handleChange}
              />
            }
            label=''
          />
          {loading && <CircularProgress color='success' />}
        </Box>
      )
    },
  }),
  /*
  columnHelper.accessor('action', {
    header: 'Action',
    cell: () => (
      <div className='flex items-center'>
        <IconButton>
          <i className='tabler-trash text-[22px] text-textSecondary' />
        </IconButton>
        <IconButton>
           <Link href={getLocalizedUrl('apps/user/view', locale as Locale)} className='flex'>
            <i className='tabler-eye text-[22px] text-textSecondary' />
          </Link> 
        </IconButton>
        <OptionMenu
          iconClassName='text-[22px] text-textSecondary'
          options={[
            {
              text: 'Download',
              icon: 'tabler-download text-[22px]',
              menuItemProps: {
                className: 'flex items-center gap-2 text-textSecondary',
              },
            },
            {
              text: 'Edit',
              icon: 'tabler-edit text-[22px]',
              menuItemProps: {
                className: 'flex items-center gap-2 text-textSecondary',
              },
            },
          ]}
        />
      </div>
    ),
    enableSorting: false,
  }),*/
]

export const columns2: Array<ColumnDef<IPerson>> = [
  {
    header: 'Name',
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: 'firstName',
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.lastName,
        id: 'lastName',
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
        footer: (props) => props.column.id,
      },
    ],
  },
  // {
  //   header: 'Info',
  //   footer: (props) => props.column.id,
  //   columns: [
  //     {
  //       accessorKey: 'age',
  //       header: () => 'Age',
  //       footer: (props) => props.column.id,
  //     },
  //     {
  //       header: 'More Info',
  //       columns: [
  //         {
  //           accessorKey: 'visits',
  //           header: () => <span>Visits</span>,
  //           footer: (props) => props.column.id,
  //         },
  //         {
  //           accessorKey: 'status',
  //           header: 'Status',
  //           footer: (props) => props.column.id,
  //         },
  //         {
  //           accessorKey: 'progress',
  //           header: 'Profile Progress',
  //           footer: (props) => props.column.id,
  //         },
  //       ],
  //     },
  //   ],
  // },
]

export const columns3: Array<ColumnDef<IPerson>> = [
  {
    header: 'Name',
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: 'firstName',
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.lastName,
        id: 'lastName',
        header: () => <span>Last Name</span>,
        footer: (props) => props.column.id,
      },
    ],
  },
  {
    header: 'Info',
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: 'age',
        header: () => 'Age',
        footer: (props) => props.column.id,
      },
      {
        header: 'More Info',
        columns: [
          {
            accessorKey: 'visits',
            header: () => <span>Visits</span>,
            footer: (props) => props.column.id,
          },
          {
            accessorKey: 'status',
            header: 'Status',
            footer: (props) => props.column.id,
          },
          {
            accessorKey: 'progress',
            header: 'Profile Progress',
            footer: (props) => props.column.id,
          },
        ],
      },
    ],
  },
]
export default columns1
