import type { TableColumnProps } from '@/components/data/bt-table/types'
import type { SoftTableRowProps } from '@soft/types.d'

import { useRouter } from 'vue-router'

import BtDivider from '@components/other/bt-divider'
import { ElSwitch, ElPopover } from 'element-plus'
import { Message } from '@hooks/tools/message'
import { checkObjKey, formatTime, getPageTotal, isArray, isFunction } from '@utils/index'
import { pluginHomeShow, pluginHomeUnShow, deployDel, getThirdRenewOrder, installPlugin } from '@/api/soft'

import { checkDiskWarnDialog, pluginInstallDialog, pluginPopupDialog, productPaymentDialog } from '@/public/popup'
import {} from '@hooks/tools/dialog'
import { DataHandle, useConfirm, useDataPage, useDialog } from '@/hooks/tools'

import { SOFT_STORE } from './store'
import { useGlobalStore } from '@store/global'
import SOFT_OTHER_STORE from '@soft/views/other/store'
import { openPathEvent } from '@/hooks/tools/table/event'
import BtImage from '@/components/base/bt-image'
import { checkPluginAuthType } from '@/public'

interface SoftColumnParams {
	type?: 'app' | 'deploy'
	onClick: (row: SoftTableRowProps) => void
	sortable?: boolean
}

const { setAuthState, enterpriseRec, payment } = useGlobalStore()

export const mysqlSelect = [
	{
		title: '1-2GB',
		data: {
			key_buffer_size: 32,
			query_cache_size: 32,
			tmp_table_size: 32,
			innodb_buffer_pool_size: 64,
			sort_buffer_size: 256,
			read_buffer_size: 256,
			read_rnd_buffer_size: 256,
			join_buffer_size: 512,
			thread_stack: 256,
			binlog_cache_size: 64,
			thread_cache_size: 64,
			table_open_cache: 128,
			max_connections: 100,
		},
	},
	{
		title: '2-4GB',
		data: {
			key_buffer_size: 64,
			query_cache_size: 64,
			tmp_table_size: 64,
			innodb_buffer_pool_size: 128,
			sort_buffer_size: 512,
			read_buffer_size: 512,
			read_rnd_buffer_size: 512,
			join_buffer_size: 1024,
			thread_stack: 256,
			binlog_cache_size: 64,
			thread_cache_size: 96,
			table_open_cache: 192,
			max_connections: 200,
		},
	},
	{
		title: '4-8GB',
		data: {
			key_buffer_size: 128,
			query_cache_size: 128,
			tmp_table_size: 128,
			innodb_buffer_pool_size: 256,
			sort_buffer_size: 1024,
			read_buffer_size: 1024,
			read_rnd_buffer_size: 768,
			join_buffer_size: 2048,
			thread_stack: 256,
			binlog_cache_size: 128,
			thread_cache_size: 128,
			table_open_cache: 384,
			max_connections: 300,
		},
	},
	{
		title: '8-16GB',
		data: {
			key_buffer_size: 256,
			query_cache_size: 256,
			tmp_table_size: 256,
			innodb_buffer_pool_size: 512,
			sort_buffer_size: 1024,
			read_buffer_size: 2048,
			read_rnd_buffer_size: 1024,
			join_buffer_size: 2048,
			thread_stack: 384,
			binlog_cache_size: 192,
			thread_cache_size: 192,
			table_open_cache: 1024,
			max_connections: 400,
		},
	},
	{
		title: '16-32GB',
		data: {
			key_buffer_size: 1024,
			query_cache_size: 384,
			tmp_table_size: 1024,
			innodb_buffer_pool_size: 1024,
			sort_buffer_size: 4096,
			read_buffer_size: 4096,
			read_rnd_buffer_size: 2048,
			join_buffer_size: 4096,
			thread_stack: 512,
			binlog_cache_size: 256,
			thread_cache_size: 256,
			table_open_cache: 2048,
			max_connections: 500,
		},
	},
] as any

export const mysqlPsData = {
	key_buffer_size: 'MB,用于索引的缓冲区大小',
	query_cache_size: 'MB,查询缓存,不开启请设为0',
	tmp_table_size: 'MB,临时表缓存大小',
	innodb_buffer_pool_size: 'MB,Innodb缓冲区大小',
	innodb_log_buffer_size: 'MB,Innodb日志缓冲区大小',
	sort_buffer_size: 'KB * 连接数,每个线程排序的缓冲大小',
	read_buffer_size: 'KB * 连接数读入缓冲区大小',
	read_rnd_buffer_size: 'KB * 连接数随机读取缓冲区大小',
	join_buffer_size: 'KB * 连接数关联表缓存大小',
	thread_stack: 'KB * 连接数每个线程的堆栈大小',
	binlog_cache_size: 'KB * 连接数二进制日志缓存大小(4096的倍数)',
	thread_cache_size: '线程池大小',
	table_open_cache: '表缓存',
	max_connections: '最大连接数',
} as AnyObject

