import { FileTreeNode, LogEntry } from '@/types/api';
import {
    // 导入所有需要的 orval 生成的 Hooks
    useCreateScenarioScenariosPost,
    useDeleteScenarioScenariosScenarioIdDelete,
    useGetScenarioContainersScenariosScenarioIdContainersGet,
    useGetScenarioScenariosScenarioIdGet,
    useGetScenarioStatusScenariosScenarioIdStatusGet,
    useGetScenariosScenariosGet,
    usePartialUpdateScenarioScenariosScenarioIdInfoPatch,
    useUpdateScenarioScenariosScenarioIdPut,
    useUpdateScenarioStateScenariosScenarioIdPatch,
    // 新增：文件管理相关的 Hooks
    useGetScenarioFileTreeScenariosScenarioIdFilesGet,
    useGetScenarioFileContentScenariosScenarioIdFilesContentPost,
    useCreateScenarioFileScenariosScenarioIdFilesPost,
    useUpdateScenarioFileContentScenariosScenarioIdFilesPut,
    useDeleteScenarioFileScenariosScenarioIdFilesDelete,
    useCreateScenarioDirectoryScenariosScenarioIdDirectoriesPost,
    useUploadScenarioFileScenariosScenarioIdFilesUploadPost,
    // 导入所有需要的 Query Key 工厂函数
    getGetScenariosScenariosGetQueryKey,
    getGetScenarioScenariosScenarioIdGetQueryKey,
    getGetScenarioStatusScenariosScenarioIdStatusGetQueryKey,
    getGetScenarioContainersScenariosScenarioIdContainersGetQueryKey,
    getGetScenarioFileTreeScenariosScenarioIdFilesGetQueryKey,
    // 导入核心类型，增强代码可读性和类型安全
    type ScenarioResponse,
    type ScenarioStatusResponse,
    type ContainerStatusResponse,
    type GetScenarioDataFileTreeResponseFileTree,
    
  } from '@/types/docker-manager';

