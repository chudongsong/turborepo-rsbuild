<template>
	<div class="p-[2rem]">
		<BtForm />
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormCheckbox, FormHelp, FormButton } from '@form/form-item'
import { useClbHttpStore } from '../useStore'
import { extractStatusCodes, HttpSeetingEvent } from '../useController'
const { httpRowData } = useClbHttpStore()

const errorOptions = ref<any[]>([
	{ label: '500 - 服务器错误', value: '500' },
	{ label: '502 - 网关错误', value: '502' },
	{ label: '503 - 服务不可用', value: '503' },
	{ label: '504 - 网关超时', value: '504' },
	{ label: '404 - 页面未找到', value: '404' },
	{ label: '403 - 禁止访问', value: '403' },
	{ label: '429 - 请求过多', value: '429' },
])
const { BtForm, submit } = useForm({
	data: () => ({
		errorCodes: extractStatusCodes(httpRowData.value?.http_config.proxy_next_upstream) || [500, 502, 503, 504],
	}),
	options: () => {
		return computed(() => [
			FormCheckbox('错误状态码（多选）', 'errorCodes', errorOptions.value, {
				attrs: { class: 'flex flex-col gap-2' }
			}),
			FormButton('保存', { attrs: { class: '!mt-[1.6rem] !ml-[12rem]',type: 'primary', onClick: submit } }),
			FormHelp('', [{ content: '*错误状态码: 当后端节点返回的http状态码在错误状态码中时，该节点将会被视为处理失败' }])
		])
	},
	submit: async (param: any, validate: any) => {
		await validate()
		let { load_id} = httpRowData.value
		return await HttpSeetingEvent({ load_id, http_codes: `[${param.value.errorCodes}]` })
	}
})
defineExpose({ onConfirm: submit })
</script>
