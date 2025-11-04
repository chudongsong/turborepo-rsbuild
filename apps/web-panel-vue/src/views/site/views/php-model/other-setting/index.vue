<template>
	<BtTabs />
</template>
<script lang="tsx" setup>
import { useTabs } from '@/hooks/tools'
import { useSiteStore } from '@site/useStore'
import Composer from '@site/views/php-model/other-setting/composer/index.vue'
import Tomcat from '@site/views/php-model/other-setting/tomcat/index.vue'
import GZipCompress from '@site/views/php-model/other-setting/gzip/index.vue'
import NginxHeader from '@site/views/php-model/other-setting/nginx-security-request-header/index.vue'
import CorsConfig from '@site/public/cross-origin-access/index.vue'
import DefaultContent from '@site/views/php-model/default-content/index.vue'
import Crontab from '@site/views/php-model/other-setting/crontab/index.vue'
import SiteAlarm from '@site/views/php-model/site-alarm/index.vue'
import TotalFlow from '@site/views/php-model/other-setting/total-flow/index.vue'
// import AppEnvPack from '@site/views/php-model/other-setting/app-env-pack/index.vue'

const { siteInfo } = useSiteStore()

const siteType = siteInfo.value?.project_type

const defaultActive = ref(siteInfo.value?.otherName ? siteInfo.value?.otherName : siteType !== 'phpasync' ? 'composer' : 'nginx') // 菜单默认展开项

const isAsync = siteType === 'phpasync'

const tabComponent = ref<any>([
	{
		label: 'Composer',
		name: 'composer',
		lazy: true,
		isHide: isAsync,
		render: Composer,
	},
	{
		label: 'Tomcat',
		name: 'tomcat',
		lazy: true,
		isHide: isAsync,
		render: Tomcat,
	},
	{
		label: 'Gzip压缩',
		name: 'gzip',
		lazy: true,
		isHide: isAsync,
		render: GZipCompress,
	},
	{
		label: 'Nginx安全请求头',
		name: 'nginx',
		lazy: true,
		render: NginxHeader,
	},
	{
		label: '跨域访问CORS配置',
		name: 'cors',
		isHide: isAsync,
		lazy: true,
		render: CorsConfig,
	},
	{
		label: '默认文档',
		name: 'defalut',
		isHide: !isAsync,
		lazy: true,
		render: DefaultContent,
	},
	{
		label: '计划任务',
		name: 'crontab',
		isHide: !isAsync,
		lazy: true,
		render: Crontab,
	},
	{
		label: '网站告警',
		name: 'siteAlarm',
		isHide: !isAsync,
		lazy: true,
		render: SiteAlarm,
	},
	{
		label: '日流量统计',
		name: 'totalFlow',
		lazy: true,
		render: TotalFlow,
	},
	// {
	// 	label: '应用环境包',
	// 	name: 'siteApp',
	// 	isHide: isAsync,
	// 	lazy: true,
	// 	render: AppEnvPack,
	// },
])

const { BtTabs } = useTabs({
	type: 'card',
	value: defaultActive,
	options: tabComponent,
})
const init = () => {
	tabComponent.value = tabComponent.value.filter((item: any) => item.isHide !== true)
}

onMounted(init)

defineExpose({ init })
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
