import { useScenarios } from '@/hooks/use-scenario'
import { useExercises } from '@/hooks/use-exercise'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Play, Square, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatusCounts {
  running: number
  stopped: number
  total: number
}

export default function StatusOverview() {
  const { scenarios } = useScenarios()
  const { exercises } = useExercises()

  // 计算场景状态统计
  const scenarioStats = scenarios?.reduce<StatusCounts>(
    (acc, scenario) => {
      const status = scenario.state || 'stopped'
      if (status === 'running') {
        acc.running++
      } else {
        acc.stopped++
      }
      acc.total++
      return acc
    },
    { running: 0, stopped: 0, total: 0 }
  ) || { running: 0, stopped: 0, total: 0 }

  // 计算演练状态统计
  const exerciseStats = exercises?.reduce<StatusCounts>(
    (acc, exercise) => {
      const status = exercise.state || 'stopped'
      if (status === 'running') {
        acc.running++
      } else {
        acc.stopped++
      }
      acc.total++
      return acc
    },
    { running: 0, stopped: 0, total: 0 }
  ) || { running: 0, stopped: 0, total: 0 }

  const totalRunning = scenarioStats.running + exerciseStats.running
  const totalStopped = scenarioStats.stopped + exerciseStats.stopped
  const totalContainers = totalRunning + totalStopped

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* 总体状态卡片 */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-30" />
        <CardHeader className="relative pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-primary">
              系统总览
            </CardTitle>
            <div className="rounded-full bg-primary/20 p-2">
              <Zap className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-3">
          <div className="text-3xl font-bold text-primary">
            {totalContainers}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <Play className="mr-1 h-3 w-3" />
              {totalRunning} 运行中
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
              <Square className="mr-1 h-3 w-3" />
              {totalStopped} 已停止
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            实时监控所有容器状态
          </p>
        </CardContent>
      </Card>

      {/* 场景状态卡片 */}
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-30" />
        <CardHeader className="relative pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              攻防场景
            </CardTitle>
            <div className="rounded-full bg-blue-500/20 p-2 transition-all duration-300 group-hover:bg-blue-500/30">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-3">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {scenarioStats.total}
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={cn(
                "transition-all duration-300",
                scenarioStats.running > 0 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 animate-pulse" 
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
              )}
            >
              <Play className="mr-1 h-3 w-3" />
              {scenarioStats.running} 运行中
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
              <Square className="mr-1 h-3 w-3" />
              {scenarioStats.stopped} 已停止
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            AI Agent 攻防推演环境
          </p>
        </CardContent>
      </Card>

      {/* 演练状态卡片 */}
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent opacity-30" />
        <CardHeader className="relative pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              靶场演练
            </CardTitle>
            <div className="rounded-full bg-purple-500/20 p-2 transition-all duration-300 group-hover:bg-purple-500/30">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-3">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {exerciseStats.total}
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={cn(
                "transition-all duration-300",
                exerciseStats.running > 0 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 animate-pulse" 
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
              )}
            >
              <Play className="mr-1 h-3 w-3" />
              {exerciseStats.running} 运行中
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
              <Square className="mr-1 h-3 w-3" />
              {exerciseStats.stopped} 已停止
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            网络安全实训靶场
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 