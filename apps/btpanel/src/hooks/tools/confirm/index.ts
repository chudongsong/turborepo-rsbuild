import type { ConfirmOptionProps } from '@/components/extension/bt-confirm/types'
import { useDialog } from '@/hooks/tools'

import confirmApp from '@/components/extension/bt-confirm/index.vue'

/**
 * @description 弹窗实例
 * @param {DialogInstance} options 弹窗配置
 * @returns {App} vue实例
 */
export const useConfirm = async (options: ConfirmOptionProps): Promise<boolean> => {
	const defaultOpt = {
		title: '提示',
		type: 'default',
		width: '38rem',
		content: '',
		isHtml: false,
		cancelText: '取消',
		confirmText: '确定',
		icon: true,
		iconColor: 'warning',
		input: { content: '' },
		check: { content: '', value: false, onConfirm: undefined },
	} as ConfirmOptionProps

	// 合并默认配置
	const { title, type, icon, iconColor, input, check, isHtml, content, width, confirmText, cancelText, showClose } = {
		...defaultOpt,
		...options,
	}

	if (content === '') {
		throw new Error('弹窗内容不能为空')
	}

	// 验证类型 input 时，输入框内容不能为空
	if (type === 'input' && (input?.content === '' || !input?.content)) {
		throw new Error('输入文字验证值不能为空')
	}
	// 验证类型 check 时，复选框内容不能为空
	if (type === 'check') {
		if (check?.content === '' || !check?.content) throw new Error('复选框文字验证值不能为空')
		if (!check?.onConfirm) throw new Error('复选框事件验证值不能为空')
	}

	return new Promise((resolve, reject) => {
		const instance = useDialog({
			title,
			area: width as string | number,
			component: confirmApp,
			showClose,
			cancelText,
			confirmText,
			showFooter: true,
			compData: {
				content,
				isHtml,
				type,
				icon,
				iconColor,
				input,
				check,
			},
			onConfirm: () => {
				if (options.onConfirm) {
					resolve(options.onConfirm(instance))
				} else {
					resolve(true)
				}
			},
			onCancel: () => {
				if (options.onCancel) options.onCancel(instance)
				// eslint-disable-next-line prefer-promise-reject-errors
				reject('cancel') // 取消
			},
		})
	})
	// 创建Dialog实例，构建弹窗，并导入确认弹窗组件
}
