import { z } from "zod"

export const exerciseReportSchema = z.object({
  ai_evaluation: z.object({
    richness: z.string(),
    depth: z.string(),
    breadth: z.string(),
    weaknesses: z.array(z.string()),
    recommendations: z.array(z.string()),
    learning_path: z.object({
      related_technologies: z.array(z.string()),
      practice_and_skills: z.array(z.string()),
      learning_resources: z.array(z.string()),
    }),
    conclusion: z.string(),
  }),
  final_score: z.number(),
  score_details: z.object({
    depth_score: z.number(),
    breadth_score: z.number(),
    mitre_score: z.number(),
    richness_score: z.number(),
    ai_score: z.number(),
    total_score: z.number(),
    max_possible_score: z.number(),
  }),
})

export type ExerciseReport = z.infer<typeof exerciseReportSchema>
