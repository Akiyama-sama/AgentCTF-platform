import { createFileRoute } from '@tanstack/react-router'
import ScenarioReport from '@/features/scenario-report'

export const Route = createFileRoute('/_authenticated/scenarios/$scenarioId/report')({
  component: ScenarioReport,
})