<template>
	<!-- 安装插件 -->
	<BtSoftInstallMask />
	<!-- 错误遮罩 -->
	<BtErrorMask />
	<BtAlert class="!mb-[12px]" :closable="false" type="info" show-icon>
		<template #title>
			<span>当前FTP地址为：</span>
			<span class="cursor-pointer" title="点击复制FTP路径" @click="copyText({ value: `ftp://${serverIp}:${ftpPort}` })"> ftp://{{ serverIp || 'IP地址' }}:{{ ftpPort || '端口' }} </span>
			<BtDivider />
			<BtLink target="_blank" class="bt-link" href="https://download.bt.cn/win/filezilla/FileZilla-setup.exe"> 下载FTP连接工具(FileZilla, 免费开源) </BtLink>
		</template>
	</BtAlert>
	<BtTableGroup>
		<template #header-left>
			<BtOperation />
			<!-- <BtSoftStateBtn class="ml-[1rem] !w-[6rem]" :plugin-name="'pure-ftpd'" :is-request="false" :pluginInfo="pluginInfo"></BtSoftStateBtn> -->
			<!-- <BtSoftState :isRequest="false" :pluginInfo="pluginInfo"></BtSoftState -->
		</template>
		<template #header-right>
			<BtTableCategory class="!w-[140px] mr-[10px]" />
			<BtRecommendSearch type="ftps" placeholder="请输入FTP用户/备注" class="!w-[270px] mr-[10px]" />
			<BtRefresh class="mr-[10px]" />
			<BtColumn />
		</template>
		<template #content><BtTable :min-height="mainHeight" /></template>
		<template #footer-left>
			<BtBatch />
		</template>
		<template #footer-right><BtPage /></template>
	</BtTableGroup>
</template>

<script setup lang="tsx">
import type { FtpTableRowProps } from '@/types/ftp'

import { useFtpStore } from '@ftp/useStore'
import { useGlobalStore } from '@/store/global'
import { copyText, formatTime } from '@/utils'
import { addFtpClass, deleteFtpClass, editFtpClass } from '@/api/ftp'
import { useSoftInstallMask, useTableCategory } from '@/hooks/business'
import { Message, useDialog, useOperation } from '@/hooks/tools'
import { useCheckbox, useLink, useOperate, usePassword, usePath, usePs, useQuota, useStatus } from '@/hooks/tools/table/column'
import { useAllTable, useBatch, useErrorMask, useRecommendSearch, useRefreshList } from '@/hooks/tools/table/index'
import { changeFtpStatus, deleteFtpUser, getClassList, getFtpList, getFtpStatus, getPwdTime, isSearchClick, openLogEvent, setBatchClass, useBatchEventHandle } from '@ftp/useController'
import { useFtpAddStore } from './add-ftp/useStore'
import { productPaymentDialog } from '@/public'
import BtSoftState from '@/components/extension/bt-soft-state/index.vue'

const { serverIp, mainHeight, payment } = useGlobalStore()
const { ftpPort, rowData, pluginInfo, isRefreshFtpList } = useFtpStore()

const { isEdit } = useFtpAddStore()

/**
 * @description 添加 修改FTP用户
 * @param {FtpTableRowProps} row 数据
 */
const editFtpEvent = (row?: FtpTableRowProps) => {
	rowData.value = row
	isEdit.value = !!row
	return useDialog({
		title: `${row ? `修改FTP用户【${row.name}】` : '添加FTP用户'}`,
		area: 50,
		btn: `${row ? '保存' : '确认'}`,
		compData: row ? row : {},
		component: () => import('@ftp/views/add-ftp/index.vue'),
	})
}

/**
 * @description 打开密码有效期
 */
const openPawValidityEvent = (row: FtpTableRowProps) => {
	useDialog({
		title: '设置密码有效期',
		area: 46,
		btn: true,
		compData: row,
		component: () => import('@ftp/views/pwd-validity-period/index.vue'),
	})
}

/**
 * @description 设置FTP配额
 * @param {FtpTableRowProps} row 当前行信息
 * @returns {void} void
 */
const setQuotaEvent = (row: FtpTableRowProps, isSearch: boolean = false): void => {
	if (payment.value.authType !== 'ltd') {
		// 弹出支付界面
		productPaymentDialog({
			sourceId: isSearch ? 260 : 52,
		})
		return
	}
	openCapacityEvent(row)
}

/**
 * @description 打开容量事件
 */
const openCapacityEvent = (row: FtpTableRowProps) => {
	rowData.value = row
	useDialog({
		title: `【${row.name}】FTP配额容量`,
		area: 50,
		btn: true,
		compData: row,
		// onConfirm: saveCapacity,
		component: () => import('@ftp/views/capacity/index.vue'),
	})
}

/**
 * @description 修改FTP端口
 */
const editFtpPortEvent = () => {
	useDialog({
		title: '修改FTP端口',
		area: 40,
		btn: true, // 显示按钮
		component: () => import('@ftp/views/edit-port/index.vue'),
		// onConfirm: editPortEvent,
	})
}

/**
 * @description 打开日志分析工具
 */
