import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  ContainerInspect,
  FileTreeNode,
  GetModelAllContainerInspectResponseContainers,
  LogEntry,
} from '@/types/api'
import {
  // 导入所有需要的 orval 生成的 Hooks
  useCreateModelsModelsPost,
  useDeleteModelModelsModelIdDelete,
  useGetModelModelsModelIdGet,
  useGetModelStateModelsModelIdStateGet,
  useGetModelsModelsGet,
  useUpdateModelModelsModelIdPut,
  useUpdateModelStateModelsModelIdPatch,
  // 新增：文件管理相关的 Hooks
  useGetModelFileTreeModelsModelIdFilesGet,
  useGetModelFileContentModelsModelIdFilesContentPost,
  useCreateModelFileModelsModelIdFilesPost,
  useUpdateModelFileContentModelsModelIdFilesPut,
  useDeleteModelFileModelsModelIdFilesDelete,
  useCreateModelDirectoryModelsModelIdDirectoriesPost,
  useUploadModelFileModelsModelIdFilesUploadPost,
  // 导入所有需要的 Query Key 工厂函数
  getGetModelsModelsGetQueryKey,
  getGetModelModelsModelIdGetQueryKey,
  getGetModelStateModelsModelIdStateGetQueryKey,
  getGetModelFileTreeModelsModelIdFilesGetQueryKey,
  // 导入核心类型，增强代码可读性和类型安全
  type ModelResponse,
  type ModelDetailResponse,
  type ModelStateResponse,
  type GetDataFileTreeResponseFileTree,
  type ApiResponseListModelResponse,
  type ApiResponseModelDetailResponse,
  type ApiResponseModelStateResponse,
  type ApiResponseGetDataFileTreeResponse,
  type BodyCreateModelsModelsPost,
  useGetModelAllContainerInspectModelsModelIdInspectGet,

} from '@/types/docker-manager'

const dockerManagerURL = import.meta.env.VITE_BASE_URL

/**
 * Hook 用于获取所有场景列表，并提供创建新场景的方法。
 * 它会从所有模型中筛选出 model_type 为 'scenario' 的项。
 */
export const useScenarios = () => {
  const queryClient = useQueryClient()

  const { data: scenarios, ...rest } = useGetModelsModelsGet({
    query: {
      select: (response: ApiResponseListModelResponse): ModelResponse[] => {
        // 筛选出所有场景
        return (
          response.data?.filter((model) => model.model_type === 'scenario') ??
          []
        )
      },
    },
  })

  const createScenarioMutation = useCreateModelsModelsPost({
    mutation: {
      onSuccess: () => {
        // 创建成功后，让模型列表的 query 失效，以触发自动刷新
        queryClient.invalidateQueries({
          queryKey: getGetModelsModelsGetQueryKey(),
        })
      },
    },
  })

  return {
    scenarios,
    // 对外暴露的创建函数自动注入 model_type
    createScenario: (
      variables: Omit<BodyCreateModelsModelsPost, 'model_type'>
    ) =>
      createScenarioMutation.mutate({
        data: { ...variables, model_type: 'scenario' },
      }),
    createScenarioAsync: (
      variables: Omit<BodyCreateModelsModelsPost, 'model_type'>
    ) =>
      createScenarioMutation.mutateAsync({
        data: { ...variables, model_type: 'scenario' },
      }),
    ...rest,
  }
}

/**
 * Hook 用于处理单个场景相关的所有操作。
 * @param scenarioId - 要操作的场景的UUID (现在是 model_id)
 */
