import type { CloudServerItem, DatabaseTableItemProps, KeyItem } from '@database/types'
import type { TableColumnProps } from '@components/data/bt-table/types'
import type { TableBatchEventProps } from '@components/extension/bt-table-batch/types'

import { backDatabase, backModuleDatabase, batchBackMysqlData, checkModuleServerConnection, checkServerConnection, getModulesCloudServer, getMysqlCloudServer, getSoftStatus, setDbTypes } from '@/api/database'
import { isArray, isObject, isString, isUndefined } from '@utils/index'
import { Message, useDataHandle } from '@hooks/tools'
import { useBatchStatus, useCheckbox, usePassword } from '@hooks/tools/table/column'
import { useDialog } from '@hooks/tools'

import { getDatabaseStore } from './useStore'
import { syncDataToServer, syncModuleDataToServer } from '@api/database'

import { useHandleError } from '@hooks/tools'
import { getPluginInfo } from '@/api/global'
import { assembBatchParams, assembBatchResults, batchClassDialog, openPluginView, pluginInstallDialog } from '@/public/index'

const {
	refs: { tabActive, envStatus, isRefreshTable, softData },
} = getDatabaseStore()

export const dataBak = ref([]) // 数据备份

/**
 * @description: 用于检查服务器连接状态
 * @param { number | string } sid 服务器id
 * @param { string } type 可选传入-模块类型，mysql不传
 */
export const useCheckServerConnection = async (sid: number | string): Promise<any> => {
	try {
		if (isUndefined(sid)) sid = 0
		const data = await useDataHandle({
			request: tabActive.value !== 'mysql' ? checkModuleServerConnection({ data: JSON.stringify({ sid }) }, tabActive.value) : checkServerConnection({ sid }),
			data: {
				status: Boolean, // 请求状态
				msg: String, // 提示信息
				db_status: Boolean, // 数据库状态
				err_msg: String, // 错误信息
			},
		})
		return data
	} catch (error) {
		useHandleError(error, 'useCheckServerConnection')
		return {
			status: false,
			err_msg: 'error',
			msg: '检查出错啦！',
		}
	}
}

/**
 * @description: 用于检查数据库安装状态
 */
export const useCheckSoftStatus = async (name: string) => {
	try {
		const { data } = await getSoftStatus({ name })
		envStatus.value = data
		softData.value.s_status = data.s_status // 更新状态值 避免插件与界面显示不一致
		return (
			data || {
				setup: false,
				version: '',
				status: false,
			}
		)
	} catch (error) {
		useHandleError(error, 'useCheckSoftStatus')
		return {
			setup: false,
			version: '',
			status: false,
		}
	}
}

/**
 * @description: 用于检查数据库是否存在远程数据库
 */
export const useCheckRemoteDatabase = async (list: Array<CloudServerItem>) => {
	try {
		// 排除全部选项后进行判断是否存在远程数据库
		const data = list.filter((item: any) => item.value !== '' && item.value !== 'all')
		if (data.length === 0) return false
		return true
	} catch (error) {
		useHandleError(error, 'useCheckRemoteDatabase')
		return false
	}
}

/**
 * @description 用于获取数据库提示信息 - 远程数据库
 */
export const showTips = computed(() => {
	const databasesList: any = {
		mysql: ['支持MySQL5.5、MariaDB10.1及以上版本', '注意3：通过宝塔安装的数据库root默认不支持远程权限'],
		redis: ['支持redis-4.0+版本', '注意3：通过宝塔安装的redis默认不支持远程权限'],
		sqlserver: ['', '注意3：通过宝塔安装的sqlserver默认不支持远程权限'],
		mongodb: ['支持Mongodb-4.0及以上版本', '注意3：通过宝塔安装的Mongodb默认不支持远程权限'],
		pgsql: ['支持Postgresql-9.6+版本', '注意3：通过宝塔安装的Postgresql默认不支持远程权限'],
	}
	return databasesList[tabActive.value] || []
})