/**
 * @description 渲染软件列表表头
 * @param {string} options.type 类型
 * @param {string} options.onClick 点击事件
 * @returns {TableColumnProps}
 */
export const useSoftName = (options: SoftColumnParams): TableColumnProps => {
	const { type } = options
	return {
		label: type === 'app' ? '软件名称' : '名称',
		prop: 'title',
		width: 250,
		sortable: options.sortable,
		showOverflowTooltip: false,
		render: (row: SoftTableRowProps) => {
			const appSrc = 'soft_ico/ico-' + (row.name?.indexOf('php-') > -1 ? 'php' : row.name) + '.png'
			// const appSrc = `/static/images/${row.type !== 4 ? 'soft_ico' : 'dep_ico'}/${row.icon}` // 插件路径
			const deploySrc = `/dep_ico/${row.name}.png` // 一键部署路径
			const title = row.title.indexOf('PHP-') > -1 ? 'PHP' : row.title
			return (
				<div class={`whitespace-normal inline-flex items-center p-[2px] ${row.setup ? 'cursor-pointer' : ''}`} title={row.setup ? '打开插件' : `${title} ${row.version}`} onClick={() => options.onClick(row)}>
					<BtImage src={type === 'app' ? appSrc : deploySrc} class={`${row.type === 10 ? '!h-[20px] !w-[22px]' : ''} soft-ico-img`} type="img">
						{{
							error: () => <img src="/static/images/soft_ico/icon_plug.svg" alt="" />,
						}}
					</BtImage>
					<span>{`${row.setup ? title : row.title} ${row.version || ''}`}</span>
					<span class={`text-warning ${!row.is_beta ? `hidden` : ''}`}>[测试版]</span>
				</div>
			)
		},
	}
}

/**
 * @description 渲染软件列表开发商
 * @returns {TableColumnProps}
 */
export const useSoftDev = (): TableColumnProps => ({
	label: '开发商',
	width: 80,
	render: (row: SoftTableRowProps) => <span class="truncate inline-block w-[8rem]"> {row.author || '官方'}</span>,
})

/**
 * @description 渲染软件列表说明
 * @returns {TableColumnProps}
 */
export const useSoftPs = (type: string): TableColumnProps => {
	return {
		label: type === 'app' ? '说明' : '介绍',
		showOverflowTooltip: false,
		render: (row: SoftTableRowProps) => <div class="leading-[16px]" v-html={row.ps} />,
	}
}

/**
 *
 * @param options 渲染软件列表评分
 * @returns {TableColumnProps}
 */
export const useSoftScore = (options: { onClick: (row: SoftTableRowProps) => void; sortable?: boolean }): TableColumnProps => {
	const { onClick, sortable } = options
	return {
		label: '评分',
		prop: 'score',
		width: 80,
		sortable,
		render: (row: SoftTableRowProps) => {
			if (!row.hasOwnProperty('score')) return <span>--</span>
			return (
				<span class="bt-link inline-block w-[4rem]" onClick={() => onClick(row)}>
					{row.score ? row.score : '无评分'}
				</span>
			)
		},
	}
}

/**
 * @description 渲染软件列表价格
 */
export const useSoftPrice = (): TableColumnProps => ({
	label: '价格/天',
	width: 70,
	render: (row: SoftTableRowProps) => {
		if (row.price > 0) {
			return <span class="text-warning">{`≈${(row.price / (row.name === 'btiplibrary' ? 365 : 30)).toFixed(2)}元`} </span>
		}
		return <span class="text-secondary">免费</span>
	},
})

/**
 * @description 渲染软件列表到期时间
 * @param {string} options.type 类型
 * @returns {TableColumnProps}
 */
export const useSoftEndTime = (options: SoftColumnParams): TableColumnProps => ({
	label: '到期时间',
	width: 130,
	showOverflowTooltip: false,
	render: (row: SoftTableRowProps) => {
		let endTime: string = row.endtime ? formatTime(row.endtime, 'yyyy-MM-dd') : '--'
		let btn = (
			<span class="bt-link" onClick={() => options.onClick(row)}>
				(续费)
			</span>
		)
		if (row.price > 0 && row.endtime === 0 && !payment.value.bindUser) return <span>--</span>
		//判断是否为付费插件
		if (row.price > 0) {
			if ([0, -1].includes(row.endtime)) {
				btn = <i></i>
				endTime = row.endtime === 0 ? '永久' : '未开通'
			} else if ([1, -2].includes(row.endtime)) {
				endTime = row.endtime > 1 ? endTime : '已到期'
			}
		} else {
			endTime = '--'
			btn = <i></i>
		}
		return (
			<span>
				{endTime}
				{btn}
			</span>
		)
	},
})

