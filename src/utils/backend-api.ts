import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

// 1. 创建一个基础的 Axios 实例
const backendApiInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. 添加请求拦截器
backendApiInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 localStorage 获取 access_token
    const accessToken = localStorage.getItem('access_token');
    
    // 如果 token 存在，则添加到请求头
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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

