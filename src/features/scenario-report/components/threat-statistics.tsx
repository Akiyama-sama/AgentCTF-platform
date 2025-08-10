'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import { type DefenseReportSchema } from '@/types/defender-agent'
import { SectionCard } from './shared'
import { BarChart3 } from 'lucide-react'

type ThreatStatisticsProps = {
  data: DefenseReportSchema['threat_statistics']
}

const COLORS = {
  严重: '#ef5350', // red-500
  高: '#fb923c', // orange-400
  中: '#facc15', // yellow-400
  低: '#4ade80', // green-400
}

export default function ThreatStatistics({ data }: ThreatStatisticsProps) {
  if (!data || typeof data === 'string') {
    return (
      <SectionCard title='威胁统计' icon={BarChart3}>
        <p className='text-muted-foreground'>威胁统计信息不可用。</p>
      </SectionCard>
    )
  }

  const typeData = Object.entries(data.type_distribution || {}).map(
    ([name, value]) => ({ name, count: value })
  )
  const severityData = Object.entries(data.severity_distribution || {}).map(
    ([name, value]) => ({ name, count: value })
  )

  return (
    <SectionCard title='威胁统计' icon={BarChart3}>
      <div className='space-y-6'>
        <div className='text-center'>
          <p className='text-sm text-muted-foreground'>总威胁数</p>
          <p className='text-4xl font-bold text-primary'>
            {data.total_threats}
          </p>
        </div>
        <div>
          <h4 className='font-semibold text-center mb-2'>按严重程度分布</h4>
          <ResponsiveContainer width='100%' height={200}>
            <PieChart>
              <Pie
                data={severityData}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={80}
                fill='#8884d8'
                dataKey='count'
                nameKey='name'
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {severityData.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className='font-semibold text-center mb-2'>按类型分布</h4>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={typeData} layout='vertical'>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis type='number' />
              <YAxis dataKey='name' type='category' width={80} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
              />
              <Bar dataKey='count' fill='hsl(var(--primary))' barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SectionCard>
  )
} 