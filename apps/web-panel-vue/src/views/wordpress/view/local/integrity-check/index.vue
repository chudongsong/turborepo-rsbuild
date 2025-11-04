<template>
	<div class="p-[2rem]">
		<el-alert type="info" :closable="false" style="margin-bottom: 1.6rem">
			<template #default>
				<div class="flex flex-col">
					<span>如果您怀疑此站点是由恶意软件感染的，请通过从WordPress.org验证其参考校验和来检查WordPress核心文件的完整性。</span>
					<span>如果校验和不匹配，则可以快速重新安装WordPress核心文件而不影响您的网站内容。</span>
				</div>
			</template>
		</el-alert>
		<el-alert v-if="verifyingData.text" :type="verifyingData.status ? 'success' : 'error'" show-icon :closable="false">
			<template #default>
				<span v-html="verifyingData.text"></span>
			</template>
		</el-alert>
		<el-divider class="my-[16px]" />
		<div class="flex justify-center">
			<el-button type="primary" @click="onCheck" :loading="verifyingLoading">验证校验</el-button>
			<el-button style="margin-left: 7rem" type="info" @click="onReinstall" :loading="reinstallLoading">重新安装WP</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import useWPLocalStore from '@/views/wordpress/view/local/useStore';
	import { onCheck, onReinstall } from './useController';

	const { verifyingData, verifyingLoading, reinstallLoading } = storeToRefs(useWPLocalStore());
	const { resetVerifyingData } = useWPLocalStore();

	onMounted(() => {
		resetVerifyingData();
	});
</script>

<style scoped></style>
