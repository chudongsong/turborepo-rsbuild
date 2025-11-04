<template>
	<div class="h-full overflow-auto">
		<div v-if="pluginInfo?.status">
			<bt-table-group>
				<template #header-left>
					<div class="flex items-center">
						<el-button @click="generatePopup = true" type="primary">生成证书</el-button>
						<div class="ml-[20px]">
							双向认证开关
							<el-switch v-model="certStatus" @change="setStatusEvent"></el-switch>
						</div>
					</div>
				</template>
				<template #header-right>
					<div class="flex items-center">
						<bt-radio type="button" v-model="radioValue" :options="actionTypeOptions" @change="getList" class="mr-[1rem] !flex-nowrap" />
						<bt-input-search class="ml-[12px] w-[16rem]" v-model="searchValue" @search="getList" placeholder="请输入使用者" />
					</div>
				</template>
				<template #content>
					<bt-table :column="tableColumns" :data="tableData" v-bt-loading="tableLoading" />
				</template>
				<template #footer-left>
					<el-button type="default" @click="openCertConfig">证书配置</el-button>
				</template>
				<template #footer-right></template>
				<template #popup>
					<bt-dialog title="生成证书" v-model="generatePopup" :area="42" showFooter @cancel="onCancelGenerate" @confirm="onAddCert">
						<div class="p-[20px]">
							<el-form :model="generateForm" ref="generateFormRef">
								<el-form-item label="使用者">
									<bt-input v-model="generateForm.client" placeholder="请输入使用者（如“研发部-张三”）" width="24rem"></bt-input>
								</el-form-item>
							</el-form>
						</div>
					</bt-dialog>

					<bt-dialog title="证书配置" v-model="certPopup" :area="42" showFooter @confirm="onAddCertConfig">
						<div class="p-[20px]">
							<el-form :model="certForm" ref="certFormRef" :rules="certRules">
								<el-form-item label="公司名称" prop="company">
									<bt-input v-model="certForm.company" placeholder="请输入公司名称" width="24rem"></bt-input>
								</el-form-item>
								<el-form-item label="使用者" prop="domain">
									<bt-input type="textarea" resize="none" :rows="6" v-model="certForm.domain" placeholder="请输入域名列表，多个域名可以用英文状态下的逗号隔开" width="24rem"></bt-input>
								</el-form-item>
							</el-form>
						</div>
					</bt-dialog>
				</template>
			</bt-table-group>
			<ul class="list-disc mt-[20px] pl-[28px]">
				<li>双向认证仅支持【HTTPS访问】，如需全站设置，还需通过网站设置开启【强制HTTPS】.</li>
				<li>给网站开启【双向认证】，开启后用户需要将【证书】导入到浏览器后才能访问该网站（目前支持Nginx/Apache）</li>
			</ul>
		</div>
		<bt-product-introduce v-else :data="productData" class="!px-[20px] !pt-[8px]"></bt-product-introduce>
	</div>
</template>

<script setup lang="tsx">
import { getPluginInfo } from '@/api/global'
import { useConfirm, useDataHandle, useHandleError, useMessage } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { formatTime } from '@/utils'
import { downClientPfx, getSslConfig, getSslList, getSslSiteList, getUserCert, revokeClientCert, setSslConfig, setSslVerify } from '@api/site'
import { useSiteStore } from '@site/useStore'

const Message = useMessage() // 消息提示

const { payment } = useGlobalStore()
const { siteInfo } = useSiteStore()

const { authType } = payment.value

const certFormRef = ref<any>(null) // 表单ref
const pluginInfo = ref<any>({
	status: true,
}) // 插件信息
const productData = ref<any>({
	title: '限制访问型证书-功能介绍',
	ps: '提供双向认证证书，可用于限制指定人员访问',
	source: 61,
	isInstall: false,
	desc: ['限制指定人员访问', '双向认证', '内网自签SSL'],
	height: 36,
	tabImgs: ['https://www.bt.cn/Public/new/plugin/introduce/site/ssl_verify_preview.png'],
})

const actionTypeOptions = [
	{ label: '全部', value: 0 },
	{ label: '正常', value: 1 },
	{ label: '已撤销', value: -1 },
]

const tableColumns = shallowRef([
	{ label: '使用者', prop: 'client' },
	{ label: '公司名称', prop: 'company' },
	{
		label: '到期时间',
		width: 220,
		render: (row: any) => {
			// 剩余时间为day天，需要显示为 具体的到期时间（剩余day天）
			if (row.day) {
				let endTime = row.addtime + row.day * 24 * 60 * 60
				return (
					<span>
						{formatTime(endTime, 'yyyy-mm-dd')}（剩余{row.day}天）
					</span>
				)
			}
			return '--'
		},
	},
	{
		label: '状态',
		render: (row: any) => {
			return <span>{row.status === 1 ? '正常' : row.status === 0 ? '未知' : '已撤销'}</span>
		},
	},
	{
		label: '操作',
		align: 'right',
		render: (row: any) => {
			if (row.status !== 1) {
				return h('span', {}, '--')
			}
			return h('div', [
				h(
					'span',
					{
						class: {
							hidden: row.status !== 1 || row.day > 30,
							'mr-[8px]': true,
							'bt-link': true,
							'cursor-pointer': true,
						},
						onClick: async () => {
							try {
								const res = await getUserCert({
									client: row.client,
								})
								Message.request(res)
								getList()
							} catch (error) {
								console.log(error)
							}
						},
					},
					'续签'
				),
				h(
					'span',
					{
						class: {
							'mr-[8px]': true,
							hidden: row.status !== 1,
							'bt-link': true,
							'cursor-pointer': true,
						},
						onClick: async () => {
							let loading = Message.load('正在请求下载，请稍后...')
							try {
								const res = await downClientPfx({
									id: row.id,
								})
								if (res.status) {
									window.open('/download?filename=' + res.msg, '_blank', 'noopener,noreferrer')
									loading.close()
								} else {
									Message.error(res.msg)
								}
							} catch (error) {
								console.log(error)
							} finally {
								loading.close()
							}
						},
					},
					'下载'
				),
				h(
					'span',
					{
						class: {
							hidden: row.status !== 1,
							'bt-link': true,
							'cursor-pointer': true,
						},
						onClick: async () => {
							onRevokeCertEvent(row)
						},
					},
					'撤销'
				),
			])
		},
	},
]) // 响应式数据

