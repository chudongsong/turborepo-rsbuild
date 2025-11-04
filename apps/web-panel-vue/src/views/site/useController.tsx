import { addSiteTypes, batchPhpType, getNpsQuestion, modifySiteTypes, removeProject, removeSiteType, setSiteTypes } from '@/api/site'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchEventProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import BtTableStatus from '@/components/extension/bt-table-status'
import BtDivider from '@/components/other/bt-divider'
import { Message, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { useBatchStatus, useStatus } from '@/hooks/tools/table/column'
import { assembBatchParams, batchClassDialog } from '@/public'
import { ElPopover } from 'element-plus'
import { SITE_STORE, useSiteStore } from './useStore'
import BtIcon from '@/components/base/bt-icon'
import { useGlobalStore } from '@/store/global'
import SiteRename from '@/views/site/views/php-model/site-rename/index.vue'
import { isDark } from '@/utils/theme-config'

const { plugin } = useGlobalStore()
const { isRefreshList, activeType, batchConfig: batchStoreConfig, isSiteMult } = useSiteStore()
const { delGeneralProjectEvent, getClassList, setProjectStatusEvent } = SITE_STORE()
interface SiteColumnParams {
	label?: string
	type?: string
	prop?: string
	onClick: AnyFunction
	openPlugin?: AnyFunction
}

export const envRef = ref<any>() // 环境检测ref
export const classList = ref<any>([]) // 分类列表

/**
 * @description 项目名称
 * @param { AnyObject } options
 * @returns { TableColumnProps }
 */
export const useSiteName = (options: SiteColumnParams): TableColumnProps => {
	return {
		label: options?.label || '项目名称',
		prop: 'name',
		minWidth: 120,
		sortable: true,
		render: (row: any) => {
			const web = plugin.value.web
			const isNoClick = options?.type === 'java' && !(row.is_file_ok || typeof row.is_file_ok === 'undefined')
			return (
				<div class="flex items-center inline-block truncate">
					{row?.waf && (row?.isWaf || row?.isWaf === undefined) ? (
						<span
							class="w-[1.6rem] mr-[4px] cursor-pointer flex items-center"
							onClick={() => {
								options.openPlugin && options.openPlugin(row, 'iconWaf')
							}}>
							<BtIcon icon="left-waf" class={`!text-extraLarge ${row.waf.status && web?.type === 'nginx' && web?.status && web?.setup ? '!text-primary' : '!text-tertiary'}`} size={20}></BtIcon>
						</span>
					) : (
						''
					)}
					<span class="!w-full !whitespace-pre-line flex ml-[4px]" title={row?.cn_name && row.name !== row?.cn_name ? row?.cn_name : ''}>
						{options?.type === 'php' ? (
							<SiteRename
								row={row}
								onClick={() => options.onClick(row)}
								refresh={() => {
									isRefreshList.value = true
								}}></SiteRename>
						) : (
							<span
								onClick={() => {
									if (isNoClick) return
									options.onClick(row)
								}}
								class={`justify-start cursor-pointer ${isNoClick ? '' : 'bt-link'} `}>
								{row.name}
							</span>
						)}
					</span>
				</div>
			)
		},
	}
}

/**
 * @description 项目状态
 * @returns { TableColumnProps }
 */
export const useSiteStatus = (options: SiteColumnParams): TableColumnProps => {
	const type = options?.type
	return useStatus({
		prop: 'run',
		event: options.onClick,
		data: ['未启动', '运行中'],
		width: 80,
		function: (row: any) => {
			let status = row?.run
			if (options?.prop) {
				status = row[options.prop] !== null ? true : false
			}
			if (type === 'nodejs' && row.project_config.project_type === 'pm2' && row.run === undefined) {
				return <div class="loading h-[2rem]" v-bt-loading={true}></div>
			}
			return (
				<ElPopover placement="right" width="160" popper-class="detail-popover" trigger="hover">
					{{
						default: () => (
							<div class="flex items-center">
								<span class="bt-link cursor-pointer" onClick={() => options.onClick(row)}>
									{status ? '停止' : '启动'}
								</span>
								<BtDivider></BtDivider>
								<span class="bt-link cursor-pointer" onClick={() => options.onClick(row, 'restart')}>
									重启
								</span>
								<BtDivider></BtDivider>
								<span class="bt-link cursor-pointer" onClick={() => options.onClick(row, 'setting')}>
									告警设置
								</span>
							</div>
						),
						reference: () => <BtTableStatus modelValue={status ? 1 : 0} data={['未启动', '运行中']} onClick={() => options.onClick(row)}></BtTableStatus>,
					}}
				</ElPopover>
			)
		},
	})
}

/**
 * @description 到期时间
 * @returns { TableColumnProps }
 */
export const useEndtime = (config?: any): TableColumnProps => {
	return {
		label: '到期时间', // 用户名
		isCustom: true,
		sortable: true,
		prop: 'edate',
		minWidth: 100,
		width: 100,
		render: (row: any) => {
			// 计算到期时间是否已经过期，过期显示红色
			// 获取今日00:00时间戳
			const todayStart = new Date().setHours(0, 0, 0, 0)
			const now = Date.now()
			// 检查日期是否有效（非'0000-00-00'），并转换为时间戳
			const edateTimestamp = row.edate !== '0000-00-00' ? new Date(row.edate).getTime() : null

			// 计算是否过期（比较到期时间戳和今日00:00的时间戳）
			const isExpired = edateTimestamp && edateTimestamp < todayStart

			// 计算是否显示橙色（到期时间和当前时间的差值小于7天）
			const isOrange = edateTimestamp && edateTimestamp - now < 7 * 24 * 60 * 60 * 1000

			return (
				<span class={'cursor-pointer ' + (isExpired ? 'bt-danger' : isOrange ? 'bt-warn' : 'bt-link')} onClick={() => setEdateEvent(row)}>
					{isExpired ? '已过期' : row.edate === '0000-00-00' ? '永久' : row.edate}
				</span>
			)
		},
	}
}

/**
 * @description 设置到期时间
 */
export const setEdateEvent = (row: any, isMult: boolean = false) => {
	useDialog({
		title: `【${row.name}】到期时间设置`,
		area: 48,
		component: () => import('@site/public/set-expirat-time/index.vue'),
		compData: { rowData: row, isMult },
		showFooter: true,
	})
}

/**
 * @description ssl证书
 * @returns { TableColumnProps }
 */
export const useSsl = (options: SiteColumnParams): TableColumnProps => {
	return {
		label: 'SSL证书',
		prop: 'site_ssl',
		isCustom: true,
		sortable: true,
		minWidth: 100,
		width: 100,
		render: (row: any) => {
			return (
				<span
					class={`cursor-pointer ${row.ssl === -1 ? 'text-warning' : row.ssl?.endtime < 0 ? 'text-danger' : `text-primary`}`}
					onClick={() => {
						options.onClick(row)
					}}>
					{row.ssl === -1 ? '未部署' : row.ssl?.endtime > 0 ? `剩余${row.ssl?.endtime}天` : '已过期'}
				</span>
			)
		},
	}
}

/**
 * @description 端口
 */
export const usePort = (): TableColumnProps => {
	return {
		label: '端口',
		prop: 'port',
		width: 120,
	}
}
/**
 * @description 批量部署证书配置
 */
export const useBatchSslConfig = (): TableBatchOptionsProps => {
	return {
		label: '部署证书',
		value: 'deploy',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection, config) => {
			batchStoreConfig.value = config
			isSiteMult.value = true
			setCertificationDialog(selectedList.value, clearSelection)
		},
	}
}

