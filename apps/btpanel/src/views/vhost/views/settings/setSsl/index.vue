<template>
	<div class="p-[20px] flex">
		<div class="flex-1 flex flex-col mr-[15px]">
			<span class="mb-[5px]">密钥 (KEY)</span>
			<bt-input type="textarea" :rows="16" v-model="certInfo.private_key" class="w-full" />
		</div>
		<div class="flex-1 flex flex-col">
			<span class="mb-[5px]">证书 (CRT/PEM)</span>
			<bt-input type="textarea" :rows="16" v-model="certInfo.certificate" class="w-full" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useSettingsStore } from '../useStore'
const { certInfo } = useSettingsStore()
</script>

<style></style>
