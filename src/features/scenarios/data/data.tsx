import {
  Circle,
  CircleDot,
  HardHat,
  Hourglass,
  Info,
  Play,
  StopCircle,
  Trash2,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import React from 'react'
import { ScenarioAction, ScenarioState } from '../../../types/docker-manager'

export type ActionType = ScenarioAction | 'delete' | 'view_details'|'enter'

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

export const scenarioStateConfig: Record<ScenarioState, StateConfig> = {
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
    component: () => <p className="text-sm text-muted-foreground">正在构建环境...</p>,
  },
  removing: {
    label: '删除中',
    icon: Hourglass,
    iconClassName: 'text-gray-500',
    component: () => <p className="text-sm text-muted-foreground">正在删除...</p>,
  },
  pending: {
    label: '待处理',
    icon: Circle,
    iconClassName: 'text-yellow-500',
    actions: [
      { label: '开始构建', icon: Play,variant:'secondary', actionType: 'build' },
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
