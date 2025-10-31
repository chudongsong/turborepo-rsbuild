<template>
	<BtTableGroup>
		<template #header-right>
			<el-select v-model="actionType" class="!w-[12rem] mr-[1rem]" @change="refresh">
				<el-option label="全部" value="all"></el-option>
				<el-option label="上传" value="upload"></el-option>
				<el-option label="下载" value="download"></el-option>
				<el-option label="删除" value="delete"></el-option>
				<el-option label="重命名" value="rename"></el-option>
			</el-select>

			<BtSearch type="ftps" placeholder="请输入操作IP/文件/类型/时间" class="!w-[220px] mr-[10px]" />
			<BtRefresh />
		</template>
		<template #content><BtTable :max-height="400" /></template>
		<template #footer-right><BtPage /></template>
	</BtTableGroup>
</template>
<script lang="ts" setup>
import { useAllTable } from '@/hooks/tools'
import { getFtpActionLogs } from '@ftp/useController'
import { useFtpStore } from '@ftp/useStore'
import { useFtpLogStore } from './useStore'

const { actionType } = useFtpLogStore()
const { rowData } = useFtpStore()

/**
 * @description FTP操作日志表格
 */
const { BtSearch, BtRefresh, BtTable, BtPage, refresh } = useAllTable({
	request: data =>
		getFtpActionLogs({
			...data,
			user_name: rowData.value.name,
			type: actionType.value,
		}),
	columns: [
		{ width: 110, label: '用户名', render: () => rowData.value.name },
		{ label: '操作IP', prop: 'ip' },
		{ width: 220, label: '文件', prop: 'file' },
		{ width: 80, label: '操作类型', prop: 'type' },
		{ label: '操作时间', prop: 'time' },
	],
})
</script>