export const useScenario = (
  scenarioId: string | null,
  options?: {
    refetchStatus?: boolean
  }
) => {
  const queryClient = useQueryClient()
  const { refetchStatus = true } = options ?? {}

  const isEnabled = !!scenarioId

  const { data: scenario, ...scenarioQuery } = useGetModelModelsModelIdGet(
    scenarioId!,
    {
      query: {
        enabled: isEnabled,
        select: (
          response: ApiResponseModelDetailResponse
        ): ModelDetailResponse | null => {
          return response.data ?? null
        },
      },
    }
  )

  const { data: status, ...statusQuery } =
    useGetModelStateModelsModelIdStateGet(scenarioId!, {
      query: {
        enabled: isEnabled,
        refetchInterval: refetchStatus ? 10000 : false,
        select: (
          response: ApiResponseModelStateResponse
        ): ModelStateResponse | null => {
          return response.data ?? null
        },
      },
    })

  const invalidateScenarioQueries = () => {
    if (!scenarioId) return
    queryClient.invalidateQueries({
      queryKey: getGetModelsModelsGetQueryKey(),
    })
    queryClient.invalidateQueries({
      queryKey: getGetModelModelsModelIdGetQueryKey(scenarioId),
    })
    queryClient.invalidateQueries({
      queryKey: getGetModelStateModelsModelIdStateGetQueryKey(scenarioId),
    })
  }

  const deleteMutation = useDeleteModelModelsModelIdDelete({
    mutation: {
      onSuccess: invalidateScenarioQueries,
    },
  })

  const updateMutation = useUpdateModelModelsModelIdPut({
    mutation: {
      onSuccess: invalidateScenarioQueries,
    },
  })

  const updateStateMutation = useUpdateModelStateModelsModelIdPatch({
    mutation: {
      onSuccess: invalidateScenarioQueries,
    },
  })

  if (!scenarioId) {
    const noOpAsync = async () => Promise.resolve(new Response())
    const noOp = () => {}

    return {
      scenario: null,
      status: null,
      containers: null, // 当没有ID时，容器信息也为null
      scenarioQuery: { isInitialLoading: false },
      statusQuery: { isInitialLoading: false },
      isUpdatingState: false,
      deleteScenario: noOp,
      deleteScenarioAsync: noOpAsync,
      updateScenario: noOp,
      updateScenarioAsync: noOpAsync,
      partialUpdateScenario: noOp, // 保持API兼容性
      partialUpdateScenarioAsync: noOpAsync,
      updateState: noOp,
      updateStateAsync: noOpAsync,
    }
  }

  return {
    scenario,
    status,
    containers: scenario?.compose_info ?? null, // 从模型详情中直接获取容器信息
    scenarioQuery,
    statusQuery,
    isUpdatingState: updateStateMutation.isPending,
    deleteScenario: (vars: { modelId: string }) => deleteMutation.mutate(vars),
    deleteScenarioAsync: deleteMutation.mutateAsync,
    updateScenario: updateMutation.mutate,
    updateScenarioAsync: updateMutation.mutateAsync,
    // 注意：PATCH API已移除，此处为保持兼容性，使用PUT代替
    partialUpdateScenario: updateMutation.mutate,
    partialUpdateScenarioAsync: updateMutation.mutateAsync,
    updateState: updateStateMutation.mutate,
    updateStateAsync: updateStateMutation.mutateAsync,
  }
}

/**
 * Hook 用于获取和处理场景构建日志。
 * @returns 包含日志、构建状态和相关操作的钩子对象
 */
