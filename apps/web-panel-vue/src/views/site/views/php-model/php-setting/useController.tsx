import { getPluginInfo } from '@/api/global'
import { Message, useConfirm } from '@/hooks/tools'
import { useHandleError } from '@/hooks/tools'
import { useDialog } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'
import { openPluginView, pluginInstallDialog, productPaymentDialog } from '@/public'
import { useGlobalStore } from '@/store/global'
import { getPhpSiteSafe, getPhpSiteSafeLog, getPhpVersion, getPhpVersionSafe, getProjectRunState, getProtectStatus, getSessionStatus, getSitePhpVersion, modifyProjectAsync, setPhpVersionSafe, setProtectStatus, setSessionStatus, setSitePhpVersion } from '@api/site'
import { SITE_STORE, useSiteStore } from '@site/useStore'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'
import { updatePhpNotice } from '@/views/wordpress/view/local/site-config/useController'

const { payment } = useGlobalStore()

const { authType } = payment.value
const { siteInfo, isRefreshList } = useSiteStore()
const { setSiteInfo } = SITE_STORE()
const { isRefreshLocalList } = storeToRefs(useWPLocalStore())

// 版本相关数据
export const otherInput = ref<any>(null) // 自定义版本输入框ref
export const versionData = reactive({
	phpVersion: '', // PHP版本
	other: '', // 自定义版本
	options: [] as any, // 版本列表
	helpIndex: 0, // 帮助索引
	toggleShow: false, // 切换按钮显示
	noInstall: false, // 当前版本是否未安装
})
export const phpOther = ref<any>('') // 存储自定义版本
// session隔离相关数据
export const sessionData = reactive({
	status: false, // 开关状态
})
// 站点防护相关数据
export const siteProtectData = reactive({
	status: false, // 开关状态
	version: '', // 当前版本
	deCompatible: false, // 是否兼容
	today: 0, // 今日告警数
	total: 0, // 总告警数
	tips: true, // 遮罩显示
	tipsIndex: 0, // 遮罩索引
	safeTip: {
		show: false, // 是否显示
		alarmTip: false, // 是否显示告警提示
		safeTip: false, // 是否显示开启防护提示
		allTip: false, // 是否两个都没设置
	}, // 版本防护提示
})
export const monitorData = reactive<any>({
	list: [],
	path: '',
}) // 监视器表格数据
export const viewLoading = ref(false) // 表单加载状态
// 版本帮助列表
export const phpVersionHelp = [
	[
		// 默认
		{
			content: '请根据您的程序需求选择版本',
		},
	],
	[
		// 自定义
		{
			content: '请根据您的程序需求选择版本',
		},
		{
			content: '【自定义】可自定义PHP连接信息，选择此项需填写可用的PHP连接配置',
		},
		{
			content: '【自定义】当前仅支持nginx，可配合[宝塔负载均衡 - 重构版]插件的TCP负载功能实现PHP负载集群',
		},
		{
			content: '【PHP连接配置】支持TCP或Unix配置，示例：192.168.1.25:9001 或 unix:/tmp/php8.sock',
		},
	],
	[
		// PHP7
		{
			content: '请根据您的程序需求选择版本',
		},
		{
			content: 'PHP7不支持mysql扩展，默认安装mysqli以及mysql-pdo。',
		},
	],
	[
		// PHP52
		{
			content: '请根据您的程序需求选择版本',
		},
		{
			content: '若非必要,请尽量不要使用PHP5.2,这会降低您的服务器安全性；',
		},
	],
]
// session隔离帮助列表
export const sessionHelp = [
	{
		content: '开启后将会把session文件存放到独立文件夹，不与其他站点公用存储位置',
	},
	{
		content: '若您在PHP配置中将session保存到memcache/redis等缓存器时，请不要开启此选项',
	},
]
// 站点防护帮助列表
export const siteProtectHelp = [
	{
		content: '基于PHP内核的监控工具，实时监控网站木马、漏洞等其他入侵行为，发现木马支持自动隔离',
	},
	{
		content: '安全告警默认会监视当前网站访问非当前网站文件的行为(例：你的站点A.com访问了站点B.com的文件或者目录)，通过添加监视器路径，当路径被访问时发送告警/redis等缓存器时，请不要开启此选项',
	},
]
/**
 * @description: 选择版本
 */
