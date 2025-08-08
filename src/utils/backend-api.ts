import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { useAuthStore } from '@/hooks/use-auth';

// 1. 创建一个基础的 Axios 实例
const backendApiInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. 添加请求拦截器
backendApiInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在请求被发送之前，从 Zustand store 中获取最新的 token
    const { token } = useAuthStore.getState();

    // 如果 token 存在，则添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);


// 3. 导出一个干净的、可供 orval 使用的 mutator 函数
export const backend_api = <T>(
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  // 函数内部调用我们配置好的 Axios 实例
  return backendApiInstance(config);
};

