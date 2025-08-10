import { type DefenseReportSchema } from '@/types/defender-agent'
import { SectionCard } from './shared'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { ListTodo, ShieldPlus, ArrowRight, LifeBuoy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type RecommendationsProps = {
  emergencyPlan: DefenseReportSchema['emergency_response_plan']
  recommendations: DefenseReportSchema['security_recommendations']
  nextSteps: DefenseReportSchema['next_steps']
}

export default function Recommendations({
  emergencyPlan,
  recommendations,
  nextSteps,
}: RecommendationsProps) {
  const plan =
    emergencyPlan && typeof emergencyPlan !== 'string' ? emergencyPlan : null
  const recs =
    recommendations && typeof recommendations !== 'string'
      ? recommendations
      : null
  const steps = nextSteps && typeof nextSteps !== 'string' ? nextSteps : null

  return (
    <SectionCard title='建议与后续行动' icon={LifeBuoy}>
      <Tabs defaultValue='emergency-plan'>
        <TabsList className='grid w-full grid-cols-1 sm:grid-cols-3'>
          <TabsTrigger value='emergency-plan'>
            <ListTodo className='h-4 w-4 mr-2' />
            应急响应预案
          </TabsTrigger>
          <TabsTrigger value='recommendations'>
            <ShieldPlus className='h-4 w-4 mr-2' />
            安全改进建议
          </TabsTrigger>
          <TabsTrigger value='next-steps'>
            <ArrowRight className='h-4 w-4 mr-2' />
            后续步骤
          </TabsTrigger>
        </TabsList>

        <TabsContent value='emergency-plan' className='pt-6'>
          {plan ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <PlanSection title='立即行动' items={plan.immediate_actions} />
              <PlanSection title='短期措施' items={plan.short_term_measures} />
              <PlanSection title='长期改进' items={plan.long_term_improvements} className='md:col-span-2' />
              <PlanSection title='人员分工' items={plan.personnel_assignments} />
              <PlanSection title='沟通机制' items={plan.communication_mechanisms} />
            </div>
          ) : (
            <p>信息不可用。</p>
          )}
        </TabsContent>

        <TabsContent value='recommendations' className='pt-6'>
          {recs ? (
            <div className='space-y-3'>
                {recs.recommendations.map((rec, i) => <RecommendationItem key={i} text={rec} />)}
            </div>
          ) : (
            <p>信息不可用。</p>
          )}
        </TabsContent>

        <TabsContent value='next-steps' className='pt-6'>
          {steps ? (
             <ul className='space-y-2 pl-6 list-decimal marker:text-primary'>
                {steps.steps.map((step, i) => (
                    <li key={i} className='text-muted-foreground'>{step}</li>
                ))}
             </ul>
          ) : (
            <p>信息不可用。</p>
          )}
        </TabsContent>
      </Tabs>
    </SectionCard>
  )
}

function PlanSection({ title, items, className }: { title: string; items: string[], className?: string }) {
    return (
        <div className={className}>
            <h5 className='font-semibold mb-2'>{title}</h5>
            <ul className='space-y-2 pl-4 list-disc marker:text-primary/50'>
                {items.map((item, i) => (
                    <li key={i} className='text-muted-foreground text-sm'>{item}</li>
                ))}
            </ul>
        </div>
    )
}

function RecommendationItem({ text }: { text: string }) {
    const getPriority = (txt: string) => {
        if (txt.includes('高优先级')) return { label: '高', color: 'bg-red-500' }
        if (txt.includes('中优先级')) return { label: '中', color: 'bg-orange-500' }
        if (txt.includes('低优先级')) return { label: '低', color: 'bg-yellow-500' }
        return { label: '信息', color: 'bg-blue-500' }
    }
    const priority = getPriority(text)
    const cleanText = text.replace(/\*\*(高|中|低)优先级\*\*:\s*/, '')

    return (
        <div className='flex items-start gap-3 p-3 border rounded-lg'>
            <Badge className={`${priority.color} text-white`}>{priority.label}</Badge>
            <p className='text-muted-foreground text-sm flex-1'>{cleanText}</p>
        </div>
    )
} 