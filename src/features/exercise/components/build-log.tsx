
import Log from "@/components/log"
import { LogDisplayItem } from "@/types/sse"
import { IconTerminal2 } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

export function BuildLog({
  logs,
  isBuilding,
  className,
}: {
  logs: LogDisplayItem[]
  isBuilding: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border bg-card p-4 shadow-sm w-full',
        className
      )}
    >
      <h3 className='mb-2 flex items-center text-lg font-semibold'>
        <IconTerminal2 className='mr-2' />
        构建日志
        {isBuilding && (
          <span className='ml-3 animate-pulse text-sm text-primary'>
            正在构建演练镜像...
          </span>
        )}
      </h3>
      <div className='flex-1 overflow-hidden'>
        <Log logs={logs} className='w-full h-full' />
      </div>
    </div>
  )
}