export function useLoop(func: () => Promise<unknown>, second = 3) {
	let timer: number | null = null

	let isLeave = false

	let errorCount = 0

	const loop = () => {
		// 离开页面时停止
		if (isLeave) {
			clearTimer()
			return
		}

		// 3次错误后停止
		if (errorCount >= 3) {
			clearTimer()
			return
		}

		timer = window.setTimeout(async () => {
			try {
				await func()
				errorCount = 0
			} catch {
				errorCount++
			} finally {
				loop()
			}
		}, second * 1000)
	}

	const clearTimer = () => {
		if (timer) {
			clearTimeout(timer)
			timer = null
		}
	}

	onBeforeUnmount(() => {
		isLeave = true
		clearTimer()
	})

	return {
		loop,
		clearTimer,
	}
}
