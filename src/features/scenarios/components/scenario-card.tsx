import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { scenarioStateConfig, type ActionType } from '../data/data'
import { cn } from '@/lib/utils'
import { ScenarioState } from '@/types/docker-manager'

interface Props {
    name: string
    description: string
    state: ScenarioState
    onAction: (action: ActionType) => void
}

function StatusIndicator({ state }: { state: ScenarioState }) {
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
    state: ScenarioState
    onAction: (action: ActionType) => void
}

function ScenarioCardActions({ state, onAction }: ScenarioCardActionsProps) {
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
                        <Button 
                            key={action.label} 
                            variant={action.variant || 'default'} 
                            size="sm"
                            onClick={() => onAction(action.actionType)}
                        >
                            <Icon className='mr-2 h-4 w-4' />
                            {action.label}
                        </Button>
                    )
                })}
            </div>
        )
    }
    return <div className="min-h-[36px]"></div> // 保持一致的高度
}


export function ScenarioCard({ name, description, state, onAction }: Props) {
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
        <ScenarioCardActions state={state} onAction={onAction} />
      </CardFooter>
    </Card>
  )
}