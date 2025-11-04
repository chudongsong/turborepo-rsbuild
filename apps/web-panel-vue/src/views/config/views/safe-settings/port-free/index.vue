<template>
	<!-- 免端口访问 -->
	<config-rows :label="'免端口访问'">
		<template #value>
			<el-switch v-model="noPortConfig.proxy_stats" @change="onChangeEvent(noPortConfig.proxy_stats)"></el-switch>
			<el-button size="small" class="!ml-12px" @click="openConfigView()"> 免端口访问配置 </el-button>
		</template>
		<template #desc>
			<span>{{ desc }}</span>
		</template>
	</config-rows>
</template>
<script lang="ts" setup>
import { getConfigStore } from '@config/useStore'
import { useDataHandle } from '@hooks/tools'
import { delPanelGeneration, getPanelGeneration } from '@/api/config'
import { useDialog } from '@hooks/tools'

import ConfigRows from '@config/public/config-rows-new'

const { getCertListData } = getConfigStore()

const noPortConfig = ref<any>({})
const desc = ref('配置一个域名来访问面板')
let oldValue = false // 旧值
/**
 * @description: 改变开关
 */
const onChangeEvent = async (val: boolean) => {
	if (val) {
		openConfigView()
	} else {
		await useDataHandle({
			loading: '正在删除面板生成的域名，请稍候...',
			request: delPanelGeneration(),
			message: true,
			success: getCertListData,
		})
	}
}

/**
 * @description: 免端口访问配置
 */
const openConfigView = () => {
	useDialog({
		title: '免端口访问配置',
		component: () => import('./no-port-config.vue'),
		compData: { ...noPortConfig.value, refresh: getConfig },
		area: 80,
		onCancel: () => {
			noPortConfig.value.proxy_stats = oldValue
		},
	})
}

/**
 * @description: 免端口访问配置
 */
const getConfig = async () => {
	await useDataHandle({
		request: getPanelGeneration(),
		success: ({ data: rdata }: any) => {
			noPortConfig.value = {
				addr: rdata?.addr || '',
				cert: rdata?.cert || '',
				key: rdata?.key || '',
				proxy_stats: rdata?.proxy_stats || false,
				domain: rdata?.domain || '',
				use_ssl: rdata?.use_ssl || false,
				// certInfo: rdata?.info || {},
			}
			oldValue = rdata?.proxy_stats || false
		},
	})
}

onMounted(() => getConfig())
</script>
