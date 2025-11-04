<template>
	<BtRouterTabs>
		<FtpView />
	</BtRouterTabs>
</template>

<script lang="ts" setup>
import { useRouterTabs } from '@/hooks/business/router-tabs';
import { useOnUnmounted } from './useController';
import FtpView from '@ftp/views/index.vue';

const { BtRouterTabs } = useRouterTabs({
	level: true,
});
// 离开
onUnmounted(() => {
	useOnUnmounted()
})
</script>