/**
 * @description 渲染软件列表位置
 * @returns {TableColumnProps}
 */
export const useSoftPosition = (): TableColumnProps => ({
	label: '位置',
	width: 50,
	render: (row: SoftTableRowProps) => {
		return row.setup ? (
			<span class="flex">
				<i title="打开插件文件目录" class="text-[var(--el-color-warning-light-3)] cursor-pointer svgtofont-folder-open !text-large" onClick={() => openPathEvent({ path: row.install_checks })}></i>
			</span>
		) : (
			<span>--</span>
		)
	},
})

/**
 * @description 渲染软件列表状态
 * @returns {TableColumnProps}
 */
export const useSoftStatus = (): TableColumnProps => ({
	label: '状态',
	prop: 'gateway',
	width: 50,
	render: (row: SoftTableRowProps) => {
		// 不是运行环境就不显示
		if (row.type !== 5) return <span>--</span>
		// 如果是phpmyadmin默认开启状态
		const status = row.name === 'phpmyadmin' ? true : row.status
		const style = status ? 'svgtofont-icon-start text-primary' : 'svgtofont-icon-stop text-danger'
		return row.setup ? (
			<span class="flex">
				<i class={style}></i>
			</span>
		) : (
			<span>--</span>
		)
	},
})

/**
 * @description 设置首页显示
 * @param {Function} options.onChange 触发事件
 * @returns {TableColumnProps}
 */
export const useSoftHomeShow = (options: { onChange: (row: SoftTableRowProps, val: boolean) => void }): TableColumnProps => ({
	label: '首页显示',
	prop: 'labels',
	width: 80,
	render: (row: SoftTableRowProps) => {
		return row.setup ? <ElSwitch size="small" v-model={row.index_display} onChange={(val: any) => options.onChange(row, Boolean(val))} /> : <span>--</span>
	},
})

/**
 * @description 获取软件列表操作配置
 * @param {ConfigPorp} config 对象
 * @returns {TableConfig} 表格配置
 */
export const useSoftOperate = (config: Array<AnyObject> | ((row: any) => Array<any>)): TableColumnProps => {
	return {
		label: '操作', // 操作
		align: 'right',
		width: 175,
		showOverflowTooltip: false,
		render: (row: any, index: number) => {
			const appSrc = `soft_ico/ico-${row?.name?.includes('php-') ? 'php' : row.name}.png`
			let configData: any = config
			// const appSrc = 'soft_ico/ico-' + (row.name?.indexOf('php-') > -1 ? 'php' : row.name) + '.png'
			// const appSrc = `/static/images/${row.type !== 4 ? 'soft_ico' : 'dep_ico'}/${row.icon}` // 插件路径
			const deploySrc = `/dep_ico/${row.name}.png` // 一键部署路径
			if (isFunction(config)) configData = config(row)

			const isDeploy = ![5, 6, 13, 7, 8, 12, 10, 11].includes(row.type)

			return (
				<ElPopover
					popperClass="el-popover-shadow el-light-popover !py-[6px]"
					trigger="hover"
					placement="top-start"
					enterable={false}
					show-after={200}
					hide-after={0}
					width="auto"
					v-slots={{
						reference: () => (
							<div class="text-right w-full">
								{configData.map((item: AnyObject, indexs: number) => {
									if (item.isHide && item.isHide(row)) return
									if (item.title === '更新' && row.name === 'tomcat') return
									return (
										<span class="soft-link">
											<span
												class="bt-link"
												title={item.title}
												onClick={ev => {
													if (item.type == 'pay' && row.type === 10) {
														const { buyThirdPluginView } = SOFT_OTHER_STORE()
														return buyThirdPluginView(row)
													}
													item.onClick(row, item.type, item.sourceId)
													return false
												}}>
												{item.title}
											</span>
											{indexs !== configData.length - 1 ? <BtDivider /> : ''}
										</span>
									)
								})}
							</div>
						),
					}}>
					<div class="flex items-center p-[2px] whitespace-nowrap">
						{/* <img src={appSrc} alt="" class={`${row.type === 10 ? 'h-[20px] w-[22px]' : ''} soft-ico-img`} /> */}
						<BtImage src={!isDeploy ? appSrc : deploySrc} class={`${!isDeploy ? '!h-[20px] !w-[22px]' : ''} soft-ico-img`} type="img">
							{{
								error: () => <img src="/static/images/soft_ico/icon_plug.svg" alt="" />,
							}}
						</BtImage>
						<span>{`${row.title} ${row.version}`}</span>
						<span class={`text-warning ${!row.is_beta ? `hidden` : ''}`}>[测试版]</span>
					</div>
				</ElPopover>
			)
		},
	}
}