import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';


  
  /**
   * Hook 用于获取所有场景列表，并提供创建新场景的方法。
   * 它将 API 响应自动解包，直接返回场景数组。
   */
  export const useScenarios = () => {
    const queryClient = useQueryClient();

    const { data: scenarios, ...rest } = useGetScenariosScenariosGet({
      query: {

        select: (response): ScenarioResponse[] => {
          return response.data ?? [];
        },
      },
    });
  
    const createScenarioMutation = useCreateScenarioScenariosPost({
      mutation: {
        onSuccess: () => {
          // 创建成功后，让场景列表的 query 失效，以触发自动刷新
          queryClient.invalidateQueries({
            queryKey: getGetScenariosScenariosGetQueryKey(),
          });
        },
      },
    });
  
    return {
      scenarios,
      createScenario: createScenarioMutation.mutate,
      createScenarioAsync: createScenarioMutation.mutateAsync,
      ...rest,
    };
  };


  /**
   * Hook 用于处理单个场景相关的所有操作。
   * @param scenarioId - 要操作的场景的UUID
   */
  export const useScenario = (
    scenarioId: string | null,
    options?: {
      refetchStatus?: boolean;
      fetchContainers?: boolean;
    },
  ) => {
    const queryClient = useQueryClient();
    const { refetchStatus = true, fetchContainers = false } = options ?? {};
  
    // 当 scenarioId 为 null 时，禁用所有查询
    const isEnabled = !!scenarioId;

    const { data: scenario, ...scenarioQuery } =
      useGetScenarioScenariosScenarioIdGet(scenarioId!, {
        query: {
          enabled: isEnabled, 
          select: (response): ScenarioResponse | null => {
            return response.data ?? null;
          },
        },
      });
      
    const { data: status, ...statusQuery } =
      useGetScenarioStatusScenariosScenarioIdStatusGet(scenarioId!, {
        query: {
          enabled: isEnabled,
          refetchInterval: refetchStatus ? 10000 : false,
          select: (response): ScenarioStatusResponse | null => {
            return response.data ?? null;
          },
        },
      });
  
    const { data: containers, ...containersQuery } =
      useGetScenarioContainersScenariosScenarioIdContainersGet(scenarioId!, {
        query: {
          enabled: isEnabled && fetchContainers,
          select: (response): ContainerStatusResponse[] => {
            return response.data ?? [];
          },
        },
      });
  
    const invalidateScenarioQueries = () => {
      if (!scenarioId) return; // 如果没有ID，不执行任何操作
      queryClient.invalidateQueries({
        queryKey: getGetScenariosScenariosGetQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getGetScenarioScenariosScenarioIdGetQueryKey(scenarioId),
      });
      queryClient.invalidateQueries({
        queryKey: getGetScenarioStatusScenariosScenarioIdStatusGetQueryKey(
          scenarioId,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: getGetScenarioContainersScenariosScenarioIdContainersGetQueryKey(
          scenarioId,
        ),
      });
    };
  
    // --- 以下所有 Mutation 逻辑保持不变，因为它们依赖 invalidateScenarioQueries ---
  
    const deleteMutation = useDeleteScenarioScenariosScenarioIdDelete({
      mutation: {
        onSuccess: invalidateScenarioQueries,
      },
    });
  
    const updateMutation = useUpdateScenarioScenariosScenarioIdPut({
      mutation: {
        onSuccess: invalidateScenarioQueries,
      },
    });
  
    const partialUpdateMutation =
      usePartialUpdateScenarioScenariosScenarioIdInfoPatch({
        mutation: {
          onSuccess: invalidateScenarioQueries,
        },
      });
  
    const updateStateMutation = useUpdateScenarioStateScenariosScenarioIdPatch({
      mutation: {
        onSuccess: invalidateScenarioQueries,
      },
    });
  
    // 如果 scenarioId 为 null，返回一组空的、安全的函数
    if (!scenarioId) {
      const noOpAsync = async () => Promise.resolve(new Response());
      const noOp = () => {};

      return {
        scenario: null,
        status: null,
        containers: [],
        scenarioQuery: {isInitialLoading:false},
        statusQuery: {isInitialLoading:false},
        containersQuery: {isInitialLoading:false},
        isUpdatingState: false, // 当没有场景ID时，状态更新总是不在进行中
        deleteScenario: noOp,
        deleteScenarioAsync: noOpAsync,
        updateScenario: noOp,
        updateScenarioAsync: noOpAsync,
        partialUpdateScenario: noOp,
        partialUpdateScenarioAsync: noOpAsync,
        updateState: noOp,
        updateStateAsync: noOpAsync,
      };
    }

    return {
      scenario,      // 类型: ScenarioResponse | null
      status,        // 类型: ScenarioStatusResponse | null
      containers,    // 类型: ContainerStatusResponse[]
        
      // 同时返回各个 query 的完整状态，以便在UI中处理加载、错误等
      scenarioQuery,
      statusQuery,
      containersQuery,
  
      isUpdatingState: updateStateMutation.isPending, // 暴露状态更新的加载状态

      // 返回所有 mutation 方法
      deleteScenario: deleteMutation.mutate,
      deleteScenarioAsync: deleteMutation.mutateAsync,
      updateScenario: updateMutation.mutate,
      updateScenarioAsync: updateMutation.mutateAsync,
      partialUpdateScenario: partialUpdateMutation.mutate,
      partialUpdateScenarioAsync: partialUpdateMutation.mutateAsync,
      updateState: updateStateMutation.mutate,
      updateStateAsync: updateStateMutation.mutateAsync,
    };
  };


  /**
   * Hook 用于获取和处理场景构建日志。
   * @param scenarioId - 要获取日志的场景的UUID
   * @returns 包含日志、构建状态和相关操作的钩子对象
   */
  export const useScenarioBuildLogs=():{
    logs: LogEntry[];
    isBuilding: boolean;
    startBuild: (scenarioId:string) => void;
    stopBuild: () => void;
  }=>{
 
    const [buildLogs, setBuildLogs] = useState<LogEntry[]>([]);

    const [isBuilding, setIsBuilding] = useState<boolean>(false);
    const buildSourceRef = useRef<EventSource | null>(null);
  

    const startBuild = (scenarioId:string) => {
      if (buildSourceRef.current) {
        buildSourceRef.current.close();
    }
      setIsBuilding(true);
      const url = `${import.meta.env.VITE_BASE_URL}/logs/stream/scenario/${scenarioId}/build`;
      const es = new EventSource(url);
      es.onmessage = (e) => {
        try {
            const logEntry: LogEntry = JSON.parse(e.data);

            switch (logEntry.type) {
                case 'history':
                    setBuildLogs(prev => [...prev, { ...logEntry, type: 'history' }]);
                    break;
                case 'history_end':
                    setBuildLogs(prev => [...prev, {
                      timestamp: new Date().toISOString(),
                      level: 'INFO',
                      message: '构建日志历史加载完成',
                      logger_name: 'system',
                      type: 'history_end'
                    }]);
                    break;
                case 'log':
                    setBuildLogs(prev => [...prev, logEntry]);
                    break;
                case 'end':
                    setIsBuilding(false);
                    setBuildLogs(prev => [...prev, {
                      timestamp: new Date().toISOString(),
                      level: 'INFO',
                      message: '构建日志流结束',
                      logger_name: 'system',
                      type: 'end'
                    }]);
                    es.close();
                    break;
                case 'error':
                    setBuildLogs(prev => [...prev, logEntry]);
                    es.close();
                    break;
                case 'heartbeat':
                    // 心跳，不处理
                    break;
                default:
                    setBuildLogs(prev => [...prev, logEntry]);
            }
        } catch (error) {
          //eslint-disable-next-line no-console
            console.error('解析日志失败:', error, '原始数据:', e.data);
            setBuildLogs(prev => [...prev, {
                timestamp: new Date().toISOString(),
                level: 'INFO',
                message: e.data,
                logger_name: 'unknown',
                type: 'log'
            }]);
        }
    };

    es.onerror = (error) => {
      //eslint-disable-next-line no-console
        console.error('构建日志流连接错误:', error);
        es.close();

        // 如果场景还在构建状态，尝试重连
        if (isBuilding) {
            setTimeout(() => {
                if (isBuilding) {
                    startBuild(scenarioId);
                }
            }, 3000);
        }
    };

    buildSourceRef.current = es;


    };

    const stopBuild = () => {
      if (buildSourceRef.current) {
        buildSourceRef.current.close();
      }
      setIsBuilding(false);
    };
  
    return {
      logs: buildLogs,
      isBuilding,
      startBuild,
      stopBuild,
    };
  }


/**
 * Hook 用于管理单个场景的数据文件。
 * 提供获取文件树、读写文件内容、创建/删除文件和目录等功能。
 * @param scenarioId - 要操作的场景的UUID
 */
export const useScenarioFile = (scenarioId: string | null) => {
  const queryClient = useQueryClient();
  const isEnabled = !!scenarioId;

  // --- Invalidation Logic ---
  const invalidateFileTree = () => {
    if (!scenarioId) return;
    queryClient.invalidateQueries({
      queryKey: getGetScenarioFileTreeScenariosScenarioIdFilesGetQueryKey(scenarioId),
    });
  };

  // --- Data Transformation Logic ---
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const transformFileTree = (
    tree: GetScenarioDataFileTreeResponseFileTree
  ) => {
    const items: Record<
      string,
      { name: string; children?: string[] }
    > = {};

    function sortChildren(children: Record<string, FileTreeNode>): string[] {
      return Object.keys(children).sort((a, b) => {
        const nodeA = children[a];
        const nodeB = children[b];
        const isADir = nodeA.type === 'directory';
        const isBDir = nodeB.type === 'directory';

        if (isADir && !isBDir) return -1;
        if (!isADir && isBDir) return 1;
        return a.localeCompare(b);
      });
    }

    function processNode(
      node: FileTreeNode,
      path: string,
      name: string
    ) {
      if (node.type === 'directory') {
        const childrenIds = node.children
          ? sortChildren(node.children).map(childName =>
              path ? `${path}/${childName}` : childName
            )
          : [];
        items[path] = {
          name,
          children: childrenIds,
        };
        if (node.children) {
          for (const [childName, childNode] of Object.entries(
            node.children
          )) {
            processNode(
              childNode,
              path ? `${path}/${childName}` : childName,
              childName
            );
          }
        }
      } else if (node.type === 'file') {
        items[path] = { name: `${name} (${formatFileSize(node.size ?? 0)})` };
      }
    }

    const rootId = '.'; // Use '.' to represent the root
    // Process the tree root first
    items[rootId] = {
      name: '文件根目录', // Display name for the root
      children: tree.children
        ? sortChildren(tree.children as Record<string, FileTreeNode>)
        : [],
    };
    
    // Process the children
    if (tree.children) {
      for (const [name, node] of Object.entries(
        tree.children as Record<string, FileTreeNode>
      )) {
        processNode(node, name, name);
      }
    }

    return { items, rootItemId: rootId };
  };

  // --- Queries ---
  const { data: fileTree, ...fileTreeQuery } = 
    useGetScenarioFileTreeScenariosScenarioIdFilesGet(scenarioId!, {
      query: {
        enabled: isEnabled,
        select: (response): GetScenarioDataFileTreeResponseFileTree | null => {
          return response.data?.file_tree ?? null;
        },
      },
    });

  const { items: fileTreeItems, rootItemId } = fileTree
    ? transformFileTree(fileTree)
    : { items: {}, rootItemId: '.' };
  // --- Mutations ---
  
  // 获取文件内容（使用 POST，所以是 mutation）
  const getFileContentMutation = useGetScenarioFileContentScenariosScenarioIdFilesContentPost();
  
  // 创建文件
  const createFileMutation = useCreateScenarioFileScenariosScenarioIdFilesPost({
    mutation: {
      onSuccess: invalidateFileTree,
    },
  });

  // 更新文件
  const updateFileMutation = useUpdateScenarioFileContentScenariosScenarioIdFilesPut({
    mutation: {
      onSuccess: invalidateFileTree,
    },
  });

  // 删除文件或目录
  const deleteFileMutation = useDeleteScenarioFileScenariosScenarioIdFilesDelete({
    mutation: {
      onSuccess: invalidateFileTree,
    },
  });

  // 创建目录
  const createDirectoryMutation = useCreateScenarioDirectoryScenariosScenarioIdDirectoriesPost({
    mutation: {
      onSuccess: invalidateFileTree,
    },
  });
  
  // 上传文件
  const uploadFileMutation = useUploadScenarioFileScenariosScenarioIdFilesUploadPost({
    mutation: {
      onSuccess: invalidateFileTree,
    },
  });
  
  // 如果 scenarioId 为 null，返回一组空的、安全的函数
  if (!scenarioId) {
    const noOpAsync = async () => Promise.resolve(new Response());
    const noOp = () => {};

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
    };
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

   
  };
};