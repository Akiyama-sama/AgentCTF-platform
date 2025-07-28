import Log from '@/components/log'
import { useContainerLogs } from '@/hooks/use-log'
import { useEffect } from 'react'

interface ContainerLogProps {
  modelId: string
  containerName: string
  className?: string
}

export const ContainerLog = ({ modelId, containerName, className }: ContainerLogProps) => {
  const { containerLogs, createContainerConnection, closeContainerConnection } = useContainerLogs()
  const containerId = `${modelId}-${containerName}`
  const logs = containerLogs[containerId]?.logs || []

  useEffect(() => {
    if (modelId && containerName) {
      createContainerConnection(modelId, containerName)
    }

    return () => {
      if (modelId && containerName) {
        closeContainerConnection(modelId, containerName)
      }
    }
  }, [modelId, containerName, createContainerConnection, closeContainerConnection])

  return (
    <Log logs={logs} className={className} />
  )
}