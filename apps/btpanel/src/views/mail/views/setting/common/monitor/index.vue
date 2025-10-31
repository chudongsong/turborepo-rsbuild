<template>
	<setting-card title="监控">
		<div class="flex items-center">
			<div class="text-base mr-[3rem]">服务停止后自动启动</div>
			<el-switch :model-value="status" :loading="loading" @change="onUpdateStatus"></el-switch>
		</div>
	</setting-card>
</template>

<script lang="ts" setup>
import { getMailStore } from '@mail/useStore'
import MAIL_SETTING_MONITOR from '@mail/views/setting/common/monitor/store'
import { storeToRefs } from 'pinia'
import { getStatus, onUpdateStatus } from '@mail/views/setting/common/monitor/useMethod'
import SettingCard from '@mail/public/setting-card.vue'

const store = getMailStore()

const { status, loading } = storeToRefs(MAIL_SETTING_MONITOR())
const { reset } = MAIL_SETTING_MONITOR()

if (store.install) {
	getStatus()
}

onUnmounted(() => {
	reset()
})
</script>
