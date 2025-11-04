<template>
	<BtTabs />
	<!-- <bt-tabs
		:before-leave="handleClickTab"
		class="w-full h-full"
		type="border-card"
		position="left"
		v-model="defaultActive"
		:config="tabComponent" /> -->
</template>
<script lang="ts" setup>
// import ProjectIndex from '@site/views/go-model/add-go/index.vue'
import { useSiteStore, SITE_STORE } from '@site/useStore'
import { useTabs } from '@/hooks/tools'
import AddGo from '@site/views/go-model/add-go/index.vue'
import DomainManage from '@site/public/domain-manage/index.vue'
import ExternalMap from '@site/public/external-map/index.vue'
import PseudoStatic from '@site/public/pseudo-static/index.vue'
import ConfigFile from '@site/public/config-file/index.vue'
import SslArrange from '@site/public/ssl-arrange/index.vue'
import Redirect from '@site/public/redirect/index.vue'
import LoadState from '@site/public/load-state/index.vue'
import ServiceState from '@site/public/service-state/index.vue'
import ProjectLogs from '@site/public/project-logs/index.vue'
import SiteLogs from '@site/public/site-logs/index.vue'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {
		row: () => {},
		name: '',
	},
})

const { siteInfo, isJump, settingTabActive } = useSiteStore()
const { resetTab } = SITE_STORE()

const defaultActive = ref(settingTabActive.value || 'project') // 菜单默认展开项
const rowData = ref(props.compData.row)

const { BtTabs } = useTabs({
	type: 'left-bg-card',
	value: defaultActive,
	options: [
		{
			label: '项目信息',
			name: 'project',
			lazy: true,
			render: AddGo,
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
			lazy: true,
			render: Redirect,
		},
		{
			label: '负载状态',
			name: 'load',
			lazy: true,
			render: LoadState,
		},
		{
			label: '服务状态',
			name: 'state',
			lazy: true,
			render: ServiceState,
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
	],
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
</script>

<style lang="css" scoped></style>
