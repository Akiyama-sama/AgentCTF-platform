import { cn } from '@/lib/utils'
import { type LogDisplayItem } from '@/types/sse'
import { useEffect, useRef } from 'react'
import { ScrollArea } from './ui/scroll-area'

type LogProps = {
  logs: LogDisplayItem[]
  className?: string
}

const Log = ({ logs, className }: LogProps) => {
  const endOfLogsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (endOfLogsRef.current) {
      endOfLogsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'center'
      })
    }
  }, [logs])

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
    <ScrollArea
      className={cn(
        'bg-card text-foreground font-inter text-sm p-4 rounded-lg ',
        className
      )}
    >
      <div className="space-y-1">
        {logs.map((log, index) => (
          <div
            key={index}
            className="grid grid-cols-[auto_auto_1fr] items-baseline gap-x-2"
          >
            <span className={cn('font-bold', getLevelColor(log.level))}>
              [{log.level?.toUpperCase()}]
            </span>
            <p className="whitespace-pre-wrap break-words min-w-0">
              {log.message}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center pt-2">
        <span className="text-muted-foreground/70 mr-2 select-none">{'>'}</span>
        <div className="w-2 h-3 bg-primary animate-pulse" />
      </div>
      <div ref={endOfLogsRef} />
    </ScrollArea>
  )
}

Log.displayName = 'Log'

export default Log
