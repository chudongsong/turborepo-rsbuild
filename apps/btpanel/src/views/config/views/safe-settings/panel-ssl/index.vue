<template>
	<div>
		<config-rows label="面板SSL">
			<template #value>
				<el-switch v-model="safeConfig.panelSSl" @change="onChange(safeConfig.panelSSl)"></el-switch>
				<el-button size="small" class="!ml-[12px]" @click="openSslConfig()"> 面板SSL配置 </el-button>
			</template>
			<template #desc>
				<span>为面板设置https协议访问，提升面板访问安全性，</span>
				<bt-link href="https://www.bt.cn/bbs/thread-105443-1-1.html">了解详情</bt-link>
			</template>
		</config-rows>

		<bt-dialog title="自定义面板证书" v-model="sslConfigPopup" :area="[70]">
			<div class="p-[24px]" v-bt-loading="sslConfigLoad" v-bt-loading:title="'正在获取证书信息，请稍候...'">
				<el-alert type="success" :closable="false">
					<div class="inline-block mr-[32px]">
						认证域名：<span class="font-bold text-small">{{ sslInfo.info.subject }}</span>
					</div>
					<div class="inline-block mr-[32px]">
						证书品牌：<span class="font-bold text-small">{{ sslInfo.info.issuer }}</span>
					</div>
					<div class="inline-block mr-[32px]">
						到期时间： <span class="font-bold text-small">{{ sslInfo.info.notAfter }}</span>
					</div>
				</el-alert>
				<div class="mt-6 flex items-center text-primary font-bold">
					<span>堡塔APP IOS端使用https证书需要使用非自签证书</span>
				</div>
				<template v-if="sslInfo.download_root">
					<div class="mt-2 flex items-center">
						<span>温馨提示：当前证书为自签证书，需要安装本地根证书，</span>
						<el-button size="small" type="primary" class="mr-[8px]" @click="downLoadCert('/download?filename=/www/server/panel/ssl/baota_root.pfx')"> 下载根证书 </el-button>
						<template v-if="sslInfo.root_password">
							<span>证书密码：</span>
							<div class="w-[20rem] flex">
								<bt-input v-model="sslInfo.root_password" :disabled="true" placeholder="密码为空"> </bt-input>
								<el-button type="primary" class="align-sub" @click="copyCertPaw(sslInfo.root_password || '')">复制 </el-button>
							</div>
						</template>
					</div>
					<div class="mt-2 flex items-center">
						<span><span class="text-danger">MAC</span>专用本地根证书：</span>
						<el-button size="small" type="primary" class="mr-[8px]" @click="downLoadCert('/download?filename=/www/server/panel/ssl/baota_root.crt')"> 下载根证书 </el-button>
						<span>* 无密码 <span class="text-danger">MAC</span>需要设置信任此证书</span>
					</div>
				</template>

				<div class="mt-6 sslPanel">
					<div class="flex justify-between">
						<div class="flex items-center w-full">
							<span class="mr-4px">面板SSL</span>
							<el-switch v-model="safeConfig.panelSSl" @change="changePanelSsl(safeConfig.panelSSl)"></el-switch>
							<bt-link href="https://www.bt.cn/bbs/thread-105443-1-1.html" class="ml-[12px]"> 如何开启证书？ </bt-link>
						</div>
						<el-button size="small" class="float-right" @click="openSslFolder">证书夹</el-button>
					</div>

					<div class="flex mt-[12px]">
						<div class="flex-1 mr-[20px]">
							<div class="text-small mb-[8px]">密钥(KEY)</div>
							<bt-input class="text-small" type="textarea" v-model="sslInfo.privateKey" :rows="13" size="small" @focus="detectCertFromClipboard('key', sslInfo.privateKey)"></bt-input>
						</div>
						<div class="flex-1">
							<div class="text-small mb-[8px]">证书(PEM格式)</div>
							<bt-input type="textarea" v-model="sslInfo.certPem" :rows="13" size="small" @focus="detectCertFromClipboard('cert', sslInfo.certPem)"></bt-input>
						</div>
					</div>
					<el-button type="primary" class="!mt-4" @click="saveSSL">保存</el-button>
				</div>
				<ul class="list-disc text-secondary px-[20px] pt-[12px] leading-8">
					<li>
						<div class="flex items-center">
							粘贴您的*.key以及*.pem内容，然后保存即可
							<bt-link href="https://www.bt.cn/bbs/thread-105443-1-1.html">帮助</bt-link>
						</div>
					</li>
					<li>如果浏览器提示证书链不完整,请检查是否正确拼接PEM证书</li>
					<li>PEM格式证书 = 域名证书.crt + 根证书(root_bundle).crt</li>
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
					<!-- <el-form-item label="邮箱" v-if="sslPanel.sllType == 2">
						<div class="w-[28rem]">
							<bt-input v-model="sslPanel.email" :rows="4"></bt-input>
						</div>
					</el-form-item> -->
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

		<bt-dialog v-model="tableDialog" :area="70" :title="`手动${sslPanel.resource === 'dns' ? '解析TXT记录' : '创建验证文件'}`">
			<div class="p-[1.5rem]">
				请按以下列表做TXT解析:
				<bt-table-group>
					<template #content>
						<div class="max-h-[38rem] overflow-auto">
							<template v-for="(item, index) in authList">
								<div v-if="item.data.length" :key="index">
									<span>验证域名：{{ item.domain }}</span>
									<bt-table class="my-[1rem]" :column="verifyTableColumns" :data="item.data"></bt-table>
								</div>
							</template>
						</div>
					</template>
					<template #footer-right>
						<el-button @click="handleVerify">验证</el-button>
					</template>
				</bt-table-group>
				<bt-help :options="tableHelpList" listStyle="disc" class="ml-[20px]" />
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import { Message } from '@hooks/tools'
import { getConfigStore } from '@config/useStore'
import { copyText, emptyCookie, hasOwnProperty } from '@utils/index'
import { getCertSource, savePanelSsl, setPanelSsl, getPanelSsl } from '@/api/config'
import type { ssslInfoType } from '@config/type.d'

