<template>
	<div class="relative h-full" v-bt-loading="loading">
		<template v-if="maskLayer">
			<bt-tabs ref="tamperRef" type="bg-card" v-model="tabActive" :options="tabComponent"></bt-tabs>

			<el-button type="primary" v-if="tabActive !== 'overview' && pluginName === 'tamper_proof_refactored'" class="absolute top-0 right-0" @click="openApplyPopup"> 一键应用 </el-button>
			<bt-install-mask v-if="pluginName == 'tamper_core' && parseFloat(pluginInfo.version) < 3.2" :visible="true">
				<template #content>
					<div class="flex items-center">
						<span>版本过低无法使用，请点击更新</span>
						<bt-link @click="updateTamperEvent" class="!font-bold !text-base"> 【企业级防篡改】 </bt-link>
					</div>
				</template>
			</bt-install-mask>
			<div v-else-if="pluginName == 'tamper_core' && !kernelModuleStatus" class="absolute top-0 z-10 h-full w-full bg-lighter text-center flex flex-col items-center justify-center">
				<div class="text-secondary text-subtitleLarge mb-1rem flex items-center">
					<img width="30" src="/static/images/soft_ico/tamper_core_service.png" />
					【服务已停止】
				</div>
				<div class="text-tertiary text-base mb-2rem">检测到当前服务未开启，请尝试手动启动！否则无法正常使用防篡改插件功能</div>
				<el-button-group :options="tableBtnGroup" />
			</div>
		</template>
		<bt-product-introduce v-else :data="productData" class="p-20px"></bt-product-introduce>
		<bt-dialog title="一键应用" v-model="applyPopup" :area="50" show-footer @confirm="applyConfirm">
			<div class="p-2rem">
				<el-form ref="applyFormRef" :model="applyForm" :rules="applyRules" :disabled="formDisabled">
					<el-form-item label="同步配置" prop="sites">
						<el-select v-model="applyForm.sites" multiple collapse-tags class="!w-30rem" placeholder="请选择">
							<template v-for="item in applyForm.list">
								<el-option v-if="item.siteName !== compData.name" :key="item.siteName" :label="item.siteName" :value="item.siteName"></el-option>
							</template>
						</el-select>
					</el-form-item>
				</el-form>
				<bt-help :options="helpList" list-style="disc" class="mt-2rem ml-2rem"></bt-help>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import { useConfirm } from '@/hooks/tools'
import { useHandleError } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { openResultDialog } from '@/views/site/useController'
import { getPluginInfo, getProofFind, serviceAdmin, setConfigSite } from '@api/site'
import { useSiteStore } from '@site/useStore'

interface TabProps {
	title: string
	type: string
	active?: true
	component: any
	compData?: any
}

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

// 概览
const OverView = defineAsyncComponent(() => import('@site/views/php-model/tamper-proof-core/public/overview.vue'))
// 排除目录
const Exclude = defineAsyncComponent(() => import('@site/views/php-model/tamper-proof-core/tamper-proof/exclude-protect-ext.vue'))
// 保护文件/扩展名 / 受保护的文件类型
const Protect = defineAsyncComponent(() => import('@site/views/php-model/tamper-proof-core/tamper-core/protect-ext.vue'))
// 高级设置
const Advanced = defineAsyncComponent(() => import('@site/views/php-model/tamper-proof-core/tamper-core/advanced.vue'))
// 白名单
const WhiteList = defineAsyncComponent(() => import('@site/views/php-model/tamper-proof-core/tamper-core/white-list.vue'))

const Message = useMessage()

const { payment } = useGlobalStore()

const { siteInfo } = useSiteStore()

const loading = ref<boolean>(false)
const tamperRef = ref<any>()
const pluginName = ref(payment.value.authType === 'pro' ? 'tamper_proof_refactored' : 'tamper_core')
const maskLayer = ref<boolean>(false) // 是否显示付费、安装预览
const isInstall = ref<boolean>(false) // 预览界面是否显示安装按钮
const pluginInfo = ref<any>({}) // 插件信息

