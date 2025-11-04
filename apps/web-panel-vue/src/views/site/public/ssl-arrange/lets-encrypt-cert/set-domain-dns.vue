<template>
	<BtForm class="p-2rem">
		<template #dns>
			<el-form-item label="验证类型" prop="dns_id" class="!m-0">
				<el-select v-model="param.dns_id" class="!w-[33rem]" filterable default-first-option placeholder="请选择验证类型">
					<template #empty>
						<p class="el-select-dropdown__empty">
							<span>暂无数据，请先添加DNS接口</span>
							<bt-link class="!text-base" @click="dnsSettingDialog">>>添加</bt-link>
						</p>
					</template>
					<el-option v-for="item in dnsList" :key="item.id" :label="item.dns_name" :value="item.id">
						<div class="flex items-center justify-between">
							<span>{{ item.dns_name }}</span>
							<span class="text-[#8492a6]">{{ item.ps }}</span>
						</div>
					</el-option>
				</el-select>
			</el-form-item>
		</template>
	</BtForm>
</template>

<script setup lang="ts">
import { useDialog, useForm } from '@/hooks/tools'
import { defaultVerify } from '@/utils'
import { dnsList, getDnsDataList, setDomainDNSEvent } from './useController'

const props = defineProps({
	compData: {
		type: Object,
		default: () => {},
	},
})

const { BtForm, submit, param } = useForm({
	data: { dns_id: '', ids: [props.compData.row.root_domain_id] },
	options: (formData: any) =>
		computed(() => [
			{
				type: 'slots',
				key: 'dns',
				rules: {
					dns_id: [defaultVerify({ message: '请选择验证类型' })],
				},
			},
		]),
	submit: async (param: any, validate: any) => {
		await validate()
		return await setDomainDNSEvent(param.value)
	},
})

const dnsSettingDialog = () => {
	useDialog({
		isAsync: true,
		title: `DNS接口设置`,
		area: 70,
		component: () => import('@domain/views/domain-manger/global-DNS/index.vue'),
		onCancel: () => getDnsDataList(),
	})
}

defineExpose({
	onConfirm: submit,
})

const emits = defineEmits(['close'])

onMounted(getDnsDataList)
</script>

<style scoped></style>
