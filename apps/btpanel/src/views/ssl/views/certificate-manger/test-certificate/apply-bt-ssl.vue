<template>
	<div class="relative p-[1.6rem] w-[90%] mx-[auto]">
		<el-alert type="error" :closable="false">
			<template #title>
				<span class="text-small flex items-center">
					<span class="svgtofont-hint-confirm-icon !text-extraLarge mr-[.5rem]"></span>
					<div class="leading-7 mt-[.2rem]">
						提示：尊敬的用户您好，感谢您对宝塔免费证书的支持，由于证书签发机制的调整，原一年的免费证书，将缩短至90天。本调整将于2024年4月25日生效。请注意及时续签。
						<div class="inline-block">
							<bt-link href="https://www.trustasia.com/view-free-ssl-one-year-adjustment-announcement/" target="_blank"> 查看详情 </bt-link>
						</div>
					</div>
				</span>
			</template>
		</el-alert>
		<el-form class="mt-[1rem]" :rules="rules" ref="applySslInfoForm" :model="applySslInfo" label-width="100px">
			<el-form-item label="证书信息">
				<span class="text-primary"> TrustAsia TLS RSA CA(免费版)</span>
			</el-form-item>
			<el-form-item label="域名" prop="domain">
				<el-select v-model="applySslInfo.domain" class="!w-[36rem]" filterable placeholder="请选择">
					<el-option v-for="item in domainAllList?.data" :key="item.id" :label="item.name" :value="item.name"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="个人/公司名称" prop="orgName">
				<InputPopover v-model="applySslInfo.orgName" placeholderTips="请输入个人/公司名称，必填项" customClass="!w-[36rem]" />
			</el-form-item>
			<el-form-item label="所在地区" prop="orgRegion">
				<div class="flex flex-row">
					<InputPopover v-model="applySslInfo.orgRegion" placeholderTips="请输入所在省份，必填项" customClass="mr-[1.6rem] !w-[17rem]" />
					<InputPopover v-model="applySslInfo.orgCity" placeholderTips="请输入所在市/县，必填项" customClass="!w-[17.4rem]" />
				</div>
			</el-form-item>
			<el-form-item label="地址" prop="orgAddress">
				<InputPopover v-model="applySslInfo.orgAddress" placeholderTips="请输入个人/公司地址，必填项" customClass="!w-[36rem]" />
			</el-form-item>
			<el-form-item label="手机" prop="orgPhone">
				<InputPopover v-model="applySslInfo.orgPhone" placeholderTips="请输入手机号码，必填项" customClass="!w-[36rem]" />
			</el-form-item>
			<el-form-item label="邮政编码" prop="orgPostalCode">
				<InputPopover v-model="applySslInfo.orgPostalCode" placeholderTips="请输入邮政编码，必填项" customClass="!w-[36rem]" />
			</el-form-item>
			<el-form-item label=" ">
				<el-button type="primary" @click="onConfirm">申请证书</el-button>
			</el-form-item>
		</el-form>
		<bt-help :options="trustAsiaHelpList" listStyle="disc" class="ml-[2rem] bottom-0" />
	</div>
</template>

<script setup lang="ts">
import InputPopover from '@site/public/ssl-arrange/public/input-popover.vue'
import { useSiteStore } from '@site/useStore'
import { applyTrustAsiaCert, getDomainList, verifyTrustAsiaCret } from '@api/site'
import { checkPhone } from '@utils/index'
import { useDataHandle, useMessage } from '@/hooks/tools'
import { useCertificateStore } from '@/views/ssl/views/certificate-manger/useStore'

const { testIsRefresh } = storeToRefs(useCertificateStore())
const MessageMethod = useMessage()
const emits = defineEmits(['close'])

// 临时授权表格数据参数
interface TableDataProps {
	partnerOrderId: string
	commonName: string
	ssl_id: number
	stateCode: string
	stateName: number | string
	endtime: number
	setup: boolean
}

const { siteInfo } = useSiteStore()

