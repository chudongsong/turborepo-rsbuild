<template>
	<BtForm class="p-2rem">
		<template #domain>
			<el-form-item label="域名">
				<div class="p-[12px] border-[1px] w-[50rem] h-[22rem] flex flex-col overflow-auto rounded-default border-lighter checkGroup">
					<el-checkbox :indeterminate="isIndeterminate" class="w-full mb-[6px] !border-none !p-[1rem]" v-model="param.checkAll" @change="handleCheckAllChange" border> 全选 </el-checkbox>
					<el-checkbox-group class="flex flex-col" v-model="param.checkList" @change="handleCheckedDomainChange">
						<el-popover placement="top" effect="dark" trigger="hover" width="280" v-for="site in domains" :disabled="site.apply_ssl === 1" :key="site.name">
							<template #default>
								<div class="flex flex-col">
									<span>Let's Encrypt证书不支持申请IP证书</span>
									<span>请选择【商用证书】的多域名SSL证书申请</span>
								</div>
							</template>
							<template #reference>
								<el-checkbox class="w-full !mx-0 mb-[6px] overflow-hidden" :disabled="site.apply_ssl === 0" :value="site.name" :key="site.name" border>
									<div class="w-[41rem] flex items-center justify-between">
										<span>{{ site.name }}</span>
										<el-button v-if="param.resource === '1' && site.dns_status === 0 && !param.auth_to && !isIpAddress(site.name)" type="primary" size="small" class="ml-auto" @click="dnsStatusDialog(site)"> 配置DNS </el-button>
									</div>
								</el-checkbox>
							</template>
						</el-popover>
					</el-checkbox-group>
				</div>
			</el-form-item>
		</template>
	</BtForm>
</template>

<script setup lang="tsx">
import BtFormItem from '@/components/form/bt-form-item'
import { useForm } from '@/hooks/tools'
import { getSslDnsApiInfo } from '@site/public/ssl-arrange/useController'
import { ElCheckbox } from 'element-plus'

import { isIpAddress, dnsStatusDialog, form, $resetLetsForm, dnsVerify, domains, getLetsSiteData, handleCheckAllChange, handleCheckedDomainChange, isIndeterminate, letsEncryptHelpList, onSubmitLetCert, isRenew } from './useController'

interface Props {
	compData: {
		isRenew?: boolean
	}
}

const props = withDefaults(defineProps<Props>(), {})
const { compData } = toRefs(props)

const { BtForm, submit, param } = useForm({
	data: form,
	options: (formData: any) =>
		computed(() => [
			{
				type: 'radio',
				label: '验证方法',
				key: 'resource',
				options: [
					{ label: '文件验证', value: '0' },
					{ label: 'DNS验证(支持通配符)', value: '1' },
				],
			},
			...(formData.value.resource === '1'
				? [
						{
							type: 'custom',
							render: () => (
								<BtFormItem label=" ">
									<ElCheckbox v-model={formData.value.auth_to}>手动解析</ElCheckbox>
								</BtFormItem>
							),
						},
						{
							type: 'custom',
							render: () => (
								<BtFormItem label=" ">
									<ElCheckbox v-model={formData.value.autoWildcard}>自动组合泛域名</ElCheckbox>
									<div class="text-small">* 如需申请通配符域名请勾选此项，且不要在下方域名列表中选中泛域名</div>
								</BtFormItem>
							),
						},
				  ]
				: []),
			{ type: 'slots', key: 'domain' },
			{
				type: 'custom',
				render: () => (
					<BtFormItem label=" ">
						<el-button type="primary" onClick={() => submit()}>
							申请证书
						</el-button>
					</BtFormItem>
				),
			},
			{ type: 'help', options: letsEncryptHelpList.value },
		]),
	submit: async (param: Ref<T>) => {
		return await onSubmitLetCert(param)
	},
})

defineExpose({ onConfirm: submit })

onMounted(async () => {
	dnsVerify.value = 'dns'
	if (props.compData?.isRenew) {
		isRenew.value = true
	}
	await getLetsSiteData()
	await getSslDnsApiInfo()
})

onUnmounted($resetLetsForm)
</script>

<style lang="css" scoped>
.ssl-status-info {
	@apply flex justify-between flex-1 py-[16px] px-[32px] bg-[#f5faf2];
	margin-bottom: 8px;
	border-radius: 4px;
	border: 1px solid #eaf1f2;
}

.ssl-status-info .left > div,
.ssl-status-info .right > div {
	@apply flex items-center mb-[4px] h-[2rem] lining-[2rem];
}

.ssl-status-info .left div > span:first-child,
.ssl-status-info .right div > span:first-child {
	@apply font-bold text-medium text-small;
}

.checkGroup :deep(.el-checkbox__label) {
	@apply text-small;
}
</style>
