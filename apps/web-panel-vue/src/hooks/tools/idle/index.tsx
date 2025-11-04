interface IdleOptions {
	timeout: number | AnyFunction
	request: AnyFunction
	idle?: number
	retries?: number
}

/**
 * @description 监听活跃空闲
 * @param { number | Function } options.timeout 触发时间
 * @param { Function } options.request 请求
 * @param { number } options.idle 空闲时间
 * @param { number } options.retries 重试次数
 * @returns
 */
export const useIdle = (options: IdleOptions) => {
	const { idle, request, timeout, retries } = options
	let timerId: any = null
	let count: number = 0

	const isIdle = ref(false)
	let idleTimeout: any

	const poll = async () => {
		// 判断是否是空闲状态 或者 路径不匹配
		if (isIdle.value) {
			// 处于空闲状态
			if (timerId) clearTimeout(timerId)
			return
		}
		try {
			const rqTime = new Date().getTime() / 1000
			const res = await request()
			if (res) {
				clearTimeout(timerId)
				return
			}
			count = 0
			const nowTime = new Date().getTime() / 1000
			timerId = setTimeout(poll, typeof timeout === 'number' ? timeout : timeout(rqTime, nowTime))
		} catch (error) {
			count++
			// 重试次数
			if (retries && count > retries && timerId) clearTimeout(timerId)
		}
	}

	const resetIdleTimer = () => {
		clearTimeout(idleTimeout)
		if (isIdle.value) {
			isIdle.value = false
			console.log('resetIdleTimer')
			poll()
		}
		idleTimeout = setTimeout(() => {
			console.log('idleTimeout')
			isIdle.value = true
		}, idle)
	}

	/**
	 * @description 开始追踪
	 */
	const start = () => {
		poll()
		if (idle) {
			// 监听用户交互事件
			window.addEventListener('mouseleave', resetIdleTimer, true)
		}
	}

	/**
	 * @description 停止追踪
	 */
	const stop = () => {
		clearTimeout(idleTimeout)
		isIdle.value = true
		if (idle) {
			window.removeEventListener('mouseleave', resetIdleTimer, true)
		}
	}

	start()

	return {
		isIdle,
		start,
		stop,
	}
}
