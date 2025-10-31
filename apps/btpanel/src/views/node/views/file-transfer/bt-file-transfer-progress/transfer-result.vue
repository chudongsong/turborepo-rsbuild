<template>
	<div class="flex p-[2rem] flex-col">
		<div class="flex items-center mb-[16px]">
			<i :class="`!text-titleLarge text-primary svgtofont-el-circle-check-filled`"></i>
			<div class="pl-[4px] text-medium leading-8 ml-[4px]">
				{{ `传输任务已完成,` }}
				<span class="text-primary">{{ compData.success }}</span>
				{{ `个成功,` }}
				<span class="text-dangerDark">{{ compData.fail }}</span>
				{{ `个失败` }}
			</div>
		</div>
		<bt-table ref="batchTable" :column="column" :data="compData.sendList.value" :max-height="300" />
	</div>
</template>

<script lang="ts" setup>
interface Props {
	compData: {
		success: number
		fail: number
		sendList: Ref<any[]>
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		success: 0,
		fail: 0,
		sendList: ref<any[]>([]),
	}),
})
const column = [
	{
		label: '目标路径',
		prop: 'target_path',
		minWidth: 200,
		showOverflowTooltip: true,
	},
	{
		label: '状态',
		prop: 'status',
		fixed: 'right',
		align: 'right',
		render: (row: any) => {
			return h(
				'span',
				{
					class: row.status === 'complete' ? 'text-primary' : 'text-dangerDark',
				},
				row.status === 'complete' ? '成功' : '失败'
			)
		},
	},
]
</script>
