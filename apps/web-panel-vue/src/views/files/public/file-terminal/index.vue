<template>
	<div class="p-[1rem] bg-[#000] h-full">
		<bt-terminal ref="filesTerminalRef" id="filesTerminal" active url="/webssh" :host-info="{}" />
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_TERMINAL_STORE from './store'

const store = FILES_TERMINAL_STORE()
const { filesTerminalRef } = storeToRefs(store)
const { init, onCancel } = store

onMounted(() => {
	init()
})

defineExpose({
	onCancel,
})
</script>