export const useScenarioBuildLogs = (): {
  logs: LogEntry[]
  isBuilding: boolean
  startBuild: (scenarioId: string) => void
  stopBuild: () => void
} => {
  const [buildLogs, setBuildLogs] = useState<LogEntry[]>([])

  const [isBuilding, setIsBuilding] = useState<boolean>(false)
  const buildSourceRef = useRef<EventSource | null>(null)

  const startBuild = (scenarioId: string) => {
    if (buildSourceRef.current) {
      buildSourceRef.current.close()
    }
    setIsBuilding(true)
    const url = `${dockerManagerURL}/logs/stream/model/${scenarioId}/build`
    const es = new EventSource(url)
    es.onmessage = (e) => {
      try {
        const logEntry: LogEntry = JSON.parse(e.data)

        switch (logEntry.type) {
          case 'history':
            setBuildLogs((prev) => [...prev, { ...logEntry, type: 'history' }])
            break
          case 'history_end':
            setBuildLogs((prev) => [
              ...prev,
              {
                timestamp: new Date().toISOString(),
                level: 'INFO',
                message: '构建日志历史加载完成',
                logger_name: 'system',
                type: 'history_end',
              },
            ])
            break
          case 'log':
            setBuildLogs((prev) => [...prev, logEntry])
            break
          case 'end':
            setIsBuilding(false)
            setBuildLogs((prev) => [
              ...prev,
              {
                timestamp: new Date().toISOString(),
                level: 'INFO',
                message: '构建日志流结束',
                logger_name: 'system',
                type: 'end',
              },
            ])
            es.close()
            break
          case 'error':
            setBuildLogs((prev) => [...prev, logEntry])
            es.close()
            break
          case 'heartbeat':
            // 心跳，不处理
            break
          default:
            setBuildLogs((prev) => [...prev, logEntry])
        }
      } catch (error) {
        //eslint-disable-next-line no-console
        console.error('解析日志失败:', error, '原始数据:', e.data)
        setBuildLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            level: 'INFO',
            message: e.data,
            logger_name: 'unknown',
            type: 'log',
          },
        ])
      }
    }

    es.onerror = (error) => {
      //eslint-disable-next-line no-console
      console.error('构建日志流连接错误:', error)
      es.close()

      // 如果场景还在构建状态，尝试重连
      if (isBuilding) {
        setTimeout(() => {
          if (isBuilding) {
            startBuild(scenarioId)
          }
        }, 3000)
      }
    }

    buildSourceRef.current = es
  }

  const stopBuild = () => {
    if (buildSourceRef.current) {
      buildSourceRef.current.close()
    }
    setIsBuilding(false)
  }

  return {
    logs: buildLogs,
    isBuilding,
    startBuild,
    stopBuild,
  }
}

/**
 * HOOK 用于获取场景中指定容器的日志。
 * @param scenarioId - 要获取日志的场景的UUID
 * @returns 包含日志相关操作的钩子对象
 */
/* export const useContainerLogs = (
  scenarioId: string | null,
  containerName: string | null,
) => {
  const [containerLogs, setContainerLogs] = useState<LogEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const esRef = useRef<EventSource | null>(null);

  const startLogs = () => {
    if (!scenarioId || !containerName) return;
    if (esRef.current) {
      esRef.current.close();
    }
    setContainerLogs([]);
    setIsGenerating(true);
    const url = `${dockerManagerURL}/logs/stream/model/${scenarioId}/container/${containerName}`;
    const es = new EventSource(url);
    es.onmessage = (e) => {
      try {
        const logEntry: LogEntry = JSON.parse(e.data);

        switch (logEntry.type) {
          case 'history':
            setContainerLogs((prev) => [
              ...prev,
              { ...logEntry, type: 'history' },
            ]);
            break;
          case 'history_end':
            setContainerLogs((prev) => [
              ...prev,
              {
                timestamp: new Date().toISOString(),
                level: 'INFO',
                message: `容器${containerName}日志历史加载完成`,
                logger_name: 'system',
                type: 'history_end',
              },
            ]);
            break;
          case 'log':
            setContainerLogs((prev) => [...prev, logEntry]);
            break;
          case 'end':
            setIsGenerating(false);
            setContainerLogs((prev) => [
              ...prev,
              {
                timestamp: new Date().toISOString(),
                level: 'INFO',
                message: `容器${containerName}日志流结束`,
                logger_name: 'system',
                type: 'end',
              },
            ]);
            es.close();
            break;
          case 'error':
            setContainerLogs((prev) => [...prev, logEntry]);
            es.close();
            break;
          case 'heartbeat':
            // 心跳，不处理
            break;
          default:
            setContainerLogs((prev) => [...prev, logEntry]);
        }
      } catch (error) {
        //eslint-disable-next-line no-console
        console.error('解析日志失败:', error, '原始数据:', e.data);
        setContainerLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            level: 'INFO',
            message: e.data,
            logger_name: 'unknown',
            type: 'log',
          },
        ]);
      }
    };

    es.onerror = (error) => {
      //eslint-disable-next-line no-console
      console.error(`容器${containerName}日志流连接错误:`, error);
      es.close();

      // 如果日志仍在生成状态，尝试重连
      if (isGenerating) {
        setTimeout(() => {
          if (isGenerating) {
            startLogs();
          }
        }, 3000);
      }
    };
    esRef.current = es;
  };
  const stopLogs = () => {
    if (esRef.current) {
      esRef.current.close();
    }
    setIsGenerating(false);
  };

  return {
    containerLogs,
    isGenerating,
    startLogs,
    stopLogs,
  };
}; */

