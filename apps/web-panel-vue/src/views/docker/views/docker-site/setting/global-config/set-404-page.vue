<!--  -->
<template>
	<div class="flex flex-col">
		<div class="flex items-center justify-between mb-[8px]">
			<div>
				<el-checkbox v-model="isError" @change="setErrorEvent">开启404错误页设置</el-checkbox>
			</div>
			提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换
			<el-select class="!w-[16rem]" v-model="codeType" @change="saveFileBodyEvent">
				<el-option v-for="item in codeOption" :key="item" :value="item" :label="item"></el-option>
			</el-select>
		</div>
		<!-- 编辑器 -->
		<div class="h-[44rem] w-full" v-bt-loading="loading">
			<bt-editor ref="aceEditor" :is-request="false" v-model="editorContent" :editorOption="getAceConfig()" :saveEvent="saveFileBodyEvent" class="h-[40rem] w-full"></bt-editor>
			<el-button class="flex !mt-[12px]" type="primary" @click="saveFileBodyEvent">保存</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getAceConfig } from '@docker/views/docker-site/useController'
import { setErrorEvent, getEditorContent, save404File } from './useController'

// tab菜单
const editorContent = ref('')

// 编辑器ref
const aceEditor = ref<any>()
const codeType = ref('utf-8')
const codeOption = ref(['utf-8', 'GBK', 'GB2312', 'BIG5'])
const isError = ref(false)
const loading = ref(false) // 加载中

/**
 * @description 保存文件
 * @param encoding 文件编码 默认utf-8
 */
const saveFileBodyEvent = async () => {
	save404File(editorContent.value, codeType.value)
}

onMounted(() => {
	getEditorContent(loading, editorContent, codeType, isError)
})

defineExpose({
	onRefresh: () => {
		getEditorContent(loading, editorContent, codeType, isError)
	},
})
</script>
