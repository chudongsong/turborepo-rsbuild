import { closeSiteHttps, downloadCert, setProxyHttps, setDockerHttps, ignoreHttpsMode, setSiteHttps, setSslInfo, updateSslTask, setHttpsMode } from '@/api/site'
import { phpAdvancedSettingsDialog } from '@site/views/php-model/useController'
import { openCommonSettingsDialog } from '@docker/views/docker-site/useController'
import { Message, useConfirm, useDataHandle } from '@/hooks/tools'
import { sslExpireDialog } from '@/views/site/useController'
import { useSiteStore } from '@/views/site/useStore'
import { getSslInfoConfig, mountEvent } from '../useController'
import { useSiteSSLStore } from '../useStore'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'

const { sslInfo, sslTabActive } = useSiteSSLStore()
const { siteInfo, siteType, isRefreshList } = useSiteStore()
const { isRefreshLocalList } = storeToRefs(useWPLocalStore())
export const sslHelp = [
	{
		content: () => (
			<span>
				粘贴您的*.key以及*.pem内容，然后保存即可
				<a href="http://www.bt.cn/bbs/thread-704-1-1.html" class="text-primary" target="_blank">
					[帮助]
				</a>
				。
			</span>
		),
	},
	{ content: '如果浏览器提示证书链不完整,请检查是否正确拼接PEM证书' },
	{ content: 'PEM格式证书 = 域名证书.crt + 根证书(root_bundle).crt' },
	{
		content: '在未指定SSL默认站点时,未开启SSL的站点使用HTTPS会直接访问到已开启SSL的站点',
	},
	{ content: '如开启后无法使用HTTPS访问，请检查安全组是否正确放行443端口' },
] // 是否显示ssl帮助

/**
 * @description 切换证书类型
 * @param {number} type - 证书类型
 */
export const cutSslType = (type: number) => {
	switch (type) {
		case 3: // 商业证书
			sslTabActive.value = 'busSslList'
			break
		case 2: // 宝塔SSL
			sslTabActive.value = 'trustAsiaList'
			break
		case 1: // Let's Encrypt
			sslTabActive.value = 'letsEncryptList'
			break
		case 0: // 当前证书
			sslTabActive.value = 'currentCertInfo'
			break
		default:
			sslTabActive.value = 'certFolderList'
			break
	}
}

export const isCloseCert = ref(false) // 是否关闭证书到期提醒
export const isAll = ref(false) // 是否应用到所有站点

/**
 * @description 到期提醒开关
 */
export const cutSslExpireEvent = async (val: boolean | string | number) => {
	if (!val) {
		isAll.value = sslInfo.value.push.task_data.project === 'all'
		isCloseCert.value = true
	} else {
		sslExpireDialog({
			onCancel: () => {
				sslInfo.value.pushAlarm = !val
			},
		})
	}
}

/**
 * @description 获取参数
 */
const getParamsClose = () => {
	const { id, task_data, sender } = sslInfo.value.push
	return {
		template_id: 1,
		task_id: id,
		status: 0,
		task_data: JSON.stringify({
			task_data: {
				status: false,
				type: 'site_ssl',
				project: isAll.value ? 'all' : siteInfo.value.name,
				cycle: parseInt(task_data.cycle),
				title: '网站SSL到期提醒',
				// module: expireConfigure.value.push.join(','), // 通知方式
				interval: 600,
				tid: 1, // 新告警模板id
				// push_count: parseInt(expireConfigure.value.cycle),
			},
			sender: sender, // 通知方式
			time_rule: {
				send_interval: 0, // 发送间隔
				time_range: [0, 86399], // 每天可发送时间范围
			},
			number_rule: {
				day_num: 0, // 每天发送次数
				total: 3, // 总次数
			},
		}),
	}
}

/**
 * @description 取消关闭证书到期提醒
 */
export const closeRemindCancel = () => {
	sslInfo.value.pushAlarm = true
}

/**
 * @description 关闭证书到期提醒
 */