export const useScenarioContainers = (scenarioId: string) => {
  const {
    data: containers,
    isLoading,
    error,
  } = useGetModelAllContainerInspectModelsModelIdInspectGet(scenarioId, {
    query: {
      select: (response) => {
        return response.data?.containers ?? {}
      }
    },
  })
  let attackerContainer={}
  let defenderContainer={}
  let targetContainer={}
  if(!containers){
    console.log('container不存在')
  }else{
    // 遍历 containers 对象的所有键（即容器ID）
    for (const containerId in containers) {
      // 确保属性是对象自身的，而不是原型链上的
      if (Object.prototype.hasOwnProperty.call(containers, containerId)) {
          const container = containers[containerId];
          if (container && container.Config && container.Config.Labels) {
              const serviceName = container.Config.Labels['com.docker.compose.service'];
              if (serviceName === 'attacker') {
                  attackerContainer=container
              }else if(serviceName==='defender'){
                defenderContainer=container
              }else if(serviceName==='target'){
                targetContainer=container
              }
          }
      }
  }
  }
  

  return {
    attackerContainer,
    attackerContainerName: attackerContainer?.Name?.slice(1),
    defenderContainer,
    defenderContainerName: defenderContainer?.Name?.slice(1),
    targetContainer,
    targetContainerName: targetContainer?.Name?.slice(1),
    isLoading,
    error,
  }
}

/**
 * Hook 用于管理单个场景的数据文件。
 * 提供获取文件树、读写文件内容、创建/删除文件和目录等功能。
 * @param scenarioId - 要操作的场景的UUID
 */
