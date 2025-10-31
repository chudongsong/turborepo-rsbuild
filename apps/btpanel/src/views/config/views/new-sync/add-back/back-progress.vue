<template>
	<div class="p-2rem pt-0">
		<p class="mt-1.2rem my-2rem font-bold text-base" :class="{ 'text-dangerDark': progressData.status === 3 }">{{ progressData.status === 1 ? `${desc}进度条` : `${progressData.status === 3 ? '失败' : '成功'}详情` }}</p>
		<!-- 备份中 -->
		<!-- {{ progressData.status }} -->
		<div class="flex-col flex" v-if="[0, 1, 4, 5].includes(progressData.status)">
			<!-- 备份名称（文件名）]正在导入，大约剩余30分钟 -->
			<span class="text-base">{{ progressData.msg }}</span>
			<div class="mb-1.2rem mt-[0.4rem] flex items-center">
				<el-progress class="w-full" :text-inside="true" :stroke-width="20" :percentage="progressData.progress" status="success" />
				<i class="svgtofont-el-circle-close text-dangerDark !text-large pl-4px cursor-pointer" @click="cancelEvent"></i>
			</div>
			<bt-log class="h-22rem !rounded-none" :content="progressLog"> </bt-log>
		</div>

		<!-- 备份成功 -->
		<div class="flex flex-col pl-8px leading-[22px] pb-2rem" v-if="progressData.status === 2 || progressData.status === 3">
			<el-descriptions :title="false" :column="1" size="small" border class="table-descriptions">
				<el-descriptions-item :label="`${desc}名称：`">{{ successData.name }}</el-descriptions-item>
				<el-descriptions-item :label="`${desc}时间：`">{{ successData.end_time }}</el-descriptions-item>
				<el-descriptions-item :label="`${desc}大小：`">{{ successData.files_size }}</el-descriptions-item>
				<el-descriptions-item :label="`backup_file_sha256`"
					><span class="w-[28rem] truncate inline-block">{{ successData.backup_file_sha256 }}</span></el-descriptions-item
				>
				<el-descriptions-item label="耗时"> {{ Number(successData.time_count).toFixed(2) }} 秒 </el-descriptions-item>
				<el-descriptions-item label="状态："> 成功</el-descriptions-item>
			</el-descriptions>
		</div>

		<!-- 备份失败-->
		<div class="flex flex-col pl-8px" v-if="progressData.status === 3">
			<bt-table :column="progressColumn" :data="errorData"></bt-table>
			<span class="mt-8px" v-if="isRestore">提示：还原失败项已经自动恢复到还原前</span>
			<div class="flex justify-end mt-[1.2rem]">
				<el-button type="danger" @click="restartRequest">重试</el-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { progressDialog, progressLog, progressData, successData, progressColumn, errorData, isRestore, getProgressLog, cancelEvent } from './useMethod'
import { restartRequest } from './useMethod'

const desc = ref(isRestore.value ? '还原' : '备份')

const props = defineProps({
	compData: {
		type: Object,
		default: () => ({}),
	},
})

onMounted(() => {
	progressData.status = 1
	progressData.msg = '即将开始' + desc.value
	progressData.progress = 0
	progressData.time = 0
	progressLog.value = '正在获取' + desc.value + '日志'
	getProgressLog(props.compData?.type)
})

onUnmounted(() => {
	progressDialog.value = null
})
</script>

<style lang="css" scoped>
:deep(.el-descriptions__body .el-descriptions__label) {
	min-width: 90px !important;
	width: 100px;
}
</style>
