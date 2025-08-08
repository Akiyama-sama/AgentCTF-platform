import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import {
  // --- 当前用户相关 ---
  getGetCurrentUserInfoUsersMeGetQueryKey,
  useChangeCurrentUserPasswordUsersMePasswordPut,
  useGetCurrentUserInfoUsersMeGet,
  // useGetUserInfoUsersUserIdGet,
  useLoginUsersLoginPost,
  useRegisterUsersRegisterPost,
  useUpdateCurrentUserInfoUsersMePut,
  // --- 管理员相关 ---
  getGetAllUsersUsersAdminUsersGetQueryKey,
  useGetAllUsersUsersAdminUsersGet,
  useCreateUserByAdminUsersAdminUsersPost,
  useUpdateUserByAdminUsersAdminUsersUserIdPut,
  useDeleteUserByAdminUsersAdminUsersUserIdDelete,
  useChangePasswordUsersUserIdPasswordPut,
} from '@/types/backend'
// 另外引入管理员列表参数类型
import type { GetAllUsersUsersAdminUsersGetParams } from '@/types/backend'
import {
  showErrorMessage,
  showSuccessMessage,
} from '@/utils/show-submitted-data'

// 1. 使用 Zustand 创建一个持久化的 store 来存储认证 token
interface AuthState {
  token: string | null
  setToken: (token: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      setToken: token => set({ token }),
    }),
    {
      name: 'access_token', // localStorage 中的 key
    },
  ),
)

/**
 * 核心认证 Hook
 *
 * 封装了获取当前用户、登录、注册、登出、更新信息等所有与用户认证相关的功能。
 */
export const useAuth = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { setToken } = useAuthStore()

  // 2. 获取当前登录用户的信息
  const { data: user, ...userQuery } = useGetCurrentUserInfoUsersMeGet({
    query: {
      enabled: !import.meta.env.DEV ,
      // 如果查询失败，重试1次
      retry: 1,
      // 从响应中选择 `data` 字段作为查询结果
      select: response => response.data ?? null,
    },
  })

  // 3. 登录 Mutation
  const loginMutation = useLoginUsersLoginPost({
    mutation: {
      onSuccess: res => {
        const accessToken = res.data?.access_token
        if (accessToken) {
          setToken(accessToken)
          
          // 登录成功后，让当前用户的 query 失效以重新获取最新数据
          queryClient.invalidateQueries({
            queryKey: getGetCurrentUserInfoUsersMeGetQueryKey(),
          })
          // 跳转到首页
          navigate({ to: '/' })
        } else {
          showErrorMessage('登录失败: 未收到 token')
        }
      },
      onError: error => {
        showErrorMessage('登录失败', error?.detail)
      },
    },
  })

  // 4. 登出逻辑
  const logout = () => {
    setToken(null)
    // 清除缓存中的用户数据
    queryClient.setQueryData(getGetCurrentUserInfoUsersMeGetQueryKey(), null)
    // 可以考虑清除所有 query-cache
    // queryClient.clear()
    navigate({ to: '/sign-in-2' })
  }

  // 5. 注册 Mutation
  const registerMutation = useRegisterUsersRegisterPost({
    mutation: {
      onSuccess: () => {
        showSuccessMessage('注册成功，请登录')
        navigate({ to: '/sign-in-2' })
      },
      onError: error => {
        showErrorMessage('注册失败', error?.detail)
      },
    },
  })

  // 6. 更新当前用户信息 Mutation
  const updateUserMutation = useUpdateCurrentUserInfoUsersMePut({
    mutation: {
      onSuccess: res => {
        // 更新成功后，直接用返回的新用户信息更新缓存
        queryClient.setQueryData(
          getGetCurrentUserInfoUsersMeGetQueryKey(),
          res.data,
        )
      },
      onError: error => {
        showErrorMessage('更新失败', error?.detail)
      },
    },
  })

  // 7. 修改当前用户密码 Mutation
  const changePasswordMutation = useChangeCurrentUserPasswordUsersMePasswordPut({
    mutation: {
      onSuccess: () => {
        showSuccessMessage('密码修改成功')
      },
      onError: error => {
        showErrorMessage('修改密码失败', error?.detail)
      },
    },
  })

  return {
    // --- 状态 ---
    user,
    userQuery,
    isAuthenticated: import.meta.env.DEV || !!user, // 开发模式下总是认为已认证
    isLoading: userQuery.isLoading,

    // --- 方法 ---
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,

    logout,

    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,

    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,
    isUpdatingUser: updateUserMutation.isPending,

    changePassword: changePasswordMutation.mutate,
    changePasswordAsync: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
  }
}


