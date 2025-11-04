<!--  -->
<template>
	<div class="flex flex-col">
		<bt-tabs type="card" v-model="tabActive" @change="handleClickTab">
			<el-tab-pane label="新建网站默认页面" name="/www/server/panel/data/defaultDoc.html"></el-tab-pane>
			<el-tab-pane label="404错误页" name="/www/server/panel/data/404.html" :lazy="true"></el-tab-pane>
			<el-tab-pane label="网站不存在页" :name="'/www/server/' + webServerType + '/' + (webServerType === 'nginx' ? 'html' : 'htdocs') + '/index.html'" :lazy="true"></el-tab-pane>
			<el-tab-pane label="网站停用后的提示页" name="/www/server/stop/index.html" :lazy="true"></el-tab-pane>
		</bt-tabs>

		<div class="flex items-center justify-between mb-[8px]">
			<div v-if="tabActive === '/www/server/panel/data/404.html'">
				<el-checkbox v-model="isError" @change="setErrorEvent">开启404错误页设置</el-checkbox>
			</div>
			提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换
			<el-select class="!w-[16rem]" v-model="codeType" @change="saveFileBodyEvent">
				<el-option v-for="item in codeOption" :key="item" :value="item" :label="item"></el-option>
			</el-select>
		</div>
		<!-- 编辑器 -->
		<div class="h-[44rem] w-full" v-bt-loading="loading">
			<bt-editor ref="aceEditor" :file-path="tabActive" v-model="editorContent" @save="saveFileBodyEvent" class="h-[40rem] w-full"></bt-editor>
			<el-button class="flex !mt-[12px]" type="primary" @click="saveFileBodyEvent">保存</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useDataHandle } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { getErrorConfig, getFileBody, setErrorConfig } from '@api/site'
import { getAceConfig } from '@site/useController'

import { SITE_STORE } from '@site/useStore'

const { saveFileEvent } = SITE_STORE()

const Message = useMessage() // 消息提示

const { plugin } = useGlobalStore()

const { webserver: webServerType } = plugin.value

// tab菜单
const tabActive = ref('/www/server/panel/data/defaultDoc.html')
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
		const { data } = await getFileBody({ path: tabActive.value })
		editorContent.value = data.data
		codeType.value = data.encoding || 'utf-8'
		loading.value = false
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description tab切换
 */
const handleClickTab = async (name: string) => {
	try {
		loading.value = true
		tabActive.value = name
		await getEditorContent()
		if (name === '/www/server/panel/data/404.html') {
			getErrorConfigData()
		}
		// codeType.value = 'utf-8'
		loading.value = false
	} catch (error) {
		console.log(error)
	} finally {
		loading.value = false
	}
}

/**
 * @description 获取404错误页配置
 */
const getErrorConfigData = async () => {
	const { status } = await useDataHandle({
		request: getErrorConfig(),
		data: {
			status: String,
		},
	})
	isError.value = Boolean(Number(status))
}

/**
 * @description 设置404错误页
 */
const setErrorEvent = (status: boolean) => {
	useDataHandle({
		loading: '正在设置，请稍后...',
		request: setErrorConfig({ status: status ? 1 : 0 }),
		message: true,
	})
}

/**
 * @description 保存文件
 * @param encoding 文件编码 默认utf-8
 */
const saveFileBodyEvent = async () => {
	const res = await saveFileEvent({
		path: tabActive.value,
		data: editorContent.value,
		encoding: codeType.value,
	})
	Message.request(res)
}

// onMounted(getEditorContent)

defineExpose({
	onRefresh: () => {
		tabActive.value = '/www/server/panel/data/defaultDoc.html'
		getEditorContent()
	},
})
</script>
