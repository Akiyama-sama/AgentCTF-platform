import { Download, PlusCircle, Server, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAgentStream, useDownloadWorkspace, useWorkspaces } from '@/hooks/use-compose-agent'
import { Button } from '@/components/ui/button'
import { useTargetDialog } from '../context/target-context'
import { showSuccessMessage } from '@/utils/show-submitted-data.tsx'

interface TargetsContainerProps {
  className?: string
  onSelectTarget: (name: string) => void
  selectedTarget: string | null
}

export function TargetsContainer({
  className,
  onSelectTarget,
  selectedTarget,
}: TargetsContainerProps) {
  const { workspaces, isLoading } = useWorkspaces()
  const {isConnected} = useAgentStream()
  const { setOpen } = useTargetDialog()

  return (
    <div
      className={cn(
        'bg-background-inset h-full rounded-lg border p-4',
        className
      )}
    >
      <div className='mb-4 flex flex-col items-start justify-between'>
        <div className='flex w-full justify-between'>
        <h3 className='text-lg font-semibold'>靶机仓库</h3>
        <Button size='sm' onClick={() => setOpen('create')} disabled={isConnected}>
          创建靶机
          <PlusCircle size={16} className='mr-2' />
        </Button>
        </div>
        <p className='text-sm text-muted-foreground'>
          当前SSE连接状态: {isConnected ? '已连接' : '未连接'}
        </p>
        <p className='text-xs text-muted-foreground'> 
          处于性能考虑，日志将不会被持久化存储
        </p>
      </div>
      <div className='no-scrollbar h-[calc(100%-52px)] overflow-auto mb-4 flex flex-col justify-between'>
        {isLoading ? (
          <p className='text-muted-foreground'>加载中...</p>
        ) : workspaces && workspaces.length > 0 ? (
          <ul>
            {workspaces.map((targetName: string) => (
              <TargetListItem
                key={targetName}
                name={targetName}
                isSelected={selectedTarget === targetName}
                onSelect={onSelectTarget}
              />
            ))}
          </ul>
        ) : (
          <div className='flex h-full items-center justify-center text-center'>
            <p className='text-muted-foreground'>
              没有可用的靶机. <br />
              请点击上方按钮创建一个。
            </p>
          </div>
        )}
       {/* {isConnected && <Button
          variant='destructive'
          size='sm'
          onClick={() => stopStream()}
          className='w-fit self-end mb-8'
          disabled={!isConnected}
        >
          停止生成
          <StopCircle size={16} className='ml-2' />
        </Button>
        } */}
      </div>
      
    </div>
  )
}

function TargetListItem({
  name,
  isSelected,
  onSelect,
}: {
  name: string
  isSelected: boolean
  onSelect: (name: string) => void
}) {
  const { setOpen, setCurrentRow } = useTargetDialog()
  const { download } = useDownloadWorkspace(name)
  // Placeholder for download logic
  const handleDownload = () => {
    download().then(() => {
      showSuccessMessage(`动态靶机 "${name}" 已下载.`)
    })
  }

  return (
    <li
      className={cn(
        'group hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-md p-2',
        isSelected && 'bg-muted'
      )}
      onClick={() => onSelect(name)}
    >
      <div className='flex items-center'>
        <Server
          className={cn(
            'mr-3 size-5',
            isSelected ? 'text-primary' : 'text-muted-foreground'
          )}
        />
        <span className='font-medium'>{name}</span>
      </div>
      <div className='hidden items-center group-hover:flex'>
        <Button
          variant='ghost'
          size='icon'
          className='size-7'
          onClick={(e) => {
            e.stopPropagation()
            setCurrentRow(name)
            handleDownload()
          }}
        >
          <Download size={14} />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='size-7 text-red-500 hover:text-red-600'
          onClick={() => {
            setCurrentRow(name)
            setOpen('delete')
          }}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </li>
  )
}
