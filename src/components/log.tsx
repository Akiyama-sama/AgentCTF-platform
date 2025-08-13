import { cn } from '@/lib/utils'
import { type LogDisplayItem } from '@/types/sse'
import { useEffect, useRef, useState, useCallback } from 'react'

type LogProps = {
  logs: LogDisplayItem[]
  className?: string
}

const Log = ({ logs, className }: LogProps) => {
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

  const getLevelColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'INFO':
        return 'text-primary'
      case 'DEBUG':
        return 'text-muted-foreground'
      case 'WARNING':
        return 'text-yellow-400'
      case 'ERROR':
        return 'text-destructive'
      case 'CRITICAL':
        return 'text-destructive font-bold animate-pulse'
      default:
        return 'text-primary'
    }
  }

  return (
    <div
      ref={scrollRef}
      className={cn(
        'bg-card text-foreground font-inter text-sm p-4 rounded-lg overflow-y-scroll',
        className,
      )}
    >
      <div className='space-y-1'>
        {logs.map((log, index) => (
          <div
            key={index}
            className='grid grid-cols-[auto_auto_1fr] items-baseline gap-x-2'
          >
            <span className={cn('font-bold', getLevelColor(log.level))}>
              [{log.level?.toUpperCase()}]
            </span>
            <p className='whitespace-pre-wrap break-words min-w-0'>
              {log.message}
            </p>
          </div>
        ))}
      </div>
      <div className='flex items-center pt-2'>
        <span className='text-muted-foreground/70 mr-2 select-none'>{'>'}</span>
        <div className='w-2 h-3 bg-primary animate-pulse' />
      </div>
    </div>
  )
}

Log.displayName = 'Log'

export default Log
