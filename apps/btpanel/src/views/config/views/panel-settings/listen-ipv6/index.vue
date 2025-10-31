<template>
	<config-rows :label="'监听IPv6'">
		<template #value>
			<el-switch v-model="panelConfig.listenIpv6" @change="onChangeEvent"></el-switch>
		</template>
		<template #desc>
			<span>监听IPv6地址的访问</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { getConfigStore } from '@config/useStore'
import { useDataHandle } from '@hooks/tools'
import { setIpv6Status } from '@/api/config'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { panelConfig },
} = getConfigStore()

/**
 * @description: 切换IPv6状态
 */
const onChangeEvent = async () => {
	await useDataHandle({
		loading: '正在设置IPv6状态，请稍候...',
		request: setIpv6Status(),
		message: true,
	})
}
</script>
