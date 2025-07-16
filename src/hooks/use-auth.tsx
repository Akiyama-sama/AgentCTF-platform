import { useQueryClient } from '@tanstack/react-query';
import {
  useChangeCurrentUserPasswordUsersMePasswordPut,
  useGetCurrentUserInfoUsersMeGet,
  useLoginUsersLoginPost,
  useLogoutUsersLogoutPost,
  useRegisterUsersRegisterPost,
  useUpdateCurrentUserInfoUsersMePut,
  getGetCurrentUserInfoUsersMeGetQueryKey,
  type Token,
  type HTTPValidationError,
  type UserOut,
} from '@/types/backend';
import { AxiosError } from 'axios';

// 辅助函数，用于管理 localStorage 中的 token
const setToken = (token: Token | null) => {
  if (token) {
    localStorage.setItem('access_token', token.access_token);
    localStorage.setItem('refresh_token', token.refresh_token);
  } else {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

/**
 * 核心身份验证 Hook。
 * 用于管理当前用户的登录状态，并提供登录、注销、注册等核心功能。
 * @returns 返回包含用户、认证状态和操作函数的对象。
 */
export const useAuth = () => {
  const queryClient = useQueryClient();

  // 获取当前登录用户的信息
  const { data: user, ...userQuery } = useGetCurrentUserInfoUsersMeGet<
    UserOut,
    AxiosError<HTTPValidationError>
  >({
    query: {
      // 仅当 access_token 存在时才执行此查询
      enabled: !!localStorage.getItem('access_token'),
      // 自定义重试逻辑
      retry: (failureCount, error) => {
        // 如果收到 401 Unauthorized 错误，说明 token 失效
        if (error.response?.status === 401) {
          // 清除本地 token 并停止重试
          setToken(null);
          // 立即清除缓存中的用户数据
          queryClient.setQueryData(getGetCurrentUserInfoUsersMeGetQueryKey(), null);
          return false;
        }
        // 对于其他错误，最多重试 3 次
        return failureCount < 2;
      },
    },
  });

  // 登录 mutation
  const loginMutation = useLoginUsersLoginPost({
    mutation: {
      onSuccess: (data) => {
        // 登录成功后，保存 token
        setToken(data.data);
        // 并使当前用户信息的 query 失效，以触发刷新
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserInfoUsersMeGetQueryKey() });
      },
    },
  });

  // 注销 mutation
  const logoutMutation = useLogoutUsersLogoutPost();

  /**
   * 封装的注销函数。
   * 调用 API 通知后端注销，并清除本地状态。
   */
  const logout = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        // 调用后端 API 注销
        await logoutMutation.mutateAsync({ data: { refresh_token: refreshToken } });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Logout API call failed, but clearing local state anyway.", error);
      }
    }
    // 无论 API 调用是否成功，都清除本地的 token 和所有缓存
    setToken(null);
    queryClient.clear();
  };

  // 注册 mutation
  const registerMutation = useRegisterUsersRegisterPost();

  return {
    // 如果查询未启用或正在加载，user 为 undefined，我们返回 null
    user: user ?? null,
    // 登录
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    // 注销
    logout,
    logoutAsync: logout,
    isLoggingOut: logoutMutation.isPending,
    // 注册
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    // 初始认证状态检查
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,
    error: userQuery.error,
  };
};

/**
 * 用于管理当前用户个人资料的 Hook。
 * 提供更新个人信息和修改密码的功能。
 * @returns 返回包含更新和修改密码操作函数的对象。
 */
export const useUser = () => {
    const queryClient = useQueryClient();

    const invalidateUserQueries = () => {
        // 操作成功后，让当前用户信息的 query 失效以获取最新数据
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserInfoUsersMeGetQueryKey() });
    }

    // 更新个人信息 mutation
    const updateProfileMutation = useUpdateCurrentUserInfoUsersMePut({
        mutation: {
            onSuccess: (updatedUser) => {
                // 为了更好的用户体验，可以乐观地更新缓存数据
                queryClient.setQueryData(getGetCurrentUserInfoUsersMeGetQueryKey(), updatedUser.data);
                // 之后仍然触发一次后台刷新以确保数据一致性
                invalidateUserQueries();
            }
        }
    });

    // 修改密码 mutation
    const changePasswordMutation = useChangeCurrentUserPasswordUsersMePasswordPut({
        mutation: {
            onSuccess: () => {
                // 修改密码后，可以根据产品需求执行特定操作，
                // 例如提示用户、或强制重新登录。
                // 此处我们不执行全局操作，交由调用组件处理。
            }
        }
    });
    
    return {
        // 更新个人信息
        updateProfile: updateProfileMutation.mutate,
        updateProfileAsync: updateProfileMutation.mutateAsync,
        isUpdatingProfile: updateProfileMutation.isPending,
        // 修改密码
        changePassword: changePasswordMutation.mutate,
        changePasswordAsync: changePasswordMutation.mutateAsync,
        isChangingPassword: changePasswordMutation.isPending,
    };
}
