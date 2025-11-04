<template>
	<BtForm class="p-2rem">
		<template #domain>
			<el-form-item label="域名">
				<div class="p-[12px] border-[1px] w-[50rem] h-[22rem] flex flex-col overflow-auto rounded-small border-light checkGroup">
					<el-checkbox-group class="flex flex-col" v-model="param.checkList">
						<div class="flex flex-col" v-for="(item, index) in domains" :key="index">
							<el-checkbox class="w-full !mx-0 mb-[4px] overflow-hidden" :value="item" :key="item" border>
								<div class="w-[41rem] flex items-center justify-between">
									<span>{{ item }}</span>
									<el-button v-if="!menuData?.row.dns_id && !form.auth_to" type="primary" size="small" class="ml-auto"> 配置DNS </el-button>
								</div>
							</el-checkbox>
						</div>
					</el-checkbox-group>
				</div>
			</el-form-item>
		</template>
	</BtForm>
	<bt-dialog v-model="verifyDialog" :area="70" :title="`手动解析TXT记录`">
		<div class="p-[1.5rem]">
			请按以下列表做TXT解析:
			<span class="ml-[.4rem] text-danger">{{ errorMsg }}</span>
			<bt-table-group>
				<template #content>
					<div class="max-h-[38rem] overflow-auto">
						<template v-for="(item, index) in newTableData">
							<div v-if="item.data.length" :key="index">
								<span>验证域名：{{ item.domain }}</span>
								<bt-table class="my-[1rem]" :column="verifyTableColumns" :data="item.data"></bt-table>
								<div v-if="isError" class="flex justify-end">
									<el-button type="default" @click="verifySeparatelyEvent(item)">验证</el-button>
								</div>
							</div>
						</template>
					</div>
				</template>

				<template #footer-right>
					<el-button v-if="!isError" type="default" @click="handleVerifyEvent">验证</el-button>
				</template>
			</bt-table-group>
			<bt-help :list="tableHelpList" listStyle="disc" class="ml-[20px]" />
		</div>
	</bt-dialog>
</template>
<script lang="tsx" setup>
import BtFormItem from '@/components/form/bt-form-item'
import { closeAllDialog, useForm } from '@/hooks/tools'
import { ElCheckbox } from 'element-plus'
import { router } from '@/router'
import { domains, form, getLetsDomainData, onSubmitLetCert, newTableData, isError, errorMsg, verifySeparatelyEvent, verifyDialog, popupClose, verifyTableColumns, tableHelpList, handleVerifyEvent, resetForm } from './useController'
import { MAIL_DOMAIN_SSL } from './store'

const mailDomainSSL = MAIL_DOMAIN_SSL()
const { menuData } = storeToRefs(mailDomainSSL)
popupClose.value = inject<any>('popupClose')

const letsEncryptHelpDnsList = ref([
	{ content: '如开启后无法使用HTTPS访问，请检查安全组是否正确放行443端口' },
	{
		content: () => {
			return (
				<span>
					在DNS验证中，我们提供了多种自动化DNS-API，并提供了手动模式-
					<span
						class="bt-link"
						onClick={() => {
							closeAllDialog()
							router.push({ name: 'domain' })
						}}>
						点击添加DNS接口
					</span>
				</span>
			)
		},
	},
	{ content: '使用DNS接口申请证书可自动续期，手动模式下证书到期后需重新申请' },
])

const { BtForm, submit, param } = useForm({
	data: form,
	options: (formData: any) =>
		computed(() => [
			{
				type: 'radio',
				label: '验证方法',
				key: 'resource',
				options: [{ label: 'DNS验证(支持通配符)', value: '1' }],
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label=" ">
						<ElCheckbox v-model={formData.value.auth_to}> 手动解析 </ElCheckbox>
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
			{ type: 'help', options: letsEncryptHelpDnsList.value },
		]),
	submit: async (param: Ref<T>) => {
		return await onSubmitLetCert(param)
	},
})

onMounted(() => {
	resetForm()
	getLetsDomainData()
})
</script>
<style lang="scss" scoped></style>
