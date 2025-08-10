import { type DefenseReportSchema } from '@/types/defender-agent'
import { SectionCard } from './shared'
import { BookText, CheckSquare } from 'lucide-react'

type ExecutiveSummaryProps = {
  data: DefenseReportSchema['executive_summary']
}

export default function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
  if (!data || typeof data === 'string') {
    return (
      <SectionCard title='执行摘要' icon={BookText}>
        <p className='text-muted-foreground'>摘要信息不可用。</p>
      </SectionCard>
    )
  }

  return (
    <SectionCard title='执行摘要' icon={BookText}>
      <div className='space-y-4'>
        <p className='text-base leading-relaxed'>{data.threat_overview}</p>
        <div>
          <h4 className='font-semibold text-md mb-2 flex items-center gap-2'>
            <CheckSquare className='h-5 w-5 text-primary' />
            主要发现
          </h4>
          <ul className='space-y-2 pl-6 list-disc marker:text-primary'>
            {data.main_findings?.map((finding, index) => (
              <li key={index} className='text-muted-foreground'>
                {finding}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionCard>
  )
} 