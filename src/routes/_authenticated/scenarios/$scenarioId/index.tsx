
import { createFileRoute } from '@tanstack/react-router'
import ScenarioDetail from '@/features/scenario'

export const Route = createFileRoute('/_authenticated/scenarios/$scenarioId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { scenarioId } = Route.useParams()
  return <ScenarioDetail scenarioId={scenarioId} />
}
