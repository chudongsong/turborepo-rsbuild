<!--  -->
<template>
	<div class="flex flex-col">
		<bt-tabs type="card" v-model="tabActive" @change="handleClickTab">
			<el-tab-pane label="新建网站默认页面" name="index"></el-tab-pane>
			<el-tab-pane label="404错误页" name="404" :lazy="true"></el-tab-pane>
			<el-tab-pane label="网站不存在页" name="not_found" :lazy="true"></el-tab-pane>
			<el-tab-pane label="网站停用后的提示页" name="stop" :lazy="true"></el-tab-pane>
		</bt-tabs>
		<el-popover placement="top" width="320" popper-class="white-popover" trigger="hover" content="创建网站时会使用页面模板，不会影响已经存在的网站">
			<template #reference>
				<i class="absolute right-[2rem] top-[2.4rem] svgtofont-el-question-filled text-warning !text-medium"></i>
			</template>
		</el-popover>

		<div class="flex items-center justify-between mb-[8px]">
			<div v-if="tabActive === '404'">
				<el-checkbox v-model="isError" @change="setErrorEvent">创建网站时自动创建404.html页面</el-checkbox>
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
import { useDataHandle } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { getDefaultViewConfig, setDefaultViewConfig, set404ViewStatus } from '@api/docker'
import { getAceConfig } from '@docker/views/docker-site/useController'

const Message = useMessage() // 消息提示

// tab菜单
const tabActive = ref<'index' | '404' | 'not_found' | 'stop'>('index')
const editorContent = ref('')

// 编辑器ref
const aceEditor = ref<any>()
const codeType = ref('utf-8')
const codeOption = ref(['utf-8', 'GBK', 'GB2312', 'BIG5'])
const isError = ref(false)
const loading = ref(false) // 加载中

/**
 * @description 获取编辑器内容
 */
const getEditorContent = async () => {
	try {
		loading.value = true
		const { data } = await getDefaultViewConfig({ default_type: tabActive.value })
		editorContent.value = data.data[tabActive.value].data
		codeType.value = data.data[tabActive.value].encoding || 'utf-8'
		if (tabActive.value === '404') {
			// getErrorConfigData()
			isError.value = Boolean(data.data.auto_create_404)
		}
		loading.value = false
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description tab切换
 */
const handleClickTab = async (name: 'index' | '404' | 'not_found' | 'stop') => {
	loading.value = true
	tabActive.value = name
	await getEditorContent()
	// codeType.value = 'utf-8'
	loading.value = false
}

/**
 * @description 设置404错误页
 */
const setErrorEvent = (status: boolean) => {
	useDataHandle({
		loading: '正在设置，请稍后...',
		request: set404ViewStatus({ auto_create: status ? '1' : '0' }),
		message: true,
	})
}

/**
 * @description 保存文件
 * @param encoding 文件编码 默认utf-8
 */
const saveFileBodyEvent = async () => {
	const res = await setDefaultViewConfig({
		default_type: tabActive.value,
		default_body: editorContent.value,
		encoding: codeType.value,
	})
	Message.request(res)
}

onMounted(() => {
	getEditorContent()
})

defineExpose({
	onRefresh: () => {
		tabActive.value = 'index'
		getEditorContent()
	},
})
</script>
