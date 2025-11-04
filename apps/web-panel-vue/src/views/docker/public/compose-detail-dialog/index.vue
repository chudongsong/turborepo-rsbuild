<template>
	<!-- @change="tabClick" -->
	<bt-tabs type="left-bg-card" v-model="tabActive" :options="config"> </bt-tabs>
</template>
<script setup lang="tsx">
import { getDockerStore } from '@docker/useStore'
interface Props {
	compData?: any
}

const {
	refs: { currentConDetail },
	refreshActiveTable,
	getCurrentCon,
} = getDockerStore()

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

// 容器状态
const Status = defineAsyncComponent(() => import('./container-status.vue'))
// 容器终端
const Terminal = defineAsyncComponent(() => import('./container-shell.vue'))
// 容器详情
const Detail = defineAsyncComponent(() => import('./container-detail.vue'))
// 数据存储卷
const Volume = defineAsyncComponent(() => import('./container-volume.vue'))
// 容器网络
const Net = defineAsyncComponent(() => import('./container-net.vue'))
// 重启策略
const Restart = defineAsyncComponent(() => import('./container-reset.vue'))
// 创建镜像
const Mirror = defineAsyncComponent(() => import('./container-mirror.vue'))
// 编辑容器
const Edit = defineAsyncComponent(() => import('@docker/public/create-con-dialog/container-edit.vue'))
// 升级容器
const Upgrade = defineAsyncComponent(() => import('./container-upgrade.vue'))
// 重命名
const Rename = defineAsyncComponent(() => import('./container-rename.vue'))
// 实时监控
const Monitor = defineAsyncComponent(() => import('./container-monitor.vue'))
// 容器日志
const Log = defineAsyncComponent(() => import('@docker/views/container/container-logs-dialog/con-log.vue'))
// 反向代理
const Proxy = defineAsyncComponent(() => import('./setno-port-config/index.vue'))

// 默认选中tab
const tabActive = ref('status')

provide('tabActive', tabActive)
provide('currentConDetail', currentConDetail)

const row = toRef(props.compData, 'row')

const config = [
	{ label: '容器状态', lazy: true, name: 'status', render: () => <Status></Status> },
	{
		label: '容器终端',
		name: 'terminal',
		lazy: true,
		render: () => <Terminal compData={{ row: currentConDetail }}></Terminal>,
	},
	{
		label: '容器详情',
		name: 'detail',
		lazy: true,
		render: () => <Detail></Detail>,
	},
	{
		label: '数据存储卷',
		name: 'volume',
		lazy: true,
		render: () => <Volume></Volume>,
	},
	{
		label: '容器网络',
		name: 'net',
		lazy: true,
		render: () => <Net></Net>,
	},
	{
		label: '重启策略',
		name: 'restart',
		lazy: true,
		render: () => <Restart></Restart>,
	},
	{
		label: '创建镜像',
		name: 'mirror',
		lazy: true,
		render: () => <Mirror compData={{ row: row.value }}></Mirror>,
	},
	{
		label: '编辑容器',
		name: 'edit',
		lazy: true,
		render: () => <Edit compData={{ row: row.value, type: 'edit' }}></Edit>,
	},
	{
		label: '升级容器',
		name: 'upgrade',
		lazy: true,
		render: () => <Upgrade compData={{ row: row.value }}></Upgrade>,
	},
	{
		label: '重命名',
		name: 'rename',
		lazy: true,
		render: () => <Rename compData={{ row: row.value }}></Rename>,
	},
	{
		label: '实时监控',
		name: 'monitor',
		lazy: true,
		render: () => <Monitor compData={{ row: row.value }}></Monitor>,
	},
	{
		label: '容器日志',
		name: 'log',
		lazy: true,
		render: () => <Log compData={row.value}></Log>,
	},
	{
		label: '反向代理',
		name: 'proxy',
		lazy: true,
		render: () => <Proxy compData={{ row: row.value }}></Proxy>,
	},
]

onMounted(() => {
	// 获取当前容器信息
	getCurrentCon(row.value.id)
	if (props.compData.type) {
		refreshActiveTable()
		tabActive.value = props.compData.type
	}
})
</script>
<style lang="css" scoped>
:deep(.el-tabs__nav-scroll) .el-tabs__nav.is-left {
	width: 12.6rem;
}
.lib-box table tr td,
.lib-box table tr th {
	@apply border-t-1 border-base leading-34px text-left px-[.8rem];
}
.lib-con {
	@apply border border-base p-[1rem] my-[1rem] rounded-base bg-light leading-20px;
}

:deep(.el-tabs__content) {
	overflow-y: auto;
}
</style>
