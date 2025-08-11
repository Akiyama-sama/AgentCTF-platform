import { InstanceInitRequestContainerPcapMapping } from '@/types/defender-agent'
import { useGetDindPacketFilesModelsModelIdDindPacketsGet } from '@/types/docker-manager'

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
  const {
    data: dindPacketFilesData,
    isLoading,
    isError,
    error,
  } = useGetDindPacketFilesModelsModelIdDindPacketsGet(modelId, {
    query: {
      select: (data) => data.data as unknown as DindPacketFilesData,
    },
  })
  const packetFiles=dindPacketFilesData?.packet_files || {}
  const containers=Object.keys(packetFiles)
  const dindPackageInfo:InstanceInitRequestContainerPcapMapping={}
  for(const container of containers){
    dindPackageInfo[container]=packetFiles[container].absolute_path
  }
  const dindPackageInfoList=containers.map((container)=>(packetFiles[container].absolute_path))
  return {
    dindPackageInfo,
    dindPackageInfoList,
    isLoading,
    isError,
    error,
  }
}
