import { createFileRoute } from '@tanstack/react-router'
import Scenarios from '@/features/scenarios'

export const Route = createFileRoute('/_authenticated/scenarios/')({
  component: Scenarios,
})
