<template>
	<div class="flex p-[2rem] flex-col">
		<div class="flex items-center mb-[8px]">
			<i :class="`!text-titleLarge text-warning svgtofont-el-warning-filled`"></i>
			<div class="pl-[4px] text-medium leading-8 ml-[4px]">
				{{`是否要将节点【${compData.sourceNode.remarks}】的以下文件/文件夹传输到节点【${compData.targetNode.remarks}】【${ compData.targetPath }】的中？`}}
			</div>
		</div>
		<div class="ml-[5rem] mb-[1.6rem]">
			<div>当遇到重复文件时，请选择处理方式</div>
			<el-radio-group v-model="mode">
				<el-radio label="ignore">跳过</el-radio>
				<el-radio label="cover">覆盖</el-radio>
			</el-radio-group>
		</div>
		<bt-table ref="batchTable" :column="column" :data="compData.sourcePathList.value" :max-height="300" />
	</div>
</template>

<script lang="ts" setup>
interface Props {
	compData: {
		sourceNode: any
		targetNode: any
		sourcePathList: Ref<any[]>
		targetPath: string
		complete: (mode: string) => void
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		sourceNode: {},
		targetNode: {},
		sourcePathList: ref<any[]>([]),
		targetPath: '',
		complete: () => {},
	}),
})
const mode = ref('ignore')
const column = [
		{
			label: '文件/文件夹名称',
			prop: 'fileName',
			minWidth: 200,
			showOverflowTooltip: true,
		},]

const onConfirm = (): boolean => {
	props.compData.complete(mode.value)
	return true
}

defineExpose({
	onConfirm,
})
</script>