/**
 * @description 表格配置
 */
export const useGeneralTableConfig = (event?: any) => {
	return [
		{ label: '数据库名', prop: 'name', width: 160, sortable: true },
		{ label: '用户名', prop: 'username', minWidth: 100, sortable: true },
		usePassword({ event }), // 密码
	]
}

/**
 * @description 获取数据库位置
 * @param list  远程数据库列表
 * @param type 数据库类型
 */
export const usePosition = (list: Array<any>, type: string) => {
	let position = '本地数据库'
	return {
		label: '数据库位置',
		minWidth: 90,
		render: (row: any) => {
			list?.forEach((item: any) => {
				if (item.id === row.sid) {
					position = type === 'mysql' ? item.db_host : item.ps
					if (item.db_host === '127.0.0.1') position = '本地数据库'
				}
			})
			return h('span', position)
		},
	}
}

/**
 * @description 打开远程数据库
 */
export const openServerView = () => {
	useDialog({
		title: '远程数据库',
		area: 86,
		component: () => import('@database/public/cloud-server/index.vue'),
	})
}

/**
 * @description 打开工具弹窗
 */
export const openToolsView = (row: any) => {
	useDialog({
		title: `数据库工具箱-【${row.name}】`,
		area: 86,
		compData: row,
		component: () => import('@database/public/tools/index.vue'),
	})
}

/**
 * @description 打开设置密码弹窗
 * @param row
 */
export const openSetPwdView = (row: any) => {
	useDialog({
		title: `设置数据库【${row.name}】密码`,
		area: 53,
		showFooter: true,
		compData: row,
		component: () => import('@database/public/password/index.vue'),
	})
}

/**
 * @description 打开进度弹窗
 * @param {string} data.type 事件类型
 *
 */
export const openProgressView = (data: any) => {
	return useDialog({
		area: 60,
		compData: data,
		component: () => import('@database/public/progress/index.vue'),
	})
}

/**
 * @description 打开数据库备份弹窗
 */
export const openBackView = async (row: any, type: string) => {
	if (type === 'import') {
		return await useDialog({
			title: `导入本地备份`,
			area: 84,
			compData: row,
			component: () => import('@database/public/backup/import-back.vue'),
		})
	}
	useDialog({
		title: `数据库【${row.name}】备份`,
		area: 92,
		compData: { row, type },
		component: () => import('@database/public/backup/index.vue'),
	})
}

/**
 * @description 打开root密码
 * @param rootPwd root密码
 */
export const openRootPwdView = (rootPwd: string = '', refresh?: () => {}) => {
	useDialog({
		title: '修改root密码',
		area: 40,
		compData: { rootPwd, refresh },
		showFooter: true,
		component: () => import('@database/public/root-pwd/index.vue'),
	})
}

/**
 * @description 打开删除数据库弹窗
 */
export const openDeleteDatabaseView = (rows: Array<{ id: number }> | AnyObject, batchConfig?: AnyObject) => {
	let ids: any = []
	if (isArray(rows)) {
		ids = rows.map((item: any) => item.id)
	} else {
		ids = [rows.id]
	}
	useDialog({
		title: '删除数据库',
		area: 76,
		showFooter: true,
		compData: { ids, isMult: isArray(rows), rows, config: isObject(batchConfig) ? batchConfig : {} }, // isMult:是否为批量删除
		confirmBtnType: 'danger', // 底部按钮类型
		component: () => import('@database/public/delete-database/index.vue'),
	})
}

/**
 * @description 打开数据库上传弹窗 - 上传文件到
 * @param {AnyFunction} refreshEvent 刷新事件
 * @param {string} path 上传路径
 */
export const openDataBaseUploadView = (refreshEvent?: AnyFunction, path?: string) => {
	useDialog({
		title: '上传文件到',
		area: 80,
		compData: { refreshEvent, path: isString(path) ? path : '' },
		component: () => import('@database/public/upload/index.vue'),
	})
}

