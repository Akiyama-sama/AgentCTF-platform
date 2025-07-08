// ./src/utils/docker-manager-api.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 1. 保留您创建的 Axios 实例，但可以给它换个名字以避免混淆
const dockerManagerApiInstance: AxiosInstance = axios.create({
  baseURL: process.env.BASE_URL || 'http://localhost:8080/api', // 建议提供一个备用值
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


export const docker_manager_api = <T>(
  config: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => { // 返回完整的 AxiosResponse 更灵活
  // 函数内部使用您上面创建的实例来发起请求
  return dockerManagerApiInstance({
    ...config,
  });
};

// 注意：这里不再是 export default，而是 export const

/*
  备选方案：如果你的 React Query hooks 总是直接使用 data，
  你也可以让 mutator 直接返回 data，像这样：

  export const docker_manager_api = <T>(
    config: AxiosRequestConfig,
  ): Promise<T> => {
    return dockerManagerApiInstance({ ...config }).then((res) => res.data);
  };
*/