export const eventSelect = (val: string) => {
	versionData.phpVersion = val
	versionData.toggleShow = val !== siteProtectData.version
	// versionData.noInstall = !versionData.toggleShow
	// if (versionData.noInstall) {
	// 	versionData.toggleShow = false
	// }
	versionData.noInstall = versionData.options.some((item: any) => {
		return item.key === val && item?.noInstall
	})
	isPhpVersion(val)
}
/**
 * @description: 判断php版本
 * @param {string} val 版本
 */
export const isPhpVersion = (val: string) => {
	switch (val) {
		case 'other':
			versionData.helpIndex = 1
			break
		case '52':
			versionData.helpIndex = 3
			break
		default:
			if (val[0] === '7') {
				versionData.helpIndex = 2
			} else {
				versionData.helpIndex = 0
			}
			break
	}
}

/**
 * @description 获取项目信息
 */
export const getInfoEvent = async () => {
	try {
		const { data: res } = await getProjectRunState({ sitename: siteInfo.value.name })
		res.data.is_power_on = res.data.is_power_on === 1
		setSiteInfo(res.data)
	} catch (error) {
		console.log(error, 'error')
	}
}

/**
 * @description: 处理自定义版本输入
 * @param {string} val 输入值
 */
export const handleOtherInput = (val: string) => {
	versionData.other = val
	if (val !== phpOther.value) {
		versionData.toggleShow = true
	} else {
		versionData.toggleShow = false
	}
}

/**
 * @description: 切换版本
 */
export const setVersion = async () => {
	if (siteInfo.value?.project_type === 'phpasync') {
		console.log(versionData.phpVersion, 'versionData.phpVersion')
		let loading = Message.load('正在保存，请稍后...')
		let param: any = {
			sitename: siteInfo.value.name,
			...siteInfo.value,
			is_power_on: siteInfo.value.is_power_on ? 1 : 0,
			...siteInfo.value.project_config,
			php_version: versionData.phpVersion,
		}
		delete param.status
		delete param.ps
		delete param.project_config
		const res = await modifyProjectAsync(param)
		loading.close()
		Message.request(res)
		if (res.status) {
			getInfoEvent()
			isRefreshList.value = true
			versionData.toggleShow = false // 关闭切换按钮
		}
		return
	}
	if (versionData.phpVersion === 'other') {
		if (versionData.other === '') {
			Message.error('自定义PHP版本时，PHP连接配置不能为空')
			otherInput.value.$refs.inputRef.focus()
			return
		}
	}
	const res = await setSitePhpVersion({
		siteName: siteInfo.value.name,
		version: versionData.phpVersion,
		other: versionData.other,
	})
	if (!res.status) {
		// 报错信息
		Message.msg({
			customClass: 'bt-message-error-html',
			dangerouslyUseHTMLString: true,
			message: res.msg || res,
			type: 'error',
			duration: 0,
			showClose: true,
		}) // 提示错误信息
	} else {
		Message.request(res)
		isRefreshList.value = true
		isRefreshLocalList.value = true
		versionData.toggleShow = false // 关闭切换按钮
	}
	if (res.status) {
		init()
		updatePhpNotice()
	}
}

/**
 * @description: 设置session隔离
 */
export const setSessionEvent = async (val: boolean) => {
	const act = val ? 1 : 0
	const res = await setSessionStatus({ id: siteInfo.value.id, act })
	Message.request(res)
	getSessionStatusData()
}

/**
 * @description: 判断站点防护兼容
 * @param {string} val 版本
 */
export const isSiteProtect = async (val: string) => {
	siteProtectData.tips = true
	siteProtectData.version = val
	const blackArr = ['52', '00', '82']
	siteProtectData.tips = blackArr.includes(val)
	if (siteProtectData.tips) {
		siteProtectData.tipsIndex = 0
		return
	}
	const { data } = await getPluginInfo({ sName: 'security_notice' })
	siteProtectData.tips = true
	if (!data?.setup && data.endtime >= 0) {
		// 未安装
		siteProtectData.tipsIndex = 1
	} else if (data.endtime < 0) {
		// 未购买
		siteProtectData.tipsIndex = 2
	} else {
		siteProtectData.tips = false
		await getProtectData()
	}
}

/**
 * @description: 设置站点防护
 */
