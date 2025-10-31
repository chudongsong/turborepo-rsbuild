<template>
	<div class="flex-wrap">
		<bt-log class="!h-[40rem] !rounded-none" :content="logContent" />
	</div>
</template>

<script lang="tsx" setup>
import { logContent,socketInfo,initPullImage,unmountLogHandler } from './useController'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		url: '',
		params: {},
		onWSReceive: () => {},
		onRefresh: () => {},
	}),
})

const popupClose = inject('popupClose', () => {})

// 页面加载完成
onMounted(() => {
	initPullImage(props,popupClose)
})

onUnmounted(() => {
	unmountLogHandler(props.compData.onRefresh)
})

defineExpose({
	socketInfo: () => socketInfo,
})
</script>
