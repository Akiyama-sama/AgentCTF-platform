import api from '@/utils/backend-api'
import type {
  ApiResponse,
  ApiResponseComposeStatusResponse,
  ApiResponseCreateExerciseWithFilesResponse,
  ApiResponseExerciseResponse,
  ApiResponseListContainerStatusResponse,
  ApiResponseListExerciseResponse,
  PartialUpdateExerciseRequest,
  UpdateExerciseRequest,
  UpdateExerciseStateRequest,
} from '@/types/docker-manager'

/**
 * 获取所有练习列表
 */
export const getExercises = async () => {
  const response =
    await api.get<ApiResponseListExerciseResponse>('/exercises')
  return response.data
}

/**
 * 创建新练习
 * @param data 练习数据，包含名称、描述和靶机文件
 */
export const createExercise = async (data: {
  name: string
  description: string
  target_file: File
}) => {
  const formData = new FormData()
  formData.append('name', data.name)
  formData.append('description', data.description)
  formData.append('target_file', data.target_file)

  const response = await api.post<ApiResponseCreateExerciseWithFilesResponse>(
    '/exercises',
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
 * 获取指定练习详情
 * @param exercise_id 练习ID
 */
export const getExercise = async (exercise_id: string) => {
  const response = await api.get<ApiResponseExerciseResponse>(
    `/exercises/${exercise_id}`,
  )
  return response.data
}

/**
 * 完整更新练习信息
 * @param exercise_id 练习ID
 * @param data 更新数据
 */
export const updateExercise = async (
  exercise_id: string,
  data: UpdateExerciseRequest,
) => {
  const response = await api.put<ApiResponseExerciseResponse>(
    `/exercises/${exercise_id}`,
    data,
  )
  return response.data
}

/**
 * 删除练习
 * @param exercise_id 练习ID
 */
export const deleteExercise = async (exercise_id: string) => {
  const response = await api.delete<ApiResponse>(`/exercises/${exercise_id}`)
  return response.data
}

/**
 * 更新练习状态
 * @param exercise_id 练习ID
 * @param data 操作
 */
export const updateExerciseState = async (
  exercise_id: string,
  data: UpdateExerciseStateRequest,
) => {
  const response = await api.patch<ApiResponse>(
    `/exercises/${exercise_id}`,
    data,
  )
  return response.data
}

/**
 * 部分更新练习信息
 * @param exercise_id 练习ID
 * @param data 部分更新数据
 */
export const partialUpdateExercise = async (
  exercise_id: string,
  data: PartialUpdateExerciseRequest,
) => {
  const response = await api.patch<ApiResponseExerciseResponse>(
    `/exercises/${exercise_id}/info`,
    data,
  )
  return response.data
}

/**
 * 获取练习状态
 * @param exercise_id 练习ID
 */
export const getExerciseStatus = async (exercise_id: string) => {
  const response = await api.get<ApiResponseComposeStatusResponse>(
    `/exercises/${exercise_id}/status`,
  )
  return response.data
}

/**
 * 获取练习容器信息
 * @param exercise_id 练习ID
 */
export const getExerciseContainers = async (exercise_id: string) => {
  const response = await api.get<ApiResponseListContainerStatusResponse>(
    `/exercises/${exercise_id}/containers`,
  )
  return response.data
}

/**
 * 流式获取练习构建日志
 * @param exercise_id 练习ID
 */
export const streamExerciseBuildLogs = (exercise_id: string) => {
  return `/logs/stream/exercise/${exercise_id}/build`
}

/**
 * 流式获取练习容器日志
 * @param exercise_id 练习ID
 */
export const streamExerciseContainerLogs = (exercise_id: string) => {
  return `/logs/stream/exercise/${exercise_id}/container`
}

/**
 * 流式获取练习日志
 * @param exercise_id 练习ID
 */
export const streamExerciseLogs = (exercise_id: string) => {
  return `/logs/stream/exercise/${exercise_id}`
}