/**
 * @description 修复插件
 * @param softData 插件信息
 */
export const openRepairView = async (softData: any) => {
	const isCheck = await checkDiskWarnDialog() // 判断是否弹出磁盘警告
	if (isCheck) return
	useDialog({
		title: `${softData.title}v${softData.version}-修复插件`,
		area: 50, // 【number、string、array<number/string>】视图大小，支持数组[宽，高]，默认单位rem
		component: () => import('@soft/views/plugin/repair-plugin/index.vue'), // 组件引入
		compData: { softData },
		showClose: true,
		showFooter: false,
	})
}

// /**
//  * @description 安装第三方插件
//  * @param data
//  */
// export const installOtherEvent = (data: any) => {
// 	useDialog({
// 		title: `安装第三方插件包`, //【string】 title，组件标题，为空不显示或false，可为空
// 		area: 50, // 【number、string、array<number/string>】视图大小，支持数组[宽，高]，默认单位rem
// 		btn: ['确定安装', '取消'], // 【string、array<string>】支持字符串和数组，布尔值，"确认"和"取消"按钮 ，可为空
// 		component: () => import('@soft/views/other/install-other-plugin/index.vue'), // 组件引入
// 		compData: data,
// 		showClose: true,
// 	})
// }

/**
 * @description 安装、更新软件
 * @param {row}  行数据
 * @param {type} 操作类型 默认install  install-安装、update-更新 repair-修复 uninstall-卸载 set-设置 preview-预览 pay-购买
 * @returns {Promise<void>}
 */
