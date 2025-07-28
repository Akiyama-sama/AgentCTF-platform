import ButtonWithLoading from '@/components/loading-button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { scenarioStateConfig, type ActionType } from '../data/data'
import { cn } from '@/lib/utils'
import { BaseState } from '@/types/docker-manager'

interface Props {
    name: string
    description: string
    state: BaseState
    pendingAction: ActionType | null // 新增 pendingAction
    onAction: (action: ActionType) => void
}

function StatusIndicator({ state }: { state: BaseState }) {
  const config = scenarioStateConfig[state]
  const Icon = config.icon

  return (
    <div className='inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap'>
        <Icon className={cn('h-3 w-3', config.iconClassName)} />
        {config.label}
    </div>
  )
}
interface ScenarioCardActionsProps {  
    state: BaseState
    pendingAction: ActionType | null
    onAction: (action: ActionType) => void
}

function ScenarioCardActions({ state, onAction, pendingAction }: ScenarioCardActionsProps) {
    const config = scenarioStateConfig[state]

    if (config.component) {
        const Component = config.component
        return <Component />
    }

    if (config.actions) {
        return (
            <div className='flex flex-wrap items-center gap-2'>
                {config.actions.map((action) => {
                    const Icon = action.icon
                    return (
                        <ButtonWithLoading 
                            key={action.label} 
                            variant={action.variant || 'default'} 
                            size="sm"
                            isLoading={pendingAction === action.actionType}
                            onClick={() => onAction(action.actionType)}
                        >
                            <Icon className='mr-2 h-4 w-4' />
                            {action.label}
                        </ButtonWithLoading>
                    )
                })}
            </div>
        )
    }
    return <div className="min-h-[36px]"></div> // 保持一致的高度
}


export function ScenarioCard({ name, description, state, onAction, pendingAction }: Props) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="">
        <div className='flex justify-between gap-3'>
            <CardTitle className='truncate max-w-[50%]' title={name}>{name}</CardTitle>
            <StatusIndicator state={state} />
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <p className='text-sm text-muted-foreground line-clamp-3'>{description}</p>
      </CardContent>
      <CardFooter className='pt-2 mt-auto'>
        <ScenarioCardActions state={state} onAction={onAction} pendingAction={pendingAction} />
      </CardFooter>
    </Card>
  )
}