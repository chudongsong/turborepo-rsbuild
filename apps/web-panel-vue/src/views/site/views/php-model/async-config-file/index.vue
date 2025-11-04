<template>
	<div v-bt-loading="isLoading">
		<bt-tabs type="card" v-model="defaultActive" :options="tabComponent" @change="tabClickEvent" />
		<div class="flex items-center justify-between my-[4px]">
			<span class="text-secondary">提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换</span>
			<span v-if="currentTab?.label === '伪静态配置文件'" class="flex items-center"
				>规则转换工具：
				<bt-link href="https://www.bt.cn/Tools" target="_blank">Apache转Nginx <i class="svgtofont-el-link"></i></bt-link>
			</span>
		</div>
		<!-- nginx apache opensite..需要测试 -->
		<div class="my-[12px]">
			<bt-editor v-bt-loading="textLoading" class="!h-[40rem] rounded-base" v-model="content" id="configContent" :request="false" @save="saveDataEvent" />
		</div>
		<el-button type="primary" @click="saveDataEvent()">保存</el-button>
		<bt-help :options="helpList" class="ml-2rem"></bt-help>
	</div>
</template>

<script setup lang="tsx">
import { SITE_STORE, useSiteStore } from '@site/useStore'
import { getConfigFile } from '@/api/site'
import { useMessage, useDataHandle } from '@/hooks/tools'

const Message = useMessage() // 消息提示

const { siteInfo } = useSiteStore()
const { getFileEvent, saveFileEvent } = SITE_STORE()

const isLoading = ref<boolean>(false) // 加载状态
const textLoading = ref<boolean>(false) // 加载状态
const defaultActive = ref<string>('') // 菜单默认展开项
const tabComponent = ref<any>([]) // tab组件
const content = ref<string>('') // 文件内容

const helpList = [
	{
		content: '此处为站点主配置文件,若您不了解配置规则,请勿随意修改.',
	},
] // 帮助列表

/**
 * @description 获取当前tab
 */
const currentTab = computed(() => {
	return tabComponent.value.find((item: any) => item.type === defaultActive.value)
})

/**
 * @description 获取tab配置
 */
const getConfigTab = () => {
	useDataHandle({
		loading: isLoading,
		request: getConfigFile({ sitename: siteInfo.value.name }),
		success: (res: any) => {
			tabComponent.value = []
			Object.keys(res.data).forEach((key: string) => {
				tabComponent.value.push({
					label: key,
					lazy: true,
					name: res.data[key],
					render: () => <span></span>,
				})
			})
			defaultActive.value = tabComponent.value[0].name
			getConfigData()
		},
	})
}

/**
 * @description 保存数据
 */
const saveDataEvent = async () => {
	const res: any = await saveFileEvent({
		path: defaultActive.value,
		data: content.value,
		encoding: 'utf-8',
	})
	Message.msg({
		dangerouslyUseHTMLString: true,
		message: res.msg,
		type: res.status ? 'success' : 'error',
		duration: res.status ? 2000 : 0,
	})
	if (res.status) getConfigData()
}

/**
 * @description 获取内容
 * @param path
 */
const getConfigData = async (path: string = defaultActive.value) => {
	textLoading.value = true
	const res: any = await getFileEvent({ path })
	content.value = res.data.data
	textLoading.value = false
}

const tabClickEvent = (name: any) => {
	defaultActive.value = name
	getConfigData()
}

onMounted(() => getConfigTab())
</script>