const openLogsAnalysisEvent = (status: boolean = true) => {
	isSearchClick.value = status
	useDialog({
		title: 'FTP日志扫描工具',
		area: [70, 52],
		component: () => import('@ftp/views/logs-analysis/index.vue'),
	})
}

const useCategory = useTableCategory({
	key: 'type_id',
	name: 'FTP分类',
	options: () => [{ label: '全部分类', value: 'all' }],
	event: {
		get: getClassList,
		add: addFtpClass,
		update: editFtpClass,
		delete: deleteFtpClass,
	},
})

const list = [
	{
		name: '容量限制',
		callback: () => {
			if (config.data.length === 0) return Message.error('暂无FTP用户，请先添加FTP用户')
			setQuotaEvent(config.data[0], true)
		},
	},
	{ name: 'FTP日志分析', callback: openLogsAnalysisEvent },
]

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '添加FTP',
			active: true,
			onClick: () => editFtpEvent(),
		},
		{ type: 'button', label: '修改FTP端口', onClick: editFtpPortEvent },
		{ type: 'button', label: 'FTP日志分析', onClick: () => openLogsAnalysisEvent(false) },
		{ type: 'divider' },
		{
			type: 'custom',
			render: () => <BtSoftState class="ml-1rem" isRequest={false} pluginInfo={pluginInfo.value}></BtSoftState>,
		},
	],
})

/**
 * @description 修改FTP权限配置
 * @param {FtpTableRowProps} row 数据
 */
const openAccessEvent = (row: FtpTableRowProps) => {
	rowData.value = row
	useDialog({
		title: `修改FTP权限配置-[${row.name}]`,
		area: 72,
		btn: '保存',
		compData: row,
		component: () => import('@ftp/views/access/index.vue'),
	})
}

/**
 * @description 打开快速链接
 */
const openQuickConnectEvent = (row: FtpTableRowProps) => {
	rowData.value = row
	useDialog({
		title: '快速连接',
		area: 48,
		compData: row,
		component: () => import('@ftp/views/quick-connect/index.vue'),
	})
}

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	{ label: '启用FTP', value: 'start', event: useBatchEventHandle },
	{ label: '停用FTP', value: 'stop', event: useBatchEventHandle },
	{
		label: '改密FTP',
		value: 'exitPaw',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection, config) => {
			rowData.value = { selectedList, clearSelection, config }
			await useDialog({
				title: '批量修改FTP密码',
				area: 'auto',
				btn: true,
				compData: { selectedList, clearSelection, config },
				component: () => import('@ftp/views/batch-edit-paw/index.vue'),
			})
		},
	},
	{
		label: '设置分类',
		value: 'setClass',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection, config) => {
			setBatchClass(selectedList, clearSelection, classList, config)
		},
	},
	{ label: '删除FTP', value: 'delete', event: useBatchEventHandle },
])

/**
 * @description 错误遮罩
 */
const { BtTable, BtPage, BtRecommendSearch, BtRefresh, BtColumn, BtBatch, BtTableCategory, BtErrorMask, tableRef, classList, refresh, config } = useAllTable({
	request: (data: any) => {
		if (data.type_id === 'all') data.type_id = ''
		return getFtpList(data)
	},
	columns: [
		useCheckbox({ type: 'page', key: 'id' }),
		{ label: '用户名', prop: 'name', minWidth: 120 },
		usePassword({ width: 160 }),
		useStatus({ event: changeFtpStatus, data: ['已停用', '已启用'] }),
		useLink({
			label: '快速连接', // 描述
			width: 80,
			title: '复制快速连接信息',
			text: '点击查看',
			event: openQuickConnectEvent,
		}),
		usePath(),
		{
			label: '密码有效期',
			isCustom: true,
			width: 120,
			title: '设置密码有效期',
			prop: 'end_time',
			render: (row: any) => {
				let { isOrange, isEnd } = getPwdTime(row)
				return (
					<span
						onClick={() => {
							rowData.value = row
							openPawValidityEvent(row)
						}}
						title={'设置密码有效期'}
						style={`color:#${isEnd ? 'ef0808' : isOrange ? 'f0ad4e' : '20a53a'};cursor:pointer`}>
						{row.end_time !== '0' ? formatTime(Number(row.end_time), 'yyyy-MM-dd') : '永久'}
					</span>
				)
			},
		},
		useQuota({ event: setQuotaEvent, width: 100 }),
		usePs({ table: 'ftps', width: 'auto' }),
		useOperate([
			{ onClick: openAccessEvent, title: '配置' },
			{ onClick: editFtpEvent, title: '修改' },
			{ onClick: openLogEvent, title: '日志' },
			{ onClick: deleteFtpUser, title: '删除' },
		]),
	],
	extension: [
		useCategory, // 分类
		useTableBatch, // 批量操作
		useRefreshList(isRefreshFtpList), // 刷新列表
		useRecommendSearch('search', { name: 'ftps', list }), // 搜索
		useErrorMask(), // 错误遮罩
	],
})

const { BtSoftInstallMask, checkInstallRequest } = useSoftInstallMask({
	request: getFtpStatus,
	name: 'Pure-FTPd',
	extension: [],
})

onMounted(checkInstallRequest)
</script>
