<template>
	<BtForm class="p-2rem" label-width="80px" />
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { submitDnsVerify } from '../useController'

const props = withDefaults(
	defineProps<{
		compData: any
	}>(),
	{
		compData: {
			data: [],
			help: '',
			name: '',
			ps: '',
		},
	}
)
const configList = ref(props.compData.data)

const { BtForm, submit } = useForm({
	data: {},
	options: (formData: any) =>
		computed(() => [
			...configList.value.map((item: any) => {
				return {
					type: 'input',
					label: item.name,
					key: item.name,
					attrs: {
						width: '30rem',
					},
				}
			}),
			{
				type: 'help',
				options: [{ content: props.compData.ps }, { content: props.compData.help }],
			},
		]),
	submit: async (param: any, validate: AnyFunction) => {
		await validate()
		let params = configList.value.map((item: any) => {
			return {
				...item,
				value: param.value[item.name],
			}
		})
		return await submitDnsVerify(params)
	},
})

defineExpose({
	onConfirm: submit,
})
</script>
