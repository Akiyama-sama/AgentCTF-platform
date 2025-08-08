import { useState } from 'react'
import {
  IconAdjustmentsHorizontal,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
  IconTerminal2,
  IconChevronDown,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

import { scenarioStateConfig } from './data/data'
import { ScenarioCard } from './components/scenario-card'
import { BaseState, type ModelResponse } from '@/types/docker-manager'
import { ScenariosPrimaryButtons } from './components/scenarios-primary-buttons'
import { useScenarios, useScenario } from '@/hooks/use-scenario'
import ScenariosDialogProvider from './context/scenarios-context'
import { ScenariosDialogs } from './components/scenarios-dialogs'
import { useScenarioActions } from './hooks/useScenarioActions'
import { ScenarioFileDialogs } from './components/scenario-file-dialogs'
import { BuildLog } from './components/build-log'
import { useModelBuildLogs } from '@/hooks/use-log'



export default function Scenarios() {
  const { scenarios } = useScenarios()

  const [sort, setSort] = useState('ascending')
  const [scenarioFilterStatus, setScenarioFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const {logs,isBuilding,createBuildConnection,closeBuildConnection,isLogVisible,setIsLogVisible} = useModelBuildLogs('scenario')
  

  const filteredScenarios = scenarios?
    (scenarios.sort((a, b) =>
      sort === 'ascending'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name),
    )
    .filter((scenario) => {
      if (scenarioFilterStatus === 'all') return true
      return scenario.state === scenarioFilterStatus
    })
    .filter((scenario) =>
      scenario.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )):[]

  return (
    <ScenariosDialogProvider>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Content ===== */}
      <Main fixed className='overflow-y-auto min-h-0'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              由AI Agent驱动的攻防场景
            </h1>
            <p className='text-muted-foreground'>
              这里列出了所有由AI Agent驱动的攻防场景
            </p>
          </div>
          <ScenariosPrimaryButtons />
        </div>
        <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
          <div className='flex flex-col gap-4 sm:my-4 sm:flex-row'>
            <Input
              placeholder='搜索场景名称...'
              className='h-9 w-40 lg:w-[250px]'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={scenarioFilterStatus}
              onValueChange={setScenarioFilterStatus}
            >
              <SelectTrigger className='w-36'>
                <SelectValue>
                  {scenarioFilterStatus === 'all'
                    ? '所有场景容器'
                    : scenarioStateConfig[scenarioFilterStatus as BaseState]
                        .label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>所有场景容器</SelectItem>
                {Object.entries(scenarioStateConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant="outline" size="sm" onClick={() => setIsLogVisible(!isLogVisible)}>
              <IconTerminal2 size={16} className='mr-2' />
              {isLogVisible ? '隐藏日志' : '显示日志'}
              <IconChevronDown size={16} className={`ml-2 transition-transform ${isLogVisible ? 'rotate-180' : ''}`} />
            </Button>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className='w-16'>
                <SelectValue>
                  <IconAdjustmentsHorizontal size={18} />
                </SelectValue>
              </SelectTrigger>
              <SelectContent align='end'>
                <SelectItem value='ascending'>
                  <div className='flex items-center gap-4'>
                    <IconSortAscendingLetters size={16} />
                    <span>升序</span>
                  </div>
                </SelectItem>
                <SelectItem value='descending'>
                  <div className='flex items-center gap-4'>
                    <IconSortDescendingLetters size={16} />
                    <span>降序</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator className='shadow-sm' />
        
        <div className='flex flex-1 flex-col gap-4 py-4'>
          {isLogVisible && (
            <BuildLog 
              logs={logs} 
              isBuilding={isBuilding}
              className='h-80'
              />
          )}
          {filteredScenarios.length>0?
          (<ul className='  grid gap-4 overflow-auto pb-16 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'>
            {filteredScenarios.map((scenario) => (
              <li key={scenario.uuid}>
                <ScenarioCardWrapper
                  scenario={scenario}
                  createBuildConnection={createBuildConnection}
                  closeBuildConnection={closeBuildConnection}
                />
              </li>
            ))}
          </ul>)
          :
          <div className=' text-muted-foreground'>没有找到创建好的场景，请点击右上角创建场景</div>}
        </div>
      </Main>
      <ScenariosDialogs />
      <ScenarioFileDialogs />
    </ScenariosDialogProvider>
  )
}

function ScenarioCardWrapper({
  scenario,
  createBuildConnection,
  closeBuildConnection,
}: {
  scenario: ModelResponse
  createBuildConnection: (scenarioId: string) => void
  closeBuildConnection: () => void
}) {
 
  const { status } = useScenario(scenario.uuid)
  const { handleAction,pendingAction } = useScenarioActions(scenario.uuid,createBuildConnection,closeBuildConnection)
  if(status) scenario.state=status.state as BaseState
  
  return <ScenarioCard {...scenario} onAction={handleAction} pendingAction={pendingAction} />
}