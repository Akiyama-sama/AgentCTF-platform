"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ExerciseReport } from "../data/schema"

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface ScoreRadarChartProps {
  data: ExerciseReport["score_details"]
}

export function ScoreRadarChart({ data }: ScoreRadarChartProps) {
  const chartData = [
    { dimension: "深度", score: data.depth_score },
    { dimension: "广度", score: data.breadth_score },
    { dimension: "MITRE", score: data.mitre_score },
    { dimension: "丰富度", score: data.richness_score },
    { dimension: "AI评估", score: data.ai_score },
  ]

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>能力评估雷达图</CardTitle>
        <CardDescription>
          从五个维度评估本次演练的综合表现
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RadarChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <PolarAngleAxis dataKey="dimension" />
            <PolarGrid />
            <Radar
              dataKey="score"
              fill="var(--color-score)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 