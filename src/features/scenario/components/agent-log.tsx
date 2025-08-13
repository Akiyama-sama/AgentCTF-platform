import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  AlertTriangle,
  Bug,
  Info,
  ShieldAlert,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LogDisplayItem, SSELogLevel } from '@/types/sse'
import { Badge } from '@/components/ui/badge'

/**
 * 根据日志级别获取对应的视觉表现。
 * 设计原则：颜色和图标需直观反映信息的严重程度，帮助用户快速筛选。
 * @param level 日志级别
 * @returns 包含图标、颜色和级别名称的对象
 */
function getLogLevelAppearance(level: SSELogLevel): {
  Icon: LucideIcon
  color: string
  levelName: string
} {
  switch (level) {
    case 'INFO':
      return { Icon: Info, color: 'border-blue-500', levelName: '信息' }
    case 'DEBUG':
      return { Icon: Bug, color: 'border-gray-400', levelName: '调试' }
    case 'WARNING':
      return {
        Icon: AlertTriangle,
        color: 'border-yellow-500',
        levelName: '警告',
      }
    case 'ERROR':
      return { Icon: XCircle, color: 'border-red-500', levelName: '错误' }
    case 'CRITICAL':
      return { Icon: ShieldAlert, color: 'border-red-700', levelName: '严重' }
    default:
      // 默认情况也应有明确的视觉反馈，避免混淆。
      return { Icon: Info, color: 'border-gray-300', levelName: '未知' }
  }
}

/**
 * 单条日志的渲染组件。
 * 设计原则：布局清晰，元素对齐，关键信息（级别、时间戳）一目了然。
 * 使用等宽字体展示日志内容，保证格式的准确性。
 * 对过长的日志进行折叠处理，尊重用户的屏幕空间。
 */
const LogItem: React.FC<{ item: LogDisplayItem }> = ({ item }) => {
  const { Icon, color, levelName } = getLogLevelAppearance(item.level)
  const [isExpanded, setIsExpanded] = useState(false)

  // 定义长消息的阈值：超过7行或500个字符
  const lineCount = (item.message.match(/\n/g) || []).length + 1
  const isLongMessage = lineCount > 7 || item.message.length > 500

  // 为预览截断长消息，显示前5行
  const truncatedMessage =
    item.message.split('\n').slice(0, 5).join('\n') + '\n...'
  const displayMessage =
    isLongMessage && !isExpanded ? truncatedMessage : item.message

  return (
    <div className={cn('p-3 rounded-lg border-l-4 bg-card shadow-sm', color)}>
      <div className='flex items-center gap-3 mb-2'>
        <Icon className='h-5 w-5 flex-shrink-0' />
        <span className='font-semibold text-sm'>{levelName}</span>
        {item.type === 'history' && (
          <Badge variant='outline' className='text-xs font-normal'>
            历史记录
          </Badge>
        )}
        <span className='text-xs text-muted-foreground ml-auto'>
          {new Date(item.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div className='pl-8 text-sm break-words'>
        <p className='whitespace-pre-wrap  text-xs'>{displayMessage}</p>
        {isLongMessage && (
          <button
            type='button'
            onClick={() => setIsExpanded(e => !e)}
            className='mt-2 text-sm font-semibold text-blue-500 hover:underline focus:outline-none'
          >
            {isExpanded ? '收起' : '展开'}
          </button>
        )}
      </div>
    </div>
  )
}

export interface AgentLogProps {
  logs: LogDisplayItem[]
}

/**
 * Agent日志显示组件。
 * 设计原则：滚动行为必须符合直觉，不干扰用户操作。
 * 组件内部管理滚动状态，将其副作用严格限制在组件内。
 */
export const AgentLog: React.FC<AgentLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const idleTimerRef = useRef<number | null>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom()
    }
  }, [logs, autoScroll, scrollToBottom])

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current)
      }

      // 滚动条距离底部的距离，小于10px视为在底部。
      const isAtBottom =
        scrollElement.scrollHeight -
          scrollElement.scrollTop -
          scrollElement.clientHeight <
        10

      if (isAtBottom) {
        setAutoScroll(true)
      } else {
        // 用户主动滚动后，禁用自动滚动，并在5秒无操作后恢复。
        // 这是对用户控制权的尊重。
        setAutoScroll(false)
        idleTimerRef.current = window.setTimeout(() => {
          setAutoScroll(true)
        }, 5000)
      }
    }

    scrollElement.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll)
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current)
      }
    }
  }, [scrollToBottom])

  return (
    // 使用相对定位和`h-full/w-full`确保组件尺寸由父级决定，
    // 而内部滚动由自身`overflow-y-auto`控制。这是封装性的体现。
    <div className="relative h-full w-full bg-background">
      <div
        ref={scrollRef}
        className="h-full w-full overflow-y-auto p-4 space-y-4"
      >
        {logs.map(log => (
          <LogItem key={log.id} item={log} />
        ))}
        {logs.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">等待接收日志...</p>
          </div>
        )}
      </div>
    </div>
  )
}
