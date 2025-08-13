import { useEffect } from 'react'
import { BaseState } from '@/types/docker-manager'
import { useScenario } from '@/hooks/use-scenario'
import { Card } from '@/components/ui/card'
import { useSidebar } from '@/components/ui/sidebar'
import { TextScroll } from '@/components/ui/text-scroll'
import { ScenarioFileDialogs } from '../scenarios/components/scenario-file-dialogs'
import { ScenariosDialogs } from '../scenarios/components/scenarios-dialogs'
import ScenariosDialogProvider from '../scenarios/context/scenarios-context'
import { AgentLogController } from './components/agent-log-controller'
import { ChatBot } from './components/chat-bot'
import { LogController } from './components/container-log-controller'
import ScenarioProcessLine from './components/scenario-process-line'
import { useProcess } from './store/process-store'

interface ScenarioDetailProps {
  scenarioId: string
}

const ScenarioView = ({ scenarioId }: { scenarioId: string }) => {
  const { status, scenario } = useScenario(scenarioId)
  const { scenarioProcessState } = useProcess()
  const isAttackStarted = scenarioProcessState.isAttackStarted

  if (!scenario) {
    return (
      <div className='text-muted-foreground p-4 text-center'>场景加载中...</div>
    )
  }

  if (status) scenario.state = status.state as BaseState

  return (
    <div
      className={`flex ${isAttackStarted ? 'h-[175vh]' : 'h-screen'} flex-col transition-all duration-700 ease-in-out`}
    >
      {/* ===== Content ===== */}
      <div className='h-screen flex-shrink-0'>
        <div className='flex h-full w-full gap-2'>
          <div className='w-1/3'>
            <ChatBot scenarioId={scenarioId} className='h-full w-full' />
          </div>
          <Card className='flex h-full w-2/3 flex-col py-0'>
            <div className='flex h-2/3 w-full flex-col gap-2 p-10'>
              <ScenarioProcessLine
                scenarioId={scenarioId}
                className='mt-0 h-1/2'
              />
              <TextScroll
                text='TARGET SAFE'
                className='text-2xl text-green-600'
              />
            </div>
            <div className='flex h-2/5 w-full flex-col gap-2 rounded-b-lg'>
              <LogController modelId={scenarioId} />
            </div>
          </Card>
        </div>
      </div>
      {isAttackStarted && (
        <AgentLogController modelId={scenarioId} className='h-[75vh] flex-col' />
      )}
    </div>
  )
}

const ScenarioDetail = ({ scenarioId }: ScenarioDetailProps) => {
  const { scenario } = useScenario(scenarioId)
  const { open, setOpen } = useSidebar()

  useEffect(() => {
    if (open) {
      setOpen(false)
    }
    return () => {
      if (!open) {
        setOpen(true)
      }
    }
  }, [open, setOpen])

  if (!scenario) {
    return (
      <div className='text-muted-foreground p-4 text-center'>场景未找到。</div>
    )
  }

  return (
    <ScenariosDialogProvider>
      <ScenarioView scenarioId={scenarioId} />
      <ScenariosDialogs />
      <ScenarioFileDialogs />
    </ScenariosDialogProvider>
  )
}

export default ScenarioDetail
