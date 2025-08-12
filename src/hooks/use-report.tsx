import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  // Hooks
  useAnalyzeAndStoreApiAssessmentAnalyzePost,
  useGetAssessmentReportApiAssessmentReportModelIdGet,
  useGetAssessmentStatusApiAssessmentStatusModelIdGet,
  // Query Keys
  getGetAssessmentReportApiAssessmentReportModelIdGetQueryKey,
  getGetAssessmentStatusApiAssessmentStatusModelIdGetQueryKey,
  // Types
  type ApiResponseAnalyzeResponseSchema,
  type ApiResponseAssessmentReportResponseSchema,
  type ApiResponseStatusResponseSchema,
  type AssessmentReportResponseSchema,
  type BodyAnalyzeAndStoreApiAssessmentAnalyzePost,
  type StatusResponseSchema,
  type HTTPValidationError,
} from '@/types/automated-assessment'
import {
  useGetDefenseReportStatusApiDefenseReportStatusPost,
  useGetDefenseReportApiDefenseReportGetPost,
  useTriggerOfflineForensicsApiDefenseReportTriggerForensicsPost,
  type ApiResponseDefenseReportStatusResponse,
  type DefenseReportStatusResponse,
  type ApiResponseDefenseReportResponse,
  type DefenseReportResponse,
  type HTTPValidationError as DefenderHTTPValidationError,
  type TriggerOfflineForensicsApiDefenseReportTriggerForensicsPostMutationResult,
} from '@/types/defender-agent'
import {
  showErrorMessage,
  showSuccessMessage,
} from '@/utils/show-submitted-data'

/**
 * Hook to manage assessment reports for a given model.
 * It provides functionalities to fetch report status, the report itself,
 * and to trigger the analysis process.
 *
 * @param modelId - The ID of the model to manage the report for. Can be null.
 * @param options - Hook options.
 * @param options.refetchStatus - Whether to poll for status updates. Defaults to true.
 */
export const useExerciseReport = (
  modelId: string | null,
  options?: {
    refetchStatus?: boolean
  },
) => {
  const queryClient = useQueryClient()
  const { refetchStatus = true } = options ?? {}
  const isEnabled = !!modelId

  // --- Invalidation Logic ---
  const invalidateReportQueries = () => {
    if (!modelId) return
    queryClient.invalidateQueries({
      queryKey: getGetAssessmentStatusApiAssessmentStatusModelIdGetQueryKey(
        modelId,
      ),
    })
    queryClient.invalidateQueries({
      queryKey: getGetAssessmentReportApiAssessmentReportModelIdGetQueryKey(
        modelId,
      ),
    })
  }

  // --- Queries ---

  // Query for the assessment status
  const { data: status, ...statusQuery } =
    useGetAssessmentStatusApiAssessmentStatusModelIdGet(modelId!, {
      query: {
        enabled: isEnabled,
        // Refetch every 5 seconds if the report is still generating and refetching is enabled
        refetchInterval: (query) =>
          refetchStatus && query.state.data?.data?.status_code === 2
            ? 5000
            : false,
        select: (
          response: ApiResponseStatusResponseSchema,
        ): StatusResponseSchema | null => {
          return response.data ?? null
        },
      },
    })

  // Query for the assessment report
  const { data: report, ...reportQuery } =
    useGetAssessmentReportApiAssessmentReportModelIdGet(modelId!, {
      query: {
        // Only fetch the report if the modelId is valid and status is 'generated' (3)
        enabled: isEnabled && status?.status_code === 3,
        select: (
          response: ApiResponseAssessmentReportResponseSchema,
        ): AssessmentReportResponseSchema | null => {
          return response.data ?? null
        },
      },
    })

  // --- Mutations ---

  // Mutation to start the analysis and report generation
  const analyzeMutation = useAnalyzeAndStoreApiAssessmentAnalyzePost({
    mutation: {
      onSuccess: (res: ApiResponseAnalyzeResponseSchema) => {
        invalidateReportQueries()
        showSuccessMessage(res.message ?? '已开始分析，请稍后查看报告')
      },
      onError: (error: HTTPValidationError) => {
        showErrorMessage(
          '分析请求失败',
          error.detail?.map((d) => d.msg).join(', ') ?? '未知错误',
        )
      },
    },
  })

  // --- Null ID Handling ---
  if (!modelId) {
    const noOpAsync = async () => Promise.resolve(new Response())
    const noOp = () => {}

    return {
      status: null,
      statusQuery: { isInitialLoading: false },
      report: null,
      reportQuery: { isInitialLoading: false },
      analyze: noOp,
      analyzeAsync: noOpAsync,
      isAnalyzing: false,
    }
  }

  // --- Return Value ---
  return {
    /** The assessment status data. */
    status,
    /** The react-query query object for the status. */
    statusQuery,
    /** The assessment report data. */
    report,
    /** The react-query query object for the report. */
    reportQuery,
    /** Function to trigger the analysis. */
    analyze: (
      variables: Omit<BodyAnalyzeAndStoreApiAssessmentAnalyzePost, 'Model_id'>,
    ) => {
      analyzeMutation.mutate({ data: { ...variables, Model_id: modelId } })
    },
    /** Async function to trigger the analysis. */
    analyzeAsync: (
      variables: Omit<BodyAnalyzeAndStoreApiAssessmentAnalyzePost, 'Model_id'>,
    ) => {
      return analyzeMutation.mutateAsync({
        data: { ...variables, Model_id: modelId },
      })
    },
    /** Whether the analysis is currently in progress. */
    isAnalyzing: analyzeMutation.isPending,
  }
}

