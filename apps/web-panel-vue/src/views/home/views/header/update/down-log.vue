<template>
	<div class="p-2rem flex flex-col">
		<bt-log :content="downLogContent" :isHtml="true" class="h-51rem"></bt-log>
	</div>
</template>

<script lang="ts" setup>
import HOME_HEADER_STORE from '@home/views/header/store'
import HOME_STORE from '@/views/home/store'
import { storeToRefs } from 'pinia';

const headerStore = HOME_HEADER_STORE()
const store = HOME_STORE();
const { downLogContent } = storeToRefs(store);

// const popupClose = inject('popupClose', () => {})

onBeforeUnmount(() => {
	headerStore.getUpdatePushInfo()
	store.clearRestart();
});

onMounted(() => {
	store.getDownloadEnvLog();
});
</script>
