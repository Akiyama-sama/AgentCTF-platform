import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAttackerAgentSession } from '@/hooks/use-ai'
import { useAttackerAgentLogs } from '@/hooks/use-log'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Log from '@/components/log'
import { PillTabs } from '@/components/pill-tabs'

type Props = {
  modelId: string
  className?: string
}

export const AgentLogController = ({ modelId, className }: Props) => {
  const { logs: attackerLogs, startLogs: startAttackerLogs } =
    useAttackerAgentLogs()
  const { status } = useAttackerAgentSession(modelId)
  const [activeTab, setActiveTab] = useState('attacker-agent-log')

  useEffect(() => {
    if (status && status.initialized) {
      startAttackerLogs({
        user_id: modelId,
      })
    }
  }, [status])
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
          onTabChange={(id) => {
            setActiveTab(id)
          }}
          className='rounded-md justify-center items-center'
        />
        </div>
      </CardHeader>
      <CardContent className='flex-1 min-h-0 overflow-x-auto'>
        <Log logs={attackerLogs} className='text-sm'/>
      </CardContent>
    </Card>
  )
}
