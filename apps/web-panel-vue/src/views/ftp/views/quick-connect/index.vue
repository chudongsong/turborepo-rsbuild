<template>
	<div class="p-[24px]">
		<div class="flex flex-col mb-[24px]">
			<div class="mb-[12px] text-base text-secondary">第一步：复制快速连接URL</div>
			<div class="flex">
				<bt-input v-model="quickConnectUrl" readonly width="35rem" class="mr-[8px]" />
				<el-button type="primary" id="quickConnectUrl" :data-clipboard-text="quickConnectUrl" @click="copyText({ value: quickConnectUrl })"> 复制URL </el-button>
			</div>
		</div>
		<div class="flex flex-col">
			<div class="mb-[12px] text-base text-secondary">第二步：使用FTP工具连接进行一键连接，例如FileZila软件连接操作如下：</div>
			<div class="flex">
				<bt-image src="/ftp/quick-connect.png" alt="" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { copyText } from '@/utils'
import { useFtpStore } from '@ftp/useStore'
import { useGlobalStore } from '@/store/global'

const { ftpPort, rowData } = useFtpStore()
const { serverIp } = useGlobalStore()

const quickConnectUrl = computed(() => {
	const { name, password } = rowData.value
	return `ftp://${name}:${password}@${serverIp.value}:${ftpPort.value}`
})
</script>

<style scoped></style>
