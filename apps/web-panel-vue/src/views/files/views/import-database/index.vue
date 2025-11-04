<template>
	<div class="flex flex-col p-16px lib-box">
		<el-form ref="quickFormRef" size="small" :model="quickForm" :rules="quickRules" :disabled="disable" class="relative w-full" label-position="right" @submit.native.prevent>
			<el-form-item prop="name" label="数据库名">
				<bt-select v-model="quickForm.name" :options="databaseOptions" class="!w-[22rem]" @change="toggleName"></bt-select>
			</el-form-item>
		</el-form>
	</div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_IMPORT_DATABASE_STORE from './store'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const store = FILES_IMPORT_DATABASE_STORE()
const { quickFormRef, quickForm, quickRules, disable, databaseOptions } = storeToRefs(store)
const { toggleName, getOptions, $reset } = store

onMounted(() => {
	getOptions()
})

onUnmounted(() => {
	$reset()
})
</script>
<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[9rem] text-default;
}

/* .el-form-item */
.el-form-item {
	@apply mb-[1.4rem];
}

/* .check */
.check :deep(.el-form-item__content) {
	@apply leading-[1.4];
}

:deep(.el-form .el-form-item--small.el-form-item + .el-form-item) {
	margin-top: 1.5rem !important;
}
</style>
