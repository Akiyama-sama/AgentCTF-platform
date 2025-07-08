import axios, { 
  AxiosInstance, 
  AxiosError, 
  InternalAxiosRequestConfig, 
  AxiosRequestConfig,
  AxiosResponse
} from 'axios';
import { useAuthStore } from '../stores/authStore'; // 确保路径正确

/**
 * Token 管理器
 * 这是一个关键的适配器，它允许 axios 拦截器（非 React 环境）
 * 与 zustand store 进行同步通信。
 */
const tokenManager = {
  getAccessToken: () => useAuthStore.getState().auth.accessToken,
  getRefreshToken: () => useAuthStore.getState().auth.refreshToken,
  setTokens: (accessToken: string, refreshToken: string) =>
    useAuthStore.getState().auth.setTokens(accessToken, refreshToken),
  clearTokens: () => useAuthStore.getState().auth.reset(),
};


declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _isRetry?: boolean; // 自定义属性，用于标记是否为重试请求
  }
}

// 1. 创建内部使用的 Axios 实例，并附加所有拦截器逻辑

const backendApiInstance: AxiosInstance = axios.create({
  baseURL: process.env.BASE_URL || 'http://localhost:8080/api', // 建议为环境变量提供一个备用值
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- 请求拦截器 (附加到内部实例) ---
backendApiInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// --- 响应拦截器 (附加到内部实例) ---
backendApiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    if (error.response?.status === 401 && originalRequest && !originalRequest._isRetry) {
      originalRequest._isRetry = true;

      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        tokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // 重要：刷新 token 的请求应该使用一个不带拦截器的干净实例，或者像这里一样依赖 _isRetry 标志
        const response = await axios.post( (process.env.BASE_URL || '') + '/users/refresh', {
          refreshToken: refreshToken,
        });
        
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        tokenManager.setTokens(newAccessToken, newRefreshToken);

        if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        
        // 关键：重新发起请求时，使用我们配置好的内部实例
        return backendApiInstance(originalRequest);

      } catch (refreshError) {
        tokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);



export const backend_api = <T>(
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  // 函数内部调用我们上面完全配置好的 Axios 实例
  return backendApiInstance(config);
};

