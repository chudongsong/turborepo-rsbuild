<template>
	<config-rows :label="'服务器IP'">
		<template #value>
			<bt-input v-model="panelConfig.serverIp" class="!w-[26rem]"></bt-input>
			<el-button type="primary" class="!ml-12px" @click="onSave">保存</el-button>
		</template>
		<template #desc>
			<span>默认为外网IP,若您在本地虚拟机测试，请填写虚拟机内网IP</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { getConfigStore } from '@/views/config/useStore'
import { refreshBrowser } from '@utils/index'
import { useConfirm } from '@hooks/tools'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { panelConfig },
	saveConfig,
} = getConfigStore()

const onSave = async () => {
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: '修改服务器IP',
			content: '当前服务器IP，非必要请勿修改，错误的IP地址可能会导致当前面板部分获取服务异常，是否继续？',
		})
		await saveConfig('正在修改服务器IP，请稍候...')
		refreshBrowser(`${location.protocol}//${panelConfig.value.serverIp}:${location.port}${location.pathname}`, 2000)
	} catch (err) {}
}
</script>
