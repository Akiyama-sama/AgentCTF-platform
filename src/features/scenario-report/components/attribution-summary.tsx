import { type DefenseReportSchema } from '@/types/defender-agent'
import { SectionCard, Pill } from './shared'
import { Target, HelpCircle, Activity, BrainCircuit } from 'lucide-react'

type AttributionSummaryProps = {
  data: DefenseReportSchema['attribution_summary']
}

export default function AttributionSummary({ data }: AttributionSummaryProps) {
  if (!data || typeof data === 'string') {
    return (
      <SectionCard title='溯源结论摘要' icon={Target}>
        <p className='text-muted-foreground'>溯源结论摘要信息不可用。</p>
      </SectionCard>
    )
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case '高':
        return 'bg-green-500 text-white'
      case '中等':
        return 'bg-yellow-400 text-black'
      case '低':
        return 'bg-orange-500 text-white'
      default:
        return 'bg-gray-400 text-white'
    }
  }

  return (
    <SectionCard title='溯源结论摘要' icon={Target}>
      <div className='space-y-4 text-sm'>
        <InfoRow icon={BrainCircuit} title='攻击者归属'>
          <p>{data.attacker_attribution}</p>
        </InfoRow>
        <InfoRow icon={HelpCircle} title='攻击动机'>
          <p>{data.attack_motivation}</p>
        </InfoRow>
        <InfoRow icon={Activity} title='攻击影响'>
          <p>{data.attack_impact}</p>
        </InfoRow>
        <InfoRow icon={HelpCircle} title='溯源置信度'>
          <Pill
            text={data.attribution_confidence || '未知'}
            className={getConfidenceColor(data.attribution_confidence || '')}
          />
        </InfoRow>
        <div className='pt-2'>
          <h5 className='font-semibold mb-2 flex items-center gap-2'>
            推理过程
          </h5>
          <blockquote className='border-l-2 pl-4 italic text-muted-foreground'>
            {data.attribution_reasoning}
          </blockquote>
        </div>
      </div>
    </SectionCard>
  )
}

function InfoRow({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div className='flex items-start'>
      <div className='flex items-center gap-2 w-1/3 font-semibold'>
        <Icon className='h-4 w-4 text-muted-foreground' />
        <span>{title}</span>
      </div>
      <div className='w-2/3 text-muted-foreground'>{children}</div>
    </div>
  )
} 