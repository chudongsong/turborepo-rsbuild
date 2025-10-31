import { useDataHandle, useDialog } from '@/hooks/tools'
import { getSSHSecurityList, getSshKey, openSshKey, repairSecurity, setSshPort, setRoot, getAntiBlastLogs, setAntiConf } from '@/api/firewall'
import { setNotAuthStatus } from '@/api/config'
import { checkPort } from '@/utils'
import { useMessage } from '@/hooks/tools'
import { copyText } from '@/utils'
import { getPluginInfo } from '@/api/global'
import { pluginInstallDialog } from '@/public/index'

const message = useMessage()

export interface SecurityItem {
	id: number
	title: string
	description: string
	enabled: boolean
}

export const loading = ref(false)
export const securityItems = ref<SecurityItem[]>([])
export const totalScore = ref(100)
export const score = ref(0)
export const scoreText = ref('')
export const configData = ref<any>({})
export const minPasswordLength = ref(12)
export const complexityLevel = ref(4)
export const alarmPanelData = ref({})
export const alarmSSLData = ref({})
export const antiBruteForce = ref(false)
export const dynamePwdStatus = ref(false)
export const panelSslStatus = ref(false)

// 存储配置项的建议信息
export const configSuggestions = ref<Record<string, string>>({})

// 根据传入数据初始化状态值
export const initializeStatesFromData = (data: any) => {
	if (!data?.security_data) return

	data.security_data.forEach((item: any) => {
		// 存储建议信息
		if (item.suggest) {
			configSuggestions.value[item.name] = item.suggest
		}

		switch (item.name) {
			case 'SSH默认端口':
				if (item.value && typeof item.value === 'number') {
					sshPort.value = item.value.toString()
				}
				break
			case '密码复杂度策略':
				if (item.value && typeof item.value === 'number') {
					complexityLevel.value = item.value
				} else if (item.status) {
					complexityLevel.value = 4
				} else {
					complexityLevel.value = 1
				}
				break
			case '密码长度限制':
				if (item.value && typeof item.value === 'number') {
					minPasswordLength.value = item.value
				}
				break
			case 'SSH登录告警':
				alarmSSLData.value = item
				break
			case 'SSH防爆破':
				antiBruteForce.value = Boolean(item.status)
				break
			case '面板登录告警':
				alarmPanelData.value = item
				break
			case '面板登录动态口令认证':
				dynamePwdStatus.value = Boolean(item.status)
				break
			case '未登录响应状态码':
				if (item.value && typeof item.value === 'number') {
					responseCode.value = item.value
				}
				break
			case '面板开启SSL':
				panelSslStatus.value = Boolean(item.status)
				break
			case 'root登录设置':
				if (item.value && typeof item.value === 'string') {
					rootLoginType.value = item.value
				}
				break
		}
	})
}

export const fetchSecDetect = async () => {
	const res: any = await useDataHandle({
		loading,
		request: getSSHSecurityList(),
		data: { data: Object },
	})
	const payload = res?.data ?? res ?? {}
	const items: Array<any> = payload.security_data || []
	configData.value = payload || {}
	securityItems.value = items.map((item: any, idx: number) => ({
		id: idx + 1,
		title: item.name,
		description: item.desc,
		enabled: Boolean(item.status),
	}))
	totalScore.value = payload.total_score ?? 100
	score.value = payload.score ?? 0
	scoreText.value = payload.score_text ?? ''

	if (items.length > 0) {
		items.forEach((item: any) => {
			switch (item.name) {
				case 'SSH登录告警':
					alarmSSLData.value = item
					break
				case '面板登录告警':
					alarmPanelData.value = item
					break
			}
		})
	}
}

export const openRecommendConfig = () => {
	useDialog({
		component: () => import('./setting.vue'),
		title: '安全配置',
		area: [70, 80],
		compData: { configData: configData.value },
	})
}

/**
 * @description 随机生成端口
 * 端口规范范围：1024-65535 (避免使用系统保留端口 1-1023)
 * 推荐范围：10000-65535 (避免常用服务端口冲突)
 */
export const randomPort = () => {
	const minPort = 1000
	const maxPort = 65535
	const randomPort = Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort
	return randomPort.toString()
}

/**
 * @description: 设置未认证响应状态
 * @param status_code 未认证响应方式的id
 */

export const responseCode = ref(404)
export const responseCodeOptions = ref([
	{ key: 403, title: '403-拒绝访问' },
	{ key: 404, title: '404-页面不存在' },
	{ key: 416, title: '416-无效的请求' },
	{ key: 408, title: '408-客户端超时' },
	{ key: 400, title: '400-客户端请求错误' },
	{ key: 401, title: '401-未授权访问' },
])

export const applyResponseCode = async () => {
	await useDataHandle({
		loading: '正在设置未认证响应状态，请稍候...',
		request: setNotAuthStatus({ status_code: responseCode.value }),
		message: true,
		success: () => {
			fetchSecDetect()
		},
	})
}

/**
 * @description: 设置root登录
 * @param {string} val
 */
export const rootLoginType = ref('without-password')
export const applyRootLogin = async () => {
	await useDataHandle({
		loading: '正在设置root登录，请稍后...',
		request: setRoot({ p_type: rootLoginType.value }),
		message: true,
		success: () => {
			fetchSecDetect()
		},
	})
}