export const closeRemindConfirm = async () => {
	isCloseCert.value = false
	let load: any
	try {
		load = Message.load('正在关闭证书到期提醒，请稍后...')

		const params = getParamsClose()
		const res = await updateSslTask(params)
		Message.request(res)
		if (res.status) getSslInfoConfig()
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
	}
}

/**
 * @description 保存并启用证书
 * @returns void
 */
export const saveAndEnableCertEvent = async () => {
	let csrChange = false
	const { key, csr, type } = sslInfo.value
	const { name } = siteInfo.value

	if (!certKey.value && !certCsr.value) return Message.error('请填写完整的证书内容')
	if (certKey.value !== key || certCsr.value !== csr) {
		csrChange = true
		await useConfirm({
			title: '证书保存提示',
			content: '当前证书内容发生改变，证书信息将同步更新，继续操作？',
		})
	}

	// 接口参数
	const paramsType: AnyObject = {
		proxy: {
			site_name: name,
			key: certKey.value,
			csr: certCsr.value,
		},
		docker: {
			site_name: name,
			key: certKey.value,
			csr: certCsr.value,
		},
		default: {
			type: csrChange ? 0 : type,
			siteName: name,
			key: certKey.value,
			csr: certCsr.value,
		},
	}

	await useDataHandle({
		loading: '正在保存证书信息，请稍后...',
		request: setSslInfo(paramsType[siteType.value] || paramsType.default, siteType.value),
		message: true,
		success: (res: any) => {
			if (res.status) {
				isRefreshList.value = true // 刷新网站列表
				isRefreshLocalList.value = true // 刷新wp本地列表
				getSslInfoConfig() // 重新获取证书信息
			}
		},
	})
}

/**
 * @description 强制HTTPS切换
 * @param {boolean} val - 是否开启
 * @returns void
 */
export const forceHttpsChangeEvent = async (val: boolean | string | number) => {
	try {
		if (!val) {
			await useConfirm({
				title: '关闭强制HTTPS',
				content: '关闭强制HTTPS后需要清空浏览器缓存才能生效,是否继续操作?',
				icon: 'warning-filled',
			})
		}

		const { name } = siteInfo.value
		const type = siteType.value

		// 请求参数
		const paramsType: AnyObject = {
			proxy: {
				site_name: name,
				force_https: val ? '1' : '0',
			},
			docker: {
				site_name: name,
				force_https: val ? '1' : '0',
			},
			default: {
				siteName: name,
			},
		}
		const params = paramsType[type] || paramsType.default

		// 请求接口
		const requestType: AnyObject = {
			proxy: setProxyHttps,
			docker: setDockerHttps,
			default: val ? setSiteHttps : closeSiteHttps,
		}
		const request = requestType[type] || requestType.default

		await useDataHandle({
			loading: `正在${val ? '开启' : '关闭'}强制HTTPS，请稍后...`,
			request: request(params),
			message: true,
		})
		await getSslInfoConfig() // 重新获取证书信息
	} catch (error) {
		sslInfo.value.https = !val
	}
}

export const certKey = computed({
	get: () => sslInfo.value.key,
	set: value => {
		sslInfo.value.key = value
	},
}) // 证书密钥
export const certCsr = computed({
	get: () => sslInfo.value.csr,
	set: value => {
		sslInfo.value.csr = value
	},
}) // 证书密钥

/**
 * @description 下载证书
 * @returns void
 */
export const downloadCertMethodEvent = async () => {
	const params = {
		siteName: siteInfo.value.name,
		pem: certCsr.value,
		key: certKey.value,
	}
	const { status, msg }: any = await useDataHandle({
		loading: '正在下载证书，请稍后...',
		request: downloadCert(params),
		data: { status: Boolean, msg: String },
	})

	if (status) window.open('/download?filename=' + encodeURIComponent(msg))
}

let firstLoad = true // 判断是否第一次加载，第一次加载不执行mounted
export const initCurrent = () => {
	try {
		if (firstLoad) {
			firstLoad = false
		} else {
			// 第二次之后调用父组件的mounted方法
			mountEvent()
		}
	} catch (error) {
		console.log(error)
	}
}

