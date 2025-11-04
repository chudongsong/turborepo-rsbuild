<template>
	<span ref="installShow" class="install-show !h-full p-8px text-small min-h-[22rem]">
		{{ speedMsg || '正在准备安装...' }}
	</span>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { INSTALL_STORE } from '../store'

const { initSpeed, clearTimeoutAll } = INSTALL_STORE()
const { speedMsg } = storeToRefs(INSTALL_STORE())

onMounted(initSpeed)

onUnmounted(() => {
	clearTimeoutAll()
})

defineExpose({
	close: clearTimeoutAll,
})
</script>

<style lang="css" scoped>
.install-show {
	@apply w-[100%] block bg-[#303133] whitespace-pre-line overflow-auto text-white text-left pt-[20px] leading-8;
	font-family: 'Microsoft YaHei' !important;
	transition: scrollTop 400ms;
}
</style>