const applyPopup = ref<boolean>(false) // 一键应用弹窗
const applyFormRef = ref<any>()
const formDisabled = ref<boolean>(false)
const applyForm = reactive<any>({
	sites: [],
	list: [],
})
const applyRules = reactive<any>({
	sites: [{ required: true, message: '请选择同步配置', trigger: 'blur' }],
})

const helpList = [
	{
		isHtml: true,
		content: '【一键应用】将当前网站已配置的<span class="text-danger">排除目录</span>，<span class="text-danger">防护文件</span>，同步配置到其他网站',
	},
]

const productData = computed(() => {
	const isCode = pluginName.value == 'tamper_core'
	return {
		title: `${isCode ? '堡塔企业级防篡改' : '网站防篡改程序'}-功能介绍`,
		height: 36,
		ps: `${isCode ? '内核版防篡改,用于保护站点内容安全，防止黑客非法修改网页、网站挂马等入侵行为，支持Centos/Debian/Ubuntu，注意：不能与其它防篡改软件同时使用' : '事件型防篡改，用于保护站点内容安全，防止黑客非法修改网页、网站挂马等入侵行为'}`,
		source: isCode ? 180 : 46,
		desc: ['保护站点内容安全', '阻止黑客非法修改网页', '阻止网站被挂马', '阻止其他入侵行为'],
		isInstall: isInstall.value,
		tabImgs: [`https://www.bt.cn/Public/new/plugin/introduce/site/${isCode ? 'tamper_core_preview' : 'tamper_proof_preview'}.png`],
		pluginInfo: pluginInfo.value,
	}
})

const tabActive = ref('overview')
const tabComponent = ref()
const kernelModuleStatus = ref<boolean>(true) // 企业防篡改 内核模块状态

const tableBtnGroup = [
	{ content: '启动', event: () => setTamperCoreService('start') },
	{ content: '重启', event: () => setTamperCoreService('restart') },
	{ content: '重载配置', event: () => setTamperCoreService('reload') },
]

/**
 * @description 启动、重启、重载 企业防篡改服务
 * @param type 启动、重启、重载
 */
const setTamperCoreService = async (type: string) => {
	let load: any
	try {
		let title = ''
		switch (type) {
			case 'start':
				title = '启动'
				break
			case 'restart':
				title = '重启'
				break
			case 'reload':
				title = '重载'
				break
		}
		await useConfirm({
			title: `${title}防篡改服务`,
			content: `${title}项目后，当前服务将${title}运行，是否继续操作？`,
		})
		load = Message.load(`正在${title}防篡改服务，请稍候...`)
		const res = await serviceAdmin({ action: type })
		Message.msg({
			customClass: 'bt-message-error-html !max-w-[36rem]',
			dangerouslyUseHTMLString: true,
			message: res.msg,
			type: res.status ? 'success' : 'error',
			showClose: res.status ? false : true,
			duration: res.status ? 5000 : 0,
		})
		if (res.status) getStatus()
	} catch (error) {
		useHandleError(error)
	} finally {
		load?.close()
	}
}

/**
 * 获取防篡改状态
 */
