<template>
	<div class="px-3rem py-1.2rem">
		<BtForm label-width="80px">
			<template #domains>
				<el-form-item label="域名" prop="domains">
					<div class="flex flex-col">
						<el-popover ref="popover" placement="top-start" popper-class="green-tips-popover" title="" width="200" :disabled="!isMulti" v-model:visible="popoverFocus" :trigger-keys="[]" trigger="focus">
							<div class="bg-primary text-white" v-html="sslDomainsTips"></div>
							<template #reference>
								<bt-input v-model="param.domains" :disabled="!isMulti" width="42rem" resize="none" :rows="3" class="disabled-input" :type="isMulti ? 'textarea' : 'text'" @focus="popoverFocus = true" :placeholder="sslDomainsTips" />
							</template>
						</el-popover>

						<div v-show="!isMulti">
							<el-button size="small" type="primary" @click="selectExistDomain">选择已有域名</el-button>
							<el-button size="small" type="default" @click="selectCustomDomain">自定义域名</el-button>
						</div>
					</div>
				</el-form-item>
			</template>
			<template #sslVerifyType>
				<BtFormItem label="验证方式">
					<el-radio-group class="!leading-[2.4rem]" v-model="sslVerifyType">
						<template v-for="item in sslVerifyTypeList" :key="item.value">
							<el-tooltip v-if="getCertVerifyMode(isWildcard, isIp, item)" :key="item.value" effect="dark" :content="item.tips" placement="top-start" :enterable="false">
								<el-radio :value="item.value">
									<span class="mr-[2px]">{{ item.label }}</span>
									<span v-if="item.isCheck !== ''" class="cursor-pointer" :class="item.isCheck ? '!text-primary' : '!text-danger'" @click.stop="showCheckResult(item.checkTips)"> [{{ item.isCheck ? '正常' : '异常' }}] </span>
									<span v-if="checkDomainMethod" class="!caret-medium inline-flex items-center">
										[
										<i class="svgtofont-el-loading mx-[2px]"></i>
										<span class="align-middle">检测中</span> ]
									</span>
								</el-radio>
							</el-tooltip>
						</template>
					</el-radio-group>
				</BtFormItem>
			</template>
			<template #dnsVerify>
				<BtFormItem label="选择DNS接口">
					<el-select class="mr-[16px] !w-[16rem]" v-model="dnsVerify" placeholder="请选择" @change="setSslDnsApi(true)">
						<el-option v-for="item in sslDnsApiInfo" :key="item.value" :label="item.label" :value="item.value">
							<span class="flex justify-between">
								<span>{{ item.label }}</span>
								<span v-show="item.config" :class="!item.data ? 'text-warning' : 'text-primary'">
									{{ !item.data ? '[未配置]' : '[已配置]' }}
								</span>
							</span>
						</el-option>
					</el-select>
					<el-button v-show="dnsVerify !== 'dns'" class="ml-[8px]" type="default" @click="setSslDnsApi(false)">配置</el-button>
				</BtFormItem>
			</template>
		</BtForm>
		<bt-dialog v-model="submitPopup" :area="50">
			<div class="flex flex-col p-[20px] error">
				<span class="flex items-center mb-[12px]">
					<i class="svgtofont-el-warning text-warning text-titleLarge mr-[4px]"></i>
					<span class="text-medium">当前提交信息存在以下问题，请解决后重新提交！</span>
				</span>
				<el-table :data="errorData" border>
					<el-table-column prop="field" label="错误字段"> </el-table-column>
					<el-table-column prop="error" label="错误信息"> </el-table-column>
				</el-table>
			</div>
		</bt-dialog>
		<bt-dialog title="选择域名" v-model="selectExistDomainPopup" :area="57" :show-footer="true" @confirm="selectExistDomainConfirm">
			<div class="p-[20px]">
				<el-input class="!w-[53rem] mb-[16px]" v-model="existDomainSerach" placeholder="支持字段模糊搜索" @input="serachExistDomain" clearable />
				<div class="mb-[8px] border-light">
					<div class="flex justify-between items-center bg-light py-[1rem] pl-[1rem]">域名</div>
					<BtRadio v-model="existDomainActive" :options="existDomainList" class="custom-radio-group whitespace-nowrap py-[2px] w-full" />
				</div>
				<bt-help :options="addDomainHelp" class="ml-[20px]" />
			</div>
		</bt-dialog>
		<bt-dialog title="自定义域名" v-model="customDomainPopup" :area="57" :show-footer="true" @confirm="submitCustomDomain">
			<div class="p-[20px]">
				<el-form class="mb-[16px]" ref="customDomainRef" :model="customDomainForm" :rules="customRules">
					<el-form-item label="自定义域名" prop="domain">
						<el-input autofocus class="!w-[40rem] mb-[8px]" v-model="customDomainForm.domain" :placeholder="`请输入需要申请证书的${isIp ? 'IP（IP证书）' : '域名（单域名证书）'}，必填项，例如：${isIp ? '192.168.1.1' : 'www.bt.cn'}`" />
					</el-form-item>
				</el-form>
				<bt-help :options="addDomainHelp" class="ml-[20px]" />
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
// import BtHelp from '@/components/base/bt-help';
import BtFormItem from '@/components/form/bt-form-item'
import BtInput from '@/components/form/bt-input'
import BtRadio from '@/components/form/bt-radio'
import { Message, useDialog, useForm } from '@/hooks/tools'
import { FormMore } from '@/hooks/tools/form/form-item'
import { defaultVerify, isObject, checkIp } from '@/utils'
import { SITE_STORE } from '@/views/site/useStore'
import InputPopover from '@site/public/ssl-arrange/public/input-popover.vue'
import { ElButton, ElPopover } from 'element-plus'
import { getSslDnsApiInfo } from '@site/public/ssl-arrange/useController'
import { SITE_SSL_STORE, useSiteSSLStore } from '@site/public/ssl-arrange/useStore'
import {
	addDomainHelp,
	dnsVerify,
	existDomainActive,
	existDomainList,
	existDomainSerach,
	form,
	isMulti,
	isNotDvHelp,
	isWildcard,
	isIp,
	selectCustomDomain,
	selectExistDomain,
	selectExistDomainPopup,
	serachExistDomain,
	setSslDnsApi,
	sslDomainsTips,
	sslInfoHandle,
	sslVerifyHelp,
	sslVerifyType,
	sslVerifyTypeList,
	userBaseShow,
	submitPopup,
	errorData,
	selectExistDomainConfirm,
	customDomainPopup,
	customDomainRef,
	customDomainForm,
	customRules,
	submitCustomDomain,
	checkDomainMethod,
	getCertVerifyMode,
} from '@site/public/ssl-arrange/business-cert/useCertController'
import { applyBusSsl } from '@/api/site'
import { certVerifyWay } from '../useMethod'
import { useCertificateStore } from '@ssl/views/certificate-manger/useStore'

