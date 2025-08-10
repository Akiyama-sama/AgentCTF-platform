import { type DefenseReportSchema } from '@/types/defender-agent'
import { SectionCard } from './shared'
import { GitMerge, Fingerprint, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type AttackChainProps = {
  data: DefenseReportSchema['attack_chain_analysis']
}

export default function AttackChain({ data }: AttackChainProps) {
  if (!data || typeof data === 'string') {
    return (
      <SectionCard title='攻击链分析' icon={GitMerge}>
        <p className='text-muted-foreground'>攻击链分析信息不可用。</p>
      </SectionCard>
    )
  }

  return (
    <SectionCard title='攻击链分析' icon={GitMerge}>
      <div className='space-y-6'>
        <div>
          <h4 className='font-semibold text-md mb-3 flex items-center gap-2'>
            <Fingerprint className='h-5 w-5 text-primary' />
            攻击路径 (MITRE ATT&CK®)
          </h4>
          <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
            {data.attack_stages?.map((stage, index) => (
              <div key={index} className='flex items-center gap-2'>
                <Badge variant='secondary'>{stage}</Badge>
                {index < data.attack_stages.length - 1 && (
                  <ChevronRight className='h-4 w-4' />
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className='font-semibold text-md mb-3 flex items-center gap-2'>
            攻击技术
          </h4>
          <div className='flex flex-wrap gap-2'>
            {data.attack_techniques?.map((technique) => (
              <Badge key={technique} variant='outline'>
                {technique}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  )
} 