const tableData = ref([]) // 响应式数据
const tableLoading = ref(false) // 响应式数据
const radioValue = ref(0) // 响应式数据
const searchValue = ref('') // 响应式数据
const generatePopup = ref(false) // 响应式数据
const certPopup = ref(false) //  证书配置弹窗
const certStatus = ref(false) // 证书开关状态

const certForm = reactive({
	company: '',
	domain: '',
}) // 响应式数据

const generateForm = reactive({
	client: '',
}) // 响应式数据

const certRules = reactive({
	company: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
	domain: [{ required: true, message: '请输入域名列表', trigger: 'blur' }],
}) // 响应式数据

/**
 * @description 生成证书
 */
const onAddCert = async () => {
	const res: AnyObject = await useDataHandle({
		loading: '正在生成，请稍后...',
		request: getUserCert({
			client: generateForm.client,
		}),
		message: true,
	})
	if (res.status) onCancelGenerate()
}

/**
 * @description 撤销证书
 */
const onRevokeCertEvent = async (row: any) => {
	await useConfirm({
		title: `撤销证书【${row.client}】的访问证书`,
		content: `撤销颁发的访问证书后，证书将不在可用，是否继续操作？`,
		icon: 'warning-filled',
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在撤销，请稍后...',
		request: revokeClientCert({
			id: row.id,
		}),
		message: true,
	})
	if (res.status) getList()
}

const onCancelGenerate = () => {
	generatePopup.value = false
	generateForm.client = ''
}

const onCancelCert = () => {
	certPopup.value = false
	certFormRef.value?.clearValidate()
}

/**
 * @description 打开证书配置弹窗
 */
const openCertConfig = async () => {
	await getSslConfigEvent()
	certPopup.value = true
}

/**
 * @description 获取证书配置
 */
const getSslConfigEvent = async () => {
	try {
		if (productData.value.isInstall || authType !== 'ltd') return
		const res = await getSslConfig()
		if (!res.data.length && !certPopup.value) {
			Message.error('请先完善证书配置')
			certPopup.value = true
		}
		certForm.company = res.data[0].company
		certForm.domain = res.data[0].domain
		onCancelCert()
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description 添加证书配置
 */
const onAddCertConfig = async () => {
	await certFormRef.value.validate()
	const res: AnyObject = await useDataHandle({
		loading: '正在设置，请稍后...',
		request: setSslConfig(certForm),
		message: true,
	})
	if (res.status) onCancelCert()
}

/**
 * @description 获取证书列表
 */
const getList = async () => {
	try {
		tableLoading.value = true
		const { data: res } = await getSslList({
			status: radioValue.value,
			search: searchValue.value,
		})
		if (res.msg?.includes('插件不存在') || res.msg?.includes('未购买') || res.msg?.includes('已到期')) {
			try {
				const { data } = await getPluginInfo({
					sName: 'ssl_verify',
				})
				pluginInfo.value.status = data.endtime > -1 && data.setup
				// 当是企业版时，判定是否安装即可，非企业版需要判断是否安装与购买
				if (authType === 'ltd') {
					productData.value.isInstall = data.setup ? '' : true
				} else {
					productData.value.isInstall = !data.setup && data.endtime > -1 ? true : ''
				}
				productData.value.pluginInfo = data
			} catch (error) {
				console.log(error)
			}
			return
		}
		pluginInfo.value.status = true
		tableData.value = res
	} catch (error) {
		useHandleError(error)
	} finally {
		tableLoading.value = false
	}
}

/**
 * @description 设置证书开关
 * @param val
 */
const setStatusEvent = async (val: any) => {
	const res: AnyObject = await useDataHandle({
		loading: '正在设置，请稍后...',
		request: setSslVerify({
			siteName: siteInfo.value.name,
			status: val ? 1 : 0,
		}),
		message: true,
	})
	certStatus.value = res.status ? val : !val
	if (res.status) {
		certStatus.value = val
		getStatus()
		getList()
	}
}

/**
 * @description 获取证书开关状态
 */
const getStatus = async () => {
	let loading = Message.load('正在获取状态，请稍后...')
	try {
		const res = await getSslSiteList()
		res.data.forEach((item: any) => {
			if (item.name === siteInfo.value.name) {
				certStatus.value = item.ssl_verify
			}
		})
	} catch (error) {
		useHandleError(error)
	} finally {
		loading.close()
	}
}

onMounted(async () => {
	await getList() // 获取证书列表
	await getSslConfigEvent() // 获取证书配置
	if (pluginInfo.value.status) {
		await getStatus() // 获取证书开关状态
	}
})
</script>
