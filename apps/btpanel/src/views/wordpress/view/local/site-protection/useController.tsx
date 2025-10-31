import useWPProtectionStore from '@/views/wordpress/view/local/site-protection/useStore'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@/store/global'
import { Message, useDataHandle, useDialog } from '@/hooks/tools'
import { getPluginInfo } from '@/api/global'
import { closeFileProtection, closeFirewallProtection, getFileProtectionInfo, getPhpSiteSecurity, getSecurityInfo, openFileProtection, openFirewallProtection, setPhpSiteSecurity } from '@/api/wp'
import { isObject } from '@/utils'
import { pluginInstallDialog, productPaymentDialog } from '@/public'

const { file, fileLoad, firewall, firewallLoad, hotlink, hotlinkLoad, pid } = storeToRefs(useWPProtectionStore())
const { localRow } = storeToRefs(useWPLocalStore())
const { payment } = useGlobalStore()

// 开启/关闭文件保护
export const onUpdateFile = async (val: string | number | boolean) => {
	try {
		fileLoad.value = true
		if (payment.value.authType !== 'ltd') {
			// 开通企业版付费
			productPaymentDialog({
				disablePro: true,
				sourceId: 334,
			})
			return
		}
		const { data }: any = await getPluginInfo({
			sName: 'tamper_core',
		})

		if (!data.setup) {
			return pluginInstallDialog({
				type: 'i',
				name: 'tamper_core',
			})
		}
		if (val) {
			await useDataHandle({
				request: openFileProtection({ paths: [{ path: localRow.value.path, ps: localRow.value.ps }] }),
				loading: '正在开启文件保护...',
				message: true,
			})
		} else {
			await useDataHandle({
				request: closeFileProtection({ path_id: file.value.pid }),
				loading: '正在关闭文件保护...',
				message: true,
			})
		}
		init()
	} finally {
		fileLoad.value = false
	}
}

// 开启/关闭防火墙设置
export const onUpdateFirewall = async (val: string | number | boolean) => {
	try {
		firewallLoad.value = true
		if (payment.value.authType !== 'ltd') {
			// 开通企业版付费
			productPaymentDialog({
				disablePro: true,
				sourceId: 334,
			})
			return
		}
		const { data }: any = await getPluginInfo({
			sName: 'btwaf',
		})
		if (!data.setup) {
			return pluginInstallDialog({
				type: 'i',
				name: 'btwaf',
			})
		}
		if (val) {
			await useDataHandle({
				request: openFirewallProtection({ site_name: localRow.value.name }),
				loading: '正在开启防火墙设置...',
				message: true,
			})
		} else {
			await useDataHandle({
				request: closeFirewallProtection({ site_name: localRow.value.name }),
				loading: '正在关闭防火墙设置...',
				message: true,
			})
		}
		init()
	} finally {
		firewallLoad.value = false
	}
}

// 开启/关闭防盗链
export const onUpdateHotlink = async (val: string | number | boolean) => {
	try {
		hotlinkLoad.value = true
		const { data } = await getPhpSiteSecurity({ id: localRow.value.id, name: localRow.value.name })
		if (isObject(data)) {
			const params = {
				id: localRow.value.id,
				name: localRow.value.name,
				fix: data.fix,
				domains: data.domains,
				return_rule: data.return_rule,
				status: val,
				http_status: data.http_status === 'true',
			}
			await setPhpSiteSecurity(params)
			hotlink.value = !!val as boolean
		}
	} finally {
		hotlinkLoad.value = false
	}
}

// 设置加载状态
const setLoading = (load: boolean) => {
	fileLoad.value = load
	firewallLoad.value = load
	hotlinkLoad.value = load
}

// 初始化
export const init = async () => {
	try {
		setLoading(true)
		const {
			data: { msg },
		} = await getSecurityInfo({
			id: localRow.value.id,
			path: localRow.value.path,
			site_name: localRow.value.name,
		})

		if (isObject(msg)) {
			file.value.status = msg.file_status === 1
			file.value.number = msg.file_count

			firewall.value.status = msg.firewall_status === 1
			firewall.value.number = msg.firewall_count

			hotlink.value = msg.hotlink_status === 1

			// 判断是否开启文件保护
			if (msg.file_status === 1) {
				const {
					data: { msg },
				} = await getFileProtectionInfo({ path: localRow.value.path })
				if (isObject(msg)) {
					file.value.pid = msg.pid
				}
			}
		}
	} finally {
		setLoading(false)
	}
}

// 设置文件保护
export const onSetupFile = async () => {
	// if (payment.authType !== 'ltd') {
	// 	return Message.error('付费功能，请开通企业版');
	// }
	const { data }: any = await getPluginInfo({
		sName: 'tamper_core',
	})

	if (!data.setup) {
		return Message.error('插件未安装')
	}
	useDialog({
		title: `文件保护【${localRow.value.name}】`,
		area: 80,
		component: () => import('@/views/wordpress/view/local/site-protection/file/index.vue'),
	})
}

export const onUpdateStatus = async (val: boolean | string | number) => {
	try {
		fileLoad.value = true
		if (val) {
			await openFileProtection({ paths: [{ path: localRow.value.path, ps: localRow.value.ps }] })
		} else {
			await closeFileProtection({ path_id: file.value.pid })
		}
		file.value.status = val as boolean
	} finally {
		fileLoad.value = false
	}
}

/**
 * @description 基础设置列表
 **/
export const getBasicListData = async (params: any) => {
	try {
		const { data } = await getFileProtectionInfo({
			path: '',
		})
		return {
			data: data,
			total: 0,
		}
	} catch (error) {
		console.log(error)
		return { data: [], total: 0 }
	}
}

const configType = [
	{ title: 'Create file', name: 'create' },
	{ title: 'Modify file', name: 'modify' },
	{ title: 'Delete file', name: 'unlink' },
	{ title: 'Create directory', name: 'mkdir' },
	{ title: 'Delete directory', name: 'rmdir' },
	{ title: 'Rename file', name: 'rename' },
	{ title: 'Create soft link', name: 'link' },
	{ title: 'Modify permissions', name: 'chmod' },
	{ title: 'Modify owner', name: 'chown' },
]

export const getBasicListConfig = () => {
	return []
}
