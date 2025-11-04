import { ShallowRef } from 'vue'
import { useGlobalStore } from '@/store/global'
import { storeToRefs } from 'pinia'

export function useHeight(element: ShallowRef<HTMLDivElement | null>) {
	const heightVal = ref(0)

	const { mainHeight } = storeToRefs(useGlobalStore())

	watch(
		() => mainHeight.value,
		val => {
			nextTick(() => {
				if (!element.value) return

				const { top } = element.value.getBoundingClientRect()
				heightVal.value = val - top - 16 - 16 - 52
			})
		},
		{ immediate: true }
	)

	const height = computed(() => {
		if (heightVal.value === 0) return 'auto'
		return heightVal.value + 'px'
	})

	return {
		height,
	}
}