/**
 * @description 批量设置分类配置
 * @param config.refresh 刷新分类列表
 */
export const useBatchClassConfig = (config: { callback?: AnyFunction; classList: any }): TableBatchOptionsProps => {
	return {
		label: '设置分类',
		value: 'setClass',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection, batchConfig) => {
			await batchClassDialog({
				name: '分类',
				options: config.classList.value.filter((item: any) => item.value !== 'all' && item.value !== '-2'),
				selectList: selectedList.value,
				request: async (data: AnyObject, close: AnyFunction) => {
					// if (activeType.value === 'php') {
					const { exclude, enable } = batchConfig
					const params = assembBatchParams(selectedList.value, exclude, enable, { params: { project_type: activeType.value.toUpperCase(), id: data.id } })
					await useDataHandle({
						loading: '正在批量设置分类，请稍后...',
						request: batchPhpType(params),
						message: true,
					})
					// } else {
					// 	const site_ids = selectedList.value.map(item => item.id)
					// 	await useDataHandle({
					// 		loading: '正在批量设置分类，请稍后...',
					// 		request: setSiteTypes(
					// 			{
					// 				site_ids: JSON.stringify(site_ids),
					// 				[activeType.value !== 'php' ? 'type_id' : 'id']: data.id,
					// 			},
					// 			activeType.value
					// 		),
					// 		message: true,
					// 	})
					// }
					clearSelection && clearSelection() // 清除选中
					isRefreshList.value = true
					close()
					config.callback && config.callback()
				},
			})
		},
	}
}

/***********************通用配置-弹窗************************/

/**
 * @description 打开结果弹窗
 * @param { any[] } data.resultData 数据
 * @param { string } data.resultTitle 标题
 * @param { string } data.autoTitle 自定义标题
 * @param { number | number[] } area 弹窗大小
 */