export const useScenarioReport = (
  modelId: string | null,
  options?: {
    refetchStatus?: boolean
  },
) => {
  const queryClient = useQueryClient()
  
  const { refetchStatus = true } = options ?? {}
  const isEnabled = !!modelId && refetchStatus

  // --- Query Keys (local to this hook) ---
  const statusQueryKey = ['defender-report-status', modelId]
  const reportQueryKey = ['defender-report', modelId]

  // --- Invalidation Logic ---
  const invalidateReportQueries = () => {
    if (!modelId) return
    queryClient.invalidateQueries({ queryKey: statusQueryKey })
    queryClient.invalidateQueries({ queryKey: reportQueryKey })
  }

  // --- Mutations (to be wrapped in useQuery for data fetching) ---
  const statusMutation = useGetDefenseReportStatusApiDefenseReportStatusPost()
  const reportMutation = useGetDefenseReportApiDefenseReportGetPost()

  // Query for the assessment status by wrapping a POST mutation
  const { data: status } = useQuery({
    queryKey: statusQueryKey,
    queryFn: async (): Promise<DefenseReportStatusResponse | null> => {
      if (!modelId) return null
      const response: ApiResponseDefenseReportStatusResponse =
        await statusMutation.mutateAsync({ data: { model_id: modelId } })
      return response.data ?? null
    },
    enabled: isEnabled,
    // Refetch every 5 seconds if the report is still generating
    refetchInterval: query =>
      refetchStatus && (query.state.data?.status === 'generating') ? 5000 : false,
  })

  // Query for the assessment report, enabled only when status is 'completed'
  const { data: report,isPending } = useQuery({
    queryKey: reportQueryKey,
    queryFn: async (): Promise<DefenseReportResponse | null> => {
      if (!modelId) return null
      const response: ApiResponseDefenseReportResponse =
        await reportMutation.mutateAsync({ data: { model_id: modelId } })
      return response.data ?? null
    },
    enabled: isEnabled && status?.status === 'completed',
  })

  // Mutation to start the analysis and report generation
  const analyzeMutation = useTriggerOfflineForensicsApiDefenseReportTriggerForensicsPost(
    {
      mutation: {
        onSuccess: res => {
          invalidateReportQueries()
          showSuccessMessage(res.message ?? '已开始生成防御报告，请稍后')
        },
        onError: (error: DefenderHTTPValidationError) => {
          showErrorMessage(
            '报告生成请求失败',
            error.detail?.map(d => d.msg).join(', ') ?? '未知错误',
          )
        },
      },
    },
  )

  // --- Null ID Handling ---
  if (!modelId) {
    const noOp = () => {}
    const noOpAsync = async () =>
      Promise.resolve(
        {} as TriggerOfflineForensicsApiDefenseReportTriggerForensicsPostMutationResult,
      )

    return {
      status: null,
  
      report: null,
      isPending:false,
      analyze: noOp,
      analyzeAsync: noOpAsync,
      isAnalyzing: false,
    }
  }

  // --- Return Value ---
  return {
    status,
    report,
    isPending,
    analyze: () => {
      analyzeMutation.mutate({ data: { model_id: modelId } })
    },
    analyzeAsync: () => {
      return analyzeMutation.mutateAsync({ data: { model_id: modelId } })
    },
    isAnalyzing: analyzeMutation.isPending,
  }
}
