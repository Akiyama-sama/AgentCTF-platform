import { useEffect, useState } from 'react'
import { SSELogLevel } from '@/types/sse'
import { Copy, Info } from 'lucide-react'
import { useContainerLogs } from '@/hooks/use-log'
import { useScenarioContainers } from '@/hooks/use-scenario'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import Loading from '@/components/Loading'
import Log from '@/components/log'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { showSuccessMessage } from '@/utils/show-submitted-data'
import { containerTabs, logLevelOptions, type ContainerType } from '../data/data'

type Props = {
  modelId: string
}

export const LogController = ({ modelId }: Props) => {
  const {
    portMap,
    ipAddressMap,
    statusMap,
    attackerContainerName,
    defenderContainerName,
    targetContainerName,
    isLoading,
  } = useScenarioContainers(modelId)

  const { containerLogs, createContainerConnection, closeContainerConnection } = useContainerLogs()
  const [logLevel, setLogLevel] = useState<SSELogLevel | 'ALL'>('ALL')
  const [selectedContainer, setSelectedContainer] =
    useState<ContainerType>('attacker')

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
    return () => {
      if (attackerContainerName) {
        closeContainerConnection(modelId, attackerContainerName)
      }
      if (defenderContainerName) {
        closeContainerConnection(modelId, defenderContainerName)
      }
      if (targetContainerName) {
        closeContainerConnection(modelId, targetContainerName)
      }
    }
  }, [
    modelId,
    attackerContainerName,
    defenderContainerName,
    targetContainerName,
    createContainerConnection,
    closeContainerConnection,
  ])

  const containerNameMap: Record<ContainerType, string | undefined> = {
    attacker: attackerContainerName,
    defender: defenderContainerName,
    target: targetContainerName,
  }

  const selectedContainerName = containerNameMap[selectedContainer]
  const selectedContainerLogId = selectedContainerName
    ? `${modelId}-${selectedContainerName}`
    : ''

  const logs = containerLogs[selectedContainerLogId]?.logs ?? []
  const filteredLogs = logs.filter((log) => {
    if (logLevel === 'ALL') return true
    return log.level === logLevel
  })
  const state =
    containerLogs[selectedContainerLogId]?.connectionState ?? 'Waiting...'

  if (isLoading) {
    return (
      <Card className='flex h-full w-full items-center justify-center p-4 shadow-xs'>
        <Loading />
      </Card>
    )
  }

  const renderContainerInfo = () => {
    if (!selectedContainerName) return null

    const status = statusMap.get(selectedContainerName)
    const ipAddress = ipAddressMap.get(selectedContainerName)
    const ports = portMap.get(selectedContainerName)

    return (
      <div className='text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-sm'>
        <p>
          <span className='font-semibold'>状态:</span> {status?.status ?? 'N/A'}
        </p>
        <p>
          <span className='font-semibold'>运行时间:</span>{' '}
          {status?.runningTime ?? 'N/A'} 分钟
        </p>
        <p>
          <span className='font-semibold'>IP:</span> {ipAddress ?? 'N/A'}
        </p>
        <p>
          <span className='font-semibold'>MCP 端口:</span>{' '}
          {ports?.mcpPort ?? 'N/A'}
        </p>
        <p>
          <span className='font-semibold'>SSH 端口:</span>{' '}
          {ports?.sshPort ?? 'N/A'}
        </p>
        <p>
          <span className='font-semibold'>SSE 状态:</span> {state}
        </p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Card className='bg-card text-card-foreground flex h-full w-full flex-col rounded-md shadow-xs py-0'>
        <Tabs
          value={selectedContainer}
          onValueChange={(value) => setSelectedContainer(value as ContainerType)}
          className='flex h-full w-full flex-col'
        >
          <div className='border-border bg-background flex items-center justify-between border-b p-2'>
            <TabsList className='grid w-fit grid-cols-3'>
              {containerTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className='flex items-center gap-2'>
              <Select
                value={logLevel}
                onValueChange={(value) =>
                  setLogLevel(value as SSELogLevel | 'ALL')
                }
              >
                <SelectTrigger className='w-[120px]'>
                  <SelectValue placeholder='Log level' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {logLevelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => {
                      if (!selectedContainerName) return
                      navigator.clipboard.writeText(selectedContainerName)
                      showSuccessMessage('容器名已复制')
                    }}
                    disabled={!selectedContainerName}
                  >
                    <Copy size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>复制容器名</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    disabled={!selectedContainerName}
                  >
                    <Info size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>查看详情</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className='flex-1 overflow-y-auto'>
            {containerTabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className='h-full w-full'
              >
                {state === 'connecting' && logs.length === 0 ? (
                  <div className='flex h-full items-center justify-center'>
                    <Loading />
                  </div>
                ) : (
                  <Log logs={filteredLogs} className='h-full p-2' />
                )}
              </TabsContent>
            ))}
          </div>
          <div className='border-border bg-background border-t p-3'>
            {renderContainerInfo()}
          </div>
        </Tabs>
      </Card>
    </TooltipProvider>
  )
}
