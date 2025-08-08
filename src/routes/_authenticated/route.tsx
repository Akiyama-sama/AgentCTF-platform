import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/hooks/use-auth'
import { getGetCurrentUserInfoUsersMeGetQueryOptions } from '@/types/backend'
import { showErrorMessage } from '@/utils/show-submitted-data'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    const { queryClient } = context
    const { token } = useAuthStore.getState()
    
    // 1. 如果没有 token，直接重定向
    if (!token) {
      throw redirect({
        to: '/sign-in-2',
        search: {
          redirect: location.href,
        },
      })
    }

    // 2. 如果有 token，尝试获取用户信息
    try {
      const userQueryOptions = getGetCurrentUserInfoUsersMeGetQueryOptions()
      const user = await queryClient.fetchQuery(userQueryOptions).then(res=>res.data).catch(err=>{
        showErrorMessage('获取用户信息失败，请重新登录',err)
        throw redirect({
          to: '/sign-in-2',
          search: {
            redirect: location.href,
          },
        })
      })

      if(!user.is_active){
        showErrorMessage('用户账户处于未激活状态，请联系管理员')
        throw redirect({
          to: '/sign-in-2',
          search: {
            redirect: location.href,
          },
        })
      }
      // 3. 检查用户是否存在且处于激活状态
      if (!user?.is_active) {
        throw new Error('User not active or not found')
      }
      
      
      return {
        user: user
      }
    } catch (_error) {
      // 5. 获取用户信息失败，清除 token 并重定向
      useAuthStore.getState().setToken(null)
      throw redirect({
        to: '/sign-in-2',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})
