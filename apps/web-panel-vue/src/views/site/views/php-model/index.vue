<template>
	<div>
		<!-- 安装插件 -->
		<EnvDetectionMask ref="envRef" @init="refresh" />

		<!-- 错误遮罩 -->
		<BtErrorMask />

		<bt-table-group>
			<template #header-left>
				<BtOperation />
				<div class="flex items-center ml-1rem" @click="openNpsEvent">
					<i class="svgtofont-desired text-medium"></i>
					<span class="bt-link">需求反馈</span>
				</div>
			</template>
			<template #header-right>
				<BtTableCategory class="!w-[140px] mr-[10px]" />
				<BtRecommendSearch type="php" placeholder="请输入域名或备注" class="mr-[10px]" :class="`!w-[${searchWidth}px]`" />
				<BtRefresh class="mr-[10px]" />
				<BtColumn />
			</template>
			<template #content>
				<BtTable />
			</template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right>
				<BtPage />
			</template>
			<template #popup>
				<bt-dialog title="插件预览" v-model="pluginPopup" :area="66">
					<div class="p-[20px] pb-[24px]">
						<bt-product-introduce :data="productData"></bt-product-introduce>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script lang="tsx" setup>
import EnvDetectionMask from '@site/public/env-detection-mask/index.vue'
import { addSiteTypes, delSorted, modifySiteTypes, removeSiteType } from '@/api/site'
import BtSoftState from '@/components/extension/bt-soft-state/index.vue'
import { useTableCategory } from '@/hooks/business'
import { useAllTable, useBatch, useErrorMask, useOperation, useRecommendSearch, useRefreshList } from '@/hooks/tools'
import { useCheckbox, useOperate, usePath, usePs, useQuota, useStatus } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { getByteUnit, isUndefined } from '@/utils'
import { envRef, useEndtime, useSiteName, useSsl } from '@site/useController'
import { SITE_STORE } from '@site/useStore'
import {
	changeStatus,
	classList,
	openAddPhpSite,
	openBackupView,
	openDeleteSiteView,
	openSettingView,
	openSiteSafety,
	openTotalFlow,
	openPlugin,
	openVulnerabilityScan,
	phpAdvancedSettingsDialog,
	phpBatchOptions,
	recommendList,
	pluginPopup,
	productData,
	tableList,
	categoryRefs,
	getScanData,
	parseLocalStorageArray,
} from '@site/views/php-model/useController'
import { SITE_PHP_STORE } from '@site/views/php-model/useStore'
import { openNpsEvent } from '@site/useController'
import { ElButton, ElTooltip } from 'element-plus'

const { payment, mainHeight, plugin, enterpriseRec } = useGlobalStore()
const { authType } = toRefs(payment.value)
const { activeType, isRefreshList, searchWidth } = storeToRefs(SITE_STORE())
const { getClassList } = SITE_STORE()

const { pluginInfo, scanData } = storeToRefs(SITE_PHP_STORE())
const { getPhpList } = SITE_PHP_STORE()

watch(
	envRef,
	val => {
		if (val?.pluginInfo) pluginInfo.value = val.pluginInfo
	},
	{ immediate: true, deep: true }
)

const useCategory = useTableCategory({
	key: 'type',
	name: 'PHP分类',
	options: () => [{ label: '全部分类', value: 'all' }],
	event: {
		get: async () => {
			const { data } = await getClassList()
			classList.value = data
			return data
		},
		add: (params: any) => {
			return addSiteTypes(params, activeType.value)
		},
		update: (params: any) => {
			return modifySiteTypes(params, activeType.value)
		},
		delete: (params: any) => {
			return removeSiteType(params, activeType.value)
		},
	},
	ignore: ['0', '-2'],
	field: 'name',
})

/**
 * @description 批量操作
 */