const { activeTabs, sslIsRefresh, testIsRefresh, encryptIsRefresh, otherIsRefresh } = storeToRefs(useCertificateStore())

const { orderInfo, sslDnsApiInfo, sslApplicationInfo } = useSiteSSLStore()
const { verifyBusCertEvent, getCertAdminInfoEvent } = SITE_SSL_STORE()
const emit = defineEmits(['close'])
const props = defineProps<{
	compData: any
}>()

const { BtForm, param } = useForm({
	data: form.value,
	options: (formData: any) =>
		computed(() => [
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="证书信息">
						<span class="text-primary">
							<span>{orderInfo.value.title}</span>
							<span v-show={orderInfo.value.limit > 1}>，包含{orderInfo.value.limit}个域名</span>
						</span>
					</BtFormItem>
					// {/* onFocus={(popoverFocus = true)} */}
				),
			},
			{
				type: 'slots',
				key: 'domains',
				rules: {
					domains: [defaultVerify({ message: '域名不能为空' })],
				},
			},
			{
				type: 'slots',
				key: 'sslVerifyType',
			},
			...(sslVerifyType.value === 'CNAME_CSR_HASH'
				? [
						{
							type: 'slots',
							key: 'dnsVerify',
						},
				  ]
				: []),
			FormMore(userBaseShow, '证书用户信息'),
			...(userBaseShow.value
				? [
						{
							type: 'custom',
							render: () => {
								return (
									<BtFormItem label="所在地区">
										<div class="flex flex-row">
											<InputPopover custom-class="mr-[16px] !w-[20rem]" v-model={formData.value.Administrator.state} placeholder-tips="请输入所在省份，必填项" />
											<InputPopover custom-class="!w-[20rem]" v-model={formData.value.Administrator.city} placeholder-tips="请输入所在市/县，必填项" />
										</div>
									</BtFormItem>
								)
							},
						},
						...(orderInfo.value.type !== 'dv'
							? [
									{
										type: 'custom',
										render: () => {
											return (
												<BtFormItem label="公司详细地址">
													<InputPopover custom-class="!w-[42rem]" v-model={formData.value.Administrator.address} placeholder-tips="请输入公司详细地址，具体要求见说明，必填项" />
												</BtFormItem>
											)
										},
									},
							  ]
							: []),
						{
							type: 'custom',
							render: () => {
								return (
									<BtFormItem label="公司名称">
										<InputPopover custom-class="!w-[42rem]" v-model={formData.value.Administrator.organation} placeholder-tips="请输入公司名称，如为个人申请请输入个人姓名，必填项" />
									</BtFormItem>
								)
							},
						},
						{
							type: 'custom',
							render: () => {
								return (
									<BtFormItem label="姓名">
										<InputPopover custom-class="!w-[42rem]" v-model={formData.value.Administrator.name} placeholder-tips="请输入姓名，必填项" />
									</BtFormItem>
								)
							},
						},
						{
							type: 'custom',
							render: () => {
								return (
									<BtFormItem label="邮箱">
										<InputPopover custom-class="!w-[42rem]" v-model={formData.value.Administrator.email} placeholder-tips="请输入邮箱地址，必填项" />
									</BtFormItem>
								)
							},
						},
						{
							type: 'custom',
							render: () => {
								return (
									<BtFormItem label="手机">
										<InputPopover custom-class="!w-[42rem]" v-model={formData.value.Administrator.mobile} placeholder-tips="请输入手机号码，若为空，则使用当前绑定手机号" />
									</BtFormItem>
								)
							},
						},
				  ]
				: []),
			{
				type: 'custom',
				render: () => (
					<BtFormItem label=" ">
						<ElButton type="primary" onClick={sslInfoSubmit}>
							提交资料
						</ElButton>
					</BtFormItem>
				),
			},
			{ type: 'help', options: sslVerifyHelp.value },
		]),
})

