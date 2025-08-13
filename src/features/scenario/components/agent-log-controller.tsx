import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAttackerAgentSession } from '@/hooks/use-ai'
import { useAttackerAgentLogs, useDefenderAgentLogs } from '@/hooks/use-log'
import { Card } from '@/components/ui/card'
import { PillTabs } from '@/components/pill-tabs'
import Loading from '@/components/Loading'
import { AgentLog } from './agent-log'
import { useProcess } from '../store/process-store'


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
  const {scenarioProcessState}=useProcess()
  const {
    logs: defenderLogs,
    startLogs: startDefenderLogs,
    isStreaming: isDefenderStreaming,
  } = useDefenderAgentLogs(modelId)

  const { status: attackerAgentStatus, statusQuery: attackerAgentStatusQuery } =
    useAttackerAgentSession(modelId)
  const [activeTab, setActiveTab] = useState('attacker-agent-log')
  const [isSessionReady, setIsSessionReady] = useState(false)
  
  useEffect(() => {
    const sessionReady =
      attackerAgentStatusQuery.isSuccess &&
      !attackerAgentStatusQuery.isError &&
      attackerAgentStatus?.initialized && !scenarioProcessState.isAttackFinished
    setIsSessionReady(sessionReady || false)
    if (sessionReady) {
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
        startDefenderLogs({ model_id: modelId })
      }
    }
  }, [
    activeTab,
    isAttackerStreaming,
    attackerLogs.length,
    startAttackerLogs,
    isDefenderStreaming,
    defenderLogs.length,
    startDefenderLogs,
    modelId,
    attackerAgentStatusQuery.isSuccess,
    attackerAgentStatusQuery.isError,
    attackerAgentStatus?.initialized,
    scenarioProcessState.isAttackFinished
  ])
  if(scenarioProcessState.isAttackFinished){
    return <div className='flex h-full w-full items-center justify-center'>
      <p className='text-lg text-primary'>攻击已结束，指挥官可以与攻击Agent对话，或者直接开始生成报告</p>
    </div>
  }
  const activeLogs =
    activeTab === 'attacker-agent-log'
      ? attackerLogs.slice(-25)
      : defenderLogs.slice(-25)

  return (
    <Card
      className={cn(
        'flex h-full w-full flex-col shadow-lg rounded-xl',
        className,
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Agent实时日志</h2>
        <PillTabs
          tabs={[
            {
              id: 'attacker-agent-log',
              label: '攻击方',
            },
            {
              id: 'defender-agent-log',
              label: '防御方',
            },
          ]}
          defaultActiveId={activeTab}
          onTabChange={setActiveTab}
          // 每个实例使用唯一的 layoutId
          layoutId={`agent-log-controller-tabs`}
        />
      </div>
      <div className="flex-1 min-h-0 p-2">
        {isSessionReady ? (
          <AgentLog logs={activeLogs} />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Loading />
          </div>
        )}
      </div>
    </Card>
  )
}
