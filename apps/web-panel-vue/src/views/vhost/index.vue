<template>
	<BtRouterTabsNew v-if="payment.authType !== 'free' && isInstall" v-model="tabActive" :class="tabActive" />
	<div v-else>
		<bt-router-tabs contentClass="router-tabs-content p-[1.2rem] m-[1.6rem]" disabled :show-content="false"></bt-router-tabs>
		<VhostInstall></VhostInstall>
	</div>
</template>

<script lang="ts" setup>
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import { useRouterTabs } from '@/hooks/business/router-tabs'
import { useGlobalStore } from '@/store/global'
import { useSettingsStore } from '@vhost/views/settings/useStore'
import VhostInstall from '@vhost/views/install/index.vue'
import { useRoute } from 'vue-router'

const { BtRouterTabs: BtRouterTabsNew } = useRouterTabs({})

const { payment } = useGlobalStore()
const { isInstall } = useSettingsStore()

// 当前激活的tab
const route = useRoute()
const tabActive = ref(route.name as string)

// 离开
onUnmounted(() => {

	// 取消初始化请求
	useRequestCanceler([
		'/mod/virtual/virtual/get_type_list',
		'/mod/virtual/virtual/get_account_list',
		'/mod/virtual/virtual/get_service_info',
		'/mod/virtual/virtual/get_cloud_version', // 云端版本信息接口，用于版本比较
	])
})
</script>