/*******************expire**********************/

/**
 * @description 合并配置
 */
export const initExpire = () => {
	try {
		let form: any = {}
		//   expireConfigure.value.domainName = siteInfo.value.name;
		const { push } = sslInfo.value
		if (push && typeof push.status) {
			const { sender, module, status, id } = sslInfo.value.push
			const { cycle } = push.task_data
			form = {
				cycle: cycle || 30,
				push: Array.isArray(sender) ? sender : sender ? sender.split(',') : [],
				dueAlarm: push.status,
				id: id || new Date().getTime(),
				domainName: siteInfo.value.name,
			}
		}
		if (push?.task_data?.project === 'all' && push.status) {
			form.allSsl = true
			//     expireConfigure.value.allSsl = true;
		}
		//   if (props.compData) expireConfigure.value.dueAlarm = true;

		return { data: form, status: true }
	} catch (error) {
		console.log(error)
		return { status: false, msg: '获取证书到期提醒配置失败' }
	}
}

/**
 * @description 获取参数
 */
export const getParams = (params: any) => {
	const { id, allSsl, push, cycle, dueAlarm } = params
	return {
		template_id: 1,
		task_id: sslInfo.value.push.id,
		status: dueAlarm ? 1 : 0,
		task_data: JSON.stringify({
			task_data: {
				status: dueAlarm,
				type: 'site_ssl',
				project: allSsl ? 'all' : siteInfo.value.name,
				cycle: parseInt(cycle),
				title: '网站SSL到期提醒',
				interval: 600,
				tid: 1, // 新告警模板id
			},
			sender: push, // 通知方式
			time_rule: {
				send_interval: 0, // 发送间隔
				time_range: [0, 86399], // 每天可发送时间范围
			},
			number_rule: {
				day_num: 0, // 每天发送次数
				total: 3, // 总次数
			},
		}),
		// name: 'site_push',
		// id,
		// data: JSON.stringify({
		//   status: dueAlarm,
		//   type: 'ssl',
		//   project: allSsl ? 'all' : siteInfo.value.name,
		//   cycle: parseInt(cycle),
		//   title: '网站SSL到期提醒',
		//   module: push.join(','), // 通知方式
		//   interval: 600,
		//   push_count: parseInt(cycle),
		// }),
	}
}

/**
 * @description 提交
 */
export const onConfirmExpire = async (param: any, validate: any) => {
	try {
		await validate()
		const params = getParams(param.value)
		const res = await useDataHandle({
			loading: '正在设置到期提醒，请稍后...',
			request: updateSslTask(params),
			message: true,
		})

		getSslInfoConfig()
		return res.status
	} catch (error) {
		console.log(error)
		return false
	}
}

/**
 * @description 检测粘贴板中是否包含证书或密钥
 * @param {string} type - 检测类型，'key'表示密钥，'cert'表示证书
 * @returns {Promise<string>} 返回检测到的证书或密钥内容，如果没有则返回空字符串
 */
export const detectCertFromClipboard = async (type: 'key' | 'cert', value: string): Promise<void> => {
	console.log(value)
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
						certKey.value = match[0]
						break
					case 'cert':
						certCsr.value = match[0]
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
 * @description 开启https防窜站
 */
export const openHttpsMode = async (popupClose: () => void) => {
	try {
		popupClose()
		if (siteType.value === 'docker') {
			openCommonSettingsDialog('httpsOfficersSite')
		} else {
			phpAdvancedSettingsDialog('httpsOfficersSite')
		}
	} catch (error) {}
}

/**
 * @description 忽略https防窜站提醒
 */
export const ignoreHttpsModeEvent = async () => {
	try {
		await useDataHandle({
			request: ignoreHttpsMode({ siteName: siteInfo.value.name }),
		})
		await getSslInfoConfig() // 重新获取证书信息
	} catch (error) {}
}
