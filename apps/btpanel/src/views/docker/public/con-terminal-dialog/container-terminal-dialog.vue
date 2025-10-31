<template>
	<div class="p-[1rem] bg-[#000] h-full">
		<bt-terminal id="dockerTerminal" class="h-full" active ref="terminal" url="/webssh" :host-info="{}" />
	</div>
</template>

<script setup lang="ts">
interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})
// 终端ref
const terminal = ref<any>()

const cmd = ref(props.compData.cmd)

let socket = ref<any>(null)
/**
 * @description 项目初始化
 */
const init = () => {
	socket.value = terminal.value.socketInfo()
	socket.value.send('cd /www/wwwroot\r\n')
	socket.value.send(`clear && ${cmd.value}\r\n`)
	socket.value.send(`clear\r`)
}

/**
 * @description 重连
 */
const reConnect = (socket: any) => {
	socket.send('cd /www/wwwroot\r\n')
	socket.send(`clear && ${cmd.value}\r\n`)
	socket.send(`clear\r`)
}

onMounted(() => {
	nextTick(() => {
		init()
	})
})

defineExpose({
	onCancel: () => {
		socket.value.close()
	},
})
</script>
