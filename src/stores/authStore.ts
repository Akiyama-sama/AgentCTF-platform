
import Cookies from 'js-cookie'
import { create } from 'zustand'
import {User} from '../types/api'
const ACCESS_TOKEN_KEY = 'auth_access_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'


interface AuthState {
  auth: {
    user: User | null
    accessToken: string
    refreshToken: string
    setUser: (user: User | null) => void
    setTokens: (accessToken: string, refreshToken: string) => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  // 从 Cookies 中初始化 access 和 refresh token
  const initialAccessToken = Cookies.get(ACCESS_TOKEN_KEY) || ''
  const initialRefreshToken = Cookies.get(REFRESH_TOKEN_KEY) || ''

  return {
    auth: {
      user: null,
      accessToken: initialAccessToken,
      refreshToken: initialRefreshToken,
      
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),

      // 新的 setTokens action，同时处理两个 token
      setTokens: (accessToken, refreshToken) =>
        set((state) => {
          Cookies.set(ACCESS_TOKEN_KEY, accessToken)
          Cookies.set(REFRESH_TOKEN_KEY, refreshToken)
          return {
            ...state,
            auth: { ...state.auth, accessToken, refreshToken },
          }
        }),

      // reset action 现在会清除所有认证相关信息
      reset: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN_KEY)
          Cookies.remove(REFRESH_TOKEN_KEY)
          return {
            ...state,
            auth: {
              ...state.auth,
              user: null,
              accessToken: '',
              refreshToken: '',
            },
          }
        }),
    },
  }
})

// 导出一个自定义 hook 以方便使用
export const useAuth = () => useAuthStore((state) => state.auth)