import { exportCommand, getCommandList, removeCommand, modifyCommand as modifyCommandApi, createCommand as createCommandApi } from '@/api/xterm'
import { useDataHandle } from '@/hooks/tools'
import { ResponseResult, ResponseTableResult } from '@/types'
import { defineStore, storeToRefs } from 'pinia'
import { TermCommandItemProps } from '@term/types'

const TERM_COMMAND_STORE = defineStore('TERM_COMMAND_STORE', () => {
	const isEdit = ref(false) // 是否编辑
	const rowData = ref({}) // 行数据
	const isRefreshList = ref(false) // 是否刷新列表

	/**
	 * @description 获取常用命令
	 * @returns {Promise<ResponseTableResult<TermCommandItemProps[]>>}
	 */
	const getCommand = async (): Promise<ResponseTableResult<TermCommandItemProps[]>> => {
		try {
			const data: TermCommandItemProps[] = await useDataHandle({
				request: getCommandList(),
				data: Array,
			})
			return { data, total: data.length, other: {} }
		} catch (error) {
			console.warn(error)
			return { data: [], total: 0, other: {} }
		}
	}

	/**
	 * @description 获取导出命令
	 * @returns {Promise<ResponseResult>}
	 */
	const getExportCommand = async () =>
		useDataHandle({
			loading: '正在导出常用命令，请稍后...',
			request: exportCommand(),
			data: { status: Boolean, msg: String },
		}) as Promise<ResponseResult>

	/**
	 * @description 创建或修改命令
	 * @param {TermCommandItemProps} param 命令信息
	 * @returns {Promise<ResponseResult>}
	 */
	const modifyCommand = (param: TermCommandItemProps) =>
		useDataHandle({
			loading: '正在' + (rowData.value ? '修改' : '创建') + '命令信息，请稍后...',
			request: rowData.value ? modifyCommandApi(param) : createCommandApi(param),
			data: { status: Boolean, msg: String },
			message: true,
		}) as Promise<ResponseResult>

	/**
	 * @description 删除命令
	 * @param {string} title 命令描述
	 * @returns {Promise<ResponseResult>}
	 */
	const delCommand = (title: string) =>
		useDataHandle({
			loading: '正在删除命令信息，请稍后...',
			request: removeCommand(title),
			data: { status: Boolean },
			message: true,
		}) as Promise<ResponseResult>

	// 重置
	const $reset = () => {
		isEdit.value = false
	}

	return {
		rowData,
		isEdit,
		isRefreshList,
		getCommand,
		modifyCommand,
		getExportCommand,
		delCommand,
		$reset,
	}
})

// 实例化
const useTermCommandStore = () => {
	const termCommandStore = TERM_COMMAND_STORE()
	return { ...termCommandStore, ...storeToRefs(termCommandStore) }
}

export { useTermCommandStore }