/* 
管理员权限
 */
export const useAdmin = () => {
  const queryClient = useQueryClient()

  // 用于控制列表查询参数（分页等）
  const [listParams, setListParams] = useState<GetAllUsersUsersAdminUsersGetParams>()

  // 1. 获取用户列表 Query
  const { data: usersResponse, ...usersQuery } = useGetAllUsersUsersAdminUsersGet(listParams, {
    query: {
      select: response => response.data ?? null,
    },
  })

  // 2. 创建用户 Mutation
  const createUserMutation = useCreateUserByAdminUsersAdminUsersPost({
    mutation: {
      onSuccess: () => {
        showSuccessMessage('用户创建成功')
        // 创建成功后刷新用户列表
        queryClient.invalidateQueries({
          queryKey: getGetAllUsersUsersAdminUsersGetQueryKey(listParams),
        })
      },
      onError: error => {
        showErrorMessage('创建用户失败', error?.detail)
      },
    },
  })

  // 3. 更新用户 Mutation
  const updateUserMutation = useUpdateUserByAdminUsersAdminUsersUserIdPut({
    mutation: {
      onSuccess: () => {
        showSuccessMessage('用户信息更新成功')
        queryClient.invalidateQueries({
          queryKey: getGetAllUsersUsersAdminUsersGetQueryKey(listParams),
        })
      },
      onError: error => {
        showErrorMessage('更新用户失败', error?.detail)
      },
    },
  })

  // 4. 删除用户 Mutation
  const deleteUserMutation = useDeleteUserByAdminUsersAdminUsersUserIdDelete({
    mutation: {
      onSuccess: () => {
        showSuccessMessage('用户删除成功')
        queryClient.invalidateQueries({
          queryKey: getGetAllUsersUsersAdminUsersGetQueryKey(listParams),
        })
      },
      onError: error => {
        showErrorMessage('删除用户失败', error?.detail)
      },
    },
  })

  // 5. 修改指定用户密码 Mutation
  const changeUserPasswordMutation = useChangePasswordUsersUserIdPasswordPut({
    mutation: {
      onSuccess: () => {
        showSuccessMessage('密码修改成功')
      },
      onError: error => {
        showErrorMessage('修改密码失败', error?.detail)
      },
    },
  })

  return {
    // --- 列表与状态 ---
    users: usersResponse?.users ?? [],
    total: usersResponse?.total ?? 0,
    skip: usersResponse?.skip ?? 0,
    limit: usersResponse?.limit ?? 0,
    usersQuery,

    listParams,
    setListParams,

    // --- 创建用户 ---
    createUser: createUserMutation.mutate,
    createUserAsync: createUserMutation.mutateAsync,
    isCreatingUser: createUserMutation.isPending,

    // --- 更新用户 ---
    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,
    isUpdatingUser: updateUserMutation.isPending,

    // --- 删除用户 ---
    deleteUser: deleteUserMutation.mutate,
    deleteUserAsync: deleteUserMutation.mutateAsync,
    isDeletingUser: deleteUserMutation.isPending,

    // --- 修改用户密码 ---
    changePassword: changeUserPasswordMutation.mutate,
    changePasswordAsync: changeUserPasswordMutation.mutateAsync,
    isChangingPassword: changeUserPasswordMutation.isPending,

    // --- 其他工具方法 ---
    refreshUsers: () =>
      queryClient.invalidateQueries({
        queryKey: getGetAllUsersUsersAdminUsersGetQueryKey(listParams),
      }),
  }
}
