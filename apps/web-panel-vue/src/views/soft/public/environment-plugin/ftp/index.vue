<!--  -->
<template>
	<bt-tabs v-model="activeName" type="left-bg-card" position="left" class="h-full" @change="handleTabClick">
		<el-tab-pane label="服务" name="service" :lazy="true">
			<div>
				<ServiceStatus></ServiceStatus>
				<bt-divider direction="horizontal" />
				<span> 当前FTP地址为： </span>
				<span class="cursor-pointer" title="点击复制FTP路径" @click="copyText({ value: `ftp://${serverIp || 'IP地址'}:${ftpPort || '端口'}` })"> ftp://{{ serverIp || 'IP地址' }}:{{ ftpPort || '端口' }} </span>
				<bt-divider />
				<span class="bt-link">
					<a target="_self" href="https://download.bt.cn/win/filezilla/FileZilla-setup.exe"> 下载FTP连接工具(FileZilla, 免费开源) </a>
				</span>
				<!-- 状态停止告警 -->
				<StopAlert></StopAlert>
			</div>
		</el-tab-pane>
		<el-tab-pane label="用户管理" name="manger" :lazy="true">
			<bt-table-group>
				<template #header-left>
					<BtOperation />
				</template>
				<template #header-right>
					<!-- 分类设置 -->
					<BtTableCategory class="!w-[140px] mr-[10px]" />

					<!-- 搜索框 -->
					<BtSearch class="!w-[20rem] mr-[10px]" placeholder="请输入用户名" />

					<!-- 刷新按钮 -->
					<BtRefresh class="mr-[10px]" />

					<!-- 列显示 -->
					<BtColumn />
				</template>
				<template #content>
					<BtTable :max-height="420" />
				</template>
				<template #footer-left>
					<BtBatch />
				</template>
				<template #footer-right>
					<BtPage />
				</template>
			</bt-table-group>
		</el-tab-pane>
		<el-tab-pane label="端口配置" name="portConfig" :lazy="true">
			<el-form ref="portFormRef" :model="portForm" :rules="rules" label-width="80px" class="-ml-2rem">
				<el-form-item label="默认端口">
					<bt-input type="number" v-model="portForm.port" placeholder="请输入端口" width="14rem" />
				</el-form-item>
				<el-form-item label=" ">
					<el-button type="primary" @click="onPortConfirm">保存</el-button>
				</el-form-item>
			</el-form>
		</el-tab-pane>
		<el-tab-pane label="配置文件" name="config" :lazy="true">
			<div v-bt-loading="textLoading">
				<span class="my-[4px] text-secondary"> 提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换 </span>
				<div class="my-[10px]">
					<bt-editor class="!h-[40rem] !w-full" v-model="staticContent" id="configContent" @save="saveFileEvent" />
				</div>
				<el-button type="primary" @click="saveFileEvent">保存</el-button>
				<bt-help :options="helpList" class="mt-1rem"></bt-help>
			</div>
		</el-tab-pane>
		<!-- <el-tab-pane label="版本切换" name="version">
        <div class="flex text-secondary items-center">
          <span>选择版本</span>
          <el-select class="mx-[12px] !w-16rem" v-model="currentVersion">
            <el-option
              v-for="(item, index) in versionList"
              :key="index"
              :label="'Pure-Ftpd ' + item.m_version"
              :value="`${item.m_version + '.' + item.version}`"></el-option>
          </el-select>
          <el-button type="primary" @click="cutVersionEvent">切换</el-button>
        </div>
      </el-tab-pane> -->
		<el-tab-pane label="日志管理" name="logs" :lazy="true">
			<div>
				<div class="flex items-center mb-[20px]">
					<span class="mr-[8px]">日志管理开关</span>
					<el-switch v-model="logsStatus" @change="handleChangeSwitch"></el-switch>
				</div>
				<ul class="leading-8 text-small list-disc ml-[20px]">
					<li>开启后，将记录所有FTP用户的登录、操作记录</li>
				</ul>
			</div>
		</el-tab-pane>
	</bt-tabs>
</template>

