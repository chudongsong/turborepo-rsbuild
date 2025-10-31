<template>
	<div class="p-2rem">
		<el-descriptions v-if="compData.appinfo" :column="1" border class="max-h-[46rem] overflow-auto table-descriptions">
			<el-descriptions-item v-for="(item, index) in compData.appinfo" :key="index">
				<template #label> {{ item.fieldTitle }} </template>
				{{ item.fieldValue }}
			</el-descriptions-item>
		</el-descriptions>
		<el-empty description="暂无数据" v-else></el-empty>
	</div>
</template>

<script setup lang="tsx">
interface Props {
	compData: { appinfo: any[] }
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		appinfo: [],
	}),
})
</script>

<style scoped>
:deep(.el-descriptions__content.el-descriptions__cell.is-bordered-content) {
	@apply text-small text-secondary;
}
:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
	@apply text-small text-tertiary bg-lighter;
}
</style>