export const useScenarioFile = (scenarioId: string | null) => {
  const queryClient = useQueryClient()
  const isEnabled = !!scenarioId

  // --- Invalidation Logic ---
  const invalidateFileTree = () => {
    if (!scenarioId) return
    queryClient.invalidateQueries({
      queryKey: getGetModelFileTreeModelsModelIdFilesGetQueryKey(scenarioId),
    })
  }

  // --- Data Transformation Logic ---
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const transformFileTree = (tree: GetDataFileTreeResponseFileTree) => {
    const items: Record<string, { name: string; children?: string[] }> = {}

    function sortChildren(children: Record<string, FileTreeNode>): string[] {
      return Object.keys(children).sort((a, b) => {
        const nodeA = children[a]
        const nodeB = children[b]
        const isADir = nodeA.type === 'directory'
        const isBDir = nodeB.type === 'directory'

        if (isADir && !isBDir) return -1
        if (!isADir && isBDir) return 1
        return a.localeCompare(b)
      })
    }

    function processNode(node: FileTreeNode, path: string, name: string) {
      if (node.type === 'directory') {
        const childrenIds = node.children
          ? sortChildren(node.children).map((childName) =>
              path ? `${path}/${childName}` : childName
            )
          : []
        items[path] = {
          name,
          children: childrenIds,
        }
        if (node.children) {
          for (const [childName, childNode] of Object.entries(node.children)) {
            processNode(
              childNode,
              path ? `${path}/${childName}` : childName,
              childName
            )
          }
        }
      } else if (node.type === 'file') {
        items[path] = { name: `${name} (${formatFileSize(node.size ?? 0)})` }
      }
    }

    const rootId = '.' // Use '.' to represent the root
    // Process the tree root first
    items[rootId] = {
      name: '文件根目录', // Display name for the root
      children: tree.children
        ? sortChildren(tree.children as Record<string, FileTreeNode>)
        : [],
    }

    // Process the children
    if (tree.children) {
      for (const [name, node] of Object.entries(
        tree.children as Record<string, FileTreeNode>
      )) {
        processNode(node, name, name)
      }
    }

    return { items, rootItemId: rootId }
  }

  // --- Queries ---
  const { data: fileTree, ...fileTreeQuery } =
    useGetModelFileTreeModelsModelIdFilesGet(scenarioId!, {
      query: {
        enabled: isEnabled,
        select: (
          response: ApiResponseGetDataFileTreeResponse
        ): GetDataFileTreeResponseFileTree | null => {
          return response.data?.file_tree ?? null
        },
      },
    })

  const { items: fileTreeItems, rootItemId } = fileTree
    ? transformFileTree(fileTree)
    : { items: {}, rootItemId: '.' }
  // --- Mutations ---

  // 获取文件内容（使用 POST，所以是 mutation）
  const getFileContentMutation =
    useGetModelFileContentModelsModelIdFilesContentPost()

  // 创建文件
  const createFileMutation = useCreateModelFileModelsModelIdFilesPost({
    mutation: {
      onSuccess: invalidateFileTree,
    },
  })

  // 更新文件
  const updateFileMutation = useUpdateModelFileContentModelsModelIdFilesPut({
    mutation: {
      onSuccess: invalidateFileTree,
    },
  })

  // 删除文件或目录
  const deleteFileMutation = useDeleteModelFileModelsModelIdFilesDelete({
    mutation: {
      onSuccess: invalidateFileTree,
    },
  })

  // 创建目录
  const createDirectoryMutation =
    useCreateModelDirectoryModelsModelIdDirectoriesPost({
      mutation: {
        onSuccess: invalidateFileTree,
      },
    })

  // 上传文件
  const uploadFileMutation = useUploadModelFileModelsModelIdFilesUploadPost({
    mutation: {
      onSuccess: invalidateFileTree,
    },
  })

  // 如果 scenarioId 为 null，返回一组空的、安全的函数
  if (!scenarioId) {
    const noOpAsync = async () => Promise.resolve(new Response())
    const noOp = () => {}

    return {
      fileTree: null,
      fileTreeItems: {},
      rootItemId: '.',
      fileTreeQuery: { isInitialLoading: false },
      getFileContent: noOp,
      getFileContentAsync: noOpAsync,
      isGettingContent: false,
      createFile: noOp,
      createFileAsync: noOpAsync,
      isCreatingFile: false,
      updateFile: noOp,
      updateFileAsync: noOpAsync,
      isUpdatingFile: false,
      deleteFile: noOp,
      deleteFileAsync: noOpAsync,
      isDeletingFile: false,
      createDirectory: noOp,
      createDirectoryAsync: noOpAsync,
      isCreatingDirectory: false,
      uploadFile: noOp,
      uploadFileAsync: noOpAsync,
      isUploadingFile: false,
    }
  }

  return {
    fileTree,
    fileTreeItems,
    rootItemId,
    fileTreeQuery,

    getFileContent: getFileContentMutation.mutate,
    getFileContentAsync: getFileContentMutation.mutateAsync,
    isGettingContent: getFileContentMutation.isPending,

    createFile: createFileMutation.mutate,
    createFileAsync: createFileMutation.mutateAsync,
    isCreatingFile: createFileMutation.isPending,

    updateFile: updateFileMutation.mutate,
    updateFileAsync: updateFileMutation.mutateAsync,
    isUpdatingFile: updateFileMutation.isPending,

    deleteFile: deleteFileMutation.mutate,
    deleteFileAsync: deleteFileMutation.mutateAsync,
    isDeletingFile: deleteFileMutation.isPending,

    createDirectory: createDirectoryMutation.mutate,
    createDirectoryAsync: createDirectoryMutation.mutateAsync,
    isCreatingDirectory: createDirectoryMutation.isPending,

    uploadFile: uploadFileMutation.mutate,
    uploadFileAsync: uploadFileMutation.mutateAsync,
    isUploadingFile: uploadFileMutation.isPending,
  }
}