/**
 * @description 打开批量结果展示弹窗
 * @param list
 * @param config
 */
export const openResultView = (list: any, config: { title: string }) => {
	useDialog({
		title: `批量${config.title}结果`,
		area: 42,
		component: () => import('@components/extension/bt-result/index.vue'),
		compData: {
			resultData: list,
			resultTitle: config.title || '操作',
		},
	})
}

/**
 * @description 打开权限设置
 * @param row 当前行信息
 * @param type 类型 single | multlples / '单个' | '多个'
 */
export const openPermissionView = (data: DatabaseTableItemProps, type: string = 'single', config?: any) => {
	if (!isString(type)) type = 'single'
	useDialog({
		title: '设置数据库权限',
		area: 42,
		component: () => import('@database/public/permission-setting/index.vue'),
		compData: {
			config: isObject(config) ? config : {},
			type,
			rowData: data,
		},
		showFooter: true,
	})
}

/**
 *@description 同步数据库事件
 * @param item 数据库信息
 */
export const syncDatabaseEvent = async (item?: any) => {
	try {
		let ids: Array<number> = [],
			type: number = 0,
			params = { ids: JSON.stringify(ids) }

		if (tabActive.value === 'mysql' && item) {
			ids = item
			type = 1
		} else if (tabActive.value !== 'mysql' && item) {
			ids = [item.id]
			type = 1
		}

		if (type === 1) {
			params = assembBatchParams(ids, [], false)
		} else {
			params = { ids: JSON.stringify(ids) }
		}
		const res = tabActive.value === 'mysql' ? await syncDataToServer(params, type) : await syncModuleDataToServer({ data: JSON.stringify({ type, ids: JSON.stringify(ids) }) }, tabActive.value)

		return res
	} catch (error) {
		useHandleError(error, 'syncDatabaseEvent')
	}
}

/**
 * @description 备份数据库事件
 * @param item  数据库信息
 */
export const backDatabaseEvent = async (param: any) => {
	const loading = Message.load('正在备份，请稍后...')
	try {
		const res = tabActive.value === 'mysql' ? await backDatabase(param) : await backModuleDatabase({ data: JSON.stringify(param) }, tabActive.value)
		return res
	} catch (error) {
		useHandleError(error, 'backDatabaseEvent')
	} finally {
		loading.close()
	}
}

/**
 * @description 通用批量操作，同步、备份
 * type: string, list: Array<any>
 */
