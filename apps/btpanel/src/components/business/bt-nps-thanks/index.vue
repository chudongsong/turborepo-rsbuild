<template>
	<div class="bg-base text-center py-[20px] flex items-center flex-col rounded-log">
		<bt-image src="/feedback/qa_like.png" class="w-[56px]" />
		<p class="mt-[16px]">感谢您的参与!</p>
	</div>
</template>

<script setup lang="ts">
const emits = defineEmits(['close'])
onMounted(() => {
	setTimeout(() => {
		emits('close')
	}, 2000)
})
</script>
