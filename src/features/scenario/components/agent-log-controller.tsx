import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAttackerAgentSession } from '@/hooks/use-ai'
import {
  useAttackerAgentLogs,
  useDefenderAgentLogs,
} from '@/hooks/use-log'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PillTabs } from '@/components/pill-tabs'
import Loading from '@/components/Loading'
import { AgentLog } from './agent-log'

type Props = {
  modelId: string
  className?: string
}

export const AgentLogController = ({ modelId, className }: Props) => {

  const {
    logs: attackerLogs,
    startLogs: startAttackerLogs,
    isStreaming: isAttackerStreaming,
  } = useAttackerAgentLogs(modelId)

  const {
    logs: defenderLogs,
    startLogs: startDefenderLogs,
    isStreaming: isDefenderStreaming,
  } = useDefenderAgentLogs(modelId)

  const { status: attackerAgentStatus ,statusQuery:attackerAgentStatusQuery} = useAttackerAgentSession(modelId)
  const [activeTab, setActiveTab] = useState('attacker-agent-log')
  const [isSessionReady, setIsSessionReady] = useState(false)
  useEffect(() => {
    // Determine if the agent session is ready.
    const isSessionReady = (attackerAgentStatusQuery.isSuccess && ! attackerAgentStatusQuery.isError && attackerAgentStatus?.initialized) ?? false
    setIsSessionReady(isSessionReady)
    if (isSessionReady) {
      if (
        activeTab === 'attacker-agent-log' &&
        !isAttackerStreaming &&
        attackerLogs.length === 0
      ) {
        startAttackerLogs({ user_id: modelId })
      } else if (
        activeTab === 'defender-agent-log' &&
        !isDefenderStreaming &&
        defenderLogs.length === 0
      ) {
        // Placeholder for starting defender logs.
        startDefenderLogs({ model_id: modelId });
      }
    }
  }, [activeTab, isAttackerStreaming, attackerLogs.length, startAttackerLogs, isDefenderStreaming, defenderLogs.length, startDefenderLogs, modelId, attackerAgentStatusQuery.isSuccess, attackerAgentStatusQuery.isError, attackerAgentStatus?.initialized])

  const activeLogs =
    activeTab === 'attacker-agent-log' ? attackerLogs : defenderLogs

  return (
    <Card className={cn('flex flex-col h-full w-full', className)}>
      <CardHeader className='flex h-10 flex-row items-center justify-between px-6 py-0 w-full'>
        <div className='w-full flex justify-center items-center'>
          <PillTabs
            tabs={[
              {
                id: 'attacker-agent-log',
                label: '攻击Agent日志',
              },
              {
                id: 'defender-agent-log',
                label: '防御Agent日志',
              },
            ]}
            defaultActiveId={activeTab}
            onTabChange={id => {
              setActiveTab(id)
            }}
            className='rounded-md justify-center items-center'
          />
        </div>
      </CardHeader>
      <CardContent className='flex-1 min-h-0 overflow-x-auto'>
        {isSessionReady? <AgentLog logs={activeLogs} />:<Loading/>}
      </CardContent>
    </Card>
  )
}
