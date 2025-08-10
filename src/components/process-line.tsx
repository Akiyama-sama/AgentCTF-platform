import { CheckIcon } from 'lucide-react'
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/components/ui/timeline'

const items = [
  {
    id: 1,
    title: '实例化agent',
    time: '2025-08-09 10:00:00',
    description: '攻击防御agent实例化',
  },
  {
    id: 2,
    title: '开始攻击',
    time: '2025-08-09 10:00:00',
    description: '开始生成攻击路径',
  },
  {
    id: 3,
    title: '演练结束',
    time: '2025-08-09 10:00:00',
    description: '攻击/防御agent结束,开始生成演练报告',
  },
  {
    id: 4,
    title: '演练报告生成',
    time: '2025-08-09 10:00:00',
    description: '防御演练报告生成，演练结束',
  },
]

type ProcessLineProps = {
  orientation?: 'horizontal' | 'vertical'
}

type ProcessLineItem = {
  id: number
  title: string
  time: string
  description: string
}

export default function ProcessLine({
  orientation = 'horizontal',
}: ProcessLineProps) {
  return (
    <Timeline defaultValue={2} orientation={orientation}>
      {items.map((item) => (
        <TimelineItem
          key={item.id}
          step={item.id}
          className='group-data-[orientation=horizontal]/timeline:mt-0'
        >
          <TimelineHeader>
            <TimelineSeparator className='group-data-[orientation=horizontal]/timeline:top-8' />
            <TimelineDate className="mb-10">{item.time}</TimelineDate>
            <TimelineTitle>{item.title}</TimelineTitle>
            
            <TimelineIndicator className='group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center group-data-completed/timeline-item:border-none group-data-[orientation=horizontal]/timeline:top-8'>
              <CheckIcon
                className='group-not-data-completed/timeline-item:hidden'
                size={16}
              />
            </TimelineIndicator>
          </TimelineHeader>
          <TimelineContent className='font-serif'>{item.description}</TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )
}
