import { CheckIcon } from 'lucide-react'
import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/components/ui/timeline'

type ProcessLineProps = {
  lineItems: ProcessLineItem[]
  currentStep: number
}

type ProcessLineItem = {
  id: number
  title: string
  purpose?: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function ProcessLine({
  lineItems,
  currentStep,
}: ProcessLineProps) {
  return (
    <Timeline defaultValue={currentStep} orientation='horizontal'>
      {lineItems.map((item) => (
        <TimelineItem
          key={item.id}
          step={item.id}
          className='group-data-[orientation=horizontal]/timeline:mt-0'
        >
          <TimelineHeader>
            <TimelineSeparator className='group-data-[orientation=horizontal]/timeline:top-8' />
            <div className='text-muted-foreground mb-10 block text-xs font-medium group-data-[orientation=vertical]/timeline:max-sm:h-4'>
              {item.purpose ?? ' '}
            </div>
            <TimelineTitle>{item.title}</TimelineTitle>

            <TimelineIndicator className='group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center group-data-completed/timeline-item:border-none group-data-[orientation=horizontal]/timeline:top-8'>
              <CheckIcon
                className='group-not-data-completed/timeline-item:hidden'
                size={16}
              />
            </TimelineIndicator>
          </TimelineHeader>
          <TimelineContent className='flex gap-2 font-serif'>
            <div>{item.description}</div>
            {item.action && (
              <div
                className='text-primary group-not-data-completed/timeline-item:pointer-events-none:cursor-not-allowed cursor-pointer underline group-not-data-completed/timeline-item:pointer-events-none'
                onClick={item.action?.onClick}
              >
                {item.action?.label}
              </div>
            )}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )
}
