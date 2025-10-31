/* eslint-disable @typescript-eslint/naming-convention */
import * as R from 'ramda';
import { AxiosRequestConfig } from 'axios';
import { getCookie, isDev } from '@/utils';
import { RequestConfig } from '../types';

/**
 * @description 创建默认配置
 * @param {AxiosRequestConfig} opt 配置
 * @returns AxiosRequestConfig
 */
export function createDefaultOption(opt: AxiosRequestConfig = {}) {
	const defaultOpt = {
		baseURL: isDev ? '/api' : '',
		timeout: 250000,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	};
	if (!isDev) {
		const requestTokenKey = window.location.protocol.indexOf('https:') === 0 ? 'https_request_token' : 'request_token';
		const cookies = getCookie(requestTokenKey);
		defaultOpt.headers = {
			...defaultOpt.headers,
			...{ 'x-http-token': window.vite_public_request_token },
			...(cookies ? { 'x-cookie-token': cookies } : {}),
		};
	}
	return { ...defaultOpt, ...opt };
}

/**
 * @description 获取地址
 * @param { RequestConfig } config 请求配置
 * @returns { string }
 */
export function createUrl({ url, customType = 'default' }: RequestConfig): string {
	if (!url) throw new Error('请求路径为空');
	const urlArr = url ? url.split('/') : [];
	if (urlArr.length !== 2 && customType !== 'model') throw new Error('传统请求/插件请求路径格式错误，正确格式为：模块名/方法名');
	switch (customType) {
		case 'default':
			return `/${urlArr[0]}?action=${urlArr[1]}`;
		case 'model':
			return `/${url}`.replace(/\/+/g, '/');
		case 'plugin':
			return `/plugin?action=a&name=${urlArr[0]}&s=${urlArr[1]}`;
		default:
			return `/${url}`.replace(/\/+/g, '/');
	}
}

/**
 * @description 处理请求数据
 * @param { AnyObject } oldData
 * @returns
 */
export const handleTransformRequest = R.pipe(
	R.toPairs, // 将对象转换为键值对数组
	R.map(([key, value]: [string, any]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`), // 将每个键值对转换为查询参数
	R.join('&') // 将所有的查询参数连接成一个字符串
);
