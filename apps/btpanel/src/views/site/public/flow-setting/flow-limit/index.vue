<template>
	<div class="h-full" :class="{ 'p-2rem': isMult }">
		<template v-if="isBindExtranet">
			<bt-install-mask v-if="maskLayerLimit" width="36rem">
				<template #content>
					{{ maskTip }}
				</template>
			</bt-install-mask>
			<BtForm />
		</template>
		<div class="bg-light flex items-center justify-center min-h-[60rem]" v-else>
			<div class="bg-lighter px-[48px] py-[16px] text-default flex">
				请开启
				<span class="mx-[.4rem] bt-link" @click="jumpTabEvent('mapping')"> 外网映射 </span>
				后查看流量限制
			</div>
		</div>
	</div>
</template>

<script setup lang="tsx">
import BtFormItem from '@/components/form/bt-form-item'
import BtInput from '@/components/form/bt-input'
import { useForm } from '@/hooks/tools'

import { SITE_STORE, useSiteStore } from '@site/useStore'
import { ElButton, ElCheckbox } from 'element-plus'
import { handleCheckChange, initFlowLimit, onConfirmLimit, planList } from '../useController'
import { isMult, maskLayerLimit, maskTip } from '../useController'

const { isBindExtranet, siteInfo } = useSiteStore()
const { jumpTabEvent } = SITE_STORE()

const { BtForm, submit } = useForm({
	data: initFlowLimit,
	options: (formData: any) =>
		computed(() => [
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="是否启用">
						<ElCheckbox v-model={formData.value.value} onChange={(val: any) => handleCheckChange(val, formData.value)}>
							启用流量控制
						</ElCheckbox>
					</BtFormItem>
				),
			},
			{
				type: 'select',
				label: '限制方案',
				key: 'type',
				options: planList.value,
				attrs: {
					style: 'width: 24rem;',
					onChange: (val: any) => {
						const { perserver, perip, limit_rate } = planList.value[val].items
						formData.value.perserver = perserver
						formData.value.perip = perip
						formData.value.limit_rate = limit_rate
					},
				},
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="并发限制" prop="perserver">
						<BtInput v-model={formData.value.perserver} type="number" width="24rem" class="mr-1rem"></BtInput>
						<div class="text-tertiary text-small">* 限制当前站点最大并发数</div>
					</BtFormItem>
				),
				rules: {
					perserver: [
						{ required: true, message: '请输入并发限制', trigger: 'blur' },
						{
							validator: (rule: any, value: any, callback: any) => {
								if (value > 65535) callback(new Error('不能大于65535'))
								if (!Number.isInteger(value * 1)) callback(new Error('输入必须为整数'))
								else callback()
							},
						},
					],
				},
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="单IP限制" prop="perip">
						<BtInput v-model={formData.value.perip} type="number" width="24rem" class="mr-1rem"></BtInput>
						<span class="text-tertiary text-small">* 限制单个IP访问最大并发数</span>
					</BtFormItem>
				),
				rules: {
					perip: [
						{ required: true, message: '请输入单IP限制', trigger: 'blur' },
						{
							validator: (rule: any, value: any, callback: any) => {
								if (value > 65535) callback(new Error('不能大于65535'))
								if (!Number.isInteger(value * 1)) callback(new Error('输入必须为整数'))
								else callback()
							},
						},
					],
				},
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="流量限制" prop="limit_rate">
						<BtInput v-model={formData.value.limit_rate} type="number" width="24rem" class="mr-1rem"></BtInput>
						<span class="text-tertiary text-small">* 限制每个请求的流量上限（单位：KB）</span>
					</BtFormItem>
				),
				rules: {
					limit_rate: [
						{ required: true, message: '请输入流量限制', trigger: 'blur' },
						{
							validator: (rule: any, value: any, callback: any) => {
								if (!Number.isInteger(value * 1)) callback(new Error('输入必须为整数'))
								else callback()
							},
						},
					],
				},
			},
			...(siteInfo.value?.id && !isMult.value
				? [
						{
							type: 'custom',
							render: () => (
								<BtFormItem label=" ">
									<ElButton type="primary" onClick={submit}>
										{formData.value.value ? '保存' : '保存并启用'}
									</ElButton>
								</BtFormItem>
							),
						},
				  ]
				: []),
		]),
	submit: async (param: Ref<T>, validate: () => Promise<'closed' | true>) => {
		await validate()
		return await onConfirmLimit(param.value)
	},
})

defineExpose({
	onConfirm: submit,
})
</script>