const useTableBatch = useBatch(phpBatchOptions)

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '添加站点',
			active: true,
			onClick: openAddPhpSite,
		},
		{
			type: 'dropdown',
			label: '高级设置',
			onClick: phpAdvancedSettingsDialog,
			options: [
				{ label: '修改默认页面', onClick: phpAdvancedSettingsDialog },
				{ label: '默认站点', onClick: () => phpAdvancedSettingsDialog('defaultSite') },
				{ label: 'PHP命令行版本', onClick: () => phpAdvancedSettingsDialog('phpCommandLine') },
				{ label: 'HTTPS防窜站', onClick: () => phpAdvancedSettingsDialog('httpsOfficersSite') },
				{ label: 'TLS设置', onClick: () => phpAdvancedSettingsDialog('tlsSetting') },
				{ label: '全局设置', onClick: () => phpAdvancedSettingsDialog('globalSetting') },
				{ label: '关联数据库', onClick: () => phpAdvancedSettingsDialog('associatedDatabase') },
			],
		},
		...(enterpriseRec.value
			? [
					{
						type: 'custom',
						render: () => {
							return (
								<ElButton onClick={openVulnerabilityScan}>
									漏洞扫描
									<span class={`ml-4px py-1px px-4px text-center font-bold ${scanData.value?.loophole_num > 0 ? 'text-danger' : 'text-warning'}`}>{scanData.value?.loophole_num}</span>
								</ElButton>
							)
						},
					},
					{
						type: 'custom',
						render: () => {
							return (
								<ElButton onClick={openSiteSafety}>
									网站安全
									<span class={`ml-4px py-1px px-4px text-center font-bold ${scanData.value?.web_scaning_times > 0 ? 'text-danger' : 'text-warning'}`}>{scanData.value?.web_scaning_times}</span>
								</ElButton>
							)
						},
					},
			  ]
			: []),
		{
			type: 'custom',
			render: () => <BtSoftState class="ml-1rem" isRequest={false} pluginInfo={pluginInfo.value}></BtSoftState>,
		},
	],
})

