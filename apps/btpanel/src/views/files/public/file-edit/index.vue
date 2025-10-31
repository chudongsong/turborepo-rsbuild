<template>
	<div class="flex flex-col p-16px lib-box">
		<div class="max-h-[50rem] h-[50rem]" v-bt-loading="load" v-bt-loading:title="'正在保存，请稍候...'">
			<bt-editor v-model="cmdForm.data" :autoSave="false" :editorOption="config" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_EDIT_STORE from './store'

interface Props {
	compData?: any
}

const emit = defineEmits(['close'])

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const store = FILES_EDIT_STORE()
const { load, cmdForm } = storeToRefs(store)
const { config, init } = store

onMounted(() => {
	init()
})
</script>

<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[7rem] text-default;
}

:deep(.el-form .el-form-item--small.el-form-item + .el-form-item) {
	@apply mb-[1.5rem];
	margin-top: 1.5rem !important;
}

:deep(#two .el-form-item__label) {
	@apply min-w-0;
}

#two {
	@apply mb-[0rem];
	margin-top: 0 !important;
}
</style>
