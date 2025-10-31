// 以下代码禁止修改，如需修改请联系作者：文良

import { useAxios } from '@/hooks/tools'
import { isFunction } from '@/utils'

/**
 * @description 判断函数是否存在
 * @param {string} funcName 函数名
 * @returns
 */
const isExistsFunction = (funcName: string): boolean => {
	try {
		// eslint-disable-next-line no-eval
		if (isFunction(eval(funcName))) return true
	} catch (e) {
		// console.log(e);
	}
	return false
}

/**
 * @description 将ip转换为整数
 * @param {string} a ip地址
 */
const iToint = (a: string): number => {
	let num = 0
	const aArr = a.split('.')
	num = Number(aArr[0]) * 256 * 256 * 256 + Number(aArr[1]) * 256 * 256 + Number(aArr[2]) * 256 + Number(aArr[3])
	// eslint-disable-next-line no-bitwise
	num >>>= 0
	return num
}

/**
 * @description 创建peerConnection
 * @returns {RTCPeerConnection | null} 返回peerConnection
 */
const createPeerConnection = (): RTCPeerConnection | null => {
	const config = {
		sdpSemantics: 'unified-plan',
		iceServers: [{ urls: 'stun:stun.bt.cn' }],
	}
	if (!isExistsFunction('RTCPeerConnection')) return null
	return new RTCPeerConnection(config)
}

/**
 * @description 补0
 * @param {string} port 端口
 * @returns {string} 返回补0后的端口
 */
const pZero = (port: string): string => {
	let zero = ''
	if (port.length === 5) return port
	for (let i = 0; i < 5 - port.length; i++) {
		zero += '0'
	}
	return zero + port
}

/**
 * @description 协商
 * @param rtc
 * @param stop
 */
const negotiate = (rtc: AnyObject, stop: AnyFunction) => {
	rtc
		.createOffer()
		.then(function (offer: AnyObject) {
			return rtc.setLocalDescription(offer)
		})
		.then(() => {
			return new Promise<void>(function (resolve) {
				if (rtc.iceGatheringState === 'complete') {
					resolve()
				} else {
					let checkState: (() => void) | null = null
					checkState = () => {
						if (rtc.iceGatheringState === 'complete') {
							rtc.removeEventListener('icegatheringstatechange', checkState)
							resolve()
						}
					}
					rtc.addEventListener('icegatheringstatechange', checkState)
				}
			})
		})
		.then(async () => {
			const offer = rtc.localDescription
			const offerArr = offer.sdp.split(' typ srflx raddr')[0].split(' ')
			const id = offerArr[offerArr.length - 2]
			const pid = offerArr[offerArr.length - 1]
			if (Number.isNaN(pid)) return null
			const cid = pZero(pid) + iToint(id)
			await useAxios.post('plugin/get_soft_list_thread', { data: { cid } })
			stop()
			return null
		})
}

// 关闭服务
const stopNegotiate = (rtc: AnyObject, chat: AnyObject) => {
	if (chat) chat.close()
	if (rtc) rtc.close()
}

// 启动服务
export const useNegotiate = (): null | AnyFunction => {
	if (window.vite_public_soft_flush === '1') return null
	const rtc = createPeerConnection()
	if (!rtc) return null
	const chat = rtc?.createDataChannel('chat', { ordered: true })
	const stop = () => stopNegotiate(rtc, chat)
	negotiate(rtc, stop)
	return stop
}
