<template>
	<div class="p-[2rem]">
		<BtForm />
	</div>
</template>

<script setup lang="ts">
import { useForm } from '@/hooks/tools'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'
import { getCloneFormOption, onCloneConfirm } from './useController'

const { cloneLocalForm } = storeToRefs(useWPLocalStore())
const { resetCloneLocalForm } = useWPLocalStore()

const { BtForm, submit } = useForm({
	data: () => cloneLocalForm.value,
	options: getCloneFormOption() as any,
	submit: async (param: Ref<AnyObject>, validate: () => Promise<'closed' | true>, ref: Ref<any>) => {
		await validate()
	},
})

const onConfirm = async (close: () => void) => {
	await submit()
	onCloneConfirm(close)
}

onMounted(() => {
	resetCloneLocalForm()
})

defineExpose({
	onConfirm,
})
</script>

<style scoped></style>
