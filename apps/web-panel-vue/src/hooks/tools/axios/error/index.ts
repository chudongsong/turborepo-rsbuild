/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
import { useDialog } from '@/hooks/tools'
import ErrorPopup from './error-popup.vue'

/**
 * @description 打开bt错误弹窗
 * @param {any} errorBody 错误信息
 * @param {any} errorFind 错误信息
 * @param {any} isBuy 是否是购买
 */
export const openBtError = (errorBody: string, errorFind: string | boolean, isBuy: string | boolean) => {
	useDialog({
		area: '120',
		title: false,
		component: ErrorPopup,
		compData: { errorBody, errorFind, isBuy },
	})
}
