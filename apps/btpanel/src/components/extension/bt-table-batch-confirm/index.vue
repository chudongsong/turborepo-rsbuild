<template>
	<div class="flex p-[2rem] flex-col">
		<div class="flex items-center mb-[16px]">
			<i :class="`!text-titleLarge ${iconClass}`"></i>
			<div class="pl-[4px] text-medium leading-8 ml-[4px]" v-html="popupContent" />
		</div>
		<span v-if="compData.tablePageSelect" class="text-danger mb-12px !text-base ml-4.8rem">当前已选中多项数据(共{{ compData.tableTotal - compData.tablePageExclude.length }}项)，请仔细确认后进行操作！</span>
		<bt-table v-if="!compData.tablePageSelect" ref="batchTable" :column="compData.column" :data="compData.data.value" :max-height="300" />
		<!-- <bt-table v-if="compData.tablePageSelect && batchExecutionStatus == 0" ref="exTable" :column="[{ label: '未选中数据', prop: 'name' }]" :data="compData.tablePageExclude" :max-height="300"></bt-table> -->
	</div>
</template>

<script lang="ts" setup>
import { BatchCompleteProps, BatchExecuteProps } from './types.d'

interface Props {
	compData: BatchCompleteProps | BatchExecuteProps
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		type: 'execute',
		title: '',
		content: '',
		tablePageSelect: false,
		tablePageExclude: [],
		tableTotal: 0,
		data: ref([]),
		column: [],
		batch: () => ({}),
		complete: () => ({}),
	}),
})

const popupSetFooter = inject('popupSetFooter', () => undefined) // 设置弹窗底部

const batchExecutionStatus = ref(0) // 批量操作状态 0:初始页面 1:进度中 2:完成

const { batch, content, type } = unref(props.compData)

// 计算属性来确定是否显示进度条
const batchSchedule = batch()

// 计算属性来确定图标的CSS类
const iconClass = computed(() => {
	// switch (batchExecutionStatus.value) {
	// 	case 0:
	// 		return 'text-warning svgtofont-el-warning-filled'
	// 	case 1:
	// 		return `svgtofont-el-loading animation-spin`
	// 	case 2:
	// 		return 'text-primary svgtofont-el-success-filled'
	// }
	// return ''
	return batchExecutionStatus.value < 2 ? 'text-warning svgtofont-el-warning-filled' : 'text-primary svgtofont-el-success-filled'
})

const popupContent = computed(() => {
	switch (batchExecutionStatus.value) {
		case 0:
			return props.compData.content
		case 1:
			if (!batchSchedule?.all) return `正在${props.compData.title}中，请稍后...`
			return `正在${props.compData.title}中，处理进度：${batchSchedule?.current}/${batchSchedule?.all}`
		default:
			return `<span class="flex mb-[.4rem]">已完成${props.compData.title}操作，共${batchSchedule?.all}个任务。</span><span>成功${batchSchedule?.success}个，失败${batchSchedule?.error}个。</span>`
	}
})

watch(batchSchedule, val => {
	if (val.current === val.all) {
		batchExecutionStatus.value = 2 // 完成
		props.compData.complete() // 完成回调
	}
})

const onConfirm = (): boolean => {
	popupSetFooter() // 关闭弹窗底部
	batchExecutionStatus.value = 1 // 进度中
	return true
}

onMounted(() => {
	if (type && type.value === 'complete') onConfirm()
})

defineExpose({
	onConfirm,
})
</script>
