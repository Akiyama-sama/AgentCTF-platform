import { createFileRoute } from '@tanstack/react-router'
import { LabComponents } from '@/features/lab'

export const Route = createFileRoute('/_authenticated/lab/')({
  component: LabComponents,
})