const trustAsiaHelpList = [
	{
		content: '注意：请勿将SSL证书用于非法网站，一经发现，吊销证书。',
		class: 'text-danger',
	},
	{
		content: '申请之前，请确保域名已解析，如未解析会导致审核失败(包括根域名)。',
	},
	{
		content: '宝塔SSL申请的是免费版TrustAsia DV SSL CA - G5证书，仅支持单个域名申请。',
	},
	{
		content: '建议使用二级域名为www的域名申请证书,此时系统会默认赠送顶级域名为可选名称',
	},
	{
		content: '在未指定SSL默认站点时,未开启SSL的站点使用HTTPS会直接访问到已开启SSL的站点',
	},
	{
		content: '测试SSL申请注意事项及教程<a href="https://www.bt.cn/bbs/thread-33113-1-1.html" target="_blank" class="bt-link" rel="noreferrer noopener"> 使用帮助</a>',
		isHtml: true,
	},
]

const domainAllList = ref<any>()
const applySslInfoForm = ref<any>()
const applySslInfo = ref<any>({
	domain: '',
	orgName: '',
	orgRegion: '',
	orgCity: '',
	orgAddress: '',
	orgPhone: '',
	orgPostalCode: '',
	orgDivision: '总务',
})

const rules = ref({
	orgName: [
		{
			required: true,
			message: '请输入个人/公司名称',
			trigger: ['blur', 'change'],
		},
	],
	orgRegion: [{ required: true, message: '请输入所在省份', trigger: ['blur', 'change'] }],
	orgCity: [{ required: true, message: '请输入所在市/县', trigger: ['blur', 'change'] }],
	orgAddress: [
		{
			required: true,
			message: '请输入个人/公司地址',
			trigger: ['blur', 'change'],
		},
	],
	orgPhone: [
		{
			required: true,
			message: '请输入手机号码',
			validator: (rule: any, value: any, callback: any) => {
				if (checkPhone(value)) {
					callback()
				} else {
					callback(new Error('请输入正确的手机号码'))
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	orgPostalCode: [
		{
			required: true,
			message: '请输入邮政编码',
			validator: (rule: any, value: any, callback: any) => {
				if (value.length === 6) {
					callback()
				} else {
					callback(new Error('请输入正确的邮政编码'))
				}
			},
			trigger: ['blur', 'change'],
		},
	],
})
/**
 * @description 提交证书申请信息
 */
const onConfirm = async () => {
	const valid = await applySslInfoForm.value.validate()
	if (valid) {
		try {
			const { status, data, msg } = await useDataHandle({
				loading: '正在提交证书申请资料，请稍后...',
				request: applyTrustAsiaCert({
					...applySslInfo.value,
				}),
			})

			// 证书申请状态 -成功
			if (status) {
				emits('close')
				MessageMethod.success(data.msg || msg || '申请成功')
				// 验证域名
				const {
					status: rStatus,
					data: rData,
					msg: rMsg,
				} = await useDataHandle({
					loading: '正在验证证书申请状态，请稍后...',
					request: verifyTrustAsiaCret({
						partnerOrderId: data.partnerOrderId,
						siteName: applySslInfo.value.domain,
					}),
				})
				//  验证成功进入部署
				if (rStatus) {
					if (rData.stateCode == 'COMPLETED') {
						MessageMethod.success('验证成功！')
						// deployCert(data) // 部署证书
					} else {
						MessageMethod.success('等待CA验证中，若长时间未能成功验证，请登录官网使用DNS方式重新申请...')
					}
				} else {
					MessageMethod.msg({
						customClass: 'bt-message-error-html',
						dangerouslyUseHTMLString: true,
						message: rMsg,
						type: 'error',
						duration: 0,
						showClose: true,
					}) // 提示错误信息
				}
			} else {
				MessageMethod.msg({
					customClass: 'bt-message-error-html',
					dangerouslyUseHTMLString: true,
					message: data?.msg || msg,
					type: 'error',
					duration: 0,
					showClose: true,
				}) // 提示错误信息
			}
			testIsRefresh.value = true
		} catch (error) {
			console.error(error)
		} finally {
		}
	}
}

const getDomainData = async () => {
	let load = null
	try {
		load = MessageMethod.load('正在获取所有域名列表，请稍后...')
		const { data } = await getDomainList()
		domainAllList.value = data
		if (domainAllList.value?.data?.length) {
			applySslInfo.value.domain = domainAllList.value.data[0].name
		}
	} catch (error) {
	} finally {
		load && load.close()
	}
}

onMounted(() => {
	getDomainData()
})
</script>

<style scoped></style>
