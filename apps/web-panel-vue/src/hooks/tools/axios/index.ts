import type { AxiosRequestConfig } from 'axios';
import { HttpRequest } from './model/axios';

/**
 * @description 创建axios实例
 * @param {AxiosRequestConfig} opt 配置
 * @returns
 */
const createAxios = (opt: AxiosRequestConfig = {}) => {
  return new HttpRequest(opt);
};

// 创建axios实例
export const useAxios = createAxios();
