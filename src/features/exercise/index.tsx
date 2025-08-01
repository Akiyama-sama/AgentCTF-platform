import { useState } from 'react'
import {
  IconAdjustmentsHorizontal,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
  IconTerminal2,
  IconChevronDown,
} from '@tabler/icons-react'
import { BaseState, ModelResponse } from '@/types/docker-manager'
import { useExercise, useExercises } from '@/hooks/use-exercise'
import { useModelBuildLogs } from '@/hooks/use-log'
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
import { BuildLog } from './components/build-log'
import { ExerciseCard } from './components/exercise-card'
import { ExercisesDialogs } from './components/exercises-dialogs'
import { ExercisesPrimaryButtons } from './components/exercises-primary-buttons'
import ExercisesDialogProvider from './context/exercises-context'
import { exerciseStateConfig } from './data/data'
import { useExerciseActions } from './hooks/use-exercise-action'

export default function Exercise() {
  const { exercises } = useExercises()

  const [sort, setSort] = useState('ascending')
  const [scenarioFilterStatus, setScenarioFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const {
    logs,
    isBuilding,
    createBuildConnection,
    closeBuildConnection,
    isLogVisible,
    setIsLogVisible,
  } = useModelBuildLogs('exercise')

  const filteredExercises = exercises
    ? exercises
        .sort((a, b) =>
          sort === 'ascending'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        )
        .filter((scenario) => {
          if (scenarioFilterStatus === 'all') return true
          return scenario.state === scenarioFilterStatus
        })
        .filter((scenario) =>
          scenario.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    : []

  return (
    <ExercisesDialogProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed className='min-h-0 overflow-y-auto'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>智能演练基地</h1>
            <p className='text-muted-foreground'>
              AI Agent将根据你的进攻指令，自动化生成演练评估报告
            </p>
          </div>
          <ExercisesPrimaryButtons />
        </div>
        <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
          <div className='flex flex-col gap-4 sm:my-4 sm:flex-row'>
            <Input
              placeholder='搜索演练名称关键词...'
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
                    ? '所有演练容器'
                    : exerciseStateConfig[scenarioFilterStatus as BaseState]
                        .label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>所有场景容器</SelectItem>
                {Object.entries(exerciseStateConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsLogVisible(!isLogVisible)}
            >
              <IconTerminal2 size={16} className='mr-2' />
              {isLogVisible ? '隐藏日志' : '显示日志'}
              <IconChevronDown
                size={16}
                className={`ml-2 transition-transform ${isLogVisible ? 'rotate-180' : ''}`}
              />
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
            <BuildLog logs={logs} isBuilding={isBuilding} className='h-80' />
          )}
          {filteredExercises.length > 0 ? (
            <ul className='grid gap-4 overflow-auto pb-16 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'>
              {filteredExercises.map((exercise) => (
                <li key={exercise.uuid}>
                  <ExerciseCardWrapper
                    exercise={exercise}
                    createBuildConnection={createBuildConnection}
                    closeBuildConnection={closeBuildConnection}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className='text-muted-foreground'>
              没有找到创建好的演练，请点击右上角创建演练
            </div>
          )}
        </div>
      </Main>
      <ExercisesDialogs />
    </ExercisesDialogProvider>
  )
}
function ExerciseCardWrapper({
  exercise,
  createBuildConnection,
  closeBuildConnection,
}: {
  exercise: ModelResponse
  createBuildConnection: (exerciseId: string) => void
  closeBuildConnection: () => void
}) {
  const { status } = useExercise(exercise.uuid)
  const { handleAction, pendingAction } = useExerciseActions(
    exercise.uuid,
    createBuildConnection,
    closeBuildConnection
  )
  if (status) exercise.state = status.state as BaseState

  return (
    <ExerciseCard
      {...exercise}
      onAction={handleAction}
      pendingAction={pendingAction}
    />
  )
}
