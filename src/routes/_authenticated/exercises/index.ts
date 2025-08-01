import { createFileRoute } from '@tanstack/react-router'
import Exercise from '@/features/exercise'

export const Route = createFileRoute('/_authenticated/exercises/')({
  component: Exercise,
})
