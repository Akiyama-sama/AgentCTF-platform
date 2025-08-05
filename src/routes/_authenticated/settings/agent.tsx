import { createFileRoute } from '@tanstack/react-router'
import SettingsAgent from '@/features/settings/agent'

export const Route = createFileRoute('/_authenticated/settings/agent')({
  component: SettingsAgent,
})
