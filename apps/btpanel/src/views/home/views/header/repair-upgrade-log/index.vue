<template>
	<div class="p-2rem flex flex-col">
		<bt-log :title="`全屏查看【${compData.type === 'repair' ? '修复' : '更新'}】日志`" :content="logContent" :isHtml="true" class="h-41rem"></bt-log>
	</div>
</template>

<script lang="ts" setup>
import HOME_HEADER_STORE from '@home/views/header/store';
import { storeToRefs } from 'pinia';

interface Prop {
	compData: any;
}

const props = withDefaults(defineProps<Prop>(), {
	compData: () => ({
		type: 'repair', // 修复面板 upgrade 更新面板
	}),
});

const store = HOME_HEADER_STORE();
const { logContent } = storeToRefs(store);

onBeforeUnmount(() => {
	store.clearRestart();
});

onMounted(() => {
	store.getLog();
});
</script>
