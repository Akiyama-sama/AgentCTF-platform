
import {
    Circle,
    CircleDot,
    HardHat,
    Info,
    LucideIcon,
    Play,
    StopCircle,
    Trash2,
    XCircle,
    Flag,
  } from 'lucide-react'
  import { BaseState, ModelAction } from '@/types/docker-manager'
export type ActionType = ModelAction | 'delete' | 'view_details'|'submit_flag'|'force_stop_build'|'check_report'

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


export const exerciseStateConfig: Record<BaseState, StateConfig> = {
    running: {
      label: '运行中',
      icon: CircleDot,
      iconClassName: 'text-green-500',
      actions: [
        { label: '进入靶机', icon: Flag, variant: 'default', actionType: 'submit_flag' },
        { label: '停止', icon: StopCircle, variant: 'destructive', actionType: 'stop' },
        { label: '查看报告', icon: Flag, variant: 'link', actionType: 'check_report' },
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