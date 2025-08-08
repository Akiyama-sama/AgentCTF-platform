import { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
// import LongText from '@/components/long-text'
import { statusNames, statusStyles, userRoles } from '../data/data'
import type { User } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
          || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label='全选'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label='选择此行'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='用户名' />
    ),
    cell: ({ row }) => <div className='w-24'>{row.getValue('username')}</div>,
  },
  {
    accessorKey: 'roles',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='角色' />
    ),
    cell: ({ row }) => {
      const roles = row.getValue<User['roles']>('roles')
      if (!roles || roles.length === 0) {
        return <span className='text-muted-foreground'>无</span>
      }
      const roleName = roles[0].name // 仅显示第一个角色
      const roleInfo = userRoles.find(r => r.value === roleName)

      return (
        <div className='flex items-center gap-x-2'>
          {roleInfo?.icon && (
            <roleInfo.icon size={16} className='text-muted-foreground' />
          )}
          <span className='capitalize'>{roleInfo?.label ?? roleName}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const roles = row.getValue<User['roles']>(id)
      return value.includes(roles?.[0]?.name)
    },
  },
  {
    accessorKey: 'is_active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('is_active') ? 'active' : 'inactive'
      const badgeColor = statusStyles.get(status)
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {statusNames[status]}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const status = row.getValue(id) ? 'active' : 'inactive'
      return value.includes(status)
    },
  },
  {
    accessorKey: 'created_time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='创建时间' />
    ),
    cell: ({ row }) => {
      const date = row.getValue<Date>('created_time')
      return <span>{date.toLocaleDateString()}</span>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
