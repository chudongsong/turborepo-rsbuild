<template>
	<li :ref="setDrop" class="link-items" :style="{ opacity }">
		<div class="w-100px">
			<el-input v-model="label" />
		</div>
		<div class="w-100px">
			<el-input v-model="href" />
		</div>
		<div class="w-auto cursor-pointer" @click="onDel">
			<bt-icon icon="el-delete" :size="13"></bt-icon>
		</div>
		<div :ref="drag" class="w-auto cursor-grab">
			<bt-icon icon="el-fullscreen-expand" :size="13"></bt-icon>
		</div>
	</li>
</template>

<script lang="ts" setup>
import { useDrag, useDrop } from 'vue3-dnd'
import { toRefs } from '@vueuse/core'

const props = defineProps<{
	id: string
	index: number
	moveLink: (id: string, to: number) => void
	findLink: (id: string) => { index: number }
}>()

const emit = defineEmits<{
	(event: 'del'): void
}>()

const label = defineModel<string>('label')

const href = defineModel<string>('href')

const onDel = () => {
	emit('del')
}

const [collect, drag, preview] = useDrag({
	type: 'MenuLink',
	item: () => ({ id: props.id, index: props.index }),
	collect: monitor => ({
		isDragging: monitor.isDragging(),
	}),
	end: (item, monitor) => {
		const { id, index } = item
		const didDrop = monitor.didDrop()
		if (!didDrop) {
			props.moveLink(id, index)
		}
	},
})

const [, drop] = useDrop(() => ({
	accept: 'MenuLink',
	hover({ id: draggedId }: { id: string }) {
		if (draggedId !== props.id) {
			const { index: overIndex } = props.findLink(props.id)
			props.moveLink(draggedId, overIndex)
		}
	},
}))

const setDrop = (el: HTMLDivElement) => {
	if (el) {
		preview(drop(el))
	}
	return undefined
}

const { isDragging } = toRefs(collect)

const opacity = computed(() => (unref(isDragging) ? 0 : 1))
</script>

<style lang="scss" scoped>
.link-items {
	display: flex;
	align-items: center;
	padding: 12px;
	gap: 8px;
	border: 1px solid var(--el-color-border-dark-tertiary);
	border-top: none;

	&:first-child {
		border-top: 1px solid var(--el-color-border-dark-tertiary);
		border-top-left-radius: var(--el-border-radius-base);
		border-top-right-radius: var(--el-border-radius-base);
	}

	&:last-child {
		border-bottom-left-radius: var(--el-border-radius-base);
		border-bottom-right-radius: var(--el-border-radius-base);
	}
}
</style>
