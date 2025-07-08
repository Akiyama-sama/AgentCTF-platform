import api from '@/utils/backend-api'
import type {
  ChangePassword,
  EmailRequest,
  RefreshToken,
  RegisterRequest,
  Token,
  UserLogin,
  UserOut,
  UserUpdate,
} from '@/types/backend'

/**
 * 用户注册
 * @param data 用户注册信息
 */
export const register = async (data: RegisterRequest) => {
  const response = await api.post<UserOut>('/users/register', data)
  return response
}

/**
 * 用户登录
 * @param data 用户登录信息
 */
export const login = async (data: UserLogin) => {
  const response = await api.post<Token>('/users/login', data)
  return response
}

/**
 * 刷新令牌
 * @param data 刷新令牌
 */
export const refreshToken = async (data: RefreshToken) => {
  const response = await api.post<Token>('/users/refresh', data)
  return response
}

/**
 * 用户登出
 * @param data 刷新令牌
 */
export const logout = async (data: RefreshToken) => {
  const response = await api.post('/users/logout', data)
  return response
}

/**
 * 发送邮箱验证码
 * @param data 邮箱信息
 */
export const requestVerification = async (data: EmailRequest) => {
  const response = await api.post('/users/request-verification', data)
  return response
}

/**
 * 获取指定用户信息
 * @param user_id 用户ID
 */
export const getUserInfo = async (user_id: string) => {
  const response = await api.get<UserOut>(`/users/${user_id}`)
  return response
}

/**
 * 更新指定用户信息
 * @param user_id 用户ID
 * @param data 用户更新信息
 */
export const updateUserInfo = async (user_id: string, data: UserUpdate) => {
  const response = await api.put<UserOut>(`/users/${user_id}`, data)
  return response
}

/**
 * 修改指定用户密码
 * @param user_id 用户ID
 * @param data 新旧密码
 */
export const changePassword = async (
  user_id: string,
  data: ChangePassword,
) => {
  const response = await api.put(`/users/${user_id}/password`, data)
  return response
}

/**
 * 获取当前用户信息
 */
export const getCurrentUserInfo = async () => {
  const response = await api.get<UserOut>('/users/me')
  return response
}

/**
 * 更新当前用户信息
 * @param data 用户更新信息
 */
export const updateCurrentUserInfo = async (data: UserUpdate) => {
  const response = await api.put<UserOut>('/users/me', data)
  return response
}

/**
 * 修改当前用户密码
 * @param data 新旧密码
 */
export const changeCurrentUserPassword = async (data: ChangePassword) => {
  const response = await api.put('/users/me/password', data)
  return response
}

