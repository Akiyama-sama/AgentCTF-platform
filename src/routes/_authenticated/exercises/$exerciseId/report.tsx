import { createFileRoute } from '@tanstack/react-router'
import ExerciseReport from '@/features/exercise-report'

export const Route = createFileRoute(
  '/_authenticated/exercises/$exerciseId/report',
)({
  component: RouteComponent,
})


function RouteComponent() {
  /* const {exerciseId}=Route.useParams() */
  return <ExerciseReport />
}
