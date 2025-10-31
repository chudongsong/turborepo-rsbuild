<template>
	<el-alert type="error" :description="prop.message" class="!mb-1.6rem"></el-alert>
</template>

<script setup lang="ts">
interface Props {
	dependencies: AnyObject
	message: string
}
const prop: any = withDefaults(defineProps<Props>(), {
	dependencies: () => [],
	message: '',
})
</script>
