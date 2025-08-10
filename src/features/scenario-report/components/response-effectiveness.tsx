import { type DefenseReportSchema } from '@/types/defender-agent'
import {
  SectionCard,
  getEffectivenessColor,
  getEffectivenessIcon,
} from './shared'
import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

type ResponseEffectivenessProps = {
  data: DefenseReportSchema['response_effectiveness']
}

export default function ResponseEffectiveness({
  data,
}: ResponseEffectivenessProps) {
  if (!data || typeof data === 'string') {
    return (
      <SectionCard title='响应效果评估' icon={ShieldCheck}>
        <p className='text-muted-foreground'>响应效果评估信息不可用。</p>
      </SectionCard>
    )
  }

  const color = getEffectivenessColor(data.effectiveness)
  const icon = getEffectivenessIcon(data.effectiveness)

  return (
    <SectionCard
      title='响应效果评估'
      icon={ShieldCheck}
      className={cn('border-l-4', color.replace('text-', 'border-'))}
      titleClassName={color}
    >
      <div className='flex flex-col items-center text-center space-y-4'>
        <div className={cn('h-16 w-16 flex items-center justify-center rounded-full', color.replace('text-', 'bg-')+'_10')}>
            <div className={cn(color)}>
                {icon}
            </div>
        </div>
        <div className='space-y-1'>
          <p className={cn('text-2xl font-bold', color)}>{data.effectiveness}</p>
          <p className='text-muted-foreground text-sm'>{data.details}</p>
        </div>
      </div>
    </SectionCard>
  )
}
