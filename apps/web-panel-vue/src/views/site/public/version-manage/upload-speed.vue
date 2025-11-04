<template>
	<div class="download-speed">
		<div class="download-speed-top">
			<div class="download-speed-top-title">
				{{ compData.title }}
			</div>
			<div class="download-speed-top-score">{{ percentum }}%</div>
		</div>
		<bt-progress :strokeWidth="5" :percentage="percentum" :showText="false"></bt-progress>
	</div>
</template>
<script setup lang="ts">
interface Props {
	compData: AnyObject
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})
const percentum = ref<number>(0)

watch(
	() => props.compData,
	val => {
		percentum.value = val.percentum
	}
)
</script>
<style lang="css" scoped>
.download-speed {
  @apply py-[12px] px-[16px];
}
.download-speed-top {
  @apply flex justify-between;
}
</style>