const popoverFocus = ref(false) // 域名popover

// 证书申请信息
// const form = ref({
//   domains: '',
//   dcvMethod: '',
//   auth_to: '',
//   Administrator: {
//     address: '',
//     city: '',
//     country: '',
//     email: '',
//     firstName: '',
//     lastName: '',
//     job: '',
//     name: '',
//     mobile: '',
//     organation: '',
//     postCode: '',
//     state: '',
//   },
// });

/**
 * @description 显示验证错误结果
 */
const showCheckResult = (item: string[]) => {
	Message.msg({
		customClass: 'el-error-html-message',
		dangerouslyUseHTMLString: true,
		message: item.join('<br>'),
		type: 'error',
	}) // 提示错误信息
}

const resetForm = () => {
	form.value.domains = ''
	checkDomainMethod.value = false
	sslVerifyTypeList.value = [
		{
			value: 'CNAME_CSR_HASH',
			label: 'DNS验证(CNAME解析)',
			tips: '如网站还未备案完成，可选【DNS验证】',
			isCheck: '',
			checkTips: [],
		},
		{
			value: 'HTTP_CSR_HASH',
			label: '文件验证(HTTP)',
			tips: '如网站未开启301、302、强制HTTPS、反向代理功能，请选择HTTP',
			isCheck: '',
			checkTips: [],
		},
		{
			value: 'HTTPS_CSR_HASH',
			label: '文件验证(HTTPS)',
			tips: '如网站开启【强制HTTPS】，请选【HTTPS验证】',
			isCheck: '',
			checkTips: [],
		},
	]
}

