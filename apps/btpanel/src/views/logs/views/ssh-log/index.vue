<template>
	<div>
		<BtTableGroup v-if="payment.authType == 'ltd'">
			<!-- 表格主体内容 -->
			<template #header-left>
				<div class="flex items-center">
					<el-button type="primary" @click="openBannedDialog(true)">一键封禁爆破IP</el-button>
					<el-button @click="openOutLogView">导出日志</el-button>
					<el-button @click="clearCache">清理登录日志</el-button>
					<span class="mx-[8px]">定时封禁</span>
					<el-switch v-model="bannedStatus" @change="onChangeBanJob"></el-switch>
					<div class="flex items-center ml-[16px]" @click="desiredNpsDialog()">
						<i class="svgtofont-desired text-medium"></i>
						<span class="bt-link">需求反馈</span>
					</div>
				</div>
			</template>
			<template #header-right>
				<bt-radio type="button" v-model="actionType" :options="actionTypeOptions" @change="cutType" class="mr-[1rem] !flex-nowrap" />
				<bt-radio type="button" v-model="historyType" :options="historyTypeOptions" @change="cutType" class="mr-[1rem] !flex-nowrap" />
				<BtSearch class="mr-[1rem] !w-[28rem]" placeholder="请输入登录ip/用户名" />
				<BtRefresh />
			</template>
			<template #content>
				<BtTable />
			</template>
			<template #footer-right>
				<BtPage />
			</template>
			<template #popup>
				<bt-dialog v-model="bannedDialog" :title="`${allBanned ? '一键' : '自动'}封禁爆破IP`" showFooter :area="46" @confirm="confirmBannedData" @cancel="cancelBannedData">
					<div class="p-[2rem]">
						<el-form :model="antiBannedForm" ref="blastFormRef" :rules="rules">
							<el-form-item :label="allBanned ? '周期' : '定时'" prop="hour">
								<bt-input type="number" v-model="antiBannedForm.hour" width="24rem">
									<template #append>小时</template>
								</bt-input>
							</el-form-item>

							<el-form-item label="失败次数" prop="fail_count">
								<bt-input type="number" v-model="antiBannedForm.fail_count" width="24rem">
									<template #append>次</template>
								</bt-input>
							</el-form-item>

							<el-form-item label="封禁时间" prop="ban_hour">
								<bt-input type="number" v-model="antiBannedForm.ban_hour" width="24rem">
									<template #append>小时</template>
								</bt-input>
							</el-form-item>
						</el-form>
						<ul class="mt-8px leading-8 text-small list-disc ml-20px">
							<li v-if="allBanned">说明：{{ antiBannedForm.hour || '--' }}小时前到现在失败次数超过{{ antiBannedForm.fail_count || '--' }}次的IP，封禁{{ antiBannedForm.ban_hour || '--' }}小时</li>
							<li v-if="!allBanned">说明：{{ antiBannedForm.hour || '--' }}小时运行一次，封禁{{ antiBannedForm.hour || '--' }}小时内，失败次数超过{{ antiBannedForm.fail_count || '--' }}次的IP，封禁{{ antiBannedForm.ban_hour || '--' }}小时</li>
							<li>封禁IP可在安全-IP规则中查看</li>
						</ul>
					</div>
				</bt-dialog>

				<bt-dialog v-model="showLogDialog" width="50rem" title="任务日志" :area="54">
					<div class="flex flex-col bg-[#111] text-white leading-[2.2rem] h-[30rem] overflow-y-auto p-[1rem]" v-html="logContent"></div>
				</bt-dialog>
			</template>
		</BtTableGroup>
		<!-- 当非企业版时显示付费引导 -->
		<BtProductPreview v-else :data="productData" class="px-[20%] my-[8rem]"></BtProductPreview>
	</div>
</template>
<script lang="tsx" setup>
import { useGlobalStore } from '@/store/global'
import { storeToRefs } from 'pinia'
import { desiredNpsDialog } from '@logs/useController'
import type { SSHLogItem } from '../../type'

import { useAllTable, useRefreshList } from '@/hooks/tools'
import {
	actionType,
	actionTypeOptions,
	onHandleIp,
	openOutLogView,
	productData,
	openBannedDialog,
	bannedStatus,
	onChangeBanJob,
	blastFormRef,
	antiBannedForm,
	rules,
	allBanned,
	confirmBannedData,
	cancelBannedData,
	showLogDialog,
	logContent,
	bannedDialog,
	clearCache,
	historyType,
	historyTypeOptions,
	getSSHInfoData,
} from './useController'
import { LOG_SSH_STORE } from './useStore'

const { payment, mainHeight } = useGlobalStore()
const store = LOG_SSH_STORE()
const { isRefreshList } = storeToRefs(store)
const { getLogs } = store

const cutType = () => {
	param.value.p = 1
	refresh()
}

const { BtTable, BtPage, BtRefresh, BtSearch, refresh, param } = useAllTable({
	request: (data: any) => getLogs({ ...data, select: actionType.value, historyType: historyType.value }),
	columns: [
		{
			label: 'IP地址:端口',
			render: (row: SSHLogItem) => {
				return (
					<div class={row.deny_status ? 'line-through text-disabled' : ''}>
						<span onClick={() => onHandleIp(row)} class={`cursor-pointer ${row.deny_status ? '' : 'text-primary hover:text-primaryDark'}`}>
							{row.address}
						</span>
						{':' + row.port}
					</div>
				)
			},
		},
		{ label: '归属地', prop: 'area.info' },
		{ label: '用户', prop: 'user' },
		{
			label: '状态',
			prop: 'status',
			render: function (row: SSHLogItem) {
				if (row.status) return <span class="text-primary">登录成功</span>
				return <span class="text-danger">登录失败</span>
			},
		},
		{ label: '操作时间', prop: 'time', align: 'right' },
	],
	extension: [useRefreshList(isRefreshList)],
})

onMounted(() => {
	getSSHInfoData()
})
</script>
