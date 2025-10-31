<!--  -->
<template>
	<div>
		<span class="my-[4px] text-secondary">提示：Ctrl+F 搜索关键字，Ctrl+H 查找替换</span>
		<bt-editor v-bt-loading="textLoading" class="!h-[54rem] my-[12px]" v-model="configContent" id="runContent" :request="false" @save="saveData" />
		<div>
			<el-button type="primary" @click="saveData">保存</el-button>
		</div>
		<bt-help :options="helpList" list-style="none" class="ml-[20px] mt-[20px]"></bt-help>
	</div>
</template>

<script setup lang="ts">
import { useMessage } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'
import { getConfFile, saveConfFile } from '@api/site'
import { useSiteStore } from '@site/useStore'

const { siteInfo } = useSiteStore()

const Message = useMessage() // 消息提示

const textLoading = ref(false) // 文本加载
const configContent = ref('') // 静态内容\
const tomcateVersion = ref('') // tomcat版本
const helpList = ref([
	{
		content: '此处为运行配置文件,若您不了解配置规则,请勿随意修改.',
	},
]) // 帮助列表

/**
 * @description 保存内容
 */
const saveData = async () => {
	const params = {
		data: JSON.stringify({
			name: siteInfo.value.name,
			data: configContent.value,
		}),
	}
	const res: AnyObject = await useDataHandle({
		loading: '正在保存内容，请稍候...',
		request: saveConfFile(params),
		data: {
			msg: String,
			status: Boolean,
		},
	})
	Message.msg({
		dangerouslyUseHTMLString: true,
		message: res.msg,
		type: res.status ? 'success' : 'error',
		duration: res.status ? 2000 : 0,
		showClose: !res.status,
	}) // 提示错误信息
	if (res.status) getConfigData()
}

/**
 * @description 获取伪静态列表
 * @param path
 */
const getConfigData = async () => {
	const params = {
		data: JSON.stringify({ name: siteInfo.value.name }),
	}
	useDataHandle({
		loading: textLoading,
		request: getConfFile(params),
		data: {
			data: [String, configContent],
		},
	})
}

onMounted(() => {
	getConfigData()
})
</script>
