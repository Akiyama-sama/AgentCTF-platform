import {
  Circle,
  CircleDot,
  HardHat,
  Info,
  Play,
  StopCircle,
  Trash2,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import React from 'react'
import { BaseState, ModelAction } from '../../../types/docker-manager'

export type ActionType = ModelAction | 'delete' | 'view_details'|'enter'

export interface StateAction {
  label: string
  icon: LucideIcon
  actionType: ActionType
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export interface StateConfig {
  label: string
  icon: LucideIcon
  iconClassName: string
  component?: React.ComponentType
  actions?: StateAction[]
}

export const scenarioStateConfig: Record<BaseState, StateConfig> = {
  running: {
    label: '运行中',
    icon: CircleDot,
    iconClassName: 'text-green-500',
    actions: [
      { label: '进入场景', icon: Play, variant: 'default', actionType: 'enter' },
      { label: '停止', icon: StopCircle, variant: 'destructive', actionType: 'stop' },
    ],
  },
  stopped: {
    label: '已停止',
    icon: Circle,
    iconClassName: 'text-gray-500',
    actions: [
      { label: '启动', icon: Play, actionType: 'start' },
      { label: '详细信息', icon: Info, variant: 'outline', actionType: 'view_details' },
      { label: '删除', icon: Trash2, variant: 'destructive', actionType: 'delete' },
    ],
  },
  error: {
    label: '错误',
    icon: XCircle,
    iconClassName: 'text-red-500',
    actions: [
      { label: '详细信息', icon: Info, variant: 'outline', actionType: 'view_details' },
      { label: '删除', icon: Trash2, variant: 'destructive', actionType: 'delete' },
    ],
  },
  building: {
    label: '构建中',
    icon: HardHat,
    iconClassName: 'text-blue-500',
    actions: [
      { label: '停止构建', icon: StopCircle, variant: 'outline', actionType: 'force_stop_build' },
    ],
  },
  pending: {
    label: '待处理',
    icon: Circle,
    iconClassName: 'text-yellow-500',
    actions: [
      { label: '构建', icon: Play,variant:'secondary', actionType: 'build' },
      { label: '详细信息', icon: Info, variant: 'outline', actionType: 'view_details' },
      { label: '删除', icon: Trash2, variant: 'destructive', actionType: 'delete' },
    ],
  },
  build_error: {
    label: '构建错误',
    icon: XCircle,
    iconClassName: 'text-red-500',
    actions: [
      { label: '详细信息', icon: Info, variant: 'outline', actionType: 'view_details' },
      { label: '删除', icon: Trash2, variant: 'destructive', actionType: 'delete' },
    ],
  },
  runtime_error: {
    label: '运行错误',
    icon: XCircle,
    iconClassName: 'text-red-500',
    actions: [
      { label: '详细信息', icon: Info, variant: 'outline', actionType: 'view_details' },
      { label: '删除', icon: Trash2, variant: 'destructive', actionType: 'delete' },
    ],
  },
}
