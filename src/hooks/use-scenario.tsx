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
    // 导入所有需要的 Query Key 工厂函数
    getGetScenariosScenariosGetQueryKey,
    getGetScenarioScenariosScenarioIdGetQueryKey,
    getGetScenarioStatusScenariosScenarioIdStatusGetQueryKey,
    getGetScenarioContainersScenariosScenarioIdContainersGetQueryKey,
    // 导入核心类型，增强代码可读性和类型安全
    type ScenarioResponse,
    type ScenarioStatusResponse,
    type ContainerStatusResponse,
    
  } from '@/types/docker-manager';
import { connectToSse } from '@/utils/sse-service';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
  
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
    logs: string[];
    isBuilding: boolean;
    startBuild: (scenarioId:string) => void;
    stopBuild: () => void;
  }=>{
    const storageKey = `scenarios_built_logs`;

    const [logs, setLogs] = useState<string[]>(() => {
      const savedLogs = localStorage.getItem(storageKey);
      return savedLogs ? JSON.parse(savedLogs) : [];
    });
  
    const [isBuilding, setIsBuilding] = useState<boolean>(false);
    const closeConnectionRef = useRef<(() => void) | null>(null);
  
    const stopBuild = () => {
      if (closeConnectionRef.current) {
        closeConnectionRef.current();
        closeConnectionRef.current = null;
      }
      setIsBuilding(false);
    };
  
    const startBuild = (scenarioId:string) => {
      if (isBuilding) {
        return;
      }
      
      localStorage.removeItem(storageKey);
      setLogs([]);
      setIsBuilding(true);
      
      const url = `${import.meta.env.VITE_BASE_URL}/logs/stream/scenario/${scenarioId}/build`;
      const onOpenStr = '================ 与服务器连接成功 ================';
      const onErrorStr = '================ 与服务器连接失败 ================';
  
      const closeConnection = connectToSse(url, {
        onOpen: () => {
          setLogs((prevLogs) => [...prevLogs, onOpenStr]);
        },
        onData: (data) => {
          setLogs((prevLogs) => [...prevLogs, data]);
        },
        onError: (error) => {
          setLogs((prevLogs) => [...prevLogs, onErrorStr, error.toString()]);
          stopBuild(); 
        },
      });
      closeConnectionRef.current = closeConnection;
    };
  
    // 当构建结束时，将日志保存到 localStorage
    useEffect(() => {
      // 只有在 isBuilding 为 false（已停止）且 logs 里有内容时才保存
      if (!isBuilding && logs.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(logs));
      }
    }, [isBuilding, logs, storageKey]);
  
    // 组件卸载时，确保断开连接
    useEffect(() => {
      return () => {
        stopBuild();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    return {
      logs,
      isBuilding,
      startBuild,
      stopBuild,
    };
  }
