import type { ChatRequest, LogRequest } from '@/types/attacker-agent'
import { LogStreamRequest } from '@/types/defender-agent';
const attackerAgentURL = import.meta.env.VITE_ATTACKER_URL;
const defenderAgentURL = import.meta.env.VITE_DEFENDER_URL;
/**
 * Defines the callback functions for handling different events in a stream's lifecycle.
 * @template T The expected type of data in the stream events.
 */
export interface StreamCallbacks<T> {
  onStart?: (data: T) => void
  onMessage?: (data: T) => void
  onEnd?: (data: T) => void
  onError?: (error: { code?: string | number; message: string }) => void
  onFinally?: () => void
}

/**
 * A generic utility to process a server-sent event (SSE) stream from a `fetch` response.
 * It handles reading the stream, decoding text, and parsing event data.
 * @template T The expected type of data in the stream events.
 * @param response The `fetch` API Response object.
 * @param callbacks An object containing callback functions to handle stream events.
 */
async function processFetchStream<T>(
  response: Response,
  callbacks: StreamCallbacks<T>
) {
  if (!response.ok || !response.body) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: [{ msg: '请求失败，无法解析错误信息' }] }))
    const message =
      errorData.detail?.[0]?.msg || `HTTP error! status: ${response.status}`
    callbacks.onError?.({ message })
    callbacks.onFinally?.()
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const processEvent = (eventString: string) => {
    if (!eventString.trim()) return

    const dataLines: string[] = []
    let eventType = 'message'

    for (const line of eventString.split('\n')) {
      if (line.startsWith('event: ')) {
        eventType = line.substring('event: '.length).trim()
      } else if (line.startsWith('data: ')) {
        dataLines.push(line.substring('data: '.length).trim())
      }
    }

    if (dataLines.length === 0) return

    const dataJson = dataLines.join('\n')

    try {
      const data: T = JSON.parse(dataJson)
      switch (eventType) {
        case 'start':
          callbacks.onStart?.(data)
          break
        case 'message':
          callbacks.onMessage?.(data)
          break
        case 'end':
          callbacks.onEnd?.(data)
          break
        case 'error':
          callbacks.onError?.(data as { code?: string | number; message: string })
          break
        case 'ping':
          break
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse SSE data JSON:', dataJson, e)
    }
  }

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read()

      if (value) {
        buffer += decoder.decode(value, { stream: true })
      }

      const boundary = '\n\n'
      let boundaryIndex

      while ((boundaryIndex = buffer.indexOf(boundary)) !== -1) {
        const eventString = buffer.substring(0, boundaryIndex)
        buffer = buffer.substring(boundaryIndex + boundary.length)
        processEvent(eventString)
      }

      if (done) {
        if (buffer) {
          processEvent(buffer)
        }
        break
      }
    }
  } catch (err) {
    if (err instanceof Error && err.name !== 'AbortError') {
      callbacks.onError?.({ message: err.message })
    }
  } finally {
    callbacks.onFinally?.()
  }
}

/**
 * Represents the state of a managed SSE connection.
 */
interface ManagedConnection {
  controller: AbortController
  status: 'connecting' | 'streaming' | 'error' | 'success'
}

/**
 * Manages fetch-based SSE connections to the attacker-agent backend.
 * This class ensures that connections are properly created, tracked, and terminated.
 */
class AgentSSEManager {
  private connections = new Map<string, ManagedConnection>()

  private createStream(
    streamId: string,
    url: string,
    body: unknown,
    callbacks: StreamCallbacks<unknown>
  ) {
    this.closeStream(streamId)

    const controller = new AbortController()
    this.connections.set(streamId, { controller, status: 'connecting' })

    const enhancedCallbacks: StreamCallbacks<unknown> = {
      onStart: (data) => {
        const conn = this.connections.get(streamId)
        if (conn) conn.status = 'streaming'
        callbacks.onStart?.(data)
      },
      onMessage: callbacks.onMessage,
      onEnd: (data) => {
        const conn = this.connections.get(streamId)
        if (conn) conn.status = 'success'
        callbacks.onEnd?.(data)
      },
      onError: (error) => {
        const conn = this.connections.get(streamId)
        if (conn) conn.status = 'error'
        callbacks.onError?.(error)
      },
      onFinally: () => {
        this.connections.delete(streamId)
        callbacks.onFinally?.()
      },
    }

    ;(async () => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        })
        await processFetchStream(response, enhancedCallbacks)
      } catch (err) {
        if (err instanceof Error) {
          if (err.name !== 'AbortError') {
            // This handles fetch-level errors (e.g., network issues)
            enhancedCallbacks.onError?.({ message: err.message })
            // eslint-disable-next-line no-console
            console.error('Failed to create stream:', err)
          }
          // Crucially, call onFinally for ALL errors, including AbortError,
          // to ensure the connection state is cleaned up in the manager.
          enhancedCallbacks.onFinally?.()
        }
      }
    })()

    return controller
  }

  /**
   * Creates and manages a log stream for a given model.
   * @param modelId The ID of the model to get logs for.
   * @param request The request payload.
   * @param callbacks Callbacks to handle stream events.
   * @returns An AbortController to manually stop the stream.
   */
  public createAttackerLogStream(
    modelId: string,
    request: LogRequest,
    callbacks: StreamCallbacks<unknown>
  ) {
    const streamId = `attacker-log-${modelId}`
    const url = `${attackerAgentURL}/v1/logs/log/completions`
    return this.createStream(streamId, url, request, callbacks)
  }
  public createDefenderLogStream(
    modelId: string,
    request: LogStreamRequest,
    callbacks: StreamCallbacks<unknown>
  ) {
    const streamId = `defender-log-${modelId}`
    const url = `${defenderAgentURL}/api/logs/stream`
    return this.createStream(streamId, url, request, callbacks)
  }

  /**
   * Creates and manages a chat stream for a given model.
   * @param modelId The ID of the model to chat with.
   * @param request The request payload.
   * @param callbacks Callbacks to handle stream events.
   * @returns An AbortController to manually stop the stream.
   */
  public createChatStream(
    modelId: string,
    request: ChatRequest,
    callbacks: StreamCallbacks<unknown>
  ) {
    const streamId = `chat-${modelId}`
    const url = `${attackerAgentURL}/v1/chat/completions`
    return this.createStream(streamId, url, request, callbacks)
  }

  /**
   * Closes an active SSE stream by its ID.
   * @param streamId The unique identifier of the stream to close (e.g., `log-modelId`).
   */
  public closeStream(streamId: string): void {
    const connection = this.connections.get(streamId)
    if (connection) {
      connection.controller.abort()
      // The onFinally callback will handle deletion from the map.
    }
  }

  /**
   * Closes all streams (log and chat) associated with a specific model ID.
   * @param modelId The model ID whose streams should be closed.
   */
  public closeAllStreamsForModel(modelId: string): void {
    this.closeStream(`log-${modelId}`)
    this.closeStream(`chat-${modelId}`)
  }
}

export const agentSSEManager = new AgentSSEManager()
