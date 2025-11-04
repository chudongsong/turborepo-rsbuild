<template>
	<div class="p-[2rem]">
		<BtForm />
		<bt-help :options="[{ content: '一组是包含多个插件和主题的模板。您可以单击一次在特定的WordPress网站上安装集合。创建并命名设置后，向其添加插件和主题。' }]" style="list-style: disc"></bt-help>
	</div>
</template>

<script setup lang="ts">
import { useDataHandle, useForm } from '@/hooks/tools'
import useWPSetsStore from './useStore'
import { getAddWPSetsFormOption } from './useController'
import { addSets } from '@/api/wp'

const { createFormData, isRefreshSetsList } = storeToRefs(useWPSetsStore())
const { resetCreateFormData } = useWPSetsStore()

const { BtForm, submit } = useForm({
	data: () => createFormData.value,
	options: getAddWPSetsFormOption,
	submit: async (param: Ref<AnyObject>, validate: () => Promise<'closed' | true>, ref: Ref<any>) => {
		await validate()
	},
})

const onConfirm = async (close: () => void) => {
	await submit()
	useDataHandle({
		request: addSets(createFormData.value),
		loading: '创建集合中...',
		message: true,
		success(data) {
			isRefreshSetsList.value = true
			close()
		},
	})
}

onMounted(() => {
	resetCreateFormData()
})

defineExpose({
	onConfirm,
})
</script>

<style scoped></style>
