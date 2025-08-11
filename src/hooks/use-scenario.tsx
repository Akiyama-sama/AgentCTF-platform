
import { useQueryClient } from '@tanstack/react-query'
import {
  FileTreeNode,
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
  useCreateModelDirectoryModelsModelIdFilesDirectoriesPost,
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
import { showErrorMessage, showSuccessMessage } from '@/utils/show-submitted-data'

// 根据容器检查结果的结构，仅包含当前使用的字段。
type ContainerInspectDetail = {
  Name: string
  Config: {
    Labels: {
      'com.docker.compose.service': string
    }
  },
  State: {
    Status: string
    CreatedAt: string
  },
  HostConfig?: {
    NetworkMode: string
    PortBindings?: {
      '8000/tcp'?: { HostPort: string }[]
      '2222/tcp'?: { HostPort: string }[]
      '8080/tcp'?: { HostPort: string }[]
    }
  },
  NetworkSettings?: {
    Networks?: {
      [key: string]: {
        IPAddress: string
      }
    }
  }
}

type ContainersInspectMap = Record<string, ContainerInspectDetail>



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
      onSuccess: (res) => {
        // 创建成功后，让模型列表的 query 失效，以触发自动刷新
        queryClient.invalidateQueries({
          queryKey: getGetModelsModelsGetQueryKey(),
        })
        showSuccessMessage(res.message??'创建场景成功')
      },
      onError: (error) => {
        showErrorMessage('创建场景失败',error.detail)
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





type Port = {
  mcpPort?: number
  sshPort?: number
  targetEntrancePort?: number
}

type Status = {
  status: string
  runningTime: number
}

export const useScenarioContainers = (scenarioId: string) => {
  const {
    data: containers,
    isLoading,
    error,
  } = useGetModelAllContainerInspectModelsModelIdInspectGet(scenarioId, {
    query: {
      select: (response) =>
        (response.data?.containers as ContainersInspectMap) ?? {},
    },
  })
  let attackerContainer: ContainerInspectDetail | undefined
  let defenderContainer: ContainerInspectDetail | undefined
  let targetContainer: ContainerInspectDetail | undefined
  const portMap = new Map<string, Port>()
  const ipAddressMap = new Map<string, string>()
  const statusMap = new Map<string, Status>()
  if (containers) {
    // 遍历 containers 对象的所有键（即容器ID）
    for (const containerId in containers) {
      // 确保属性是对象自身的，而不是原型链上的
      if (Object.prototype.hasOwnProperty.call(containers, containerId)) {
        const container = containers[containerId]
        if (container && container.Config && container.Config.Labels) {
          const serviceName =
            container.Config.Labels['com.docker.compose.service']
          const mcpPortStr =
            container.HostConfig?.PortBindings?.['8000/tcp']?.[0]?.HostPort
          const sshPortStr =
            container.HostConfig?.PortBindings?.['2222/tcp']?.[0]?.HostPort
          const targetEntrancePortStr =
            container.HostConfig?.PortBindings?.['8080/tcp']?.[0]?.HostPort
          const mcpPort = mcpPortStr ? parseInt(mcpPortStr, 10) : undefined
          const sshPort = sshPortStr ? parseInt(sshPortStr, 10) : undefined
          const targetEntrancePort = targetEntrancePortStr ? parseInt(targetEntrancePortStr, 10) : undefined
          const networkMode = container.HostConfig?.NetworkMode ?? 'bridge'
          const ipAddress = container.NetworkSettings?.Networks?.[networkMode]?.IPAddress ?? ''
          const status = container.State.Status
          const runningTime = Math.floor((new Date().getTime() - new Date(container.State.CreatedAt).getTime()) / 60000)

          if (serviceName === 'attacker') {
            attackerContainer = container
          } else if (serviceName === 'defender') {
            defenderContainer = container
          } else if (serviceName === 'target') {
            targetContainer = container
          }
          portMap.set(containerId, {
            mcpPort: mcpPort && !isNaN(mcpPort) ? mcpPort : undefined,
            sshPort: sshPort && !isNaN(sshPort) ? sshPort : undefined,
            targetEntrancePort: targetEntrancePort && !isNaN(targetEntrancePort) ? targetEntrancePort : undefined,
          })
          ipAddressMap.set(containerId, ipAddress)
          statusMap.set(containerId, {
            status,
            runningTime,
          })
        }
      }
    }
  }

  return {
    portMap,
    ipAddressMap,
    statusMap,
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
    useCreateModelDirectoryModelsModelIdFilesDirectoriesPost({
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


  const getTargetReadmeContentAsync = async()=>{
    if(!scenarioId) return null
    const res = await getFileContentMutation.mutateAsync({
      modelId:scenarioId,
      data:{
        file_path:'target/README.md'
      }
    })
    return res.data?.content
  }

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

    getTargetReadmeContentAsync,
    getTargetReadmeMermaidContents:async()=>{
      const content = await getTargetReadmeContentAsync()
      if(!content) return null
      return extractAllMermaidContents(content)
    },

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

/**
 * @description 从一个Markdown字符串中，通用地提取所有Mermaid语法块中的内容。
 * @param markdownContent Markdown文件的完整内容字符串。
 * @returns 一个包含所有被提取的Mermaid内容的字符串数组。
 * @throws 如果在输入内容中找不到任何Mermaid语法块，则会抛出一个错误。
 */
export function extractAllMermaidContents(markdownContent: string): string[] | null {
  // 1. 定义用于匹配Mermaid代码块的正则表达式
  //    - ```mermaid: 匹配起始标记。
  //    - \n: 匹配起始标记后的换行符。
  //    - ([\s\S]*?): 一个非贪婪捕获组。[\s\S]可以匹配包括换行在内的任何字符，
  //                  *? 表示非贪婪匹配，即匹配到第一个```时就停止。
  //    - \n```: 匹配结束标记前的换行符和结束标记。
  //    - 'g' (全局)标志: 确保找到文件中所有的匹配项，而不仅仅是第一个。
  const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;

  // 2. 使用 String.prototype.matchAll() 来获取所有匹配项及其捕获组
  //    matchAll返回一个迭代器，我们用扩展语法(...)将其转换为数组。
  const matches = [...markdownContent.matchAll(mermaidRegex)];

  // 3. 错误处理：如果未找到任何匹配项，则抛出错误
  if (matches.length === 0) {
    // eslint-disable-next-line no-console
    console.log("Error: No Mermaid syntax blocks (```mermaid...) were found in the provided content.");
    return null;
  }

  // 4. 提取内容：每个匹配项(match)的第1个捕获组 (match[1]) 就是我们需要的内容
  //    使用 .map() 遍历所有匹配项，并用 .trim() 清除首尾的空白字符。
  const contents = matches.map(match => match[1].trim());

  return contents;
}