/**
 * @description 渲染图标提示
 * @param label
 * @param tips
 * @param icon
 */
 const renderIconTip = (label: string, tips: string | (() => JSX.Element), icon?: string) => {
	return (
		<div>
			<span>{label}</span>
			<ElTooltip placement="top">
				{{
					default: () => <span class="ml-4x bt-ico-ask">{icon || '?'}</span>,
					content: () => <span>{tips()}</span>,
				}}
			</ElTooltip>
		</div>
	)
}
const { BtTable, BtPage, BtRefresh, BtTableCategory, BtRecommendSearch, BtColumn, BtBatch, BtErrorMask, refresh, categoryRef, config } = useAllTable({
	request: async data => {
		const { type, ...rest } = data
		const res = await getPhpList({
			type: isUndefined(type) || type === 'all' ? '-1' : type,
			...rest,
			table: 'sites',
			order: config.order || '',
		})
		const cacheColumn = parseLocalStorageArray('/site/php_column')
		res.data.forEach((item: any) => {
			item.isWaf = cacheColumn?.length ? cacheColumn[1].isCustom : true
		})
		tableList.value = res.data
		return res
	},
	sort: async ({ column, prop, order }: AnyObject) => {
		let name = prop
		if (!order) {
			name = ''
			await delSorted()
			config.order = ''
		} else {
			let orderParam = {
				orderName: name,
				orderStatus: order === 'ascending' ? 'asc' : 'desc',
			}
			config.order = `${orderParam.orderName} ${orderParam.orderStatus}`
		}
		refresh()
	},
	columns: [
		useCheckbox({ type: 'page', key: 'id' }),
		{
			subtitle: 'WAF图标',
			isCustom: true,
			isLtd: true,
			isHide: true,
			showClick: (val: any) => {
				config.data.forEach((item: any) => {
					item.isWaf = val
				})
			},
		},
		useSiteName({
			label: '网站名',
			type: activeType.value,
			openPlugin,
			onClick: openSettingView,
		}),
		useStatus({
			width: 80,
			sortable: 'custom',
			event: changeStatus,
			data: ['已停止', '运行中'],
		}),
		{
			label: '备份', // 用户名
			width: 65,
			isCustom: true,
			render: (row: any) => {
				return (
					<span onClick={() => openBackupView(row)} class={`${row.backup_count ? 'text-primary' : 'text-warning'} cursor-pointer`}>
						{row.backup_count ? `有(${row.backup_count})` : `无备份`}
					</span>
				)
			},
		},
		usePath({ prop: 'path', labelClassName: 'php-table-path', minWidth: 140 }),
		...(enterpriseRec.value
			? [
					{ ...useQuota({ event: (row: any) => openSettingView({ ...row, tabName: 'flowQuota' }, 'directory') }), isCustom: false },
					{
						label: '日流量', // 用户名
						renderHeader: () => renderIconTip('日流量', () => <span>日流量会适量占用服务器内存,可前往<span class="bt-link" onClick={() => phpAdvancedSettingsDialog("globalSetting")}>高级设置</span>关闭</span>),
						width: 80,
						isCustom: true,
						// isLtd: true,
						render: (row: any) => {
							// if (authType.value === 'free') {
							// 	return (
							// 		<span
							// 			class="cursor-pointer bt-link"
							// 			onClick={() => {
							// 				openTotalFlow(row)
							// 			}}>
							// 			查看
							// 		</span>
							// 	)
							// }
							// if (plugin.value.total) {
							// 	if (row?.net?.hasOwnProperty('one_day_total_flow')) {
									return getByteUnit(row?.net?.one_day_total_flow || 0, true, 2)
							// 	} else {
							// 		return '--'
							// 	}
							// } else {
							// 	return (
							// 		<span
							// 			class="cursor-pointer bt-link"
							// 			onClick={() => {
							// 				openTotalFlow(row)
							// 			}}>
							// 			查看
							// 		</span>
							// 	)
							// }
						},
					},
			  ]
			: []),
		useEndtime(),
		usePs({ table: 'sites', minWidth: 110, width: 'auto' }),
		{
			label: 'PHP', // 用户名
			isCustom: true,
			minWidth: 80,
			width: 80,
			render: (row: any) => {
				let isInstallPhp = !row.php_version_status
				return (
					<span class={'cursor-pointer ' + (isInstallPhp && row.php_version !== '静态' ? 'bt-warn' : 'bt-link')} onClick={() => openSettingView(row, 'php')}>
						{isInstallPhp && row.php_version !== '静态' ? row.php_version + '[未安装]' : row.php_version == '其它' ? '自定义' : row.php_version}
					</span>
				)
			},
		},
		useSsl({
			onClick: (row: any) => {
				openSettingView(row, 'ssl')
			},
		}),
		// {
		// 	label: '拨测告警', // 用户名
		// 	isCustom: false,
		// 	width: 78,
		// 	render: (row: any) => {
		// 		return h(
		// 			'span',
		// 			{
		// 				class: 'bt-link',
		// 				onClick: () => {
		// 					openSettingView({ ...row, otherName: 'siteAlarm' }, row?.project_config?.type === 'PHPMOD' ? 'otherSettings' : 'siteAlarm')
		// 				},
		// 			},
		// 			'设置'
		// 		)
		// 	},
		// },
		useOperate([
			{
				onClick: (row: any) => {
					openPlugin(row, 'monitor-setting')
				},
				title: '统计',
			},
			{
				onClick: (row: any) => {
					openPlugin(row, 'bt_waf')
				},
				title: 'WAF',
			},
			{ title: '设置', onClick: (row: any) => openSettingView(row) },
			{ title: '删除', onClick: (row: any) => openDeleteSiteView(row) },
		]),
	],
	extension: [
		useCategory,
		useTableBatch,
		useRefreshList(isRefreshList),
		useRecommendSearch('search', {
			name: 'sites',
			key: 'php',
			list: recommendList.value,
		}),
		useErrorMask(),
	],
	empty: () => {
		return (
			<span>
				您的列表为空，您可以
				<span class="bt-link" onClick={openAddPhpSite}>
					添加一个项目
				</span>
			</span>
		)
	},
})

onMounted(() => {
	nextTick(() => {
		categoryRefs.value = categoryRef()
		// 提前加载常用组件
		import('@site/views/php-model/add-site/add-default/index.vue')
		import('@site/views/php-model/setting/index.vue')
		if (enterpriseRec.value) getScanData()
	})
})
</script>
