import {
  // 导入所有需要的 orval 生成的 Hooks
  useCreateExerciseExercisesPost,
  useDeleteExerciseExercisesExerciseIdDelete,
  useGetExerciseContainersExercisesExerciseIdContainersGet,
  useGetExerciseExercisesExerciseIdGet,
  useGetExerciseStatusExercisesExerciseIdStatusGet,
  useGetExercisesExercisesGet,
  usePartialUpdateExerciseExercisesExerciseIdInfoPatch,
  useUpdateExerciseExercisesExerciseIdPut,
  useUpdateExerciseStateExercisesExerciseIdPatch,
  // 导入所有需要的 Query Key 工厂函数
  getGetExercisesExercisesGetQueryKey,
  getGetExerciseExercisesExerciseIdGetQueryKey,
  getGetExerciseStatusExercisesExerciseIdStatusGetQueryKey,
  getGetExerciseContainersExercisesExerciseIdContainersGetQueryKey,
  // 导入核心类型，增强代码可读性和类型安全
  type ExerciseResponse,
  type ComposeStatusResponse,
  type ContainerStatusResponse,
} from '@/types/docker-manager';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook 用于获取所有练习列表，并提供创建新练习的方法。
 * 它将 API 响应自动解包，直接返回练习数组。
 */
export const useExercises = () => {
  const queryClient = useQueryClient();

  const { data: exercises, ...rest } = useGetExercisesExercisesGet({
    query: {
      select: (response): ExerciseResponse[] => {
        return response.data ?? [];
      },
    },
  });

  const createExerciseMutation = useCreateExerciseExercisesPost({
    mutation: {
      onSuccess: () => {
        // 创建成功后，让练习列表的 query 失效，以触发自动刷新
        queryClient.invalidateQueries({
          queryKey: getGetExercisesExercisesGetQueryKey(),
        });
      },
    },
  });

  return {
    // `exercises` 的类型现在被正确推断为 ExerciseResponse[]
    exercises,
    createExercise: createExerciseMutation.mutate,
    createExerciseAsync: createExerciseMutation.mutateAsync,
    // 返回剩余的 query 状态 (isLoading, isError, etc.)
    ...rest,
  };
};

/**
 * Hook 用于处理单个练习相关的所有操作。
 * @param exerciseId - 要操作的练习的UUID
 */
export const useExercise = (exerciseId: string) => {
  const queryClient = useQueryClient();

  const { data: exercise, ...exerciseQuery } =
    useGetExerciseExercisesExerciseIdGet(exerciseId, {
      query: {
        enabled: !!exerciseId,
        select: (response): ExerciseResponse | null => {
          return response.data ?? null;
        },
      },
    });

  const { data: status, ...statusQuery } =
    useGetExerciseStatusExercisesExerciseIdStatusGet(exerciseId, {
      query: {
        enabled: !!exerciseId,
        refetchInterval: 2000,
        select: (response): ComposeStatusResponse | null => {
          return response.data ?? null;
        },
      },
    });

  const { data: containers, ...containersQuery } =
    useGetExerciseContainersExercisesExerciseIdContainersGet(exerciseId, {
      query: {
        enabled: !!exerciseId,
        select: (response): ContainerStatusResponse[] => {
          return response.data ?? [];
        },
      },
    });

  const invalidateExerciseQueries = () => {
    queryClient.invalidateQueries({
      queryKey: getGetExercisesExercisesGetQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: getGetExerciseExercisesExerciseIdGetQueryKey(exerciseId),
    });
    queryClient.invalidateQueries({
      queryKey: getGetExerciseStatusExercisesExerciseIdStatusGetQueryKey(
        exerciseId,
      ),
    });
    queryClient.invalidateQueries({
      queryKey: getGetExerciseContainersExercisesExerciseIdContainersGetQueryKey(
        exerciseId,
      ),
    });
  };

  // --- 以下所有 Mutation 逻辑保持不变，因为它们依赖 invalidateExerciseQueries ---

  const deleteMutation = useDeleteExerciseExercisesExerciseIdDelete({
    mutation: {
      onSuccess: invalidateExerciseQueries,
    },
  });

  const updateMutation = useUpdateExerciseExercisesExerciseIdPut({
    mutation: {
      onSuccess: invalidateExerciseQueries,
    },
  });

  const partialUpdateMutation =
    usePartialUpdateExerciseExercisesExerciseIdInfoPatch({
      mutation: {
        onSuccess: invalidateExerciseQueries,
      },
    });

  const updateStateMutation = useUpdateExerciseStateExercisesExerciseIdPatch({
    mutation: {
      onSuccess: invalidateExerciseQueries,
    },
  });

  return {
    exercise, // 类型: ExerciseResponse | null
    status, // 类型: ComposeStatusResponse | null
    containers, // 类型: ContainerStatusResponse[]

    // 同时返回各个 query 的完整状态，以便在UI中处理加载、错误等
    exerciseQuery,
    statusQuery,
    containersQuery,

    // 返回所有 mutation 方法
    deleteExercise: deleteMutation.mutate,
    deleteExerciseAsync: deleteMutation.mutateAsync,
    updateExercise: updateMutation.mutate,
    updateExerciseAsync: updateMutation.mutateAsync,
    partialUpdateExercise: partialUpdateMutation.mutate,
    partialUpdateExerciseAsync: partialUpdateMutation.mutateAsync,
    updateState: updateStateMutation.mutate,
    updateStateAsync: updateStateMutation.mutateAsync,
  };
};
