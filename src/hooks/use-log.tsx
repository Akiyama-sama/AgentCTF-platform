import { useState, useCallback, useEffect, useRef } from 'react'
import { type LogRequest } from '@/types/attacker-agent'
import {
  SSEConnectionState,
  SSEMessage,
  LogDisplayItem,
  SSELogType,
  SSELogLevel,
  SSELogEntry,
} from '@/types/sse'
import { getLevelFromData } from '@/lib/tools'
import {
  agentSSEManager,
  type StreamCallbacks,
} from '@/utils/agent-sse-connections'
import { showSuccessMessage } from '@/utils/show-submitted-data'
import {
  sseConnectionManager,
  convertSSEMessageToLogItem,
} from '@/utils/sseConnection'
import { LogStreamRequest } from '@/types/defender-agent'

const dockerManagerURL = import.meta.env.VITE_BASE_URL
// const attackerAgentURL = import.meta.env.VITE_ATTACKER_URL

/**
 * 一个用于处理场景构建日志流的React Hook。
 * 内部封装了SSE连接的创建、消息处理、状态管理和资源清理。
 */
export const useModelBuildLogs = (type: 'scenario' | 'exercise') => {
  const lastLogs = sessionStorage.getItem(`${type}-build-log`)
  const [isLogVisible, setIsLogVisible] = useState(false)
  const [logs, setLogs] = useState<LogDisplayItem[]>(
    lastLogs ? JSON.parse(lastLogs) : []
  )
  const logsRef = useRef(logs)
  logsRef.current = logs

  const [connectionState, setConnectionState] = useState<SSEConnectionState>(
    SSEConnectionState.DISCONNECTED
  )
  const BUILD_CONNECTION_ID = `${type}-build-log`

  /**
   * 关闭当前的构建日志连接。
   */
  const closeBuildConnection = useCallback(() => {
    sseConnectionManager.closeConnection(BUILD_CONNECTION_ID)
  }, [BUILD_CONNECTION_ID])

  const onMessage = useCallback(
    (message: SSEMessage) => {
      switch (message.type) {
        case SSELogType.END:
          sessionStorage.setItem(
            `${type}-build-log`,
            JSON.stringify(logsRef.current)
          )
          closeBuildConnection()
          break
      }

      const logItem = convertSSEMessageToLogItem(
        message,
        logsRef.current.length
      )
      if (logItem) {
        setLogs((prevLogs) => [...prevLogs, logItem])
      }
    },
    [closeBuildConnection]
  )

  const onStateChange = (newState: SSEConnectionState) => {
    setConnectionState(newState)
  }

  /**
   * 创建并启动一个到指定场景构建日志端点的SSE连接。
   * 如果已存在一个构建连接，会先断开旧的再创建新的。
   * @param scenarioId - 要获取构建日志的场景ID。
   */
  const createBuildConnection = useCallback(
    (modelId: string) => {
      setLogs([]) // 开始新的连接前清空旧日志
      const url = `${dockerManagerURL}/logs/stream/model/${modelId}/build`
      const connection = sseConnectionManager.createConnection(
        BUILD_CONNECTION_ID,
        { url },
        onMessage,
        onStateChange
      )
      connection.connect()
    },
    [BUILD_CONNECTION_ID, onMessage]
  )

  // 组件卸载时自动清理连接，防止内存泄漏
  useEffect(() => {
    if (logs.length > 0) {
      setIsLogVisible(true)
    } else if (!isBuilding && logs.length === 0) {
      setIsLogVisible(false)
    }
    return () => {
      sseConnectionManager.closeConnection(BUILD_CONNECTION_ID)
    }
  }, [])

  const isBuilding =
    connectionState === SSEConnectionState.CONNECTING ||
    connectionState === SSEConnectionState.CONNECTED

  useEffect(() => {
    if (isBuilding) {
      setIsLogVisible(true)
    }
  }, [isBuilding])

  return {
    logs,
    isLogVisible,
    setIsLogVisible,
    isBuilding,
    connectionState,
    createBuildConnection,
    closeBuildConnection,
  }
}

// --- Module-level state for useContainerLogs to act as a singleton manager ---
const containerLogsState: {
  [containerId: string]: {
    logs: LogDisplayItem[]
    connectionState: SSEConnectionState
  }
} = {}
const containerLogSubscribers = new Set<() => void>()

const notifyContainerLogSubscribers = () => {
  containerLogSubscribers.forEach((callback) => callback())
}

