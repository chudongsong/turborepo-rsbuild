<template>
	<div class="relative p-[1.6rem]">
		<BtLog class="h-[40rem]" :content="compData.value" :isHtml="true"></BtLog>
	</div>
</template>

<script setup lang="tsx">
import BtLog from '@/components/extension/bt-log/index.vue'

const props = defineProps<{
	compData: Ref<string>
}>()
</script>

<!-- <template>
	<div class="relative bg-darkPrimary h-full p-[1.6rem]">
		<bt-terminal ref="terminalRef" class="h-full" url="/sock_shell" id="ollamaTerminal"  active />
	</div>
</template>

<script setup lang="ts">

interface Props {
	compData?: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => {
	},
})

const terminalRef = ref<any>()

const init = () => {
	if (terminalRef.value?.socketInfo) {
		const socketInfo = terminalRef.value.socketInfo()
		socketInfo.send(`tail -f /tmp/${props.compData.serviceName}.log`)
	}
}

onMounted(() => {
	nextTick(() => init())
})
</script> -->
