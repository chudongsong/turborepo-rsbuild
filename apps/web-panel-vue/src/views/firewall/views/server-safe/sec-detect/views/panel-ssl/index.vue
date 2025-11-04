<template>
    <div>
        <bt-switch :model-value="panelSsl" @change="onChange" />
        <bt-dialog title="面板证书SSL" :area="[54]" v-model="showPopup3" :show-footer="true" @confirm="handleDialogConfirm(true)" @cancel="handleDialogAction(true)">
			<div class="p-[2rem]">
				<div class="flex items-center justify-center mb-[16px]">
					<bt-svg-icon name="scanning-success" size="3.2"></bt-svg-icon>
					<p class="text-extraLarge ml-[4px]">立即【开启SSL证书】保护面板安全</p>
				</div>
				<div class="flex flex-col bg-light p-[20px]">
					<span>访问步骤：</span>
					<ul class="list-decimal ml-[20px] mt-[4px] leading-10">
						<li>开启https</li>
						<li>使用https网站访问面板</li>
						<li>如提醒风险（正常现象）点击【高级】或【详情】如下图</li>
						<li>【继续访问】或【接受风险并继续】</li>
					</ul>
					<bt-image src="/other/bt-https.png" class="block mt-[4px] h-[18rem] w-[28rem]" />
				</div>
				<el-form ref="form" :model="sslPanel" class="my-6">
					<el-form-item label="类型">
						<el-select v-model="sslPanel.sllType" class="!w-[28rem]" @change="changeSllType">
							<el-option v-for="item in options" :key="item.key" :label="item.title" :value="item.key" :disabled="item.disabled">
								<el-tooltip class="item" effect="dark" v-if="item.key === 2 && !safeConfig.domain" content="Let's Encrypt证书类型需要绑定域名才能选择" placement="top-start">
									<span>{{ item.title }}</span>
								</el-tooltip>
								<span v-else>{{ item.title }}</span>
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="验证方法" v-if="sslPanel.sllType == 2">
						<el-radio-group v-model="sslPanel.resource">
							<el-radio label="http" value="http">文件验证</el-radio>
							<el-radio label="dns" value="dns">DNS验证</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="密钥(KEY)" v-if="sslPanel.sllType == 3">
						<div class="w-[24rem]">
							<bt-input v-model="sslPanel.privateKey" type="textarea" :rows="4"></bt-input>
						</div>
					</el-form-item>
					<el-form-item label="证书(PEM格式)" v-if="sslPanel.sllType == 3">
						<div class="w-[24rem]">
							<bt-input v-model="sslPanel.certPem" type="textarea" :rows="4"></bt-input>
						</div>
					</el-form-item>
				</el-form>
				<ul class="list-disc ml-[20px] mt-[12px] leading-10 text-secondary">
					<li>
						<div class="flex items-center">开启后导致面板不能访问，可以点击查看<bt-link href="https://www.bt.cn/bbs/thread-117246-1-1.html">解决方法</bt-link></div>
					</li>
					<li>自签证书不被浏览器信任，显示不安全是正常现象</li>
				</ul>
			</div>
		</bt-dialog>
        
		<bt-dialog title="关闭面板SSL" :area="38" v-model="showPopup2" @cancel="handleDialogAction(false)">
			<div class="pt-[20px] flex flex-col">
				<div class="flex items-center px-[20px]">
					<i class="svgtofont-el-warning-filled text-warningDark !text-titleLarge pr-4"></i>
					<span class="text-base leading-10 text-danger">关闭SSL后请使用安全登录模式进行登录，否则会存在“重放攻击”风险，是否确定关闭？</span>
				</div>

				<div class="flex items-center mt-[12px] ml-[4px] px-[20px]">
					<el-checkbox v-model="checkOffSsl" class="!mr-[4px]"></el-checkbox>
					我已了解风险，确认关闭
				</div>

				<div class="bg-light footer-btn flex items-center justify-end mt-[20px] p-[12px] w-full">
					<el-button type="warning" @click="handleDialogAction(false)">取消</el-button>
					<el-button type="danger" @click="handleDialogConfirm(false)" :disabled="(checkOffSslTimer ? true : false) || !checkOffSsl">确认关闭SSL {{ checkOffSslTimer ? `（剩余${checkOffSslNum}秒可操作）` : '' }}</el-button>
				</div>
			</div>
		</bt-dialog>
    </div>
