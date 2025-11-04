<template>
	<div class="">
		<version-compare />
		<bt-form class="my-[16px]">
			<bt-form-item label="服务状态">
				<div class="mr-[8px] text-secondary flex items-center" :class="isServerRunning.color">{{ isServerRunning.tips }}<bt-icon :icon="`icon-${isServerRunning.icon}`" class="mr-[4px]" :class="isServerRunning.color" /></div>
				<bt-button @click="onSetService(isServerRunning.type)">{{ isServerRunning.text }}</bt-button>
				<bt-button @click="onSetService('restart')">重启</bt-button>
				<bt-button @click="onSetService('reload')">重载</bt-button>
			</bt-form-item>
			<bt-form-item label="证书SSL"><bt-button type="primary" @click="editSslEvent">修改</bt-button></bt-form-item>
			<bt-form-item label="IP地址"><BtInput v-model="serverIP" class="mr-[10px] w-[250px]" /><bt-button @click="editHostEvent" type="primary">修改</bt-button><bt-button @click="resetServerEvent">重置</bt-button></bt-form-item>
			<p class="ml-[100px] mt-[2px]">
				<span class="mr-[4px]">访问地址:</span>
				<BtLink @click="jumpToAddressEvent">{{ `${serverProtocol}://${serverIP}${serverPort}/account/login` }}</BtLink>
			</p>
		</bt-form>
	</div>
</template>

<script lang="ts" setup>
import VersionCompare from '@/views/vhost/public/version-compare.vue'
import { useSettingsStore } from './useStore'
import { onSetService, editHostEvent, editSslEvent, jumpToAddressEvent } from './useController'

const { isServerRunning, serverIP, serverProtocol, serverPort, resetServerEvent, getServerIP, getCertInfo } = useSettingsStore()

onMounted(() => {
	getCertInfo() // 获取证书信息
	getServerIP() // 获取服务器IP
})
</script>

<style lang=""></style>
