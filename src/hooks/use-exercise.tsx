import {
  // 导入所有需要的 orval 生成的 Hooks
  
  // 导入所有需要的 Query Key 工厂函数
  getGetModelsModelsGetQueryKey,
  getGetModelModelsModelIdGetQueryKey,
  getGetModelStateModelsModelIdStateGetQueryKey,
  getGetModelFileTreeModelsModelIdFilesGetQueryKey,
  // 导入核心类型，增强代码可读性和类型安全
  type ModelResponse,
  useGetModelsModelsGet,
  ApiResponseListModelResponse,
  BodyCreateModelsModelsPost,
  ModelDetailResponse,
  ApiResponseModelStateResponse,
  ModelStateResponse,
  ApiResponseModelDetailResponse,
  useDeleteModelModelsModelIdDelete,
  useUpdateModelModelsModelIdPut,
  useUpdateModelStateModelsModelIdPatch,
  useCreateModelsModelsPost,
  useGetModelModelsModelIdGet,
  useGetModelStateModelsModelIdStateGet,
} from '@/types/docker-manager';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook 用于获取所有练习列表，并提供创建新练习的方法。
 * 它将 API 响应自动解包，直接返回练习数组。
 */
export const useExercises = () => {
  const queryClient = useQueryClient();

  const { data: exercises, ...rest } = useGetModelsModelsGet({
    query: {
      select: (response: ApiResponseListModelResponse): ModelResponse[] => {
        // 筛选出所有场景
        return (
          response.data?.filter((model) => model.model_type === 'exercise') ??
          []
        )
      },
    },
  })

  const createExerciseMutation = useCreateModelsModelsPost({
    mutation: {
      onSuccess: () => {
        // 创建成功后，让练习列表的 query 失效，以触发自动刷新
        queryClient.invalidateQueries({
          queryKey: getGetModelsModelsGetQueryKey(),
        });
      },
    },
  });

  return {
    exercises,
    // 对外暴露的创建函数自动注入 model_type
    createExercise: (
      variables: Omit<BodyCreateModelsModelsPost, 'model_type'>
    ) =>
      createExerciseMutation.mutate({
        data: { ...variables, model_type: 'exercise' },
      }),
    createExerciseAsync: (
      variables: Omit<BodyCreateModelsModelsPost, 'model_type'>
    ) =>
      createExerciseMutation.mutateAsync({
        data: { ...variables, model_type: 'exercise' },
      }),
    ...rest,
  }
};

/**
 * Hook 用于处理单个练习相关的所有操作。
 * @param exerciseId - 要操作的练习的UUID
 */
export const useExercise = (exerciseId: string) => {
  const queryClient = useQueryClient();

  const { data: exercise, ...exerciseQuery } =
  useGetModelModelsModelIdGet(exerciseId, {
      query: {
        enabled: !!exerciseId,
        select: (response: ApiResponseModelDetailResponse): ModelDetailResponse | null => {
          return response.data ?? null;
        },
      },
    });

  const { data: status, ...statusQuery } =
  useGetModelStateModelsModelIdStateGet(exerciseId, {
      query: {
        enabled: !!exerciseId,
        refetchInterval: 2000,
        select: (response: ApiResponseModelStateResponse): ModelStateResponse | null => {
          return response.data ?? null;
        },
      },
    });


  const invalidateExerciseQueries = () => {
    queryClient.invalidateQueries({
      queryKey: getGetModelsModelsGetQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: getGetModelModelsModelIdGetQueryKey(exerciseId),
    });
    queryClient.invalidateQueries({
      queryKey: getGetModelStateModelsModelIdStateGetQueryKey(
        exerciseId,
      ),
    });
    queryClient.invalidateQueries({
      queryKey: getGetModelFileTreeModelsModelIdFilesGetQueryKey(
        exerciseId,
      ),
    });
  };

  // --- 以下所有 Mutation 逻辑保持不变，因为它们依赖 invalidateExerciseQueries ---

  const deleteMutation = useDeleteModelModelsModelIdDelete({
    mutation: {
      onSuccess: invalidateExerciseQueries,
    },
  })

  const updateMutation = useUpdateModelModelsModelIdPut({
    mutation: {
      onSuccess: invalidateExerciseQueries,
    },
  })

  const updateStateMutation = useUpdateModelStateModelsModelIdPatch({
    mutation: {
      onSuccess: invalidateExerciseQueries,
    },
  })

  return {
    exercise, 
    status, 

    // 同时返回各个 query 的完整状态，以便在UI中处理加载、错误等
    exerciseQuery,
    statusQuery,
    isUpdatingState: updateStateMutation.isPending,
    // 返回所有 mutation 方法
    deleteExercise: deleteMutation.mutate,
    deleteExerciseAsync: deleteMutation.mutateAsync,
    updateExercise: updateMutation.mutate,
    updateExerciseAsync: updateMutation.mutateAsync,
    updateState: updateStateMutation.mutate,
    updateStateAsync: updateStateMutation.mutateAsync,
  };
};
