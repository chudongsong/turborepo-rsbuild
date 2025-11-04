<template>
	<div class="p-8 overflow-y-hidden">
		<bt-tabs type="card" v-model="tabActive" :options="tabComponent" />
	</div>
</template>

<script setup lang="ts">
import { tabComponent } from './useMethod'
import { useFtpLogStore } from './useStore'
const { tabActive } = useFtpLogStore()
</script>