import ConfigRows from '@config/public/config-rows-new'
import { useDataHandle, useDialog } from '@hooks/tools'

const {
	refs: { safeConfig, noPortConfig, openSSLPopup },
} = getConfigStore()

// 弹窗开关
const sslConfigPopup = ref(false)
const showPopup2 = ref(false)
const showPopup3 = ref(false)

const checkOffSsl = ref(false) // 关闭SSL验证
const checkOffSslTimer = ref<any>() // 关闭SSL验证-定时器
const checkOffSslNum = ref(5) // 关闭SSL验证-倒计时

const sslPanel = ref({
	sllType: 1,
	privateKey: '',
	certPem: '',
	checked: false,
	email: '',
	resource: 'http',
})

// 面板ssl信息配置
const panelSslConfig = ref({
	cert_type: '',
	domain: '',
	email: '',
})

// 弹窗加载状态
const sslConfigLoad = ref(false)

// ssl证书信息
const sslInfo = ref<ssslInfoType>({
	certPem: '',
	download_root: false,
	info: {},
	privateKey: '',
	rep: false,
	root_password: '',
})

const options = [
	{ title: '自签证书', key: 1, disabled: false },
	{ title: "Let's Encrypt", key: 2, disabled: !safeConfig.value.domain },
	{ title: '其他证书', key: 3, disabled: false },
]

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

const tableHelpList = [
	{ content: '解析域名需要一定时间来生效,完成所以上所有解析操作后,请等待1分钟后再点击验证按钮' },
	{
		content: `可通过CMD命令来手动验证域名解析是否生效:
		 nslookup -q=txt _acme-challenge.${safeConfig.value.domain?.replace('*.', '')}`,
	},
	{ content: '若您使用的是宝塔云解析插件,阿里云DNS,DnsPod作为DNS,可使用DNS接口自动解析' },
]

// 验证表格列
const verifyTableColumns = [
	{ label: '解析域名', prop: 'domain' },
	{
		label: '记录值',
		showOverflowTooltip: true,
		render(row: any) {
			const str = sslPanel.value.resource === 'dns' ? row.auth_value : row.file_path
			return (
				<div class="flex items-center">
					<div class="truncate w-[15rem]">{str}</div>
					<span class="svgtofont-icon-copy ml-[4px] text-secondary text-medium w-[1.6rem] cursor-pointer" onClick={() => copyText({ value: str })}></span>
				</div>
			)
		},
	},
	{
		label: '类型',
		render: (row: any) => {
			if (sslPanel.value.resource === 'dns') return <span>{row.type}</span>
			return (
				<div class="flex items-center">
					<div class="truncate w-[15rem]">{row.content}</div>
					<span class="svgtofont-icon-copy ml-[4px] text-secondary text-medium w-[1.6rem] cursor-pointer" onClick={() => copyText({ value: row.content })}></span>
				</div>
			)
		},
	},
	{ label: '必需', prop: 'must', width: 100 },
]

