<template>
	<div>
		<bt-editor v-model="file" file-path="/www/server/panel/BTPanel/package-lock.json" editor-option="" />
	</div>
</template>

<script setup lang="ts">
const file = ref<string>('');
const editorOption = ref<string>('');
</script>

<style scoped></style>
