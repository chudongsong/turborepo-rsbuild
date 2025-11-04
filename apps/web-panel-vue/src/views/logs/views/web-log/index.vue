<template>
	<div>
		<div class="flex items-center mb-[20px]">
			<!-- 选择网站 -->
			网站：
			<bt-select v-model="selectedWebSite" :options="siteList" @change="judgeLogType(webTabActive)" placeholder="请选择网站" class="!w-[22rem]" filterable></bt-select>
			<div v-if="webTabActive === 'WebLogs'">
				<el-button class="!ml-12px" @click="openLogSystem"> 日志服务系统 </el-button>
			</div>
			<div class="bg-dark w-[1px] h-2rem mx-8"></div>
			<div class="flex items-center">
				<span>Web日志：</span>
				<span @click="openPathEvent({ path: logPath })" class="bt-link">
					{{ logPath || '--' }}
					<slot></slot>
				</span>
				<span class="mx-[0.4rem]">{{ logSize }}</span>
			</div>
			<el-button @click="getClearWebLogs(true)">清空</el-button>
			<div class="flex items-center ml-[16px]" @click="desiredNpsDialog()">
				<i class="svgtofont-desired text-medium"></i>
				<span class="bt-link">需求反馈</span>
			</div>
		</div>

		<!-- 菜单主体 -->
		<bt-tabs type="card" v-model="webTabActive" :options="tabComponent" />
	</div>
</template>

<script lang="ts" setup>
import { useDialog } from '@/hooks/tools/dialog'
import { LOG_STORE } from '@/views/logs/useStore'
import { storeToRefs } from 'pinia'
import { getSiteList, judgeLogType, renderWebLog, siteList, tabComponent } from './useController'
import { openPathEvent } from '@hooks/tools/table/event'
import { Message, useDataHandle, useConfirm } from '@hooks/tools'
import { desiredNpsDialog } from '@logs/useController'
import { clearWebLogs, getSiteLogInfo } from '@/api/firewall'

const { selectedWebSite, webTabActive } = storeToRefs(LOG_STORE())

const logSize = ref('') // 日志大小
const logPath = ref('') // 日志路径
/**
 * @description 打开日志服务系统
 */
const openLogSystem = () => {
	useDialog({
		title: '日志服务系统',
		area: 60,
		component: () => import('@logs/views/web-log/log-system/index.vue'),
	})
}

/**
 * @description: 获取日志信息
 */
 const getLogInfo = async () => {
	await useDataHandle({
		// loading: '正在获取日志信息，请稍后...',
		request: getSiteLogInfo(),
		data: { size: [String, logSize], log_path: [String, logPath] },
	})
}
/**
 * @description: 清空web日志
 */
 const getClearWebLogs = async (isConfirm?: boolean) => {
	isConfirm &&
		(await useConfirm({
			icon: 'question-filled',
			type: 'calc',
			title: '清空Web日志',
			content: '清空Web日志后，网站访问数据将彻底删除，此操作不可逆，是否继续操作？',
		}))

	await useDataHandle({
		loading: '正在清空Web日志，请稍后...',
		request: clearWebLogs(),
		data: [String, logSize],
	})
	Message.success('清空Web日志成功')
}
onMounted(async () => {
	await getSiteList()
	getLogInfo()
	if (webTabActive.value === 'WebLogs') renderWebLog()
})
</script>

<style lang="css" scoped>
:deep(.el-select-dropdown .el-select-dropdown__item span) {
	@apply w-[100px] truncate;
}
</style>