export const pluginInstallEvent = async (row: SoftTableRowProps, type?: string) => {
	try {
		const isCheck = await checkDiskWarnDialog() // 判断是否弹出磁盘警告
		if (isCheck) return
		let openType: 'i' | 'u' | 'r' = 'i'
		switch (type) {
			case 'install':
				openType = 'i'
				break
			case 'update':
				openType = 'u'
				break
			case 'repair':
				openType = 'r'
				break
		}
		// 判断是否为第三方插件
		if (row.type !== 10) {
			// type: i安装 u更新 r修复 默认安装
			const softData = {
				...row,
				// 安装成功的回调
				callback: () => {
					// 软件商店
					const { refreshRouteData } = SOFT_STORE()
					refreshRouteData('1')
				},
			}
			await pluginInstallDialog({
				name: row.name,
				type: openType,
				pluginInfo: softData,
			})
		} else {
			await useConfirm({
				title: '安装第三方插件',
				content: `您真的要安装[${row.title}]插件吗？`,
				icon: 'question-filled',
			})
			let loading = Message.load('正在获取插件信息，请稍后...')
			const pdata = await sendOrder(row)
			if (!pdata.status) return Message.error(pdata.msg)
			const { data } = await installPlugin({
				sName: row.name,
				version: row.versions[0].m_version,
				min_version: row.versions[0].version,
			})
			loading.close()
			if (data.hasOwnProperty('status') && !data.status) return Message.error(data.msg)
			const { installOtherEvent } = SOFT_OTHER_STORE()
			// 第三方插件安装
			installOtherEvent(data)
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 设置首页显示事件
 * @param {SoftTableRowProps} row 行数据
 * @param {boolean} val 是否显示
 * @returns {Promise<void>}
 */
export const setHomeShowEvent = async (row: any, val: boolean): Promise<any> => {
	const rdata = val ? await pluginHomeShow({ sName: row.name }) : await pluginHomeUnShow({ sName: row.name })
	Message.request(rdata)
	return rdata
}

/**
 * @description 跳转路径
 * @param path
 */
export const jumpPathEvent = (path: string) => {
	window.open(path, '_blank', 'noopener,noreferrer')
}

/**
 * @description 处理官方应用、第三方应用 表格数据处理
 * @param data 接口数据
 * @returns {SoftTableRowProps[]} returnList 返回列表
 * @returns {number} total 返回总数
 * @returns {any[]} historyList 返回搜索历史
 * @returns {any[]} typeList 返回软件类型
 */
export const softDataHandle = async (data: any) => {
	// 数据处理和类型验证
	const { softList, total, historyList, ltd, pro, m_list, typeList, isForce } = new DataHandle(data, {
		'list.data': [Array, 'softList'], // 列表数据
		'list.page': useDataPage(), // 分页数据
		ltd: Number, // 企业版
		pro: Number, // 专业版
		search_history: [Array, 'historyList'], // 搜索历史
		m_list: Array, // 模块列表
		type: [Array, 'typeList'], // 软件类型
		is_force: [Number, data => ({ isForce: Boolean(data) })], // 是否强制更新
	}).exportData()

	setAuthState([0, pro, ltd])

	// 判断是否存在模块列表，docker模块
	const newList = [...softList, ...[...m_list].map((item: any) => ({ ...item, is_docker: 1 }))]

	return { softList: newList, total, historyList, typeList, isForce }
}

/**
 * @description 软件强制刷新提示
 * @param {Boolean} isForce 是否强制刷新
 * @returns
 */
export const softForceMsg = (isForce: Boolean) => {
	let message = ''
	if (isForce) {
		message = '软件列表更新成功'
	} else if (!isForce && !enterpriseRec.value) {
		message = '未绑定宝塔官网账号，无法获取最新软件列表'
	} else {
		message = '云端连接失败，无法获取最新软件列表，请检查网络或稍后重试'
	}
	Message.msg({
		dangerouslyUseHTMLString: !isForce,
		message,
		type: isForce ? 'success' : 'warning',
		duration: 2000,
	})
}

/**
 * @description 软件列表预览事件
 * @param {SoftTableRowProps} row 行数据
 */
export const previewEvent = (row: SoftTableRowProps) => {
	window.open(row.preview_url, '_blank', 'noopener,noreferrer')
}

/**
 * @description 发送创建订单
 * @param row  行数据
 * @returns
 */
export const sendOrder = async (row: any) => {
	try {
		const { data, msg, status } = await getThirdRenewOrder({
			pid: row.pid,
			cycle: '1',
			type: 0, // 续费1，购买0
		})
		return data
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 续费软件
 * @param {row}  行数据
 * @param {type} 操作类型
 * @param {sourceId} 来源id
 * @returns {Promise<void>}
 */
export const pluginPayEvent = async (row: any, type?: string, sourceId?: number): Promise<void> => {
	const { authExpirationTime, forceLtd, aliyunEcsLtd } = useGlobalStore()
	let payOptions = {
		disablePro: row.type !== 8,
		compulsionLtd: row.type !== 8, // 强制企业版
		sourceId: sourceId,
		plugin: true,
		pluginInfo: row,
	}
	if (Number(authExpirationTime.value) === -2) sourceId = 32 // 过期后续费
	if (aliyunEcsLtd.value) {
		payOptions = {
			disablePro: true,
			compulsionLtd: true,
			sourceId: sourceId,
			plugin: true,
			pluginInfo: row,
		}
	}
	await productPaymentDialog(payOptions)
}

/**
 * @description 模块跳转
 * @param {SoftTableRowProps} row 行数据
 */
export const modulePathEvent = (row: SoftTableRowProps) => {
	const router = useRouter() // 路由
	router.push({ path: row.route }) // 跳转路径
}

/**
 * @description 软件列表 打开插件
 */
export const openPluginEvent = async (row: any) => {
	const isCheck = await checkDiskWarnDialog() // 判断是否弹出磁盘警告
	if (!row.setup || isCheck) return
	if ([8, 12].includes(row.type) && row.endtime < 0) return Message.error('加载失败：该插件未购买或已到期')
	// 若为环境插件，则直接打开环境插件视图
	const environmentPlugin = ['mysql', 'pureftpd', 'nginx', 'apache', 'tomcat', 'memcached', 'openlitespeed', 'phpmyadmin']
	const isEnvir = environmentPlugin.includes(row.name)
	const isPhp = row.name.indexOf('php-') !== -1
	if (isEnvir || isPhp) return pluginPopupDialog({ pluginInfo: row })

	// 打开插件弹窗前，先判断是否有操作此插件的权限
	const isAuth = await checkPluginAuthType(row.name)

	if (!isAuth) return false

	sessionStorage.setItem(
		'pluginViewInfo',
		JSON.stringify({
			...row,
			built: row.built ? '1' : '0',
		})
	)
	const { pluginInfo: pluginViewInfo } = useGlobalStore()
	pluginViewInfo.value.visible = true
	pluginViewInfo.value.id = row.name
	pluginViewInfo.value.name = row.title
	pluginViewInfo.value.callback = row?.callback || null
}
