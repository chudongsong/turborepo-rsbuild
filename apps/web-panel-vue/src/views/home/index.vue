<template>
	<section class="pt-[1.2rem]">
		<Header class="mx-[1.2rem]" />
		<!--首页导航栏 -->
		<el-row :span="24">
			<el-col :span="24">
				<!-- 通知 -->
				<Notice />
				<!-- 状态 -->
				<div ref="stateMainRef">
					<State class="px-[1.2rem]" :main-width="stateMainWidth" />
				</div>
				<!-- 概览 -->
				<Overview />
			</el-col>
		</el-row>
		<el-row :span="24" class="px-[1.2rem]">
			<el-row :span="24" :gutter="12" class="flex-1">
				<el-col :md="24" :sm="24" :span="12" :xs="24" :lg="12">
					<!-- 监控 -->
					<Monitor class="mb-0 monitor-view" />
				</el-col>
				<el-col :md="24" :sm="24" :span="12" :xs="24" :lg="12">
					<!-- 软件 -->
					<Software class="mb-0 software-view" />
				</el-col>
			</el-row>
		</el-row>
		<!-- 推荐企业版，移动至底部 -->
		<Recommend v-if="!isHideAd" class="mt-[1.2rem] mx-[1.2rem]" />
	</section>
</template>

<script lang="ts" setup>
import { useGlobalStore } from '@store/global' // 全局持久化数据

import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import { delayExecAsync, pollingAsync, productPaymentDialog } from '@/public' // 延迟执行异步方法
// import { homeData } from '@home/useMethod' // Home数据
import Header from '@home/views/header/index.vue'
import Notice from '@home/views/notice/index.vue' // 通知
import State from '@home/views/state/index.vue' // 状态
import Overview from '@home/views/overview/index.vue' // 概览
import Software from '@home/views/software/index.vue' // 软件
import Monitor from '@home/views/monitor/index.vue' // 监控
import Recommend from '@home/views/recommend/index.vue' // 推荐
import HOME_STORE from '@home/store'
import { storeToRefs } from 'pinia'
import { useIdle } from '@/hooks/tools/idle'
import { useRouter, useRoute } from 'vue-router'

const { getAlarmData, forceLtd, payment, panel, aliyunEcsLtd, getUserInfo, isHideAd } = useGlobalStore() // 获取全局持久化数据

const store = HOME_STORE()
const { panelInfo } = storeToRefs(store)
const { isRestart } = toRefs(panelInfo.value) // 是否安装，是否重启

const router = useRouter()
const route = useRoute()

const stateMainRef = ref<HTMLElement | null>(null)
const stateMainWidth = ref(0)

useResizeObserver(stateMainRef, entries => {
	const entry = entries[0]
	stateMainWidth.value = entry.contentRect.width
})

let idle: any = null

/**
 * @description 监听是否安装，默认触发一次检查
 */
watch(
	() => panel.value.initInstall,
	val => {
		if (!val) {
			// 强制安装企业版和是否购买企业版
			if ((aliyunEcsLtd.value) && payment.value.authType === 'free') return
			store.recommendInstallDialog()
		}
	},
	{ immediate: true, deep: true }
)

onMounted(async () => {
	// 检查URL参数中是否存在bind-cupon
	if (route.query.model === 'bind-cupon') {
		// 使用vue-router移除URL参数
		const newQuery = { ...route.query }
		delete newQuery.model
		router.replace({
			path: route.path,
			query: newQuery,
		})
		await getUserInfo()
		// 打开支付界面
		productPaymentDialog({
			disablePro: true,
			sourceId: 999,
		})
	}

	store.monitorLoginInfo() // 登录信息
	// 当面板重启时，不再进行轮询
	// pollingAsync(async () => {
	// 	await store.getSystemInfo()
	// 	return isRestart.value
	// }, 3000)
	idle = useIdle({
		idle: 3600000,
		request: async () => {
			await store.getSystemInfo()
			return isRestart.value
		},
		timeout: 3000,
		retries: 3,
	})

	// 获取全局配置-首页
	store.getHomeConfig()
	// 告警数据, 1s延迟，当前方法会判断路由是否切换，如果切换则不执行
	// store.getUpdateInfo,
	delayExecAsync({
		promises: [getAlarmData, store.getUpdateInfoNew], // 获取告警数据 & 获取更新信息
		delay: 1000,
	})
	// 2025-8-13 取消禁止使用限制,改为每次到首页都弹窗
	// 2025-10-17 取消弹窗,改为变成免费版
	// setTimeout(() => {
	// 	if (forceLtd.value && payment.value.recommendAuth === 'ltd' && payment.value.authExpirationTime < 0) {
	// 		productPaymentDialog({ compulsionLtd: true })
	// 	}
	// }, 2000)
})

// 离开首页
onUnmounted(() => {
	idle?.stop()
	// 取消初始化请求
	useRequestCanceler(['/system?action=GetNetWork', '/panel/overview/GetOverview', '/plugin?action=get_index_list', '/ajax?action=get_pay_type', '/mod/push/task/get_task_list', '/auth?action=get_coupon_list'])
})
</script>

<style lang="scss" scoped>
.monitor-view,
.software-view {
	height: 55.6rem;
}

@media screen and (max-width: 1520px) {
	.monitor-view,
	.software-view {
		height: 55.6rem;
	}
}
@media screen and (max-width: 1200px) {
	.software-view {
		margin-top: 1.2rem;
	}
}
</style>
