import { backupSite, getWpList, setPhpSiteStatus, setWpSiteCache } from '@/api/wp'
import BtDivider from '@/components/other/bt-divider'
import { useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { OperationButtonProps } from '@/hooks/tools/operation/types'
import { useBatchStatus, useCheckbox, useOperate, usePath, useStatus, useSwitch } from '@/hooks/tools/table/column'
import { getPageTotal, isObject } from '@/utils'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'
import { useGlobalStore } from '@/store/global'
import { RequestProps } from '@/hooks/tools/message/types'
import { useSiteStore } from '@/views/site/useStore'
import useWPLocalAddStore from '@/views/wordpress/view/local/add-wordpress/useStore'
import { openDeleteSiteView, useBatchEventHandle } from '@/views/site/views/php-model/useController'
import { TableBatchEventProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { TableColumnProps } from '@/components/data/bt-table/types'
import useWPLocalConfigStore from '@/views/wordpress/view/local/site-config/useStore'
import useWPWordpressSettingStore from '@/views/wordpress/view/local/site-config/wordpress/useStore'
import { useWpAutoLogin } from '@/views/wordpress/useMethod'

const { localRow, loginUrl, isRefreshLocalList, cloneLocalForm } = storeToRefs(useWPLocalStore())
const { payment } = useGlobalStore()
const { siteInfo, siteType } = useSiteStore()
const { createSiteSubmit, tabActive: tabActiveAdd, createImportSubmit } = storeToRefs(useWPLocalAddStore())
const { tabActive: tabActiveConfig } = storeToRefs(useWPLocalConfigStore())
const { tabActive: tabActiveWordpress } = storeToRefs(useWPWordpressSettingStore())

export const operation = (): OperationButtonProps[] => {
	return [
		{
			type: 'button',
			label: '添加 Wordpress',
			active: true,
			onClick: () => {
				useDialog({
					title: '添加站点',
					area: 60,
					btn: true,
					component: () => import('@/views/wordpress/view/local/add-wordpress/index.vue'),
					onConfirm: async () => {
						try {
							tabActiveAdd.value === 'single' ? createSiteSubmit.value && (await createSiteSubmit.value()) : createImportSubmit.value && (await createImportSubmit.value())
						} catch (error) {
							return false
						}
					},
				})
			},
		},
		{
			type: 'button',
			label: '迁移站点',
			onClick: () => {
				useDialog({
					title: '迁移站点',
					area: 60,
					component: () => import('@/views/wordpress/view/local/migrate-site/index.vue'),
				})
			},
		},
		{
			type: 'button',
			label: 'WP 套件',
			onClick: () => {
				useDialog({
					title: 'WP 套件',
					area: 60,
					component: () => import('@/views/wordpress/view/local/sets-site/index.vue'),
				})
			},
		},
	]
}

/**
 * @description 本地管理列表
 **/
export const getWpLocalListData = async (params: any) => {
	try {
		const {
			data: { data, page, search_history, error },
		} = await getWpList({ ...params, table: 'sites', project_type: 'WP2' })
		return {
			data: data,
			total: getPageTotal(page),
			other: { search_history, error },
		}
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: { search_history: [] } }
	}
}

/**
 * @description 本地管理列表配置
 */
export const getWpLocalListConfig = () => {
	return [
		useCheckbox(),
		{
			label: '网站名',
			minWidth: 180,
			isCustom: true,
			showOverflowTooltip: true,
			prop: 'name',
			render: (row: any) => {
				return (
					<span
						class="bt-link"
						onClick={() => {
							localRow.value = row
							siteInfo.value = row
							siteType.value = 'php'
							onOpenSite(row, 'domain')
						}}>
						{row.name}
					</span>
				)
			},
		},
		useStatus({
			width: 100,
			event: async row => {
				await useConfirm({
					title: `${row.status === '0' ? '开启' : '暂定'} 网站 【${row.name}】`,
					content: `${row.status === '0' ? '即将开启此网站，您确定继续吗？' : '关闭网站时无法访问，您确定继续吗？'}`,
					onConfirm: async () => {
						await useDataHandle({
							loading: '正在操作中，请稍后...',
							message: true,
							request: setPhpSiteStatus(row.status === '0', { id: row.id, name: row.name }),
							success: (rdata: RequestProps) => {
								if (rdata.status) isRefreshLocalList.value = true
							},
						})
					},
				})
			},
			data: ['已停用', '已启用'],
		}),
		{
			label: '备份',
			minWidth: 80,
			isCustom: true,
			prop: 'backup_count',
			render: (row: any) => {
				return (
					<span
						class="bt-link"
						onClick={() => {
							localRow.value = row
							useDialog({
								title: `网站备份数据【${row.name}】`,
								area: 85,
								component: () => import('@/views/wordpress/view/local/site-backup/index.vue'),
							})
						}}
						style={row.backup_count > 0 ? '' : 'color:var(--el-color-warning) !important'}>
						{row.backup_count > 0 ? `有备份(${row.backup_count})` : '点击备份'}
					</span>
				)
			},
		},
		usePath({
			prop: 'path',
			minWidth: 120,
			width: 200,
		}),
		useSwitch({
			label: '缓存',
			prop: 'cache_status',
			size: 'small',
			event: (e: Event, row: any) => {
				useDataHandle({
					loading: `${e ? '开启' : '关闭'}缓存中，请稍候...`,
					message: true,
					request: setWpSiteCache({ version: row.php_version, sitename: row.name, act: e ? 'enable' : 'disable' }),
					success: (rdata: RequestProps) => {
						if (!rdata.status) row.cache_status = !row.cache_status
					},
				})
			},
		}),
		useOperate(
			(row: any) => {
				return [
					{
						onClick: () => {
							tabActiveWordpress.value = 'setup'
							onOpenSite(row, 'wordpress')
						},
						title: row.wp_version == '00' ? 'Static' : (row.wp_version as string),
					},
					{
						onClick: () => {
							localRow.value = row
							cloneLocalForm.value.cache_status = row.cache_status
							useDialog({
								title: '克隆网站',
								btn: true,
								area: 60,
								component: () => import('@/views/wordpress/view/local/clone-site/index.vue'),
							})
						},
						title: '克隆',
					},
					{
						onClick: () => {
							tabActiveWordpress.value = 'plugin'
							onOpenSite(row, 'wordpress')
						},
						title: '插件',
					},
					{
						onClick: () => {
							tabActiveWordpress.value = 'theme'
							onOpenSite(row, 'wordpress')
						},
						title: '主题',
					},
					{
						onClick: () => {
							localRow.value = row
							useDialog({
								title: `安全工具【${row.name}】`,
								area: 60,
								component: () => import('@/views/wordpress/view/local/site-protection/index.vue'),
							})
						},
						title: '保护',
					},
					{
						onClick: () => {
							localRow.value = row
							useDialog({
								title: `检查WordPress完整性【${row.name}】`,
								area: 60,
								component: () => import('@/views/wordpress/view/local/integrity-check/index.vue'),
							})
						},
						title: '完整性检查',
					},
				]
			},
			{
				label: 'WP 设置',
				fixed: false,
				width: 350,
			}
		),
		{
			label: 'PHP', // 用户名
			isCustom: true,
			width: 100,
			minWidth: 100,
			render: (row: any) => {
				let isInstallPhp = !row.php_version_status
				return (
					<span class={'cursor-pointer ' + (isInstallPhp && row.php_version !== '静态' ? 'bt-warn' : 'bt-link')} onClick={() => onOpenSite(row, 'php')}>
						{isInstallPhp && row.php_version !== '静态' ? row.php_version + '[未安装]' : row.php_version == '其它' ? '自定义' : row.php_version}
					</span>
				)
			},
		},
		{
			label: 'SSL',
			minWidth: 100,
			isCustom: true,
			prop: 'ssl',
			render: (row: any) => {
				const { ssl } = row

				// 判断是否部署了SSL证书
				if (isObject(ssl)) {
					return (
						<span
							class="bt-link"
							style={ssl.endtime < 0 ? 'color:var(--el-color-danger) !important' : ''}
							onClick={() => {
								onOpenSite(row, 'ssl')
							}}>
							{ssl.endtime < 0 ? '已过期' : `在${ssl.endtime}天内到期`}
						</span>
					)
				}

				return (
					<span
						class="bt-link !text-warning"
						onClick={() => {
							onOpenSite(row, 'ssl')
						}}>
						未设置
					</span>
				)
			},
		},
		useOperate(
			(row: any) => {
				return [
					{
						title: '登录',
						render: () => {
							return (
								<div class={'inline-block'}>
									{row.status == '0' ? (
										<span class={'text-tertiary'} style={'cursor:not-allowed'}>
											登录
										</span>
									) : (
										<span
											class={'bt-link'}
											onClick={() => {
												localRow.value = row
												useDialog({
													title: 'WP登录',
													area: 42,
													component: () => import('@/views/wordpress/view/local/login-site/index.vue'),
												})
											}}>
											登录
										</span>
									)}
									<BtDivider />
								</div>
							)
						},
					},
					{
						onClick: () => {
							onOpenSite(row)
						},
						title: '设置',
					},
					{
						onClick: (row: any) => {
							localRow.value = row
							onDelete(row)
						},
						title: '删除',
					},
				]
			},
			{
				fixed: 'right',
				width: 150,
				label: '操作',
			}
		),
	]
}

/**
 * @description 本地管理列表批量操作
 */
export const getWpLocalBatchOperate = () => {
	return [
		{ label: '启动站点', value: 'start', event: useBatchEventHandle },
		{
			label: '停用站点',
			value: 'stop',
			event: useBatchEventHandle,
		},
		{
			label: '备份站点',
			value: 'backSite',
			event: useBatchWpEventHandle,
		},
		{
			label: '删除站点',
			value: 'delete',
			event: async (batchConfirm, nextAll, selectedList, options) => {
				openDeleteSiteView(selectedList.value)
			},
		},
	] as TableBatchOptionsProps[]
}

/**
 * @description 本地管理列表登录
 */
export const onLogin = () => {
	window.open(loginUrl.value, '_blank', 'noopener,noreferrer')
}

/**
 * @description 本地管理列表登录
 */
export const onPay = () => {
	useWpAutoLogin(localRow.value.id, 'local')
}

/**
 * @description 本地管理列表删除
 */
export const onDelete = async (row: any) => {
	useDialog({
		title: '删除站点确认',
		component: () => import('@site/views/php-model/delete-site/index.vue'),
		area: 'auto',
		compData: row,
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
export const useBatchWpEventHandle: TableBatchEventProps = async (batchConfirm, nextAll, selectedList, options) => {
	const { label, value } = options
	const template: Map<string, string> = new Map([
		['start', '批量启用选中的站点后，站点将恢复正常访问'],
		['stop', '批量停用选中的站点后，站点将无法正常访问，用户访问会显示当前网站停用后的提示页'],
		['backSite', '批量备份选中的站点，可能耗费时间较长'],
	])
	const requestHandle = async (item: AnyObject, index: number) => {
		const requestList: Map<string, AnyFunction> = new Map([['backSite', backupSite]])
		const { id, name: username, project_config } = item
		const isAsync = project_config?.type === 'PHPMOD'
		const fn = requestList.get(value)
		switch (value) {
			case 'backSite':
				if (fn) {
					return fn({ s_id: id, bak_type: 3 })
				}
				break
		}
	}
	await batchConfirm({
		title: `批量${label}`,
		content: `${template.get(value) as string}，是否继续操作？`,
		column: [
			{
				label: '网站名',
				prop: 'rname',
			},
			useBatchStatus(),
		] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			isRefreshLocalList.value = true
			// 返回false则不关闭弹窗
			return false
		},
	})
}

export const onOpenSite = (row: any, active: string = 'domain') => {
	localRow.value = row
	siteInfo.value = row
	siteType.value = 'php'
	tabActiveConfig.value = active
	useDialog({
		title: `站点修改【${row.name}】 -- 添加时间【${row.addtime}】`,
		area: [84, 70],
		component: () => import('@/views/wordpress/view/local/site-config/index.vue'),
	})
}
