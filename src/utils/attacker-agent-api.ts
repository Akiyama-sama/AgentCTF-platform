// ./src/utils/docker-manager-api.ts

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// 1. 保留您创建的 Axios 实例，但可以给它换个名字以避免混淆
const attackerAgentApiInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3002', // 建议提供一个备用值
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
attackerAgentApiInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error);
  }
)

export const attacker_agent_api = <T>(
  config: AxiosRequestConfig,
): Promise<T> => { // 返回完整的 AxiosResponse 更灵活
  // 函数内部使用您上面创建的实例来发起请求
  return attackerAgentApiInstance({
    ...config,
  });
};
