import { type DefenseReportSchema } from '@/types/defender-agent'
import { SectionCard, Pill, getRiskColor } from './shared'
import { ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

type RiskAssessmentProps = {
  data: DefenseReportSchema['risk_assessment']
}

export default function RiskAssessment({ data }: RiskAssessmentProps) {
  if (!data || typeof data === 'string') {
    return (
      <SectionCard title='风险评估' icon={ShieldAlert}>
        <p className='text-muted-foreground'>风险评估信息不可用。</p>
      </SectionCard>
    )
  }

  const riskColor = getRiskColor(data.risk_level)

  return (
    <SectionCard
      title='风险评估'
      icon={ShieldAlert}
      className='border-l-4 border-orange-500'
      titleClassName='text-orange-500'
    >
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h4 className='font-semibold'>风险等级</h4>
          <Pill text={data.risk_level || '未知'} className={cn(riskColor)} />
        </div>
        <div>
          <h4 className='font-semibold mb-2'>详情</h4>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {data.details}
          </p>
        </div>
      </div>
    </SectionCard>
  )
} 