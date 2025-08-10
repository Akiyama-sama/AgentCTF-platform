import { type DefenseReportSchema } from '@/types/defender-agent'
import { SectionCard } from './shared'
import { Badge } from '@/components/ui/badge'
import { Wrench, Server, FileCog, ShieldCheck, ListChecks } from 'lucide-react'

type RemediationAnalysisProps = {
  data: DefenseReportSchema['vulnerability_remediation_analysis']
}

export default function RemediationAnalysis({
  data,
}: RemediationAnalysisProps) {
  if (!data || typeof data === 'string') {
    return (
      <SectionCard title='漏洞修复分析' icon={Wrench}>
        <p className='text-muted-foreground'>修复分析信息不可用。</p>
      </SectionCard>
    )
  }

  return (
    <SectionCard title='漏洞修复分析' icon={Wrench}>
      <div className='space-y-4'>
        <div className='flex justify-between items-center bg-muted/20 p-3 rounded-lg'>
          <div className='flex items-center gap-2'>
            <ShieldCheck className='h-5 w-5 text-green-500' />
            <span className='font-semibold'>修复成功率</span>
          </div>
          <Badge className='bg-green-500 text-white'>
            {data.remediation_success_rate}
          </Badge>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <InfoList icon={ListChecks} title='修复动作' items={data.remediation_actions} />
          <InfoList icon={Server} title='重启的服务' items={data.restarted_services} />
          <InfoList icon={FileCog} title='Web配置修改' items={data.web_config_changes} />
          <InfoList icon={ShieldCheck} title='应用的补丁' items={data.applied_patches} />
        </div>
      </div>
    </SectionCard>
  )
}

function InfoList({ title, items, icon: Icon }: { title: string; items: string[]; icon: React.ElementType }) {
  return (
    <div className='space-y-2'>
      <h5 className='font-semibold flex items-center gap-2 text-sm'>
        <Icon className='h-4 w-4' /> {title}
      </h5>
      <div className='p-2 border rounded-lg bg-muted/20 space-y-1'>
        {items.map((item, i) => (
          <p key={i} className='text-muted-foreground text-xs'>
            {item}
          </p>
        ))}
        {items.length === 0 && <p className='text-muted-foreground text-xs italic'>无</p>}
      </div>
    </div>
  )
} 