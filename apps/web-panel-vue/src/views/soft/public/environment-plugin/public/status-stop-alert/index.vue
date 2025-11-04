<template>
	<div v-bt-loading="isLoading">
		<bt-divider direction="horizontal" />
		<span class="flex items-center"
			>状态停止时提醒我：
			<el-switch v-model="status" class="mx-8px" @change="changeStatusEvent"></el-switch>
			<span class="bt-link" @click="openPopupEvent">告警设置</span>
		</span>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import SOFT_STATUS_STOP_ALERT from './store'

const store = SOFT_STATUS_STOP_ALERT()
const { isLoading, status, currentInfo } = storeToRefs(store)
const { openPopupEvent, changeStatusEvent, getPushData } = store
</script>

<style scoped></style>
