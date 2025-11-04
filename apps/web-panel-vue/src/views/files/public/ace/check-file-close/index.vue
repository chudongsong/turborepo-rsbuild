<template>
	<div class="pd30 hint-title">
		<img class="hint-confirm-icon flex-shrink-0 w-[4rem] h-[4rem]" src="/static/icons/hint-confirm-icon.svg" />
		<div class="hint_con">检测到文件已被修改，是否保存？</div>
	</div>
</template>

<script setup lang="ts">
import { enableRefresh } from '@files/public/ace/useMethods'

onBeforeUnmount(() => {
	enableRefresh()
})
</script>

<style lang="css" scoped>
.hint-title {
	font-size: var(--el-font-size-base);
	color: var(--el-color-text-secondary);
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
}

.hint-title .hint_con {
	margin-left: 16px;
	line-height: 28px;
}
</style>
