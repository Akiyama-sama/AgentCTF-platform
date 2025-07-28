import { useEffect, useState } from 'react'
import { BaseState } from '@/types/docker-manager'
import { useScenarioBuildLogs } from '@/hooks/use-log'
import { useScenario, useScenarioContainers } from '@/hooks/use-scenario'
import { Card } from '@/components/ui/card'
import { useSidebar } from '@/components/ui/sidebar'
import { TextScroll } from '@/components/ui/text-scroll'
import Loading from '@/components/Loading'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PillTabs } from '@/components/pill-tabs'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import TopologyMap from '@/components/topology-map'
import { ScenarioFileDialogs } from '../scenarios/components/scenario-file-dialogs'
import { ScenariosDialogs } from '../scenarios/components/scenarios-dialogs'
import ScenariosDialogProvider from '../scenarios/context/scenarios-context'
import { useScenarioActions } from '../scenarios/hooks/useScenarioActions'
import { ChatBot } from './components/chat-bot'
import { ContainerLog } from './components/container-log'
import { ScenarioCardActions } from './components/scenario-card'
import { displayTab } from './data/data'
import { LogController } from './components/log-controller'

interface ScenarioDetailProps {
  scenarioId: string
}

const ScenarioView = ({ scenarioId }: { scenarioId: string }) => {
  const { scenario } = useScenario(scenarioId)
  const { status } = useScenario(scenarioId)
  const { createBuildConnection, closeBuildConnection } = useScenarioBuildLogs()
  const { handleAction, pendingAction } = useScenarioActions(
    scenarioId,
    createBuildConnection,
    closeBuildConnection
  )
  
 
  if (!scenario) {
    return (
      <div className='text-muted-foreground p-4 text-center'>场景加载中...</div>
    )
  }

  if (status) scenario.state = status.state as BaseState

  return (
    <div className='flex flex-col min-h-screen overflow-y-auto'>
      {/* ===== Top Heading ===== */}
      <Header>
        <h1 className='text-2xl font-bold tracking-tight'>{scenario.name}</h1>
        <div className='ml-auto flex items-center gap-4'>
          <ScenarioCardActions
            state={scenario.state}
            pendingAction={pendingAction}
            onAction={handleAction}
          />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Content ===== */}
      <Main fixed>
        <div className='flex flex-1 w-full  gap-2'>
          <div className='w-1/3'>
            <ChatBot className='h-3/5 w-full pt-0' />
            <Card className='h-2/5 w-full flex flex-col '>
              <div className='flex  w-full items-center justify-center'>
              
              </div>
              <div className='flex-1 overflow-auto min-h-0 '>
                
              </div>
            </Card>
          </div>
          <Card className='w-2/3 flex flex-col p-4 mt-0'>
            <div className='h-2/3 w-full p-10 '>
              <TextScroll
                text='TARGET SAFE'
                className='text-green-600 text-2xl'
                />
              <TopologyMap />
              <TextScroll
                text='TARGET SAFE'
                className='text-green-600 text-2xl'
                />
            </div>
            <div className='h-1/3 w-full  gap-2 flex flex-col'>
              <LogController
                modelId={scenarioId}
              />
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