const getStatus = async () => {
	try {
		loading.value = true
		const { data: codeData } = await getPluginInfo({ sName: 'tamper_core' })
		const { data: proofData } = await getPluginInfo({
			sName: 'tamper_proof_refactored',
		})

		const isSetupCode = codeData.setup && codeData.endtime > 0
		const isSetupProof = proofData.setup && proofData.endtime >= 0 // 专业版可用 需要判断永久专业版
		maskLayer.value = false
		isInstall.value = true // 显示安装按钮
		// 根据安装情况显示 对应插件功能
		if (isSetupCode) {
			pluginName.value = 'tamper_core'
		} else if (isSetupProof) {
			pluginName.value = 'tamper_proof_refactored'
		} else {
			pluginName.value = payment.value.authType === 'pro' ? 'tamper_proof_refactored' : 'tamper_core'
			if (payment.value.authType === 'free') {
				isInstall.value = false
			} else {
				maskLayer.value = true
			}
		}

		maskLayer.value = isSetupCode || isSetupProof

		pluginInfo.value = pluginName.value == 'tamper_core' ? codeData : proofData

		let compData: any = {
			type: pluginName.value,
			maskLayer: maskLayer.value,
		}

		if (pluginName.value == 'tamper_core') {
			// 当前版本是否大于等于最低版本3.2
			compData.isVersion = parseFloat(codeData.version) >= 3.2
			// 当前版本是否大于等于最低版本5.6
			compData.isNewAlarmVersion = parseFloat(codeData.version) >= 5.6
			tabComponent.value = [
				{
					label: '概览',
					name: 'overview',
					lazy: true,
					render: () => <OverView compData={compData}></OverView>,
				},
				{
					label: '受保护的文件类型',
					lazy: true,
					name: 'protect',
					render: () => <Protect compData={{ ...compData, childType: 'protect' }}></Protect>,
				},
				{
					label: '白名单',
					lazy: true,
					name: 'exclude',
					render: () => <WhiteList compData={{ ...compData, childType: 'exclude' }}></WhiteList>,
				},
				{
					label: '高级设置',
					name: 'advanced',
					lazy: true,
					render: () => <Advanced compData={{ ...compData, childType: 'advanced' }}></Advanced>,
				},
			]
		} else {
			tabComponent.value = [
				{
					label: '概览',
					name: 'overview',
					lazy: true,
					render: () => <OverView compData={compData}></OverView>,
				},
				{
					label: '排除目录',
					name: 'exclude',
					lazy: true,
					render: () => <Exclude compData={{ ...compData, childType: 'exclude' }}></Exclude>,
				},
				{
					label: '保护文件/扩展名',
					name: 'protect',
					lazy: true,
					render: () => <Exclude compData={{ ...compData, childType: 'protect' }}></Exclude>,
				},
			]
		}
	} catch (error) {
	} finally {
		loading.value = false
	}
}

/**
 * @description 更新企业级防篡改
 */
const updateTamperEvent = () => {
	// pluginInstallDialog({
	// 	type: 'u',
	// 	plugin: {
	// 		...pluginInfo.value,
	// 		callBack: () => {
	// 			setTimeout(() => {
	// 				getStatus();
	// 			}, 2000);
	// 		},
	// 	},
	// });
}

/**
 * @description 打开一键应用弹窗
 */
const openApplyPopup = () => {
	applyForm.list = tamperRef.value?.getRef()?.overview?.sitesList || []
	applyPopup.value = true
}

/**
 * @description 一键应用
 */
const applyConfirm = async () => {
	await applyFormRef.value.validate()
	try {
		const { data } = await getProofFind({ siteName: siteInfo.value.name })
		let params: any = {
			protectExt: JSON.stringify(data.protectExt),
			excludePath: JSON.stringify(data.excludePath),
			sites: JSON.stringify(
				applyForm.sites.map((item: any) => {
					return {
						siteName: item,
						path: applyForm.list?.find((site: any) => site.siteName == item).path,
					}
				})
			),
			sourceSite: siteInfo.value.path,
		}
		const res = await setConfigSite(params)
		applyPopup.value = false
		openResultDialog({
			title: '批量设置配置',
			resultData: res.data?.map((item: any) => ({
				name: item.ps,
				status: item.status,
				msg: item.msg,
			})),
			resultTitle: '配置',
			showMult: false,
		})
		return
	} catch (error) {
		useHandleError(error)
	}
}

provide('kernelModuleStatus', kernelModuleStatus)

onMounted(getStatus)

defineExpose({
	init: getStatus,
})
</script>
