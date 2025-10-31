<template>
	<div>
		<bt-tabs type="card" v-model="defaultActive" :options="tabComponent" @change="tabClickEvent" />
		<div class="h-full">
			<el-button type="primary" @click="getLogContent(true)">刷新日志</el-button>
			<div class="mt-1rem">
				<bt-editor v-bt-loading="textLoading" class="!h-[40rem] !w-full" v-model="content" id="configContent" :request="false" :isScrollBottom="true" :editorOption="{ readOnly: true, mode: `ace/mode/text` }" />
			</div>
			<bt-help v-if="defaultActive === 'installLogs'" class="px-2rem" :options="helpList"> </bt-help>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { SITE_STORE, useSiteStore } from '@site/useStore'
import { getProjectLog, getSetupLog, getSiteAccessLogs, getSiteErrorLog } from '@/api/site'
import { useDataHandle, useMessage } from '@/hooks/tools'

const Message = useMessage() // 消息提示

const { siteInfo } = useSiteStore()
const { jumpTabEvent } = SITE_STORE()

const textLoading = ref<boolean>(false) // 加载状态
const defaultActive = ref<string>('nginxLogs') // 菜单默认展开项
const content = ref<string>('') // 文件内容
const tabComponent = ref<any>([
	{
		label: 'Nginx日志',
		name: 'nginxLogs',
		lazy: true,
		render: () => <span></span>,
	},
	{
		label: 'Nginx错误日志',
		name: 'nginxErrorLogs',
		lazy: true,
		render: () => <span></span>,
	},
	{
		label: '项目日志',
		name: 'projectLogs',
		lazy: true,
		render: () => <span></span>,
	},
	{
		label: '依赖安装日志',
		name: 'installLogs',
		lazy: true,
		render: () => <span></span>,
	},
])

const helpList = [
	{
		content: (
			<>
				<div class="flex items-center">
					若依赖安装出现问题，可以前往 <bt-link onClick={() => jumpTabEvent('composer')}>Composer</bt-link> 自定义安装
				</div>
			</>
		),
	},
]

/**
 * @description 获取内容
 */
const getLogContent = async (isRefresh: boolean = false) => {
	const { name } = siteInfo.value
	const requestList: Map<string, AnyFunction> = new Map([
		['nginxLogs', getSiteAccessLogs],
		['nginxErrorLogs', getSiteErrorLog],
		['projectLogs', getProjectLog],
		['installLogs', getSetupLog],
	])
	const requestFun = requestList.get(defaultActive.value)
	const paramsType: any = {
		projectLogs: { sitename: name },
		installLogs: { sitename: name, type: 'install' },
		default: { siteName: name },
	}
	const params = paramsType[defaultActive.value] || paramsType.default
	if (!requestFun) return
	useDataHandle({
		loading: textLoading,
		request: requestFun(params),
		success: (res: any) => {
			content.value = res?.data?.data || res?.data?.msg || res.msg
			if (isRefresh) {
				Message.success('刷新成功')
			}
		},
	})
}

const tabClickEvent = (tab: any) => {
	defaultActive.value = tab
	getLogContent()
}

onMounted(() => getLogContent())
</script>
