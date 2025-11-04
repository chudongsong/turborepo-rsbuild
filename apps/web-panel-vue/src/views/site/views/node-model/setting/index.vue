<template>
	<bt-tabs type="left-bg-card" v-model="defaultActive" :options="tabComponent" />
</template>
<script lang="ts" setup>
import { useTabs } from '@/hooks/tools'
import { getNodeConfig } from '@site/views/node-model/useController'
import { SITE_STORE, useSiteStore } from '@site/useStore'
import NodeProject from '@site/views/node-model/add-node/node-project.vue'
import Pm2Project from '@site/views/node-model/add-node/pm-project.vue'
import GeneralProject from '@site/views/node-model/add-node/traditional-project.vue'
import DomainManage from '@site/public/domain-manage/index.vue'
import ExternalMap from '@site/public/external-map/index.vue'
import FlowLimit from '@site/public/flow-setting/flow-limit/index.vue'
import PseudoStatic from '@site/public/pseudo-static/index.vue'
import ConfigFile from '@site/public/config-file/index.vue'
import SslArrange from '@site/public/ssl-arrange/index.vue'
import Redirect from '@site/public/redirect/index.vue'
import LoadState from '@site/public/load-state/index.vue'
import ServiceState from '@site/public/service-state/index.vue'
import ModuleManage from '@site/views/node-model/module-manage/index.vue'
import ProjectLogs from '@site/public/project-logs/index.vue'
import SiteLogs from '@site/public/site-logs/index.vue'

const { siteInfo, settingTabActive, isJump } = useSiteStore()
const { resetTab } = SITE_STORE()

const defaultActive = ref(settingTabActive.value || 'project') // 菜单默认展开项
const rowData = ref(siteInfo.value)

const tabComponent = [
	{
		label: '项目配置',
		name: 'project',
		lazy: true,
		render: () => {
			const addComponent = {
				node: NodeProject,
				pm2: Pm2Project,
				general: GeneralProject,
				// git: import('@site/views/node-model/add-node/node-project.vue'),
			} as { [key: string]: any }
			return addComponent[rowData.value.project_config.project_type] || addComponent['node']
		},
	},
	{
		label: '域名管理',
		name: 'domain',
		lazy: true,
		render: DomainManage,
	},
	{
		label: '外网映射',
		name: 'mapping',
		lazy: true,
		render: ExternalMap,
	},
	{
		label: '流量限制',
		name: 'limit',
		lazy: true,
		render: FlowLimit,
	},
	// 暂不开发
	// {
	// 	label: 'Git管理',
	// 	name: 'git-manger',
	// 	render: () => import('@site/views/node-model/add-node/node-project.vue'),
	// },
	{
		label: '伪静态',
		name: 'pseudo',
		lazy: true,
		render: PseudoStatic,
	},
	{
		label: '配置文件',
		name: 'configFile',
		lazy: true,
		render: ConfigFile,
	},
	{
		label: 'SSL',
		name: 'ssl',
		lazy: true,
		render: SslArrange,
	},
	{
		label: '重定向',
		name: 'redirect',
		render: Redirect,
	},
	{
		label: '负载状态',
		name: 'load',
		lazy: true,
		render: LoadState,
	},
	{
		label: '服务',
		name: 'state',
		lazy: true,
		render: ServiceState,
	},
	{
		label: '模块管理',
		name: 'modules',
		lazy: true,
		render: ModuleManage,
	},
	{
		label: '项目日志',
		name: 'projectLogs',
		lazy: true,
		render: ProjectLogs,
	},
	{
		label: '网站日志',
		name: 'siteLogs',
		lazy: true,
		render: SiteLogs,
	},
]

const { BtTabs } = useTabs({
	type: 'left-bg-card',
	value: defaultActive,
	options: tabComponent,
})

// 监听是否跳转
watch(
	() => isJump.value,
	val => {
		if (val) {
			defaultActive.value = settingTabActive.value
			resetTab()
		}
	}
)

const nodeData = ref({}) // 配置数据，node版本，运行用户，包管理

provide('nodeData', nodeData)

onMounted(async () => {
	// git项目 暂不开发
	// // 判断项目类型是否为git，若不是则删除tabComponent中的git-manger
	// if (rowData.value.type !== 'git') {
	// 	const index = tabComponent.findIndex(item => item.type === 'git-manger')
	// 	tabComponent.splice(index, 1)
	// }

	// 判断项目类型是否为general，若是则删除tabComponent中的模块管理modules
	if (rowData.value.project_config.project_type === 'general') {
		const index = tabComponent.findIndex(item => item.name === 'modules')
		tabComponent.splice(index, 1)
	}

	// 判断项目类型是否为pm2，若是则删除tabComponent中的负载状态load
	if (rowData.value.project_config.project_type === 'pm2') {
		const index = tabComponent.findIndex(item => item.name === 'load')
		tabComponent.splice(index, 1)
	}
	// 获取node配置数据
	nodeData.value = await getNodeConfig()
})
</script>

<style lang="css" scoped></style>