/**
 * @description 证书信息提交
 */
const sslInfoSubmit = async () => {
	let load = null
	if (!form.value.domains) {
		return Message.error('域名不能为空')
	}
	if (isIp.value) {
		// 如果是IP证书，则需要验证domains是否为ipv4
		if (!checkIp(form.value.domains)) {
			return Message.error('IP证书申请域名格式错误，请输入正确的ipv4地址')
		}
	}
	if (!form.value.Administrator.state && !form.value.Administrator.city) {
		return Message.error('所在地区不能为空')
	}
	if (!form.value.Administrator.address && orderInfo.value.type !== 'dv') {
		return Message.error('公司详细地址不能为空')
	}
	if (!form.value.Administrator.organation) {
		return Message.error('公司名称不能为空')
	}
	if (!form.value.Administrator.name) {
		return Message.error('姓名不能为空')
	}
	if (!form.value.Administrator.email) {
		return Message.error('邮箱不能为空')
	}
	if (!form.value.Administrator.mobile) {
		return Message.error('手机不能为空')
	}
	try {
		load = Message.load('正在提交证书信息，请稍后...')
		const { job, postCode, country, firstName, lastName, name, state, city, address, organation, email, mobile } = form.value.Administrator
		const res = await applyBusSsl(
			JSON.stringify({
				pid: orderInfo.value.pid,
				cert_ssl_type: props.compData.orderInfo.cert_ssl_type,
				oid: orderInfo.value.oid,
				domains: form.value.domains?.split('\n').filter((item: string) => item.trim()),
				dcvMethod: sslVerifyType.value,
				auth_to: dnsVerify.value,
				Administrator: {
					job,
					postCode,
					country,
					lastName: name,
					state,
					city,
					address,
					organation,
					email,
					mobile,
				},
			})
		)

		if (isObject(res.data.msg) && res.data.msg.hasOwnProperty('code')) {
			let errors = res.data.errors
			errorData.value = []
			Object.keys(errors).forEach((item: any) => {
				errors[item].forEach((error: any, index: number) => {
					errorData.value.push({
						field: item,
						error: error,
					})
				})
			})
			submitPopup.value = true
		} else {
			let msg = res.msg || res.data.msg
			let status = res.data.status
			Message.request(
				res.data || {
					msg: status ? msg || '提交成功' : msg || '资料提交错误，请检查管理员信息是否填写正确，如填写错误请联系客服重置订单',
					status: status,
				}
			)
		}

		if (res.data.status) {
			emit('close') // 关闭弹窗
			//  刷新商业证书列表
			const refreshMap = {
				ssl: () => (sslIsRefresh.value = true),
				test: () => (testIsRefresh.value = true),
				encrypt: () => (encryptIsRefresh.value = true),
				other: () => (otherIsRefresh.value = true),
			} as const
			refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
			certVerifyWay(orderInfo.value.oid, orderInfo.value.cert_ssl_type, orderInfo.value.pid)
			resetForm()
		}
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
	}
}

onMounted(async () => {
	const res: AnyObject = await getCertAdminInfoEvent()
	sslApplicationInfo.value = {
		// 完善商用证书验证信息
		...sslApplicationInfo.value,
		...res.data,
	}
	sslInfoHandle()
	getSslDnsApiInfo()
})
</script>

<style lang="css" scoped>
.disabled-input input {
	background-color: rgba(var(--el-base-primary-rgb), 0.3);
	color: var(--el-color-text-tertiary);
	border-color: rgba(var(--el-base-tertiary-rgb), 0.3);
}

.el-form .el-form-item--small.el-form-item + .el-form-item {
	margin-top: 0.8rem;
}

/* 添加旋转动画 */
.svgtofont-el-loading {
	display: inline-block;
	animation: rotate 2s linear infinite;
}

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>

<style>
.custom-radio-group {
	@apply flex flex-col h-[20rem] overflow-auto h-[20rem] pl-[4px] flex-nowrap items-start;
}

.custom-radio-group .el-radio {
	@apply leading-[3.6rem] h-[3.6rem] border-b-[1px] border-light mr-0 w-full;
}
</style>
