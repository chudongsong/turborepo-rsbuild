<template>
	<div class="p-[2rem]">
		<el-alert style="margin-bottom: 1.6rem" :type="file.status ? 'success' : 'error'" :show-icon="false" :closable="false">
			<div class="flex items-center text-small text-secondary">
				<span class="mr-[1.2rem]">保护开关</span>
				<el-switch :model-value="file.status" @change="onUpdateStatus" :loading="fileLoad"></el-switch>
				<span v-if="!file.status" class="ml-[1.2rem]"> 保护目录关闭，存在安全风险，建议立即开放保护! </span>
			</div>
		</el-alert>
		<div class="h-500px">
			<bt-tabs v-model="tabActive" type="bg-card" :options="tabComponent"></bt-tabs>
		</div>
	</div>
</template>

<script setup lang="ts">
import useWPProtectionStore from '@/views/wordpress/view/local/site-protection/useStore'
import { storeToRefs } from 'pinia'
import { onUpdateStatus } from '../useController'

const { file, tabActive, fileLoad } = storeToRefs(useWPProtectionStore())
const { tabComponent } = useWPProtectionStore()

onMounted(() => {
	tabActive.value = 'basic'
})
</script>

<style scoped></style>
