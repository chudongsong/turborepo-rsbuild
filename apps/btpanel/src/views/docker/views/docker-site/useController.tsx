import type { TableBatchOptionsProps, TableBatchEventProps } from '@/components/extension/bt-table-batch/types.d'
import type { DockerSiteDelBatchProps, DockerSiteTableRowProps } from '@docker/types'
import { TableColumnProps } from '@/components/data/bt-table/types'
// import type { SelectOptionProps } from '@/components/form/bt-select/types';

import { useDialog } from '@/hooks/tools'
import { setDockerSiteCate } from '@api/docker' // 需求反馈
// import { formatTime, getByteUnit, copyText, isArray } from '@utils/index';
import { useDataHandle, useConfirm } from '@/hooks/tools'
import { getSoftStatus } from '@api/global'
// import { Message } from '@/hooks/tools';
import { useStatus } from '@hooks/tools/table/column'
import { getDockerStore } from '@docker/useStore'
import { DOCKER_SITE_STORE } from './useStore'
import { storeToRefs } from 'pinia'
import { DOCKER_SITE_ENV_STORE } from '@docker/views/docker-site/site-env/useStore'
import { delBatchDockerSite, setContainerStatus, setContainerRemark } from '@/api/docker'
import { batchClassDialog, openPluginView, pluginInstallDialog } from '@/public'

import BtTableStatus from '@/components/extension/bt-table-status'
import { useGlobalStore } from '@/store/global'
import { openTotalFlow } from '@/views/site/views/php-model/useController'
import { setCookie } from '@/utils'
import { isDark } from '@/utils/theme-config'

const { plugin } = useGlobalStore()
const { refreshSiteTable } = getDockerStore()
const { pluginInfo } = storeToRefs(DOCKER_SITE_STORE())
const { setSiteInfo, getClassList, setClass } = DOCKER_SITE_STORE()
const { resetData } = DOCKER_SITE_ENV_STORE()

/**
 * @description 通用项目事件
 */
export const classEvent = {
	get: async () => {
		const { data } = await getClassList()
		return data
	},
	add: (params: any) => {
		return setClass({ ...params }, 'add')
	},
	update: (params: any) => {
		const { id, name } = params
		return setClass({ id, name }, 'edit')
	},
	delete: (params: any) => {
		const { id } = params
		return setClass({ id }, 'del')
	},
}

/**
 * @description 批量设置分类配置
 * @param config.type 项目类型
 * @param config.refresh 刷新分类列表
 */
export const useBatchClassConfig = (config: { callback: AnyFunction; classList: any }): TableBatchOptionsProps => {
	return {
		label: '设置分类',
		value: 'setClass',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
			await batchClassDialog({
				name: '分类',
				options: config.classList.value.filter((item: any) => item.value !== 'all' && item.value !== '-2'),
				selectList: selectedList.value,
				request: async (data: AnyObject, close: AnyFunction) => {
					const site_ids = selectedList.value.map(item => item.id)
					await useDataHandle({
						loading: '正在批量设置分类，请稍后...',
						request: setDockerSiteCate({
							id: JSON.stringify(site_ids),
							classify: data.id,
						}),
						message: true,
					})
					clearSelection() // 清除选中
					refreshSiteTable()
					close()
					config.callback && config.callback()
				},
			})
		},
	}
}
/**
 * @description 批量部署证书配置
 */
export const useBatchSslConfig = (): TableBatchOptionsProps => {
	return {
		label: '部署证书',
		value: 'deploy',
		event: async (batchConfirm, nextAll, selectedList, options) => {
			setCertificationDialog(selectedList.value)
		},
	}
}

/**
 * @description 批量设置证书
 * @returns {Promise<VueConstructor>}
 */
export const setCertificationDialog = (rowList: any) =>
	useDialog({
		isAsync: true,
		title: '批量设置证书',
		area: 68,
		component: () => import('@site/public/batch-deployment-certificate/index.vue'),
		compData: rowList,
	})

/**
 * @description 到期时间
 * @returns { TableColumnProps }
 */
export const useEndtime = (config?: any): TableColumnProps => {
	return {
		label: '到期时间', // 用户名
		isCustom: true,
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
		component: () => import('@docker/views/docker-site/set-expirat-time/index.vue'),
		compData: { rowData: row, isMult },
		showFooter: true,
	})
}

/**
 * @description 项目名称
 * @param { AnyObject } options
 * @returns { TableColumnProps }
 */
