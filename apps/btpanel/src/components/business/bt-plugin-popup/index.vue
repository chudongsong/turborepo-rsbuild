<template>
	<iframe v-show="pluginInfo.visible" ref="iframeRef" :src="isDev ? '/software.html' : '/software'" class="w-full h-full !fixed z-999999 min-h-[45rem] top-0 bg-transparent" />
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/store/global'
import { isDev } from '@/utils'
import { useMessage } from '@hooks/tools'

const { pluginInfo } = useGlobalStore() // 持久化状态

const Message = useMessage() // 消息提示
const iframeRef = ref() // iframe实例
const intervalId = ref(0) // 定时器id
const loading = ref() // 加载状态

/**
 * @description 添加监听事件
 */
const addEvent = () => {
	window.addEventListener('message', async event => {
		let name = event.data
		if (typeof event.data === 'string' && event.data?.indexOf('&') !== -1) {
			const data = event.data.split('&')
			// eslint-disable-next-line prefer-destructuring
			name = data[0]
		}
		switch (name) {
			case 'closePlugin':
				pluginInfo.value.visible = false
				// eslint-disable-next-line no-case-declarations
				const containBox = document.getElementById('app-container') as HTMLIFrameElement
				containBox.style.position = 'relative'
				pluginInfo.value.visible = false
				// 存在携带参数的情况
				if (event.data?.indexOf('&') !== -1) {
					// 截取 以&分割  携带案例:closePlugin&php守护已启动,无需设置!&success
					const data = event.data.split('&')
					let status = false
					if (String(data[2]) === 'success') status = true
					// 打印输出内容
					Message.request({ status, msg: String(data[1]) })
					pluginInfo.value.visible = false
				}
				break
			case 'refreshMain': // 刷新主页面
				window.location.reload()
				break
			// case 'openAlarmSetDialog': // 打开告警配置弹窗
			// 	// eslint-disable-next-line no-case-declarations
			// 	// const { openAlarmSetDialog } = await import('@config/setting/config.popup')
			// 	// 存在携带参数的情况
			// 	if (event.data?.indexOf('&') !== -1) {
			// 		// 截取 以&分割
			// 		let data = event.data.split('&')
			// 		const config = JSON.parse(data[1])
			// 		if (config) openAlarmSetDialog(config)
			// 	}
			// 	break
			// case 'fileTaskDialog': // 打开实时任务队列弹窗
			// 	// eslint-disable-next-line no-case-declarations
			// 	// const { fileTaskDialog } = await import('@files/hook/files.popup')
			// 	// eslint-disable-next-line no-case-declarations
			// 	const popup: any = window.document.querySelectorAll('.realTaskDialog')
			// 	if (popup?.length === 0) {
			// 		fileTaskDialog()
			// 	}
			// 	break
			case 'pluginLoad': // 打开插件
				loading.value.close()
				break
		}
	})
	// 监听插件加载完成
	iframeRef.value.onload = () => {
		pluginInfo.value.init = true // 插件初始化完成，不再重复初始化
	}
}

/**
 * @description 打开插件
 */
const openPlugin = () => {
	const { id, name, built } = pluginInfo.value
	if (built) {
		pluginInfo.value.visible = false // 关闭插件遮罩
	} else {
		const data = { pluginName: id, pluginTitle: name, pluginBuilt: built }
		console.log('打开插件', data)
		iframeRef.value.contentWindow.postMessage(`${JSON.stringify(data)}`, '*')
		console.log('发送消息', iframeRef.value.contentWindow)
		if (typeof pluginInfo.value.callback === 'function') pluginInfo.value.callback(iframeRef.value.contentWindow)
	}
}

// 监听插件显示状态
watch(
	() => pluginInfo.value.visible,
	(value: boolean) => {
		if (value) {
			loading.value = Message.load('正在加载插件数据，请稍候...')
		} else {
			loading.value.close()
		}
	}
)

// 监听插件显示状态，如果初始化完成则打开插件
watchEffect(() => {
	if (pluginInfo.value.visible && pluginInfo.value.init) openPlugin()
})

onBeforeUnmount(() => {
	if (intervalId.value) {
		clearInterval(intervalId.value)
	}
})

onMounted(() => {
	addEvent()
})
</script>

<style scoped>
iframe {
	color-scheme: light;
}
</style>
