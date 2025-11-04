<template>
	<div class="docker-tab-container">
		<BtRouterTabs v-model="modelVal" contentClass="docker-route-con module-ui" :class="currentRoute" :disabled="disabled" @after-leave="onRouteTransitionEnd" />
	</div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import { useRouterTabs } from '@/hooks/business/router-tabs'
import { modelVal, disabled, dockerTests } from './useMethods'

const route = useRoute()
const router = useRouter()

const { BtRouterTabs } = useRouterTabs({ store: false }) // 取消动态存储，改为手动控制

const currentRoute = ref(route.name)

watch(
	() => route.name,
	(name: any) => {
		// dockerTests(route,router)
		modelVal.value = name as string
		if (route.name !== 'docker') {
			localStorage.setItem('DOCKER_ROUTER', name) // 获取docker路由
		}
	},
	{ immediate: true }
)

// 监听路由变化
const onRouteTransitionEnd = () => {
	nextTick(() => {
		currentRoute.value = route.name as string
	})
}
// 监听路由完全切换完成后执行
onMounted(() => {
	// 使用nextTick确保DOM更新完成
	nextTick(() => {
		currentRoute.value = route.name as string
	})
})

// 离开
onUnmounted(() => {
	// 取消初始化请求
	useRequestCanceler(['/btdocker/setup/get_config', '/mod/docker/com/get_apps', '/mod/docker/com/get_tags'])
})
</script>

<style lang="css" scoped>
.container-dialog .el-radio__label {
	@apply text-small text-default;
}
.container-dialog .el-slider__runway {
	@apply my-[1.3rem];
}
.container-table-tab :deep(.el-tooltip .el-dropdown) {
	@apply text-small;
}
.container-table-tab :deep(.el-tooltip .el-dropdown .el-dropdown-selfdefine) {
	@apply flex items-center;
}
.real-monitor-dialog {
	left: -21px !important;
}
@media (min-height: 800px) {
	.real-monitor-dialog {
		left: -17px !important;
	}
}
</style>

<style>
.docker-route-con {
	@apply relative mt-[1.2rem];
}
.docker-setting .docker-route-con {
	padding: 0;
	background-color: transparent;
	box-shadow: none !important;
}
.docker-conmanger .docker-route-con {
	padding: 0;
	background-color: transparent;
	box-shadow: none !important;
}
.docker-cloudimages .docker-route-con {
	padding: 0;
}
.docker-orchestration .docker-route-con {
	padding: 0;
	background-color: transparent;
	box-shadow: none !important;
}
</style>