export const useSiteName = (options: TableColumnProps): TableColumnProps => {
	return {
		label: options?.label || '网站名',
		prop: 'name',
		minWidth: 150,
		showOverflowTooltip: {
			show: true,
			enterable: false,
		},
		render: (row: any) => {
			let web: any = plugin.value?.web
			console.log(web)
			const isNoClick = options?.type === 'java' && !(row.is_file_ok || typeof row.is_file_ok === 'undefined')
			return (
				<div class="flex items-center inline-block truncate">
					{row?.waf && (row?.isWaf || row?.isWaf === undefined) ? (
						<span
							class="w-[1.6rem] mr-[4px] cursor-pointer flex items-center"
							onClick={() => {
								options.openPlugin && options.openPlugin(row, 'iconWaf')
							}}>
							<i class={`svgtofont-left-waf !text-extraLarge ${row.waf.status && web?.type === 'proxy' && web?.status && web?.setup ? 'text-primary' : 'text-tertiary'}`}></i>
						</span>
					) : (
						''
					)}
					<span class="!whitespace-pre-line inline-block w-[calc(100%-1.6rem)]" title={row?.cn_name}>
						<span
							onClick={() => {
								if (isNoClick) return
								options.onClick(row)
							}}
							class={`justify-start cursor-pointer ${isNoClick ? '' : 'bt-link'} `}>
							{row.name}
						</span>
					</span>
				</div>
			)
			return (
				<span class="bt-link" onClick={() => options.onClick(row)}>
					{row.name}
				</span>
			)
		},
	}
}
/**
 * @description 项目状态
 * @returns { TableColumnProps }
 */
export const useSiteStatus = (options: TableColumnProps): TableColumnProps => {
	return {
		label: '状态',
		prop: 'status',
		minWidth: 70,
		isCustom: true,
		sortable: false,
		width: 80,
		render: (row: any) => {
			let status = row?.run
			if (options?.prop) {
				status = row[options.prop] === '1' ? true : false
			}
			if (row[options.prop || 'status'] === undefined) {
				return <div class="loading h-[2rem]" v-bt-loading={true}></div>
			}
			return <BtTableStatus modelValue={status ? 1 : 0} data={['已停止', '运行中']} onClick={() => options.onClick(row)}></BtTableStatus>
			// return (
			// 	<ElPopover placement="right" width="100" popper-class="detail-popover !min-w-[10rem]" trigger="hover">
			// 		{{
			// 			default: () => (
			// 				<div class="flex items-center">
			// 					<span class="bt-link cursor-pointer" onClick={() => options.onClick(row)}>
			// 						{status ? '停止' : '启动'}
			// 					</span>
			// 					<BtDivider></BtDivider>
			// 					<span class="bt-link cursor-pointer" onClick={() => options.onClick(row, 'restart')}>
			// 						重启
			// 					</span>
			// 				</div>
			// 			),
			// 			reference: () => (
			// 				<BtTableStatus
			// 					modelValue={status ? 1 : 0}
			// 					data={['已停止', '运行中']}
			// 					onClick={() => options.onClick(row)}
			// 				></BtTableStatus>
			// 			),
			// 		}}
			// 	</ElPopover>
			// )
		},
	}
}
/**
 * @description ssl证书
 * @returns { TableColumnProps }
 */
export const useSsl = (options: TableColumnProps): TableColumnProps => {
	return {
		label: 'SSL证书',
		isCustom: true,
		render: (row: any) => {
			return (
				<span
					class={`cursor-pointer ${row.ssl === -1 ? 'text-warning' : row.ssl?.endtime < 0 ? 'text-danger' : `text-primary`}`}
					onClick={() => {
						options.onClick(row)
					}}>
					{row.ssl === -1 ? '未部署' : row.ssl?.endtime < 0 ? '已过期' : `剩余${row.ssl?.endtime}天`}
				</span>
			)
		},
	}
}
/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {AnyObject[]} selectedList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
export const useBatchEventHandle: TableBatchEventProps = async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
	const { label, value } = options
	const template: Map<string, string> = new Map([
		['start', '批量启动选中项目后，项目将正常访问'],
		['stop', '批量停用选中的项目后，项目将会停止运行'],
		['restart', '批量重启选中的项目后，项目将会重新启动'],
		['delete', '批量删除选中的项目后，项目将无法恢复'],
	])
	const requestHandle = async (item: AnyObject, index: number) => {
		const requestList: Map<string, AnyFunction> = new Map([
			['start', setContainerRemark],
			['stop', setContainerRemark],
			['restart', setContainerRemark],
			['delete', delBatchDockerSite],
		])
		const { name: username } = item
		const fn = requestList.get(value)
		switch (value) {
			// case 'start':
			// case 'stop':
			// case 'restart':
			//   if (fn) {
			//     const res = await fn(
			//       { data: JSON.stringify({ name: username }) },
			//       value
			//     );
			//     // 自定义返回数据
			//     if (value === 'start') {
			//       return {
			//         ...item,
			//         batchStatus: res.status ? 1 : 2,
			//         message: res.msg.replace(/<br>/g, '\n'),
			//       };
			//     }
			//     return {
			//       ...item,
			//       batchStatus: res.status ? 1 : 2,
			//       message: res.status ? res.data.msg : res.data.data,
			//     };
			//   }
			case 'delete':
				if (fn) {
					return await fn({ data: JSON.stringify({ name: username }) })
				}
		}
	}
	await useConfirm({
		title: `删除项目`,
		content: `风险操作，此操作不可逆，删除选中的${selectedList.value.length}个项目后您将无法管理这些项目，是否继续操作？`,
		icon: 'warning-filled',
		type: 'check',
		check: {
			content: '同时删除网站根目录',
			onConfirm: async (checkValue: boolean) => {
				const params: DockerSiteDelBatchProps = { site_list: JSON.stringify(selectedList.value.map((site: DockerSiteTableRowProps) => ({ site_name: site.name, id: site.id }))), remove_path: checkValue ? 1 : 0 }
				// 数据处理
				await useDataHandle({
					loading: `正在删除，请稍后...`,
					request: delBatchDockerSite(params),
					message: true,
					success: () => {
						clearSelection() // 清除选中
						refreshSiteTable()
					},
				})
			},
		},
	})
	// await batchConfirm({
	//   title: `批量${label}`,
	//   content: `${template.get(value) as string}，是否继续操作？`,
	//   column: [
	//     {
	//       label: '项目名称',
	//       prop: 'name',
	//     },
	//     useBatchStatus(),
	//   ] as TableColumnProps[], // 弹窗配置
	//   onConfirm: async () => {
	//     // 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
	//     await nextAll(requestHandle);
	//     // 执行完毕的代码，刷新列表
	// 		refreshSiteTable();
	//   },
	// });
}
/**
 * @description 检查插件状态
 * @returns {Promise<SoftInstallOptionProps>} 插件信息
 */
