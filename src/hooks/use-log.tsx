import { useState, useCallback, useEffect } from 'react';
import { sseConnectionManager, convertSSEMessageToLogItem } from '@/utils/sseConnection';
import { SSEConnectionState, SSEMessage, LogDisplayItem, SSELogType } from '@/types/sse';

const dockerManagerURL = import.meta.env.VITE_BASE_URL;



/**
 * 一个用于处理场景构建日志流的React Hook。
 * 内部封装了SSE连接的创建、消息处理、状态管理和资源清理。
 */
export const useScenarioBuildLogs = () => {
    const lastLogs = localStorage.getItem('scenario-build-log')
    const [isLogVisible, setIsLogVisible] = useState(false);
    const [logs, setLogs] = useState<LogDisplayItem[]>(lastLogs?JSON.parse(lastLogs):[]);
    const [connectionState, setConnectionState] = useState<SSEConnectionState>(SSEConnectionState.DISCONNECTED);
    const BUILD_CONNECTION_ID = `scenario-build-log`;

    /**
     * 关闭当前的构建日志连接。
     */
    const closeBuildConnection = useCallback(() => {
        sseConnectionManager.closeConnection(BUILD_CONNECTION_ID);
    }, [BUILD_CONNECTION_ID]);

    const onMessage = useCallback((message: SSEMessage) => {
        switch(message.type){
            case SSELogType.END:
                localStorage.setItem('scenario-build-log', JSON.stringify(logs))
                closeBuildConnection()
                break
        }
        
        const logItem = convertSSEMessageToLogItem(message, logs.length);
        if (logItem) {
            setLogs(prevLogs => [...prevLogs, logItem]);
        }
    }, []);

    const onStateChange = (newState: SSEConnectionState) => {
        setConnectionState(newState);
    };
    
    /**
     * 创建并启动一个到指定场景构建日志端点的SSE连接。
     * 如果已存在一个构建连接，会先断开旧的再创建新的。
     * @param scenarioId - 要获取构建日志的场景ID。
     */
    const createBuildConnection = useCallback((scenarioId: string) => {
        setLogs([]); // 开始新的连接前清空旧日志
        const url = `${dockerManagerURL}/logs/stream/model/${scenarioId}/build`;
        const connection = sseConnectionManager.createConnection(
            BUILD_CONNECTION_ID,
            { url },
            onMessage,
            onStateChange
        );
        connection.connect();
    }, [BUILD_CONNECTION_ID, onMessage]); 

    

    // 组件卸载时自动清理连接，防止内存泄漏
    useEffect(() => {
        if(logs.length>0){
            setIsLogVisible(true);
        }else if(!isBuilding && logs.length === 0){
            setIsLogVisible(false);
        }
        return () => {
            sseConnectionManager.closeConnection(BUILD_CONNECTION_ID);
        };
    }, []);

    const isBuilding = connectionState === SSEConnectionState.CONNECTING || connectionState === SSEConnectionState.CONNECTED;

    return {
        logs,
        isLogVisible,
        setIsLogVisible,
        isBuilding,
        connectionState,
        createBuildConnection,
        closeBuildConnection,
    };
};

export const useContainerLogs = () => {
    const [containerLogs, setContainerLogs] = useState<{
        [containerId: string]: {
            logs: LogDisplayItem[];
            connectionState: SSEConnectionState;
        };
    }>({});

    const dockerManagerURL = import.meta.env.VITE_BASE_URL;

    const createContainerConnection = useCallback((modelId: string, containerName: string) => {
        const containerId = `${modelId}-${containerName}`;
        setContainerLogs(prev => ({
            ...prev,
            [containerId]: { logs: [], connectionState: SSEConnectionState.CONNECTING }
        }));

        const url = `${dockerManagerURL}/logs/stream/model/${modelId}/container/${containerName}`;

        const onMessage = (message: SSEMessage) => {
            setContainerLogs(prev => {
                const currentContainerLogs = prev[containerId]?.logs || [];
                const logItem = convertSSEMessageToLogItem(message, currentContainerLogs.length);
                if (logItem) {
                    return {
                        ...prev,
                        [containerId]: {
                            ...prev[containerId],
                            logs: [...currentContainerLogs, logItem]
                        }
                    };
                }
                return prev;
            });
            if(message.type === SSELogType.END){
                sseConnectionManager.closeConnection(containerId);
            }
        };

        const onStateChange = (newState: SSEConnectionState) => {
            setContainerLogs(prev => ({
                ...prev,
                [containerId]: {
                    ...prev[containerId],
                    connectionState: newState
                }
            }));
        };

        const connection = sseConnectionManager.createConnection(
            containerId,
            { url },
            onMessage,
            onStateChange
        );
        connection.connect();
    }, []);

    const closeContainerConnection = useCallback((modelId: string, containerName: string) => {
        const containerId = `${modelId}-${containerName}`;
        sseConnectionManager.closeConnection(containerId);
        setContainerLogs(prev => {
            const newLogs = { ...prev };
            delete newLogs[containerId];
            return newLogs;
        });
    }, []);

    // Cleanup all connections on component unmount
    useEffect(() => {
        return () => {
            Object.keys(containerLogs).forEach(containerId => {
                sseConnectionManager.closeConnection(containerId);
            });
        };
    }, [containerLogs]);

    return {
        containerLogs,
        createContainerConnection,
        closeContainerConnection,
    };
};