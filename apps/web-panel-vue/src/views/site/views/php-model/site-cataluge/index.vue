<!--  -->
<template>
	<div>
		<bt-tabs type="card" v-model="tabActive" :options="tabConfig"></bt-tabs>
	</div>
</template>

<script setup lang="ts">
import { tabActive, tabConfig } from './useOtherController'
</script>
