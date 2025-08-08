import { SSELogLevel } from '@/types/sse'

export const containerTabs = [
  { id: 'attacker', label: '攻击机' },
  { id: 'defender', label: '防御机' },
  { id: 'target', label: '靶机' },
] as const

export type ContainerType = (typeof containerTabs)[number]['id']

export const logLevelOptions: { label: string; value: SSELogLevel | 'ALL' }[] = [
  { label: '全部', value: 'ALL' },
  { label: 'Info', value: SSELogLevel.INFO },
  { label: 'Warning', value: SSELogLevel.WARNING },
  { label: 'Error', value: SSELogLevel.ERROR },
  { label: 'Debug', value: SSELogLevel.DEBUG },
  { label: 'Critical', value: SSELogLevel.CRITICAL },
]