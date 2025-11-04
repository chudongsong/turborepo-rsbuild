<template>
	<dnd-provider :backend="HTML5Backend">
		<div class="editor-content">
			<div class="editor-left">
				<editor-menu />
			</div>
			<div class="editor-center">
				<editor-viewer @column-drag="dragColumnToView" />
			</div>
			<div class="editor-right">
				<editor-config />
			</div>
		</div>
	</dnd-provider>
</template>

<script lang="tsx" setup>
import { DndProvider } from 'vue3-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { dragColumnToView, setEmailData, resetEmailData } from './controller'
import { emailTemplate, emailData, saveFn } from './store'

import EditorMenu from './components/EditorMenu/index.vue'
import EditorViewer from './components/EditorViewer/index.vue'
import EditorConfig from './components/EditorConfig/index.vue'

interface Props {
	save?: () => Promise<unknown>
}

const props = withDefaults(defineProps<Props>(), {})

if (props.save) {
	saveFn.value = props.save
}

// initTpl()

onBeforeUnmount(() => {
	resetEmailData()
})

defineExpose({
	setEmailData,
	getEmailData: () => emailData.value,
	getEmailHTML: () => emailTemplate.value,
})
</script>

<style lang="scss" scoped>
.editor-content {
	display: flex;
	width: 100%;
	height: 720px;
	border: 1px solid var(--el-color-border-dark);
}

.editor-left {
	width: 280px;
	min-width: 280px;
	height: 100%;
	background-color: var(--el-fill-color-lighter);
}

.editor-center {
	flex: 1;
	height: 100%;
	border-left: 1px solid var(--el-color-border-dark);
	border-right: 1px solid var(--el-color-border-dark);
}

.editor-right {
	width: 320px;
	min-width: 320px;
	height: 100%;
	background-color: var(--el-fill-color-lighter);
	overflow: hidden;
}
</style>