</template>

<script setup lang="tsx">
import { useMessage, useDialog } from '@hooks/tools'
import { getCertSource, setPanelSsl } from '@/api/config'
import { useGlobalStore } from '@store/global'
import { emptyCookie, hasOwnProperty } from '@utils/index'

interface Props {
    initialStatus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    initialStatus: false
})

const message = useMessage()
const { getGlobalInfo } = useGlobalStore()
const safeConfig = ref({
    domain: '',
    panelSSl: false,
    admin_path: '/',
})

onMounted(async () => {
    const data: any = await getGlobalInfo()
    safeConfig.value.domain = data?.domain || ''
    safeConfig.value.panelSSl = data?.SSL || location.protocol.indexOf('https:') > -1
    safeConfig.value.admin_path = data?.admin_path || '/'
})

const panelSsl = ref(props.initialStatus)

// 监听 props 变化，更新本地状态
watch(() => props.initialStatus, (newStatus) => {
    panelSsl.value = newStatus
}, { immediate: true })

const originalPanelSsl = ref(false) // 保存原始状态
const sslConfigPopup = ref(false)
const showPopup2 = ref(false)
const showPopup3 = ref(false)

const checkOffSsl = ref(false) // 关闭SSL验证
const checkOffSslTimer = ref<any>() // 关闭SSL验证-定时器
const checkOffSslNum = ref(5) // 关闭SSL验证-倒计时

// 弹窗加载状态
const sslConfigLoad = ref(false)

const sslPanel = ref({
	sllType: 1,
	privateKey: '',
	certPem: '',
	checked: false,
	email: '',
	resource: 'http',
})

const options = [
	{ title: '自签证书', key: 1, disabled: false },
	{ title: "Let's Encrypt", key: 2, disabled: !safeConfig.value.domain },
	{ title: '其他证书', key: 3, disabled: false },
]

// 面板ssl信息配置
const panelSslConfig = ref({
	cert_type: '',
	domain: '',
	email: '',
})

const authList = ref<any[]>([])
 const verifyParams = reactive<any>({
	index: '',
	cert_type: '',
	privateKey: '',
	certPem: '',
	email: '',
	auth_type: '',
})
const tableDialog = ref(false)

/**
 * @description: 面板SSL开关
 */
 const onChange = (val: boolean | string | number) => {
	const boolVal = Boolean(val)
	// 保存原始状态
	originalPanelSsl.value = panelSsl.value
	if (boolVal) {
		showPopup3.value = true
		getCertificate()
	} else {
		showPopup2.value = true
	}
	
	if (!boolVal) {
		if (checkOffSslTimer.value) clearInterval(checkOffSslTimer.value)
		checkOffSslTimer.value = setInterval(() => {
			checkOffSslNum.value--
			if (checkOffSslNum.value <= 0) {
				clearInterval(checkOffSslTimer.value)
				checkOffSslTimer.value = null
				checkOffSslNum.value = 5
			}
		}, 1000)
	} else {
		clearInterval(checkOffSslTimer.value)
		checkOffSslTimer.value = null
		checkOffSslNum.value = 5
	}
}

/**
 * @description: 点击面板SSL配置，打开弹窗
 */
 const openProgress = () => {
	return useDialog({
		area: [50, 25],
		component: () => import('@config/views/safe-settings/panel-ssl/cert-progress.vue'),
	})
}


