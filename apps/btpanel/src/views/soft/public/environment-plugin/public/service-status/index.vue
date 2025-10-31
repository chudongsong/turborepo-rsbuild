<template>
	<div class="flex flex-col text-secondary">
		<span class="mb-[12px] flex items-center"> 当前状态：<BtTableStatus v-model="compData.status" :data="['关闭', '开启']"></BtTableStatus> </span>
		<div class="flex items-center">
			<el-button v-if="!compData.status" type="default" @click="serviceManageEvent('start')">启动</el-button>
			<el-button v-else type="default" @click="serviceManageEvent('stop')">停止</el-button>
			<el-button type="default" @click="serviceManageEvent('restart')">重启</el-button>
			<el-button type="default" @click="serviceManageEvent('reload')">重载配置</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import SOFT_SERVICE_STATUS_STORE from './store'

const store = SOFT_SERVICE_STATUS_STORE()
const { compData } = storeToRefs(store)
const { serviceManageEvent, $reset_compdata } = store

onUnmounted($reset_compdata)
</script>

<style scoped></style>
