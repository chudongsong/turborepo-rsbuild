<template>
	<div class="p-[2rem] pt-[1rem]">
		<div class="flex items-center mb-[0.8rem]">
			<!-- <el-icon class="!text-primary !text-titleLarge"><SuccessFilled /></el-icon> -->
			<span class="!text-primary !text-titleLarge svgtofont-el-circle-check-filled"></span>
			<span class="text-base ml-[1.2rem]">
				<template v-if="compData.autoTitle">
					{{ compData?.autoTitle }}
				</template>
				<template v-else> 批量{{ resultTitle }}完成！共{{ compData.resultData.length }}项，成功{{ successCount }}项，失败{{ failCount }}项。 </template>
			</span>
		</div>
		<bt-table :column="resultColumn" :data="compData.resultData || []" max-height="360"></bt-table>
	</div>
</template>

<script setup lang="tsx">
import type { TableColumnProps } from '@/components/data/bt-table/types.d'
interface Props {
	compData: {
		resultData: AnyObject[]
		resultColumn?: TableColumnProps[]
		resultTitle?: string
		autoTitle?: string // 自定义标题
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {
		return {
			resultData: [],
		}
	},
})
const resultColumn = ref<any[]>([
	{
		label: '名称',
		prop: 'name',
	},
	{
		label: '结果',
		align: 'right',
		render: (row: unknown) => {
			const data = row as { status: boolean; msg: string }
			return <span class={`${data.status ? 'text-primary' : 'text-danger'}`} innerHTML={data.status ? data?.msg || '操作成功' : data?.msg || '操作失败'}></span>
		},
	},
]) // 表格列
const resultTitle = ref('操作') // 表格标题

const successCount = computed(() => {
	return props.compData?.resultData?.filter(item => item.status).length || 0
})

const failCount = computed(() => {
	return props.compData?.resultData?.filter(item => !item.status).length || 0
})

watchEffect(() => {
	if (props.compData?.resultColumn) {
		resultColumn.value = props.compData.resultColumn
	}
	if (props.compData?.resultTitle) resultTitle.value = props.compData.resultTitle
})
</script>