/**
 * @description: 设置面板证书配置
 * @param data.cert_type — 面板SSL开关，1为开，0为关
 * @param data.privateKey — 密钥(KEY)
 * @param data.certPem — 证书(PEM格式)
 */
 const setSslInfo = async (cert_type?: number | string, privateKey?: string, certPem?: string) => {
	try {
		const params: any = { cert_type, privateKey, certPem }
		let progress: any, loads: any, data: any
		
		// 当关闭SSL时，删除这些参数
		if (cert_type === 0) delete params.cert_type, params.privateKey, params.certPem
		
		if (sslPanel.value.sllType === 2) {
			params.email = sslPanel.value.email
			params.auth_type = sslPanel.value.resource
		}
		if (sslPanel.value.sllType === 2) {
			setTimeout(async () => {
				progress = await openProgress()
			}, 500)
		} else {
			loads = message.load('正在设置面板证书配置，请稍候...')
		}
		const res = await setPanelSsl(params)
		data = res.data
		progress?.close()
		loads?.close()
		await handleResult(data, params)
	} catch (err) {
		console.error('An error occurred while setting Panel SSL:', err)
	} finally {
		sslConfigLoad.value = false
		showPopup3.value = false
	}
}



/**
 * @description: 弹窗确认按钮
 * @param val false：关闭SSL true：面板证书SSL
 */
 const onConfirm = async (val: boolean) => {
	if (!checkOffSsl.value && !val) {
		return message.error('请勾选并同意承担风险')
	}
	try {
		if (val) {
			await setSslInfo(1, sslPanel.value.privateKey, sslPanel.value.certPem)
		} else {
			await setSslInfo(0)
			showPopup2.value = false
		}
		panelSsl.value = val
		originalPanelSsl.value = val
	} catch (error) {
		panelSsl.value = originalPanelSsl.value
		console.error('SSL设置失败:', error)
	}
}

const cancel = (val: boolean) => {
	if (val) {
		showPopup3.value = false
	} else {
		showPopup2.value = false
	}
	panelSsl.value = originalPanelSsl.value
}

// 添加新的统一处理方法
const handleDialogAction = (val: boolean) => {
	const dialogRef = val ? showPopup3 : showPopup2
	if (!dialogRef.value) return
	cancel(val)
}

const handleDialogConfirm = (val: boolean) => {
	const dialogRef = val ? showPopup3 : showPopup2
	if (!dialogRef.value) return
	onConfirm(val)
}


/**
 * @description: 切换证书类型
 */
 const changeSllType = (val: number) => {
	sslPanel.value.sllType = val
}


/**
 * @description: 获取面板证书配置
 */
 const getCertificate = async () => {
	try {
		const { data } = await getCertSource()
		panelSslConfig.value = data
	} catch (err) {
		console.log(err)
	}
}


/**
 * @description : 验证证书
 */
 const handleResult = async (data: any, params?: any) => {
    console.log(data, 'data')
	if (data.status) {
		const load = message.load('正在刷新页面，请稍候...')
		await new Promise(resolve => setTimeout(resolve, 2000))
		load.close()
		emptyCookie() // 清空所有的cookie
		sessionStorage.clear() // 清空所有的sessionStorage
		window.location.href = `${location.protocol === 'http:' ? 'https' : 'http'}://${window.location.host}${safeConfig.value.admin_path}`
		sslConfigLoad.value = false
	} else {
		const { certPem, cert_type, privateKey } = params
		safeConfig.value.panelSSl = !safeConfig.value.panelSSl
		if (hasOwnProperty(data, 'auths')) {
			authList.value = data.auths
			verifyParams.index = data.index
			verifyParams.certPem = certPem
			verifyParams.cert_type = cert_type
			verifyParams.privateKey = privateKey
			verifyParams.email = sslPanel.value.email
			verifyParams.auth_type = sslPanel.value.resource
			tableDialog.value = true
		}
	}
	message.request(data)
}

</script>