<template>
	<div v-bt-loading="tableLoading" class="relative h-full">
		<div v-if="run" class="h-[68rem] overflow-auto">
			<template v-if="pid">
				<div class="flex items-center">
					<span class="mr-[1.6rem] font-bold text-base">进程</span>
					<el-select v-model="pid" @change="handleChangeEvent" class="!w-[14rem]">
						<el-option v-for="item in pidList" :key="item" :label="item" :value="item"></el-option>
					</el-select>
				</div>
				<span class="text-secondary mt-[1.6rem] mb-[.8rem] block font-bold text-base">基础信息</span>
				<el-descriptions class="mt-[20px] table-descriptions" :column="3" border>
					<el-descriptions-item v-for="(item, index) in describeData" :key="index" :label-class-name="['!bg-[#fff]']">
						<template #label>
							<span class="text-secondary text-small font-bold">{{ item.label }}</span>
						</template>
						<div class="text-small">{{ computedDes(item) }}</div>
					</el-descriptions-item>
				</el-descriptions>
				<span class="text-secondary mt-[1.6rem] mb-[.8rem] block font-bold text-base">网络</span>
				<bt-table :max-height="160" :column="netColumns" :data="netData" />
				<span class="text-secondary mt-[1.6rem] mb-[.8rem] block font-bold text-base">打开的文件列表</span>
				<bt-table :height="210" :column="tableColumns" :data="tableData" />
			</template>
			<div v-else class="bg-light flex items-center justify-center h-full" style="min-height: 600px">
				<div class="bg-lighter px-[48px] py-[16px] text-default flex">监听PID失败，请检查项目状态是否开启</div>
			</div>
		</div>
		<div class="bg-light flex items-center justify-center h-full" style="min-height: 600px" v-else>
			<div class="bg-lighter px-[48px] py-[16px] text-default flex">
				请开启
				<span class="mx-[.4rem] bt-link" @click="jumpTabEvent('state')">项目状态</span> 后查看负载状态
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { SITE_STORE } from '@site/useStore'
import { tableLoading, run, pid, pidList, netData, tableData, describeData, tableColumns, netColumns, computedDes, handleChangeEvent, initLoad } from './useController'

const { siteInfo, siteType } = storeToRefs(SITE_STORE())
const { jumpTabEvent } = SITE_STORE()

watch(
	() => siteInfo.value,
	val => {
		run.value = siteType.value === 'java' ? (siteInfo.value?.pid !== null ? true : false) : siteInfo.value?.run
	},
	{ immediate: true }
)

onMounted(initLoad)

defineExpose({
	init: initLoad,
})
</script>

<style lang="css" scoped>
.el-descriptions__table {
	display: inline-block;
}

:deep(.el-descriptions__label) {
	max-width: 100px !important;
}

:deep(.el-descriptions__content) {
	max-width: 360px !important;
}
:deep(.el-table) {
	border-bottom: 1px solid var(--el-border-color-lighter) !important;
}
</style>
