<template>
	<div class="p-2rem">
		<div class="w-[56rem]">
			<div class="text-extraLarge font-bold flex items-center justify-center">
				<i class="!text-titleLarge mr-[12px]" :class="{ 'text-dangerDark svgtofont-el-circle-close-filled': progressData.status === 3, 'text-primary svgtofont-el-success-filled': progressData.status === 2 }"></i>
				宝塔面板迁移{{ progressData.status === 2 ? '成功' : '失败' }}
			</div>

			<div v-if="progressData.status === 2" class="text-base text-secondary my-[1.2rem] flex flex-col justify-center items-center">
				<span> 备份数据已上传至新服务器，还原任务已在新服务器运行 </span>
				<span> 进度请在新服务器中的【面板设置】-【备份还原】中查看 </span>
			</div>

			<!-- 备份成功 -->
			<div class="flex flex-col leading-[22px]">
				<!-- <span class="text-primary font-bold text-base mb-[2rem]">上一次迁移详情-成功</span> -->
				<pre class="text-small text-white bg-darkPrimary p-[12px] flex flex-col relative" v-if="successData.panel_addr">
					<span>目标服务器信息：{{ successData.panel_addr }}</span>
					<span>目标服务器登陆账号：{{ successData.panel_user }}</span>
					<span>目标服务器登陆密码：{{ successData.panel_password }}</span>
					<i class="svgtofont-el-document-copy text-white !text-base  cursor-pointer absolute right-[12px] top-[8px]" @click="copyTextEvent"></i>
				</pre>
			</div>

			<el-descriptions :title="false" :column="1" size="small" border class="my-[1.2rem] table-descriptions">
				<div>
					<!-- <el-descriptions-item label="目标服务器信息：">{{ successData.panel_addr }}</el-descriptions-item>
						<el-descriptions-item label="目标服务器登陆账号：">{{ successData.panel_user }}</el-descriptions-item>
						<el-descriptions-item label="目标服务器登陆密码：">{{ successData.panel_password }}</el-descriptions-item> -->
					<!-- <el-descriptions-item label="文件大小：">{{ getByteUnit(Number(successData.files_size)) }}</el-descriptions-item> -->
					<!-- <el-descriptions-item label="耗时：">{{ successData.total_time }}s</el-descriptions-item> -->
					<el-descriptions-item label="开始时间：">{{ successData.start_time }}</el-descriptions-item>
					<el-descriptions-item label="最后更新时间："> {{ successData.last_update }} </el-descriptions-item>
				</div>
			</el-descriptions>
			<bt-help
				v-if="progressData.status === 2"
				class="ml-[20px] my-[20px]"
				:options="[
					{ content: '如需还原宝塔防火墙/监控报表/系统架构/防篡改插件，请尽快登录面板绑定宝塔用户及升级为专业版/企业版，否则将无法还原相关插件数据' },
					{ content: '如果迁移了节点管理数据，请在节点面板中添加新机器的IP白名单' },
					{ content: '如第一次还原数据不完整，可尝试第二次进行还原' },
				]"></bt-help>

			<!-- 备份失败-->
			<div class="flex flex-col" v-if="progressData.status === 3">
				<bt-table :column="progressColumn" :data="errorData"></bt-table>
				<div class="flex justify-end mt-[1.2rem]">
					<el-button type="danger" @click="retry()">重试</el-button>
				</div>
			</div>

			<div class="w-full flex justify-end">
				<span class="bt-link mt-[0.8rem]" @click="closeResultDialog">我已记录信息，关闭弹窗</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useDataHandle } from '@/hooks/tools'
import { progressData, successData, errorData, progressColumn, retryMigrate, cancelMigrate } from './useController'
import { copyText } from '@utils/index'
import { stopMigrateTask } from '@/api/config'

const emit = defineEmits(['close'])

const copyTextEvent = () => {
	let str = `目标服务器信息：${successData.value.panel_addr}\n目标服务器登陆账号：${successData.value.panel_user}\n目标服务器登陆密码：${successData.value.panel_password}`
	copyText({ value: str })
}

const closeResultDialog = async () => {
	// 发送取消迁移请求
	await useDataHandle({
		loading: '正在记录信息，请稍后...',
		request: stopMigrateTask(),
		// message: true,
	})
	emit('close')
}

const retry = () => {
	retryMigrate()
	emit('close')
}
</script>

<style lang="css" scoped>
:deep(.el-descriptions__body .el-descriptions__label) {
	min-width: 90px !important;
	width: 160px;
}
</style>
