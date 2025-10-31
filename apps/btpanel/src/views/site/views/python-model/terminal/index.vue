<!--  -->
<template>
	<div class="relative bg-black h-full p-1rem">
		<bt-terminal ref="terminalRef" class="h-full" :host-info="props.compData.hostInfo" url="/pyenv_webssh" id="pythonTerminal" active />
	</div>
</template>

<script setup lang="ts">
interface Props {
	compData?: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => {
		hostInfo: {
		}
	},
})

const terminalRef = ref<any>()

const init = () => {
	console.log('init', terminalRef.value, props.compData.row)
	if (terminalRef.value?.socketInfo) {
		const socketInfo = terminalRef.value.socketInfo()
		socketInfo.send(`\r\nclear\r`)
		socketInfo.send(`cd ${props.compData.row.path}\r`)
		socketInfo.send(`${props.compData.cmd}\r`)
		// socketInfo.send(`source py-project-env ${props.compData.row.name}\r`)
	}
}

onMounted(() => {
	nextTick(() => init())
})
</script>
