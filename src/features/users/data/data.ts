import {
  IconUser,
  IconUserShield,
} from '@tabler/icons-react'
import type { UserStatus } from './schema'

// 状态对应的样式，现在只有 active 和 inactive
export const statusStyles = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

// 状态对应的中文名称
export const statusNames: Record<UserStatus, string> = {
  active: '正常',
  inactive: '禁用',
}

// 预定义的用户角色，用于UI显示和筛选
export const userRoles = [
  {
    id: 2,
    label: '管理员',
    value: 'admin',
    icon: IconUserShield,
  },
  {
    id: 1,
    label: '普通用户',
    value: 'user',
    icon: IconUser,
  },
] as const
