import { InstanceInitRequestContainerPcapMapping } from '@/types/defender-agent'
import {
  getGetDindPacketFilesModelsModelIdDindPacketsGetQueryKey,
  useGetDindPacketFilesModelsModelIdDindPacketsGet,
} from '@/types/docker-manager'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
// Based on the sample response from Postman
export interface DindPacketFile {
  file_path: string
  absolute_path: string
  filename: string
  size: number
  last_modified: string
  created_time: string
}

export interface DindPacketFilesData {
  model_id: string
  packet_files: {
    [containerName: string]: DindPacketFile
  }
  total_containers: number
}

export const useDind = (modelId: string) => {
  const queryClient = useQueryClient()
  const queryKey = getGetDindPacketFilesModelsModelIdDindPacketsGetQueryKey(modelId);
  const cachedStatus = queryClient.getQueryData<DindPacketFilesData>(queryKey);

  const {
    data: dindPacketFilesData,
    isSuccess,
    isLoading,
    isError,
    error,
  } = useGetDindPacketFilesModelsModelIdDindPacketsGet(modelId, {
    query: {
      enabled: !!modelId && !cachedStatus,
      select: (data) => data.data as unknown as DindPacketFilesData,
      retry: 3,
    },
  })

  const dindPackageInfo = useMemo(() => {
    const info: InstanceInitRequestContainerPcapMapping = {}
    const packetFiles = dindPacketFilesData?.packet_files || {}
    const containers = Object.keys(packetFiles)
    for (const container of containers) {
      info[container] = packetFiles[container].absolute_path
    }
    return info
  }, [dindPacketFilesData])

  const dindPackageInfoList = useMemo(() => {
    const packetFiles = dindPacketFilesData?.packet_files || {}
    const containers = Object.keys(packetFiles)
    return containers.map(
      (container) => packetFiles[container].absolute_path
    )
  }, [dindPacketFilesData])

  return {
    dindPackageInfo,
    dindPackageInfoList,
    isLoading,
    isSuccess,
    isError,
    error,
  }
}
