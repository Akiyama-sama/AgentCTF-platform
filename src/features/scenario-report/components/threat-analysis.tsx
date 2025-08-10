import { type DefenseReportSchema } from '@/types/defender-agent'
import { SectionCard } from './shared'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Microscope, ShieldX, Code2, ListChecks } from 'lucide-react'

type ThreatAnalysisProps = {
  attackTypes: DefenseReportSchema['attack_types']
  threatBlocking: DefenseReportSchema['threat_blocking_analysis']
}

export default function ThreatAnalysis({
  attackTypes,
  threatBlocking,
}: ThreatAnalysisProps) {
  const attackTypesData =
    attackTypes && typeof attackTypes !== 'string' ? attackTypes : {}
  const threatBlockingData =
    threatBlocking && typeof threatBlocking !== 'string' ? threatBlocking : null

  return (
    <SectionCard title='威胁与阻断分析' icon={Microscope}>
      <Tabs defaultValue='attack-types'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='attack-types'>
            <Code2 className='h-4 w-4 mr-2' />
            攻击类型分析
          </TabsTrigger>
          <TabsTrigger value='threat-blocking'>
            <ShieldX className='h-4 w-4 mr-2' />
            威胁阻断分析
          </TabsTrigger>
        </TabsList>
        <TabsContent value='attack-types' className='pt-4'>
          <div className='space-y-4'>
            {Object.entries(attackTypesData).map(([name, details]) => (
              <div
                key={name}
                className='p-4 border rounded-lg bg-muted/20'
              >
                <h5 className='font-semibold mb-2'>{name}</h5>
                <p className='text-sm text-muted-foreground mb-3'>
                  {details.description}
                </p>
                <h6 className='text-xs font-semibold mb-2'>示例:</h6>
                <div className='space-y-2'>
                  {details.examples.map((ex, i) => (
                    <code
                      key={i}
                      className='block text-xs bg-black text-white p-2 rounded'
                    >
                      {ex}
                    </code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value='threat-blocking' className='pt-4'>
          {threatBlockingData ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
              <InfoList title='阻断的IP' items={threatBlockingData.blocked_ips} />
              <InfoList title='阻断的端口' items={threatBlockingData.blocked_ports} />
              <InfoList title='生效的防火墙规则' items={threatBlockingData.firewall_rules} className='md:col-span-2' />
               <div className='p-4 border rounded-lg bg-muted/20 md:col-span-2'>
                 <h5 className='font-semibold mb-2'>阻断效果评估</h5>
                 <p className='text-sm text-muted-foreground'>
                   {threatBlockingData.blocking_effectiveness}
                 </p>
              </div>
            </div>
          ) : (
            <p className='text-muted-foreground'>威胁阻断信息不可用。</p>
          )}
        </TabsContent>
      </Tabs>
    </SectionCard>
  )
}

function InfoList({ title, items, className }: { title: string, items: string[], className?: string }) {
    return (
        <div className={className}>
            <h5 className='font-semibold mb-2 flex items-center gap-2'><ListChecks className="h-4 w-4" />{title}</h5>
            <div className='p-2 border rounded-lg bg-muted/20 space-y-1'>
                {items.map((item, i) => (
                    <p key={i} className='text-muted-foreground font-mono text-xs'>{item}</p>
                ))}
            </div>
        </div>
    )
} 