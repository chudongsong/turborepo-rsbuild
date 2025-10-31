<template>
	<section id="layout-main" class="w-full" :style="{ 'min-height': mainHeight + 'px' }">
		<router-view v-slot="{ Component }">
			<transition class="animate-animated" name="fade" mode="out-in">
				<component :is="Component" />
			</transition>
		</router-view>
	</section>
</template>

<script lang="ts" setup>
import { useGlobalStore } from '@/store/global'
import { useRoute } from 'vue-router'
const { mainHeight } = useGlobalStore() // 持久化状态
const route = useRoute()

</script>

<style lang="css" scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.1s;
}

.fade-enter,
.fade-leave-to {
	opacity: 0;
}
</style>
