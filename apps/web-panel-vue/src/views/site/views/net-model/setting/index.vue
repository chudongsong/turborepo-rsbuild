<template>
	<BtTabs />
</template>
<script lang="ts" setup>
import { useHandleError } from '@/hooks/tools'
import { useTabs } from '@/hooks/tools'
import { getProjectInfo } from '@api/site'
// import ProjectIndex from '@site/views/net-model/add-net/index.vue'
import { SITE_STORE, useSiteStore } from '@site/useStore'
import AddNet from '@site/views/net-model/add-net/index.vue'
import DomainManage from '@site/public/domain-manage/index.vue'
import ExternalMap from '@site/public/external-map/index.vue'
import ConfigFile from '@site/public/config-file/index.vue'
import SslArrange from '@site/public/ssl-arrange/index.vue'
import Redirect from '@site/public/redirect/index.vue'
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
const { resetTab, setSiteInfo } = SITE_STORE()

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
			render: AddNet,
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

const handleClickTab = async (tab: any) => {
	try {
		const res = await getProjectInfo({ data: JSON.stringify({ project_name: siteInfo.value.name }) }, 'net')
		if (res.data) setSiteInfo(res.data)
		return true
	} catch (error) {
		useHandleError(error)
	}
}

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

<style lang="css" scoped>
.bt-tabs :deep(.el-tabs__nav-wrap) {
	width: 12rem;
}
.bt-tabs :deep(.el-tabs__nav-scroll) {
	width: 100% !important;
}
.bt-tabs :deep(.el-tabs__nav .el-tabs__item) {
	width: 100%;
}
</style>
