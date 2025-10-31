<template>
	<div class="p-2rem">
		<BtTable :max-height="400"></BtTable>

		<!-- 日志 -->
		<bt-dialog v-model="logDialog" :area="54" :title="`【${rowData.migrate_ip}】迁移日志`">
			<div class="p-[2rem]">
				<bt-log :content="logContent" :isHtml="true" :full-screen="{ title: '全屏查看服务日志', onRefresh: () => getLogs(true) }" class="h-41rem"></bt-log>
			</div>
		</bt-dialog>

		<!-- 详情信息 -->
		<bt-dialog v-model="infoDialog" :area="48" title="详情信息">
			<div class="p-[2rem]">
				<el-descriptions :title="false" :column="1" size="small" border class="table-descriptions">
					<el-descriptions-item :label="`名称：`">{{ infoData.name }}</el-descriptions-item>
					<el-descriptions-item :label="`服务器：`">{{ infoData.panel_info?.panel_url || '--' }}</el-descriptions-item>
					<el-descriptions-item :label="`用户：`">{{ infoData.panel_info?.username || '--' }}</el-descriptions-item>
					<el-descriptions-item :label="`密码：`">{{ infoData.panel_info?.password || '--' }}</el-descriptions-item>
					<el-descriptions-item :label="`开始时间：`">{{ infoData.start_time }}</el-descriptions-item>
					<el-descriptions-item :label="`最后更新时间：`">{{ infoData.last_update }}</el-descriptions-item>
				</el-descriptions>
				<div class="flex justify-end mt-[1rem]">
					<el-button type="default" @click="copyInfo">复制服务器信息</el-button>
				</div>
				<bt-help :options="[{ content: `迁移进度请在新服务器中的[面板设置] - [备份还原]中查看` }]" class="mt-[1rem]" />
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import { getMigrateHistoryApi, getMigrateInfoApi, getMigrateLogApi, delMigrateHistoryApi } from '@/api/config'
import { Message, useAllTable, useDataHandle, useConfirm } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { formatTime, copyText } from '@/utils'

// 日志弹窗
const logDialog = ref(false)

// 日志内容
const logContent = ref('')

// 详情信息
const infoDialog = ref(false)

// 详情信息内容
const infoData = ref<any>({})

const rowData = ref<any>({})

/**
 * @description 获取迁移日志
 */
const getLogs = async (isRefresh?: boolean) => {
	const res: any = await useDataHandle({
		loading: '正在获取迁移日志，请稍后...',
		request: getMigrateLogApi({ timestamp: rowData.value.timestamp }),
	})
	logContent.value = res.data.data
	if (isRefresh) {
		Message.success('日志刷新成功')
	}
}

/**
 * @description 获取迁移历史
 */
const getMigrateHistory = async () => {
	const res: any = await useDataHandle({
		loading: '正在获取迁移历史，请稍后...',
		request: getMigrateHistoryApi(),
	})
	return {
		data: res.data,
		total: res.data.length,
	}
}

const getInfo = async () => {
	const { data: res }: any = await useDataHandle({
		loading: '正在获取迁移详情，请稍后...',
		request: getMigrateInfoApi({ timestamp: rowData.value.timestamp }),
	})
	infoData.value.name = res.data.task_info.task_name
	infoData.value.ip = res.data.server_ip
	infoData.value.user = res.data.ssh_user
	infoData.value.pass = res.data.password
	infoData.value.start_time = res.data.start_time
	infoData.value.last_update = res.data.last_update

	// 服务器信息
	infoData.value.panel_info = res.data.task_info.panel_info
}

/**
 * @description 删除迁移历史
 */
const delRow = async () => {
	
	await useConfirm({
			title: '删除迁移历史',
			content: '是否删除迁移历史？',
			type: 'calc',
		})
		await useDataHandle({
			loading: '正在删除迁移历史，请稍后...',
			request: delMigrateHistoryApi({ timestamp: rowData.value.timestamp }),
			message: true,
		})
		refresh()
}

/**
 * @description 复制服务器信息
 */
const copyInfo = () => {
	copyText({
		value: `目标服务器信息：${infoData.value.panel_info.panel_url}\n登录账号：${infoData.value.panel_info.username}\n登录密码：${infoData.value.panel_info.password}`,
	})
}

const { BtTable, refresh } = useAllTable({
	request: getMigrateHistory,
	columns: [
		{
			label: '迁移时间',
			render: (row: any) => {
				return <span>{formatTime(row.timestamp)}</span>
			},
		},
		{
			label: '服务器IP',
			prop: 'migrate_ip',
		},
		useOperate([
			{
				title: '日志',
				onClick: (row: any) => {
					logDialog.value = true
					rowData.value = row
					getLogs()
				},
			},
			{
				title: '信息',
				onClick: (row: any) => {
					infoDialog.value = true
					rowData.value = row
					getInfo()
				},
			},
			{
				title: '删除',
				onClick: (row: any) => {
					rowData.value = row
					delRow()
				},
			},
		]),
	],
})
</script>

<style lang="css" scoped>
:deep(.el-descriptions__body .el-descriptions__label) {
	min-width: 90px !important;
	width: 100px;
}
</style>
