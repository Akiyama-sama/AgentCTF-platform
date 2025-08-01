import { useState, useCallback, useEffect, useRef } from 'react'
import { LogRequest } from '@/types/attacker-agent'
import {
  SSEConnectionState,
  SSEMessage,
  LogDisplayItem,
  SSELogType,
  SSELogLevel,
  SSELogEntry,
} from '@/types/sse'
import { getLevelFromData } from '@/lib/tools'
import { showSuccessMessage } from '@/utils/show-submitted-data'
import {
  sseConnectionManager,
  convertSSEMessageToLogItem,
} from '@/utils/sseConnection'

const dockerManagerURL = import.meta.env.VITE_BASE_URL
const attackerAgentURL = import.meta.env.VITE_ATTACKER_URL

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

  

export const useContainerLogs = () => {
  const [containerLogs, setContainerLogs] = useState<{
    [containerId: string]: {
      logs: LogDisplayItem[]
      connectionState: SSEConnectionState
    }
  }>({})

  const dockerManagerURL = import.meta.env.VITE_BASE_URL

  const createContainerConnection = useCallback(
    (modelId: string, containerName: string) => {
      const containerId = `${modelId}-${containerName}`
      setContainerLogs((prev) => ({
        ...prev,
        [containerId]: {
          logs: [],
          connectionState: SSEConnectionState.CONNECTING,
        },
      }))

      const url = `${dockerManagerURL}/logs/stream/model/${modelId}/container/${containerName}`

      const onMessage = (message: SSEMessage) => {
        setContainerLogs((prev) => {
          const currentContainerLogs = prev[containerId]?.logs || []
          const logItem = convertSSEMessageToLogItem(
            message,
            currentContainerLogs.length
          )
          if (logItem) {
            return {
              ...prev,
              [containerId]: {
                ...prev[containerId],
                logs: [...currentContainerLogs, logItem],
              },
            }
          }
          return prev
        })
        if (message.type === SSELogType.END) {
          sseConnectionManager.closeConnection(containerId)
        }
      }

      const onStateChange = (newState: SSEConnectionState) => {
        setContainerLogs((prev) => ({
          ...prev,
          [containerId]: {
            ...prev[containerId],
            connectionState: newState,
          },
        }))
      }

      const connection = sseConnectionManager.createConnection(
        containerId,
        { url },
        onMessage,
        onStateChange
      )
      connection.connect()
    },
    []
  )

  const closeContainerConnection = useCallback(
    (modelId: string, containerName: string) => {
      const containerId = `${modelId}-${containerName}`
      sseConnectionManager.closeConnection(containerId)
      setContainerLogs((prev) => {
        const newLogs = { ...prev }
        delete newLogs[containerId]
        return newLogs
      })
    },
    []
  )

  // Cleanup all connections on component unmount
  useEffect(() => {
    return () => {
      Object.keys(containerLogs).forEach((containerId) => {
        sseConnectionManager.closeConnection(containerId)
      })
    }
  }, [containerLogs])

  return {
    containerLogs,
    createContainerConnection,
    closeContainerConnection,
  }
}

/**
 * Hook to handle streaming logs from the attacker agent.
 * @returns Functions and state for managing a log stream.
 */
export const useAttackerAgentLogs = () => {
  const [logs, setLogs] = useState<LogDisplayItem[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamControllerRef = useRef<AbortController | null>(null)

  const startLogs = useCallback(async (params: LogRequest) => {
    if (streamControllerRef.current) {
      streamControllerRef.current.abort()
    }
    streamControllerRef.current = new AbortController()

    setLogs([])
    setIsStreaming(true)
    setError(null)

    try {
      const response = await fetch(
        `${attackerAgentURL}/v1/logs/log/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify(params),
          signal: streamControllerRef.current.signal,
        }
      )

      if (!response.ok || !response.body) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: [{ msg: '请求失败，无法解析错误信息' }] }))
        throw new Error(
          errorData.detail?.[0]?.msg || `HTTP error! status: ${response.status}`
        )
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // 1. 将新数据块追加到缓冲区
        buffer += decoder.decode(value, { stream: true })

        // 2. 按双换行符分割，处理所有完整事件
        const events = buffer.split('\n\n')
        // 最后一个元素可能是不完整的事件，所以我们把它放回缓冲区
        buffer = events.pop() || ''

        for (const eventString of events) {
          if (!eventString) continue
          let eventType = 'message'
          let dataJson = ''

          for (const line of eventString.split('\n')) {
            if (line.startsWith('event: ')) {
              eventType = line.substring(7).trim()
              // console.log('eventType:', eventType)
            } else if (line.startsWith('data: ')) {
              dataJson = line.substring(6).trim()
            }
          }

          if (!dataJson) continue
          try {
            const data = JSON.parse(dataJson)
            let logEntry: SSELogEntry | null = null
            // 修复 #1: 从 data.message 中提取 level
            const level =
              data.message && typeof data.message === 'string'
                ? getLevelFromData(data.message) || SSELogLevel.INFO
                : SSELogLevel.INFO

            // 5. 根据事件类型，将数据转换为 SSELogEntry
            switch (eventType) {
              case 'start':
                showSuccessMessage(`攻击Agent SSE日志流已连接: ${data.status}`)
                logEntry = {
                  type: SSELogType.LOG,
                  timestamp: data.timestamp || new Date().toISOString(),
                  message: `攻击Agent SSE日志流已连接: ${data.status}`,
                  level: SSELogLevel.INFO, // 'start' 事件通常是 INFO 级别
                  logger_name: 'attacker-agent',
                  model_id: params.user_id,
                }
                break

              case 'message':
                logEntry = {
                  type: SSELogType.LOG,
                  timestamp: data.timestamp,
                  message: data.message,
                  level,
                  logger_name: 'attacker-agent',
                  model_id: params.user_id,
                }
                break

              case 'ping':
                // Ping 事件通常不需要记录
                break

              case 'end':
                logEntry = {
                  type: SSELogType.LOG,
                  timestamp: data.timestamp || new Date().toISOString(),
                  message: `攻击Agent SSE日志流已结束: ${data.status}`,
                  level: SSELogLevel.INFO,
                  logger_name: 'attacker-agent',
                  model_id: params.user_id,
                }
                // 收到结束信号后，停止监听
                stopLogs()
                break

              case 'error':
                logEntry = {
                  type: SSELogType.LOG,
                  timestamp: data.timestamp || new Date().toISOString(),
                  message: `攻击Agent SSE日志流错误: ${data.message}`,
                  level: SSELogLevel.ERROR,
                  logger_name: 'attacker-agent',
                  model_id: params.user_id,
                }
                setError(`Stream error: ${data.message}`)
                break
            }

            // 6. 如果成功创建了日志条目，就更新状态
            if (logEntry) {
              // 修复 #2: 在 setLogs 回调中处理，避免 stale state
              setLogs((prevLogs) => {
                const logItem = convertSSEMessageToLogItem(
                  logEntry,
                  prevLogs.length
                )
                return logItem ? [...prevLogs, logItem] : prevLogs
              })
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Failed to parse SSE data JSON:', dataJson, e)
          }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setError(e.message)
      }
    } finally {
      setIsStreaming(false)
      streamControllerRef.current = null
    }
  }, [])

  const stopLogs = useCallback(() => {
    if (streamControllerRef.current) {
      streamControllerRef.current.abort()
      streamControllerRef.current = null
    }
    setIsStreaming(false)
  }, [])

  return {
    logs,
    isStreaming,
    error,
    startLogs,
    stopLogs,
  }
}