export const setProtextEvent = async (val: boolean) => {
	try {
		if (siteProtectData.safeTip.safeTip) {
			siteProtectData.status = !siteProtectData.status
			Message.error(`请先开启PHP-${siteProtectData.version}防护`)
			return
		}
		if (siteProtectData.deCompatible) {
			siteProtectData.status = !siteProtectData.status
			return Message.error('当前版本不兼容安全防护功能')
		}
		await useConfirm({
			title: `${val ? '开启' : '关闭'}站点安全告警`,
			width: '35rem',
			icon: 'warning-filled',
			content: val ? '开启后，检测到安全问题时将会发送告警通知，是否继续？' : '关闭后，该网站将不再接收安全告警，是否继续？',
		})
		const res = await setProtectStatus({ siteName: siteInfo.value.name }, val)
		if (res.status) {
			Message.request(res)
		} else {
			siteProtectData.status = !siteProtectData.status
			Message.error('当前PHP版本未开启防护，无法设置该站点！')
		}
	} catch (error) {
		siteProtectData.status = !siteProtectData.status
		console.log(error)
	}
}

/**
 * @description: 监视器
 */
export const monitor = () => {
	useDialog({
		area: 93,
		isAsync: true,
		title: `【${siteInfo.value.name}】监视器`,
		component: () => import('./safe-monitor/index.vue'),
		compData: { data: monitorData.list, name: siteInfo.value.name, path: monitorData.path },
	})
}

/**
 * @description: 触发日志
 */
export const triggerLog = async () => {
	const res = await getPhpSiteSafeLog({ siteName: siteInfo.value.name, page: 1, limit: 10 })
	if (!res.status) {
		Message.error(res.msg)
		return
	}
	if (res.data.data.length == 0) {
		Message.error('暂无日志')
		return
	}
	useDialog({
		area: 93,
		isAsync: true,
		title: `【${siteInfo.value.name}】网站安全日志`,
		component: () => import('./safe-log/index.vue'),
		compData: { data: res.data.data, page: res.data.page },
	})
}

/**
 * @description: 设置版本防护告警
 */
export const setVersionProtect = async () => {
	try {
	} catch (error) {}
}
/**
 * @description: 开启特定版本防护
 */
export const openVersionProtect = async () => {
	await useConfirm({
		title: `开启【PHP-${siteProtectData.version}】防护`,
		width: '35rem',
		icon: 'warning-filled',
		content: `开启后，该版本下的所有站点将受到安全防护，是否继续？`,
	})
	await useDataHandle({
		loading: '正在开启防护，请稍后...',
		request: setPhpVersionSafe({ php_version: siteProtectData.version, enable: 1 }),
		message: true,
	})
	init()
}

/**
 * @description: 获取当前php版本
 */
export const getPhpVersionData = async () => {
	if (siteInfo.value?.project_type === 'phpasync') {
		versionData.phpVersion = siteInfo.value.php_version.replace('.', '')
		isSiteProtect(versionData.phpVersion)
	} else {
		const res = await getSitePhpVersion({ siteName: siteInfo.value.name })
		if (res.status) {
			versionData.phpVersion = res.data.phpversion
			if (versionData.phpVersion == 'other') {
				phpOther.value = res.data.php_other
				versionData.other = res.data.php_other
			}
			isSiteProtect(res.data.phpversion)
		}
	}
}

/**
 * @description: 获取php版本列表
 * @param {boolean} type 意义不明的参数
 */
export const getPhpVersionList = async (type: boolean) => {
	let params: any = {
		s_type: type === true ? 1 : 0,
		all: 1,
	}
	if (siteInfo.value?.project_type === 'phpasync') delete params.s_type
	const res = await getPhpVersion(params)
	if (res.status) {
		if (res.data.length > 0) {
			const data = siteInfo.value?.project_type === 'phpasync' ? res.data?.filter((item: any) => item.name !== '纯静态') : res.data
			versionData.options = data.map((item: any) => {
				return {
					title: item.name + (!item.status ? ' (未安装)' : ''),
					label: item.name,
					key: item.version,
					status: item.status,
				}
			})
			const currentVersion = versionData.options.find((item: any) => {
				return item.key === versionData.phpVersion
			})
			versionData.toggleShow = false
			versionData.noInstall = !currentVersion.status
			if (!currentVersion) {
				// 如果当前版本不在列表中，添加到列表中
				versionData.options.push({
					title: `PHP-${versionData.phpVersion}(未安装)`,
					key: versionData.phpVersion,
					noInstall: true,
				})
				versionData.noInstall = true
			}
		}
	}
}

