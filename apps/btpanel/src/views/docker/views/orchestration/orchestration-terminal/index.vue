<template>
	<div class="flex relative w-full h-full">
		<bt-log :content="content" :isHtml="true" :isRefreshBtn="false" class="h-[40rem] font-[PingFang SC]"></bt-log>
	</div>
</template>

<script lang="ts" setup>
import { content, init, unmountHandler } from './useController'

interface Props {
	compData?: any
}

// 默认数据为项目模板拉取镜像日志
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

onMounted(() => {
	nextTick(() => {
		init(props)
	})
})

onUnmounted(() => {
	unmountHandler()
})

defineExpose({
	init,
})
</script>

<style scoped>
.terminal-view {
	@apply w-full h-full bg-darkPrimary relative;
}

.terminal-add-host {
	@apply absolute flex-col top-0 w-full h-full flex justify-center items-center z-999 bg-darkPrimary;
}
.terminal-add-host .el-form {
	@apply w-[50rem];
}
.compose-terminal::-webkit-scrollbar {
	@apply w-[0px];
}
.compose-terminal .xterm .xterm-cursor {
	@apply hidden;
}
.compose-terminal .xterm .xterm-helper-textarea {
	@apply hidden;
}
</style>

<style>
.drawer {
	@apply hidden;
}

.xterm {
	padding: 1rem !important;
	height: 100%;
}

.xterm-viewport::-webkit-scrollbar {
	@apply w-[8px] h-[6px] rounded-base;
}

.xterm-viewport::-webkit-scrollbar-thumb {
	@apply bg-darkSecondary rounded-base;
	box-shadow: inset 0 0 5px rgba(24, 29, 40, 0.4);
	transition: all 1s;
}

.xterm-viewport:hover::-webkit-scrollbar-thumb {
	@apply bg-darkTertiary;
}

.xterm-viewport::-webkit-scrollbar-track {
	@apply bg-darkPrimary rounded-base;
	box-shadow: inset 0 0 5px rgba(24, 29, 40, 0.4);
	transition: all 1s;
}

.xterm-viewport:hover::-webkit-scrollbar-track {
	@apply bg-darkPrimary;
}
.xterm-screen {
	@apply min-h-full;
}
</style>
