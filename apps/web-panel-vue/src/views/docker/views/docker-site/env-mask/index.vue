<template>
	<bt-install-mask v-if="maskLayer" width="38rem">
		<template #content>
			<div v-if="!isInstall" class="flex items-center"><span>未安装运行环境，</span><bt-link @click="openInstall({ name: 'nginx' })" class="!font-bold !text-base">安装Nginx</bt-link></div>
			<div v-else class="flex items-center">
				<span>Docker项目只支持nginx环境</span>
			</div>
		</template>
	</bt-install-mask>
</template>

<script setup lang="ts">
import { getSoftStatus } from '@/api/global'
import { useGlobalStore } from '@store/global'
import { getPluginInfo } from '@/api/global'
import { useMessage } from '@/hooks/tools'
import { pluginInstallDialog } from '@/public'

const Message = useMessage() // 消息提示
const emit = defineEmits(['init'])

const { plugin } = useGlobalStore()

const webServerType = ref<string>(plugin.value.webserver) // web服务器类型

const maskLayer = ref<boolean>(false) // 遮罩层
const isInstall = ref<boolean>(false) // 是否安装
const pluginInfo = reactive({
	title: '',
	name: '',
	status: true,
	version: '',
	admin: false,
	s_version: '',
	setup: false,
})

/**
 * @description 打开插件安装界面
 * @param {any} item 插件信息
 */
const openInstall = async (item: any) => {
	const { data } = await getPluginInfo({ sName: item.name })
	if (data.task === '-1') return Message.error('当前插件正在安装，不可重复安装')
	pluginInstallDialog({
		name: data?.name,
		type: 'i',
		pluginInfo: data,
	})
	checkInstallStatus()
}

let beforeUnM = false // 组件销毁标识
/**
 * @description 检测安装情况
 */
const checkInstallStatus = async (isInit: boolean = false) => {
	try {
		// 组件销毁时停止递归
		if (beforeUnM) return
		const { data: res } = await getSoftStatus({ name: 'web' })
		if (!res.status && !isInit) {
			setTimeout(() => {
				checkInstallStatus()
			}, 3000)
		}
		if (res.status && !isInit) {
			emit('init')
		}
		maskLayer.value = !res.status
		Object.assign(pluginInfo, res)
		if (res.name !== 'nginx') {
			maskLayer.value = true
			isInstall.value = res.status
		}
	} catch (error) {
		if (!isInit) {
			setTimeout(() => {
				checkInstallStatus()
			}, 3000)
		}
	}
}

onMounted(() => {
	checkInstallStatus(true)
})

onBeforeUnmount(() => {
	beforeUnM = true
})

defineExpose({
	checkInstallStatus,
	pluginInfo,
	maskLayer,
	webServerType,
})
</script>
