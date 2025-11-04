<template>
	<BtRouterTabsNew v-if="payment.authType !== 'free' && install" v-model="tabActive" :class="tabActive" />
	<div v-else>
		<bt-router-tabs contentClass="router-tabs-content p-[1.2rem] m-[1.6rem]" disabled :show-content="false"></bt-router-tabs>
		<MailInstall class="bg-white rounded-medium"></MailInstall>
	</div>
</template>
<script setup lang="ts">
import { useRouterTabs } from '@/hooks/business/router-tabs'
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import { useGlobalStore } from '@/store/global'
import { getMailStore } from '@mail/useStore'
import MailInstall from '@mail/views/install/index.vue'

const { BtRouterTabs: BtRouterTabsNew } = useRouterTabs({})

const {
	refs: { tabActive, install },
	cutTabsEvent,
} = getMailStore()
const { payment } = useGlobalStore()
// 离开
onUnmounted(() => {
	// 取消初始化请求
	useRequestCanceler(['/plugin?action=get_soft_find', '/mail/manage/user_surplus', '/plugin?action=a&name=mail_sys&s=get_today_count'])
})
</script>

<style lang="css">
.mailoverview .router-tabs-content {
	padding: 0;
	background-color: transparent;
	box-shadow: none !important;
}
</style>