export const useGeneralBatch: TableBatchEventProps = async (batchConfirm, nextAll, selectedList, options, clearBatch, config) => {
	const { refreshTableList } = getDatabaseStore()
	const { label, value } = options // label: 操作名称，value: 操作类型
	const { enable, exclude } = config
	const requestHandle = async (param: any) => {
		const requestList: Map<string, AnyFunction> = new Map([
			['sync', syncDatabaseEvent],
			['back', tabActive.value === 'mysql' ? batchBackMysqlData : backDatabaseEvent],
		])
		const fn = requestList.get(value)
		if (tabActive.value === 'mysql' && value === 'sync') {
			return fn && (await fn(selectedList.value))
		} else {
			return fn && (await fn(param))
		}
	}

	await batchConfirm({
		title: `批量${label}`,
		content: `批量${label}已选数据库，是否继续操作！`,
		column: [{ prop: 'name', label: '数据库名' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			const params = assembBatchParams(selectedList.value, exclude, enable)
			const res = tabActive.value === 'mysql' ? await requestHandle(params) : await nextAll(requestHandle)
			refreshTableList()
			clearBatch && clearBatch()
			if (tabActive.value === 'mysql') {
				const { data } = assembBatchResults(res.data)
				value !== 'sync' && openResultView(data, { title: label })
				return true
			} else {
				// 返回false则不关闭弹窗
				return false
			}
		},
	})
}

/**
 * @description 打开添加数据库弹窗
 * @param data redis时传入keyList，其他传入ServerList
 * @param sid 服务器id
 * @param keyId keyId redis时传入,用于定位当前tab选中的key
 */
export const openAddDatabaseView = (options: any, sid?: number, keyId?: string) => {
	const componentData: any = {
		mysql: () => import('@database/views/mysql/add-mysql/index.vue'),
		redis: () => import('@database/views/redis/add-redis/index.vue'),
		sqlserver: () => import('@database/views/sql-server/add-sql-server/index.vue'),
		mongodb: () => import('@database/views/mongo-db/add-mongo-db/index.vue'),
		pgsql: () => import('@database/views/pgsql/add-pgsql/index.vue'),
	}
	useDialog({
		title: '添加' + tabActive.value + '数据库',
		area: tabActive.value === 'redis' ? 44 : 56,
		compData: { refresh: () => options(), sid, keyId },
		showFooter: true,
		component: componentData[tabActive.value],
	})
}

/**
 * @description 批量操作公共配置
 * @param data
 * @returns
 */
export const useBatchConfig = (serverList?: CloudServerItem[]) => {
	return [
		{ label: '同步数据库', value: 'sync', event: useGeneralBatch },
		{ label: '备份数据库', value: 'back', event: useGeneralBatch },
		{
			label: '删除数据库',
			value: 'delete',
			event: (eventC, eventR, data: any, options, clear, config) => openDeleteDatabaseView(data.value, config),
		},
	]
}

export const storageData = {
	alioss: '阿里云OSS',
	ftp: 'FTP',
	sftp: 'SFTP',
	msonedrive: '微软OneDrive',
	qiniu: '七牛云',
	txcos: '腾讯COS',
	upyun: '又拍云',
	jdcloud: '京东云',
	aws_s3: '亚马逊存储',
	'Google Cloud': '谷歌云',
	'Google Drive': '谷歌网盘',
	bos: '百度云',
	obs: '华为云',
} as { [key: string]: string }

/**
 * @description 安装环境插件
 * @param name
 */
export const installEnvPlugin = async (name: string) => {
	if (!name) return

	const { data: res } = await getPluginInfo({ sName: name })

	if (name === 'pgsql_manager' && res.setup) {
		// 打开插件
		openPluginView({ name })
		return
	}

	pluginInstallDialog({
		name: res.name,
		type: 'i',
		pluginInfo: res,
	})
}

export const openPHpPlugin = () => {
	useDialog({
		title: 'PHPMyAdmin',
		area: [74, 56],
		component: () => import('@soft/public/environment-plugin/php-my-admin/index.vue'),
	})
}

/**
 * @description 批量设置分类
 * @param param0
 * @param callback
 */
export const setBatchClass = async (selectedList: Ref<any[]>, clearSelection: AnyFunction, classList: Ref<any[]>, config?: any) => {
	await batchClassDialog({
		name: '数据库分类',
		options: classList.value.filter((item: KeyItem) => Number(item.value) < 0),
		selectList: selectedList.value,
		request: async (data: AnyObject, close: AnyFunction) => {
			const { exclude, enable } = config
			const params = assembBatchParams(selectedList.value, exclude, enable, { params: { id: data.id } })
			await useDataHandle({
				loading: '正在批量设置数据库分类，请稍后...',
				request: setDbTypes(params),
				message: true,
			})
			clearSelection() // 清除选中
			isRefreshTable.value = true
			close()
		},
	})
}

/**
 * @description 更新服务器列表
 */
export const refreshServerList = async () => {
	const res = await useDataHandle({
		loading: '正在获取数据中，请稍后...',
		request: tabActive.value === 'mysql' ? getMysqlCloudServer() : getModulesCloudServer({ data: JSON.stringify({ type: tabActive.value }) }, tabActive.value),
		// data: [Array, (data: any) => data.filter((item: any) => item.id !== 0)],
		data: Array,
	})
	return res
}
