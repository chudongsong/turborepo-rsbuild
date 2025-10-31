<template>
	<div :class="`confirm-default`" class="text-default relative p-2rem">
		<div class="content flex items-center mb-[10px]">
			<i class="svgtofont-el-warning text-titleLarge text-warning"></i>
			<div class="message flex flex-col flex-1 ml-4 py-[.3rem] leading-[2.4rem] text-base">
				<div class="text text-base text-secondary leading-[2.5rem]">检测到上传目录包含重复文件，是否覆盖？</div>
			</div>
		</div>
		<div class="">
			<bt-table :column="tableColumn" :data="props.compData.data" :max-height="170" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { getByteUnit } from '@utils/index'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const tableColumn = ref([
	{ label: '文件名', prop: 'name' },
	{
		label: '文件差异(本地->线上)',
		render: (row: any) => `${getByteUnit(row.locaSize)} -> ${getByteUnit(row.size)}`,
	},
])

/**
 * @description 确认
 */
const onConfirm = (close: () => void) => {
	props.compData.confirm(close, true)
	return false
}
/**
 * @description 取消
 */
const onCancel = (close: () => void) => {
	props.compData.cancel(close, false)
	return false
}

defineExpose({
	onConfirm,
	onCancel,
})
</script>

<style lang="css" scoped>
.svgtofont-el-warning {
	color: var(--el-color-warning);
}

.confirm {
	color: var(--el-color-text-primary);
}

.confirm-calc .text {
	color: var(--bt-color-danger);
}

.confirm-calc .vcode {
	background-color: var(--el-fill-color);
	color: var(--el-color-text-primary);
}

.confirm-calc .el-input-number--small {
	width: 10rem;
}

:deep(.el-input__inner) {
	padding-left: 1rem;
	padding-right: 4rem;
}
</style>
