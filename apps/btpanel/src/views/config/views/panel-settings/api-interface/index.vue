<template>
	<config-rows :label="'API接口'">
		<template #value>
			<el-switch v-model="panelConfig.apiInterface" @change="onChange"></el-switch>
			<el-button size="small" class="!ml-12px" @click="openApiConfig"> API接口配置 </el-button>
		</template>
		<template #desc>
			<span>
				提供面板API接口访问的支持（
				<bt-link class="!inline-block" href="https://www.bt.cn/new/product_app.html">堡塔APP</bt-link>/
				<bt-link class="!inline-block" href="https://www.bt.cn/new/product_pc.html">堡塔多机管理</bt-link>
				需要开启该功能），
			</span>
			<bt-link class="!inline-block" href="https://www.bt.cn/bbs/thread-20376-1-1.html"> 了解详情 </bt-link>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { getConfigStore } from '@config/useStore'
import { useDialog } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools'

import ConfigRows from '@config/public/config-rows-new'
import { setToken } from '@/api/config'

const {
	refs: { panelConfig },
} = getConfigStore()

/**
 * @description API接口
 * @param val
 */
const onChange = (val: boolean) => {
	if (val) {
		open()
	} else {
		setStatus()
	}
}

/**
 * @description 开启API接口
 */
const open = async () => {
	const data = await setStatus()
	if (data.status) openApiConfig()
}

/**
 * @description 显示配置
 */
const openApiConfig = () => {
	useDialog({
		area: 50,
		title: '配置面板API',
		component: () => import('./api-config.vue'),
	})
}

/**
 * @description 设置状态
 */
const setStatus = async () => {
	const res = await useDataHandle({
		loading: '正在设置API配置，请稍候...',
		request: setToken({ t_type: 2 }),
		message: true,
		success: (res: any) => {
			if (!res.status) panelConfig.apiInterface = !panelConfig.apiInterface
		},
	})
	return res
}
</script>
