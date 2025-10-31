import { defineStore } from 'pinia'
import FILES_STORE from '@files/store'
import { addTamperCore, createPath, getEffectivePath } from '@api/files'
import { Message, useDataHandle } from '@hooks/tools'

const FILES_TAMPER_STORE = defineStore('FILES-TAMPER-STORE', () => {
	const { refreshFilesList } = FILES_STORE()

	const compData = ref<any>() // 组件数据

	const isStart = ref('关闭') // 开启/关闭
	const isFile = ref('文件') // 是否是文件
	const currentAction = ref('') // 当前目录防护状态
	const checkList = reactive({
		fileName: true,
		ext: false,
	})

	// 创建目录保护
	const creteMenu = async (close?: any) => {
		let path = compData.value.data.path
		let ext: any = []
		// 文件类型
		if (compData.value.data.isFile) {
			// 文件类型去除路径的最后一级
			const lastSlashIndex = path.lastIndexOf('/')
			if (lastSlashIndex !== -1) {
				path = path.substring(0, lastSlashIndex)
			}
			if (checkList.fileName) {
				let backPath = compData.value.data.path.split('/')
				let filePath = backPath.length >= 2 ? backPath[backPath.length - 2] : ''
				ext.push(`${filePath}\/${compData.value.data.fileName}`)
			}
			if (checkList.ext) {
				ext.push('.' + compData.value.data.fileName.split('.').pop())
			}
		}
		await useDataHandle({
			loading: '正在创建目录保护，请稍后...',
			request: createPath({ path: path, exts: JSON.stringify(ext) }),
			message: true,
			success: (res: any) => {
				if (res.status) {
					// 刷新列表
					refreshFilesList()
					if (close) close()
				}
			},
		})
	}

	const onConfirm = async () => {
		if (!checkList.ext && !checkList.fileName) {
			Message.error('请至少选择一项')
			return
		}
		const params: any = {
			pid: compData.value.data.tamperProofId,
			settings: [],
		}
		const path = compData.value.data.path
		// 需创建目录
		if (currentAction.value === 'create' && compData.value.data.tamperProofId == 0) {
			creteMenu(close)
			return
		}

		if (compData.value.data.isFile) {
			// 文件类型
			// 没有保护
			if (!compData.value.data?.isLock) {
				if (checkList.fileName) {
					// 添加到黑名单中
					params.settings.push({
						key: 'add_bf',
						values: [path],
					})
					// 从白名单中删除
					params.settings.push({
						key: 'remove_wf',
						values: [path],
					})
				}
				if (checkList.ext) {
					// 添加到黑名单中
					params.settings.push({
						key: 'add_bf',
						values: ['.' + compData.value.data.fileName.split('.').pop()],
					})
				}
			} else {
				// 有保护
				if (checkList.fileName) {
					// 从黑名单中删除
					params.settings.push({
						key: 'remove_bf',
						values: [path],
					})
					// 添加到白名单中
					params.settings.push({
						key: 'add_wf',
						values: [path],
					})
				}
				if (checkList.ext) {
					// 从黑名单中删除
					params.settings.push({
						key: 'remove_bf',
						values: ['.' + compData.value.data.fileName.split('.').pop()],
					})
				}
			}
		} else {
			// 已创建文件夹-没有保护
			if (!compData.value.data?.isLock) {
				// 开启目录防护
				params.settings.push({
					key: currentAction.value,
					values: [path],
				})
			} else {
				// 关闭目录防护
				var key = currentAction.value
				const colsePath = compData.value.data.path
				if (colsePath.indexOf('/www/server/panel/class') != -1) key = 'add_wd' //class目录特殊处理
				params.settings.push({
					key: key,
					values: [compData.value.data.path],
				})
			}
		}
		params.settings = JSON.stringify(params.settings)

		const res: any = await useDataHandle({
			loading: '正在执行中，请稍后...',
			request: addTamperCore(params),
			message: true,
			success: (res: any) => {
				if (res.status) {
					// 刷新列表
					refreshFilesList()
				}
			},
		})
		return res.status
	}

	/**
	 * @description: 检查目录是否已创建
	 */
	const checkPath = async () => {
		await useDataHandle({
			request: getEffectivePath({ path: compData.value.data.path }),
			success: (res: any) => {
				currentAction.value = res.data.data.action[0]
			},
		})
	}

	const init = () => {
		isStart.value = compData.value.data?.isLock ? '关闭' : '开启'
		isFile.value = compData.value.data.type === 'file' ? '文件' : '目录'
		checkPath()
	}

	const $reset = () => {
		currentAction.value = ''
		Object.assign(checkList, {
			fileName: true,
			ext: false,
		})
	}

	return {
		isStart,
		isFile,
		compData,
		checkList,
		onConfirm,
		init,
		$reset,
	}
})

export default FILES_TAMPER_STORE
