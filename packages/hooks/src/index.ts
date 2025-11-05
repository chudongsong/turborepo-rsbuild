/**
 * @linglongos/hooks - 通用 React Hooks 库
 *
 * 提供可复用的 React Hooks，涵盖常见场景：
 * - 容器尺寸监听 (useContainerSize)
 * - 选择管理 (useSelection)
 * - HTTP 请求 (useAxios, useRequest, useAsyncFetch)
 * - 错误处理 (useErrorHandler)
 * - 文件预加载 (usePreload)
 */

// ========================================
// 通用 Hooks
// ========================================
export { useContainerSize } from "./hooks/useContainerSize"
export { useSelection, type SelectionChangeHandler } from "./hooks/useSelection"

// ========================================
// Axios Hooks
// ========================================
// 基础 axios 实例
export { useAxios } from "./hooks/useAxios"
export { default as useAxiosDefault } from "./hooks/useAxios"

// 高级请求 Hooks
export {
	useRequest,
	usePost,
	useGet,
	useLazyRequest,
	useLazyPost,
	useLazyGet,
} from "./hooks/useRequest"

// 异步请求 Hooks
export {
	useAsyncFetch,
	useAsyncPost,
	useAsyncGet,
} from "./hooks/useAsyncFetch"

// 错误处理 Hooks
export {
	useErrorHandler,
	useAsyncErrorHandler,
	useErrorBoundary,
	type ErrorInfo,
} from "./hooks/useErrorHandler"

// 预加载 Hooks
export {
	usePreload,
	useScript,
	useStyle,
} from "./hooks/usePreload"

// ========================================
// 工具类
// ========================================
// Axios 取消管理
export {
	AxiosCanceler,
	useRequestCanceler,
	axiosCanceler,
} from "./utils/axios-cancel"

// Axios 实例
export { HttpRequest } from "./utils/axios-instance"

// 辅助函数
export * from "./utils/helpers"

// ========================================
// 类型定义
// ========================================
export type {
	RequestConfig,
	ResponseResult,
	ResponseMessage,
	ResponsePageResult,
	AxiosHookState,
	UseAxiosOptions,
	AxiosInstanceOptions,
	ErrorHandlerOptions,
	RequestMiddleware,
} from "./types/axios"