/**
 * @description 手动验证
 **/
const handleVerify = async () => {
	try {
		const progress: any = await openProgress()
		const { data } = await setPanelSsl(verifyParams)
		progress?.close()
		Message.request(data)
		if (data.status) handleResult(data)
	} catch (error) {
		console.log(error)
	} finally {
		tableDialog.value = false
	}
}

/**
 * @description: 点击面板SSL配置，打开弹窗
 */
const openSslConfig = () => {
	sslConfigPopup.value = true
	getSslInfo()
}

/**
 * @description: 首页跳转，打开弹窗
 */
const openSSL = () => {
	showPopup3.value = true
	getCertificate()
}

/**
 * @description: 外层面板SSL开关
 */
const onChange = (panelSSl: boolean) => {
	panelSSl ? ((showPopup3.value = true), getCertificate()) : (showPopup2.value = true)
	if (!panelSSl) {
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

const downLoadCert = (cert: string) => {
	window.open(cert, '_blank', 'noopener,noreferrer')
}

/**
 * @description: 弹层面板SSL开关
 */
const changePanelSsl = (panelSSl: boolean) => {
	let cert_type = panelSSl ? 1 : 0
	setSslInfo(cert_type, sslInfo.value.privateKey, sslInfo.value.certPem)
}

/**
 * @description: 弹窗确认按钮
 * @param val false：关闭SSL true：面板证书SSL
 */
const onConfirm = (val: boolean) => {
	if (!checkOffSsl.value && !val) {
		return Message.error('请勾选并同意承担风险')
	}
	if (val) {
		setSslInfo(1, sslPanel.value.privateKey, sslPanel.value.certPem)
	} else {
		setSslInfo(0)
		showPopup2.value = false
	}
}

/**
 * @description 检测粘贴板中是否包含证书或密钥
 * @param {string} type - 检测类型，'key'表示密钥，'cert'表示证书
 * @returns {Promise<string>} 返回检测到的证书或密钥内容，如果没有则返回空字符串
 */
const detectCertFromClipboard = async (type: 'key' | 'cert', value: string): Promise<void> => {
	if (value) return
	try {
		// 从粘贴板获取文本
		const clipboardText = await navigator.clipboard.readText()

		// 定义正则表达式匹配证书和密钥的模式
		const keyPatterns = [
			// 私钥模式
			/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/,
			// RSA私钥模式
			/-----BEGIN RSA PRIVATE KEY-----[\s\S]*?-----END RSA PRIVATE KEY-----/,
			// EC私钥模式
			/-----BEGIN EC PRIVATE KEY-----[\s\S]*?-----END EC PRIVATE KEY-----/,
		]

		const certPatterns = [
			// 证书模式
			/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/,
			// CSR请求模式
			/-----BEGIN CERTIFICATE REQUEST-----[\s\S]*?-----END CERTIFICATE REQUEST-----/,
		]

		// 根据类型选择要检测的模式
		const patterns = type === 'key' ? keyPatterns : certPatterns

		// 遍历所有模式进行匹配
		for (const pattern of patterns) {
			const match = clipboardText.match(pattern)
			if (match && match[0]) {
				Message.success(`已从粘贴板检测到${type === 'key' ? '密钥' : '证书'}`)
				switch (type) {
					case 'key':
						sslInfo.value.privateKey = match[0]
						break
					case 'cert':
						sslInfo.value.certPem = match[0]
						break
				}
			}
		}
	} catch (error) {
		console.error('读取粘贴板失败:', error)
		// Message.error('读取粘贴板失败，请检查浏览器权限');
	}
}

/**
 * @description: 弹窗取消按钮
 * @param val false：关闭SSL true：面板证书SSL
 */
const cancel = (val: boolean) => {
	if (val) {
		showPopup3.value = false
	} else {
		showPopup2.value = false
	}
	safeConfig.value.panelSSl = !safeConfig.value.panelSSl
}

/**
 * @description: 切换证书类型
 */
const changeSllType = (val: number) => {
	sslPanel.value.sllType = val
}

/**
 * @description: 保存面板证书配置
 */
const saveSSL = async () => {
	sslConfigLoad.value = true
	try {
		await useDataHandle({
			loading: '正在保存面板证书配置，请稍候...',
			request: savePanelSsl({
				privateKey: sslInfo.value.privateKey,
				certPem: sslInfo.value.certPem,
			}),
			message: true,
			success: getSslInfo,
		})
	} catch (err) {
		console.log(err)
	} finally {
		sslConfigLoad.value = false
	}
}

/**
 * @description 复制密码
 * @param {string} value
 */
const copyCertPaw = (value: string) => {
	if (!value) return Message.error('当前密码为空，无法复制！')
	copyText({ value })
}

/**
 * @description: 证书夹列表
 */
const openSslFolder = () => {
	useDialog({
		title: '证书夹',
		area: 70,
		compData: {
			onRefresh: (data: any) => {
				sslInfo.value.certPem = data?.fullchain || ''
				sslInfo.value.privateKey = data?.privkey || ''
				sslInfo.value.info = data?.info || {}
			},
		},
		component: () => import('./cert-folder.vue'),
	})
}

/**
 * @description: 获取ssl信息
 */
const getSslInfo = async () => {
	sslConfigLoad.value = true
	try {
		await useDataHandle({
			loading: '正在获取面板证书配置，请稍候...',
			request: getPanelSsl(),
			success: (res: any) => {
				sslInfo.value = res.data
				sslPanel.value.privateKey = res.data?.privateKey
				sslPanel.value.certPem = res.data?.certPem
			},
		})
	} catch (err) {
		console.log(err)
	} finally {
		sslConfigLoad.value = false
	}
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
 * @description: 设置面板证书配置
 * @param data.cert_type — 面板SSL开关，1为开，0为关
 * @param data.privateKey — 密钥(KEY)
 * @param data.certPem — 证书(PEM格式)
 */
const setSslInfo = async (cert_type?: number | string, privateKey?: string, certPem?: string) => {
	try {
		const params: any = { cert_type, privateKey, certPem }
		let progress: any, loads: any, data: any
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
			loads = Message.load('正在设置面板证书配置，请稍候...')
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
 * @description : 验证证书
 */
const handleResult = async (data: any, params?: any) => {
	if (data.status) {
		const load = Message.load('正在刷新页面，请稍候...')
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
	Message.request(data)
}

/**
 * @description: 点击面板SSL配置，打开弹窗
 */
const openProgress = () => {
	return useDialog({
		area: [50, 25],
		component: () => import('./cert-progress.vue'),
	})
}

watch(noPortConfig, val => {
	if (val.value) {
		sslInfo.value.privateKey = noPortConfig.value.key
		sslInfo.value.certPem = noPortConfig.value.cert
		sslInfo.value.info.subject = noPortConfig.value.certInfo.subject
		sslInfo.value.info.issuer = noPortConfig.value.certInfo.issuer
		sslInfo.value.info.notAfter = noPortConfig.value.certInfo.notAfter
	}
})

watch(
	openSSLPopup,
	val => {
		if (val) {
			openSSL()
			openSSLPopup.value = false
		}
	},
	{
		deep: true,
	}
)

// 添加新的统一处理方法
const handleDialogAction = (isSSLDialog: boolean) => {
	const dialogRef = isSSLDialog ? showPopup3 : showPopup2
	if (!dialogRef.value) return // 如果已经关闭则不再执行
	cancel(isSSLDialog)
}

const handleDialogConfirm = (isSSLDialog: boolean) => {
	const dialogRef = isSSLDialog ? showPopup3 : showPopup2
	if (!dialogRef.value) return // 如果已经关闭则不再执行
	onConfirm(isSSLDialog)
}
</script>

<style lang="css" scoped>
:deep(.el-form.sslPanel .el-form-item--small .el-form-item__label) {
	min-width: 5rem !important;
	margin-right: 1rem;
}
</style>
