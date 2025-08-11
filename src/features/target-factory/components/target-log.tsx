import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  MessagesSquare,
  Cog,
  Sparkles,
  Terminal,
  type LucideIcon,
  PauseCircle,
} from 'lucide-react'
import { useAgentStream, type AgentEvent } from '@/hooks/use-compose-agent'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type AggregatedEvent = {
  id: string
  type: 'think' | 'chat' | 'tool_args'
  step: number
  index?: number
  content: string
}

type DisplayItem = AgentEvent | AggregatedEvent

const KvRenderer: React.FC<{ data: object | string | null }> = ({ data }) => {
  if (data === null || data === undefined) {
    return <span className="text-muted-foreground">(null)</span>
  }
  if (typeof data !== 'object') {
    return <pre className="whitespace-pre-wrap font-mono">{String(data)}</pre>
  }
  if (Object.keys(data).length === 0) {
    return <em className="text-muted-foreground">(empty)</em>
  }

  return (
    <div className="font-mono text-xs bg-muted/50 p-2 rounded">
      <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

function getEventAppearance(item: DisplayItem): {
  Icon: LucideIcon
  color: string
  title: React.ReactNode
  content: React.ReactNode
} {
  switch (item.type) {
    case 'agent_start':
      return {
        Icon: Cpu,
        color: 'border-green-500',
        title: '会话开始',
        content: (
          <div className="space-y-1">
            <p>
              <Badge variant="outline">Session</Badge>
              <code className="ml-2">{item.data.session}</code>
            </p>
            <p>
              <Badge variant="outline">Description</Badge>
              <span className="ml-2">{item.data.description}</span>
            </p>
          </div>
        ),
      }
    case 'agent_finish':
      return {
        Icon: CheckCircle2,
        color: 'border-green-500',
        title: '会话完成',
        content: (
          <details open>
            <summary className="cursor-pointer">
              工作区：<strong>{item.data.result.name}</strong>
            </summary>
            <pre className="mt-2 p-2 bg-muted/50 rounded whitespace-pre-wrap font-mono text-xs">
              {item.data.result.readme}
            </pre>
          </details>
        ),
      }
    case 'agent_error':
      return {
        Icon: AlertCircle,
        color: 'border-red-500',
        title: '错误',
        content: (
          <div className="text-red-600 dark:text-red-400">
            <strong>{item.data.error}</strong>
            {item.data.details && (
              <details>
                <summary className="cursor-pointer">详情</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs">
                  {item.data.details}
                </pre>
              </details>
            )}
          </div>
        ),
      }
    case 'think':
      return {
        Icon: Sparkles,
        color: 'border-yellow-500',
        title: `思考 (Step ${item.step})`,
        content: (
          <p className="italic text-yellow-600 dark:text-yellow-400">
            {item.content}
          </p>
        ),
      }
    case 'chat':
      return {
        Icon: MessagesSquare,
        color: 'border-blue-500',
        title: `对话 (Step ${item.step})`,
        content: <p className="text-blue-600 dark:text-blue-400">{item.content}</p>,
      }
    case 'tool_prep':
      return {
        Icon: Cog,
        color: 'border-purple-500',
        title: `准备工具 (Step ${item.data.step}, #${item.data.index})`,
        content: (
          <p>
            工具：<strong>{item.data.name}</strong>
          </p>
        ),
      }
    case 'tool_args':
      return {
        Icon: Cog,
        color: 'border-purple-500',
        title: `工具参数 (Step ${item.step}, #${item.index})`,
        content: (
          <p className="text-muted-foreground font-mono text-xs">
            {item.content}
          </p>
        ),
      }
    case 'tool_call':
      return {
        Icon: Terminal,
        color: 'border-purple-500',
        title: `调用工具 (Step ${item.data.step})`,
        content: (
          <div>
            <p>
              工具：<strong>{item.data.name}</strong>
            </p>
            <details className="mt-1">
              <summary className="cursor-pointer">参数</summary>
              <KvRenderer data={item.data.arguments} />
            </details>
          </div>
        ),
      }
    case 'tool_result':
      return {
        Icon: Terminal,
        color: 'border-purple-500',
        title: `工具输出 (Step ${item.data.step})`,
        content: <KvRenderer data={typeof item.data.output === 'string' || item.data.output === null ? item.data.output : (item.data.output as object)} />,
      }
    case 'token_usage':
      return {
        Icon: CheckCircle2,
        color: 'border-green-400',
        title: `Token 统计 (Step ${item.data.step})`,
        content: (
          <div className="flex gap-4 text-xs">
            <span>
              Prompt: <strong>{item.data.usage.prompt}</strong>
            </span>
            <span>
              Completion: <strong>{item.data.usage.completion}</strong>
            </span>
            <span>
              Total: <strong>{item.data.usage.total}</strong>
            </span>
          </div>
        ),
      }
    case '__end__':
      return {
        Icon: CheckCircle2,
        color: 'border-gray-500',
        title: '结束',
        content: <p className="text-muted-foreground">流已结束</p>,
      }
    default:
      return {
        Icon: AlertCircle,
        color: 'border-gray-400',
        title: '未知事件',
        content: (
          <pre className="text-xs">
            {JSON.stringify(item, null, 2)}
          </pre>
        ),
      }
  }
}

const LogItem: React.FC<{ item: DisplayItem }> = ({ item }) => {
  const { Icon, color, title, content } = getEventAppearance(item)
  const timestamp = new Date().toLocaleTimeString()

  return (
    <div className={cn('p-3 rounded-lg border-l-4 bg-card shadow-sm', color)}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className="h-5 w-5" />
        <span className="font-semibold text-sm">{title}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {timestamp}
        </span>
      </div>
      <div className="pl-8 text-sm">{content}</div>
    </div>
  )
}

export const TargetLog: React.FC = () => {
  const { logs, stopStream, isConnected } = useAgentStream()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const idleTimerRef = useRef<number | null>(null)

  const displayItems = useMemo(() => {
    const items: DisplayItem[] = []
    const streams = new Map<string, AggregatedEvent>()

    for (const event of logs) {
      if (
        event.type === 'think_stream' ||
        event.type === 'chat_stream' ||
        event.type === 'tool_args_stream'
      ) {
        const isToolArgs = event.type === 'tool_args_stream'
        const streamType = isToolArgs
          ? 'tool_args'
          : (event.type.split('_')[0] as 'think' | 'chat')
        const key = `${streamType}-${event.data.step}${isToolArgs ? `-${event.data.index}` : ''}`

        let stream = streams.get(key)
        if (stream) {
          stream.content += event.data.chunk
        } else {
          stream = {
            id: key,
            type: streamType,
            step: event.data.step,
            index: isToolArgs ? event.data.index : undefined,
            content: event.data.chunk,
          }
          streams.set(key, stream)
          items.push(stream)
        }
      } else {
        items.push(event)
      }
    }
    return items
  }, [logs])

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom()
    }
  }, [displayItems, autoScroll, scrollToBottom])

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current)
      }

      const isAtBottom =
        scrollElement.scrollHeight -
          scrollElement.scrollTop -
          scrollElement.clientHeight <
        10

      if (isAtBottom) {
        setAutoScroll(true)
      } else {
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
    <div className="relative h-full w-full">
      <div
        ref={scrollRef}
        className="h-full w-full overflow-y-auto p-4 space-y-4 bg-background"
      >
        {displayItems.map((item, index) => {
          const key = 'id' in item ? item.id : `${index}-${item.type}`
          return <LogItem key={key} item={item} />
        })}
        {logs.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">等待接收事件日志...</p>
          </div>
        )}
      </div>
      {isConnected && (
        <div className="absolute bottom-4 right-4">
          <Button
            variant="destructive"
            size="icon"
            onClick={stopStream}
            className="rounded-full shadow-lg hover:bg-destructive/10 hover:text-destructive"
          >
            <PauseCircle className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  )
}
