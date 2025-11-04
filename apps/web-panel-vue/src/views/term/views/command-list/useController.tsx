import type { TermCommandItemProps, TermCommandListProps, TermCommandProps } from '@term/types'

import { useConfirm, useDialog, useMessage } from '@hooks/tools'
import { copyText, createProxyUrl } from '@utils/index'
import { useTermStore } from '@/views/term/useStore'
import { cutFullScreen } from '@term/useController'
import { useTermCommandStore } from './useStore'

const { error: $error, request: $request } = useMessage()
const { isFull } = useTermStore()
const { isEdit, isRefreshList, delCommand, getExportCommand, modifyCommand, rowData } = useTermCommandStore()

/**
 * @description 添加命令信息
 * @param {() => void} refresh 刷新
 * @param {TermCommandItemProps} rows 服务器信息
 * @returns {Promise<App>}
 */
export const exitCommandDialog = (rows?: any) => {
	rowData.value = rows
	return useDialog({
		title: `${isEdit.value ? '编辑' : '添加'}命令信息`,
		area: 48,
		component: () => import('@term/views/command-list/add-command.vue'), // 组件引入
		showFooter: true,
	})
}

/**
 * @description 执行常用命令
 * @param {TermCommandListProps} item 命令信息
 * @param {MouseEvent} {event} 事件
 *
 */
export const commandFindClick = (rows: TermCommandItemProps, { event }: { event: MouseEvent }) => {
	let shell = rows.shell || ''
	try {
		shell = JSON.parse(rows?.shell || '') // 兼容旧数据
	} catch (error) {
		shell = rows.shell || ''
	}
	copyText({ value: shell })
}

/**
 * @description 删除常用信息信息
 * @param {string} title 命令描述
 * @returns {Promise<void>}
 */
export const deleteCommandInfo = async (rows: TermCommandItemProps): Promise<void> => {
	try {
		// 确认框
		await useConfirm({
			title: '删除命令信息【' + rows.title + '】',
			content: '删除选中的信息后，该删除命令信息将不在列表中显示，是否继续操作？',
			icon: 'warning-filled',
		})
		// 删除命令信息
		const { status } = await delCommand(rows.title)
		isRefreshList.value = true
	} catch (error) {
		console.warn(error)
	}
}

/**
 * @description 导出常用命令
 * @returns {Promise<void>}
 */
export const exportCommand = async () => {
	try {
		if (isFull.value) cutFullScreen()
		const { status, msg } = await getExportCommand()
		if (!status) return $error(msg)
		window.open(createProxyUrl(`/download?filename=${msg}`), '_blank', 'noopener,noreferrer')
	} catch (error) {
		console.warn(error)
	}
}

/**
 * @description 确认表单提交
 * @param {Ref<TermCommandProps & TermCommandItemProps>} param 表单数据
 * @returns {Promise<boolean>}
 */
export const handlingSubmit = async (param: Ref<TermCommandProps>) => {
	try {
		let newParam = { ...param.value }
		if (rowData.value) newParam = { title: rowData.value.title, shell: param.value.shell, new_title: param.value.title }
		const rdata = await modifyCommand(newParam)
		isRefreshList.value = true
		$request(rdata)
		return rdata.status
	} catch (error) {
		return false
	}
}

export const initCommandList = () => {
	try {
		if (rowData.value) {
			return { title: rowData.value.title, shell: rowData.value.shell }
		} else {
			return { title: '', shell: '' }
		}
	} catch (error) {
		return {}
	}
}

/**
 * @description 补全工具
 * @returns {Promise<App>}
 */
export const autoCompleteDialog = () => {
	return useDialog({
		title: '智能提示工具',
		area: 48,
		component: () => import('@term/views/command-list/auto-complete.vue'),
	})
}