export const getNginxStatus = async () => {
	try {
		const { data } = await getSoftStatus({ name: 'nginx' })
		pluginInfo.value = data
		return data
	} catch (error) {
		console.log(error)
		return {}
	}
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
 * @description 创建
 * @returns {App}
 */
export const createSite = (props?: { type?: 'runEnv' | 'proxyContainer' | 'addPack'; formData: any }): Promise<boolean> => {
	return new Promise((resolve, error) => {
		useDialog({
			title: '创建网站',
			area: 70,
			btn: [`确认`, '取消'],
			component: () => import('@docker/views/docker-site/create-site/index.vue'),
			compData: props || {},
			// onConfirm: () => resolve(true),
			// onCancel: () => resolve(false),
		})
	})
}
/**
 * @description 运行环境
 * @returns {App}
 */
export const siteEnv = (callback?: AnyFunction): Promise<boolean> => {
	return new Promise((resolve, error) => {
		useDialog({
			title: '运行环境',
			area: 120,
			component: () => import('@docker/views/docker-site/site-env/index.vue'),
			// onConfirm: () => resolve(true),
			onCancel: () => {
				resetData()
				callback && callback()
			},
		})
	})
}
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

/**
 * @description 常用设置
 */
export const openCommonSettingsDialog = (name: any = 'setDefaultPage') =>
	useDialog({
		isAsync: true,
		title: '常用设置',
		area: [96, 62],
		component: () => import('@docker/views/docker-site/common-setting/index.vue'),
		compData: name,
		showFooter: false,
	})

/**
 * @description 打开设置
 */
export const openSettingView = (row: any, tab: string = '') => {
	// 设置网站信息
	setSiteInfo(row, tab)
	useDialog({
		title: 'Docker项目管理【' + row.name + '】 -- 添加时间【' + row.addtime + '】',
		area: [84, 70],
		component: () => import('@docker/views/docker-site/setting/index.vue'),
	})
}

/**
 * @description: 打开插件购买来源
 */
const checkSourceId = (name: string) => {
	// total:47,iconWaf:49 bt_waf:48
	switch (name) {
		case 'monitor':
			return 47
		case 'bt_waf':
			return 48
		case 'iconWaf':
			return 49
	}
}

/**
 * @description 打开插件
 * @param {any} row 行数据
 * @param {string} type 类型：total、btwaf
 */
export const openPlugin = async (row: any, type: string) => {
	if (type === 'monitor-setting') type = 'monitor'
	if (type === 'monitor') {
		// 存储cookie值
		const res = await openTotalFlow(row, false)
		if (!res) return
		setCookie('total_website', row.name)
	}
	// 环境
	const webEnType = plugin.value.web.type === 'nginx' ? 'btwaf' : 'btwaf_httpd'
	const source = checkSourceId(type)
	if (type !== 'monitor') type = webEnType
	await openPluginView({
		source,
		name: type,
		callback: (appWin: any) => {
			if (appWin && type !== 'monitor') {
				const interval = setInterval(() => {
					const pluginView = appWin.document.getElementsByClassName('layui-layer-page')[0] as HTMLElement
					if (appWin.site_waf_config && pluginView) {
						clearInterval(interval)
						if (pluginView) pluginView.style.display = 'none'
						appWin.site_waf_config(row.name) // 旧版代码，兼容使用
						const layerView2 = appWin.document.getElementsByClassName('layui-layer-page')[1] as HTMLElement
						if (layerView2) {
							layerView2.querySelector('.layui-layer-close')?.addEventListener('click', () => {
								pluginView.querySelector('.layui-layer-close')?.click()
							})
						}
					}
				}, 50)
			}
		},
	})
}