export const openResultDialog = (data: any, area?: any) => {
	useDialog({
		title: data?.title || '批量操作结果',
		area: area || 42,
		component: () => import('@/components/extension/bt-result/index.vue'),
		compData: data,
	})
}

// /**
//  * @description 打开项目守护设置弹窗 -功能下架
//  */
// export const openProjectGuardianView = () => {
// 	useDialog({
// 		isAsync: true,
// 		title: `设置项目启动时间`,
// 		area: 42,
// 		showFooter: true,
// 		component: () => import('@site/public/project-guardian/index.vue'),
// 	})
// }

/**
 * @description sdk版本管理
 * @param {string} type - 类型 go | py
 * @param {Function} refresh - 刷新函数
 */
export const openEnvVersionView = (type: string, refresh?: AnyFunction) => {
	const isGo = type === 'go'
	useDialog({
		// type为go时，弹窗标题为Go-sdk版本管理，type为python时，弹窗标题为Python版本管理
		title: `${isGo ? 'Go' : 'Python'}-${isGo ? 'SDK' : ''}版本管理`,
		area: 50,
		component: () => import('@site/public/env-version-manage/index.vue'),
		compData: { type, refresh },
	})
}

/**
 * @description 删除项目
 * @param { any | any[] } row 行数据
 * @param { string } modules  模块
 */
export const delGeneralProject = async (row: any | any[], modules: string = activeType.value) => {
	await useConfirm({
		title: `${`删除${modules}项目-${row.name}`}`,
		content: `${`风险操作，此操作不可逆，删除${row.name}项目后您将无法管理该项目，是否继续操作？`}`,
		type: 'input',
		input: { content: `删除项目` },
	})

	try {
		const paramsType: AnyObject = {
			python: { data: JSON.stringify({ name: row.name }) },
			default: { data: JSON.stringify({ project_name: row.name }) },
		}

		const params = paramsType[modules] || paramsType.default
		const res = await delGeneralProjectEvent(params)
		Message.request(res)
		if (res.status) isRefreshList.value = true
	} catch (error) {
		console.log(error)
		Message.error('删除失败')
		return { status: false, msg: '删除失败' }
	}
}

/**
 * @description 通用项目事件
 */
export const classEvent = {
	get: async () => {
		const { data } = await getClassList()
		classList.value = data
		return data
	},
	add: (params: any) => {
		return addSiteTypes({ ...params, ps: '' }, activeType.value)
	},
	update: (params: any) => {
		const { id: type_id, ...rest } = params
		return modifySiteTypes({ type_id, ...rest, ps: '' }, activeType.value)
	},
	delete: (params: any) => {
		const { id: type_id } = params
		return removeSiteType({ type_id }, activeType.value)
	},
}

/**
 * @description 设置项目状态 除python项目,反代外的项目状态配置
 * @param { any } row 行数据
 * @param { string } modules 模块 start | stop | restart
 * @param { string } type 页面名称 other | go | nodejs
 */
export const setProjectStatus = async (row: any, modules: 'start' | 'stop' | 'restart', type: string = activeType.value) => {
	try {
		// 判定项目是否过期，过期则提示请设置站点到期时间
		const todayStart = new Date().setHours(0, 0, 0, 0)
		const isExpired = row.edate !== '0000-00-00' && new Date(row.edate).getTime() / 1000 < todayStart / 1000
		if (isExpired) {
			Message.error('项目已过期，请设置站点到期时间后再操作')
			return
		}
		const contentKey: AnyObject = {
			start: `即将启动项目${row.name}，确定要启动项目吗？`,
			stop: `停用项目${row.name}后，项目将无法访问，确定要停用项目吗？`,
			restart: `即将重启项目${row.name}，确定要重启项目吗？`,
		}

		await useConfirm({
			icon: 'warning-filled',
			title: '设置项目状态',
			content: contentKey[modules],
		})

		const paramsType: AnyObject = {
			python: { data: JSON.stringify({ name: row.name }) },
			nodejs: {
				project_name: row.name,
				project_type: row.project_config.project_type || 'nodejs',
				status: modules,
			},
			java: { project_name: row.name },
			phpasync: {
				sitename: row.name,
				project_action: modules,
			},
			default: {
				data: JSON.stringify({ project_name: row.name }),
			},
		}
		let params: any = paramsType[type] || paramsType.default

		// nodejs项目
		if (type === 'nodejs' && row.project_config.project_type === 'pm2') {
			params['pm2_name'] = row.pm2_name || row.project_config.pm2_name
		}
		const res = await setProjectStatusEvent(params, modules, type)
		isRefreshList.value = true
		return res
	} catch (error) {
		console.log(error)
		return { status: false, msg: '操作失败' }
	}
}
/**
 * @description 证书到期提醒
 */
