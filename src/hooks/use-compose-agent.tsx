import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  // Orval-generated hooks and functions
  useRootGet,
  useListWorkspacesApiWorkspacesGet,
  useGetWorkspaceApiWorkspacesNameGet,
  useDeleteWorkspaceApiWorkspacesNameDelete,
  useDownloadWorkspaceApiWorkspacesNameDownloadGet,
  // Query key factories
  getListWorkspacesApiWorkspacesGetQueryKey,
  getGetWorkspaceApiWorkspacesNameGetQueryKey,
  // Types
  type HTTPValidationError,
  StreamApiStreamPostBody,
} from '@/types/compose-agent'
import {
  showSuccessMessage,
  showErrorMessage,
} from '@/utils/show-submitted-data'

export interface FileNode {
  name: string
  type: 'directory' | 'file'
  size?: number
  children?: FileNode[]
}

const composeAgentStreamURL = import.meta.env.VITE_COMPOSE_URL

export type WorkspaceDetail = FileNode[]

export type AgentEvent =
  | { type: 'agent_start'; data: { session: string; description: string } }
  | { type: 'agent_finish'; data: { result: { name: string; readme: string } } }
  | { type: 'agent_error'; data: { error: string; details?: string } }
  | { type: 'think_stream'; data: { step: number; chunk: string } }
  | { type: 'chat_stream'; data: { step: number; chunk: string } }
  | {
      type: 'tool_prep'
      data: { step: number; index: number; name: string }
    }
  | {
      type: 'tool_args_stream'
      data: { step: number; index: number; chunk: string }
    }
  | {
      type: 'tool_call'
      data: { step: number; name: string; arguments: Record<string, unknown> }
    }
  | {
      type: 'tool_result'
      data: { step: number; output: unknown }
    }
  | {
      type: 'token_usage'
      data: {
        step: number
        usage: { prompt: number; completion: number; total: number }
      }
    }
  | { type: 'message'; data: { text: string } }
  | { type: '__end__'; data: Record<string, never> }

type AgentEventListener = (event: AgentEvent) => void

let controller: AbortController | null = null
const listeners = new Set<AgentEventListener>()

const subscribe = (callback: AgentEventListener) => {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

const dispatch = (event: AgentEvent) => {
  for (const listener of listeners) {
    listener(event)
  }
}

const processStream = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        dispatch({ type: '__end__', data: {} })
        break
      }

      buffer += decoder.decode(value, { stream: true })

      while (true) {
        const separatorIndex = buffer.indexOf('\n\n')
        if (separatorIndex === -1) break

        const rawEvent = buffer.slice(0, separatorIndex)
        buffer = buffer.slice(separatorIndex + 2)

        const dataLine = rawEvent
          .split('\n')
          .find((line) => line.startsWith('data:'))
        if (dataLine) {
          const jsonData = dataLine.substring(5).trim()
          try {
            const event = JSON.parse(jsonData) as AgentEvent
            dispatch(event)
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Invalid SSE JSON:', jsonData, error)
            dispatch({
              type: 'agent_error',
              data: { error: 'Invalid SSE JSON received', details: jsonData },
            })
          }
        }
      }
    }
  } catch (error) {
    if (controller?.signal.aborted) {
      dispatch({ type: '__end__', data: {} })
    } else {
      // eslint-disable-next-line no-console
      console.error('Stream processing error:', error)
      const message = error instanceof Error ? error.message : String(error)
      dispatch({
        type: 'agent_error',
        data: { error: 'Stream processing error', details: message },
      })
    }
  } finally {
    controller = null
  }
}

const startStreamInternal = async (body: StreamApiStreamPostBody) => {
  if (controller) {
    controller.abort()
  }
  controller = new AbortController()
  const url = `${composeAgentStreamURL}/api/stream`
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!response.ok || !response.body) {
      const errorText = await response.text()
      throw new Error(
        `HTTP Error: ${response.status} ${response.statusText}\n${errorText}`
      )
    }

    const reader = response.body.getReader()
    await processStream(reader)
  } catch (error) {
    if (controller?.signal.aborted) {
      // eslint-disable-next-line no-console
      console.log('Stream aborted by user.')
    } else {
      // eslint-disable-next-line no-console
      console.log('Failed to connect to stream:', error)
      const message = error instanceof Error ? error.message : String(error)
      dispatch({
        type: 'agent_error',
        data: { error: 'Failed to connect', details: message },
      })
    }
    controller = null
  }
}

const stopStreamInternal = () => {
  if (controller) {
    controller.abort()
    controller = null
  }
}

