import { useEffect, useState } from 'react'
import { Copy, Trash } from 'lucide-react'
import { useContainerLogs } from '@/hooks/use-log'
import { useScenarioContainers } from '@/hooks/use-scenario'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import Loading from '@/components/Loading'
import Log from '@/components/log'

type Props = {
  modelId: string
}

export const LogController = ({ modelId }: Props) => {
  const {
    portMap,
    attackerContainerName,
    defenderContainerName,
    targetContainerName,
    isLoading,
  } = useScenarioContainers(modelId)

  const { containerLogs, createContainerConnection } = useContainerLogs()

  const [selectedLogName, setSelectedLogName] = useState<
    'attacker' | 'defender' | 'target'
  >('attacker')

  useEffect(() => {
    if (attackerContainerName) {
      createContainerConnection(modelId, attackerContainerName)
    }
    if (defenderContainerName) {
      createContainerConnection(modelId, defenderContainerName)
    }
    if (targetContainerName) {
      createContainerConnection(modelId, targetContainerName)
    }
  }, [
    modelId,
    attackerContainerName,
    defenderContainerName,
    targetContainerName,
    createContainerConnection,
  ])
  const containerNameSet = {
    attacker: attackerContainerName,
    defender: defenderContainerName,
    target: targetContainerName,
  }
  const containerIdSet = {
    attacker: attackerContainerName ? `${modelId}-${attackerContainerName}` : '',
    defender: defenderContainerName ? `${modelId}-${defenderContainerName}` : '',
    target: targetContainerName ? `${modelId}-${targetContainerName}` : '',
  }
  const selectedContainerId = containerIdSet[selectedLogName]
  const logData = containerLogs[selectedContainerId]

  const logs = logData?.logs ?? []
  const state = logData?.connectionState ?? 'Waiting...'

  if (isLoading) {
    return (
      <Card className='flex h-full w-full items-center justify-center p-4 shadow-xs'>
        <Loading />
      </Card>
    )
  }

  return (
    <Card className='bg-card text-card-foreground flex h-full w-full flex-col rounded-md p-0 shadow-xs'>
      <div className='border-border bg-background flex flex-row items-center gap-3 border-b p-2'>
        <Input
          placeholder='Filter logs'
          className='bg-input border-border focus:ring-ring flex-1'
        />
        <Select>
          <SelectTrigger className='w-[120px]'>
            <SelectValue placeholder='Log level' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All</SelectItem>
            <SelectItem value='info'>Info</SelectItem>
            <SelectItem value='warn'>Warning</SelectItem>
            <SelectItem value='error'>Error</SelectItem>
          </SelectContent>
        </Select>
        <button className='hover:bg-muted rounded-md p-2'>
          <Copy size={18} />
        </button>
        <button className='hover:bg-muted text-destructive rounded-md p-2'>
          <Trash size={18} />
        </button>
      </div>

      <div className='flex-1 min-h-30'>
        {state === 'connecting' && logs.length === 0 ? (
          <div className='flex h-full items-center justify-center'>
            <Loading />
          </div>
        ) : (
          <Log logs={logs} className='h-full px-2 py-0' />
        )}
      </div>

      <div className='border-border bg-background flex h-14 flex-row items-center justify-between border-t p-2'>
        <Select
          value={selectedLogName}
          onValueChange={(value) => {
            setSelectedLogName(value as 'attacker' | 'defender' | 'target')
          }}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select log' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value='attacker'>攻击机日志</SelectItem>
              <SelectItem value='defender'>防御机日志</SelectItem>
              <SelectItem value='target'>靶机日志</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className='flex flex-row items-center gap-2'>
        <div className='text-muted-foreground text-sm'>
          <p>MCP Port: {portMap.get(containerNameSet[selectedLogName]!)?.mcpPort}-2222</p>
          <p>SSH Port: {portMap.get(containerNameSet[selectedLogName]!)?.sshPort}-8000</p>
        </div>
        <div className='text-muted-foreground text-sm'>
          
          <p>Status: {state}</p>
        </div>
        </div>
        
      </div>
    </Card>
  )
}