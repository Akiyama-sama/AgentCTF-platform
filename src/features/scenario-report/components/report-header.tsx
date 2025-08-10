import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Download, Bot } from 'lucide-react'

interface ReportHeaderProps {
  modelId: string
  timestamp: string
  reportFile: string
}

export default function ReportHeader({
  modelId,
  timestamp,
  reportFile,
}: ReportHeaderProps) {
  return (
    <header className='flex flex-col sm:flex-row justify-between sm:items-center gap-4 py-4 border-b-2 border-primary'>
      <div>
        <h1 className='text-3xl font-bold text-primary flex items-center gap-2'>
          <Bot className='h-8 w-8' />
          <span>Agent 演练报告</span>
        </h1>
        <p className='text-muted-foreground mt-1'>
          为您生成关于{' '}
          <span className='font-semibold text-foreground'>{modelId}</span>{' '}
          的详细安全分析。
        </p>
      </div>
      <div className='flex flex-col sm:items-end gap-2 text-sm'>
        <Button size='sm' variant='outline'>
          <Download className='h-4 w-4 mr-2' />
          下载报告 ({reportFile})
        </Button>
        <p className='text-muted-foreground'>
          报告生成于: {format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss')}
        </p>
      </div>
    </header>
  )
} 