import { controller } from './axios'

/**
 * @description 清除请求
 * @returns { void }
 */
export const clearRequest = (): void => {
	controller.abort()
}