export const sshPort = ref('')
export const applySshPort = async () => {
	if (!checkPort(sshPort.value)) {
		message.error('端口格式错误，可用范围：1-65535')
		return
	}
	await useDataHandle({
		loading: '正在保存SSH端口，请稍后...',
		request: setSshPort(Number(sshPort.value)),
		message: true,
		success: () => {
			fetchSecDetect()
		},
	})
}

// SSH密钥相关状态
export const rootKeyForm = ref(false) // 查看root密钥弹窗
export const rootKey = ref('') // 密钥内容

/**
 * @description: 获取ssh密钥/下载密钥
 * @param {boolean} val 查看/下载 true:查看 false:下载
 */
export const downloadSshKey = async (val: boolean) => {
	const res: any = await useDataHandle({
		loading: '正在获取密钥信息，请稍后...',
		request: getSshKey(),
	})
	if (val && res.status) {
		rootKey.value = res.msg
		rootKeyForm.value = true
	} else {
		window.open('/ssh_security?action=download_key', '_blank', 'noopener,noreferrer')
	}
}

// 复制内容
export const copySshPaw = (value: string) => {
	copyText({ value })
}

// 下载密钥
export const downloadKey = () => {
	window.open('/ssh_security?action=download_key', '_blank', 'noopener,noreferrer')
}

// 重新生成ssh密钥
export const resetRootKeyEvent = async () => {
	await useDataHandle({
		loading: '正在重新生成SSH登录密钥，请稍后...',
		request: openSshKey({ ssh: 'yes', type: 'ed25519' }),
		message: true,
	})
	const data: any = await useDataHandle({
		loading: '正在获取密钥信息，请稍后...',
		request: getSshKey(),
	})
	if (!data.msg)
		return message.msg({
			type: 'warning',
			message: '请重新开启SSH密钥登录再查看密钥！',
		})
	rootKey.value = data.msg
}

/**
 * @description: 设置密码长度限制
 * @param {number} len 密码长度
 */
export const applyPasswordLength = async (len: number) => {
	try {
		await useDataHandle({
			loading: '正在设置密码长度限制，请稍候...',
			request: repairSecurity({
				data: JSON.stringify({
					name: '密码长度限制',
					args: {
						len: Number(minPasswordLength.value),
					},
				}),
			}),
			message: true,
			success: () => {
				fetchSecDetect()
			},
		})
	} catch (error) {
		console.error('设置密码长度失败:', error)
	}
}

/**
 * @description: 设置密码复杂度策略
 * @param {number} minclass 复杂度等级 (1-4)
 */
export const applyPasswordComplexity = async (minclass: number) => {
	try {
		await useDataHandle({
			loading: '正在设置密码复杂度策略，请稍候...',
			request: repairSecurity({
				data: JSON.stringify({
					name: '密码复杂度策略',
					args: {
						minclass: minclass,
					},
				}),
			}),
			message: true,
			success: () => {
				fetchSecDetect()
			},
		})
	} catch (error) {
		console.error('设置密码复杂度失败:', error)
	}
}

// 简单的节流函数
let complexityTimer: any = null
export const handleComplexityChange = (value: number) => {
	if (complexityTimer) {
		clearTimeout(complexityTimer)
	}
	complexityTimer = setTimeout(() => {
		applyPasswordComplexity(value)
	}, 500)
}

/**
 * @description: 打开告警表单
 */
export const openAlarmForm = (type: string, data: any) => {
	const templateId = type === 'panel' ? '8' : '7'
	const isEdit = data?.value?.status
	const refresh = (type: string) => {
		fetchSecDetect()
		console.log(alarmPanelData.value, 'type')
		if (type === 'panel') {
			;(alarmPanelData.value as any).status = true
		} else {
			;(alarmSSLData.value as any).status = true
		}
	}
	useDialog({
		title: isEdit ? '编辑告警任务' : '配置告警任务',
		component: () => import('@/views/config/views/alarm-notice/alarm-list/alarm-form/index.vue'),
		area: 80,
		showFooter: true,
		compData: {
			onRefresh: () => refresh(type),
			diyProcessTemplate: true,
			diyProcessTemplateTid: [templateId],
			isEdit,
			row: isEdit ? data.value : null,
		},
		onConfirm: (newTaskData?: any) => {},
	})
}

/**
 * @description: 设置防暴破
 */
export const onChangeSshBlast = async (val: boolean) => {
	antiBruteForce.value = !val
	const res: any = await useDataHandle({
		request: getPluginInfo({ sName: 'fail2ban' }),
	})

	if (!res.data.setup) {
		// 插件安装界面
		pluginInstallDialog({
			name: res.data.name,
			type: 'i',
			pluginInfo: res.data,
		})
		message.warn('请先安装防暴破插件')
		return
	}
	await useDataHandle({
		loading: '正在' + (val ? '开启' : '关闭') + '防暴破，请稍后...',
		request: setAntiConf({ act: val }),
		message: true,
	})
	antiBruteForce.value = val
	fetchSecDetect()
}

/**
 * @description: 点击安全打开转配置
 * @param {SecurityItem} item 安全项
 */
export const handleItemClick = (item: SecurityItem) => {
	if (!item.enabled) {
		openRecommendConfig()
	}
}
