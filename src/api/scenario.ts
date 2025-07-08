import api from '@/utils/backend-api'
import type {
  ApiResponse,
  ApiResponseComposeStatusResponse,
  ApiResponseCreateScenarioWithFilesResponse,
  ApiResponseListContainerStatusResponse,
  ApiResponseListScenarioResponse,
  ApiResponseScenarioResponse,
  PartialUpdateScenarioRequest,
  SetScenarioStateRequest,
  UpdateScenarioRequest,
  UpdateScenarioStateRequest,
} from '@/types/docker-manager'

/**
 * 获取所有场景列表
 */
export const getScenarios = async () => {
  const response =
    await api.get<ApiResponseListScenarioResponse>('/scenarios')
  return response.data
}

/**
 * 创建新场景
 * @param data 场景数据，包含名称、描述和三个文件
 */
export const createScenario = async (data: {
  name: string
  description: string
  attacker_file: File
  defender_file: File
  target_file: File
}) => {
  const formData = new FormData()
  formData.append('name', data.name)
  formData.append('description', data.description)
  formData.append('attacker_file', data.attacker_file)
  formData.append('defender_file', data.defender_file)
  formData.append('target_file', data.target_file)

  const response = await api.post<ApiResponseCreateScenarioWithFilesResponse>(
    '/scenarios',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return response.data
}

/**
 * 获取指定场景详情
 * @param scenario_id 场景ID
 */
export const getScenario = async (scenario_id: string) => {
  const response = await api.get<ApiResponseScenarioResponse>(
    `/scenarios/${scenario_id}`,
  )
  return response.data
}

/**
 * 完整更新场景信息
 * @param scenario_id 场景ID
 * @param data 更新数据
 */
export const updateScenario = async (
  scenario_id: string,
  data: UpdateScenarioRequest,
) => {
  const response = await api.put<ApiResponseScenarioResponse>(
    `/scenarios/${scenario_id}`,
    data,
  )
  return response.data
}

/**
 * 删除场景
 * @param scenario_id 场景ID
 */
export const deleteScenario = async (scenario_id: string) => {
  const response = await api.delete<ApiResponse>(`/scenarios/${scenario_id}`)
  return response.data
}

/**
 * 更新场景状态（RESTful方式）
 * @param scenario_id 场景ID
 * @param data 操作
 */
export const updateScenarioState = async (
  scenario_id: string,
  data: UpdateScenarioStateRequest,
) => {
  const response = await api.patch<ApiResponse>(
    `/scenarios/${scenario_id}`,
    data,
  )
  return response.data
}

/**
 * 部分更新场景信息
 * @param scenario_id 场景ID
 * @param data 部分更新数据
 */
export const partialUpdateScenario = async (
  scenario_id: string,
  data: PartialUpdateScenarioRequest,
) => {
  const response = await api.patch<ApiResponseScenarioResponse>(
    `/scenarios/${scenario_id}/info`,
    data,
  )
  return response.data
}

/**
 * 设置场景状态（独立状态资源）
 * @param scenario_id 场景ID
 * @param data 状态数据
 */
export const setScenarioState = async (
  scenario_id: string,
  data: SetScenarioStateRequest,
) => {
  const response = await api.put<ApiResponse>(
    `/scenarios/${scenario_id}/state`,
    data,
  )
  return response.data
}

/**
 * 获取场景状态
 * @param scenario_id 场景ID
 */
export const getScenarioStatus = async (scenario_id: string) => {
  const response = await api.get<ApiResponseComposeStatusResponse>(
    `/scenarios/${scenario_id}/status`,
  )
  return response.data
}

/**
 * 获取场景中的所有容器
 * @param scenario_id 场景ID
 */
export const getScenarioContainers = async (scenario_id: string) => {
  const response = await api.get<ApiResponseListContainerStatusResponse>(
    `/scenarios/${scenario_id}/containers`,
  )
  return response.data
}

/**
 * 流式获取场景构建日志
 * @param scenario_id 场景ID
 */
export const streamScenarioBuildLogs = (scenario_id: string) => {
  return `/logs/stream/scenario/${scenario_id}/build`
}

/**
 * 流式获取场景容器日志
 * @param scenario_id 场景ID
 */
export const streamScenarioContainerLogs = (scenario_id: string) => {
  return `/logs/stream/scenario/${scenario_id}/containers`
}

/**
 * 流式获取场景日志
 * @param scenario_id 场景ID
 */
export const streamScenarioLogs = (scenario_id: string) => {
  return `/logs/stream/scenario/${scenario_id}`
}

/**
 * 流式获取指定容器的日志
 * @param scenario_id 场景ID
 * @param container_name 容器名
 */
export const streamContainerLogs = (
  scenario_id: string,
  container_name: string,
) => {
  return `/logs/stream/scenario/${scenario_id}/container/${container_name}`
}



