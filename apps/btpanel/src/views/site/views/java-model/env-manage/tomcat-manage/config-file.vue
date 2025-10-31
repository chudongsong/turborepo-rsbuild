<!--  -->
<template>
	<div class="p-2rem">
		<p class="mb-10px">文件位置：{{ rowData.path }}</p>
		<bt-editor class="!h-[54rem] rounded-base" v-model="configContent" @save="saveConfigDataEvent()"></bt-editor>
	</div>
</template>

<script setup lang="ts">
import { rowData, saveConfigDataEvent, getConfigDataEvent, configContent } from './useController'

onMounted(getConfigDataEvent)
defineExpose({ onConfirm: saveConfigDataEvent })
</script>

<style lang="sass" scoped></style>
