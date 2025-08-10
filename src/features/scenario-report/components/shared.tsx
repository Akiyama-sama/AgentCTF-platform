import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'

interface SectionCardProps {
  title: string
  icon?: React.ElementType
  children: React.ReactNode
  className?: string
  titleClassName?: string
}

export function SectionCard({
  title,
  icon: Icon,
  children,
  className,
  titleClassName,
}: SectionCardProps) {
  return (
    <Card className={cn('overflow-hidden shadow-sm', className)}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20 border-b'>
        <CardTitle className={cn('text-lg font-semibold', titleClassName)}>
          {title}
        </CardTitle>
        {Icon && <Icon className='h-5 w-5 text-muted-foreground' />}
      </CardHeader>
      <CardContent className='pt-6'>{children}</CardContent>
    </Card>
  )
}

export function Pill({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-xs font-semibold',
        className
      )}
    >
      {text}
    </span>
  )
}

export function getRiskColor(riskLevel: string | undefined) {
  switch (riskLevel?.toLowerCase()) {
    case '严重':
      return 'bg-red-500 text-white'
    case '高':
      return 'bg-orange-500 text-white'
    case '中':
      return 'bg-yellow-400 text-black'
    case '低':
      return 'bg-green-500 text-white'
    default:
      return 'bg-gray-400 text-white'
  }
}

export function getEffectivenessColor(effectiveness: string | undefined) {
  switch (effectiveness) {
    case '非常有效':
      return 'text-green-500'
    case '有效':
      return 'text-blue-500'
    case '一般':
      return 'text-yellow-500'
    case '无效':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

export function getEffectivenessIcon(effectiveness: string | undefined) {
  switch (effectiveness) {
    case '非常有效':
      return <ShieldCheck className='h-10 w-10' />
    case '有效':
      return <Shield className='h-10 w-10' />
    case '一般':
      return <ShieldAlert className='h-10 w-10' />
    case '无效':
      return <AlertCircle className='h-10 w-10' />
    default:
      return <Shield className='h-10 w-10' />
  }
} 