export const useAgentStream = () => {
  const [logs, setLogs] = useState<AgentEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const handleEvent = (event: AgentEvent) => {
      if (event.type === 'agent_start') {
        setIsConnected(true)
        setLogs([event])
      } else {
        setLogs((prevLogs) => [...prevLogs, event])
      }

      if (event.type === '__end__' || event.type === 'agent_error') {
        setIsConnected(false)
      }
    }

    const unsubscribe = subscribe(handleEvent)
    return () => {
      unsubscribe()
    }
  }, [])

  const startStream = useCallback((body: StreamApiStreamPostBody) => {
    // Non-blocking call
    void startStreamInternal(body)
  }, [])

  const stopStream = useCallback(() => {
    stopStreamInternal()
    setLogs([])
  }, [])

  return {
    logs,
    isConnected,
    startStream,
    stopStream,
  }
}

// 3. New Hooks for other endpoints

/**
 * A simple hook for the root endpoint.
 */
export const useGetRoot = () => {
  return useRootGet({})
}

interface Workspaces {
  root: string
  items: string[]
}

/**
 * Hook to fetch the list of all workspaces.
 */
export const useWorkspaces = () => {
  const { data: workspaces, ...rest } = useListWorkspacesApiWorkspacesGet({
    query: {
      // Assuming the API returns an object with a data property
      // that is an array of workspaces. Modify if the shape is different.
      select: (response: unknown): string[] | null => {
        return (response as { data: Workspaces })?.data?.items ?? null
      },
    },
  })

  return {
    workspaces,
    ...rest,
  }
}

/**
 * Hook to manage a single workspace, including fetching details and deleting it.
 * @param workspaceName - The name of the workspace to manage.
 */
export const useWorkspace = (workspaceName: string | null) => {
  const queryClient = useQueryClient()
  const isEnabled = !!workspaceName

  const { data: workspace, ...workspaceQuery } =
    useGetWorkspaceApiWorkspacesNameGet(workspaceName!, {
      query: {
        enabled: isEnabled,
        // Assuming the response has a `data` property with the workspace details
        select: (response: unknown): WorkspaceDetail | null =>
          (response as { data: WorkspaceDetail })?.data ?? null,
      },
    })

  const invalidateWorkspaceQueries = () => {
    if (!workspaceName) return
    // Invalidate the list of all workspaces
    queryClient.invalidateQueries({
      queryKey: getListWorkspacesApiWorkspacesGetQueryKey(),
    })
    // Invalidate the specific workspace
    queryClient.invalidateQueries({
      queryKey: getGetWorkspaceApiWorkspacesNameGetQueryKey(workspaceName),
    })
  }

  const deleteMutation = useDeleteWorkspaceApiWorkspacesNameDelete({
    mutation: {
      onSuccess: () => {
        showSuccessMessage(`靶机 "${workspaceName}" 删除成功.`)
        invalidateWorkspaceQueries()
      },
      onError: (error: HTTPValidationError) => {
        showErrorMessage(
          `删除靶机 "${workspaceName}" 失败.`,
          error.detail
        )
      },
    },
  })

  if (!isEnabled) {
    const noOpAsync = async () => Promise.resolve(new Response())
    const noOp = () => {}

    return {
      workspace: null,
      workspaceQuery: { isInitialLoading: false },
      deleteWorkspace: noOp,
      deleteWorkspaceAsync: noOpAsync,
      isDeleting: false,
    }
  }

  return {
    workspace,
    workspaceQuery,
    deleteWorkspace: deleteMutation.mutate,
    deleteWorkspaceAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}

/**
 * Hook to handle downloading a workspace.
 * This can be a simple query that is manually triggered.
 * @param workspaceName - The name of the workspace to download.
 */
export const useDownloadWorkspace = (workspaceName: string | null) => {
  const isEnabled = !!workspaceName

  // This query will be disabled by default and can be triggered manually.
  const { refetch, ...rest } = useDownloadWorkspaceApiWorkspacesNameDownloadGet(
    workspaceName!,
    {
      query: {
        enabled: false, // Only trigger manually
        select: (response: unknown) => {
          // You might want to handle file downloads here.
          // For now, we just return the raw response.
          return response
        },
      },
    }
  )

  const download = async () => {
    if (!workspaceName) return
    try {
      const { data } = await refetch()
      // Create a Blob from the response data and trigger a download
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/zip', // Adjust content type as needed
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${workspaceName}.zip` // Or whatever the filename should be
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error: unknown) {
      const err = error as { detail?: HTTPValidationError['detail'] }
      showErrorMessage(
        `Failed to download workspace "${workspaceName}".`,
        err?.detail
      )
    }
  }

  if (!isEnabled) {
    return {
      download: async () => {},
      ...rest,
    }
  }

  return {
    download,
    ...rest,
  }
}
