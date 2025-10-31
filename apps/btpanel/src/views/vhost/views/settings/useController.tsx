import { useMessage, useDialog, useConfirm } from '@/hooks/tools'
import { setServiceStatus, closeServerSslApi, setServerAddressApi, saveServerSslApi } from '@/api/vhost'
import { useSettingsStore } from './useStore'
import setSsl from './setSsl/index.vue'

const { request: $request, error: $error } = useMessage()
const { getInfo, hasCert, serverIP, serverProtocol, serverPort, certInfo, getCertInfo } = useSettingsStore()

const statusMap = new Map([
	['start', '启动'],
	['stop', '停止'],
	['reload', '重载'],
	['restart', '重启'],
])

/**
 * @description 重启服务
 * @param {string} type 服务类型
 */
export const onSetService = (type: string) => {
	const statusStr = statusMap.get(type) || ''
	useConfirm({
		title: `${statusStr}服务`,
		content: `是否${statusStr}虚拟主机服务，是否继续？`,
		onConfirm: async () => {
			const rdata = await setServiceStatus(type)
			console.log(rdata)
			await $request(rdata)
			getInfo()
		},
	})
}

export const editSslEvent = async () => {
	if (!hasCert.value) {
		$error('请先上传证书')
		return
	}
	useDialog({
		title: '设置SSL证书',
		area: 70,
		component: setSsl,
		showFooter: true,
		onOpen: () => {
			getCertInfo()
		},
		onConfirm: async () => {
			const { certificate, private_key } = certInfo.value
			const rdata = await saveServerSslApi(certificate, private_key)
			await $request(rdata)
		},
	})
}

// 设置服务器IP
export const editHostEvent = async () => {
	if (serverIP.value === '') {
		$error('Please enter the server IP')
		return
	}
	const rdata = await setServerAddressApi(serverIP.value)
	await $request(rdata)
}

/**
 * @description 跳转到登录地址
 */
export const jumpToAddressEvent = () => {
	window.open(`${serverProtocol.value}://${serverIP.value}${serverPort.value}/account/login`, '_blank', 'noopener,noreferrer')
}
