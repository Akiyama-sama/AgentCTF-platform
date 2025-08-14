import { BookOpen, BrainCircuit, Target, TrendingUp } from 'lucide-react'
import { SearchProvider } from '@/context/search-context'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ScoreRadarChart } from './components/score-radar-chart'

import { Main } from '@/components/layout/main'
/* import { useExerciseReport } from '@/hooks/use-report' */
import Loading from '@/components/Loading'
import type { ExerciseReport } from './data/schema'
import { exerciseReport } from './data/data'

type AiEvaluationCardProps={
  exerciseReport:ExerciseReport
}

function AiEvaluationCard({exerciseReport}:AiEvaluationCardProps) {
  const { ai_evaluation } = exerciseReport
  return (
    <Card className='flex-1'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <BrainCircuit className='text-primary h-6 w-6' />
          <CardTitle>AI 综合评估</CardTitle>
        </div>
        <CardDescription>
          AI 对本次演练的战术、技术和流程进行全面分析
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div>
          <h3 className='font-semibold'>核心评估</h3>
          <p className='text-muted-foreground text-sm'>
            {ai_evaluation.conclusion}
          </p>
        </div>
        <Separator />
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div>
            <h3 className='mb-2 font-semibold'>优势分析</h3>
            <ul className='list-inside list-disc space-y-1 text-sm'>
              <li>丰富度: {ai_evaluation.richness}</li>
              <li>深度: {ai_evaluation.depth}</li>
              <li>广度: {ai_evaluation.breadth}</li>
            </ul>
          </div>
          <div>
            <h3 className='mb-2 font-semibold'>待改进项</h3>
            <ul className='list-inside list-disc space-y-1 text-sm'>
              {ai_evaluation.weaknesses.map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className='mb-2 font-semibold'>提升建议</h3>
          <ul className='list-inside list-disc space-y-1 text-sm'>
            {ai_evaluation.recommendations.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

type LearningPathCardProps={
  exerciseReport:ExerciseReport
}

function LearningPathCard({exerciseReport}:LearningPathCardProps) {
  const { learning_path } = exerciseReport.ai_evaluation
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <TrendingUp className='text-primary h-6 w-6' />
          <CardTitle>推荐学习路径</CardTitle>
        </div>
        <CardDescription>
          根据本次演练表现，为您规划下一步学习方向
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <h4 className='mb-2 flex items-center gap-2 font-semibold'>
            <Target className='h-5 w-5' />
            相关技术与领域
          </h4>
          <div className='flex flex-wrap gap-2'>
            {learning_path.related_technologies.map((tech: string) => (
              <Badge key={tech} variant='secondary'>
                {tech}
              </Badge>
            ))}
          </div>
        </div>
        <Separator />
        <div>
          <h4 className='mb-2 flex items-center gap-2 font-semibold'>
            <BrainCircuit className='h-5 w-5' />
            重点实践技能
          </h4>
          <ul className='list-inside list-disc space-y-1 text-sm'>
            {learning_path.practice_and_skills.map((skill: string) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>
        <Separator />
        <div>
          <h4 className='mb-2 flex items-center gap-2 font-semibold'>
            <BookOpen className='h-5 w-5' />
            推荐学习资源
          </h4>
          <ul className='list-inside list-disc space-y-1 text-sm'>
            {learning_path.learning_resources.map((res: string) => (
              <li key={res}>{res}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ExerciseReport() {
  
  /* const {isPending,isError,report}=useExerciseReport(exerciseId)

  const isLoading=isPending
  if(isError||!report){
    return <div className='flex h-full w-full items-center justify-center'>获取报告出现错误</div>
  }
  const exerciseReport=report as ExerciseReport */

  const isLoading=false
  return (
    <SearchProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='container mx-auto p-4 md:p-8'>
          <header className='mb-8'>
            <h1 className='text-4xl font-bold tracking-tight'>演练评估报告</h1>
            <p className='text-muted-foreground mt-2'>
              本次网络安全攻防演练的综合评估结果
            </p>
          </header>
          {isLoading?<Loading/>:
          <div>
          <div className='mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3'>
            <Card className='col-span-1 flex flex-col items-center justify-center text-center lg:col-span-1'>
              <CardHeader>
                <CardTitle className='text-2xl'>最终得分</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-primary text-7xl font-bold'>
                  {exerciseReport.final_score.toFixed(1)}
                </p>
                <p className='text-muted-foreground'>
                  满分 {exerciseReport.score_details.max_possible_score}
                </p>
              </CardContent>
            </Card>

            <div className='col-span-1 lg:col-span-2'>
                <ScoreRadarChart data={exerciseReport.score_details} />
            </div>
          </div>

          <div className='flex flex-col gap-8 lg:flex-row'>
            <AiEvaluationCard exerciseReport={exerciseReport} />
            <div className='flex w-full flex-col gap-8 lg:w-2/5'>
              <LearningPathCard exerciseReport={exerciseReport} />
            </div>
          </div>
          </div>
          }
        </div>
      </Main>
    </SearchProvider>
  )
}