export const sslExpireDialog = (data?: AnyObject): Promise<any> =>
	useDialog({
		title: '到期提醒配置',
		area: 50,
		showFooter: true,
		confirmText: '保存配置',
		component: () => import('@site/public/ssl-arrange/current-cert/ssl-expire-configure.vue'),
		compData: data ? true : false,
		onCancel: data?.onCancel || (() => {}),
	})

/**
 * @description 需求反馈
 */
export const openNpsEvent = async () => {
	const { data }: any = await useDataHandle({
		request: getNpsQuestion({ version: -1, product_type: 14 }),
	})
	if (!data.status) return Message.error('请求失败，请稍候重试')
	useDialog({
		component: () => import('@/components/business/bt-nps-survey-v2/index.vue'),
		area: 52,
		compData: {
			name: '网站',
			type: 14,
			id: data.msg[0]?.id,
			description: data.msg[0]?.question,
		},
	})
}

/**
 * @description 获取Ace编辑器配置信息
 * @param { string } params.readonly 是否只读 默认false
 */
export const getAceConfig = (
	params: { readonly: boolean; theme: string } = {
		readonly: false,
		theme: 'chrome',
	}
) => {
	return {
		mode: 'ace/mode/nginx',
		theme: !isDark.value ? `ace/theme/${params.theme}` : 'ace/theme/clouds_midnight', // 主题
		wrap: true, // 是否自动换行
		showInvisibles: false, // 是否显示空格
		showFoldWidgets: false, // 是否显示代码折叠线
		useSoftTabs: true, // 是否使用空格代替tab
		tabSize: 2, // tab宽度
		showPrintMargin: false, // 是否显示打印边距
		readOnly: params.readonly, // 是否只读
		fontSize: '12px', // 字体大小
	}
}

/**
 * @description 防篡改日志
 */
export const tamperCoreLogDialog = (compData: any) => {
	return useDialog({
		title: compData.title,
		area: 68,
		component: () => import('@site/views/php-model/tamper-proof-core/tamper-core/log-details.vue'),
		compData: compData,
	})
}

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchCofirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {AnyObject[]} selectedList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
export const useBatchDeleteHandle: TableBatchEventProps = async (batchCofirm, nextAll, selectedList, options) => {
	const { label, value } = options
	const template: Map<string, string> = new Map([['delete', '批量删除选中的项目后，项目将无法恢复']])
	const requestHandle = async (item: AnyObject, index: number) => {
		const requestList: Map<string, AnyFunction> = new Map([['delete', removeProject]])
		const { name: username } = item
		const fn = requestList.get(value)
		switch (value) {
			case 'delete':
				if (fn) {
					const res = await fn({ data: JSON.stringify({ project_name: username }) }, activeType.value)
					return {
						...item,
						batchStatus: res.status ? 1 : 2,
						message: res.status ? res.data.msg : res.data.data,
					}
				}
		}
	}
	await batchCofirm({
		title: `批量${label}`,
		content: `${template.get(value) as string}，是否继续操作？`,
		column: [{ label: '项目名称', prop: 'name' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			isRefreshList.value = true
			return false
		},
	})
}

// 防篡改
export const tamperConfigType: any = {
	create: '创建文件',
	modify: '编辑文件',
	unlink: '删除文件',
	mkdir: '新建文件夹',
	rmdir: '删除文件夹',
	rename: '文件重命名',
	link: '创建软链',
	chmod: '修改文件权限',
	chown: '修改所有者',
}

export const cloudMap = {
	//云存储列表名
	localhost: '服务器磁盘',
	alioss: '阿里云OSS',
	ftp: 'FTP',
	sftp: 'SFTP',
	msonedrive: '微软OneDrive',
	qiniu: '七牛云',
	txcos: '腾讯COS',
	upyun: '又拍云',
	tianyiyun: '天翼云',
	jdcloud: '京东云',
	aws_s3: '亚马逊存储',
	'Google Cloud': '谷歌云',
	'Google Drive': '谷歌网盘',
	bos: '百度云',
	obs: '华为云',
	webdav: 'WebDav',
	minio: 'MinIO',
	dogecloud: '多吉云COS',
} as any

/**
 * @description 批量设置证书
 * @returns {Promise<VueConstructor>}
 */
export const setCertificationDialog = (rowList: any, clearSelection?: any) =>
	useDialog({
		isAsync: true,
		title: '批量设置证书',
		area: 68,
		component: () => import('@site/public/batch-deployment-certificate/index.vue'),
		compData: rowList,
		onCancel: () => {
			clearSelection && clearSelection()
		},
	})