/**
 * @description: 获取session隔离状态
 */
export const getSessionStatusData = async () => {
	try {
		const res = await getSessionStatus({ id: siteInfo.value.id })
		if (res.status) {
			sessionData.status = res.data
		}
	} catch (error) {
		useHandleError(error)
	}
}
/**
 * @description: 获取站点防护数据
 */
export const getProtectData = async () => {
	try {
		const res = await getProtectStatus()
		if (res.data.msg?.includes('插件不存在') || res.data.msg?.includes('未购买') || res.data.msg?.includes('已到期')) {
			siteProtectData.tips = true
			siteProtectData.tipsIndex = 1
			if (authType !== 'ltd') siteProtectData.tipsIndex = 2
			Message.error(res.data.msg)
			return false
		}
		// 判断是否设置告警
		const send: boolean = res.data.send
		// 获取已安装的php版本列表
		const ress = await getPhpVersionSafe()
		if (ress.status === false) {
			Message.error(ress.msg)
		}
		// 获取当前站点的php版本详细信息
		const phpVersions =
			ress.data.php_versions.filter((version: any) => {
				return version.v === siteProtectData.version
			}) || []
		// 是否需要开启版本防护
		const safeOpen: boolean = phpVersions.length > 0 && phpVersions?.at(0)?.state !== 1
		// 判断当前站点的php版本是否开启了安全告警或是否设置了告警
		if (safeOpen || !send) {
			// 展示设置告警
			!send && (siteProtectData.safeTip.alarmTip = true)
			// 是否2个都没设置
			if (safeOpen && !send) {
				siteProtectData.safeTip.allTip = true
			}
			// 展示开启防护
			safeOpen && (siteProtectData.safeTip.safeTip = true)
			// 展示提示
			siteProtectData.safeTip.show = true
		}
		if (!safeOpen) {
			siteProtectData.safeTip.safeTip = false
			siteProtectData.safeTip.allTip = false
		}
		if (send) {
			siteProtectData.safeTip.alarmTip = false
			siteProtectData.safeTip.allTip = false
		}
		if (!safeOpen && send) {
			siteProtectData.safeTip.show = false
		}

		// 获取当前站点防护数据列表
		const siteRes = await getPhpSiteSafe()
		if (!siteRes.status) {
			Message.error(siteRes.msg)
		}
		// 获取当前站点的防护数据
		const siteData = siteRes.data.sites.find((site: any) => {
			return site.path === siteInfo.value.path && site.site_name === siteInfo.value.name
		})
		if (siteData) {
			siteProtectData.today = siteData.total.day_total || 0
			siteProtectData.total = siteData.total.total || 0
			siteProtectData.status = siteData.open
			siteProtectData.deCompatible = siteData.version.indexOf('暂不兼容') != -1
			monitorDataHandle(siteData.config.file_info)
			monitorData.path = siteData.path
		}
	} catch (error) {
		useHandleError(error)
	}
}

// 监视器表格数据处理
export const monitorDataHandle = (data: any) => {
	const arr = []
	for (const key in data) {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			arr.push({
				...data[key],
				path: key,
			})
		}
	}
	monitorData.list = arr
}

/**
 * @description: 安装php
 */
export const installVersion = async (version?: any) => {
	try {
		const key = (version || versionData.phpVersion).split('')
		const name = `php-${key[0]}.${key[1]}`
		// const { data } = await getPluginInfo({
		// 	sName: name,
		// })
		// await openPluginView({ name, softData: data })
		pluginInstallDialog({
			type: 'i',
			name,
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 打开插件
 */
export const openPlugin = async () => {
	try {
		const { data } = await getPluginInfo({
			sName: 'security_notice',
		})
		await openPluginView({ name: 'security_notice', softData: data })
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 安装安全告警插件
 */
export const installSecurityNotice = async () => {
	try {
		await pluginInstallDialog({
			type: 'i',
			name: 'security_notice',
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 打开购买
 */
export const openPayView = () => {
	productPaymentDialog({
		sourceId: 114,
	})
}

// 获取数据
export const init = async () => {
	viewLoading.value = true
	try {
		if (siteInfo.value?.project_type === 'phpasync') {
			await getInfoEvent()
		}
		await getPhpVersionData()
		await getPhpVersionList(true)
		await getSessionStatusData()
	} catch (error) {
		console.log(error)
	} finally {
		viewLoading.value = false
	}
}
