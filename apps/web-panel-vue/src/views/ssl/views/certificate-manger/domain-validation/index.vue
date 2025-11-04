<template>
	<div class="p-[5rem]">
		<!-- 域名展示 -->
		<div class="text-base mb-[2rem]">
			请给以下域名【
			<span class="text-primary">{{ domains }}</span>
			】
			<template v-if="wayType === 'CNAME_CSR_HASH'"> 添加“{{ param.dnsType }}”解析，解析参数如下： </template>
			<template v-else>添加验证文件，验证信息如下：</template>
		</div>
		<BtForm class="mb-[20px]" />
		<bt-table v-if="wayType !== 'CNAME_CSR_HASH'" :column="tableColumn" :data="urlTableData"></bt-table>

		<bt-help :options="helpList" class="ml-[20px] mt-[12px]"></bt-help>

		<!-- 验证方式 -->
		<div class="mt-[20px]">
			<el-button type="primary" @click="verifyDomainEvent()">验证域名</el-button>
			<el-button type="default" @click="setVerifyType(emits('close'))"> 修改验证方式 </el-button>
			<el-button
				type="default"
				@click="
					() => {
						emits('close')
					}
				"
				>返回列表</el-button
			>
		</div>
	</div>
</template>
<script setup lang="tsx">
import BtFormItem from '@/components/form/bt-form-item'
import BtInput from '@/components/form/bt-input'
import { useForm } from '@/hooks/tools'
import { copyText } from '@/utils'
import { ElButton } from 'element-plus'
import { domains, helpList, initCertData, setVerifyType, urlTableData, verifyDomain, wayType } from '@site/public/ssl-arrange/business-cert/useCertController'
import { tableColumn } from '@site/public/ssl-arrange/business-cert/useOtherController'
import { getSslStore } from '@ssl/useStore'
import { useCertificateStore } from '@ssl/views/certificate-manger/useStore'

const { activeTabs, sslIsRefresh, testIsRefresh, encryptIsRefresh, otherIsRefresh } = storeToRefs(useCertificateStore())

/**
 * @description 复制
 * @param {string} value 复制的值
 */
const copyPaw = (value: string) => {
	copyText({ value })
}

const { BtForm, param } = useForm({
	data: initCertData,
	options: (formData: any) =>
		computed(() => [
			...(wayType.value === 'CNAME_CSR_HASH'
				? [
						{
							type: 'custom',
							render: () => (
								<BtFormItem label="主机记录：">
									<BtInput v-model={formData.value.dnsHost} class="!w-[36rem] mr-[1rem]" type="text" readonly />
									<ElButton type="primary" onClick={() => copyPaw(formData.value.dnsHost)}>
										复制
									</ElButton>
								</BtFormItem>
							),
						},
						{
							type: 'input',
							label: '记录类型：',
							key: 'dnsType',
							attrs: {
								width: '36rem',
								readonly: true,
							},
						},
						{
							type: 'custom',
							render: () => (
								<BtFormItem label="记录值：">
									<div class="flex">
										<BtInput v-model={formData.value.dnsValue} class="!w-[36rem] mr-[1rem]" type="textarea" rows={3} readonly />
										<ElButton type="primary" onClick={() => copyPaw(formData.value.dnsValue)} class="align-top">
											复制
										</ElButton>
									</div>
								</BtFormItem>
							),
						},
				  ]
				: [
						{
							type: 'custom',
							render: () => (
								<BtFormItem label="文件位置：">
									<BtInput v-model={formData.value.filePath} class="!w-[36rem] mr-[1rem]" type="text" readonly />
									<ElButton type="primary" onClick={() => copyPaw(formData.value.filePath)}>
										复制
									</ElButton>
								</BtFormItem>
							),
						},
						{
							type: 'custom',
							render: () => (
								<BtFormItem label="文件名：">
									<BtInput v-model={formData.value.fileName} class="!w-[36rem] mr-[1rem]" type="text" readonly />
									<ElButton type="primary" onClick={() => copyPaw(formData.value.fileName)}>
										复制
									</ElButton>
								</BtFormItem>
							),
						},
						{
							type: 'custom',
							render: () => (
								<BtFormItem label="记录值：">
									<div class="flex">
										<BtInput v-model={formData.value.fileContent} class="!w-[36rem] mr-[1rem]" type="textarea" rows={3} readonly />
										<ElButton type="primary" onClick={() => copyPaw(formData.value.fileContent)} class="align-top">
											复制
										</ElButton>
									</div>
								</BtFormItem>
							),
						},
				  ]),
		]),
})

const emits = defineEmits(['close'])

const verifyDomainEvent = async () => {
	await verifyDomain()
	const refreshMap = {
		ssl: () => (sslIsRefresh.value = true),
		test: () => (testIsRefresh.value = true),
		encrypt: () => (encryptIsRefresh.value = true),
		other: () => (otherIsRefresh.value = true),
	} as const
	refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
	emits('close')
}
</script>
