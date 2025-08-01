import { useEffect } from 'react'
import { BaseState } from '@/types/docker-manager'
import { useScenario } from '@/hooks/use-scenario'
import { Card } from '@/components/ui/card'
import { useSidebar } from '@/components/ui/sidebar'
import { TextScroll } from '@/components/ui/text-scroll'
import { Main } from '@/components/layout/main'
import TopologyMap from '@/components/topology-map'
import { ScenarioFileDialogs } from '../scenarios/components/scenario-file-dialogs'
import { ScenariosDialogs } from '../scenarios/components/scenarios-dialogs'
import ScenariosDialogProvider from '../scenarios/context/scenarios-context'
import { AgentLogController } from './components/agent-log-controller'
import { ChatBot } from './components/chat-bot'
import { LogController } from './components/log-controller'

interface ScenarioDetailProps {
  scenarioId: string
}

const ScenarioView = ({ scenarioId }: { scenarioId: string }) => {
  const { scenario } = useScenario(scenarioId)
  const { status } = useScenario(scenarioId)

  if (!scenario) {
    return (
      <div className='text-muted-foreground p-4 text-center'>场景加载中...</div>
    )
  }

  if (status) scenario.state = status.state as BaseState

  return (
    <div className='flex h-screen flex-col overflow-y-auto'>
      {/* ===== Top Heading ===== */}

      {/* ===== Content ===== */}
      <Main className='h-screen'>
        <div className='flex h-full w-full gap-2'>
          <div className='w-1/3'>
            <ChatBot
              scenarioId={scenarioId}
              className='h-3/5 w-full pt-0'
            />
            <AgentLogController
              modelId={scenarioId}
              className='flex h-2/5 w-full flex-col'
            />
          </div>
          <Card className='mt-0 flex w-2/3 flex-col p-4'>
            <div className='h-2/3 w-full p-10'>
              <TextScroll
                text='TARGET SAFE'
                className='text-2xl text-green-600'
              />
              <TopologyMap />
              <TextScroll
                text='TARGET SAFE'
                className='text-2xl text-green-600'
              />
            </div>
            <div className='flex h-1/3 w-full flex-col gap-2'>
              <LogController modelId={scenarioId} />
            </div>
          </Card>
        </div>
      </Main>
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
