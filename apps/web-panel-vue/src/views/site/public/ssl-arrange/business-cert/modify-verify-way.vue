<template>
	<BtForm class="p-[1.5rem]" />
	<!-- <div class="p-[1.5rem]">
		<el-form class="mb-[20px]">
			<el-form-item label="验证方式">
				<bt-select
					v-model="form.dcvMethod"
					:change="handleMethod"
					:options="verifyTypeOptions"
					class="!w-[36rem]" />
			</el-form-item>
		</el-form>

		<bt-help :options="helpList" class="ml-[20px] mt-[12px]"></bt-help>
	</div> -->
</template>
<script setup lang="ts">
import { useForm } from '@/hooks/tools'
import { onConfirm } from './useOtherController'

const props = defineProps({
	compData: {
		type: Object,
		default: () => ({}),
	},
})


const { BtForm, submit } = useForm({
	data: {
		dcvMethod: 'HTTP_CSR_HASH',
	},
	options: (formData: any) =>
		computed(() => [
			{
				type: 'select',
				label: '验证方式',
				key: 'dcvMethod',
				options: [
					{ label: '文件验证(HTTP)', value: 'HTTP_CSR_HASH' },
					{ label: '文件验证(HTTPS)', value: 'HTTPS_CSR_HASH' },
					...(props.compData.isIp ? [] : [{ label: 'DNS验证(CNAME解析)', value: 'CNAME_CSR_HASH' }]),
				],
				attrs: {
					style: 'width: 36rem;',
				},
			},
			{
				type: 'help',
				options: [
					{
						content: '文件验证（HTTP）：确保网站能够通过http正常访问',
					},
					{
						content: '文件验证（HTTPS）：确保网站已开启https，并且网站能够通过https正常访问',
					},
					{
						isHtml: true,
						content: 'DNS验证：需要手动解析DNS记录值</li><li style="color:red">注意：20分钟内仅允许更换一次，频繁更换会延长申请时间',
					},
				],
			},
		]),
	submit: onConfirm,
})

defineExpose({
	onConfirm: submit,
})

const emits = defineEmits(['close'])
</script>