const createContainerLogConnection = (
  modelId: string,
  containerName: string
) => {
  const containerId = `${modelId}-${containerName}`
  const dockerManagerURL = import.meta.env.VITE_BASE_URL

  // If already connected or connecting, do nothing.
  if (
    containerLogsState[containerId] &&
    (containerLogsState[containerId].connectionState ===
      SSEConnectionState.CONNECTED ||
      containerLogsState[containerId].connectionState ===
        SSEConnectionState.CONNECTING)
  ) {
    return
  }

  // Initialize state for the new connection
  containerLogsState[containerId] = {
    logs: [],
    connectionState: SSEConnectionState.CONNECTING,
  }
  notifyContainerLogSubscribers()

  const url = `${dockerManagerURL}/logs/stream/model/${modelId}/container/${containerName}`

  const onMessage = (message: SSEMessage) => {
    const currentState = containerLogsState[containerId]
    if (!currentState) return // Connection might have been closed

    const logItem = convertSSEMessageToLogItem(
      message,
      currentState.logs.length
    )
    if (logItem) {
      currentState.logs.push(logItem)
      notifyContainerLogSubscribers()
    }
    if (message.type === SSELogType.END) {
      sseConnectionManager.closeConnection(containerId)
    }
  }

  const onStateChange = (newState: SSEConnectionState) => {
    const currentState = containerLogsState[containerId]
    if (currentState) {
      currentState.connectionState = newState
      notifyContainerLogSubscribers()
    }
  }

  const connection = sseConnectionManager.createConnection(
    containerId,
    { url },
    onMessage,
    onStateChange
  )
  connection.connect()
}

const closeContainerLogConnection = (
  modelId: string,
  containerName: string
) => {
  const containerId = `${modelId}-${containerName}`
  sseConnectionManager.closeConnection(containerId)
  // The onStateChange callback should handle updating the state to DISCONNECTED.
  // We can also remove it from our cache to clean up.
  if (containerLogsState[containerId]) {
    delete containerLogsState[containerId]
    notifyContainerLogSubscribers()
  }
}

export const useContainerLogs = () => {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const subscriber = () => forceUpdate((v) => v + 1)
    containerLogSubscribers.add(subscriber)
    // Immediately update with the latest state from the manager
    subscriber()

    // When the component unmounts, unsubscribe
    return () => {
      containerLogSubscribers.delete(subscriber)
    }
  }, [])

  return {
    containerLogs: containerLogsState,
    createContainerConnection: createContainerLogConnection,
    closeContainerConnection: closeContainerLogConnection,
  }
}

/**
 * Hook to handle streaming logs from the attacker agent using the centralized manager.
 * @param modelId The ID of the model to stream logs for.
 * @returns Functions and state for managing a log stream.
 */
export const useAttackerAgentLogs = (modelId: string | null) => {
  const [logs, setLogs] = useState<LogDisplayItem[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamControllerRef = useRef<AbortController | null>(null)

  const startLogs = useCallback(
    async (params: LogRequest) => {
      if (!modelId) return

      // Clear previous logs and errors for a new stream
      setLogs([])
      setError(null)
      setIsStreaming(true)

      const callbacks = {
        onStart: (data: unknown) => {
          const { status } = data as { status: string }
          showSuccessMessage(`攻击Agent SSE日志流已连接: ${status}`)
          const logEntry: SSELogEntry = {
            type: SSELogType.LOG,
            timestamp: new Date().toISOString(),
            message: `攻击Agent SSE日志流已连接: ${status}`,
            level: SSELogLevel.INFO,
            logger_name: 'attacker-agent',
            model_id: params.user_id,
          }
          const logItem = convertSSEMessageToLogItem(logEntry, 0)
          if (logItem) setLogs((prev) => [...prev, logItem])
          // eslint-disable-next-line no-console
          console.log('攻击Agent SSE日志流已连接: ', data)
        },
        onMessage: (data: unknown) => {
          const logData = data as SSELogEntry
          const level =
            logData.message && typeof logData.message === 'string'
              ? getLevelFromData(logData.message) || SSELogLevel.INFO
              : SSELogLevel.INFO
          const logEntry: SSELogEntry = {
            type: SSELogType.LOG,
            timestamp: logData.timestamp,
            message: logData.message,
            level,
            logger_name: 'attacker-agent',
            model_id: params.user_id,
          }
          setLogs((prevLogs) => {
            const logItem = convertSSEMessageToLogItem(
              logEntry,
              prevLogs.length
            )
            return logItem ? [...prevLogs, logItem] : prevLogs
          })
        },
        onEnd: (data: unknown) => {
          const { status } = data as { status: string }
          const logEntry: SSELogEntry = {
            type: SSELogType.LOG,
            timestamp: new Date().toISOString(),
            message: `攻击Agent SSE日志流已结束: ${status}`,
            level: SSELogLevel.INFO,
            logger_name: 'attacker-agent',
            model_id: params.user_id,
          }
          setLogs((prevLogs) => {
            const logItem = convertSSEMessageToLogItem(
              logEntry,
              prevLogs.length
            )
            return logItem ? [...prevLogs, logItem] : prevLogs
          })
          // eslint-disable-next-line no-console
          console.log('攻击Agent SSE日志流已结束: ', data)
        },
        onError: (err: { message: string }) => {
          setError(err.message)
          const logEntry: SSELogEntry = {
            type: SSELogType.LOG,
            timestamp: new Date().toISOString(),
            message: `攻击Agent SSE日志流错误: ${err.message}`,
            level: SSELogLevel.ERROR,
            logger_name: 'attacker-agent',
            model_id: params.user_id,
          }
          setLogs((prevLogs) => {
            const logItem = convertSSEMessageToLogItem(
              logEntry,
              prevLogs.length
            )
            return logItem ? [...prevLogs, logItem] : prevLogs
          })
        },
        onFinally: () => {
          setIsStreaming(false)
          streamControllerRef.current = null
        },
      }

      streamControllerRef.current = agentSSEManager.createAttackerLogStream(
        modelId,
        params,
        callbacks
      )
    },
    [modelId]
  )

  const stopLogs = useCallback(() => {
    if (modelId) {
      agentSSEManager.closeStream(`attacker-log-${modelId}`)
      // eslint-disable-next-line no-console
      console.log('攻击Agent SSE日志流已关闭', modelId)
    }
  }, [modelId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLogs()
    }
  }, [stopLogs])

  return {
    logs,
    isStreaming,
    error,
    startLogs,
    stopLogs,
  }
}

