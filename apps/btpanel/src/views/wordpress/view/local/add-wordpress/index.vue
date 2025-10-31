<template>
	<div class="p-[1.6rem]">
		<bt-tabs v-model="tabActive" type="card" :options="tabComponent"></bt-tabs>
	</div>
</template>

<script setup lang="ts">
import { tabComponent } from '@/views/wordpress/view/local/add-wordpress/useController'
import useWPLocalAddStore from '@/views/wordpress/view/local/add-wordpress/useStore'

const { tabActive } = storeToRefs(useWPLocalAddStore())
const { getConfig } = useWPLocalAddStore()

onMounted(() => {
	getConfig()
})
</script>

<style scoped></style>
