import { createFileRoute } from '@tanstack/react-router'
import TargetFactory from '@/features/target-factory'

export const Route = createFileRoute('/_authenticated/target-factory/')({
  component: TargetFactory,
})
