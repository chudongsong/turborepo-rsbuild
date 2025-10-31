<template>
	<div class="p-20px">
		<template v-if="compData.type === 'single'">
			<!-- 单文件重复冲突 -->
			<el-form ref="overlayFormRef" :model="overlayForm" :rules="quickRules">
				<el-form-item label="操作类型">
					<el-radio v-model="overlayForm.type" label="over" @change="watchType">覆盖文件</el-radio>
					<el-radio v-model="overlayForm.type" label="rename" @change="watchType">重命名文件</el-radio>
				</el-form-item>
				<el-form-item label="文件名" prop="filename">
					<bt-input v-model="overlayForm.filename" :disabled="overlayForm.type === 'over'" width="24rem" />
				</el-form-item>
				<el-form-item label="大小">
					<span>{{ overlayForm.is_dir ? '--' : getByteUnit(overlayForm.size) }}</span>
				</el-form-item>
				<el-form-item label="最后修改时间">
					{{ formatTime(Number(overlayForm.mtime)) }}
				</el-form-item>
			</el-form>
		</template>
		<template v-else>
			<!-- 多文件重复冲突 -->
			<div class="flex flex-col" v-if="compData.type === 'batch'">
				<div class="flex items-center">
					<i class="svgtofont-el-warning text-warning text-titleLarge mr-8px"></i>
					<span class="leading-8 text-base">以下目标文件名称与源文件相同，点击确定后勾选文件将跳过，<span class="text-danger"> 未勾选文件将会被覆盖，</span><span class="text-danger" v-if="isSiteRoot"> 当前目录为建站目录，</span> 请确认后继续</span>
				</div>

				<bt-table-group>
					<template #header-left> </template>
					<template #header-right> </template>
					<template #content>
						<bt-table @selection-change="handleSelectionChange" :column="tableColumns" :data="tableData" ref="overlayTableRef" :max-height="300" v-bt-loading="tableLoading" />
					</template>
					<template #footer-left></template>
					<template #footer-right> </template>
					<template #popup> </template>
				</bt-table-group>

				<div>
					<div class="flex items-center h-[4.8rem] mt-4 pl-[1.2rem] text-base bg-light">
						<span>计算结果：</span>
						<span class="mx-[1rem]">{{ calcData.addend1 }} + {{ calcData.addend2 }}</span>
						<span class="mr-[1rem]">=</span>
						<el-input-number v-model="calcData.sum" v-focus autofocus="true" controls-position="right" size="small" />
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="tsx">
import { formatTime, getByteUnit } from '@utils/index'
import { storeToRefs } from 'pinia'
import FILES_OVERLAY_TIPS_STORE from './store'

const store = FILES_OVERLAY_TIPS_STORE()
const { compData, fileTabActiveData, sitesPath, overlayFormRef, overlayForm, tableLoading, quickRules, calcData, tableColumns, tableData } = storeToRefs(store)
const { handleSelectionChange, watchType, onConfirm, init, $reset } = store

const isSiteRoot = computed(() => {
	return fileTabActiveData.value.param.path === sitesPath.value
})

onMounted(async () => {
	init()
})

onUnmounted(() => {
	$reset()
})

defineExpose({
	onConfirm
})
</script>
