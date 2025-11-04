<template>
	<BtForm class="p-2rem" />
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { submitErrorRedirect } from './useController'

interface Props {
	compData: AnyObject
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const { BtForm, submit } = useForm({
	data: () => {
		if (props.compData.rowData) {
			const { type, errorpage, redirecttype, topath, tourl } = props.compData.rowData
			return {
				type: type === 1,
				errorpage: String(errorpage),
				redirecttype,
				topath,
				tourl,
			}
		}
		return {
			type: true,
			errorpage: '1',
			redirecttype: '301',
			topath: '/',
			tourl: '',
		}
	},
	options: (formData: Ref<AnyObject>) => {
		return computed(() => [
			{ type: 'switch', label: '开启重定向', key: 'type' },
			{
				type: 'select',
				label: '错误类型',
				key: 'errorpage',
				options: [{ label: '页面404', value: '1' }],
				attrs: {
					style: 'width: 16rem',
				},
			},
			{
				type: 'select',
				label: '重定向方式',
				key: 'redirecttype',
				options: [
					{ label: '301（永久重定向）', value: '301' },
					{ label: '302（临时重定向）', value: '302' },
				],
				attrs: {
					style: 'width: 16rem',
				},
			},
			{
				type: 'select',
				label: '404错误重定向',
				key: 'topath',
				options: [
					{ label: '首页', value: '/' },
					{ label: '自定义', value: '' },
				],
				attrs: {
					style: 'width: 16rem',
					'empty-values': [null, undefined],
				},
			},
			...(formData.value.topath === ''
				? [
						{
							type: 'input',
							label: '重定向至',
							key: 'tourl',
							attrs: {
								width: '24rem',
								placeholder: '例:http://www.bt.cn.com',
							},
							rules: [{ required: true, message: '请输入重定向地址', trigger: 'blur' }],
						},
				  ]
				: []),
		])
	},
	submit: async (param: Ref<T>, validator: () => Promise<'closed' | true>) => {
		await validator()
		return await submitErrorRedirect(param.value)
	},
})

defineExpose({
	onConfirm: submit,
})
</script>
