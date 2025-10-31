import type { ResponseResult } from '@/types'
import type { TermHostProps } from '@term/types'

import { createHost, getHostFind, removeHost } from '@/api/xterm'
import { removeEmptyValues } from '@/utils'
import { useConfirm, useDataHandle, useDialog } from '@hooks/tools'
import { useTermHostStore } from './useStore'
import { createTerminal } from '../../useController'

const { cutAuthType, isEdit, rowData, isRefreshList } = useTermHostStore()

/********** 编辑/添加主机信息配置业务操作 **********/

/**
 * @description 编辑服务器信息
 * @param {TerminalInfoProps} hostInfo 主机信息
 * @param {Function} refresh 刷新列表
 * @param {MouseEvent} ev 事件
 */
export const editHostInfo = (rows?: TermHostProps, refresh?: () => void, ev?: MouseEvent) => {
	ev?.stopPropagation() // 阻止事件冒泡
	rowData.value = rows as TermHostProps
	useDialog({
		title: isEdit.value ? '编辑主机信息' : '添加主机信息',
		area: 48,
		component: () => import('@term/views/host-list/add-host.vue'), // 组件引入
		compData: { rows: rows || {}, refresh },
		showFooter: true,
	})
}

// /**
//  * @description 主机行内容点击
//  * @param {TerminalInfoProps} hostInfo 主机信息
//  */
// export const hostRowClick = (rows: TermHostProps) => {
// 	createTerminal(rows)
// }

/**
 * @description 自动填充主机信息
 * @param {TermHostProps} rows 主机信息
 */
export const autoFillHostInfoEvent = (rows?: Ref<TermHostProps>) => {
	if (isEdit.value) return // 编辑状态不自动填充
	if (!isRef(rows) || !rows.value) return // 判断是否有数据 或者是否为响应式数据
	let host = rows.value.host,
		port,
		username,
		password
	// 判断是否有账号密码
	if (host.indexOf('@') != -1) {
		let tmp = host.split('@')
		host = tmp[1]
		username = tmp[0]
		if (username.indexOf(':') != -1) {
			let tmp = username.split(':')
			username = tmp[0]
			password = tmp[1]
		}
	}
	// 判断是否有端口
	if (host.indexOf(':') != -1) {
		let tmp = host.split(':')
		host = tmp[0]
		port = tmp[1]
	}
	// 赋值
	if (host) {
		rows.value.host = host
		rows.value.ps = host
	}
	if (port) rows.value.port = Number(port)
	if (username) rows.value.username = username
	if (password) rows.value.password = password
}

/**
 * @description 切换验证方式
 * @param {TermHostProps} rows 主机信息
 * @param {Function} validate 表单验证
 * @returns void
 */
export const cutAuthTypeEvent = (rows: Ref<TermHostProps>, clearValidate: () => void) => {
	clearValidate()
	// rows 清空
	for (const key in rows.value) {
		if (key === 'password') rows.value[key] = ''
	}
	if (cutAuthType.value === 'password') {
		rows.value.pkey = ''
		rows.value.pkey_passwd = ''
	} else {
		rows.value.password = ''
	}
}

/**
 * @description 同步主机信息到备注
 * @param {TermHostProps} rows 主机信息
 * @returns
 */
export const onChangeHost = (rows: Ref<TermHostProps>, val: string) => {
	rows.value.ps = rows.value.host
}

/**
 * @description 设置shell 数据
 * @param {TermHostProps} rows 主机信息
 */
export const setShell = (rows: TermHostProps) => {
	let shell = rows.shell
	// 兼容旧数据
	try {
		shell = JSON.parse(rows?.shell as string)
	} catch (error) {
		shell = rows.shell
	}
	rows.shell = shell
}

/**
 * @description 获取指定主机信息
 * @param {TermHostProps} rows 主机信息
 */
export const getFindHostInfo = async (rows: any) => {
	const { data } = await getHostFind(rows.host, rows.port as number)
	for (const item in data) {
		if (item === 'host') continue
		rows[item] = data[item]
	}
	setShell(rows)
	return data
}

/**
 * @description 确认表单提交
 * @param {TermHostProps} rows 主机信息
 * @param {Function} validate 表单验证
 * @param {Function} refresh 刷新列表
 */
export const submitHostForm = async (rows: Ref<TermHostProps>) => {
	try {
		const { status }: ResponseResult = await useDataHandle({
			loading: '正在' + (isEdit.value ? '修改' : '创建') + '主机信息，请稍后...',
			request: createHost(removeEmptyValues(rows.value) as TermHostProps),
			data: { status: Boolean, msg: String },
			message: true,
		})
		isRefreshList.value = true
		return status
	} catch (error) {
		console.error(error)
		return false
	}
}

/********** 删除终端配置业务  **********/

/**
 * @description 删除服务器信息
 * @param {TerminalInfoProps} hostInfo 主机信息
 * @param {Function} refresh 刷新列表
 * @param {MouseEvent} ev 事件
 */
export const deleteHostInfo = async (rows: TermHostProps, refresh: () => void, ev: MouseEvent) => {
	ev.stopPropagation() // 阻止事件冒泡
	try {
		await useConfirm({
			title: '删除服务器信息【' + rows.host + '】',
			content: '删除选中的信息后，该服务器信息将不在列表中显示，是否继续操作？',
			icon: 'warning-filled',
		})
		const { status }: ResponseResult = await useDataHandle({
			loading: '正在删除服务器信息，请稍后...',
			request: removeHost(rows.host, rows.port),
			data: { status: Boolean },
			message: true,
		})
		status && refresh() // 刷新列表
	} catch (error) {
		console.error(error)
	}
}

export const initHostInfo = async () => {
	if (rowData.value) {
		if (rowData.value.isLocal) {
			// 无法自动认证的情况下
			return {
				...rowData.value.rows,
				authType: rowData.value.rows.pkey ? 'private' : 'password',
			}
		} else {
			// 常规编辑
			const res = await getFindHostInfo(rowData.value)
			res.authType = res.pkey ? 'private' : 'password'
			return res
		}
	} else {
		// 添加
		return {
			host: '',
			port: 22,
			username: 'root',
			password: '',
			pkey: '',
			pkey_passwd: '',
			ps: '',
			authType: 'password',
		}
	}
}
