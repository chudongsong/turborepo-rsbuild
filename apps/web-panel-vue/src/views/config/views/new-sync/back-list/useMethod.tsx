import { Message, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { detailData, isRefreshBackList } from '../useMethod'
import { delBackApi, getBackListApi, getDetailApi, execSyncApi } from '@/api/config'
import { isArray, isNumber, isObject } from '@/utils'
import { ElCheckbox } from 'element-plus'
import { disabledConfig, openProgress, progressDialog } from '../add-back/useMethod'
import axios from 'axios'
import { restorePhpSiteData, restorePhpSiteDataLog } from '@/api/site'

import BtLog from '@/components/extension/bt-log/index.vue'

/**
 * @description 获取后端备份列表
 * @param params 参数
 */
export const getBackList = async () => {
	try {
		const { data: res } = await getBackListApi()
		return {
			data: res.data,
			total: res.data.length,
			other: {},
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description downloadBack 下载备份
 */
export const downloadBack = async (row: any) => {
	window.open(`/download?filename=${row.backup_file}`, '_blank', 'noopener,noreferrer')
}

/**
 * @description deleteBack 删除备份
 */
export const deleteBack = async (row: any) => {
	try {
		await useConfirm({
			title: '删除备份',
			content: '是否删除备份文件？',
			type: 'calc',
		})
		await useDataHandle({
			loading: '正在删除备份，请稍后...',
			request: delBackApi({ timestamp: row.timestamp }),
			message: true,
		})
		isRefreshBackList.value = true
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description openRestoreBack 还原备份
 */
export const openRestoreBack = async (data: any, type?: string) => {
	if (type === 'confirm') {
		const isRestore = ref(false)
		let timer: any = 0
		await useConfirm({
			title: '还原备份',
			content: () => (
				<div>
					<div>{`网站【${data.name}】数据即将被覆盖，是否继续？`}</div>
					<div>
						<ElCheckbox v-model={isRestore.value} label="还原网站配置文件" />
					</div>
				</div>
			),
			type: 'calc',
		})

		try {
			restorePhpSiteData({ id: data.id, reconf: isRestore.value ? 'True' : 'False' })
			const logDialog = defineComponent({
				setup() {
					const logContent = ref<string>('获取中...')
					const getLog = async () => {
						clearTimeout(timer)
						const res = await restorePhpSiteDataLog({ pid: data.pid })
						console.log(res)
						logContent.value = res.log
						if (!res.restore_status) {
							timer = setTimeout(() => {
								getLog()
							}, 1500)
						} else {
							Message.request(res)
						}
					}
					getLog()
					return () => (
						<div class="flex-wrap">
							<BtLog class="h-[40rem] !rounded-none" content={logContent.value} />
						</div>
					)
				},
			})
			useDialog({
				title: '还原日志',
				component: () => <logDialog />,
				area: 55,
			})
		} catch (error) {
			console.log(error)
		}
	} else {
		detailData.value = { operateType: 'restore', ...data }
		if (data.status === 'backup-running') {
			Message.error('备份正在运行，请稍后再试')
			return
		}
		if (data.status === 'restore-running') {
			progressDialog.value = openProgress()
		}
		useDialog({
			title: '还原备份',
			component: () => import('../add-back/index.vue'),
			area: 84,
			btn: ['确定还原', '取消'],
			showFooter: true,
		})
	}
}

/**
 * @description detailBack 查看备份详情
 */
export const detailBack = async (row: any) => {
	detailData.value = { operateType: 'detail', ...row }
	useDialog({
		title: `【${row.backup_name}】备份还原详情`,
		component: () => import('./detail-back.vue'),
		area: 78,
	})
}

/**
 * @description 打开数据库上传弹窗 - 上传文件到
 * @param {AnyFunction} refreshEvent 刷新事件
 * @param {string} path 上传路径
 */
export const openBackupUploadView = (refreshEvent: AnyFunction) => {
	// useDialog({
	// 	title: '上传文件到',
	// 	area: 80,
	// 	compData: { refreshEvent, uploadEvent },
	// 	component: () => import('@config/public/config-upload/back-upload.vue'),
	// })
	useDialog({
		title: `上传文件`,
		area: '72',
		component: () => import('@components/business/bt-file-upload/index.vue'),
		compData: {
			path: '/www/backup/backup_restore',
		},
		onOpen: () => {
			const uploadTipsElement = document.querySelector('.upload-files-tips')
			if (uploadTipsElement) {
				const ulElement = document.createElement('ul')
				ulElement.className = 'text-secondary mt-[2px] leading-[2rem] text-small ml-[20px] list-disc'

				const liElement = document.createElement('li')
				liElement.textContent = '只有在此处备份的文件，才会在备份列表中显示'

				ulElement.appendChild(liElement)
				uploadTipsElement.parentNode?.insertBefore(ulElement, uploadTipsElement.nextSibling)
			}
		},
		onCancel: () => {
			refreshEvent()
		},
	})
}

/**
 * @description showLogBack 查看备份日志
 */
export const showLogBack = async (row: any) => {
	detailData.value = { operateType: 'log', ...row }
	useDialog({
		title: '备份日志',
		component: () => import('./log-back.vue'),
		area: 60,
	})
}

/**
 * @description showInputDialog 显示导入备份对话框
 * @param data
 */
export const showInputDialog = async (data: any) => {
	detailData.value = { ...data, operateType: 'input' }
	useDialog({
		title: '导入备份',
		area: [84, 80],
		showFooter: true,
		component: () => import('../add-back/index.vue'),
	})
}

// *********************************备份详情*********************************
export const backAllData = reactive({
	backup_time: '',
	file_size: '',
	time_count: '',
	size: '',
	path: '',
	'SHA-256': '',
})

/**
 * @description 立即执行
 * @param row
 */
export const execBack = async (row: any) => {
	try {
		const res = await execSyncApi({ timestamp: row.timestamp })
		progressDialog.value = openProgress()
	} catch (error) {
		console.log(error)
	}
}

export const allData = ref()
export const showAllDetailDialog = ref(false) // 是否显示详情弹窗
export const getDetailAllData = async () => {
	try {
		disabledConfig.value = true

		const params = { timestamp: detailData.value.timestamp, type: detailTab.value }
		const {
			data: { data: res },
		} = await getDetailApi(params)

		backAllData.time_count = res.total_time // 总时间
		backAllData.size = res.backup_file_size // 总大小
		backAllData['SHA-256'] = res.backup_file_sha256 // SHA-256
		backAllData.path = res.backup_file // 备份文件
		backAllData.backup_time = res.done_time // 备份时间

		allData.value = res.data_status
		const failedList = filterFailed(res.data_status)
		return {
			data: failedList,
			total: failedList.length,
			other: {},
		}
	} catch (error) {
		console.log(error)
	} finally {
		disabledConfig.value = false
	}
}

/**
 * @description filterFailed 过滤失败项
 * @param data 数据
 * @returns 失败项
 */
export const filterFailed = (data: any) => {
	const titleData: any = {
		ssh_list: '防火墙',
		crontab_list: '计划任务',
		term_list: '终端',
		database_list: '数据库',
		site_list: '网站',
		ftp_list: 'FTP',
		plugin_list: '插件',
		env_list: '运行环境',
	}
	const dataList = Object.keys(data)
	let failed: any[] = []

	dataList.forEach((item: any) => {
		if (isArray(data[item]) && data[item].length > 0) {
			let list = data[item].filter((item: any) => item.status && item.status === 3)
			if (list.length > 0) {
				list.forEach((litem: any) => {
					failed.push({
						name: litem.name,
						msg: litem.err_msg || '未知错误',
					})
				})
			}
		} else if (isObject(data[item]) && data[item].status === 3) {
			failed.push({
				name: titleData[item],
				msg: data[item].err_msg || '未知错误',
			})
		}
	})

	return failed
}

export const loading = ref(false)
export const ftpList = ref([])
export const crontabList = ref([])
export const termList = ref([])
export const firewallList = ref([])
export const databseList = ref([])
export const siteList = ref([])

export const tableColumn = [
	{
		label: '项目名称',
		prop: 'task_id',
	},
	{
		label: '错误信息',
		prop: 'msg',
		render: (row: any) => {
			// task_status为true时，msg显示备份成功
			return <span class={`text-${row.task_status ? 'primary' : 'danger'}`}>{row.task_status ? '备份成功' : row.msg}</span>
		},
	},
	{ label: '所属类型', prop: 'task_type' },
]

/*******************************上传************************************/

// 上传进度弹窗
export const uploadProgress = ref(false)
// 上传百分比
export const uploadNum = ref(0)
/**
 * @description 上传文件
 * @param params
 */
export const uploadEvent = async (params: any) => {
	try {
		let fd = new FormData() // 新建一个FormData()对象，这就相当于你新建了一个表单
		fd.append('blob', params.file) // 将文件保存到formData对象中
		fd.append('f_size', params.data.f_size) // 文件大小
		fd.append('f_path', params.data.f_path) // 文件路径
		fd.append('f_name', params.data.f_name) // 文件名称
		fd.append('f_start', params.data.f_start) // 文件开始位置

		let config = {
			headers: {
				'Content-Type': 'multipart/form-data',
				'x-http-token': window.vite_public_request_token,
			}, //添加请求头
		}
		const res: any = await axios.post('/files?action=upload', fd, config)
		if (isNumber(res.data)) {
			// 打开进度
			if (!uploadProgress.value) uploadProgress.value = true
			// 计算百分比
			uploadNum.value = Math.floor((res.data / params.data.f_size) * 100)
			// 继续下一次
			uploadEvent(params)
		} else {
			uploadProgress.value = false
			Message.request(res.data)
		}
	} catch (error) {
		console.log(error)
		Message.error('导入失败')
		uploadProgress.value = false
		isRefreshBackList.value = true
	}
}

export const detailTab = ref('backup')
export const openBackDialog = async () => {
	detailData.value = { operateType: 'add' }
	useDialog({
		title: '创建备份',
		area: 84,
		showFooter: true,
		component: () => import('../add-back/index.vue'),
		btn: ['备份', '取消'],
	})
}

export const syncDataType = {
	database: '数据库',
	site: '网站',
	ftp: 'FTP',
	crontab: '计划任务',
	term: '终端',
	firewall: '防火墙',
	plugin: '插件',
	other: '其他',
	runtime: '运行环境',
}

// 用于存储过滤后的数据
export const detailFilterData = ref<Record<string, { name: string; list: any[] }>>(
	Object.keys(syncDataType).reduce(
		(acc, key) => {
			acc[key] = { name: syncDataType[key as keyof typeof syncDataType], list: [] }
			return acc
		},
		{} as Record<string, { name: string; list: any[] }>
	)
)