<script setup lang="tsx">
import { copyText } from '@utils/dom'
import ServiceStatus from '@soft/public/environment-plugin/public/service-status/index.vue'
import StopAlert from '@soft/public/environment-plugin/public/status-stop-alert/index.vue'
import { changeFtpStatus, deleteFtpUser, getClassList, getFtpList, getFtpStatus, getPwdTime, setBatchClass, useBatchEventHandle } from '@ftp/useController'
import { useCheckbox, useLink, useOperate, usePassword, usePath, usePs, useQuota, useStatus } from '@/hooks/tools/table/column'
import { formatTime } from '@/utils'
import { addFtpClass, deleteFtpClass, editFtpClass } from '@/api/ftp'
import { useTableCategory } from '@/hooks/business'
import { useAllTable, useBatch, useDialog, useOperation, useRefreshList } from '@/hooks/tools'
import { FTP_STORE, useFtpStore } from '@/views/ftp/useStore'
import {
	activeName,
	portFormRef,
	portForm,
	rules,
	helpList,
	editFtpEvent,
	openQuickConnectEvent,
	openPawValidityEvent,
	setQuotaEvent,
	openAccessEvent,
	openLogEvent,
	handleChangeSwitch,
	saveFileEvent,
	onPortConfirm,
	handleTabClick,
	init,
	textLoading,
	staticContent,
	logsStatus,
	isRefreshList,
} from './useController'
import { useGlobalStore } from '@/store/global'
import SOFT_SERVICE_STATUS_STORE from '../public/service-status/store'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const { serverIp } = useGlobalStore()
const { rowData, ftpPort, isRefreshFtpList, pluginInfo } = useFtpStore()
const { compData } = storeToRefs(SOFT_SERVICE_STATUS_STORE())
const classList = ref<any>([])

const useCategory = useTableCategory({
	key: 'type_id',
	name: 'FTP分类',
	options: () => [{ label: '全部分类', value: 'all' }],
	event: {
		get: async () => {
			const data = await getClassList()
			classList.value = data
			return data
		},
		add: addFtpClass,
		update: editFtpClass,
		delete: deleteFtpClass,
	},
})

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '添加FTP',
			active: true,
			onClick: () => editFtpEvent(),
		},
	],
})

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	{ label: '启用FTP', value: 'start', event: useBatchEventHandle },
	{ label: '停用FTP', value: 'stop', event: useBatchEventHandle },
	{
		label: '改密FTP',
		value: 'exitPaw',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
			rowData.value = { selectedList, clearSelection }
			await useDialog({
				title: '批量修改FTP密码',
				area: 'auto',
				btn: true,
				compData: { selectedList, clearSelection },
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
const { BtTable, BtPage, BtSearch, BtRefresh, BtColumn, BtBatch, BtTableCategory, refresh } = useAllTable({
	request: (data: any) => {
		if (activeName.value !== 'manger') return Promise.resolve({ data: [], total: 0 })
		if (data.type_id === 'all') data.type_id = ''
		return getFtpList(data)
	},
	columns: [
		useCheckbox(),
		{ label: '用户名', prop: 'name', minWidth: 100 },
		usePassword(),
		useStatus({ event: changeFtpStatus, data: ['已停用', '已启用'], width: 80 }),
		useLink({
			label: '快速连接', // 描述
			width: 80,
			isCustom: false,
			title: '复制快速连接信息',
			text: '点击查看',
			event: openQuickConnectEvent,
		}),
		usePath(),
		{
			label: '密码有效期',
			minWidth: 100,
			isCustom: false,
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
		useQuota({ isCustom: false, event: setQuotaEvent }),
		usePs({ table: 'ftps', width: 100 }),
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
	],
})

watch(
	() => isRefreshList.value,
	val => {
		if (val) refresh()
	}
)

watch(
	() => isRefreshFtpList.value,
	val => {
		refresh()
	},
	{ immediate: true, deep: true }
)

onMounted(() => {
	if (props.compData) pluginInfo.value = props.compData
	init(pluginInfo.value)
	activeName.value = 'service'
	compData.value.refreshEvent = getFtpStatus
})
</script>