/**
 * Placeholder hook for defender agent logs.
 * It should follow the same singleton pattern as useAttackerAgentLogs.
 */
export const useDefenderAgentLogs = (modelId: string | null) => {
  const [logs, setLogs] = useState<LogDisplayItem[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamControllerRef = useRef<AbortController | null>(null)

  const startLogs = useCallback(
    async (params: LogStreamRequest) => {
      if (!modelId) return

      // Clear previous logs and errors for a new stream
      setLogs([])
      setError(null)
      setIsStreaming(true)

      const callbacks: StreamCallbacks<unknown> = {
        onStart: (data: unknown) => {
          const { status, timestamp } = data as {
            status: string
            timestamp: string
          }
          showSuccessMessage(`防御Agent SSE日志流已连接: ${status}`)
          const logEntry: SSELogEntry = {
            type: SSELogType.LOG,
            timestamp: timestamp || new Date().toISOString(),
            message: `防御Agent SSE日志流已连接: ${status}`,
            level: SSELogLevel.INFO,
            logger_name: 'defender-agent',
            model_id: params.model_id,
          }
          const logItem = convertSSEMessageToLogItem(logEntry, 0)
          if (logItem) setLogs((prev) => [...prev, logItem])
          // eslint-disable-next-line no-console
          console.log('防御Agent SSE日志流已连接: ', data)
        },
        onMessage: (data: unknown) => {
          const logData = data as { message: string; timestamp: string }
          const level =
            logData.message && typeof logData.message === 'string'
              ? getLevelFromData(logData.message) || SSELogLevel.INFO
              : SSELogLevel.INFO
          const logEntry: SSELogEntry = {
            type: SSELogType.LOG,
            timestamp: logData.timestamp,
            message: logData.message,
            level,
            logger_name: 'defender-agent',
            model_id: params.model_id,
          }
          setLogs((prevLogs) => {
            const logItem = convertSSEMessageToLogItem(
              logEntry,
              prevLogs.length
            )
            return logItem ? [...prevLogs, logItem] : prevLogs
          })
        },
        onEnd: (data: unknown) => {
          const { status, timestamp } = data as {
            status: string
            timestamp: string
          }
          const logEntry: SSELogEntry = {
            type: SSELogType.LOG,
            timestamp: timestamp || new Date().toISOString(),
            message: `防御Agent SSE日志流已结束: ${status}`,
            level: SSELogLevel.INFO,
            logger_name: 'defender-agent',
            model_id: params.model_id,
          }
          setLogs((prevLogs) => {
            const logItem = convertSSEMessageToLogItem(
              logEntry,
              prevLogs.length
            )
            return logItem ? [...prevLogs, logItem] : prevLogs
          })
          // eslint-disable-next-line no-console
          console.log('防御Agent SSE日志流已结束: ', data)
        },
        onError: (err: { code?: string | number; message: string }) => {
          const errorMessage = err.code
            ? `${err.message} (代码: ${err.code})`
            : err.message
          setError(errorMessage)
          const logEntry: SSELogEntry = {
            type: SSELogType.LOG,
            timestamp: new Date().toISOString(),
            message: `防御Agent SSE日志流错误: ${errorMessage}`,
            level: SSELogLevel.ERROR,
            logger_name: 'defender-agent',
            model_id: params.model_id,
          }
          setLogs((prevLogs) => {
            const logItem = convertSSEMessageToLogItem(
              logEntry,
              prevLogs.length
            )
            return logItem ? [...prevLogs, logItem] : prevLogs
          })
        },
        onFinally: () => {
          setIsStreaming(false)
          streamControllerRef.current = null
        },
      }

      streamControllerRef.current = agentSSEManager.createDefenderLogStream(
        modelId,
        params,
        callbacks
      )
    },
    [modelId]
  )

  const stopLogs = useCallback(() => {
    if (modelId) {
      agentSSEManager.closeStream(`defender-log-${modelId}`)
      // eslint-disable-next-line no-console
      console.log('防御Agent SSE日志流已关闭', modelId)
    }
  }, [modelId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLogs()
    }
  }, [stopLogs])

  return {
    logs,
    isStreaming,
    error,
    startLogs,
    stopLogs,
  }
}
