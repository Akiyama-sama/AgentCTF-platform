import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
    icon: React.ElementType
    title: string
    value: string | number
    description: string
    className?: string
  }
  
  export default function StatCard({
    icon: Icon,
    title,
    value,
    description,
    className,
  }: StatCardProps) {
    return (
      <Card className={cn('transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl', className)}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>{title}</CardTitle>
          <Icon className='text-muted-foreground h-5 w-5' />
        </CardHeader>
        <CardContent>
          <div className='text-4xl font-bold'>{value}</div>
          <p className='text-muted-foreground pt-1 text-xs'>{description}</p>
        </CardContent>
      </Card>
    )
  }